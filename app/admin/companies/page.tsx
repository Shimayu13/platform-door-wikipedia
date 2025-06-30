// app/admin/companies/page.tsx - 新規作成
"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle,
  ExternalLink
} from "lucide-react"
import { usePermissions } from "@/hooks/use-permissions"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getRailwayCompanies, type RailwayCompany } from "@/lib/supabase"
import { createRailwayCompany, updateRailwayCompany, deleteRailwayCompany } from "@/lib/actions"

interface CompanyFormData {
  name: string
  type: string
  website_url: string
  description: string
}

export default function CompaniesAdminPage() {
  const { user, userRole, loading: permissionsLoading, hasRole } = usePermissions()
  const router = useRouter()
  const [companies, setCompanies] = useState<RailwayCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCompany, setEditingCompany] = useState<string | null>(null)
  const [newCompany, setNewCompany] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    type: "JR",
    website_url: "",
    description: "",
  })

  // 権限チェック
  useEffect(() => {
    if (!permissionsLoading && !hasRole("編集者")) {
      router.push("/")
      return
    }

    if (userRole) {
      // デバッグ情報を出力
      console.log("🔍 DEBUG: User permissions check");
      console.log("- user:", user);
      console.log("- userRole:", userRole);
      console.log("- hasRole('編集者'):", hasRole("編集者"));
      
      // ユーザープロフィールを直接確認
      checkUserProfile();
      
      loadCompanies()
    }
  }, [userRole, permissionsLoading, hasRole, router])

  const checkUserProfile = async () => {
    if (!user) {
      console.log("❌ No user found");
      return;
    }
    
    try {
      const { supabase } = await import('@/lib/supabase');
      
      console.log("🔍 === USER DIAGNOSIS ===");
      console.log("1. Current user ID:", user.id);
      console.log("2. User object:", user);
      
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      console.log("3. Profile query result:");
      console.log("   - profile:", profile);
      console.log("   - error:", error);
      
      if (profile) {
        console.log("4. User role:", profile.role);
        console.log("5. Has editor/developer role:", ['編集者', '開発者'].includes(profile.role));
      } else {
        console.log("❌ No profile found - creating one...");
        
        // プロフィールを作成
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            role: '開発者',
            display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Admin',
            username: user.email?.split('@')[0] || 'admin'
          })
          .select()
          .single();
          
        console.log("6. Profile creation result:");
        console.log("   - newProfile:", newProfile);
        console.log("   - createError:", createError);
      }
      
      // 権限テスト
      const { data: permissionTest, error: permError } = await supabase
        .rpc('test_user_permission');
        
      console.log("7. Permission test:");
      console.log("   - result:", permissionTest);
      console.log("   - error:", permError);
      
    } catch (error) {
      console.error("Error in checkUserProfile:", error);
    }
  }

  const loadCompanies = async () => {
    try {
      const companiesData = await getRailwayCompanies()
      setCompanies(companiesData)
    } catch (error) {
      console.error("Error loading companies:", error)
      setMessage({ type: "error", text: "鉄道会社一覧の取得に失敗しました" })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      type: "JR",
      website_url: "",
      description: "",
    })
    setEditingCompany(null)
    setNewCompany(false)
  }

  const startEdit = (company: RailwayCompany) => {
    setFormData({
      name: company.name,
      type: (company as any).type || "JR",
      website_url: (company as any).website_url || "",
      description: (company as any).description || "",
    })
    setEditingCompany(company.id)
    setNewCompany(false)
  }

  const startNew = () => {
    resetForm()
    setNewCompany(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setMessage({ type: "error", text: "ログインが必要です" })
      return
    }

    // フロントエンドでの権限チェック
    if (!hasRole("編集者")) {
      setMessage({ type: "error", text: "この操作には編集者権限が必要です" })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      let result
      if (editingCompany) {
        result = await updateRailwayCompany(editingCompany, formData, user.id)
      } else {
        result = await createRailwayCompany(formData, user.id)
      }

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message || (editingCompany ? "鉄道会社を更新しました" : "鉄道会社を作成しました"),
        })
        resetForm()
        loadCompanies()
      } else {
        setMessage({ type: "error", text: result.error || "操作に失敗しました" })
      }
    } catch (error) {
      console.error("Error submitting company:", error)
      setMessage({ type: "error", text: "予期しないエラーが発生しました" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (companyId: string) => {
    if (!confirm("この鉄道会社を削除しますか？関連する路線がある場合は削除できません。")) return
    if (!user) return

    setLoading(true)
    setMessage(null)

    try {
      const result = await deleteRailwayCompany(companyId, user.id)

      if (result.success) {
        setMessage({ type: "success", text: result.message || "鉄道会社を削除しました" })
        setCompanies(prev => prev.filter(c => c.id !== companyId))
        resetForm()
      } else {
        setMessage({ type: "error", text: result.error || "削除に失敗しました" })
      }
    } catch (error) {
      console.error("Error deleting company:", error)
      setMessage({ type: "error", text: "予期しないエラーが発生しました" })
    } finally {
      setLoading(false)
    }
  }

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
                  管理画面に戻る
                </Link>
              </Button>
              <div className="flex items-center space-x-2">
                <Building2 className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">鉄道会社管理</h1>
              </div>
            </div>
            {!newCompany && !editingCompany && (
              <div className="flex gap-2">
                <Button onClick={startNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  新規追加
                </Button>
                <Button variant="outline" onClick={checkUserProfile}>
                  🔍 診断実行
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 鉄道会社一覧 */}
          <Card>
            <CardHeader>
              <CardTitle>登録済み鉄道会社</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">読み込み中...</p>
                </div>
              ) : companies.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>登録された鉄道会社がありません</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {companies.map((company) => (
                    <div key={company.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{company.name}</h3>
                          {(company as any).website_url && (
                            <div className="mt-1">
                              <a
                                href={(company as any).website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                公式サイト
                              </a>
                            </div>
                          )}
                          {(company as any).description && (
                            <p className="text-gray-600 text-sm mt-2">{(company as any).description}</p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(company)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            編集
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(company.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            削除
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 編集フォーム */}
          {(newCompany || editingCompany) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{editingCompany ? "鉄道会社の編集" : "新しい鉄道会社の追加"}</span>
                  <Button variant="outline" onClick={resetForm} size="sm">
                    <X className="h-4 w-4 mr-2" />
                    キャンセル
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">会社名 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="JR東日本"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">鉄道会社種別 *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="種別を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JR">JR</SelectItem>
                        <SelectItem value="大手私鉄">大手私鉄</SelectItem>
                        <SelectItem value="中小私鉄">中小私鉄</SelectItem>
                        <SelectItem value="私鉄">私鉄</SelectItem>
                        <SelectItem value="公営">公営</SelectItem>
                        <SelectItem value="第三セクター">第三セクター</SelectItem>
                        <SelectItem value="その他">その他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="website_url">公式サイトURL</Label>
                    <Input
                      id="website_url"
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                      placeholder="https://www.jreast.co.jp/"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">説明</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="鉄道会社の説明や特徴など"
                      rows={3}
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "処理中..." : editingCompany ? "更新" : "追加"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}