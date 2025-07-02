// components/dynamic-header.tsx - 修正版（ログアウト機能強化）
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Train, User, Settings, LogOut, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/components/auth-provider"
import { usePermissions } from "@/hooks/use-permissions"
import { signOut } from "@/lib/auth"

export function DynamicHeader() {
  const router = useRouter()
  const { user, loading } = useAuthContext()
  const { isAdmin, isEditor, profile, loading: permissionsLoading } = usePermissions()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    
    try {
      const result = await signOut()
      
      if (result.success) {
        // ログアウト成功時は即座にログインページへリダイレクト
        router.push("/auth")
      } else {
        console.error("Sign out failed:", result.error)
        // エラーが発生してもページ更新でログアウト状態になる可能性があるため更新
        window.location.reload()
      }
    } catch (error) {
      console.error("Sign out error:", error)
      // エラーが発生してもページ更新でログアウト状態になる可能性があるため更新
      window.location.reload()
    } finally {
      setIsSigningOut(false)
    }
  }

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
                
                {/* ユーザーメニュー（ドロップダウン） */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {profile?.display_name || user.email?.split('@')[0] || 'ユーザー'}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm font-medium">
                      {user.email}
                    </div>
                    <div className="px-2 py-1.5 text-xs text-gray-500">
                      {profile?.role || '一般ユーザー'}
                    </div>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        プロフィール
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/profile/change-password">
                        <Settings className="mr-2 h-4 w-4" />
                        パスワード変更
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {isSigningOut ? "ログアウト中..." : "ログアウト"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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