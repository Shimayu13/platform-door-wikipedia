// components/platform-door-form.tsx を置き換える内容
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
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Save, 
  Trash2, 
  Plus, 
  Settings, 
  Wrench, 
  Train,
  Edit,
  X,
  Calendar
} from "lucide-react"
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
    case "稼働": return "bg-green-100 text-green-800 border-green-200"
    case "設置": return "bg-blue-100 text-blue-800 border-blue-200"
    case "復元": return "bg-purple-100 text-purple-800 border-purple-200"
    case "仮覆工": return "bg-orange-100 text-orange-800 border-orange-200"
    case "未設置": return "bg-gray-100 text-gray-800 border-gray-200"
    default: return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export function PlatformDoorForm({ station, userId, canDelete = false }: PlatformDoorFormProps) {
  const [platformDoors, setPlatformDoors] = useState<PlatformDoor[]>([])
  const [loading, setLoading] = useState(false)
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null)
  const [newPlatform, setNewPlatform] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'edit'>('list')
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

  const statusOptions = ["未設置", "仮覆工", "復元", "設置", "稼働"]
  const doorTypeOptions = ["全高式", "腰高式", "ロープ式", "ハーフハイト", "その他"]
  const manufacturerOptions = ["日本信号", "京三製作所", "大同信号", "ナブテスコ", "その他"]

  // 駅の路線一覧を取得
  const stationLines = station.station_lines || []

  // ホームドア情報を取得
  useEffect(() => {
    fetchPlatformDoors()
  }, [station.id])

  const fetchPlatformDoors = async () => {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from("platform_doors")
        .select("*")
        .eq("station_id", station.id)
        .order("line_id", { ascending: true })
        .order("platform_number", { ascending: true })

      if (error) {
        console.error("Error fetching platform doors:", error)
        setMessage({ type: "error", text: "データの取得に失敗しました" })
      } else {
        setPlatformDoors(data || [])
      }
    } catch (error) {
      console.error("Error:", error)
      setMessage({ type: "error", text: "予期しないエラーが発生しました" })
    }
  }

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
    setViewMode('list')
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
    setViewMode('edit')
  }

  const startNew = () => {
    resetForm()
    setNewPlatform(true)
    setViewMode('edit')
  }

  const handleInputChange = (field: keyof PlatformDoorInput, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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

    if (!formData.platform_number) {
      setMessage({ type: "error", text: "ホーム番号を入力してください" })
      setLoading(false)
      return
    }

    try {
      const { supabase } = await import('@/lib/supabase')

      // 認証状態を確認
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setMessage({ type: "error", text: "認証が必要です" })
        setLoading(false)
        return
      }

      // ユーザープロフィールを確認
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || !['提供者', '編集者', '開発者'].includes(profile.role)) {
        setMessage({ type: "error", text: "この操作を行う権限がありません" })
        setLoading(false)
        return
      }

      let result
      if (editingPlatform) {
        // 更新処理
        const { data: updated, error: updateError } = await supabase
          .from("platform_doors")
          .update({
            platform_name: formData.platform_name,
            status: formData.status,
            direction: formData.direction,
            installation_date: formData.installation_date || null,
            planned_date: formData.planned_date || null,
            installation_datetime: formData.installation_datetime || null,
            operation_datetime: formData.operation_datetime || null,
            door_type: formData.door_type,
            manufacturer: formData.manufacturer,
            notes: formData.notes,
            updated_by: user.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingPlatform)
          .select()
          .single()

        if (updateError) {
          console.error("Error updating platform door:", updateError)
          setMessage({ type: "error", text: `更新に失敗しました: ${updateError.message}` })
          setLoading(false)
          return
        }
        result = updated
        setMessage({ type: "success", text: "ホームドア情報を更新しました" })
      } else {
        // 重複チェック
        const { data: existing, error: checkError } = await supabase
          .from("platform_doors")
          .select("id")
          .eq("station_id", formData.station_id)
          .eq("line_id", formData.line_id)
          .eq("platform_number", formData.platform_number)
          .single()

        if (existing) {
          setMessage({ type: "error", text: "同じホームの情報が既に登録されています" })
          setLoading(false)
          return
        }

        // 新規作成処理
        const { data: created, error: createError } = await supabase
          .from("platform_doors")
          .insert({
            station_id: formData.station_id,
            line_id: formData.line_id,
            platform_number: formData.platform_number,
            platform_name: formData.platform_name,
            status: formData.status,
            direction: formData.direction,
            installation_date: formData.installation_date || null,
            planned_date: formData.planned_date || null,
            installation_datetime: formData.installation_datetime || null,
            operation_datetime: formData.operation_datetime || null,
            door_type: formData.door_type,
            manufacturer: formData.manufacturer,
            notes: formData.notes,
            updated_by: user.id,
          })
          .select()
          .single()

        if (createError) {
          console.error("Error creating platform door:", createError)
          setMessage({ type: "error", text: `作成に失敗しました: ${createError.message}` })
          setLoading(false)
          return
        }
        result = created
        setMessage({ type: "success", text: "ホームドア情報を登録しました" })
      }

      // データを再取得
      await fetchPlatformDoors()
      resetForm()
    } catch (error) {
      console.error("Error submitting form:", error)
      setMessage({ type: "error", text: "予期しないエラーが発生しました" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (platformId: string) => {
    if (!confirm("このホームドア情報を削除しますか？この操作は取り消せません。")) return

    setLoading(true)
    setMessage(null)

    try {
      const { supabase } = await import('@/lib/supabase')

      const { error } = await supabase
        .from("platform_doors")
        .delete()
        .eq("id", platformId)

      if (error) {
        console.error("Error deleting platform door:", error)
        setMessage({ type: "error", text: `削除に失敗しました: ${error.message}` })
      } else {
        setMessage({ type: "success", text: "ホームドア情報を削除しました" })
        await fetchPlatformDoors()
      }
    } catch (error) {
      console.error("Error:", error)
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
          <CardTitle className="flex items-center justify-between">
            <span>{station.name} のホームドア情報</span>
            {viewMode === 'list' && (
              <Button onClick={startNew} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                新規追加
              </Button>
            )}
          </CardTitle>
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

      {/* 編集フォーム */}
      {viewMode === 'edit' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{editingPlatform ? "ホームドア情報の編集" : "新しいホームドア情報の追加"}</span>
              <Button variant="outline" onClick={resetForm} size="sm">
                <X className="h-4 w-4 mr-2" />
                キャンセル
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="line_id">路線 *</Label>
                  <Select 
                    value={formData.line_id} 
                    onValueChange={(value) => handleInputChange('line_id', value)}
                    disabled={!!editingPlatform}
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

                <div>
                  <Label htmlFor="platform_number">ホーム番号 *</Label>
                  <Input
                    id="platform_number"
                    value={formData.platform_number}
                    onChange={(e) => handleInputChange('platform_number', e.target.value)}
                    placeholder="例: 1, 2, A, B"
                    disabled={!!editingPlatform}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="platform_name">ホーム名称</Label>
                  <Input
                    id="platform_name"
                    value={formData.platform_name}
                    onChange={(e) => handleInputChange('platform_name', e.target.value)}
                    placeholder="例: 上野・日光・鬼怒川方面"
                  />
                </div>

                <div>
                  <Label htmlFor="direction">方向</Label>
                  <Input
                    id="direction"
                    value={formData.direction}
                    onChange={(e) => handleInputChange('direction', e.target.value)}
                    placeholder="例: 上り、下り、内回り、外回り"
                  />
                </div>

                <div>
                  <Label htmlFor="status">設置状況 *</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="door_type">ドアタイプ</Label>
                  <Select 
                    value={formData.door_type} 
                    onValueChange={(value) => handleInputChange('door_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="ドアタイプを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {doorTypeOptions.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="manufacturer">メーカー</Label>
                  <Select 
                    value={formData.manufacturer} 
                    onValueChange={(value) => handleInputChange('manufacturer', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="メーカーを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {manufacturerOptions.map((manufacturer) => (
                        <SelectItem key={manufacturer} value={manufacturer}>
                          {manufacturer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="planned_date">設置予定日</Label>
                  <Input
                    id="planned_date"
                    type="date"
                    value={formData.planned_date}
                    onChange={(e) => handleInputChange('planned_date', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="installation_date">設置完了日</Label>
                  <Input
                    id="installation_date"
                    type="date"
                    value={formData.installation_date}
                    onChange={(e) => handleInputChange('installation_date', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="installation_datetime">設置日時</Label>
                  <Input
                    id="installation_datetime"
                    type="datetime-local"
                    value={formData.installation_datetime}
                    onChange={(e) => handleInputChange('installation_datetime', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="operation_datetime">稼働開始日時</Label>
                  <Input
                    id="operation_datetime"
                    type="datetime-local"
                    value={formData.operation_datetime}
                    onChange={(e) => handleInputChange('operation_datetime', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">備考</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="追加情報や注意事項など"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "保存中..." : editingPlatform ? "更新" : "登録"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  キャンセル
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ホームドア一覧 */}
      {viewMode === 'list' && (
        <>
          {stationLines.map((stationLine) => {
            const linePlatforms = platformDoorsByLine[stationLine.line_id] || []
            return (
              <Card key={stationLine.id}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Train className="h-5 w-5" />
                    {stationLine.lines?.railway_companies?.name} {stationLine.lines?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {linePlatforms.length > 0 ? (
                    <div className="space-y-3">
                      {linePlatforms.map((platform) => (
                        <div key={platform.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium">
                                  ホーム {platform.platform_number}
                                  {platform.platform_name && ` (${platform.platform_name})`}
                                </h4>
                                <Badge className={getStatusColor(platform.status)}>
                                  {getStatusIcon(platform.status)}
                                  <span className="ml-1">{platform.status}</span>
                                </Badge>
                                {platform.direction && (
                                  <Badge variant="outline">{platform.direction}</Badge>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                                {platform.door_type && (
                                  <div>ドアタイプ: {platform.door_type}</div>
                                )}
                                {platform.manufacturer && (
                                  <div>メーカー: {platform.manufacturer}</div>
                                )}
                                {platform.installation_date && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    設置: {platform.installation_date}
                                  </div>
                                )}
                                {platform.operation_datetime && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    稼働: {new Date(platform.operation_datetime).toLocaleString('ja-JP')}
                                  </div>
                                )}
                              </div>
                              
                              {platform.notes && (
                                <div className="mt-2 text-sm text-gray-600">
                                  備考: {platform.notes}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEdit(platform)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                編集
                              </Button>
                              {canDelete && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDelete(platform.id)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  削除
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      この路線にはまだホームドア情報が登録されていません
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </>
      )}
    </div>
  )
}