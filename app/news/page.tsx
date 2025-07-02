// app/news/page.tsx - ニュース一覧ページ
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { getNews, type News } from "@/lib/supabase"

export default async function NewsPage() {
  const news = await getNews(50) // 最新50件のニュースを取得

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">ニュース</h1>
            </div>
            <nav className="flex space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  ホーム
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/stations">駅検索</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/companies">事業者別</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/contribute">情報提供</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth">ログイン</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">ニュース一覧</h2>
          <p className="text-gray-600">
            ホームドア設置に関する最新情報をお届けします
          </p>
        </div>

        {news && news.length > 0 ? (
          <div className="space-y-6">
            {news.map((article: News) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Link 
                        href={`/news/${article.id}`}
                        className="group"
                      >
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                          {article.title}
                        </h3>
                      </Link>
                      
                      {article.summary && (
                        <p className="text-gray-600 mb-3 leading-relaxed">
                          {article.summary}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
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
                        </div>
                        <Badge variant="outline">
                          {article.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/news/${article.id}`}>
                        詳細を見る
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ニュース記事がありません
              </h3>
              <p className="text-gray-600 mb-6">
                現在公開されているニュース記事はありません。
              </p>
              <Button asChild>
                <Link href="/">ホームに戻る</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}