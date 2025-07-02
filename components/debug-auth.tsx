// components/debug-auth.tsx - 認証デバッグコンポーネント（必要に応じて使用）
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuthContext } from "@/components/auth-provider"
import { usePermissions } from "@/hooks/use-permissions"
import { supabase } from "@/lib/auth"

export function DebugAuth() {
  const { user, loading: authLoading } = useAuthContext()
  const { profile, loading: permissionsLoading } = usePermissions()
  const [sessionInfo, setSessionInfo] = useState<any>(null)

  useEffect(() => {
    const getSessionInfo = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      setSessionInfo({ session, error })
    }
    getSessionInfo()
  }, [])

  const handleRefreshAuth = async () => {
    const { data, error } = await supabase.auth.refreshSession()
    console.log("Refresh result:", { data, error })
    window.location.reload()
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Sign out error:", error)
    } else {
      window.location.reload()
    }
  }

  return (
    <Card className="mb-8 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-yellow-800">認証デバッグ情報</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-yellow-900">認証状態</h4>
            <p>Auth Loading: {authLoading ? "true" : "false"}</p>
            <p>User ID: {user?.id || "null"}</p>
            <p>User Email: {user?.email || "null"}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-yellow-900">プロフィール状態</h4>
            <p>Profile Loading: {permissionsLoading ? "true" : "false"}</p>
            <p>Profile Role: {profile?.role || "null"}</p>
            <p>Profile Name: {profile?.display_name || "null"}</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-yellow-900">セッション情報</h4>
          <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
            {JSON.stringify(sessionInfo, null, 2)}
          </pre>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefreshAuth}>
            認証更新
          </Button>
          <Button variant="destructive" size="sm" onClick={handleSignOut}>
            ログアウト
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}