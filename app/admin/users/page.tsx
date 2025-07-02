// app/admin/users/page.tsx - エラー修正版
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, 
  Search, 
  Edit, 
  Trash2, 
  AlertCircle, 
  CheckCircle,
  ArrowLeft,
  UserPlus,
  Crown,
  Mail,
  Calendar
} from "lucide-react"
import Link from "next/link"
import { usePermissions } from "@/hooks/use-permissions"
import { useRouter } from "next/navigation"
import { getAllUsers, changeUserRole, type UserProfile } from "@/lib/auth"
import { ROLE_COLORS, ROLE_DESCRIPTIONS, type UserRole } from "@/lib/permissions"

export default function UserManagementPage() {
  const { canManageUsers, userRole, loading: permissionsLoading } = usePermissions()
  const router = useRouter()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (!permissionsLoading && typeof canManageUsers === 'function' && !canManageUsers()) {
      router.push("/admin")
      return
    }

    if (userRole) {
      loadUsers()
    }
  }, [permissionsLoading, canManageUsers, userRole, router])

  const loadUsers = async () => {
    if (!userRole) return

    try {
      const result = await getAllUsers(userRole)
      if (result.success) {
        // result.dataがundefinedの可能性があるので、空配列をデフォルトとして使用
        setUsers(result.data || [])
      } else {
        setMessage({ type: "error", text: result.error || "ユーザー一覧の取得に失敗しました" })
      }
    } catch (error) {
      console.error("Error loading users:", error)
      setMessage({ type: "error", text: "予期しないエラーが発生しました" })
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
      console.error("Error changing role:", error)
      setMessage({ type: "error", text: "予期しないエラーが発生しました" })
    }
  }

  const getRoleBadgeClass = (role: UserRole) => {
    return ROLE_COLORS[role] || "bg-gray-100 text-gray-800"
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = filterRole === "all" || user.role === filterRole

    return matchesSearch && matchesRole
  })

  if (permissionsLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!canManageUsers()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">アクセス権限がありません</h2>
            <p className="text-gray-600 mb-4">この機能は開発者のみ利用できます</p>
            <Button asChild>
              <Link href="/admin">管理画面に戻る</Link>
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
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">ユーザー管理</h1>
                <p className="text-sm text-gray-600">登録ユーザーの一覧とロール管理</p>
              </div>
            </div>
            <nav className="flex space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  管理画面
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/profile">プロフィール</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* メッセージ */}
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

        {/* 検索・フィルター */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="ユーザー名またはIDで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger>
              <SelectValue placeholder="ロールでフィルター" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全てのロール</SelectItem>
              <SelectItem value="開発者">開発者</SelectItem>
              <SelectItem value="編集者">編集者</SelectItem>
              <SelectItem value="提供者">提供者</SelectItem>
              <SelectItem value="閲覧者">閲覧者</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総ユーザー数</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">開発者</CardTitle>
              <Crown className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === "開発者").length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">編集者</CardTitle>
              <Edit className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === "編集者").length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">提供者</CardTitle>
              <UserPlus className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === "提供者").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ユーザー一覧 */}
        <Card>
          <CardHeader>
            <CardTitle>
              ユーザー一覧 ({filteredUsers.length}件)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {user.display_name || user.username || "未設定"}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.id}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(user.created_at).toLocaleDateString("ja-JP")}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <Badge className={getRoleBadgeClass(user.role)}>
                          {user.role}
                        </Badge>
                        
                        {userRole === "開発者" && (
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
                        )}
                      </div>
                    </div>
                    
                    {/* ロールの説明 */}
                    <div className="mt-3 text-sm text-gray-600">
                      {ROLE_DESCRIPTIONS[user.role]}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>条件に一致するユーザーが見つかりません</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 権限説明 */}
        <Card className="mt-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">ロール権限について</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-blue-700 space-y-2">
              <p><strong>開発者:</strong> 全ての機能にアクセス可能（ユーザー管理、システム管理含む）</p>
              <p><strong>編集者:</strong> ニュース管理、駅・路線・会社情報の管理が可能</p>
              <p><strong>提供者:</strong> ホームドア情報の入力・更新が可能</p>
              <p><strong>閲覧者:</strong> 情報の閲覧のみ可能</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}