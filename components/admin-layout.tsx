// components/admin-layout.tsx - 完全版

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  Building2, 
  Train, 
  MapPin, 
  FileText, 
  Users, 
  Shield,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { usePermissions } from "@/hooks/use-permissions"
import { 
  canAccessAdmin, 
  canManageLines, 
  canManageStations, 
  canManageUsers,
  canManageNews,
  hasPermission, 
  Permission 
} from "@/lib/permissions"
import { CommonHeader } from "./common-header"

// AdminLayoutコンポーネント
interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <CommonHeader 
        title={title || "ホームドア情報局 - 管理画面"} 
        subtitle={subtitle}
        icon={<Settings className="h-8 w-8 text-blue-600" />}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  )
}

// AdminSidebarコンポーネント
export function AdminSidebar() {
  const { user, profile } = usePermissions()
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    if (profile?.role) {
      setUserRole(profile.role)
    }
  }, [profile])

  if (!userRole) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-gray-500">読み込み中...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="mr-2 h-5 w-5" />
          管理メニュー
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{userRole}</Badge>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* 基本管理機能 */}
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            コンテンツ管理
          </div>
          
          {canManageNews(userRole as any) && (
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin/news">
                <FileText className="mr-2 h-4 w-4" />
                ニュース管理
              </Link>
            </Button>
          )}

          {/* 鉄道関連管理 - 編集者以上がアクセス可能 */}
          {canAccessAdmin(userRole as any) && (
            <>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 mt-6">
                鉄道情報管理
              </div>
              
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/admin/companies">
                  <Building2 className="mr-2 h-4 w-4" />
                  鉄道会社管理
                </Link>
              </Button>
              
              {canManageLines(userRole as any) && (
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/admin/lines">
                    <Train className="mr-2 h-4 w-4" />
                    路線管理
                  </Link>
                </Button>
              )}
              
              {canManageStations(userRole as any) && (
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/admin/stations">
                    <MapPin className="mr-2 h-4 w-4" />
                    駅管理
                  </Link>
                </Button>
              )}
            </>
          )}

          {/* システム管理 - 開発者のみ */}
          {userRole === "開発者" && (
            <>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 mt-6">
                システム管理
              </div>
              
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/admin/door-types">
                  <Settings className="mr-2 h-4 w-4" />
                  ホームドア設定
                </Link>
              </Button>
              
              {canManageUsers(userRole as any) && (
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/admin/users">
                    <Users className="mr-2 h-4 w-4" />
                    ユーザー管理
                  </Link>
                </Button>
              )}
              
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/admin/roles">
                  <Shield className="mr-2 h-4 w-4" />
                  権限設定
                </Link>
              </Button>
            </>
          )}

          {/* 権限情報の表示 */}
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 mt-6">
            現在の権限
          </div>
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
            <div className="space-y-1">
              <div>✓ コンテンツ閲覧</div>
              {(userRole === "提供者" || userRole === "編集者" || userRole === "開発者") && (
                <div>✓ 駅情報入力・更新</div>
              )}
              {canAccessAdmin(userRole as any) && (
                <>
                  <div>✓ 管理機能</div>
                  <div>✓ 路線・駅管理</div>
                </>
              )}
              {userRole === "開発者" && (
                <div>✓ システム管理</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}