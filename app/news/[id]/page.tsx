// app/news/[id]/page.tsx - Client Component版
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase, type News } from "@/lib/supabase"

// 関連ニュース用の型定義
interface RelatedNews {
  id: string
  title: string
  summary?: string
  published_at?: string
  created_at: string
}

interface NewsDetailPageProps {
  params: {
    id: string
  }
}

export default function NewsDetailPage({ params }: NewsDetailPageProps) {
  const router = useRouter()
  const [news, setNews] = useState<News | null>(null)
  const [relatedNews, setRelatedNews] = useState<RelatedNews[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // ニュース詳細を取得する関数
  const getNewsById = async (id: string): Promise<News | null> => {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("id", id)
        .eq("status", "公開")
        .single()

      if (error) {
        console.error("Error fetching news:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Database connection error:", error)
      return null
    }
  }

  // 関連ニュースを取得する関数
  const getRelatedNews = async (currentId: string, limit = 3): Promise<RelatedNews[]> => {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("id, title, summary, published_at, created_at")
        .eq("status", "公開")
        .neq("id", currentId)
        .order("published_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Error fetching related news:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Database connection error:", error)
      return []
    }
  }

  // 共有機能
  const handleShare = () => {
    if (!news) return

    if (navigator.share) {
      navigator.share({
        title: news.title,
        text: news.summary || news.title,
        url: window.location.href
      }).catch((error) => {
        console.log('Error sharing:', error)
        // フォールバック：クリップボードにコピー
        copyToClipboard()
      })
    } else {
      copyToClipboard()
    }
  }

  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('URLをクリップボードにコピーしました')
      }).catch(() => {
        fallbackCopyTextToClipboard(window.location.href)
      })
    } else {
      fallbackCopyTextToClipboard(window.location.href)
    }
  }

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea")
    textArea.value = text
    textArea.style.top = "0"
    textArea.style.left = "0"
    textArea.style.position = "fixed"
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      const successful = document.execCommand('copy')
      if (successful) {
        alert('URLをクリップボードにコピーしました')
      } else {
        alert('コピーに失敗しました')
      }
    } catch (err) {
      alert('コピーに失敗しました')
    }

    document.body.removeChild(textArea)
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      const newsData = await getNewsById(params.id)
      
      if (!newsData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setNews(newsData)
      const related = await getRelatedNews(params.id)
      setRelatedNews(related)
      setLoading(false)
    }

    fetchData()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (notFound || !news) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* ヘッダー */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">ニュース詳細</h1>
              </div>
              <nav className="flex space-x-4">
                <Button variant="ghost" asChild>
                  <Link href="/news">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    ニュース一覧
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/">ホーム</Link>
                </Button>
              </nav>
            </div>
          </div>
        </header>

        {/* エラー表示 */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-12 px-6">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                記事が見つかりません
              </h1>
              <p className="text-gray-600 mb-8 leading-relaxed">
                お探しのニュース記事は削除されたか、非公開になった可能性があります。
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/news">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    ニュース一覧に戻る
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">ニュース詳細</h1>
            </div>
            <nav className="flex space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/news">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  ニュース一覧
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/">ホーム</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth">ログイン</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-8">
                {/* ヘッダー情報 */}
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    {news.title}
                  </h1>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {news.published_at 
                          ? new Date(news.published_at).toLocaleDateString("ja-JP", {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : new Date(news.created_at).toLocaleDateString("ja-JP", {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                        }
                      </div>
                      <Badge variant="outline">
                        {news.status}
                      </Badge>
                    </div>
                    
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      共有
                    </Button>
                  </div>

                  {/* 要約 */}
                  {news.summary && (
                    <div className="p-4 bg-blue-50 rounded-lg mb-6">
                      <p className="text-blue-900 font-medium">
                        {news.summary}
                      </p>
                    </div>
                  )}
                </div>

                {/* 本文 */}
                <div className="prose max-w-none">
                  <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {news.content}
                  </div>
                </div>

                {/* フッター */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <Button variant="outline" asChild>
                      <Link href="/news">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        ニュース一覧に戻る
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 関連ニュース */}
            {relatedNews.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">関連ニュース</h3>
                  <div className="space-y-4">
                    {relatedNews.map((article) => (
                      <div key={article.id} className="pb-4 border-b last:border-b-0">
                        <Link 
                          href={`/news/${article.id}`}
                          className="group"
                        >
                          <h4 className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                            {article.title}
                          </h4>
                        </Link>
                        {article.summary && (
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {article.summary}
                          </p>
                        )}
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {article.published_at 
                            ? new Date(article.published_at).toLocaleDateString("ja-JP")
                            : new Date(article.created_at).toLocaleDateString("ja-JP")
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ナビゲーション */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">サイトナビゲーション</h3>
                <div className="space-y-2">
                  <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                    <Link href="/stations">駅検索</Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                    <Link href="/companies">事業者別一覧</Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                    <Link href="/contribute">情報提供</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}