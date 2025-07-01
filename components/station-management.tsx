// components/station-management.tsx の型定義修正部分

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PlatformDoor } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    MapPin,
    Edit,
    Trash2,
    Save,
    X,
    Plus,
    Train,
    AlertCircle,
    CheckCircle,
    Search,
    MoreHorizontal
} from "lucide-react"
import {
    updateStation,
    deleteStation,
    getStationDetails,
    addLineToStation,
    removeLineFromStation,
    type StationUpdateInput
} from "@/lib/actions"
import { getRailwayCompanies, getLines, getStations, type Station, type RailwayCompany, type Line, type StationLine } from "@/lib/supabase"

interface StationManagementProps {
    userId: string
    userRole: string
}

// Station型を正しく拡張
interface ExtendedStation extends Station {
    // Stationを直接継承し、必要に応じて追加プロパティのみ定義
}

// その他の必要な型定義
interface StationFilter {
    search: string
    company: string
    prefecture: string
    hasLines: boolean
}

interface EditingStation {
    id: string
    name: string
    prefecture: string
    city: string
    address: string
    latitude?: number
    longitude?: number
}

const PREFECTURES = [
    "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
    "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
    "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
    "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
    "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
    "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
    "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
]

export default function StationManagement({ userId, userRole }: StationManagementProps) {
    const [stations, setStations] = useState<ExtendedStation[]>([])
    const [companies, setCompanies] = useState<RailwayCompany[]>([])
    const [lines, setLines] = useState<Line[]>([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedPrefecture, setSelectedPrefecture] = useState("all")
    const [editingStation, setEditingStation] = useState<string | null>(null)
    const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null)
    const [showAddLineDialog, setShowAddLineDialog] = useState<string | null>(null)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

    const [editFormData, setEditFormData] = useState<StationUpdateInput>({
        name: "",
        prefecture: "",
        city: "",
        address: "",
        latitude: undefined,
        longitude: undefined,
    })

    const [lineFormData, setLineFormData] = useState({
        companyId: "",
        lineId: "",
        stationCode: "",
    })

    // データの読み込み
    useEffect(() => {
        loadStations()
        loadCompanies()
        loadLines()
    }, [])

    const loadStations = async () => {
        try {
            const stationsData = await getStations()
            setStations(stationsData as ExtendedStation[])
        } catch (error) {
            console.error("Error loading stations:", error)
            setMessage({ type: "error", text: "駅一覧の取得に失敗しました" })
        }
    }

    const loadCompanies = async () => {
        try {
            const companiesData = await getRailwayCompanies()
            setCompanies(companiesData)
        } catch (error) {
            console.error("Error loading companies:", error)
        }
    }

    const loadLines = async () => {
        try {
            const linesData = await getLines()
            setLines(linesData)
        } catch (error) {
            console.error("Error loading lines:", error)
        }
    }

    // フィルタリング
    const filteredStations = stations.filter(station => {
        const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesPrefecture = !selectedPrefecture || selectedPrefecture === "all" || station.prefecture === selectedPrefecture
        return matchesSearch && matchesPrefecture
    })

    // 編集開始
    const startEdit = (station: ExtendedStation) => {
        setEditFormData({
            name: station.name,
            prefecture: station.prefecture || "",
            city: station.city || "",
            address: station.address || "",
            latitude: station.latitude,
            longitude: station.longitude,
        })

        setEditingStation(station.id)
        setMessage(null)
    }

    // 編集キャンセル
    const cancelEdit = () => {
        setEditingStation(null)
        setEditFormData({
            name: "",
            prefecture: "",
            city: "",
            address: "",
            latitude: undefined,
            longitude: undefined,
        })
        setMessage(null)
    }

    // 更新処理
    const handleUpdate = async (stationId: string) => {
        setLoading(true)
        setMessage(null)

        try {
            const result = await updateStation(stationId, editFormData, userId)

            if (result.success) {
                setMessage({ type: "success", text: result.message || "駅情報を更新しました" })
                await loadStations()
                cancelEdit()
            } else {
                setMessage({ type: "error", text: result.error || "更新に失敗しました" })
            }
        } catch (error) {
            console.error("Error updating station:", error)
            setMessage({ type: "error", text: "予期しないエラーが発生しました" })
        } finally {
            setLoading(false)
        }
    }

    // 削除処理
    const handleDelete = async (stationId: string) => {
        setLoading(true)
        setMessage(null)

        try {
            const result = await deleteStation(stationId, userId)

            if (result.success) {
                setMessage({ type: "success", text: result.message || "駅情報を削除しました" })
                await loadStations()
            } else {
                setMessage({ type: "error", text: result.error || "削除に失敗しました" })
            }
        } catch (error) {
            console.error("Error deleting station:", error)
            setMessage({ type: "error", text: "予期しないエラーが発生しました" })
        } finally {
            setLoading(false)
            setShowDeleteDialog(null)
        }
    }

    // 路線追加処理
    const handleAddLine = async (stationId: string) => {
        if (!lineFormData.lineId) {
            setMessage({ type: "error", text: "路線を選択してください" })
            return
        }

        setLoading(true)
        setMessage(null)

        try {
            const result = await addLineToStation(
                stationId,
                lineFormData.lineId,
                lineFormData.stationCode || undefined,
                userId
            )

            if (result.success) {
                setMessage({ type: "success", text: result.message || "路線を追加しました" })
                await loadStations()
                setShowAddLineDialog(null)
                setLineFormData({ companyId: "", lineId: "", stationCode: "" })
            } else {
                setMessage({ type: "error", text: result.error || "路線の追加に失敗しました" })
            }
        } catch (error) {
            console.error("Error adding line:", error)
            setMessage({ type: "error", text: "予期しないエラーが発生しました" })
        } finally {
            setLoading(false)
        }
    }

    // 路線削除処理
    const handleRemoveLine = async (stationLineId: string) => {
        if (!confirm("この路線を削除しますか？関連するホームドア情報がある場合は削除できません。")) return

        setLoading(true)
        setMessage(null)

        try {
            const result = await removeLineFromStation(stationLineId, userId)

            if (result.success) {
                setMessage({ type: "success", text: result.message || "路線を削除しました" })
                await loadStations()
            } else {
                setMessage({ type: "error", text: result.error || "路線の削除に失敗しました" })
            }
        } catch (error) {
            console.error("Error removing line:", error)
            setMessage({ type: "error", text: "予期しないエラーが発生しました" })
        } finally {
            setLoading(false)
        }
    }

    const canEdit = ['編集者', '開発者'].includes(userRole)
    const canDelete = ['編集者', '開発者'].includes(userRole)

    const getFilteredLines = () => {
        if (!lineFormData.companyId) return []
        return lines.filter(line => line.company_id === lineFormData.companyId)
    }

    return (
        <div className="space-y-6">
            {/* メッセージ */}
            {message && (
                <Alert className={`${message.type === "error" ? "border-red-200" : "border-green-200"}`}>
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
            <Card>
                <CardHeader>
                    <CardTitle>駅情報管理</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="search">駅名で検索</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="search"
                                    placeholder="駅名を入力..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="prefecture">都道府県で絞り込み</Label>
                            <Select value={selectedPrefecture} onValueChange={setSelectedPrefecture}>
                                <SelectTrigger>
                                    <SelectValue placeholder="都道府県を選択" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">すべて</SelectItem>
                                    {PREFECTURES.map((pref) => (
                                        <SelectItem key={pref} value={pref}>
                                            {pref}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm("")
                                    setSelectedPrefecture("")
                                }}
                            >
                                クリア
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 駅一覧 */}
            <div className="grid gap-4">
                {filteredStations.map((station) => (
                    <Card key={station.id}>
                        <CardContent className="p-6">
                            {editingStation === station.id ? (
                                // 編集モード
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="edit-name">駅名 *</Label>
                                            <Input
                                                id="edit-name"
                                                value={editFormData.name}
                                                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="edit-prefecture">都道府県</Label>
                                            <Select
                                                value={editFormData.prefecture}
                                                onValueChange={(value) => setEditFormData({ ...editFormData, prefecture: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="都道府県を選択" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PREFECTURES.map((pref) => (
                                                        <SelectItem key={pref} value={pref}>
                                                            {pref}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="edit-city">市区町村</Label>
                                            <Input
                                                id="edit-city"
                                                value={editFormData.city}
                                                onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                                                placeholder="新宿区"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="edit-address">住所</Label>
                                            <Input
                                                id="edit-address"
                                                value={editFormData.address}
                                                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                                                placeholder="西新宿1-1-1"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="edit-latitude">緯度</Label>
                                            <Input
                                                id="edit-latitude"
                                                type="number"
                                                step="any"
                                                value={editFormData.latitude || ""}
                                                onChange={(e) => setEditFormData({
                                                    ...editFormData,
                                                    latitude: e.target.value ? parseFloat(e.target.value) : undefined
                                                })}
                                                placeholder="35.6894"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="edit-longitude">経度</Label>
                                            <Input
                                                id="edit-longitude"
                                                type="number"
                                                step="any"
                                                value={editFormData.longitude || ""}
                                                onChange={(e) => setEditFormData({
                                                    ...editFormData,
                                                    longitude: e.target.value ? parseFloat(e.target.value) : undefined
                                                })}
                                                placeholder="139.7006"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleUpdate(station.id)}
                                            disabled={loading}
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            {loading ? "保存中..." : "保存"}
                                        </Button>
                                        <Button variant="outline" onClick={cancelEdit}>
                                            <X className="h-4 w-4 mr-2" />
                                            キャンセル
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                // 表示モード
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                                <MapPin className="h-5 w-5 text-blue-600" />
                                                {station.name}
                                            </h3>
                                            <div className="text-sm text-gray-600 mt-1">
                                                {station.prefecture && (
                                                    <span>{station.prefecture}</span>
                                                )}
                                                {station.city && (
                                                    <span>{station.prefecture ? ' ' : ''}{station.city}</span>
                                                )}
                                                {station.address && (
                                                    <span>{station.city || station.prefecture ? ' ' : ''}{station.address}</span>
                                                )}
                                            </div>

                                            {(station.latitude || station.longitude) && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    座標: {station.latitude}, {station.longitude}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            {canEdit && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => startEdit(station)}
                                                >
                                                    <Edit className="h-3 w-3 mr-1" />
                                                    編集
                                                </Button>
                                            )}
                                            {canEdit && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setShowAddLineDialog(station.id)}
                                                >
                                                    <Plus className="h-3 w-3 mr-1" />
                                                    路線追加
                                                </Button>
                                            )}
                                            {canDelete && (
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => setShowDeleteDialog(station.id)}
                                                >
                                                    <Trash2 className="h-3 w-3 mr-1" />
                                                    削除
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* 路線一覧 */}
                                    {station.station_lines && station.station_lines.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm">登録路線:</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {station.station_lines.map((stationLine) => (
                                                    <div key={stationLine.id} className="flex items-center gap-1">
                                                        <Badge variant="secondary" className="flex items-center gap-1">
                                                            <Train className="h-3 w-3" />
                                                            <span>{stationLine.lines?.railway_companies?.name}</span>
                                                            <span>{stationLine.lines?.name}</span>
                                                            {stationLine.station_code && (
                                                                <span className="font-mono text-xs">({stationLine.station_code})</span>
                                                            )}
                                                        </Badge>
                                                        {canDelete && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleRemoveLine(stationLine.id)}
                                                                className="h-6 w-6 p-0"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* ホームドア統計 */}
                                    {station.platform_doors && station.platform_doors.length > 0 && (
                                        <div className="mt-3 pt-3 border-t">
                                            <div className="text-sm text-gray-600">
                                                ホームドア情報: {station.platform_doors.length}件登録済み
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredStations.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>条件に合う駅が見つかりませんでした</p>
                </div>
            )}

            {/* 削除確認ダイアログ */}
            <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>駅情報の削除</DialogTitle>
                        <DialogDescription>
                            この駅情報を削除しますか？関連するホームドア情報がある場合は削除できません。
                            この操作は取り消せません。
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(null)}
                        >
                            キャンセル
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => showDeleteDialog && handleDelete(showDeleteDialog)}
                            disabled={loading}
                        >
                            {loading ? "削除中..." : "削除"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 路線追加ダイアログ */}
            <Dialog open={!!showAddLineDialog} onOpenChange={() => setShowAddLineDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>路線の追加</DialogTitle>
                        <DialogDescription>
                            この駅に新しい路線を追加します。
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="company">鉄道会社</Label>
                            <Select
                                value={lineFormData.companyId}
                                onValueChange={(value) => setLineFormData({ ...lineFormData, companyId: value, lineId: "" })}
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
                            <Label htmlFor="line">路線</Label>
                            <Select
                                value={lineFormData.lineId}
                                onValueChange={(value) => setLineFormData({ ...lineFormData, lineId: value })}
                                disabled={!lineFormData.companyId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="路線を選択" />
                                </SelectTrigger>
                                <SelectContent>
                                    {getFilteredLines().map((line) => (
                                        <SelectItem key={line.id} value={line.id}>
                                            {line.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="station-code">駅ナンバリング（任意）</Label>
                            <Input
                                id="station-code"
                                value={lineFormData.stationCode}
                                onChange={(e) => setLineFormData({ ...lineFormData, stationCode: e.target.value })}
                                placeholder="例: JY17"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowAddLineDialog(null)
                                setLineFormData({ companyId: "", lineId: "", stationCode: "" })
                            }}
                        >
                            キャンセル
                        </Button>
                        <Button
                            onClick={() => showAddLineDialog && handleAddLine(showAddLineDialog)}
                            disabled={loading || !lineFormData.lineId}
                        >
                            {loading ? "追加中..." : "追加"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}