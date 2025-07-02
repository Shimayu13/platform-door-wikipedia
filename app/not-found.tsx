// app/not-found.tsx - 404エラーページ
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Train, Home, ArrowLeft, Search } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <Card>
          <CardContent className="text-center py-12 px-6">
            {/* アイコン */}
            <div className="mb-6">
              <Train className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <div className="text-6xl font-bold text-gray-300 mb-2">404</div>
            </div>

            {/* メッセージ */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              ページが見つかりません
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              お探しのページは削除されたか、URLが変更された可能性があります。
              ホームページから改めてお探しください。
            </p>

            {/* アクションボタン */}
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  ホームページに戻る
                </Link>
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/stations">
                    <Search className="h-4 w-4 mr-1" />
                    駅検索
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/news">
                    ニュース
                  </Link>
                </Button>
              </div>
            </div>

            {/* フッター */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                問題が解決しない場合は、URLをご確認ください。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}