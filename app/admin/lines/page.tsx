// app/admin/lines/page.tsx - 新規作成
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
  Train, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle,
  Building2,
  Filter
} from "lucide-react"
import { usePermissions } from "@/hooks/use-permissions"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getRailwayCompanies, getLines, type RailwayCompany, type Line } from "@/lib/supabase"
import { createLine, updateLine, deleteLine } from "@/lib/actions"

interface LineFormData {
  name: string
  company_id: string
  color: string
  description: string
}

export default function LinesAdminPage() {
  const { user, userRole, loading: permissionsLoading, hasRole } = usePermissions()
  const router = useRouter()
  const [companies, setCompanies] = useState<RailwayCompany[]>([])
  const [lines, setLines] = useState<Line[]>([])
  const [filteredLines, setFilteredLines] = useState<Line[]>([])
  const [loading, setLoading] = useState(true)
  const [editingLine, setEditingLine] = useState<string | null>(null)
  const [newLine, setNewLine] = useState(false)
  const [filterCompany, setFilterCompany] = useState<string>("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [formData, setFormData] = useState<LineFormData>({
    name: "",
    company_id: "",
    color: "",
    description: "",
  })

  // 権限チェック
  useEffect(() => {
    if (!permissionsLoading && !hasRole("編集者")) {
      router.push("/")
      return
    }

    if (userRole) {
      loadData()
    }
  }, [userRole, permissionsLoading, hasRole, router])

  // フィルタリング
  useEffect(() => {
    if (filterCompany) {
      setFilteredLines(lines.filter(line => line.company_id === filterCompany))
    } else {
      setFilteredLines(lines)
    }
  }, [lines, filterCompany])

  const loadData = async () => {
    try {
      const [companiesData, linesData] = await Promise.all([
        getRailwayCompanies(),
        getLines()
      ])
      setCompanies(companiesData)
      setLines(linesData)
    } catch (error) {
      console.error("Error loading data:", error)
      setMessage({ type: "error", text: "データの取得に失敗しました" })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      company_id: "",
      color: "",
      description: "",
    })
    setEditingLine(null)
    setNewLine(false)
  }

  const startEdit = (line: Line) => {
    setFormData({
      name: line.name,
      company_id: line.company_id,
      color: (line as any).color || "",
      description: (line as any).description || "",
    })
    setEditingLine(line.id)
    setNewLine(false)
  }

  const startNew = () => {
    resetForm()
    setNewLine(true)
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
      if (editingLine) {
        result = await updateLine(editingLine, formData, user.id)
      } else {
        result = await createLine(formData, user.id)
      }

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message || (editingLine ? "路線を更新しました" : "路線を作成しました"),
        })
        resetForm()
        loadData()
      } else {
        setMessage({ type: "error", text: result.error || "操作に失敗しました" })
      }
    } catch (error) {
      console.error("Error submitting line:", error)
      setMessage({ type: "error", text: "予期しないエラーが発生しました" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (lineId: string) => {
    if (!confirm("この路線を削除しますか？関連する駅がある場合は削除できません。")) return
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
      const result = await deleteLine(lineId, user.id)

      if (result.success) {
        setMessage({ type: "success", text: result.message || "路線を削除しました" })
        setLines(prev => prev.filter(l => l.id !== lineId))
        resetForm()
      } else {
        setMessage({ type: "error", text: result.error || "削除に失敗しました" })
      }
    } catch (error) {
      console.error("Error deleting line:", error)
      setMessage({ type: "error", text: "予期しないエラーが発生しました" })
    } finally {
      setLoading(false)
    }
  }

  const checkUserProfile = async () => {
    if (!user) {
      console.log("❌ No user found");
      return;
    }
    
    try {
      const { supabase } = await import('@/lib/supabase');
      
      console.log("🔍 === LINES PAGE USER DIAGNOSIS ===");
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
        console.log("❌ No profile found");
      }
      
    } catch (error) {
      console.error("Error in checkUserProfile:", error);
    }
  }

  const getCompanyName = (companyId: string) => {
    return companies.find(c => c.id === companyId)?.name || "不明"
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
                <Train className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">路線管理</h1>
              </div>
            </div>
            {!newLine && !editingLine && (
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
          {/* 路線一覧 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>登録済み路線</span>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-600" />
                  <Select value={filterCompany} onValueChange={setFilterCompany}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="鉄道会社で絞り込み" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">すべて表示</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">読み込み中...</p>
                </div>
              ) : filteredLines.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Train className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>
                    {filterCompany ? "該当する路線がありません" : "登録された路線がありません"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredLines.map((line) => (
                    <div key={line.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">{line.name}</h3>
                            {(line as any).color && (
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: (line as any).color }}
                                title={`路線カラー: ${(line as any).color}`}
                              />
                            )}
                          </div>
                          <Badge variant="secondary" className="mb-2">
                            <Building2 className="h-3 w-3 mr-1" />
                            {getCompanyName(line.company_id)}
                          </Badge>
                          {(line as any).description && (
                            <p className="text-gray-600 text-sm mt-2">{(line as any).description}</p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(line)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            編集
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(line.id)}
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
          {(newLine || editingLine) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{editingLine ? "路線の編集" : "新しい路線の追加"}</span>
                  <Button variant="outline" onClick={resetForm} size="sm">
                    <X className="h-4 w-4 mr-2" />
                    キャンセル
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="company_id">鉄道会社 *</Label>
                    <Select 
                      value={formData.company_id} 
                      onValueChange={(value) => setFormData({ ...formData, company_id: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="鉄道会社を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="name">路線名 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="山手線"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="color">路線カラー</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="color"
                        type="color"
                        value={formData.color || "#000000"}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="#00B261"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">説明</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="路線の説明や特徴など"
                      rows={3}
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "処理中..." : editingLine ? "更新" : "追加"}
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