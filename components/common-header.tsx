// components/common-header.tsx - 新規作成
"use client"

import { Button } from "@/components/ui/button"
import { Train, Settings } from "lucide-react"
import Link from "next/link"
import { usePermissions } from "@/hooks/use-permissions"
import { useAuthContext } from "@/components/auth-provider"

interface CommonHeaderProps {
  title?: string
  subtitle?: string
  icon?: React.ReactNode
  showBackToAdmin?: boolean
}

export function CommonHeader({ 
  title = "ホームドア情報局", 
  subtitle,
  icon,
  showBackToAdmin = false 
}: CommonHeaderProps) {
  const { user } = useAuthContext()
  const { isAdmin, loading } = usePermissions()

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            {icon || <Train className="h-8 w-8 text-blue-600" />}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
          </div>
          <nav className="flex space-x-4">
            {showBackToAdmin && (
              <Button variant="ghost" asChild>
                <Link href="/admin">
                  <Settings className="h-4 w-4 mr-2" />
                  管理画面
                </Link>
              </Button>
            )}
            <Button variant="ghost" asChild>
              <Link href="/">ホーム</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/stations">駅検索</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/companies">鉄道会社</Link>
            </Button>
            {user && (
              <Button variant="ghost" asChild>
                <Link href="/contribute">情報提供</Link>
              </Button>
            )}
            {/* 管理画面へのリンク（開発者のみ） */}
            {!loading && isAdmin() && !showBackToAdmin && (
              <Button variant="ghost" asChild>
                <Link href="/admin">
                  <Settings className="h-4 w-4 mr-2" />
                  管理画面
                </Link>
              </Button>
            )}
            {user ? (
              <Button variant="ghost" asChild>
                <Link href="/profile">プロフィール</Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth">ログイン</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}