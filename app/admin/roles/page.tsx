// app/admin/roles/page.tsx - 新規作成
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Users, Eye, Edit, Trash2, Settings, UserCheck, Crown, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ROLE_LEVELS, ROLE_DESCRIPTIONS, ROLE_COLORS, Permission, ROLE_PERMISSIONS } from "@/lib/permissions"
import { usePermissions } from "@/hooks/use-permissions"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function RoleManagementPage() {
  const { canManageUsers, loading } = usePermissions()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !canManageUsers()) {
      router.push("/admin")
    }
  }, [loading, canManageUsers, router])

  const getPermissionIcon = (permission: Permission) => {
    switch (permission) {
      case Permission.VIEW_CONTENT:
        return <Eye className="h-4 w-4" />
      case Permission.CREATE_STATION_INFO:
      case Permission.UPDATE_STATION_INFO:
        return <Edit className="h-4 w-4" />
      case Permission.DELETE_STATION_INFO:
      case Permission.DELETE_ANY_CONTENT:
        return <Trash2 className="h-4 w-4" />
      case Permission.MANAGE_USERS:
        return <Users className="h-4 w-4" />
      case Permission.SYSTEM_ADMIN:
        return <Settings className="h-4 w-4" />
      default:
        return <UserCheck className="h-4 w-4" />
    }
  }

  const getPermissionName = (permission: Permission) => {
    const names = {
      [Permission.VIEW_CONTENT]: "コンテンツ閲覧",
      [Permission.CREATE_STATION_INFO]: "駅情報作成",
      [Permission.UPDATE_STATION_INFO]: "駅情報更新",
      [Permission.DELETE_STATION_INFO]: "駅情報削除",
      [Permission.MODERATE_CONTENT]: "コンテンツ管理",
      [Permission.MANAGE_NEWS]: "ニュース管理",
      [Permission.EDIT_LAYOUT]: "レイアウト編集",
      [Permission.MANAGE_USERS]: "ユーザー管理",
      [Permission.CHANGE_USER_ROLES]: "ロール変更",
      [Permission.SYSTEM_ADMIN]: "システム管理",
      [Permission.DELETE_ANY_CONTENT]: "全削除権限",
    }
    return names[permission] || permission
  }

  const getRoleBadgeClass = (role: string) => {
    return ROLE_COLORS[role as keyof typeof ROLE_COLORS] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
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
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
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
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">権限設定</h1>
                <p className="text-sm text-gray-600">ロール別権限の確認と管理</p>
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
        {/* ロール一覧 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {Object.entries(ROLE_LEVELS).map(([role, level]) => (
            <Card key={role} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {role === "開発者" ? (
                      <Crown className="h-6 w-6 text-purple-600" />
                    ) : (
                      <Shield className="h-6 w-6 text-blue-600" />
                    )}
                    <div>
                      <CardTitle>{role}</CardTitle>
                      <p className="text-sm text-gray-600">レベル {level}</p>
                    </div>
                  </div>
                  <Badge className={getRoleBadgeClass(role)}>
                    {role}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {ROLE_DESCRIPTIONS[role as keyof typeof ROLE_DESCRIPTIONS]}
                </p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-700">利用可能な権限</h4>
                  <div className="space-y-2">
                    {ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS].map((permission) => (
                      <div key={permission} className="flex items-center space-x-2 text-sm">
                        {getPermissionIcon(permission)}
                        <span>{getPermissionName(permission)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 権限マトリックス */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>権限マトリックス</CardTitle>
            <p className="text-sm text-gray-600">
              各ロールがどの権限を持っているかを一覧で確認できます
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">権限</th>
                    <th className="text-center py-2 px-3">閲覧者</th>
                    <th className="text-center py-2 px-3">提供者</th>
                    <th className="text-center py-2 px-3">編集者</th>
                    <th className="text-center py-2 px-3">開発者</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(Permission).map((permission) => (
                    <tr key={permission} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3 flex items-center space-x-2">
                        {getPermissionIcon(permission)}
                        <span>{getPermissionName(permission)}</span>
                      </td>
                      {Object.keys(ROLE_LEVELS).map((role) => (
                        <td key={role} className="text-center py-2 px-3">
                          {ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS].includes(permission) ? (
                            <div className="w-4 h-4 bg-green-500 rounded-full mx-auto"></div>
                          ) : (
                            <div className="w-4 h-4 bg-gray-200 rounded-full mx-auto"></div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 注意事項 */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">権限設定について</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-yellow-700 space-y-2">
              <p>• ロールは階層構造になっており、上位ロールは下位ロールのすべての権限を継承します</p>
              <p>• 開発者ロールのみがユーザー管理とロール変更の権限を持ちます</p>
              <p>• 権限の変更は即座に反映され、ユーザーの再ログインは不要です</p>
              <p>• システムの安全性のため、最低1名の開発者ロールユーザーが必要です</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}