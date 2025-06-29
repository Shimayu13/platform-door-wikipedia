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
import { createStation } from "@/lib/actions"
import { getRailwayCompanies, getLines, type RailwayCompany, type Line, type StationInput } from "@/lib/supabase"

interface StationFormProps {
  userId: string
  onSuccess?: (station: any) => void
}

interface SelectedLine {
  line_id: string
  line: Line
  station_code?: string
}

const PREFECTURES = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
]

export function StationForm({ userId, onSuccess }: StationFormProps) {
  const [companies, setCompanies] = useState<RailwayCompany[]>([])
  const [allLines, setAllLines] = useState<Line[]>([])
  const [selectedLines, setSelectedLines] = useState<SelectedLine[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    prefecture: "",
    city: "",
    address: "",
  })

  const [lineSelection, setLineSelection] = useState({
    companyId: "",
    lineId: "",
  })

  const [lineDetails, setLineDetails] = useState({
    station_code: "",
  })

  useEffect(() => {
    loadCompanies()
    loadAllLines()
  }, [])

  const loadCompanies = async () => {
    const companiesData = await getRailwayCompanies()
    setCompanies(companiesData)
  }

  const loadAllLines = async () => {
    const linesData = await getLines()
    setAllLines(linesData)
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

  const handleRemoveLine = (index: number) => {
    setSelectedLines(selectedLines.filter((_, i) => i !== index))
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

    if (selectedLines.length === 0) {
      setMessage({ type: "error", text: "少なくとも1つの路線を選択してください" })
      setLoading(false)
      return
    }

    try {
      const stationInput: StationInput = {
        name: formData.name,
        lines: selectedLines.map((sl) => ({
          line_id: sl.line_id,
          station_code: sl.station_code,
        })),
        latitude: formData.latitude,
        longitude: formData.longitude,
        prefecture: formData.prefecture,
        city: formData.city,
        address: formData.address,
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
        setLineSelection({ companyId: "", lineId: "" })
        setLineDetails({ station_code: "" })

        if (onSuccess) {
          onSuccess(result.data)
        }
      } else {
        setMessage({ type: "error", text: result.error || "駅の登録に失敗しました" })
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
        <CardTitle className="flex items-center">
          <MapPin className="mr-2 h-5 w-5" />
          新しい駅を登録
        </CardTitle>
      </CardHeader>
      <CardContent>
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

                {/* 路線詳細情報 */}
                <div>
                  <Label htmlFor="new-station-code" className="text-xs">駅ナンバリング</Label>
                  <Input
                    id="new-station-code"
                    value={lineDetails.station_code}
                    onChange={(e) => setLineDetails({ station_code: e.target.value })}
                    placeholder="JY17"
                    className="h-8"
                  />
                </div>

                <Button type="button" onClick={handleAddLine} disabled={!lineSelection.lineId} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  路線を追加
                </Button>
              </div>
            </div>
          </div>

          {/* 所在地情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prefecture">都道府県 *</Label>
              <Select
                value={formData.prefecture}
                onValueChange={(value) => setFormData({ ...formData, prefecture: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="都道府県を選択" />
                </SelectTrigger>
                <SelectContent>
                  {PREFECTURES.map((prefecture) => (
                    <SelectItem key={prefecture} value={prefecture}>
                      {prefecture}
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">住所</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="東京都新宿区新宿3丁目"
            />
          </div>

          {/* 位置情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">緯度</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude || ""}
                onChange={(e) =>
                  setFormData({ ...formData, latitude: e.target.value ? Number(e.target.value) : undefined })
                }
                placeholder="35.6896"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">経度</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude || ""}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: e.target.value ? Number(e.target.value) : undefined })
                }
                placeholder="139.7006"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {loading ? "登録中..." : "駅を登録"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}