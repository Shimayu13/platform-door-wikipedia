import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Train,
  TrendingUp,
  Calendar,
  MapPin,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  Map,
} from "lucide-react"
import Link from "next/link"
import { getLineStats } from "@/lib/supabase"

interface LineDetailPageProps {
  params: {
    id: string
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "稼働":
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case "設置":
    case "復元":
    case "仮覆工":
      return <Clock className="h-4 w-4 text-orange-600" />
    default:
      return <XCircle className="h-4 w-4 text-gray-600" />
  }
}

const getCompletionColor = (rate: number) => {
  if (rate >= 80) return "text-green-600"
  if (rate >= 50) return "text-orange-600"
  return "text-red-600"
}

const getStatusBadge = (status: string) => {
  const variants = {
    稼働: "default",
    設置: "secondary",
    復元: "outline",
    仮覆工: "secondary",
    未設置: "destructive",
  } as const

  return <Badge variant={variants[status as keyof typeof variants] || "secondary"}>{status}</Badge>
}

export default async function LineDetailPage({ params }: LineDetailPageProps) {
  const stats = await getLineStats(params.id)

  if (!stats) {
    notFound()
  }

  const { line } = stats

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Train className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">ホームドア情報局</h1>
            </div>
            <nav className="flex space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/">ホーム</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/stations">駅検索</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/companies">鉄道会社</Link>
              </Button>
              <Button variant="outline" size="sm">
                ログイン
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* パンくずナビ */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/companies" className="hover:text-gray-900">
            鉄道会社一覧
          </Link>
          <span>/</span>
          <Link href={`/companies/${line.railway_companies?.id}`} className="hover:text-gray-900">
            {line.railway_companies?.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{line.name}</span>
          <Button variant="ghost" size="sm" asChild className="ml-2">
            <Link href={`/companies/${line.railway_companies?.id}`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              会社ページに戻る
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2 space-y-6">
            {/* 路線基本情報 */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    {line.line_color && (
                      <div
                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: line.line_color }}
                      />
                    )}
                    <div>
                      <CardTitle className="text-2xl mb-2">{line.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant={line.railway_companies?.type === "JR" ? "default" : "secondary"}>
                          {line.railway_companies?.type}
                        </Badge>
                        <span className="text-gray-600">{line.railway_companies?.name}</span>
                      </div>
                    </div>
                  </div>
                  <Train className="h-8 w-8 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalStations}</div>
                    <div className="text-sm text-gray-600">駅数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.totalPlatforms}</div>
                    <div className="text-sm text-gray-600">総ホーム数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.completedPlatforms}</div>
                    <div className="text-sm text-gray-600">稼働中</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getCompletionColor(stats.completionRate)}`}>
                      {Math.round(stats.completionRate)}%
                    </div>
                    <div className="text-sm text-gray-600">整備完了率</div>
                  </div>
                </div>

                {line.railway_companies?.website_url && (
                  <div className="mt-6 pt-6 border-t">
                    <Button variant="outline" asChild>
                      <a href={line.railway_companies.website_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {line.railway_companies.name} 公式サイト
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 整備概要 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  整備概要
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">全体進捗</span>
                      <span className="text-sm font-bold">
                        {stats.completedPlatforms}/{stats.totalPlatforms} ホーム
                      </span>
                    </div>
                    <Progress value={stats.completionRate} className="h-3" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{stats.completedPlatforms}</div>
                      <div className="text-xs text-green-700">稼働中</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">{stats.inProgressPlatforms}</div>
                      <div className="text-xs text-orange-700">工事中</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{stats.plannedPlatforms}</div>
                      <div className="text-xs text-blue-700">計画中</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-600">{stats.uninstalledPlatforms}</div>
                      <div className="text-xs text-gray-700">未設置</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 整備進捗 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  整備進捗
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* ホームドアタイプ別 */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">ホームドアタイプ別</h4>
                    {Object.keys(stats.doorTypes).length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(stats.doorTypes)
                          .sort(([, a], [, b]) => b - a)
                          .map(([type, count]) => (
                            <div key={type} className="flex justify-between items-center">
                              <span className="text-sm font-medium">{type}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{
                                      width: `${(count / Math.max(...Object.values(stats.doorTypes))) * 100}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-sm font-bold w-6 text-right">{count}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 text-sm">ホームドアタイプの情報がありません</div>
                    )}
                  </div>

                  {/* メーカー別 */}
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-3">メーカー別</h4>
                    {Object.keys(stats.manufacturers).length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(stats.manufacturers)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 5)
                          .map(([manufacturer, count]) => (
                            <div key={manufacturer} className="flex justify-between items-center">
                              <span className="text-sm font-medium">{manufacturer}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-purple-600 h-2 rounded-full"
                                    style={{
                                      width: `${(count / Math.max(...Object.values(stats.manufacturers))) * 100}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-sm font-bold w-6 text-right">{count}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 text-sm">メーカー情報がありません</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 路線図 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Map className="mr-2 h-5 w-5" />
                  路線図
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <Map className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">路線図表示機能</h3>
                  <p className="text-gray-600 mb-4">
                    {line.name}の路線図とホームドア設置状況を視覚的に表示する機能を準備中です
                  </p>
                  <div className="flex justify-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">稼働中</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">工事中</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <span className="text-xs text-gray-600">未設置</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 駅一覧 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  駅一覧
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.stationStats
                    .sort((a, b) => a.station.name.localeCompare(b.station.name, "ja"))
                    .map((stationStat) => (
                      <div key={stationStat.station.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-lg">{stationStat.station.name}</h4>
                            <div className="text-sm text-gray-600 mt-1">
                              <div className="flex items-center space-x-4">
                                <span>{stationStat.station.prefecture}</span>
                                {stationStat.station.city && <span>{stationStat.station.city}</span>}
                                {stationStat.station.station_code && (
                                  <Badge variant="outline" className="text-xs">
                                    {stationStat.station.station_code}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${getCompletionColor(stationStat.completionRate)}`}>
                              {Math.round(stationStat.completionRate)}%
                            </div>
                            <div className="text-xs text-gray-500">
                              {stationStat.completedPlatforms}/{stationStat.totalPlatforms} ホーム
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <Progress value={stationStat.completionRate} className="h-2" />
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            {stationStat.latestUpdate && (
                              <span>最終更新: {new Date(stationStat.latestUpdate).toLocaleDateString("ja-JP")}</span>
                            )}
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/stations/${stationStat.station.id}`}>詳細を見る</Link>
                          </Button>
                        </div>
                      </div>
                    ))}

                  {stats.stationStats.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>駅情報がありません</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 路線情報 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Train className="mr-2 h-5 w-5" />
                  路線情報
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">鉄道会社: </span>
                    <span className="font-medium">{line.railway_companies?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">路線タイプ: </span>
                    <Badge variant={line.railway_companies?.type === "JR" ? "default" : "secondary"}>
                      {line.railway_companies?.type}
                    </Badge>
                  </div>
                  {line.line_color && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">路線カラー: </span>
                      <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: line.line_color }} />
                      <span className="font-mono text-xs">{line.line_color}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">駅数: </span>
                    <span className="font-medium">{stats.totalStations} 駅</span>
                  </div>
                  <div>
                    <span className="text-gray-600">総ホーム数: </span>
                    <span className="font-medium">{stats.totalPlatforms} ホーム</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 整備状況サマリー */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  整備状況サマリー
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-900">稼働中</span>
                      <span className="text-lg font-bold text-green-600">{stats.completedPlatforms}</span>
                    </div>
                    <div className="text-xs text-green-700">
                      {stats.totalPlatforms > 0
                        ? `${Math.round((stats.completedPlatforms / stats.totalPlatforms) * 100)}%`
                        : "0%"}
                    </div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-orange-900">工事中</span>
                      <span className="text-lg font-bold text-orange-600">{stats.inProgressPlatforms}</span>
                    </div>
                    <div className="text-xs text-orange-700">
                      {stats.totalPlatforms > 0
                        ? `${Math.round((stats.inProgressPlatforms / stats.totalPlatforms) * 100)}%`
                        : "0%"}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">未設置</span>
                      <span className="text-lg font-bold text-gray-600">{stats.uninstalledPlatforms}</span>
                    </div>
                    <div className="text-xs text-gray-700">
                      {stats.totalPlatforms > 0
                        ? `${Math.round((stats.uninstalledPlatforms / stats.totalPlatforms) * 100)}%`
                        : "0%"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 関連リンク */}
            <Card>
              <CardHeader>
                <CardTitle>関連情報</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                    <Link href={`/stations?company=${encodeURIComponent(line.railway_companies?.name || "")}`}>
                      <MapPin className="h-4 w-4 mr-2" />
                      この路線の駅一覧
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                    <Link href={`/companies/${line.railway_companies?.id}`}>
                      <Train className="h-4 w-4 mr-2" />
                      {line.railway_companies?.name}
                    </Link>
                  </Button>
                  {line.railway_companies?.website_url && (
                    <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                      <a href={line.railway_companies.website_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        公式サイト
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                    <Link href="/contribute">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      情報を更新する
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 更新情報 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  データ更新情報
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">最終更新: </span>
                    <span className="font-medium">
                      {stats.latestUpdate ? new Date(stats.latestUpdate).toLocaleDateString("ja-JP") : "情報なし"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">路線登録: </span>
                    <span className="font-medium">{new Date(line.created_at).toLocaleDateString("ja-JP")}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">データ件数: </span>
                    <span className="font-medium">{stats.totalPlatforms} 件</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
