// app/admin/lines/page.tsx - データベース統合修正版
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
import { getRailwayCompanies, getLines, type Line, type RailwayCompany } from "@/lib/supabase"
import { deleteLine } from "@/lib/actions"

interface LineWithCompany extends Line {
    railway_companies?: RailwayCompany
    stations_count?: number
}

export default function LineAdminPage() {
    const { user, profile } = usePermissions()
    const [lines, setLines] = useState<LineWithCompany[]>([])
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
            
            // 実際のデータベースからデータを取得
            const [linesData, companiesData] = await Promise.all([
                getLines(),
                getRailwayCompanies()
            ])

            console.log("路線データ:", linesData)
            console.log("鉄道会社データ:", companiesData)

            // 路線データに駅数を追加（必要に応じて）
            const linesWithStationCount = await Promise.all(
                linesData.map(async (line) => {
                    try {
                        // 各路線の駅数をカウント
                        const { supabase } = await import('@/lib/supabase')
                        const { count } = await supabase
                            .from('station_lines')
                            .select('*', { count: 'exact' })
                            .eq('line_id', line.id)

                        return {
                            ...line,
                            stations_count: count || 0
                        }
                    } catch (error) {
                        console.error(`Error counting stations for line ${line.id}:`, error)
                        return {
                            ...line,
                            stations_count: 0
                        }
                    }
                })
            )

            setLines(linesWithStationCount)
            setCompanies(companiesData)
            
        } catch (error) {
            console.error("データの取得エラー:", error)
            setMessage({ 
                type: "error", 
                text: "データの取得に失敗しました。ページをリロードして再試行してください。" 
            })
        } finally {
            setLoading(false)
        }
    }

    // 路線削除処理
    const handleDeleteLine = async (lineId: string, lineName: string) => {
        if (!confirm(`「${lineName}」を削除しますか？この操作は取り消せません。`)) {
            return
        }

        if (!user) {
            setMessage({ type: "error", text: "ログインが必要です" })
            return
        }

        try {
            setMessage(null)
            const result = await deleteLine(lineId, user.id)
            
            if (result.success) {
                // ローカル状態を更新
                setLines(prev => prev.filter(line => line.id !== lineId))
                setMessage({ type: "success", text: result.message || `路線「${lineName}」を削除しました` })
            } else {
                setMessage({ type: "error", text: result.error || "路線の削除に失敗しました" })
            }
        } catch (error) {
            console.error("路線削除エラー:", error)
            setMessage({ type: "error", text: "路線の削除に失敗しました" })
        }
    }

    // フィルタリング処理
    const filteredLines = lines.filter(line => {
        const companyName = line.railway_companies?.name || ""
        const matchesSearch = line.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            companyName.toLowerCase().includes(searchTerm.toLowerCase())
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

    // 路線数の集計
    const lineStats = {
        total: lines.length,
        jr: lines.filter(line => line.railway_companies?.type === "JR").length,
        subway: lines.filter(line => line.railway_companies?.type === "地下鉄").length,
        private: lines.filter(line => line.railway_companies?.type === "私鉄").length,
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
                            <Button asChild>
                                <Link href="/admin/lines/new">
                                    <Plus className="h-4 w-4 mr-2" />
                                    新規路線登録
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* メインコンテンツ */}
                <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    {/* 統計カード */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Train className="h-6 w-6 text-gray-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">総路線数</p>
                                        <p className="text-2xl font-bold text-gray-900">{lineStats.total}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Building2 className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">JR路線</p>
                                        <p className="text-2xl font-bold text-gray-900">{lineStats.jr}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <MapPin className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">地下鉄</p>
                                        <p className="text-2xl font-bold text-gray-900">{lineStats.subway}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Train className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">私鉄</p>
                                        <p className="text-2xl font-bold text-gray-900">{lineStats.private}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

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

                    {/* 検索・フィルター */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>路線一覧</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="路線名、会社名で検索..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={filterCompany} onValueChange={setFilterCompany}>
                                    <SelectTrigger>
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

                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="text-gray-500">データを読み込み中...</div>
                                </div>
                            ) : filteredLines.length === 0 ? (
                                <div className="text-center py-8">
                                    <Train className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">路線が見つかりません</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {searchTerm || filterCompany !== "all" ? "検索条件を変更してください" : "最初の路線を登録してください"}
                                    </p>
                                    {(!searchTerm && filterCompany === "all") && (
                                        <div className="mt-6">
                                            <Button asChild>
                                                <Link href="/admin/lines/new">
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    新規路線登録
                                                </Link>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredLines.map((line) => (
                                        <div key={line.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div 
                                                        className="w-4 h-4 rounded-full border-2" 
                                                        style={{ 
                                                            backgroundColor: line.color || line.line_color || '#666666',
                                                            borderColor: line.color || line.line_color || '#666666'
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900">{line.name}</h3>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <Badge 
                                                            className={getCompanyTypeColor(line.railway_companies?.type || "")}
                                                        >
                                                            {line.railway_companies?.name || "不明"}
                                                        </Badge>
                                                        <span className="text-sm text-gray-500">
                                                            {line.stations_count || 0}駅
                                                        </span>
                                                        <span className="text-xs text-gray-400">
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
                                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    削除
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>
        </LineManagementAccess>
    )
}