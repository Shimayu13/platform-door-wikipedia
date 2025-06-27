"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle, XCircle, Save, Trash2, Plus, Settings, Wrench, Train } from "lucide-react"
import { updatePlatformDoor, deletePlatformDoor, type PlatformDoorInput } from "@/lib/actions"
import type { Station, PlatformDoor } from "@/lib/supabase"

interface PlatformDoorFormProps {
  station: Station
  userId: string
  canDelete?: boolean
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "稼働":
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case "設置":
      return <Settings className="h-4 w-4 text-blue-600" />
    case "復元":
      return <Wrench className="h-4 w-4 text-purple-600" />
    case "仮覆工":
      return <Clock className="h-4 w-4 text-orange-600" />
    default:
      return <XCircle className="h-4 w-4 text-gray-600" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "稼働":
      return "bg-green-500"
    case "設置":
      return "bg-blue-500"
    case "復元":
      return "bg-purple-500"
    case "仮覆工":
      return "bg-orange-500"
    default:
      return "bg-gray-300"
  }
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "稼働":
      return "default"
    case "設置":
      return "secondary"
    case "復元":
      return "outline"
    case "仮覆工":
      return "secondary"
    default:
      return "destructive"
  }
}

export function PlatformDoorForm({ station, userId, canDelete = false }: PlatformDoorFormProps) {
  const [platformDoors, setPlatformDoors] = useState<PlatformDoor[]>(station.platform_doors || [])
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null)
  const [newPlatform, setNewPlatform] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [formData, setFormData] = useState<PlatformDoorInput>({
    station_id: station.id,
    line_id: "",
    platform_number: "",
    platform_name: "",
    status: "未設置",
    direction: "",
    installation_date: "",
    planned_date: "",
    installation_datetime: "",
    operation_datetime: "",
    door_type: "",
    manufacturer: "",
    notes: "",
  })

  // 駅の路線一覧を取得
  const stationLines = station.station_lines || []

  const resetForm = () => {
    setFormData({
      station_id: station.id,
      line_id: "",
      platform_number: "",
      platform_name: "",
      status: "未設置",
      direction: "",
      installation_date: "",
      planned_date: "",
      installation_datetime: "",
      operation_datetime: "",
      door_type: "",
      manufacturer: "",
      notes: "",
    })
    setEditingPlatform(null)
    setNewPlatform(false)
  }

  const startEdit = (platform: PlatformDoor) => {
    setFormData({
      station_id: platform.station_id,
      line_id: platform.line_id,
      platform_number: platform.platform_number,
      platform_name: platform.platform_name || "",
      status: platform.status,
      direction: platform.direction || "",
      installation_date: platform.installation_date || "",
      planned_date: platform.planned_date || "",
      installation_datetime: platform.installation_datetime || "",
      operation_datetime: platform.operation_datetime || "",
      door_type: platform.door_type || "",
      manufacturer: platform.manufacturer || "",
      notes: platform.notes || "",
    })
    setEditingPlatform(platform.id)
    setNewPlatform(false)
  }

  const startNew = () => {
    resetForm()
    setNewPlatform(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (!formData.line_id) {
      setMessage({ type: "error", text: "路線を選択してください" })
      setLoading(false)
      return
    }

    try {
      const result = await updatePlatformDoor(formData, userId)

      if (result.success) {
        setMessage({ type: "success", text: "ホームドア情報を更新しました" })

        // ローカル状態を更新
        if (editingPlatform) {
          setPlatformDoors((prev) => prev.map((p) => (p.id === editingPlatform ? { ...p, ...formData } : p)))
        } else {
          // 新規作成の場合、リストに追加
          setPlatformDoors((prev) => [...prev, result.data])
        }

        resetForm()
      } else {
        setMessage({ type: "error", text: result.error || "更新に失敗しました" })
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setMessage({ type: "error", text: "予期しないエラーが発生しました" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (platformId: string) => {
    if (!confirm("このホームドア情報を削除しますか？")) return

    setLoading(true)
    setMessage(null)

    try {
      const result = await deletePlatformDoor(platformId, userId)

      if (result.success) {
        setMessage({ type: "success", text: "ホームドア情報を削除しました" })
        setPlatformDoors((prev) => prev.filter((p) => p.id !== platformId))
        resetForm()
      } else {
        setMessage({ type: "error", text: result.error || "削除に失敗しました" })
      }
    } catch (error) {
      console.error("Error deleting platform:", error)
      setMessage({ type: "error", text: "予期しないエラーが発生しました" })
    } finally {
      setLoading(false)
    }
  }

  // 路線別にホームドアをグループ化
  const platformDoorsByLine = platformDoors.reduce(
    (acc, door) => {
      const lineId = door.line_id
      if (!acc[lineId]) {
        acc[lineId] = []
      }
      acc[lineId].push(door)
      return acc
    },
    {} as Record<string, PlatformDoor[]>,
  )

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

      {/* 駅情報 */}
      <Card>
        <CardHeader>
          <CardTitle>{station.name} のホームドア情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">この駅の路線:</h4>
            <div className="flex flex-wrap gap-2">
              {stationLines.map((stationLine) => (
                <Badge key={stationLine.id} variant="outline" className="flex items-center gap-2">
                  <Train className="h-3 w-3" />
                  <span>{stationLine.lines?.railway_companies?.name}</span>
                  <span>{stationLine.lines?.name}</span>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 路線別ホームドア一覧 */}
      {stationLines.map((stationLine) => {
        const linePlatforms = platformDoorsByLine[stationLine.line_id] || []
        return (
          <Card key={stationLine.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Train className="h-5 w-5" />
                  {stationLine.lines?.railway_companies?.name} {stationLine.lines?.name}
                </CardTitle>
                <Button onClick={startNew} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  ホーム追加
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {linePlatforms.length > 0 ? (
                <div className="space-y-3">
                  {linePlatforms
                    .sort((a, b) => {
                      const aNum = Number.parseInt(a.platform_number) || 0
                      const bNum = Number.parseInt(b.platform_number) || 0
                      return aNum - bNum
                    })
                    .map((platform) => (
                      <div key={platform.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getStatusIcon(platform.status)}
                              <span className="font-medium">{platform.platform_number}番線</span>
                              {platform.platform_name && (
                                <span className="text-gray-600">({platform.platform_name})</span>
                              )}
                              {platform.direction && (
                                <span className="text-sm text-blue-600">{platform.direction}</span>
                              )}
                              <Badge variant={getStatusBadgeVariant(platform.status)}>{platform.status}</Badge>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              {platform.door_type && <div>タイプ: {platform.door_type}</div>}
                              {platform.manufacturer && <div>メーカー: {platform.manufacturer}</div>}
                              {platform.installation_datetime && (
                                <div>設置日時: {new Date(platform.installation_datetime).toLocaleString("ja-JP")}</div>
                              )}
                              {platform.operation_datetime && (
                                <div>稼働日時: {new Date(platform.operation_datetime).toLocaleString("ja-JP")}</div>
                              )}
                              {platform.notes && <div>備考: {platform.notes}</div>}
                            </div>

                            {/* 進捗バー */}
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${getStatusColor(platform.status)}`}
                                  style={{
                                    width:
                                      platform.status === "稼働"
                                        ? "100%"
                                        : platform.status === "設置"
                                          ? "80%"
                                          : platform.status === "復元"
                                            ? "60%"
                                            : platform.status === "仮覆工"
                                              ? "40%"
                                              : "0%",
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => startEdit(platform)}>
                              編集
                            </Button>
                            {canDelete && (
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(platform.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>この路線のホームドア情報はまだ登録されていません</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}

      {/* 編集フォーム */}
      {(editingPlatform || newPlatform) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingPlatform ? "ホームドア情報を編集" : "新しいホームドア情報を追加"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="line_id">路線 *</Label>
                  <Select
                    value={formData.line_id}
                    onValueChange={(value) => setFormData({ ...formData, line_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="路線を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {stationLines.map((stationLine) => (
                        <SelectItem key={stationLine.line_id} value={stationLine.line_id}>
                          {stationLine.lines?.railway_companies?.name} {stationLine.lines?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform_number">番線 *</Label>
                  <Input
                    id="platform_number"
                    value={formData.platform_number}
                    onChange={(e) => setFormData({ ...formData, platform_number: e.target.value })}
                    placeholder="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform_name">ホーム名</Label>
                  <Input
                    id="platform_name"
                    value={formData.platform_name}
                    onChange={(e) => setFormData({ ...formData, platform_name: e.target.value })}
                    placeholder="山手線内回り"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="direction">方向</Label>
                  <Select
                    value={formData.direction}
                    onValueChange={(value) => setFormData({ ...formData, direction: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="方向を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="上り">上り</SelectItem>
                      <SelectItem value="下り">下り</SelectItem>
                      <SelectItem value="内回り">内回り</SelectItem>
                      <SelectItem value="外回り">外回り</SelectItem>
                      <SelectItem value="東行">東行</SelectItem>
                      <SelectItem value="西行">西行</SelectItem>
                      <SelectItem value="南行">南行</SelectItem>
                      <SelectItem value="北行">北行</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">進捗状況 *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="未設置">未設置</SelectItem>
                      <SelectItem value="仮覆工">仮覆工</SelectItem>
                      <SelectItem value="復元">復元</SelectItem>
                      <SelectItem value="設置">設置</SelectItem>
                      <SelectItem value="稼働">稼働</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="installation_datetime">設置日時</Label>
                  <Input
                    id="installation_datetime"
                    type="datetime-local"
                    value={formData.installation_datetime}
                    onChange={(e) => setFormData({ ...formData, installation_datetime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operation_datetime">稼働日時</Label>
                  <Input
                    id="operation_datetime"
                    type="datetime-local"
                    value={formData.operation_datetime}
                    onChange={(e) => setFormData({ ...formData, operation_datetime: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="planned_date">設置予定日</Label>
                  <Input
                    id="planned_date"
                    type="date"
                    value={formData.planned_date}
                    onChange={(e) => setFormData({ ...formData, planned_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="door_type">ホームドアタイプ</Label>
                  <Select
                    value={formData.door_type}
                    onValueChange={(value) => setFormData({ ...formData, door_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="フルハイト">フルハイト</SelectItem>
                      <SelectItem value="ハーフハイト">ハーフハイト</SelectItem>
                      <SelectItem value="ロープ式">ロープ式</SelectItem>
                      <SelectItem value="昇降バー式">昇降バー式</SelectItem>
                      <SelectItem value="その他">その他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacturer">メーカー</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  placeholder="日本信号"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">備考</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="追加情報や特記事項があれば入力してください"
                  rows={3}
                />
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
    </div>
  )
}
