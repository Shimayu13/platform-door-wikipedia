"use server"

import { createClient } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import type { StationInput, StationLineInput } from "@/lib/supabase"

// Service Role Key用のクライアント（RLSをバイパス）
function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY not found, falling back to regular client")
    return null
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export interface PlatformDoorInput {
  station_id: string
  line_id: string // 必須フィールドに変更
  platform_number: string
  platform_name?: string
  status: "未設置" | "仮覆工" | "復元" | "設置" | "稼働"
  direction?: string
  installation_date?: string
  planned_date?: string
  installation_datetime?: string
  operation_datetime?: string
  door_type?: string
  manufacturer?: string
  notes?: string
}

// 駅情報更新の型定義
export interface StationUpdateInput {
  name?: string
  latitude?: number
  longitude?: number
  prefecture?: string
  city?: string
  address?: string
}

export interface LineInput {
  name: string
  company_id: string
  color?: string
  description?: string
}

export interface LineUpdateInput {
  name?: string
  company_id?: string
  color?: string
  description?: string
}

export async function createStation(data: StationInput, userId: string) {
  try {
    // デバッグ用ログ
    console.log("Creating station with data:", { ...data, userId })

    // Admin client を作成（Service Role Key使用）
    const adminClient = createAdminClient()
    if (!adminClient) {
      return { success: false, error: "管理者権限が必要です。Service Role Keyを設定してください。" }
    }

    // ユーザープロフィールの確認
    const { data: profile, error: profileError } = await adminClient
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single()

    console.log("User profile check:", { profile, profileError })

    if (profileError && profileError.code === "PGRST116") {
      // プロフィールが存在しない場合は作成
      console.log("Creating user profile for:", userId)
      const { error: createProfileError } = await adminClient
        .from("user_profiles")
        .insert({
          id: userId,
          display_name: "ユーザー",
          role: "提供者"
        })

      if (createProfileError) {
        console.error("Error creating user profile:", createProfileError)
        return { success: false, error: "ユーザープロフィールの作成に失敗しました" }
      }
    } else if (profileError) {
      console.error("Error checking user profile:", profileError)
      return { success: false, error: "ユーザープロフィールの確認に失敗しました" }
    }

    // 駅を作成
    console.log("Inserting station with data:", {
      name: data.name,
      latitude: data.latitude,
      longitude: data.longitude,
      prefecture: data.prefecture,
      city: data.city,
      address: data.address,
    })

    const { data: station, error: stationError } = await adminClient
      .from("stations")
      .insert({
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        prefecture: data.prefecture,
        city: data.city,
        address: data.address,
      })
      .select()
      .single()

    if (stationError) {
      console.error("Error creating station:", stationError)
      return { success: false, error: `駅の作成に失敗しました: ${stationError.message}` }
    }

    console.log("Successfully created station:", station)

    // 駅と路線の関係を作成（駅ナンバリング含む）
    console.log("Creating station_lines for lines:", data.lines)

    const stationLineResults = []
    for (const lineData of data.lines) {
      console.log("Inserting station_line:", {
        station_id: station.id,
        line_id: lineData.line_id,
        station_code: lineData.station_code,
      })

      const { data: stationLineResult, error: stationLineError } = await adminClient
        .from("station_lines")
        .insert({
          station_id: station.id,
          line_id: lineData.line_id,
          station_code: lineData.station_code,
        })
        .select()

      if (stationLineError) {
        console.error("Error creating station_line:", stationLineError)
        // エラーがあっても他の路線は登録を続行
        stationLineResults.push({ error: stationLineError, lineData })
      } else {
        console.log("Successfully created station_line:", stationLineResult)
        stationLineResults.push({ data: stationLineResult, lineData })
      }
    }

    console.log("Station line results:", stationLineResults)

    // エラーがあった路線をチェック
    const failedLines = stationLineResults.filter(result => result.error)
    if (failedLines.length > 0) {
      console.warn("Some station lines failed to create:", failedLines)
      // 部分的成功として扱う
    }

    // 作成履歴を記録
    await adminClient.from("update_history").insert({
      table_name: "stations",
      record_id: station.id,
      action: "INSERT",
      new_data: { ...station, lines: data.lines },
      updated_by: userId,
    })

    // ページを再検証
    revalidatePath("/stations")
    revalidatePath("/contribute")

    return { success: true, data: station }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "予期しないエラーが発生しました" }
  }
}

export async function addStationLine(data: StationLineInput, userId: string) {
  try {
    const { data: stationLine, error } = await supabase
      .from("station_lines")
      .insert(data)
      .select(`
        *,
        lines (
          *,
          railway_companies (*)
        )
      `)
      .single()

    if (error) {
      console.error("Error adding station line:", error)
      return { success: false, error: "駅-路線関係の追加に失敗しました" }
    }

    // 作成履歴を記録
    await supabase.from("update_history").insert({
      table_name: "station_lines",
      record_id: stationLine.id,
      action: "INSERT",
      new_data: stationLine,
      updated_by: userId,
    })

    revalidatePath("/stations")
    revalidatePath(`/stations/${data.station_id}`)

    return { success: true, data: stationLine }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "予期しないエラーが発生しました" }
  }
}

export async function updateStationLine(stationLineId: string, data: Partial<StationLineInput>, userId: string) {
  try {
    // 既存のデータを取得
    const { data: existing, error: fetchError } = await supabase
      .from("station_lines")
      .select("*")
      .eq("id", stationLineId)
      .single()

    if (fetchError) {
      console.error("Error fetching station line:", fetchError)
      return { success: false, error: "データの取得に失敗しました" }
    }

    // データを更新
    const { data: updated, error: updateError } = await supabase
      .from("station_lines")
      .update({
        station_code: data.station_code,
        updated_at: new Date().toISOString(),
      })
      .eq("id", stationLineId)
      .select(`
        *,
        lines (
          *,
          railway_companies (*)
        )
      `)
      .single()

    if (updateError) {
      console.error("Error updating station line:", updateError)
      return { success: false, error: "データの更新に失敗しました" }
    }

    // 更新履歴を記録
    await supabase.from("update_history").insert({
      table_name: "station_lines",
      record_id: stationLineId,
      action: "UPDATE",
      old_data: existing,
      new_data: updated,
      updated_by: userId,
    })

    revalidatePath("/stations")
    revalidatePath(`/stations/${existing.station_id}`)

    return { success: true, data: updated }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "予期しないエラーが発生しました" }
  }
}

export async function removeStationLine(stationLineId: string, userId: string) {
  try {
    // 削除前のデータを取得
    const { data: existing, error: fetchError } = await supabase
      .from("station_lines")
      .select("*")
      .eq("id", stationLineId)
      .single()

    if (fetchError) {
      console.error("Error fetching station line:", fetchError)
      return { success: false, error: "データの取得に失敗しました" }
    }

    // 関連するホームドアがある場合は削除を拒否
    const { data: relatedPlatforms, error: platformError } = await supabase
      .from("platform_doors")
      .select("id")
      .eq("station_id", existing.station_id)
      .eq("line_id", existing.line_id)

    if (platformError) {
      console.error("Error checking related platforms:", platformError)
      return { success: false, error: "関連データの確認に失敗しました" }
    }

    if (relatedPlatforms && relatedPlatforms.length > 0) {
      return { success: false, error: "この路線にはホームドア情報が登録されているため削除できません" }
    }

    // データを削除
    const { error: deleteError } = await supabase.from("station_lines").delete().eq("id", stationLineId)

    if (deleteError) {
      console.error("Error deleting station line:", deleteError)
      return { success: false, error: "データの削除に失敗しました" }
    }

    // 削除履歴を記録
    await supabase.from("update_history").insert({
      table_name: "station_lines",
      record_id: stationLineId,
      action: "DELETE",
      old_data: existing,
      updated_by: userId,
    })

    revalidatePath("/stations")
    revalidatePath(`/stations/${existing.station_id}`)

    return { success: true }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "予期しないエラーが発生しました" }
  }
}

export async function updatePlatformDoor(data: PlatformDoorInput, userId: string) {
  try {
    // 既存のレコードをチェック
    const { data: existing, error: checkError } = await supabase
      .from("platform_doors")
      .select("*")
      .eq("station_id", data.station_id)
      .eq("line_id", data.line_id)
      .eq("platform_number", data.platform_number)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing record:", checkError)
      return { success: false, error: "データの確認に失敗しました" }
    }

    let result
    if (existing) {
      // 更新
      const { data: updated, error: updateError } = await supabase
        .from("platform_doors")
        .update({
          platform_name: data.platform_name,
          status: data.status,
          direction: data.direction,
          installation_date: data.installation_date || null,
          planned_date: data.planned_date || null,
          installation_datetime: data.installation_datetime || null,
          operation_datetime: data.operation_datetime || null,
          door_type: data.door_type,
          manufacturer: data.manufacturer,
          notes: data.notes,
          updated_by: userId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single()

      if (updateError) {
        console.error("Error updating platform door:", updateError)
        return { success: false, error: "データの更新に失敗しました" }
      }

      // 更新履歴を記録
      await supabase.from("update_history").insert({
        table_name: "platform_doors",
        record_id: existing.id,
        action: "UPDATE",
        old_data: existing,
        new_data: updated,
        updated_by: userId,
      })

      result = updated
    } else {
      // 新規作成
      const { data: created, error: createError } = await supabase
        .from("platform_doors")
        .insert({
          station_id: data.station_id,
          line_id: data.line_id,
          platform_number: data.platform_number,
          platform_name: data.platform_name,
          status: data.status,
          direction: data.direction,
          installation_date: data.installation_date || null,
          planned_date: data.planned_date || null,
          installation_datetime: data.installation_datetime || null,
          operation_datetime: data.operation_datetime || null,
          door_type: data.door_type,
          manufacturer: data.manufacturer,
          notes: data.notes,
          updated_by: userId,
        })
        .select()
        .single()

      if (createError) {
        console.error("Error creating platform door:", createError)
        return { success: false, error: "データの作成に失敗しました" }
      }

      // 作成履歴を記録
      await supabase.from("update_history").insert({
        table_name: "platform_doors",
        record_id: created.id,
        action: "INSERT",
        new_data: created,
        updated_by: userId,
      })

      result = created
    }

    // ページを再検証
    revalidatePath("/stations")
    revalidatePath(`/stations/${data.station_id}`)
    revalidatePath("/contribute")

    return { success: true, data: result }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "予期しないエラーが発生しました" }
  }
}

export async function deletePlatformDoor(id: string, userId: string) {
  try {
    // 削除前のデータを取得
    const { data: existing, error: fetchError } = await supabase
      .from("platform_doors")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("Error fetching platform door:", fetchError)
      return { success: false, error: "データの取得に失敗しました" }
    }

    // データを削除
    const { error: deleteError } = await supabase.from("platform_doors").delete().eq("id", id)

    if (deleteError) {
      console.error("Error deleting platform door:", deleteError)
      return { success: false, error: "データの削除に失敗しました" }
    }

    // 削除履歴を記録
    await supabase.from("update_history").insert({
      table_name: "platform_doors",
      record_id: id,
      action: "DELETE",
      old_data: existing,
      updated_by: userId,
    })

    // ページを再検証
    revalidatePath("/stations")
    revalidatePath(`/stations/${existing.station_id}`)
    revalidatePath("/contribute")

    return { success: true }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "予期しないエラーが発生しました" }
  }
}

// ニュース関連の型定義
export interface NewsInput {
  title: string
  content: string
  summary?: string
  status: "下書き" | "公開" | "非公開"
}

// ホームドアタイプ関連の型定義
export interface DoorTypeInput {
  name: string
  description?: string
}

// メーカー関連の型定義
export interface ManufacturerInput {
  name: string
  website_url?: string
  description?: string
}

// ニュース記事の作成
export async function createNews(data: NewsInput, userId: string) {
  try {
    const { data: news, error } = await supabase
      .from("news")
      .insert({
        title: data.title,
        content: data.content,
        summary: data.summary,
        status: data.status,
        author_id: userId,
        published_at: data.status === "公開" ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating news:", error)
      return { success: false, error: "ニュースの作成に失敗しました" }
    }

    // 作成履歴を記録
    await supabase.from("update_history").insert({
      table_name: "news",
      record_id: news.id,
      action: "INSERT",
      new_data: news,
      updated_by: userId,
    })

    revalidatePath("/")
    revalidatePath("/news")
    revalidatePath("/admin/news")

    return { success: true, data: news }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "予期しないエラーが発生しました" }
  }
}

export async function updateNews(newsId: string, data: NewsInput, userId: string) {
  try {
    // 既存のデータを取得
    const { data: existing, error: fetchError } = await supabase.from("news").select("*").eq("id", newsId).single()

    if (fetchError) {
      console.error("Error fetching news:", fetchError)
      return { success: false, error: "データの取得に失敗しました" }
    }

    const { data: updated, error } = await supabase
      .from("news")
      .update({
        title: data.title,
        content: data.content,
        summary: data.summary,
        status: data.status,
        published_at:
          data.status === "公開" && !existing.published_at 
            ? new Date().toISOString() 
            : existing.published_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", newsId)
      .select()
      .single()

    if (error) {
      console.error("Error updating news:", error)
      return { success: false, error: "ニュースの更新に失敗しました" }
    }

    // 更新履歴を記録
    await supabase.from("update_history").insert({
      table_name: "news",
      record_id: newsId,
      action: "UPDATE",
      old_data: existing,
      new_data: updated,
      updated_by: userId,
    })

    revalidatePath("/")
    revalidatePath("/news")
    revalidatePath("/admin/news")

    return { success: true, data: updated }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "予期しないエラーが発生しました" }
  }
}

export async function deleteNews(newsId: string, userId: string) {
  try {
    // 削除前のデータを取得
    const { data: existing, error: fetchError } = await supabase.from("news").select("*").eq("id", newsId).single()

    if (fetchError) {
      console.error("Error fetching news:", fetchError)
      return { success: false, error: "データの取得に失敗しました" }
    }

    const { error } = await supabase.from("news").delete().eq("id", newsId)

    if (error) {
      console.error("Error deleting news:", error)
      return { success: false, error: "ニュースの削除に失敗しました" }
    }

    // 削除履歴を記録
    await supabase.from("update_history").insert({
      table_name: "news",
      record_id: newsId,
      action: "DELETE",
      old_data: existing,
      updated_by: userId,
    })

    revalidatePath("/")
    revalidatePath("/news")
    revalidatePath("/admin/news")

    return { success: true }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "予期しないエラーが発生しました" }
  }
}

export async function getAllNews(userRole: string) {
  try {
    let query = supabase.from("news").select("*").order("created_at", { ascending: false })

    // 編集者以上は全てのニュースを見ることができる
    if (userRole !== "編集者" && userRole !== "開発者") {
      query = query.eq("status", "公開")
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching all news:", error)
      return { success: false, error: "ニュース一覧の取得に失敗しました" }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "予期しないエラーが発生しました" }
  }
}

export async function getNewsById(id: string) {
  try {
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching news by id:", error)
      return { success: false, error: "ニュース記事の取得に失敗しました" }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "予期しないエラーが発生しました" }
  }
}

// ホームドアタイプ管理関数
export async function createDoorType(data: DoorTypeInput, userId: string) {
  try {
    const { data: doorType, error } = await supabase
      .from("door_types")
      .insert({
        name: data.name,
        description: data.description,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating door type:", error)
      return { success: false, error: "ホームドアタイプの作成に失敗しました" }
    }

    revalidatePath("/admin/door-types")

    return { success: true, data: doorType }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "予期しないエラーが発生しました" }
  }
}

export async function updateDoorType(doorTypeId: string, data: DoorTypeInput, userId: string) {
  try {
    const { data: updated, error } = await supabase
      .from("door_types")
      .update({
        name: data.name,
        description: data.description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", doorTypeId)
      .select()
      .single()

    if (error) {
      console.error("Error updating door type:", error)
      return { success: false, error: "ホームドアタイプの更新に失敗しました" }
    }

    revalidatePath("/admin/door-types")

    return { success: true, data: updated }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "予期しないエラーが発生しました" }
  }
}

export async function deleteDoorType(doorTypeId: string, userId: string) {
  try {
    const { error } = await supabase.from("door_types").delete().eq("id", doorTypeId)

    if (error) {
      console.error("Error deleting door type:", error)
      return { success: false, error: "ホームドアタイプの削除に失敗しました" }
    }

    revalidatePath("/admin/door-types")

    return { success: true }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "予期しないエラーが発生しました" }
  }
}

export async function getAllDoorTypes(userRole: string) {
  try {
    const { data, error } = await supabase.from("door_types").select("*").order("name")

    if (error) {
      console.error("Error fetching door types:", error)
      return { success: false, error: "ホームドアタイプ一覧の取得に失敗しました", data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "予期しないエラーが発生しました", data: [] }
  }
}

// メーカー管理関数
export async function createManufacturer(data: ManufacturerInput, userId: string) {
  try {
    const { data: manufacturer, error } = await supabase
      .from("manufacturers")
      .insert({
        name: data.name,
        website_url: data.website_url,
        description: data.description,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating manufacturer:", error)
      return { success: false, error: "メーカーの作成に失敗しました" }
    }

    revalidatePath("/admin/door-types")

    return { success: true, data: manufacturer }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "予期しないエラーが発生しました" }
  }
}

export async function updateManufacturer(manufacturerId: string, data: ManufacturerInput, userId: string) {
  try {
    const { data: updated, error } = await supabase
      .from("manufacturers")
      .update({
        name: data.name,
        website_url: data.website_url,
        description: data.description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", manufacturerId)
      .select()
      .single()

    if (error) {
      console.error("Error updating manufacturer:", error)
      return { success: false, error: "メーカーの更新に失敗しました" }
    }

    revalidatePath("/admin/door-types")

    return { success: true, data: updated }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "予期しないエラーが発生しました" }
  }
}

export async function deleteManufacturer(manufacturerId: string, userId: string) {
  try {
    const { error } = await supabase.from("manufacturers").delete().eq("id", manufacturerId)

    if (error) {
      console.error("Error deleting manufacturer:", error)
      return { success: false, error: "メーカーの削除に失敗しました" }
    }

    revalidatePath("/admin/door-types")

    return { success: true }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "予期しないエラーが発生しました" }
  }
}

export async function getAllManufacturers(userRole: string) {
  try {
    const { data, error } = await supabase.from("manufacturers").select("*").order("name")

    if (error) {
      console.error("Error fetching manufacturers:", error)
      return { success: false, error: "メーカー一覧の取得に失敗しました", data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "予期しないエラーが発生しました", data: [] }
  }
}

// 駅情報の更新
export async function updateStation(
  stationId: string,
  data: StationUpdateInput,
  userId: string
) {
  try {
    // Admin client を作成
    const adminClient = createAdminClient()
    if (!adminClient) {
      return { success: false, error: "管理者権限が必要です" }
    }

    // ユーザー権限チェック
    const { data: profile, error: profileError } = await adminClient
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return { success: false, error: "ユーザー情報の取得に失敗しました" }
    }

    if (!['編集者', '開発者'].includes(profile.role)) {
      return { success: false, error: "駅情報の編集権限がありません" }
    }

    // 既存データを取得
    const { data: existing, error: fetchError } = await adminClient
      .from("stations")
      .select("*")
      .eq("id", stationId)
      .single()

    if (fetchError || !existing) {
      return { success: false, error: "更新対象の駅が見つかりません" }
    }

    // 更新処理
    const { data: updated, error: updateError } = await adminClient
      .from("stations")
      .update({
        name: data.name ?? existing.name,
        latitude: data.latitude ?? existing.latitude,
        longitude: data.longitude ?? existing.longitude,
        prefecture: data.prefecture ?? existing.prefecture,
        city: data.city ?? existing.city,
        address: data.address ?? existing.address,
        updated_at: new Date().toISOString(),
      })
      .eq("id", stationId)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating station:", updateError)
      return { success: false, error: `更新に失敗しました: ${updateError.message}` }
    }

    // 更新履歴を記録
    await adminClient.from("update_history").insert({
      table_name: "stations",
      record_id: stationId,
      action: "UPDATE",
      old_data: existing,
      new_data: updated,
      updated_by: userId,
    })

    // ページを再検証
    revalidatePath("/stations")
    revalidatePath(`/stations/${stationId}`)
    revalidatePath("/contribute")

    return {
      success: true,
      data: updated,
      message: "駅情報を更新しました"
    }
  } catch (error) {
    console.error("Error in updateStation:", error)
    return { success: false, error: "予期しないエラーが発生しました" }
  }
}

// 駅情報の削除
export async function deleteStation(stationId: string, userId: string) {
  try {
    // Admin client を作成
    const adminClient = createAdminClient()
    if (!adminClient) {
      return { success: false, error: "管理者権限が必要です" }
    }

    // ユーザー権限チェック（削除は編集者以上のみ）
    const { data: profile, error: profileError } = await adminClient
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return { success: false, error: "ユーザー情報の取得に失敗しました" }
    }

    if (!['編集者', '開発者'].includes(profile.role)) {
      return { success: false, error: "駅情報の削除権限がありません" }
    }

    // 削除前にデータを取得（履歴用）
    const { data: existing, error: fetchError } = await adminClient
      .from("stations")
      .select(`
        *,
        station_lines (
          id,
          line_id,
          station_code
        ),
        platform_doors (
          id
        )
      `)
      .eq("id", stationId)
      .single()

    if (fetchError || !existing) {
      return { success: false, error: "削除対象の駅が見つかりません" }
    }

    // 関連するホームドア情報がある場合は削除を拒否
    if (existing.platform_doors && existing.platform_doors.length > 0) {
      return {
        success: false,
        error: "この駅にはホームドア情報が登録されているため削除できません。先にホームドア情報を削除してください。"
      }
    }

    // 関連する station_lines を先に削除
    if (existing.station_lines && existing.station_lines.length > 0) {
      const { error: stationLinesDeleteError } = await adminClient
        .from("station_lines")
        .delete()
        .eq("station_id", stationId)

      if (stationLinesDeleteError) {
        console.error("Error deleting station lines:", stationLinesDeleteError)
        return { success: false, error: "関連する路線情報の削除に失敗しました" }
      }
    }

    // 駅を削除
    const { error: deleteError } = await adminClient
      .from("stations")
      .delete()
      .eq("id", stationId)

    if (deleteError) {
      console.error("Error deleting station:", deleteError)
      return { success: false, error: `削除に失敗しました: ${deleteError.message}` }
    }

    // 削除履歴を記録
    await adminClient.from("update_history").insert({
      table_name: "stations",
      record_id: stationId,
      action: "DELETE",
      old_data: existing,
      updated_by: userId,
    })

    // ページを再検証
    revalidatePath("/stations")
    revalidatePath("/contribute")

    return {
      success: true,
      message: "駅情報を削除しました"
    }
  } catch (error) {
    console.error("Error in deleteStation:", error)
    return { success: false, error: "予期しないエラーが発生しました" }
  }
}

// 駅情報の詳細取得
export async function getStationDetails(stationId: string) {
  try {
    if (process.env.NODE_ENV === "development") {
      console.log("Fetching station details for ID:", stationId)
    }

    const { data, error } = await supabase
      .from("stations")
      .select(`
        *,
        station_lines (
          id,
          line_id,
          station_code,
          lines (
            id,
            name,
            company_id,
            railway_companies (
              id,
              name
            )
          )
        ),
        platform_doors (
          id,
          line_id,
          platform_number,
          platform_name,
          status,
          direction,
          installation_date,
          operation_datetime,
          door_type,
          manufacturer
        )
      `)
      .eq("id", stationId)
      .single()

    if (process.env.NODE_ENV === "development") {
      console.log("Raw station data from database:", data)
      console.log("Database error:", error)
    }

    if (error) {
      console.error("Error fetching station details:", error)
      return { success: false, error: `駅情報の取得に失敗しました: ${error.message}` }
    }

    if (!data) {
      console.error("No station data returned")
      return { success: false, error: "駅データが見つかりません" }
    }

    // データの構造を確認（開発時のみ）
    if (process.env.NODE_ENV === "development") {
      console.log("Station lines data:", data.station_lines)
      if (data.station_lines) {
        data.station_lines.forEach((sl: any, index: number) => {
          console.log(`Station line ${index}:`, sl)
          console.log(`Line data:`, sl.lines)
          console.log(`Railway company:`, sl.lines?.railway_companies)
        })
      }
    }

    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error("Error in getStationDetails:", error)
    return { success: false, error: "予期しないエラーが発生しました" }
  }
}

// 駅の路線追加（修正版）
export async function addLineToStation(
  data: { station_id: string; line_id: string; station_code?: string },
  userId: string
) {
  try {
    const { station_id: stationId, line_id: lineId, station_code: stationCode } = data
    
    const adminClient = createAdminClient()
    if (!adminClient) {
      return { success: false, error: "管理者権限が必要です" }
    }

    // 権限チェック
    const { data: profile, error: profileError } = await adminClient
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (!profile || !['提供者', '編集者', '開発者'].includes(profile.role)) {
      return { success: false, error: "この操作を行う権限がありません" }
    }

    // 重複チェック
    const { data: existing, error: checkError } = await adminClient
      .from("station_lines")
      .select("id")
      .eq("station_id", stationId)
      .eq("line_id", lineId)
      .single()

    if (existing) {
      return { success: false, error: "この路線は既に登録されています" }
    }

    // 路線を追加
    const { data: created, error: createError } = await adminClient
      .from("station_lines")
      .insert({
        station_id: stationId,
        line_id: lineId,
        station_code: stationCode,
      })
      .select(`
        *,
        lines (
          id,
          name,
          railway_companies (
            name
          )
        )
      `)
      .single()

    if (createError) {
      console.error("Error adding line to station:", createError)
      return { success: false, error: "路線の追加に失敗しました" }
    }

    // 履歴を記録
    await adminClient.from("update_history").insert({
      table_name: "station_lines",
      record_id: created.id,
      action: "CREATE",
      new_data: created,
      updated_by: userId,
    })

    revalidatePath("/stations")
    revalidatePath(`/stations/${stationId}`)

    return {
      success: true,
      data: created,
      message: "路線を追加しました"
    }
  } catch (error) {
    console.error("Error in addLineToStation:", error)
    return { success: false, error: "予期しないエラーが発生しました" }
  }
}

// 駅の路線削除
export async function removeLineFromStation(
  stationLineId: string,
  userId: string
) {
  try {
    const adminClient = createAdminClient()
    if (!adminClient) {
      return { success: false, error: "管理者権限が必要です" }
    }

    // 権限チェック
    const { data: profile, error: profileError } = await adminClient
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (!profile || !['編集者', '開発者'].includes(profile.role)) {
      return { success: false, error: "路線削除権限がありません" }
    }

    // 削除前のデータを取得
    const { data: existing, error: fetchError } = await adminClient
      .from("station_lines")
      .select("*")
      .eq("id", stationLineId)
      .single()

    if (fetchError || !existing) {
      return { success: false, error: "削除対象の路線が見つかりません" }
    }

    // 関連するホームドアがある場合は削除を拒否
    const { data: relatedPlatforms, error: platformError } = await adminClient
      .from("platform_doors")
      .select("id")
      .eq("station_id", existing.station_id)
      .eq("line_id", existing.line_id)

    if (relatedPlatforms && relatedPlatforms.length > 0) {
      return {
        success: false,
        error: "この路線にはホームドア情報が登録されているため削除できません"
      }
    }

    // 路線を削除
    const { error: deleteError } = await adminClient
      .from("station_lines")
      .delete()
      .eq("id", stationLineId)

    if (deleteError) {
      console.error("Error removing line from station:", deleteError)
      return { success: false, error: "路線の削除に失敗しました" }
    }

    // 履歴を記録
    await adminClient.from("update_history").insert({
      table_name: "station_lines",
      record_id: stationLineId,
      action: "DELETE",
      old_data: existing,
      updated_by: userId,
    })

    revalidatePath("/stations")
    revalidatePath(`/stations/${existing.station_id}`)

    return {
      success: true,
      message: "路線を削除しました"
    }
  } catch (error) {
    console.error("Error in removeLineFromStation:", error)
    return { success: false, error: "予期しないエラーが発生しました" }
  }
}
// lib/actions.ts の鉄道会社・路線管理関数を以下に置き換えてください

// ======================
// 鉄道会社管理
// ======================

export interface RailwayCompanyInput {
  name: string
  type?: string
  website_url?: string
  description?: string
}

export interface RailwayCompanyUpdateInput {
  name?: string
  type?: string
  website_url?: string
  description?: string
}

// 鉄道会社作成
export async function createRailwayCompany(
  input: RailwayCompanyInput,
  userId: string
): Promise<{ success: boolean; data?: any; error?: string; message?: string }> {
  try {
    const { supabase } = await import('@/lib/supabase')

    console.log("🔧 Creating railway company:", input);
    
    // 現在のセッション情報をデバッグ
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    console.log("🔧 Current session:", session);
    console.log("🔧 Session error:", sessionError);
    
    // 現在のユーザー情報をデバッグ
    const { data: user, error: userError } = await supabase.auth.getUser();
    console.log("🔧 Current user:", user);
    console.log("🔧 User error:", userError);

    const { data, error } = await supabase
      .from('railway_companies')
      .insert({
        name: input.name,
        type: input.type || 'JR', // デフォルト値を設定
        website_url: input.website_url || null,
        description: input.description || null,
      })
      .select()
      .single()

    console.log("🔧 Supabase response:", { data, error });

    if (error) {
      console.error('Error creating railway company:', error)
      return { 
        success: false, 
        error: error.message.includes('duplicate') 
          ? 'この名前の鉄道会社は既に存在します'
          : '鉄道会社の作成に失敗しました'
      }
    }

    console.log("✅ Railway company created successfully:", data);

    return { 
      success: true, 
      data, 
      message: `「${input.name}」を追加しました`
    }
  } catch (error) {
    console.error('Error in createRailwayCompany:', error)
    return { success: false, error: '予期しないエラーが発生しました' }
  }
}

// 鉄道会社更新
export async function updateRailwayCompany(
  companyId: string,
  input: RailwayCompanyUpdateInput,
  userId: string
): Promise<{ success: boolean; data?: any; error?: string; message?: string }> {
  try {
    const { supabase } = await import('@/lib/supabase')

    const { data, error } = await supabase
      .from('railway_companies')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', companyId)
      .select()
      .single()

    if (error) {
      console.error('Error updating railway company:', error)
      return { 
        success: false, 
        error: error.message.includes('duplicate')
          ? 'この名前の鉄道会社は既に存在します'
          : '鉄道会社の更新に失敗しました'
      }
    }

    return { 
      success: true, 
      data, 
      message: '鉄道会社を更新しました'
    }
  } catch (error) {
    console.error('Error in updateRailwayCompany:', error)
    return { success: false, error: '予期しないエラーが発生しました' }
  }
}

// 鉄道会社削除
export async function deleteRailwayCompany(
  companyId: string,
  userId: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const { supabase } = await import('@/lib/supabase')

    // 関連する路線があるかチェック
    const { data: lines, error: linesError } = await supabase
      .from('lines')
      .select('id')
      .eq('company_id', companyId)
      .limit(1)

    if (linesError) {
      console.error('Error checking related lines:', linesError)
      return { success: false, error: '関連データの確認に失敗しました' }
    }

    if (lines && lines.length > 0) {
      return { 
        success: false, 
        error: 'この鉄道会社には路線が登録されているため削除できません' 
      }
    }

    const { error } = await supabase
      .from('railway_companies')
      .delete()
      .eq('id', companyId)

    if (error) {
      console.error('Error deleting railway company:', error)
      return { success: false, error: '鉄道会社の削除に失敗しました' }
    }

    return { 
      success: true, 
      message: '鉄道会社を削除しました'
    }
  } catch (error) {
    console.error('Error in deleteRailwayCompany:', error)
    return { success: false, error: '予期しないエラーが発生しました' }
  }
}

// ======================
// 路線管理
// ======================

export interface LineInput {
  name: string
  company_id: string
  color?: string
  description?: string
}

export interface LineUpdateInput {
  name?: string
  company_id?: string
  color?: string
  description?: string
}

// 路線作成
export async function createLine(
  input: LineInput,
  userId: string
): Promise<{ success: boolean; data?: any; error?: string; message?: string }> {
  try {
    const { supabase } = await import('@/lib/supabase')

    console.log("🚇 Creating line:", input);
    
    const { data, error } = await supabase
      .from('lines')
      .insert({
        name: input.name,
        company_id: input.company_id,
        color: input.color || null,
        description: input.description || null,
      })
      .select(`
        *,
        railway_companies (
          id,
          name
        )
      `)
      .single()

    if (error) {
      console.error('Error creating line:', error)
      return { 
        success: false, 
        error: error.message.includes('duplicate')
          ? 'この名前の路線は既に存在します'
          : '路線の作成に失敗しました'
      }
    }

    console.log("✅ Line created successfully:", data);

    return { 
      success: true, 
      data, 
      message: `「${input.name}」を追加しました`
    }
  } catch (error) {
    console.error('Error in createLine:', error)
    return { success: false, error: '予期しないエラーが発生しました' }
  }
}

// 路線更新
export async function updateLine(
  lineId: string,
  input: LineUpdateInput,
  userId: string
): Promise<{ success: boolean; data?: any; error?: string; message?: string }> {
  try {
    const { supabase } = await import('@/lib/supabase')

    console.log("🚇 Updating line:", lineId, input);

    const { data, error } = await supabase
      .from('lines')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', lineId)
      .select(`
        *,
        railway_companies (
          id,
          name
        )
      `)
      .single()

    console.log("🚇 Update response:", { data, error });

    if (error) {
      console.error('Error updating line:', error)
      return { 
        success: false, 
        error: error.message.includes('duplicate')
          ? 'この名前の路線は既に存在します'
          : '路線の更新に失敗しました'
      }
    }

    console.log("✅ Line updated successfully:", data);

    return { 
      success: true, 
      data, 
      message: '路線を更新しました'
    }
  } catch (error) {
    console.error('Error in updateLine:', error)
    return { success: false, error: '予期しないエラーが発生しました' }
  }
}

// 路線削除
export async function deleteLine(
  lineId: string,
  userId: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const { supabase } = await import('@/lib/supabase')

    console.log("🚇 Deleting line:", lineId);

    // 関連する駅があるかチェック
    const { data: stations, error: stationsError } = await supabase
      .from('station_lines')
      .select('id')
      .eq('line_id', lineId)
      .limit(1)

    console.log("🚇 Related stations check:", { stations, stationsError });

    if (stationsError) {
      console.error('Error checking related stations:', stationsError)
      return { success: false, error: '関連データの確認に失敗しました' }
    }

    if (stations && stations.length > 0) {
      console.log("🚇 Cannot delete: has related stations");
      return { 
        success: false, 
        error: 'この路線には駅が登録されているため削除できません' 
      }
    }

    const { error } = await supabase
      .from('lines')
      .delete()
      .eq('id', lineId)

    console.log("🚇 Delete response:", { error });

    if (error) {
      console.error('Error deleting line:', error)
      return { success: false, error: '路線の削除に失敗しました' }
    }

    console.log("✅ Line deleted successfully");

    return { 
      success: true, 
      message: '路線を削除しました'
    }
  } catch (error) {
    console.error('Error in deleteLine:', error)
    return { success: false, error: '予期しないエラーが発生しました' }
  }
}