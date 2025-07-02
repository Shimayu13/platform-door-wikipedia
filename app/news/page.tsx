// app/page.tsx - Server Component版（認証修正済み）
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Clock, TrendingUp, Calendar, ArrowRight, Train } from "lucide-react"
import Link from "next/link"
import { getNews, getStationStats, type News } from "@/lib/supabase"
import { DynamicHeader } from "@/components/dynamic-header"

export default async function HomePage() {
  // 統計データとニュースを並行取得
  const [stats, news] = await Promise.all([
    getStationStats(), // getStats() の代わりに getStationStats() を使用
    getNews(5) // 最新5件のニュースを取得
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 動的ヘッダー */}
      <DynamicHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヒーローセクション */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            全国のホームドア設置状況を一覧
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            鉄道駅のホームドア（可動式ホーム柵）の設置状況を網羅的に収集・公開しています。
            最新の設置状況や工事予定をリアルタイムでお届けします。
          </p>
        </div>

        {/* 統計概要 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats?.total?.toLocaleString() || "-"}
            </div>
            <div className="text-sm text-gray-600">総プラットフォーム数</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {(stats?.operating + stats?.installed)?.toLocaleString() || "-"}
            </div>
            <div className="text-sm text-gray-600">設置済み</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {(stats?.restored + stats?.temporary)?.toLocaleString() || "-"}
            </div>
            <div className="text-sm text-gray-600">工事中</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats?.notInstalled?.toLocaleString() || "-"}
            </div>
            <div className="text-sm text-gray-600">未設置</div>
          </div>
        </div>

        {/* 最新情報 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                最新ニュース
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {news && news.length > 0 ? (
                  news.slice(0, 3).map((article: News) => (
                    <div key={article.id} className="flex items-start space-x-3 pb-3 border-b last:border-b-0">
                      <Calendar className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-600">
                          {article.published_at 
                            ? new Date(article.published_at).toLocaleDateString("ja-JP", {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : new Date(article.created_at).toLocaleDateString("ja-JP", {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                          }
                        </p>
                        <Link 
                          href={`/news/${article.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {article.title}
                        </Link>
                        {article.summary && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {article.summary}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-start space-x-3">
                    <Clock className="h-4 w-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">システム情報</p>
                      <p className="font-medium">データベースが正常に稼働中です</p>
                    </div>
                  </div>
                )}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/news">
                  すべてのニュースを見る
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                注目の動向
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    全国的にホームドア設置が加速
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    安全性向上のため各社で整備計画が進行中
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-900">
                    情報提供者数が増加中
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    より正確で最新の情報が集まっています
                  </p>
                </div>
                {stats && stats.total > 0 && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-900">
                      全体の設置率: {(((stats.operating + stats.installed) / stats.total) * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-purple-700 mt-1">
                      継続的に設置が進んでいます
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* クイックアクセス */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>クイックアクセス</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" asChild>
                  <Link href="/stations">
                    <Train className="h-8 w-8 text-blue-600" />
                    <div className="text-center">
                      <div className="font-semibold">駅検索</div>
                      <div className="text-sm text-gray-600">駅名で検索</div>
                    </div>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" asChild>
                  <Link href="/companies">
                    <Train className="h-8 w-8 text-green-600" />
                    <div className="text-center">
                      <div className="font-semibold">事業者別</div>
                      <div className="text-sm text-gray-600">鉄道会社一覧</div>
                    </div>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" asChild>
                  <Link href="/contribute">
                    <FileText className="h-8 w-8 text-purple-600" />
                    <div className="text-center">
                      <div className="font-semibold">情報提供</div>
                      <div className="text-sm text-gray-600">データ入力・更新</div>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 ホームドア情報局. All rights reserved.</p>
            <p className="mt-2 text-sm">
              全国のホームドア設置状況を共有するプラットフォーム
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}