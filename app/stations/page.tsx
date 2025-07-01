// app/stations/page.tsx - ヘッダー部分の更新
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Train, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react"
import { getStations, getRailwayCompanies } from "@/lib/supabase"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import type { Station, RailwayCompany, PlatformDoor } from "@/lib/supabase"
import { CommonHeader } from "@/components/common-header"

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

export default function StationsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [stations, setStations] = useState<Station[]>([])
  const [companies, setCompanies] = useState<RailwayCompany[]>([])
  const [loading, setLoading] = useState(true)

  const search = searchParams.get("search") || ""
  const company = searchParams.get("company") || "all"
  const prefecture = searchParams.get("prefecture") || "all"
  const status = searchParams.get("status") || "all"

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [stationsData, companiesData] = await Promise.all([
          getStations({
            search: search || undefined,
            company: company !== "all" ? company : undefined,
            prefecture: prefecture !== "all" ? prefecture : undefined,
            status: status !== "all" ? status : undefined,
          }),
          getRailwayCompanies()
        ])
        setStations(stationsData)
        setCompanies(companiesData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [search, company, prefecture, status])

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("search", value)
    } else {
      params.delete("search")
    }
    router.push(`/stations?${params.toString()}`)
  }

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/stations?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CommonHeader />

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
                  <Input
                    placeholder="駅名で検索..."
                    value={search}
                    className="pl-10"
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
              </div>
              <Select value={company} onValueChange={(value) => handleFilterChange("company", value)}>
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

              <Select value={prefecture} onValueChange={(value) => handleFilterChange("prefecture", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="都道府県" />
                </SelectTrigger><SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="北海道">北海道</SelectItem>
                  <SelectItem value="青森県">青森県</SelectItem>
                  <SelectItem value="岩手県">岩手県</SelectItem>
                  <SelectItem value="宮城県">宮城県</SelectItem>
                  <SelectItem value="秋田県">秋田県</SelectItem>
                  <SelectItem value="山形県">山形県</SelectItem>
                  <SelectItem value="福島県">福島県</SelectItem>
                  <SelectItem value="茨城県">茨城県</SelectItem>
                  <SelectItem value="栃木県">栃木県</SelectItem>
                  <SelectItem value="群馬県">群馬県</SelectItem>
                  <SelectItem value="埼玉県">埼玉県</SelectItem>
                  <SelectItem value="千葉県">千葉県</SelectItem>
                  <SelectItem value="東京都">東京都</SelectItem>
                  <SelectItem value="神奈川県">神奈川県</SelectItem>
                  <SelectItem value="新潟県">新潟県</SelectItem>
                  <SelectItem value="富山県">富山県</SelectItem>
                  <SelectItem value="石川県">石川県</SelectItem>
                  <SelectItem value="福井県">福井県</SelectItem>
                  <SelectItem value="山梨県">山梨県</SelectItem>
                  <SelectItem value="長野県">長野県</SelectItem>
                  <SelectItem value="岐阜県">岐阜県</SelectItem>
                  <SelectItem value="静岡県">静岡県</SelectItem>
                  <SelectItem value="愛知県">愛知県</SelectItem>
                  <SelectItem value="三重県">三重県</SelectItem>
                  <SelectItem value="滋賀県">滋賀県</SelectItem>
                  <SelectItem value="京都府">京都府</SelectItem>
                  <SelectItem value="大阪府">大阪府</SelectItem>
                  <SelectItem value="兵庫県">兵庫県</SelectItem>
                  <SelectItem value="奈良県">奈良県</SelectItem>
                  <SelectItem value="和歌山県">和歌山県</SelectItem>
                  <SelectItem value="鳥取県">鳥取県</SelectItem>
                  <SelectItem value="島根県">島根県</SelectItem>
                  <SelectItem value="岡山県">岡山県</SelectItem>
                  <SelectItem value="広島県">広島県</SelectItem>
                  <SelectItem value="山口県">山口県</SelectItem>
                  <SelectItem value="徳島県">徳島県</SelectItem>
                  <SelectItem value="香川県">香川県</SelectItem>
                  <SelectItem value="愛媛県">愛媛県</SelectItem>
                  <SelectItem value="高知県">高知県</SelectItem>
                  <SelectItem value="福岡県">福岡県</SelectItem>
                  <SelectItem value="佐賀県">佐賀県</SelectItem>
                  <SelectItem value="長崎県">長崎県</SelectItem>
                  <SelectItem value="熊本県">熊本県</SelectItem>
                  <SelectItem value="大分県">大分県</SelectItem>
                  <SelectItem value="宮崎県">宮崎県</SelectItem>
                  <SelectItem value="鹿児島県">鹿児島県</SelectItem>
                  <SelectItem value="沖縄県">沖縄県</SelectItem>
                </SelectContent>
              </Select>

              <Select value={status} onValueChange={(value) => handleFilterChange("status", value)}>
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

        {/* 結果表示 */}
        {loading ? (
          <Card className="text-center py-12">
            <CardContent>
              <Train className="h-12 w-12 text-gray-400 mx-auto animate-pulse mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">検索中...</h3>
              <p className="text-gray-600">駅情報を読み込んでいます</p>
            </CardContent>
          </Card>
        ) : stations.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">駅が見つかりませんでした</h3>
              <p className="text-gray-600">検索条件を変更してお試しください</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stations.map((station) => {
              const platformDoors = station.platform_doors || []
              const completedDoors = platformDoors.filter(door => door.status === "稼働").length
              const totalDoors = platformDoors.length
              const completionRate = totalDoors > 0 ? Math.round((completedDoors / totalDoors) * 100) : 0

              return (
                <Card key={station.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{station.name}</CardTitle>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {station.prefecture}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{completionRate}%</div>
                        <div className="text-xs text-gray-500">設置完了</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">ホームドア数</span>
                        <span className="font-medium">{completedDoors}/{totalDoors}</span>
                      </div>

                      {platformDoors.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {platformDoors.slice(0, 3).map((door, index) => (
                            <div key={index} className="flex items-center">
                              {getStatusIcon(door.status)}
                              <span className="text-xs ml-1">{door.platform_number}</span>
                            </div>
                          ))}
                          {platformDoors.length > 3 && (
                            <span className="text-xs text-gray-500">+{platformDoors.length - 3}</span>
                          )}
                        </div>
                      )}

                      <Button asChild className="w-full">
                        <Link href={`/stations/${station.id}`}>詳細を見る</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}