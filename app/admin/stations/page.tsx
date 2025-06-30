// app/admin/stations/page.tsx - 新規作成
"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { usePermissions } from "@/hooks/use-permissions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, MapPin, Train, Plus } from "lucide-react"
import Link from "next/link"
import StationManagement from "@/components/station-management"

export default function StationAdminPage() {
  const { user, userRole, loading: permissionsLoading, hasRole } = usePermissions()
  const router = useRouter()

  // 権限チェック
  if (permissionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!hasRole("編集者")) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">アクセス権限がありません</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              この機能は編集者以上の権限が必要です。
            </p>
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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  管理メニューに戻る
                </Link>
              </Button>
              <div className="border-l pl-4">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-blue-600" />
                  駅情報管理
                </h1>
                <p className="text-sm text-gray-600">駅の基本情報と路線の管理</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button asChild variant="outline">
                <Link href="/contribute">
                  <Plus className="h-4 w-4 mr-2" />
                  新規駅登録
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* 概要カード */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">駅情報管理機能</CardTitle>
                <MapPin className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span>駅情報の編集・更新</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span>路線の追加・削除</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    <span>駅情報の削除</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">注意事項</CardTitle>
                <Train className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="text-orange-600">
                    • 駅の削除はホームドア情報がない場合のみ可能
                  </div>
                  <div className="text-orange-600">
                    • 路線の削除も同様の制限があります
                  </div>
                  <div className="text-gray-600">
                    • 変更は即座に反映されます
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">操作権限</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="text-green-600">
                    ✓ 編集者: 全ての駅情報の編集・削除
                  </div>
                  <div className="text-blue-600">
                    ✓ 開発者: 全ての管理機能
                  </div>
                  <div className="text-gray-600">
                    あなたの権限: <span className="font-medium">{userRole}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 駅管理コンポーネント */}
          {user && userRole && (
            <StationManagement 
              userId={user.id} 
              userRole={userRole} 
            />
          )}
        </div>
      </main>
    </div>
  )
}