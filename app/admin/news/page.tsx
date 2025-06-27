"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Calendar,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react"
import { usePermissions } from "@/hooks/use-permissions"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createNews, updateNews, deleteNews, getAllNews, type NewsInput } from "@/lib/actions"
import type { News } from "@/lib/supabase"

export default function NewsManagementPage() {
  const { user, userRole, loading: permissionsLoading, hasRole } = usePermissions()
  const router = useRouter()
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [editingNews, setEditingNews] = useState<string | null>(null)
  const [newNews, setNewNews] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [formData, setFormData] = useState<NewsInput>({
    title: "",
    content: "",
    summary: "",
    status: "下書き",
  })

  useEffect(() => {
    if (!permissionsLoading && !hasRole("編集者")) {
      router.push("/")
      return
    }

    if (userRole) {
      loadNews()
    }
  }, [userRole, permissionsLoading, hasRole, router])

  const loadNews = async () => {
    if (!userRole) return

    try {
      const result = await getAllNews(userRole)
      if (result.success) {
        setNews(result.data)
      } else {
        setMessage({ type: "error", text: result.error || "ニュース一覧の取得に失敗しました" })
      }
    } catch (error) {
      console.error("Error loading news:", error)
      setMessage({ type: "error", text: "ニュース一覧の取得に失敗しました" })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      summary: "",
      status: "下書き",
    })
    setEditingNews(null)
    setNewNews(false)
  }

  const startEdit = (newsItem: News) => {
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      summary: newsItem.summary || "",
      status: newsItem.status,
    })
    setEditingNews(newsItem.id)
    setNewNews(false)
  }

  const startNew = () => {
    resetForm()
    setNewNews(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setMessage(null)

    try {
      let result
      if (editingNews) {
        result = await updateNews(editingNews, formData, user.id)
      } else {
        result = await createNews(formData, user.id)
      }

      if (result.success) {
        setMessage({
          type: "success",
          text: editingNews ? "ニュースを更新しました" : "ニュースを作成しました",
        })
        resetForm()
        loadNews()
      } else {
        setMessage({ type: "error", text: result.error || "操作に失敗しました" })
      }
    } catch (error) {
      console.error("Error submitting news:", error)
      setMessage({ type: "error", text: "予期しないエラーが発生しました" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (newsId: string) => {
    if (!confirm("このニュース記事を削除しますか？")) return
    if (!user) return

    setLoading(true)
    setMessage(null)

    try {
      const result = await deleteNews(newsId, user.id)

      if (result.success) {
        setMessage({ type: "success", text: "ニュースを削除しました" })
        setNews((prev) => prev.filter((n) => n.id !== newsId))
        resetForm()
      } else {
        setMessage({ type: "error", text: result.error || "削除に失敗しました" })
      }
    } catch (error) {
      console.error("Error deleting news:", error)
      setMessage({ type: "error", text: "予期しないエラーが発生しました" })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      公開: "default",
      下書き: "secondary",
      非公開: "destructive",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "secondary"}>{status}</Badge>
  }

  if (permissionsLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!hasRole("編集者")) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">アクセス権限がありません</h2>
            <p className="text-gray-600 mb-4">この機能は編集者以上のロールが必要です</p>
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
              <FileText className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">ニュース管理</h1>
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
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">ニュース管理</h2>
              <p className="text-gray-600">ニュース記事の作成・編集・削除ができます</p>
            </div>
            <Button onClick={startNew}>
              <Plus className="h-4 w-4 mr-2" />
              新規作成
            </Button>
          </div>
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ニュース一覧 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>ニュース一覧</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {news.map((newsItem) => (
                    <div key={newsItem.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{newsItem.title}</h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{newsItem.summary}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {newsItem.published_at
                                ? new Date(newsItem.published_at).toLocaleDateString("ja-JP")
                                : new Date(newsItem.created_at).toLocaleDateString("ja-JP")}
                            </div>
                            {getStatusBadge(newsItem.status)}
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button variant="outline" size="sm" onClick={() => startEdit(newsItem)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(newsItem.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {news.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>ニュース記事がありません</p>
                      <Button onClick={startNew} className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        最初の記事を作成
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 編集フォーム */}
          <div>
            {(editingNews || newNews) && (
              <Card>
                <CardHeader>
                  <CardTitle>{editingNews ? "ニュース編集" : "新規ニュース作成"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">タイトル *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="ニュースタイトル"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="summary">要約</Label>
                      <Textarea
                        id="summary"
                        value={formData.summary}
                        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                        placeholder="記事の要約（任意）"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">本文 *</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="ニュース本文"
                        rows={8}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">公開状態 *</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="下書き">
                            <div className="flex items-center">
                              <EyeOff className="h-4 w-4 mr-2" />
                              下書き
                            </div>
                          </SelectItem>
                          <SelectItem value="公開">
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-2" />
                              公開
                            </div>
                          </SelectItem>
                          <SelectItem value="非公開">
                            <div className="flex items-center">
                              <EyeOff className="h-4 w-4 mr-2" />
                              非公開
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex space-x-2">
                      <Button type="submit" disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? "保存中..." : "保存"}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForm}>
                        キャンセル
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {!editingNews && !newNews && (
              <Card>
                <CardHeader>
                  <CardTitle>操作ガイド</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <Plus className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium">新規作成</p>
                        <p className="text-gray-600">新しいニュース記事を作成します</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Edit className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">編集</p>
                        <p className="text-gray-600">既存の記事を編集します</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Trash2 className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium">削除</p>
                        <p className="text-gray-600">記事を完全に削除します</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
