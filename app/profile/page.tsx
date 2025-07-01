// app/profile/page.tsx - 完全修正版

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
  MapPin
} from "lucide-react"
import Link from "next/link"
import { usePermissions } from "@/hooks/use-permissions"
import { canAccessAdmin, ROLE_DESCRIPTIONS, ROLE_COLORS } from "@/lib/permissions"
import { CommonHeader } from "@/components/common-header"

export default function ProfilePage() {
  const { user, profile, loading } = usePermissions()
  const [isEditing, setIsEditing] = useState(false)
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
                    <p className="text-gray-600">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getRoleBadgeClass(profile.role)}>
                        {profile.role}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        登録日: {new Date(profile.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {!isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">居住地</Label>
                      <p className="text-sm">{profile.location || "未設定"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">自己紹介</Label>
                      <p className="text-sm">{profile.bio || "未設定"}</p>
                    </div>
                    <Button onClick={() => setIsEditing(true)} variant="outline">
                      編集
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">名前</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="お名前"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">居住地</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="東京都"
                      />
                    </div>
                    <div>
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

                  {/* 管理画面ボタン - 修正部分 */}
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

            {/* 利用可能な機能 */}
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
                  
                  {canAccessAdmin(profile.role as any) && (
                    <>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>管理機能の利用</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>路線・駅管理</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>ニュース管理</span>
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
                        <span>システム管理</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* アカウント情報 */}
            <Card>
              <CardHeader>
                <CardTitle>アカウント情報</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-500 mr-2" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <span>登録: {new Date(profile.created_at).toLocaleDateString()}</span>
                  </div>
                  {profile.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}