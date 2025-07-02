// app/news/[id]/not-found.tsx - ニュース記事が見つからない場合のページ
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, ArrowLeft, Home } from "lucide-react"
import Link from "next/link"

export default function NewsNotFound() {
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

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12 px-6">
            {/* アイコン */}
            <div className="mb-6">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            </div>

            {/* メッセージ */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              記事が見つかりません
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              お探しのニュース記事は削除されたか、非公開になった可能性があります。
              他のニュース記事をご覧ください。
            </p>

            {/* アクションボタン */}
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/news">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  ニュース一覧に戻る
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  ホームページに戻る
                </Link>
              </Button>
            </div>

            {/* フッター */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                最新のニュースは一覧ページでご確認いただけます。
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}