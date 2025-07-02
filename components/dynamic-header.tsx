// components/dynamic-header.tsx - 動的ヘッダーコンポーネント
"use client"

import { Button } from "@/components/ui/button"
import { Train, User, Settings } from "lucide-react"
import Link from "next/link"
import { useAuthContext } from "@/components/auth-provider"
import { usePermissions } from "@/hooks/use-permissions"

export function DynamicHeader() {
  const { user, loading } = useAuthContext()
  const { isAdmin, isEditor, loading: permissionsLoading } = usePermissions()

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Train className="h-8 w-8 text-blue-600" />
            <Link href="/">
              <h1 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                ホームドア情報局
              </h1>
            </Link>
          </div>
          
          <nav className="flex space-x-4 items-center">
            <Button variant="ghost" asChild>
              <Link href="/stations">駅検索</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/companies">事業者別</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/news">ニュース</Link>
            </Button>
            
            {/* ログイン状態に応じて表示切り替え */}
            {loading || permissionsLoading ? (
              // ローディング中
              <div className="flex space-x-4">
                <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : user ? (
              // ログイン済み
              <>
                <Button variant="ghost" asChild>
                  <Link href="/contribute">情報提供</Link>
                </Button>
                
                {/* 管理画面へのリンク（編集者以上） */}
                {!permissionsLoading && (isAdmin() || isEditor()) && (
                  <Button variant="ghost" asChild>
                    <Link href="/admin">
                      <Settings className="h-4 w-4 mr-2" />
                      管理画面
                    </Link>
                  </Button>
                )}
                
                <Button variant="ghost" asChild>
                  <Link href="/profile">
                    <User className="h-4 w-4 mr-2" />
                    プロフィール
                  </Link>
                </Button>
              </>
            ) : (
              // 未ログイン
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/auth">ログイン</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}