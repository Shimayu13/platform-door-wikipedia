import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// データベースの型定義
// 既存の RailwayCompany 型を拡張
export interface RailwayCompany {
  id: string
  name: string
  type?: string // 追加: 事業者タイプ（JR、私鉄など）
  website_url?: string | null
  description?: string | null
  created_at: string
  updated_at: string
  created_by?: string | null
  updated_by?: string | null
}

// 既存の Line 型を拡張
export interface Line {
  id: string
  name: string
  company_id: string
  color?: string | null
  line_color?: string | null // 追加: 既存コードとの互換性のため
  description?: string | null
  created_at: string
  updated_at: string
  created_by?: string | null
  updated_by?: string | null
  railway_companies?: RailwayCompany
}

// 駅と路線の関係を表す中間テーブル（駅ナンバリングを追加）
export interface StationLine {
  id: string
  station_id: string
  line_id: string
  station_code?: string // 路線ごとの駅ナンバリング
  platform_prefix?: string
  notes?: string
  created_at: string
  updated_at: string
  lines?: Line
}

export interface Station {
  id: string
  name: string
  latitude?: number
  longitude?: number
  prefecture: string
  city?: string
  address?: string
  station_code?: string // 追加: 既存コードとの互換性のため
  created_at: string
  updated_at: string
  station_lines?: StationLine[] // 新しい多対多関係
  platform_doors?: PlatformDoor[]
}

export interface PlatformDoor {
  id: string
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
  updated_by?: string
  created_at: string
  updated_at: string
  stations?: Station
  lines?: Line // 路線情報
}

export interface News {
  id: string
  title: string
  content: string
  summary?: string
  author_id?: string
  status: "下書き" | "公開" | "非公開"
  published_at?: string
  created_at: string
  updated_at: string
}

// 新しい駅登録用の型（複数路線と駅ナンバリング対応）
export interface StationInput {
  name: string
  lines: Array<{
    line_id: string
    station_code?: string // 路線ごとの駅ナンバリング
  }> // 路線ごとの詳細情報
  latitude?: number
  longitude?: number
  prefecture: string
  city?: string
  address?: string
}

// 駅-路線関係の登録用型（駅ナンバリング追加）
export interface StationLineInput {
  station_id: string
  line_id: string
  station_code?: string // 路線ごとの駅ナンバリング
  platform_prefix?: string
  notes?: string
}

// 会社別統計情報の型
export interface CompanyStats {
  company: RailwayCompany
  totalLines: number
  totalStations: number
  totalPlatforms: number
  completedPlatforms: number
  inProgressPlatforms: number
  plannedPlatforms: number
  uninstalledPlatforms: number
  completionRate: number
  doorTypes: Record<string, number>
  manufacturers: Record<string, number>
  lineStats: Array<{
    line: Line
    totalStations: number
    totalPlatforms: number
    completedPlatforms: number
    completionRate: number
    latestUpdate?: string
  }>
}

// 路線詳細統計情報の型を追加
export interface LineStats {
  line: Line
  totalStations: number
  totalPlatforms: number
  completedPlatforms: number
  inProgressPlatforms: number
  plannedPlatforms: number
  uninstalledPlatforms: number
  completionRate: number
  doorTypes: Record<string, number>
  manufacturers: Record<string, number>
  stationStats: Array<{
    station: Station
    totalPlatforms: number
    completedPlatforms: number
    completionRate: number
    latestUpdate?: string
  }>
  latestUpdate?: string
}

// データベース操作関数
export const getStations = async (filters?: {
  search?: string
  company?: string
  prefecture?: string
  status?: string
}) => {
  try {
    let query = supabase.from("stations").select(`
        *,
        station_lines (
          *,
          lines (
            *,
            railway_companies (*)
          )
        ),
        platform_doors (
          *,
          lines (
            *,
            railway_companies (*)
          )
        )
      `)

    if (filters?.search) {
      query = query.ilike("name", `%${filters.search}%`)
    }

    if (filters?.prefecture && filters.prefecture !== "all") {
      query = query.eq("prefecture", filters.prefecture)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching stations:", error)
      return []
    }

    // フィルタリング処理
    let filteredData = data || []

    if (filters?.company && filters.company !== "all") {
      filteredData = filteredData.filter((station) =>
        station.station_lines?.some((sl: StationLine) => sl.lines?.railway_companies?.name === filters.company),
      )
    }

    if (filters?.status && filters.status !== "all") {
      filteredData = filteredData.filter((station) =>
        station.platform_doors?.some((door: PlatformDoor) => door.status === filters.status),
      )
    }

    return filteredData
  } catch (error) {
    console.error("Database connection error:", error)
    return []
  }
}
export const getStationById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("stations")
      .select(`
        *,
        station_lines (
          *,
          lines (
            *,
            railway_companies (*)
          )
        ),
        platform_doors (
          *,
          lines (
            *,
            railway_companies (*)
          )
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching station:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Database connection error:", error)
    return null
  }
}

export const getRailwayCompanies = async () => {
  try {
    const { data, error } = await supabase.from("railway_companies").select("*").order("name")

    if (error) {
      console.error("Error fetching railway companies:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Database connection error:", error)
    return []
  }
}

export const getRailwayCompanyById = async (id: string) => {
  try {
    const { data, error } = await supabase.from("railway_companies").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching railway company:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Database connection error:", error)
    return null
  }
}

export const getCompanyStats = async (companyId: string): Promise<CompanyStats | null> => {
  try {
    // 会社情報を取得
    const company = await getRailwayCompanyById(companyId)
    if (!company) return null

    // 路線情報を取得
    const { data: lines, error: linesError } = await supabase.from("lines").select("*").eq("company_id", companyId)

    if (linesError) {
      console.error("Error fetching lines:", linesError)
      return null
    }

    // 各路線のホームドア情報を取得
    const lineIds = lines?.map((line) => line.id) || []

    const { data: platformDoors, error: platformError } = await supabase
      .from("platform_doors")
      .select(`
        *,
        stations!inner (
          *,
          station_lines!inner (
            line_id
          )
        )
      `)
      .in("line_id", lineIds)

    if (platformError) {
      console.error("Error fetching platform doors:", platformError)
      return null
    }

    // 駅情報を取得
    const { data: stations, error: stationsError } = await supabase
      .from("stations")
      .select(`
        *,
        station_lines!inner (
          line_id
        )
      `)
      .in("station_lines.line_id", lineIds)

    if (stationsError) {
      console.error("Error fetching stations:", stationsError)
      return null
    }

    // 統計情報を計算
    const totalLines = lines?.length || 0
    const totalStations = stations?.length || 0
    const totalPlatforms = platformDoors?.length || 0

    const statusCounts = (platformDoors || []).reduce(
      (acc, door) => {
        acc[door.status] = (acc[door.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const completedPlatforms = statusCounts["稼働"] || 0
    const inProgressPlatforms =
      (statusCounts["設置"] || 0) + (statusCounts["復元"] || 0) + (statusCounts["仮覆工"] || 0)
    const plannedPlatforms = statusCounts["未設置"] || 0
    const uninstalledPlatforms = plannedPlatforms

    const completionRate = totalPlatforms > 0 ? (completedPlatforms / totalPlatforms) * 100 : 0

    // ドアタイプ別統計
    const doorTypes = (platformDoors || []).reduce(
      (acc, door) => {
        if (door.door_type) {
          acc[door.door_type] = (acc[door.door_type] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )

    // メーカー別統計
    const manufacturers = (platformDoors || []).reduce(
      (acc, door) => {
        if (door.manufacturer) {
          acc[door.manufacturer] = (acc[door.manufacturer] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )

    // 路線別統計
    const lineStats = (lines || []).map((line) => {
      const linePlatforms = (platformDoors || []).filter((door) => door.line_id === line.id)
      const lineStations = (stations || []).filter((station) =>
        station.station_lines?.some((sl) => sl.line_id === line.id),
      )
      const lineCompleted = linePlatforms.filter((door) => door.status === "稼働").length
      const lineTotal = linePlatforms.length
      const lineCompletionRate = lineTotal > 0 ? (lineCompleted / lineTotal) * 100 : 0

      // 最新更新日を取得
      const latestUpdate =
        linePlatforms.length > 0
          ? Math.max(...linePlatforms.map((door) => new Date(door.updated_at).getTime()))
          : undefined

      return {
        line,
        totalStations: lineStations.length,
        totalPlatforms: lineTotal,
        completedPlatforms: lineCompleted,
        completionRate: lineCompletionRate,
        latestUpdate: latestUpdate ? new Date(latestUpdate).toISOString() : undefined,
      }
    })

    return {
      company,
      totalLines,
      totalStations,
      totalPlatforms,
      completedPlatforms,
      inProgressPlatforms,
      plannedPlatforms,
      uninstalledPlatforms,
      completionRate,
      doorTypes,
      manufacturers,
      lineStats,
    }
  } catch (error) {
    console.error("Error fetching company stats:", error)
    return null
  }
}

export const getLines = async (companyId?: string) => {
  try {
    let query = supabase
      .from("lines")
      .select(`
      *,
      railway_companies (*)
    `)
      .order("name")

    if (companyId) {
      query = query.eq("company_id", companyId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching lines:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Database connection error:", error)
    return []
  }
}

export const getStationLines = async (stationId: string) => {
  try {
    const { data, error } = await supabase
      .from("station_lines")
      .select(`
        *,
        lines (
          *,
          railway_companies (*)
        )
      `)
      .eq("station_id", stationId)

    if (error) {
      console.error("Error fetching station lines:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Database connection error:", error)
    return []
  }
}

export const getNews = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .eq("status", "公開")
      .order("published_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching news:", error)
      return [
        {
          id: "1",
          title: "ホームドア情報局へようこそ",
          content:
            "全国のホームドア設置状況を共有するプラットフォームです。データベースのセットアップが完了すると、最新のニュースが表示されます。",
          summary: "ホームドア情報局の紹介",
          created_at: new Date().toISOString(),
          published_at: new Date().toISOString(),
          status: "公開" as const,
        },
      ]
    }

    return data || []
  } catch (error) {
    console.error("Database connection error:", error)
    return [
      {
        id: "1",
        title: "ホームドア情報局へようこそ",
        content:
          "全国のホームドア設置状況を共有するプラットフォームです。データベースのセットアップが完了すると、最新のニュースが表示されます。",
        summary: "ホームドア情報局の紹介",
        created_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
        status: "公開" as const,
      },
    ]
  }
}

export const getStationStats = async () => {
  try {
    const { data: platformDoors, error } = await supabase.from("platform_doors").select("status")

    if (error) {
      console.error("Error fetching platform door stats:", error)
      return {
        total: 0,
        operating: 0,
        installed: 0,
        restored: 0,
        temporary: 0,
        notInstalled: 0,
      }
    }

    const stats = (platformDoors || []).reduce(
      (acc, door) => {
        acc.total++
        switch (door.status) {
          case "稼働":
            acc.operating++
            break
          case "設置":
            acc.installed++
            break
          case "復元":
            acc.restored++
            break
          case "仮覆工":
            acc.temporary++
            break
          case "未設置":
            acc.notInstalled++
            break
        }
        return acc
      },
      {
        total: 0,
        operating: 0,
        installed: 0,
        restored: 0,
        temporary: 0,
        notInstalled: 0,
      },
    )

    return stats
  } catch (error) {
    console.error("Database connection error:", error)
    return {
      total: 0,
      operating: 0,
      installed: 0,
      restored: 0,
      temporary: 0,
      notInstalled: 0,
    }
  }
}

// getLineStats関数を追加
export const getLineStats = async (lineId: string): Promise<LineStats | null> => {
  try {
    // 路線情報を取得
    const { data: line, error: lineError } = await supabase
      .from("lines")
      .select(`
        *,
        railway_companies (*)
      `)
      .eq("id", lineId)
      .single()

    if (lineError) {
      console.error("Error fetching line:", lineError)
      return null
    }

    // この路線の駅情報を取得
    const { data: stations, error: stationsError } = await supabase
      .from("stations")
      .select(`
        *,
        station_lines!inner (
          line_id
        ),
        platform_doors (
          *
        )
      `)
      .eq("station_lines.line_id", lineId)

    if (stationsError) {
      console.error("Error fetching stations:", stationsError)
      return null
    }

    // この路線のホームドア情報を取得
    const { data: platformDoors, error: platformError } = await supabase
      .from("platform_doors")
      .select("*")
      .eq("line_id", lineId)

    if (platformError) {
      console.error("Error fetching platform doors:", platformError)
      return null
    }

    // 統計情報を計算
    const totalStations = stations?.length || 0
    const totalPlatforms = platformDoors?.length || 0

    const statusCounts = (platformDoors || []).reduce(
      (acc, door) => {
        acc[door.status] = (acc[door.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const completedPlatforms = statusCounts["稼働"] || 0
    const inProgressPlatforms =
      (statusCounts["設置"] || 0) + (statusCounts["復元"] || 0) + (statusCounts["仮覆工"] || 0)
    const plannedPlatforms = statusCounts["未設置"] || 0
    const uninstalledPlatforms = plannedPlatforms

    const completionRate = totalPlatforms > 0 ? (completedPlatforms / totalPlatforms) * 100 : 0

    // ドアタイプ別統計
    const doorTypes = (platformDoors || []).reduce(
      (acc, door) => {
        if (door.door_type) {
          acc[door.door_type] = (acc[door.door_type] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )

    // メーカー別統計
    const manufacturers = (platformDoors || []).reduce(
      (acc, door) => {
        if (door.manufacturer) {
          acc[door.manufacturer] = (acc[door.manufacturer] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )

    // 駅別統計
    const stationStats = (stations || []).map((station) => {
      const stationPlatforms = (platformDoors || []).filter((door) => door.station_id === station.id)
      const stationCompleted = stationPlatforms.filter((door) => door.status === "稼働").length
      const stationTotal = stationPlatforms.length
      const stationCompletionRate = stationTotal > 0 ? (stationCompleted / stationTotal) * 100 : 0

      // 最新更新日を取得
      const latestUpdate =
        stationPlatforms.length > 0
          ? Math.max(...stationPlatforms.map((door) => new Date(door.updated_at).getTime()))
          : undefined

      return {
        station,
        totalPlatforms: stationTotal,
        completedPlatforms: stationCompleted,
        completionRate: stationCompletionRate,
        latestUpdate: latestUpdate ? new Date(latestUpdate).toISOString() : undefined,
      }
    })

    // 最新更新日を取得
    const latestUpdate =
      platformDoors && platformDoors.length > 0
        ? Math.max(...platformDoors.map((door) => new Date(door.updated_at).getTime()))
        : undefined

    return {
      line,
      totalStations,
      totalPlatforms,
      completedPlatforms,
      inProgressPlatforms,
      plannedPlatforms,
      uninstalledPlatforms,
      completionRate,
      doorTypes,
      manufacturers,
      stationStats,
      latestUpdate: latestUpdate ? new Date(latestUpdate).toISOString() : undefined,
    }
  } catch (error) {
    console.error("Error fetching line stats:", error)
    return null
  }
}