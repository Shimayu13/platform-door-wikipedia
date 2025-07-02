// app/admin/roles/page.tsx - 権限表示修正版
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Users, Eye, Edit, Trash2, Settings, UserCheck, Crown, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ROLE_LEVELS, ROLE_DESCRIPTIONS, ROLE_COLORS, Permission, ROLE_PERMISSIONS, PERMISSION_NAMES } from "@/lib/permissions"
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
      case Permission.CREATE_LINES:
      case Permission.UPDATE_LINES:
        return <Edit className="h-4 w-4" />
      case Permission.DELETE_STATION_INFO:
      case Permission.DELETE_ANY_CONTENT:
      case Permission.DELETE_LINES:
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
    return PERMISSION_NAMES[permission] || permission
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

  const roles = Object.keys(ROLE_LEVELS) as Array<keyof typeof ROLE_LEVELS>
  const permissions = Object.values(Permission)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">ロール管理</h1>
                <p className="text-sm text-gray-600">権限とロールの設定</p>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">ロール・権限管理</h2>
          <p className="text-gray-600">
            各ロールが持つ権限を確認できます
          </p>
        </div>

        {/* ロール概要 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {roles.map((role) => (
            <Card key={role}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{role}</span>
                  <Badge className={getRoleBadgeClass(role)}>
                    Lv.{ROLE_LEVELS[role]}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  {ROLE_DESCRIPTIONS[role]}
                </p>
                <div className="text-xs text-gray-500">
                  権限数: {ROLE_PERMISSIONS[role].length}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 権限マトリックス */}
        <Card>
          <CardHeader>
            <CardTitle>権限マトリックス</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-gray-900">権限</th>
                    {roles.map((role) => (
                      <th key={role} className="text-center p-3 font-medium text-gray-900">
                        <div className="flex flex-col items-center space-y-1">
                          <span>{role}</span>
                          <Badge className={getRoleBadgeClass(role)} variant="outline">
                            Lv.{ROLE_LEVELS[role]}
                          </Badge>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((permission) => (
                    <tr key={permission} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          {getPermissionIcon(permission)}
                          <span className="text-sm font-medium">
                            {getPermissionName(permission)}
                          </span>
                        </div>
                      </td>
                      {roles.map((role) => (
                        <td key={`${role}-${permission}`} className="p-3 text-center">
                          {ROLE_PERMISSIONS[role].includes(permission) ? (
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