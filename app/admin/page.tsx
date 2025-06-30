"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Building2, Train, MapPin, FileText, Users, BarChart3 } from "lucide-react"
import { AdminLayout, AdminSidebar } from "@/components/admin-layout"

export default function AdminPage() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  return (
    <AdminLayout title="管理画面" subtitle="ユーザー管理とシステム設定">
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
          <AdminSidebar />
        </div>

        {/* メインコンテンツ */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 統計カード */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">管理機能</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  利用可能な管理機能
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">最近の更新</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">
                  データベース更新履歴
                </p>
              </CardContent>
            </Card>

            {/* クイックアクセス */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>クイックアクセス</CardTitle>
                <CardDescription>
                  よく使用される管理機能への直接リンク
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Building2 className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="font-medium">鉄道会社管理</p>
                        <p className="text-sm text-gray-600">会社情報の編集</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Train className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="font-medium">路線管理</p>
                        <p className="text-sm text-gray-600">路線データの管理</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-6 w-6 text-purple-600" />
                      <div>
                        <p className="font-medium">駅管理</p>
                        <p className="text-sm text-gray-600">駅情報の管理</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-6 w-6 text-orange-600" />
                      <div>
                        <p className="font-medium">ニュース管理</p>
                        <p className="text-sm text-gray-600">記事の作成・編集</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}