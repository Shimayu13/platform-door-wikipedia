"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Train, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react"
import { getStations, getRailwayCompanies } from "@/lib/supabase"
import Link from "next/link"

const getStatusIcon = (status: string) => {
  switch (status) {
    case "設置済み":
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case "工事中":
      return <Clock className="h-4 w-4 text-orange-600" />
    case "計画中":
      return <AlertCircle className="h-4 w-4 text-blue-600" />
    default:
      return <XCircle className="h-4 w-4 text-gray-600" />
  }
}

const getStatusBadge = (status: string) => {
  const variants = {
    設置済み: "default",
    工事中: "secondary",
    計画中: "outline",
    未設置: "destructive",
  } as const

  return <Badge variant={variants[status as keyof typeof variants] || "secondary"}>{status}</Badge>
}

export default async function StationsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const search = typeof searchParams.search === "string" ? searchParams.search : ""
  const company = typeof searchParams.company === "string" ? searchParams.company : "all"
  const prefecture = typeof searchParams.prefecture === "string" ? searchParams.prefecture : "all"
  const status = typeof searchParams.status === "string" ? searchParams.status : "all"

  const stations = await getStations({
    search,
    company: company !== "all" ? company : undefined,
    prefecture: prefecture !== "all" ? prefecture : undefined,
    status: status !== "all" ? status : undefined,
  })

  const companies = await getRailwayCompanies()

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
                <Link href="/contribute">情報提供</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/companies">鉄道会社</Link>
              </Button>
              <Button variant="ghost">ニュース</Button>
              <Button variant="outline" size="sm">
                ログイン
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">駅検索</h2>
          <p className="text-gray-600">全国の駅のホームドア設置状況を検索できます</p>
        </div>

        {/* 検索・フィルター */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>検索・絞り込み</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input placeholder="駅名で検索..." value={search} className="pl-10" readOnly />
                </div>
              </div>
              <Select value={company}>
                <SelectTrigger>
                  <SelectValue placeholder="鉄道会社" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  {companies.map((companyItem) => (
                    <SelectItem key={companyItem.id} value={companyItem.name}>
                      {companyItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={prefecture}>
                <SelectTrigger>
                  <SelectValue placeholder="都道府県" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="東京都">東京都</SelectItem>
                  <SelectItem value="神奈川県">神奈川県</SelectItem>
                  <SelectItem value="大阪府">大阪府</SelectItem>
                </SelectContent>
              </Select>
              <Select value={status}>
                <SelectTrigger>
                  <SelectValue placeholder="設置状況" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="設置済み">設置済み</SelectItem>
                  <SelectItem value="工事中">工事中</SelectItem>
                  <SelectItem value="計画中">計画中</SelectItem>
                  <SelectItem value="未設置">未設置</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 検索結果 */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">{stations.length}件の駅が見つかりました</p>
          <Button variant="outline" size="sm">
            <MapPin className="mr-2 h-4 w-4" />
            地図で表示
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stations.length > 0 ? (
            stations.map((station) => {
              const platformDoors = station.platform_doors || []
              const totalPlatforms = platformDoors.length
              const completedPlatforms = platformDoors.filter((door) => door.status === "設置済み").length
              const mainStatus =
                totalPlatforms > 0
                  ? completedPlatforms === totalPlatforms
                    ? "設置済み"
                    : completedPlatforms > 0
                      ? "一部設置済み"
                      : platformDoors.some((door) => door.status === "工事中")
                        ? "工事中"
                        : platformDoors.some((door) => door.status === "計画中")
                          ? "計画中"
                          : "未設置"
                  : "情報なし"

              return (
                <Card key={station.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{station.name}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <Train className="mr-1 h-3 w-3" />
                          {station.lines?.name || "路線情報なし"}
                        </CardDescription>
                      </div>
                      {getStatusIcon(mainStatus)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">鉄道会社</span>
                        <span className="text-sm font-medium">
                          {station.lines?.railway_companies?.name || "情報なし"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">所在地</span>
                        <span className="text-sm font-medium">{station.prefecture}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">設置状況</span>
                        {getStatusBadge(mainStatus)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">ホーム数</span>
                        <span className="text-sm font-medium">
                          {totalPlatforms > 0 ? `${completedPlatforms}/${totalPlatforms}` : "情報なし"}
                        </span>
                      </div>
                      <div className="pt-2">
                        <Button variant="outline" className="w-full" size="sm" asChild>
                          <Link href={`/stations/${station.id}`}>詳細を見る</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <div className="col-span-full">
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-gray-400 mb-4">
                    <Train className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">駅データを準備中です</h3>
                  <p className="text-gray-600 mb-4">データベースのセットアップが完了すると駅情報が表示されます</p>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    再読み込み
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {stations.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">検索結果が見つかりませんでした</h3>
              <p className="text-gray-600">検索条件を変更して再度お試しください</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
