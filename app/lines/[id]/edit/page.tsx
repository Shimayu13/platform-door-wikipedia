// app/admin/lines/[id]/edit/page.tsx - 新規作成

"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
    Train,
    ArrowLeft,
    Save,
    AlertCircle,
    CheckCircle,
    Building2
} from "lucide-react"
import { usePermissions } from "@/hooks/use-permissions"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { getRailwayCompanies, getLines, type RailwayCompany, type Line } from "@/lib/supabase"
import { updateLine, type LineUpdateInput } from "@/lib/actions"
import { LineManagementAccess } from "@/components/access-control"

interface LineFormData {
    name: string
    company_id: string
    color: string
    description: string
}

export default function EditLinePage() {
    const { user } = usePermissions()
    const router = useRouter()
    const params = useParams()
    const lineId = params.id as string

    const [companies, setCompanies] = useState<RailwayCompany[]>([])
    const [loading, setLoading] = useState(false)
    const [dataLoading, setDataLoading] = useState(true)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

    const [formData, setFormData] = useState<LineFormData>({
        name: "",
        company_id: "",
        color: "",
        description: "",
    })

    // データを取得
    useEffect(() => {
        if (lineId) {
            loadData()
        }
    }, [lineId])

    const loadData = async () => {
        try {
            setDataLoading(true)
            const [companiesData, linesData] = await Promise.all([
                getRailwayCompanies(),
                getLines()
            ])
            
            setCompanies(companiesData)
            
            // 対象の路線を探す
            const targetLine = linesData.find(line => line.id === lineId)
            if (targetLine) {
                setFormData({
                    name: targetLine.name,
                    company_id: targetLine.company_id,
                    color: (targetLine as any).color || "",
                    description: (targetLine as any).description || "",
                })
            } else {
                setMessage({ type: "error", text: "路線が見つかりません" })
            }
        } catch (error) {
            console.error("Error loading data:", error)
            setMessage({ type: "error", text: "データの取得に失敗しました" })
        } finally {
            setDataLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) {
            setMessage({ type: "error", text: "ログインが必要です" })
            return
        }

        if (!formData.name.trim()) {
            setMessage({ type: "error", text: "路線名を入力してください" })
            return
        }

        if (!formData.company_id) {
            setMessage({ type: "error", text: "鉄道会社を選択してください" })
            return
        }

        setLoading(true)
        setMessage(null)

        try {
            const lineInput: LineUpdateInput = {
                name: formData.name.trim(),
                company_id: formData.company_id,
                color: formData.color.trim() || undefined,
                description: formData.description.trim() || undefined,
            }

            const result = await updateLine(lineId, lineInput, user.id)

            if (result.success) {
                setMessage({
                    type: "success",
                    text: result.message || "路線を更新しました"
                })
                
                // 少し待ってから路線管理ページにリダイレクト
                setTimeout(() => {
                    router.push("/admin/lines")
                }, 2000)
            } else {
                setMessage({
                    type: "error",
                    text: result.error || "路線の更新に失敗しました"
                })
            }
        } catch (error) {
            console.error("Error updating line:", error)
            setMessage({
                type: "error",
                text: "予期しないエラーが発生しました"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        router.push("/admin/lines")
    }

    if (dataLoading) {
        return (
            <LineManagementAccess>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">読み込み中...</p>
                    </div>
                </div>
            </LineManagementAccess>
        )
    }

    return (
        <LineManagementAccess>
            <div className="min-h-screen bg-gray-50">
                {/* ヘッダー */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            <div className="flex items-center space-x-4">
                                <Button variant="ghost" asChild>
                                    <Link href="/admin/lines">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        路線管理に戻る
                                    </Link>
                                </Button>
                                <div className="border-l pl-4">
                                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        <Train className="h-6 w-6 text-green-600" />
                                        路線編集
                                    </h1>
                                    <p className="text-sm text-gray-600">路線情報を編集します</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* メインコンテンツ */}
                <main className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    {/* メッセージ表示 */}
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

                    {/* 路線編集フォーム */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Train className="mr-2 h-5 w-5" />
                                路線基本情報
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* 基本情報 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <Label htmlFor="name">路線名 *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="山手線"
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label htmlFor="company">鉄道会社 *</Label>
                                        <Select
                                            value={formData.company_id}
                                            onValueChange={(value) => setFormData({ ...formData, company_id: value })}
                                            disabled={loading}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="鉄道会社を選択" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {companies.map((company) => (
                                                    <SelectItem key={company.id} value={company.id}>
                                                        <div className="flex items-center">
                                                            <Building2 className="h-4 w-4 mr-2" />
                                                            {company.name}
                                                            {company.type && (
                                                                <span className="ml-2 text-xs text-gray-500">
                                                                    ({company.type})
                                                                </span>
                                                            )}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="color">路線カラー（任意）</Label>
                                        <Input
                                            id="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            placeholder="#009639"
                                            disabled={loading}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            例：#009639（16進数カラーコード）
                                        </p>
                                    </div>

                                    <div>
                                        {formData.color && (
                                            <div className="mt-6">
                                                <Label>プレビュー</Label>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <div 
                                                        className="w-6 h-6 rounded border"
                                                        style={{ backgroundColor: formData.color }}
                                                    ></div>
                                                    <span className="text-sm text-gray-600">{formData.color}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label htmlFor="description">説明（任意）</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="路線に関する説明や特記事項"
                                            rows={3}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                {/* アクションボタン */}
                                <div className="flex justify-end space-x-4 pt-6 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCancel}
                                        disabled={loading}
                                    >
                                        キャンセル
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading || !formData.name.trim() || !formData.company_id}
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {loading ? "更新中..." : "路線を更新"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* ヘルプ情報 */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="text-sm">路線編集について</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• 路線名と鉄道会社は必須項目です</p>
                                <p>• 路線カラーは16進数（例：#009639）で入力してください</p>
                                <p>• 編集内容は即座に反映されます</p>
                                <p>• 路線に駅が登録されている場合でも編集は可能です</p>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </LineManagementAccess>
    )
}