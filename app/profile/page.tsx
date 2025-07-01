"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useAuthContext } from "@/components/auth-provider"
import { getOrCreateUserProfile, updateUserProfile, signOut, type UserProfile } from "@/lib/auth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ROLE_DESCRIPTIONS, ROLE_COLORS, type UserRole } from "@/lib/permissions"
import {
  Train,
  User,
  Mail,
  Calendar,
  Shield,
  CheckCircle,
  AlertCircle,
  Save,
  Lock,     // ✅ 追加
  Crown,    // ✅ 追加
  Settings  // ✅ 追加
} from "lucide-react"


export default function ProfilePage() {
  const { user, loading: authLoading } = useAuthContext()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [formData, setFormData] = useState({
    display_name: "",
    username: "",
    bio: "",
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
      return
    }

    if (user) {
      loadProfile()
    }
  }, [user, authLoading, router])

  const loadProfile = async () => {
    if (!user) return

    try {
      // getOrCreateUserProfile を使用してプロフィールを取得または作成
      const profileData = await getOrCreateUserProfile(user.id, user.email)
      if (profileData) {
        setProfile(profileData)
        setFormData({
          display_name: profileData.display_name || "",
          username: profileData.username || "",
          bio: profileData.bio || "",
        })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      setMessage({ type: "error", text: "プロフィールの読み込みに失敗しました" })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setMessage(null)

    const result = await updateUserProfile(user.id, {
      display_name: formData.display_name,
      username: formData.username,
      bio: formData.bio,
    })

    if (result.success) {
      setMessage({ type: "success", text: "プロフィールを更新しました" })
      loadProfile() // プロフィールを再読み込み
    } else {
      setMessage({ type: "error", text: "プロフィールの更新に失敗しました" })
    }

    setSaving(false)
  }

  const handleSignOut = async () => {
    const result = await signOut()
    if (result.success) {
      router.push("/")
    }
  }

  const getRoleBadgeClass = (role: UserRole) => {
    return ROLE_COLORS[role] || "bg-gray-100 text-gray-800"
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Train className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Train className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">ホームドア情報局</h1>
            </div>
            <nav className="flex space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/">ホーム</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/stations">駅検索</Link>
              </Button>
              {profile?.role === "開発者" && (
                <Button variant="ghost" asChild>
                  <Link href="/admin">管理画面</Link>
                </Button>
              )}
              <Button variant="outline" onClick={handleSignOut}>
                ログアウト
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">プロフィール</h2>
          <p className="text-gray-600">アカウント情報を管理できます</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* プロフィール情報 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>プロフィール編集</CardTitle>
                <CardDescription>公開される情報を編集できます</CardDescription>
              </CardHeader>
              <CardContent>
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

                <form onSubmit={handleSave} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="display_name">表示名</Label>
                    <Input
                      id="display_name"
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      placeholder="表示名を入力"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">ユーザー名</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="ユーザー名を入力（英数字のみ）"
                    />
                    <p className="text-sm text-gray-500">他のユーザーがあなたを識別するためのユニークな名前です</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">自己紹介</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="自己紹介を入力"
                      rows={4}
                    />
                  </div>

                  <Button type="submit" disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "保存中..." : "保存"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* アカウント情報 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  アカウント情報
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Mail className="mr-2 h-4 w-4" />
                      メールアドレス
                    </div>
                    <p className="font-medium">{user.email}</p>
                  </div>

                  {profile && (
                    <>
                      <div>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Calendar className="mr-2 h-4 w-4" />
                          登録日
                        </div>
                        <p className="font-medium">{new Date(profile.created_at).toLocaleDateString("ja-JP")}</p>
                      </div>

                      <div>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Shield className="mr-2 h-4 w-4" />
                          ユーザーロール
                        </div>
                        <Badge className={`${getRoleBadgeClass(profile.role)} mb-2`}>{profile.role}</Badge>
                        <p className="text-xs text-gray-500">{ROLE_DESCRIPTIONS[profile.role]}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* セキュリティ情報 */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    セキュリティ
                  </CardTitle>
                  <CardDescription>アカウントのセキュリティ設定</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">パスワード</h4>
                        <p className="text-sm text-gray-600">最終更新: 不明</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/profile/change-password">
                          <Lock className="h-4 w-4 mr-2" />
                          変更
                        </Link>
                      </Button>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-1">セキュリティのヒント</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• 定期的にパスワードを変更しましょう</li>
                        <li>• 他のサービスとは異なるパスワードを使用しましょう</li>
                        <li>• 6文字以上の複雑なパスワードを設定しましょう</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ロール情報 */}
              <Card className="mt-6">
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
                      <Badge className={getRoleBadgeClass(profile?.role || "閲覧者")}>
                        {profile?.role || "閲覧者"}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      {ROLE_DESCRIPTIONS[profile?.role || "閲覧者"]}
                    </p>

                    {(profile?.role === "編集者" || profile?.role === "開発者") && (
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
            </div>

            {/* 権限情報 */}
            {profile && (
              <Card>
                <CardHeader>
                  <CardTitle>利用可能な機能</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>サイト閲覧</span>
                    </div>
                    {(profile.role === "提供者" || profile.role === "編集者" || profile.role === "開発者") && (
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>駅情報の入力・更新</span>
                      </div>
                    )}
                    {(profile.role === "編集者" || profile.role === "開発者") && (
                      <>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>情報の削除・編集</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>ニュース管理</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>レイアウト変更</span>
                        </div>
                      </>
                    )}
                    {profile.role === "開発者" && (
                      <>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>ユーザー管理</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>ロール変更</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>システム管理</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 活動統計 */}
            <Card>
              <CardHeader>
                <CardTitle>活動統計</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">情報更新回数</span>
                    <span className="font-medium">0回</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">投稿したニュース</span>
                    <span className="font-medium">0件</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">貢献ポイント</span>
                    <span className="font-medium">0pt</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* アカウント設定 */}
            <Card>
              <CardHeader>
                <CardTitle>アカウント設定</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full" size="sm">
                    パスワード変更
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    メール設定
                  </Button>
                  <Button variant="destructive" className="w-full" size="sm" onClick={handleSignOut}>
                    ログアウト
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
