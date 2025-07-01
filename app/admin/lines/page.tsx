// app/admin/lines/page.tsx - 完全版
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Train,
    Search,
    Edit,
    Trash2,
    ArrowLeft,
    Plus,
    Building2,
    MapPin,
    AlertCircle,
    CheckCircle
} from "lucide-react"
import Link from "next/link"
import { usePermissions } from "@/hooks/use-permissions"
import { LineManagementAccess } from "@/components/access-control"

interface Line {
    id: string
    name: string
    company_name: string
    company_id: string
    stations_count: number
    created_at: string
    updated_at: string
}

interface RailwayCompany {
    id: string
    name: string
    type: string
}

export default function LineAdminPage() {
    const { user, profile } = usePermissions()
    const [lines, setLines] = useState<Line[]>([])
    const [companies, setCompanies] = useState<RailwayCompany[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterCompany, setFilterCompany] = useState<string>("all")
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

    // データを取得
    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            // ここで路線と鉄道会社のデータを取得
            // 現在はモックデータを使用
            const mockCompanies: RailwayCompany[] = [
                { id: "1", name: "JR東日本", type: "JR" },
                { id: "2", name: "東京メトロ", type: "地下鉄" },
                { id: "3", name: "東急電鉄", type: "私鉄" },
                { id: "4", name: "小田急電鉄", type: "私鉄" }
            ]

            const mockLines: Line[] = [
                {
                    id: "1",
                    name: "山手線",
                    company_name: "JR東日本",
                    company_id: "1",
                    stations_count: 30,
                    created_at: "2024-01-01T00:00:00Z",
                    updated_at: "2024-01-01T00:00:00Z"
                },
                {
                    id: "2",
                    name: "中央線",
                    company_name: "JR東日本",
                    company_id: "1",
                    stations_count: 45,
                    created_at: "2024-01-01T00:00:00Z",
                    updated_at: "2024-01-01T00:00:00Z"
                },
                {
                    id: "3",
                    name: "銀座線",
                    company_name: "東京メトロ",
                    company_id: "2",
                    stations_count: 19,
                    created_at: "2024-01-01T00:00:00Z",
                    updated_at: "2024-01-01T00:00:00Z"
                },
                {
                    id: "4",
                    name: "東横線",
                    company_name: "東急電鉄",
                    company_id: "3",
                    stations_count: 21,
                    created_at: "2024-01-01T00:00:00Z",
                    updated_at: "2024-01-01T00:00:00Z"
                }
            ]

            setCompanies(mockCompanies)
            setLines(mockLines)
        } catch (error) {
            console.error("Error fetching data:", error)
            setMessage({ type: "error", text: "データの取得に失敗しました" })
        } finally {
            setLoading(false)
        }
    }

    // 路線削除処理
    const handleDeleteLine = async (lineId: string, lineName: string) => {
        if (!confirm(`「${lineName}」を削除しますか？この操作は取り消せません。`)) {
            return
        }

        try {
            setMessage(null)
            // ここで削除の実装
            console.log(`Deleting line ${lineId}`)
            
            // ローカル状態を更新
            setLines(prev => prev.filter(line => line.id !== lineId))
            
            setMessage({ type: "success", text: `路線「${lineName}」を削除しました` })
        } catch (error) {
            console.error("Error deleting line:", error)
            setMessage({ type: "error", text: "路線の削除に失敗しました" })
        }
    }

    // フィルタリング処理
    const filteredLines = lines.filter(line => {
        const matchesSearch = line.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            line.company_name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCompany = filterCompany === "all" || line.company_id === filterCompany
        return matchesSearch && matchesCompany
    })

    const getCompanyTypeColor = (type: string) => {
        switch (type) {
            case "JR":
                return "bg-blue-100 text-blue-800"
            case "地下鉄":
                return "bg-purple-100 text-purple-800"
            case "私鉄":
                return "bg-green-100 text-green-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
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
                                    <Link href="/admin">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        管理メニューに戻る
                                    </Link>
                                </Button>
                                <div className="border-l pl-4">
                                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        <Train className="h-6 w-6 text-green-600" />
                                        路線管理
                                    </h1>
                                    <p className="text-sm text-gray-600">路線の基本情報と管理</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                                <Button asChild variant="outline">
                                    <Link href="/admin/lines/new">
                                        <Plus className="h-4 w-4 mr-2" />
                                        新規路線登録
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* メインコンテンツ */}
                <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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

                    <div className="space-y-6">
                        {/* 概要カード */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">総路線数</CardTitle>
                                    <Train className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{lines.length}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">JR路線</CardTitle>
                                    <Badge className="bg-blue-100 text-blue-800">JR</Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {companies.find(c => c.type === "JR") ? 
                                         lines.filter(line => companies.find(c => c.id === line.company_id)?.type === "JR").length : 0}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">地下鉄</CardTitle>
                                    <Badge className="bg-purple-100 text-purple-800">地下鉄</Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {companies.find(c => c.type === "地下鉄") ? 
                                         lines.filter(line => companies.find(c => c.id === line.company_id)?.type === "地下鉄").length : 0}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">私鉄</CardTitle>
                                    <Badge className="bg-green-100 text-green-800">私鉄</Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {companies.find(c => c.type === "私鉄") ? 
                                         lines.filter(line => companies.find(c => c.id === line.company_id)?.type === "私鉄").length : 0}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 路線一覧 */}
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>路線一覧</CardTitle>
                                        <p className="text-sm text-gray-600 mt-1">
                                            路線の編集・削除ができます
                                        </p>
                                    </div>
                                </div>

                                {/* 検索・フィルター */}
                                <div className="flex space-x-4 mt-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="路線名または鉄道会社名で検索..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    <Select value={filterCompany} onValueChange={setFilterCompany}>
                                        <SelectTrigger className="w-48">
                                            <SelectValue placeholder="鉄道会社で絞り込み" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">すべての鉄道会社</SelectItem>
                                            {companies.map((company) => (
                                                <SelectItem key={company.id} value={company.id}>
                                                    {company.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <div className="space-y-4">
                                    {loading ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                            <p className="mt-2 text-gray-600">読み込み中...</p>
                                        </div>
                                    ) : (
                                        filteredLines.map((line) => {
                                            const company = companies.find(c => c.id === line.company_id)
                                            return (
                                                <div key={line.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                            <Train className="h-5 w-5 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center space-x-2">
                                                                <p className="font-medium">{line.name}</p>
                                                                {company && (
                                                                    <Badge className={getCompanyTypeColor(company.type)}>
                                                                        {company.type}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-500">{line.company_name}</p>
                                                            <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                                                                <span className="flex items-center">
                                                                    <MapPin className="h-3 w-3 mr-1" />
                                                                    {line.stations_count}駅
                                                                </span>
                                                                <span>
                                                                    更新: {new Date(line.updated_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/admin/lines/${line.id}/edit`}>
                                                                <Edit className="h-4 w-4 mr-1" />
                                                                編集
                                                            </Link>
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => handleDeleteLine(line.id, line.name)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-1" />
                                                            削除
                                                        </Button>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}

                                    {!loading && filteredLines.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            <Train className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                            <p>条件に一致する路線が見つかりませんでした</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </LineManagementAccess>
    )
}