import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Train, Calendar, User, ExternalLink } from "lucide-react"
import Link from "next/link"
import { getStationById } from "@/lib/supabase"
import { PlatformProgress } from "@/components/platform-progress"

interface StationDetailPageProps {
  params: {
    id: string
  }
}

export default async function StationDetailPage({ params }: StationDetailPageProps) {
  const station = await getStationById(params.id)

  if (!station) {
    notFound()
  }

  const platformDoors = station.platform_doors || []
  const stationLines = station.station_lines || []

  // 路線別にホームドアをグループ化
  const platformDoorsByLine = platformDoors.reduce(
    (acc, door) => {
      const lineId = door.line_id
      if (!acc[lineId]) {
        acc[lineId] = []
      }
      acc[lineId].push(door)
      return acc
    },
    {} as Record<string, any[]>,
  )

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
              <Button variant="ghost" asChild>
                <Link href="/contribute">情報提供</Link>
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
          <Link href="/stations" className="hover:text-gray-900 flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" />
            駅検索に戻る
          </Link>
          <span>/</span>
          <span className="text-gray-900">{station.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2 space-y-6">
            {/* 駅基本情報 */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">{station.name}</CardTitle>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {station.prefecture}
                        {station.city && ` ${station.city}`}
                      </div>
                    </div>
                  </div>
                  {station.station_code && (
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {station.station_code}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 路線情報 */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">乗り入れ路線</h4>
                    <div className="space-y-2">
                      {stationLines.map((stationLine) => (
                        <div key={stationLine.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            {stationLine.lines?.line_color && (
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: stationLine.lines.line_color }}
                              />
                            )}
                            <div>
                              <Link
                                href={`/lines/${stationLine.line_id}`}
                                className="font-medium hover:text-blue-600 transition-colors"
                              >
                                {stationLine.lines?.name}
                              </Link>
                              <div className="text-sm text-gray-600">{stationLine.lines?.railway_companies?.name}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={stationLine.lines?.railway_companies?.type === "JR" ? "default" : "secondary"}
                            >
                              {stationLine.lines?.railway_companies?.type}
                            </Badge>
                            {platformDoorsByLine[stationLine.line_id] && (
                              <Badge variant="outline">{platformDoorsByLine[stationLine.line_id].length} ホーム</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {station.address && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">住所</h4>
                      <p className="text-gray-600">{station.address}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 路線別ホームドア設置進捗 */}
            {stationLines.map((stationLine) => {
              const linePlatforms = platformDoorsByLine[stationLine.line_id] || []
              return (
                <Card key={stationLine.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Train className="h-5 w-5" />
                      <Link href={`/lines/${stationLine.line_id}`} className="hover:text-blue-600 transition-colors">
                        <span>{stationLine.lines?.railway_companies?.name}</span>
                        <span className="ml-1">{stationLine.lines?.name}</span>
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PlatformProgress platformDoors={linePlatforms} showDetails={true} />
                  </CardContent>
                </Card>
              )
            })}

            {/* 全体進捗 */}
            {platformDoors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>全路線合計進捗</CardTitle>
                </CardHeader>
                <CardContent>
                  <PlatformProgress platformDoors={platformDoors} showDetails={false} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 更新情報 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  更新情報
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">最終更新: </span>
                    <span className="font-medium">{new Date(station.updated_at).toLocaleDateString("ja-JP")}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">データ登録: </span>
                    <span className="font-medium">{new Date(station.created_at).toLocaleDateString("ja-JP")}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">路線数: </span>
                    <span className="font-medium">{stationLines.length} 路線</span>
                  </div>
                  <div>
                    <span className="text-gray-600">総ホーム数: </span>
                    <span className="font-medium">{platformDoors.length} ホーム</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" className="w-full" size="sm" asChild>
                    <Link href="/contribute">
                      <User className="mr-2 h-4 w-4" />
                      情報を更新する
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 鉄道会社リンク */}
            <Card>
              <CardHeader>
                <CardTitle>鉄道会社サイト</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stationLines
                    .filter((sl) => sl.lines?.railway_companies?.website_url)
                    .map((stationLine) => (
                      <Button key={stationLine.id} variant="outline" className="w-full justify-start" size="sm" asChild>
                        <a
                          href={stationLine.lines!.railway_companies!.website_url!}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {stationLine.lines?.railway_companies?.name}
                        </a>
                      </Button>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* 地図 */}
            {station.latitude && station.longitude && (
              <Card>
                <CardHeader>
                  <CardTitle>位置情報</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MapPin className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">地図表示機能</p>
                      <p className="text-xs">準備中</p>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-600">
                    <div>緯度: {station.latitude}</div>
                    <div>経度: {station.longitude}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
