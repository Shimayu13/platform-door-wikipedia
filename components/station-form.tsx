// components/station-form.tsx の拡張版（編集対応）
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Save, MapPin, Plus, X, Edit, Check } from "lucide-react"
import {
  createStation,
  updateStation,
  addLineToStation,
  removeLineFromStation,
  type StationUpdateInput
} from "@/lib/actions"
import {
  getRailwayCompanies,
  getLines,
  type RailwayCompany,
  type Line,
  type StationInput
} from "@/lib/supabase"

interface StationFormProps {
  userId: string
  mode?: "create" | "edit"
  stationData?: {
    id: string
    name: string
    prefecture?: string
    city?: string
    address?: string
    latitude?: number
    longitude?: number
    station_lines?: Array<{
      id: string
      line_id: string
      station_code?: string
      lines?: {
        id: string
        name: string
        railway_companies?: {
          name: string
        }
      }
    }>
  }
  onSuccess?: (station: any) => void
  onCancel?: () => void
}

interface SelectedLine {
  line_id: string
  line: Line
  station_code?: string
  existing_id?: string // 既存レコードの場合のID
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

export function StationForm({
  userId,
  mode = "create",
  stationData,
  onSuccess,
  onCancel
}: StationFormProps) {

  console.log("🚂 STATION FORM COMPONENT RENDERED")
  console.log("- mode:", mode)
  console.log("- stationData:", stationData)
  console.log("- userId:", userId)


  const [companies, setCompanies] = useState<RailwayCompany[]>([])
  const [allLines, setAllLines] = useState<Line[]>([])
  const [selectedLines, setSelectedLines] = useState<SelectedLine[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null)

  const [formData, setFormData] = useState(() => {
    // 編集モードの場合は、stationDataから初期値を設定
    if (mode === "edit" && stationData) {
      console.log("🔧 Setting initial formData from stationData:", stationData)
      return {
        name: stationData.name,
        latitude: stationData.latitude,
        longitude: stationData.longitude,
        prefecture: stationData.prefecture || "",
        city: stationData.city || "",
        address: stationData.address || "",
      }
    }

    // 新規作成モードの場合は空の値
    console.log("🔧 Setting initial formData as empty (create mode)")
    return {
      name: "",
      latitude: undefined as number | undefined,
      longitude: undefined as number | undefined,
      prefecture: "",
      city: "",
      address: "",
    }
  })

  const [lineSelection, setLineSelection] = useState({
    companyId: "",
    lineId: "",
  })

  const [lineDetails, setLineDetails] = useState({
    station_code: "",
  })

  // stationDataの変更を監視して、formDataを更新するuseEffect
  useEffect(() => {
    console.log("🔧 stationData useEffect triggered")
    console.log("- mode:", mode)
    console.log("- stationData:", stationData)

    if (mode === "edit" && stationData) {
      console.log("🔧 Updating formData due to stationData change")
      const newFormData = {
        name: stationData.name,
        latitude: stationData.latitude,
        longitude: stationData.longitude,
        prefecture: stationData.prefecture || "",
        city: stationData.city || "",
        address: stationData.address || "",
      }

      console.log("🔧 New formData:", newFormData)
      setFormData(newFormData)

      // 路線情報も更新
      if (stationData.station_lines && stationData.station_lines.length > 0) {
        const existingLines: SelectedLine[] = stationData.station_lines.map(stationLine => ({
          line_id: stationLine.line_id,
          line: {
            id: stationLine.line_id,
            name: stationLine.lines?.name || "",
            company_id: (stationLine.lines as any)?.company_id || "",
            railway_companies: stationLine.lines?.railway_companies
          } as Line,
          station_code: stationLine.station_code || "",
          existing_id: stationLine.id
        }))

        console.log("🔧 Updating selectedLines:", existingLines)
        setSelectedLines(existingLines)
      }
    }
  }, [mode, stationData]) // modeとstationDataの変更を監視

  useEffect(() => {
    console.log("📝 FORM DATA CHANGED:", formData)
  }, [formData])

  const initializeEditMode = () => {
    console.log("=== STATION FORM: initializeEditMode called ===")
    console.log("stationData:", stationData)

    if (!stationData) {
      console.log("No stationData provided")
      return
    }

    // 基本情報をフォームに設定
    const newFormData = {
      name: stationData.name,
      latitude: stationData.latitude,
      longitude: stationData.longitude,
      prefecture: stationData.prefecture || "",
      city: stationData.city || "",
      address: stationData.address || "",
    }

    console.log("📝 Setting form data to:", newFormData)

    // setFormDataを呼び出す前の現在の状態をログ
    console.log("📝 Current formData before setFormData:", formData)

    setFormData(newFormData)

    // setFormData呼び出し直後（ただし、非同期なので値はまだ更新されていない可能性があります）
    console.log("📝 setFormData called with:", newFormData)

    // 既存の路線情報を selectedLines に設定
    if (stationData.station_lines && stationData.station_lines.length > 0) {
      console.log("🚇 Processing station lines:", stationData.station_lines)

      const existingLines: SelectedLine[] = stationData.station_lines.map(stationLine => {
        return {
          line_id: stationLine.line_id,
          line: {
            id: stationLine.line_id,
            name: stationLine.lines?.name || "",
            company_id: (stationLine.lines as any)?.company_id || "",
            railway_companies: stationLine.lines?.railway_companies
          } as Line,
          station_code: stationLine.station_code || "",
          existing_id: stationLine.id
        }
      })

      console.log("🚇 Setting selected lines:", existingLines)
      setSelectedLines(existingLines)
    }

    console.log("=== STATION FORM: initializeEditMode completed ===")
  }

  const loadCompanies = async () => {
    try {
      const companiesData = await getRailwayCompanies()
      setCompanies(companiesData)
    } catch (error) {
      console.error("Error loading companies:", error)
    }
  }

  const loadAllLines = async () => {
    try {
      const linesData = await getLines()
      setAllLines(linesData)
    } catch (error) {
      console.error("Error loading lines:", error)
    }
  }

  const handleAddLine = () => {
    if (!lineSelection.lineId) return

    const line = allLines.find((l) => l.id === lineSelection.lineId)
    if (!line) return

    // 既に選択されている路線かチェック
    if (selectedLines.some((l) => l.line_id === line.id)) {
      setMessage({ type: "error", text: "この路線は既に選択されています" })
      return
    }

    const newSelectedLine: SelectedLine = {
      line_id: line.id,
      line: line,
      station_code: lineDetails.station_code || undefined,
    }

    setSelectedLines([...selectedLines, newSelectedLine])
    setLineSelection({ companyId: "", lineId: "" })
    setLineDetails({ station_code: "" })
    setMessage(null)
  }

  const handleRemoveLine = async (index: number) => {
    const line = selectedLines[index]

    if (mode === "edit" && line.existing_id) {
      // 既存の路線を削除
      if (!confirm("この路線を削除しますか？関連するホームドア情報がある場合は削除できません。")) return

      setLoading(true)
      try {
        const result = await removeLineFromStation(line.existing_id, userId)
        if (result.success) {
          setSelectedLines(selectedLines.filter((_, i) => i !== index))
          setMessage({ type: "success", text: "路線を削除しました" })
        } else {
          setMessage({ type: "error", text: result.error || "路線の削除に失敗しました" })
        }
      } catch (error) {
        console.error("Error removing line:", error)
        setMessage({ type: "error", text: "予期しないエラーが発生しました" })
      } finally {
        setLoading(false)
      }
    } else {
      // 新規追加の路線を削除（UI上のみ）
      setSelectedLines(selectedLines.filter((_, i) => i !== index))
    }
    setEditingLineIndex(null)
  }

  const startEditLine = (index: number) => {
    const line = selectedLines[index]
    setLineDetails({
      station_code: line.station_code || "",
    })
    setEditingLineIndex(index)
  }

  const saveEditLine = () => {
    if (editingLineIndex === null) return

    const updatedLines = [...selectedLines]
    updatedLines[editingLineIndex] = {
      ...updatedLines[editingLineIndex],
      station_code: lineDetails.station_code || undefined,
    }

    setSelectedLines(updatedLines)
    setEditingLineIndex(null)
    setLineDetails({ station_code: "" })
  }

  const cancelEditLine = () => {
    setEditingLineIndex(null)
    setLineDetails({ station_code: "" })
  }

  const getFilteredLines = () => {
    if (!lineSelection.companyId) return []
    return allLines.filter((line) => line.company_id === lineSelection.companyId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (!formData.name.trim()) {
      setMessage({ type: "error", text: "駅名を入力してください" })
      setLoading(false)
      return
    }

    if (selectedLines.length === 0) {
      setMessage({ type: "error", text: "少なくとも1つの路線を選択してください" })
      setLoading(false)
      return
    }

    try {
      if (mode === "create") {
        // 新規作成
        const stationInput: StationInput = {
          name: formData.name,
          latitude: formData.latitude,
          longitude: formData.longitude,
          prefecture: formData.prefecture,
          city: formData.city,
          address: formData.address,
          lines: selectedLines.map(line => ({
            line_id: line.line_id,
            station_code: line.station_code,
          })),
        }

        const result = await createStation(stationInput, userId)

        if (result.success) {
          setMessage({ type: "success", text: "駅を登録しました" })
          // フォームをリセット
          setFormData({
            name: "",
            latitude: undefined,
            longitude: undefined,
            prefecture: "",
            city: "",
            address: "",
          })
          setSelectedLines([])
          onSuccess?.(result.data)
        } else {
          setMessage({ type: "error", text: result.error || "駅の登録に失敗しました" })
        }
      } else {
        // 編集モード
        if (!stationData?.id) {
          setMessage({ type: "error", text: "駅IDが見つかりません" })
          setLoading(false)
          return
        }

        const updateInput: StationUpdateInput = {
          name: formData.name,
          latitude: formData.latitude,
          longitude: formData.longitude,
          prefecture: formData.prefecture,
          city: formData.city,
          address: formData.address,
        }

        const result = await updateStation(stationData.id, updateInput, userId)

        if (result.success) {
          // 新しく追加された路線を処理
          const newLines = selectedLines.filter(line => !line.existing_id)

          for (const line of newLines) {
            const addResult = await addLineToStation(
              stationData.id,
              line.line_id,
              line.station_code,
              userId
            )

            if (!addResult.success) {
              console.error("Failed to add line:", addResult.error)
            }
          }

          setMessage({ type: "success", text: "駅情報を更新しました" })
          onSuccess?.(result.data)
        } else {
          setMessage({ type: "error", text: result.error || "駅の更新に失敗しました" })
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setMessage({ type: "error", text: "予期しないエラーが発生しました" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          {mode === "create" ? "新しい駅の登録" : "駅情報の編集"}
        </CardTitle>
      </CardHeader>
      <CardContent>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">駅名 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="新宿駅"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prefecture">都道府県</Label>
              <Select
                value={formData.prefecture}
                onValueChange={(value) => setFormData({ ...formData, prefecture: value })}
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

            <div className="space-y-2">
              <Label htmlFor="city">市区町村</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="新宿区"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">住所</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="西新宿1-1-1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="latitude">緯度</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  latitude: e.target.value ? parseFloat(e.target.value) : undefined
                })}
                placeholder="35.6894"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">経度</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  longitude: e.target.value ? parseFloat(e.target.value) : undefined
                })}
                placeholder="139.7006"
              />
            </div>
          </div>

          {/* 路線選択と管理 */}
          <div className="space-y-4">
            <Label>路線と駅ナンバリング *</Label>

            {/* 選択された路線一覧 */}
            {selectedLines.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">登録された路線:</p>
                <div className="space-y-3">
                  {selectedLines.map((selectedLine, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">
                              {selectedLine.line.railway_companies?.name}
                            </Badge>
                            <span className="font-medium">{selectedLine.line.name}</span>
                            {selectedLine.existing_id && (
                              <Badge variant="outline" className="text-xs">既存</Badge>
                            )}
                          </div>

                          {editingLineIndex === index ? (
                            // 編集モード
                            <div className="space-y-3">
                              <div>
                                <Label className="text-xs">駅ナンバリング</Label>
                                <Input
                                  value={lineDetails.station_code}
                                  onChange={(e) => setLineDetails({ station_code: e.target.value })}
                                  placeholder="JY17"
                                  className="h-8"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button type="button" size="sm" onClick={saveEditLine}>
                                  <Check className="h-3 w-3 mr-1" />
                                  保存
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={cancelEditLine}>
                                  キャンセル
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // 表示モード
                            <div className="text-sm text-gray-600">
                              {selectedLine.station_code && (
                                <div>駅ナンバリング: <span className="font-mono">{selectedLine.station_code}</span></div>
                              )}
                            </div>
                          )}
                        </div>

                        {editingLineIndex !== index && (
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => startEditLine(index)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveLine(index)}
                              disabled={loading}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 路線追加フォーム */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm font-medium mb-3">路線を追加</p>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Select
                    value={lineSelection.companyId}
                    onValueChange={(value) => setLineSelection({ companyId: value, lineId: "" })}
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

                  <Select
                    value={lineSelection.lineId}
                    onValueChange={(value) => setLineSelection({ ...lineSelection, lineId: value })}
                    disabled={!lineSelection.companyId}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="station_code" className="text-sm">
                      駅ナンバリング（任意）
                    </Label>
                    <Input
                      id="station_code"
                      value={lineDetails.station_code}
                      onChange={(e) => setLineDetails({ station_code: e.target.value })}
                      placeholder="例: JY17"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={handleAddLine}
                      disabled={!lineSelection.lineId}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      路線を追加
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {loading ? "保存中..." : mode === "create" ? "駅を登録" : "変更を保存"}
            </Button>

            {mode === "edit" && onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                キャンセル
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}