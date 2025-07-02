// app/auth-test/page.tsx - 認証テストページ（デバッグ用）
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Home } from "lucide-react"
import Link from "next/link"
import { useAuthContext } from "@/components/auth-provider"
import { usePermissions } from "@/hooks/use-permissions"
import { DebugAuth } from "@/components/debug-auth"
import { DebugEnv } from "@/components/debug-env"

export default function AuthTestPage() {
  const { user, loading: authLoading } = useAuthContext()
  const { 
    profile, 
    userRole, 
    loading: permissionsLoading,
    canEditContent,
    canManageUsers,
    canManageNews,
    isAdmin,
    isEditor,
    isContributor
  } = usePermissions()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">認証テスト</h1>
            </div>
            <nav className="flex space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  ホーム
                </Link>
              </Button>
              {!user && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/auth">ログイン</Link>
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">認証システムテスト</h2>
          <p className="text-gray-600">
            認証システムが正しく動作しているかを確認するためのページです
          </p>
        </div>

        {/* 環境変数デバッグ */}
        <DebugEnv />

        {/* 認証デバッグ */}
        <DebugAuth />

        {/* 基本認証状態 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>基本認証状態</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">認証情報</h4>
                <div className="space-y-1 text-sm">
                  <p>認証ローディング: {authLoading ? "✅ 読み込み中" : "❌ 完了"}</p>
                  <p>ユーザー状態: {user ? "✅ ログイン済み" : "❌ 未ログイン"}</p>
                  <p>ユーザーID: {user?.id || "なし"}</p>
                  <p>メールアドレス: {user?.email || "なし"}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">プロフィール情報</h4>
                <div className="space-y-1 text-sm">
                  <p>プロフィールローディング: {permissionsLoading ? "✅ 読み込み中" : "❌ 完了"}</p>
                  <p>プロフィール: {profile ? "✅ 取得済み" : "❌ なし"}</p>
                  <p>ロール: {userRole || "なし"}</p>
                  <p>表示名: {profile?.display_name || "なし"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 権限テスト */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>権限テスト</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">基本権限</h4>
                <div className="space-y-1 text-sm">
                  <p>コンテンツ編集: {canEditContent() ? "✅ 可能" : "❌ 不可"}</p>
                  <p>ユーザー管理: {canManageUsers() ? "✅ 可能" : "❌ 不可"}</p>
                  <p>ニュース管理: {canManageNews() ? "✅ 可能" : "❌ 不可"}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">ロールチェック</h4>
                <div className="space-y-1 text-sm">
                  <p>開発者: {isAdmin() ? "✅ はい" : "❌ いいえ"}</p>
                  <p>編集者: {isEditor() ? "✅ はい" : "❌ いいえ"}</p>
                  <p>提供者: {isContributor() ? "✅ はい" : "❌ いいえ"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ナビゲーションテスト */}
        <Card>
          <CardHeader>
            <CardTitle>ナビゲーションテスト</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="outline" asChild>
                <Link href="/profile">プロフィール</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contribute">情報提供</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin">管理画面</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/news">ニュース管理</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/users">ユーザー管理</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/auth">認証ページ</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}