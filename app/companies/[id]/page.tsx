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
  AlertCircle,
  XCircle,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { getCompanyStats } from "@/lib/supabase"

interface CompanyDetailPageProps {
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

export default async function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const stats = await getCompanyStats(params.id)

  if (!stats) {
    notFound()
  }

  const { company } = stats

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
          <Link href="/companies" className="hover:text-gray-900 flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" />
            鉄道会社一覧に戻る
          </Link>
          <span>/</span>
          <span className="text-gray-900">{company.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2 space-y-6">
            {/* 会社基本情報 */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">{company.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant={company.type === "JR" ? "default" : "secondary"}>{company.type}</Badge>
                    </div>
                  </div>
                  <Train className="h-8 w-8 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalLines}</div>
                    <div className="text-sm text-gray-600">路線数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.totalStations}</div>
                    <div className="text-sm text-gray-600">駅数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.totalPlatforms}</div>
                    <div className="text-sm text-gray-600">総ホーム数</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getCompletionColor(stats.completionRate)}`}>
                      {Math.round(stats.completionRate)}%
                    </div>
                    <div className="text-sm text-gray-600">整備完了率</div>
                  </div>
                </div>

                {company.website_url && (
                  <div className="mt-6 pt-6 border-t">
                    <Button variant="outline" asChild>
                      <a href={company.website_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        公式サイト
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

            {/* ホームドアの種類 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  ホームドアの種類
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(stats.doorTypes).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(stats.doorTypes)
                      .sort(([, a], [, b]) => b - a)
                      .map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{type}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${(count / Math.max(...Object.values(stats.doorTypes))) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-bold w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>ホームドアタイプの情報がありません</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 路線別整備状況 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Train className="mr-2 h-5 w-5" />
                  路線別整備状況
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.lineStats
                    .sort((a, b) => b.completionRate - a.completionRate)
                    .map((lineStat) => (
                      <div key={lineStat.line.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-3">
                            {lineStat.line.line_color && (
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: lineStat.line.line_color }}
                              />
                            )}
                            <div>
                              <Link
                                href={`/lines/${lineStat.line.id}`}
                                className="font-medium hover:text-blue-600 transition-colors cursor-pointer"
                              >
                                {lineStat.line.name}
                              </Link>
                              <div className="text-sm text-gray-600">
                                {lineStat.totalStations} 駅 • {lineStat.totalPlatforms} ホーム
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${getCompletionColor(lineStat.completionRate)}`}>
                              {Math.round(lineStat.completionRate)}%
                            </div>
                            <div className="text-xs text-gray-500">
                              {lineStat.completedPlatforms}/{lineStat.totalPlatforms}
                            </div>
                          </div>
                        </div>

                        <div className="mb-2">
                          <Progress value={lineStat.completionRate} className="h-2" />
                        </div>

                        <div className="flex justify-between items-center">
                          {lineStat.latestUpdate && (
                            <div className="text-xs text-gray-500">
                              最終更新: {new Date(lineStat.latestUpdate).toLocaleDateString("ja-JP")}
                            </div>
                          )}
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/lines/${lineStat.line.id}`}>詳細を見る</Link>
                          </Button>
                        </div>
                      </div>
                    ))}

                  {stats.lineStats.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Train className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>路線情報がありません</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 整備予定計画 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  整備予定計画
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-900">2024年度</div>
                    <div className="text-blue-700">計画中: {stats.plannedPlatforms} ホーム</div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="font-medium text-orange-900">工事中</div>
                    <div className="text-orange-700">進行中: {stats.inProgressPlatforms} ホーム</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-medium text-green-900">完了済み</div>
                    <div className="text-green-700">稼働中: {stats.completedPlatforms} ホーム</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                  ※ 具体的な整備計画は各鉄道会社の発表をご確認ください
                </div>
              </CardContent>
            </Card>

            {/* メーカー別統計 */}
            <Card>
              <CardHeader>
                <CardTitle>主要メーカー</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(stats.manufacturers).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(stats.manufacturers)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([manufacturer, count]) => (
                        <div key={manufacturer} className="flex justify-between items-center text-sm">
                          <span className="font-medium">{manufacturer}</span>
                          <span className="text-gray-600">{count} 基</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">メーカー情報がありません</div>
                )}
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
                    <Link href={`/stations?company=${encodeURIComponent(company.name)}`}>
                      <MapPin className="h-4 w-4 mr-2" />
                      この会社の駅一覧
                    </Link>
                  </Button>
                  {company.website_url && (
                    <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                      <a href={company.website_url} target="_blank" rel="noopener noreferrer">
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
                <CardTitle>データ更新情報</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">最終更新: </span>
                    <span className="font-medium">
                      {stats.lineStats.length > 0 && stats.lineStats.some((ls) => ls.latestUpdate)
                        ? new Date(
                            Math.max(
                              ...stats.lineStats
                                .filter((ls) => ls.latestUpdate)
                                .map((ls) => new Date(ls.latestUpdate!).getTime()),
                            ),
                          ).toLocaleDateString("ja-JP")
                        : "情報なし"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">データ登録: </span>
                    <span className="font-medium">{new Date(company.created_at).toLocaleDateString("ja-JP")}</span>
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
