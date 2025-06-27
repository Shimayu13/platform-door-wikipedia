"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Train, Users, FileText } from "lucide-react"
import Link from "next/link"
import { getNews, getStationStats } from "@/lib/supabase"
import { useAuthContext } from "@/components/auth-provider"

export default function HomePage() {
  const { user } = useAuthContext()
  const getHomePage = async () => {
    const [news, stats] = await Promise.all([getNews(3), getStationStats()])
    return { news, stats }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Train className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">ホームドア情報局</h1>
            </div>
            <nav className="flex space-x-4">
              <Link href="/stations" className="text-gray-600 hover:text-gray-900">
                駅検索
              </Link>
              <Link href="/companies" className="text-gray-600 hover:text-gray-900">
                鉄道会社
              </Link>
              <Link href="/news" className="text-gray-600 hover:text-gray-900">
                ニュース
              </Link>
              {user && (
                <Link href="/contribute" className="text-gray-600 hover:text-gray-900">
                  情報提供
                </Link>
              )}
              {user ? (
                <div className="flex items-center space-x-2">
                  <Link href="/profile">
                    <Button variant="ghost" size="sm">
                      {user.user_metadata?.display_name || user.email?.split("@")[0] || "プロフィール"}
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link href="/auth">
                  <Button variant="outline" size="sm">
                    ログイン
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヒーローセクション */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            全国のホームドア設置状況を
            <br />
            <span className="text-blue-600">みんなで共有</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">JR・私鉄各社のホームドア設置状況をリアルタイムで確認できます</p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
              <Link href="/stations">
                <MapPin className="mr-2 h-5 w-5" />
                近くの駅を探す
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href={user ? "/contribute" : "/auth"}>情報を提供する</Link>
            </Button>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{"準備中"}</div>
              <div className="text-sm text-gray-600">設置済みホーム数</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{"準備中"}</div>
              <div className="text-sm text-gray-600">工事中ホーム数</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{"準備中"}</div>
              <div className="text-sm text-gray-600">計画中ホーム数</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-600 mb-2">{"準備中"}</div>
              <div className="text-sm text-gray-600">総ホーム数</div>
            </CardContent>
          </Card>
        </div>

        {/* メインコンテンツグリッド */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 最新ニュース */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                最新ニュース
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">{[]}</div>
              <div className="mt-6">
                <Button variant="outline" className="w-full">
                  すべてのニュースを見る
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 鉄道会社別 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Train className="mr-2 h-5 w-5" />
                  鉄道会社別
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Link href="/companies" className="text-sm font-medium hover:text-blue-600 transition-colors">
                      JR東日本
                    </Link>
                    <Badge variant="secondary">89%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <Link href="/companies" className="text-sm font-medium hover:text-blue-600 transition-colors">
                      JR西日本
                    </Link>
                    <Badge variant="secondary">76%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <Link href="/companies" className="text-sm font-medium hover:text-blue-600 transition-colors">
                      東京メトロ
                    </Link>
                    <Badge variant="secondary">95%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <Link href="/companies" className="text-sm font-medium hover:text-blue-600 transition-colors">
                      都営地下鉄
                    </Link>
                    <Badge variant="secondary">88%</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm" asChild>
                  <Link href="/companies">すべての会社を見る</Link>
                </Button>
              </CardContent>
            </Card>

            {/* 地域別 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  地域別設置状況
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">東京都</span>
                    <Badge variant="secondary">92%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">大阪府</span>
                    <Badge variant="secondary">78%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">神奈川県</span>
                    <Badge variant="secondary">65%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">愛知県</span>
                    <Badge variant="secondary">58%</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm">
                  地域別詳細を見る
                </Button>
              </CardContent>
            </Card>

            {/* 情報局について */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  情報局について
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  ホームドア情報局は、全国の鉄道駅におけるホームドア設置状況を みんなで共有するプラットフォームです。
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full" size="sm">
                    情報提供方法
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    利用規約
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    お問い合わせ
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-gray-50 border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">ホームドア情報局</h3>
              <p className="text-sm text-gray-600">全国のホームドア設置状況を共有するプラットフォーム</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">サイト情報</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="/about">このサイトについて</Link>
                </li>
                <li>
                  <Link href="/terms">利用規約</Link>
                </li>
                <li>
                  <Link href="/privacy">プライバシーポリシー</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">機能</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="/stations">駅検索</Link>
                </li>
                <li>
                  <Link href="/companies">鉄道会社</Link>
                </li>
                <li>
                  <Link href="/contribute">情報提供</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">サポート</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="/help">ヘルプ</Link>
                </li>
                <li>
                  <Link href="/contact">お問い合わせ</Link>
                </li>
                <li>
                  <Link href="/feedback">フィードバック</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2024 ホームドア情報局. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
