// components/admin-layout.tsx - 新規作成  
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Settings, 
  Building2, 
  Train, 
  MapPin, 
  FileText, 
  Users, 
  Shield, 
  AlertCircle,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { usePermissions } from "@/hooks/use-permissions"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { CommonHeader } from "./common-header"

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const { isAdmin, loading } = usePermissions()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAdmin()) {
      router.push("/")
    }
  }, [loading, isAdmin, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Settings className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">アクセス権限がありません</h2>
            <p className="text-gray-600 mb-4">この機能は開発者のみ利用できます</p>
            <Button asChild>
              <Link href="/">ホームに戻る</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

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

// 管理画面サイドバーコンポーネント
export function AdminSidebar() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="mr-2 h-5 w-5" />
          管理メニュー
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* 基本管理機能 */}
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            コンテンツ管理
          </div>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/news">
              <FileText className="mr-2 h-4 w-4" />
              ニュース管理
            </Link>
          </Button>

          {/* 鉄道関連管理 */}
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 mt-6">
            鉄道情報管理
          </div>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/companies">
              <Building2 className="mr-2 h-4 w-4" />
              鉄道会社管理
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/lines">
              <Train className="mr-2 h-4 w-4" />
              路線管理
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/stations">
              <MapPin className="mr-2 h-4 w-4" />
              駅管理
            </Link>
          </Button>

          {/* システム管理 */}
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 mt-6">
            システム管理
          </div>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/door-types">
              <Settings className="mr-2 h-4 w-4" />
              ホームドア設定
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/users">
              <Users className="mr-2 h-4 w-4" />
              ユーザー管理
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin/roles">
              <Shield className="mr-2 h-4 w-4" />
              権限設定
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}