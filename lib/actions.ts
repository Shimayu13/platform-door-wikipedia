"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import type { StationInput, StationLineInput } from "@/lib/supabase"

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

export async function createStation(data: StationInput, userId: string) {
  try {
    // 駅を作成
    const { data: station, error: stationError } = await supabase
      .from("stations")
      .insert({
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        prefecture: data.prefecture,
        city: data.city,
        address: data.address,
        station_code: data.station_code,
      })
      .select()
      .single()

    if (stationError) {
      console.error("Error creating station:", stationError)
      return { success: false, error: "駅の作成に失敗しました" }
    }

    // 駅と路線の関係を作成
    const stationLinePromises = data.line_ids.map((lineId) =>
      supabase.from("station_lines").insert({
        station_id: station.id,
        line_id: lineId,
      }),
    )

    const stationLineResults = await Promise.all(stationLinePromises)
    const stationLineErrors = stationLineResults.filter((result) => result.error)

    if (stationLineErrors.length > 0) {
      console.error("Error creating station lines:", stationLineErrors)
      // 駅は作成されているので、エラーでも部分的に成功
    }

    // 作成履歴を記録
    await supabase.from("update_history").insert({
      table_name: "stations",
      record_id: station.id,
      action: "INSERT",
      new_data: { ...station, line_ids: data.line_ids },
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

// ニュース管理関数
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
          data.status === "公開" && !existing.published_at ? new Date().toISOString() : existing.published_at,
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
      console.error("Error fetching news:", error)
      return { success: false, error: "ニュース一覧の取得に失敗しました", data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "予期しないエラーが発生しました", data: [] }
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
