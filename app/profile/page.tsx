// app/profile/page.tsx - 修正版（ログアウト機能付き）

"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  User, 
  Settings, 
  Crown, 
  CheckCircle, 
  AlertCircle,
  Mail,
  Calendar,
  MapPin,
  LogOut,
  Shield,
  Key
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePermissions } from "@/hooks/use-permissions"
import { canAccessAdmin, ROLE_DESCRIPTIONS, ROLE_COLORS } from "@/lib/permissions"
import { CommonHeader } from "@/components/common-header"
import { signOut } from "@/lib/auth"

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, loading } = usePermissions()
  const [isEditing, setIsEditing] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    bio: ""
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || profile.display_name || "",
        location: profile.location || "",
        bio: profile.bio || ""
      })
    }
  }, [profile])

  const getRoleBadgeClass = (role: string) => {
    return ROLE_COLORS[role as keyof typeof ROLE_COLORS] || "bg-gray-100 text-gray-800"
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    setMessage(null)

    try {
      const result = await signOut()
      
      if (result.success) {
        setMessage({
          type: "success",
          text: "正常にログアウトしました"
        })
        
        // 1秒後にログインページにリダイレクト
        setTimeout(() => {
          router.push("/auth")
        }, 1000)
      } else {
        setMessage({
          type: "error",
          text: result.error || "ログアウトに失敗しました"
        })
        setIsSigningOut(false)
      }
    } catch (error) {
      console.error("Logout error:", error)
      setMessage({
        type: "error",
        text: "予期しないエラーが発生しました"
      })
      setIsSigningOut(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">プロフィール情報を取得できません</h2>
            <p className="text-gray-600 mb-4">再度ログインしてください</p>
            <Button asChild>
              <Link href="/auth">ログイン</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CommonHeader 
        title="プロフィール - ホームドア情報局" 
        subtitle="ユーザープロフィールと設定"
        icon={<User className="h-8 w-8 text-blue-600" />}
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* メッセージ表示 */}
        {message && (
          <Alert className={`mb-6 ${message.type === "error" ? "border-red-200" : "border-green-200"}`}>
            {message.type === "error" ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            <AlertDescription className={message.type === "error" ? "text-red-700" : "text-green-700"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインプロフィール */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  基本情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {profile.name || profile.display_name || "名前未設定"}
                    </h3>
                    <p className="text-gray-600 flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {user.email}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getRoleBadgeClass(profile.role)}>
                        {profile.role}
                      </Badge>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        登録日: {new Date(profile.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {!isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(true)}
                        className="mb-4"
                      >
                        プロフィール編集
                      </Button>
                    </div>
                    
                    {formData.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {formData.location}
                      </div>
                    )}
                    
                    {formData.bio && (
                      <div className="text-sm text-gray-700">
                        <p className="font-medium mb-1">自己紹介</p>
                        <p>{formData.bio}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">表示名</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="表示名"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">所在地</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="例：東京都"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">自己紹介</Label>
                      <Input
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="簡単な自己紹介"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button>保存</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        キャンセル
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* アクセス権限カード */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="mr-2 h-5 w-5" />
                  アクセス権限
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">現在のロール</span>
                    <Badge className={getRoleBadgeClass(profile.role)}>
                      {profile.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    {ROLE_DESCRIPTIONS[profile.role as keyof typeof ROLE_DESCRIPTIONS]}
                  </p>

                  {/* 管理画面ボタン */}
                  {canAccessAdmin(profile.role as any) && (
                    <div className="pt-3 border-t">
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link href="/admin">
                          <Settings className="h-4 w-4 mr-2" />
                          管理画面
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* アカウント設定カード */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  アカウント設定
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* パスワード変更 */}
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/profile/change-password">
                    <Key className="h-4 w-4 mr-2" />
                    パスワード変更
                  </Link>
                </Button>

                {/* パスワード再設定 */}
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/auth/forgot-password">
                    <Shield className="h-4 w-4 mr-2" />
                    パスワード再設定
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* ログアウトカード */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center text-red-700">
                  <LogOut className="mr-2 h-5 w-5" />
                  ログアウト
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  アカウントからログアウトします
                </p>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {isSigningOut ? "ログアウト中..." : "ログアウト"}
                </Button>
              </CardContent>
            </Card>

            {/* 統計情報カード */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  アクティビティ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">最終ログイン</span>
                    <span>{new Date(user.last_sign_in_at || user.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">アカウント作成</span>
                    <span>{new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}