"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Train, Users, Shield, AlertCircle, CheckCircle, Settings, FileText, Building2, MapPin } from "lucide-react"
import { usePermissions } from "@/hooks/use-permissions"
import { getAllUsers, changeUserRole, type UserProfile } from "@/lib/auth"
import { ROLE_COLORS, ROLE_DESCRIPTIONS, type UserRole } from "@/lib/permissions"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AdminPage() {
  const { userRole, loading: permissionsLoading, isAdmin } = usePermissions()
  const router = useRouter()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (!permissionsLoading && !isAdmin()) {
      router.push("/")
      return
    }

    if (userRole) {
      loadUsers()
    }
  }, [userRole, permissionsLoading, isAdmin, router])

  const loadUsers = async () => {
    if (!userRole) return

    try {
      const result = await getAllUsers(userRole)
      if (result.success && result.data) {
        // 型チェックを追加してからセット
        const userData = Array.isArray(result.data) ? result.data : []
        setUsers(userData)
      } else {
        setMessage({ type: "error", text: result.error || "ユーザー一覧の取得に失敗しました" })
      }
    } catch (error) {
      console.error("Error loading users:", error)
      setMessage({ type: "error", text: "ユーザー一覧の取得に失敗しました" })
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!userRole) return

    try {
      const result = await changeUserRole(userId, newRole, userRole)
      if (result.success) {
        setMessage({ type: "success", text: "ユーザーロールを変更しました" })
        loadUsers() // ユーザー一覧を再読み込み
      } else {
        setMessage({ type: "error", text: result.error || "ロール変更に失敗しました" })
      }
    } catch (error) {
      console.error("Error changing user role:", error)
      setMessage({ type: "error", text: "ロール変更に失敗しました" })
    }


    const getRoleBadgeClass = (role: UserRole) => {
      return ROLE_COLORS[role] || "bg-gray-100 text-gray-800"
    }

    if (permissionsLoading || loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Train className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
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
        {/* ヘッダー */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Train className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">ホームドア情報局 - 管理画面</h1>
              </div>
              <nav className="flex space-x-4">
                <Button variant="ghost" asChild>
                  <Link href="/">ホーム</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/profile">プロフィール</Link>
                </Button>
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">管理画面</h2>
            <p className="text-gray-600">ユーザー管理とシステム設定</p>
          </div>

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

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* サイドバー */}
            <div className="lg:col-span-1">
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
                    <Button variant="ghost" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      ユーザー管理
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" disabled>
                      <Shield className="mr-2 h-4 w-4" />
                      権限設定
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" disabled>
                      <Settings className="mr-2 h-4 w-4" />
                      システム設定
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* メインコンテンツ */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    ユーザー管理
                  </CardTitle>
                  <CardDescription>登録ユーザーの一覧とロール管理</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div>
                                <h3 className="font-medium">{user.display_name || "名前未設定"}</h3>
                                <p className="text-sm text-gray-500">{user.username || "ユーザー名未設定"}</p>
                              </div>
                              <Badge className={getRoleBadgeClass(user.role)}>{user.role}</Badge>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              登録日: {new Date(user.created_at).toLocaleDateString("ja-JP")}
                            </p>
                            {user.bio && <p className="text-sm text-gray-600 mt-2">{user.bio}</p>}
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <p className="text-xs text-gray-500">ロール変更</p>
                              <Select
                                value={user.role}
                                onValueChange={(newRole: UserRole) => handleRoleChange(user.id, newRole)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="閲覧者">閲覧者</SelectItem>
                                  <SelectItem value="提供者">提供者</SelectItem>
                                  <SelectItem value="編集者">編集者</SelectItem>
                                  <SelectItem value="開発者">開発者</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-gray-500">{ROLE_DESCRIPTIONS[user.role]}</p>
                        </div>
                      </div>
                    ))}

                    {users.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>ユーザーが見つかりませんでした</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    )
  }
}