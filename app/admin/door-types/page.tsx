"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, Plus, Edit, Trash2, Save, AlertCircle, CheckCircle, ArrowLeft, Building } from "lucide-react"
import { usePermissions } from "@/hooks/use-permissions"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  createDoorType,
  updateDoorType,
  deleteDoorType,
  getAllDoorTypes,
  createManufacturer,
  updateManufacturer,
  deleteManufacturer,
  getAllManufacturers,
  type DoorTypeInput,
  type ManufacturerInput,
} from "@/lib/actions"

interface DoorType {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

interface Manufacturer {
  id: string
  name: string
  website_url?: string
  description?: string
  created_at: string
  updated_at: string
}

export default function DoorTypesManagementPage() {
  const { user, userRole, loading: permissionsLoading, hasRole } = usePermissions()
  const router = useRouter()
  const [doorTypes, setDoorTypes] = useState<DoorType[]>([])
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"types" | "manufacturers">("types")
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [newItem, setNewItem] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [doorTypeForm, setDoorTypeForm] = useState<DoorTypeInput>({
    name: "",
    description: "",
  })

  const [manufacturerForm, setManufacturerForm] = useState<ManufacturerInput>({
    name: "",
    website_url: "",
    description: "",
  })

  useEffect(() => {
    if (!permissionsLoading && !hasRole("編集者")) {
      router.push("/")
      return
    }

    if (userRole) {
      loadData()
    }
  }, [userRole, permissionsLoading, hasRole, router])

  const loadData = async () => {
    if (!userRole) return

    try {
      const [doorTypesResult, manufacturersResult] = await Promise.all([
        getAllDoorTypes(userRole),
        getAllManufacturers(userRole),
      ])

      if (doorTypesResult.success) {
        setDoorTypes(doorTypesResult.data)
      }
      if (manufacturersResult.success) {
        setManufacturers(manufacturersResult.data)
      }
    } catch (error) {
      console.error("Error loading data:", error)
      setMessage({ type: "error", text: "データの取得に失敗しました" })
    } finally {
      setLoading(false)
    }
  }

  const resetForms = () => {
    setDoorTypeForm({ name: "", description: "" })
    setManufacturerForm({ name: "", website_url: "", description: "" })
    setEditingItem(null)
    setNewItem(false)
  }

  const startEditDoorType = (doorType: DoorType) => {
    setDoorTypeForm({
      name: doorType.name,
      description: doorType.description || "",
    })
    setEditingItem(doorType.id)
    setNewItem(false)
    setActiveTab("types")
  }

  const startEditManufacturer = (manufacturer: Manufacturer) => {
    setManufacturerForm({
      name: manufacturer.name,
      website_url: manufacturer.website_url || "",
      description: manufacturer.description || "",
    })
    setEditingItem(manufacturer.id)
    setNewItem(false)
    setActiveTab("manufacturers")
  }

  const startNew = (type: "types" | "manufacturers") => {
    resetForms()
    setNewItem(true)
    setActiveTab(type)
  }

  const handleDoorTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setMessage(null)

    try {
      let result
      if (editingItem) {
        result = await updateDoorType(editingItem, doorTypeForm, user.id)
      } else {
        result = await createDoorType(doorTypeForm, user.id)
      }

      if (result.success) {
        setMessage({
          type: "success",
          text: editingItem ? "ホームドアタイプを更新しました" : "ホームドアタイプを作成しました",
        })
        resetForms()
        loadData()
      } else {
        setMessage({ type: "error", text: result.error || "操作に失敗しました" })
      }
    } catch (error) {
      console.error("Error submitting door type:", error)
      setMessage({ type: "error", text: "予期しないエラーが発生しました" })
    } finally {
      setLoading(false)
    }
  }

  const handleManufacturerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setMessage(null)

    try {
      let result
      if (editingItem) {
        result = await updateManufacturer(editingItem, manufacturerForm, user.id)
      } else {
        result = await createManufacturer(manufacturerForm, user.id)
      }

      if (result.success) {
        setMessage({
          type: "success",
          text: editingItem ? "メーカーを更新しました" : "メーカーを作成しました",
        })
        resetForms()
        loadData()
      } else {
        setMessage({ type: "error", text: result.error || "操作に失敗しました" })
      }
    } catch (error) {
      console.error("Error submitting manufacturer:", error)
      setMessage({ type: "error", text: "予期しないエラーが発生しました" })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDoorType = async (doorTypeId: string) => {
    if (!confirm("このホームドアタイプを削除しますか？")) return
    if (!user) return

    setLoading(true)
    setMessage(null)

    try {
      const result = await deleteDoorType(doorTypeId, user.id)

      if (result.success) {
        setMessage({ type: "success", text: "ホームドアタイプを削除しました" })
        setDoorTypes((prev) => prev.filter((dt) => dt.id !== doorTypeId))
        resetForms()
      } else {
        setMessage({ type: "error", text: result.error || "削除に失敗しました" })
      }
    } catch (error) {
      console.error("Error deleting door type:", error)
      setMessage({ type: "error", text: "予期しないエラーが発生しました" })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteManufacturer = async (manufacturerId: string) => {
    if (!confirm("このメーカーを削除しますか？")) return
    if (!user) return

    setLoading(true)
    setMessage(null)

    try {
      const result = await deleteManufacturer(manufacturerId, user.id)

      if (result.success) {
        setMessage({ type: "success", text: "メーカーを削除しました" })
        setManufacturers((prev) => prev.filter((m) => m.id !== manufacturerId))
        resetForms()
      } else {
        setMessage({ type: "error", text: result.error || "削除に失敗しました" })
      }
    } catch (error) {
      console.error("Error deleting manufacturer:", error)
      setMessage({ type: "error", text: "予期しないエラーが発生しました" })
    } finally {
      setLoading(false)
    }
  }

  if (permissionsLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Settings className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
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
              <Settings className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">ホームドア設定管理</h1>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">ホームドア設定管理</h2>
          <p className="text-gray-600">ホームドアタイプとメーカー情報を管理できます</p>
        </div>

        {/* タブ */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("types")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "types"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                ホームドアタイプ
              </button>
              <button
                onClick={() => setActiveTab("manufacturers")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "manufacturers"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                メーカー
              </button>
            </nav>
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
          {/* リスト表示 */}
          <div className="lg:col-span-2">
            {activeTab === "types" && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>ホームドアタイプ一覧</CardTitle>
                    <Button onClick={() => startNew("types")}>
                      <Plus className="h-4 w-4 mr-2" />
                      新規作成
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {doorTypes.map((doorType) => (
                      <div key={doorType.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-lg">{doorType.name}</h3>
                            {doorType.description && (
                              <p className="text-sm text-gray-600 mt-1">{doorType.description}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              作成日: {new Date(doorType.created_at).toLocaleDateString("ja-JP")}
                            </p>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button variant="outline" size="sm" onClick={() => startEditDoorType(doorType)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteDoorType(doorType.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {doorTypes.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Settings className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p>ホームドアタイプがありません</p>
                        <Button onClick={() => startNew("types")} className="mt-4">
                          <Plus className="h-4 w-4 mr-2" />
                          最初のタイプを作成
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "manufacturers" && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>メーカー一覧</CardTitle>
                    <Button onClick={() => startNew("manufacturers")}>
                      <Plus className="h-4 w-4 mr-2" />
                      新規作成
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {manufacturers.map((manufacturer) => (
                      <div key={manufacturer.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-lg">{manufacturer.name}</h3>
                            {manufacturer.website_url && (
                              <a
                                href={manufacturer.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 mt-1 block"
                              >
                                {manufacturer.website_url}
                              </a>
                            )}
                            {manufacturer.description && (
                              <p className="text-sm text-gray-600 mt-1">{manufacturer.description}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              作成日: {new Date(manufacturer.created_at).toLocaleDateString("ja-JP")}
                            </p>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button variant="outline" size="sm" onClick={() => startEditManufacturer(manufacturer)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteManufacturer(manufacturer.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {manufacturers.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Building className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p>メーカーがありません</p>
                        <Button onClick={() => startNew("manufacturers")} className="mt-4">
                          <Plus className="h-4 w-4 mr-2" />
                          最初のメーカーを作成
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 編集フォーム */}
          <div>
            {(editingItem || newItem) && activeTab === "types" && (
              <Card>
                <CardHeader>
                  <CardTitle>{editingItem ? "ホームドアタイプ編集" : "新規ホームドアタイプ作成"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleDoorTypeSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="door-type-name">タイプ名 *</Label>
                      <Input
                        id="door-type-name"
                        value={doorTypeForm.name}
                        onChange={(e) => setDoorTypeForm({ ...doorTypeForm, name: e.target.value })}
                        placeholder="フルハイト、ハーフハイトなど"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="door-type-description">説明</Label>
                      <Textarea
                        id="door-type-description"
                        value={doorTypeForm.description}
                        onChange={(e) => setDoorTypeForm({ ...doorTypeForm, description: e.target.value })}
                        placeholder="ホームドアタイプの詳細説明"
                        rows={3}
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button type="submit" disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? "保存中..." : "保存"}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForms}>
                        キャンセル
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {(editingItem || newItem) && activeTab === "manufacturers" && (
              <Card>
                <CardHeader>
                  <CardTitle>{editingItem ? "メーカー編集" : "新規メーカー作成"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleManufacturerSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="manufacturer-name">メーカー名 *</Label>
                      <Input
                        id="manufacturer-name"
                        value={manufacturerForm.name}
                        onChange={(e) => setManufacturerForm({ ...manufacturerForm, name: e.target.value })}
                        placeholder="日本信号、京三製作所など"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="manufacturer-website">ウェブサイト</Label>
                      <Input
                        id="manufacturer-website"
                        type="url"
                        value={manufacturerForm.website_url}
                        onChange={(e) => setManufacturerForm({ ...manufacturerForm, website_url: e.target.value })}
                        placeholder="https://example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="manufacturer-description">説明</Label>
                      <Textarea
                        id="manufacturer-description"
                        value={manufacturerForm.description}
                        onChange={(e) => setManufacturerForm({ ...manufacturerForm, description: e.target.value })}
                        placeholder="メーカーの詳細説明"
                        rows={3}
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button type="submit" disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? "保存中..." : "保存"}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForms}>
                        キャンセル
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {!editingItem && !newItem && (
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
                        <p className="text-gray-600">新しいタイプやメーカーを追加します</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Edit className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">編集</p>
                        <p className="text-gray-600">既存の情報を編集します</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Trash2 className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium">削除</p>
                        <p className="text-gray-600">情報を完全に削除します</p>
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
