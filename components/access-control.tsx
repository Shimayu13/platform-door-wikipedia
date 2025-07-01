// components/access-control.tsx - 新規作成

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Lock } from "lucide-react"
import Link from "next/link"
import { usePermissions } from "@/hooks/use-permissions"
import { Permission, hasPermission, UserRole } from "@/lib/permissions"

interface AccessControlProps {
  children: React.ReactNode
  requiredPermission?: Permission
  requiredRole?: UserRole
  fallbackPath?: string
  customMessage?: string
}

export function AccessControl({ 
  children, 
  requiredPermission,
  requiredRole,
  fallbackPath = "/",
  customMessage
}: AccessControlProps) {
  const { user, profile, loading } = usePermissions()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
      return
    }

    if (!loading && profile) {
      const userRole = profile.role as UserRole
      
      // 権限チェック
      if (requiredPermission && !hasPermission(userRole, requiredPermission)) {
        router.push(fallbackPath)
        return
      }
      
      // ロールレベルチェック
      if (requiredRole) {
        const roleHierarchy: Record<UserRole, number> = {
          "閲覧者": 1,
          "提供者": 2,
          "編集者": 3,
          "開発者": 4
        }
        
        if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
          router.push(fallbackPath)
          return
        }
      }
    }
  }, [user, profile, loading, requiredPermission, requiredRole, router, fallbackPath])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Lock className="h-8 w-8 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">認証確認中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">ログインが必要です</h2>
            <p className="text-gray-600 mb-4">この機能を利用するにはログインしてください</p>
            <Button asChild>
              <Link href="/auth">ログイン</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (profile) {
    const userRole = profile.role as UserRole
    
    // 権限チェック
    if (requiredPermission && !hasPermission(userRole, requiredPermission)) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-8">
              <Lock className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">アクセス権限がありません</h2>
              <p className="text-gray-600 mb-4">
                {customMessage || "この機能を利用する権限がありません"}
              </p>
              <div className="space-y-2">
                <Alert>
                  <AlertDescription>
                    現在のロール: <strong>{userRole}</strong>
                  </AlertDescription>
                </Alert>
                <Button asChild>
                  <Link href={fallbackPath}>戻る</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
    
    // ロールレベルチェック
    if (requiredRole) {
      const roleHierarchy: Record<UserRole, number> = {
        "閲覧者": 1,
        "提供者": 2,
        "編集者": 3,
        "開発者": 4
      }
      
      if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardContent className="text-center py-8">
                <Lock className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">アクセス権限がありません</h2>
                <p className="text-gray-600 mb-4">
                  {customMessage || `この機能は${requiredRole}以上のロールが必要です`}
                </p>
                <div className="space-y-2">
                  <Alert>
                    <AlertDescription>
                      現在のロール: <strong>{userRole}</strong> | 必要なロール: <strong>{requiredRole}</strong>
                    </AlertDescription>
                  </Alert>
                  <Button asChild>
                    <Link href={fallbackPath}>戻る</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }
    }
  }

  return <>{children}</>
}

// 特定の管理機能用のコンポーネント
export function AdminAccessControl({ children }: { children: React.ReactNode }) {
  return (
    <AccessControl 
      requiredRole="編集者"
      customMessage="管理機能は編集者以上のロールが必要です"
      fallbackPath="/"
    >
      {children}
    </AccessControl>
  )
}

export function DeveloperAccessControl({ children }: { children: React.ReactNode }) {
  return (
    <AccessControl 
      requiredRole="開発者"
      customMessage="この機能は開発者のみ利用できます"
      fallbackPath="/admin"
    >
      {children}
    </AccessControl>
  )
}

export function LineManagementAccess({ children }: { children: React.ReactNode }) {
  return (
    <AccessControl 
      requiredPermission={Permission.MANAGE_LINES}
      customMessage="路線管理機能は編集者以上のロールが必要です"
      fallbackPath="/admin"
    >
      {children}
    </AccessControl>
  )
}

export function StationManagementAccess({ children }: { children: React.ReactNode }) {
  return (
    <AccessControl 
      requiredPermission={Permission.MANAGE_STATIONS}
      customMessage="駅管理機能は編集者以上のロールが必要です"
      fallbackPath="/admin"
    >
      {children}
    </AccessControl>
  )
}