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
import { CheckCircle, AlertCircle, Save, MapPin, Plus, X } from "lucide-react"
import { createStation } from "@/lib/actions"
import { getRailwayCompanies, getLines, type RailwayCompany, type Line, type StationInput } from "@/lib/supabase"

interface StationFormProps {
  userId: string
  onSuccess?: (station: any) => void
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
  const [selectedLines, setSelectedLines] = useState<Line[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [formData, setFormData] = useState<StationInput>({
    name: "",
    line_ids: [],
    latitude: undefined,
    longitude: undefined,
    prefecture: "",
    city: "",
    address: "",
    station_code: "",
  })

  const [lineSelection, setLineSelection] = useState({
    companyId: "",
    lineId: "",
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
    if (selectedLines.some((l) => l.id === line.id)) {
      setMessage({ type: "error", text: "この路線は既に選択されています" })
      return
    }

    setSelectedLines([...selectedLines, line])
    setFormData({ ...formData, line_ids: [...formData.line_ids, line.id] })
    setLineSelection({ companyId: "", lineId: "" })
    setMessage(null)
  }

  const handleRemoveLine = (lineId: string) => {
    setSelectedLines(selectedLines.filter((l) => l.id !== lineId))
    setFormData({ ...formData, line_ids: formData.line_ids.filter((id) => id !== lineId) })
  }

  const getFilteredLines = () => {
    if (!lineSelection.companyId) return []
    return allLines.filter((line) => line.company_id === lineSelection.companyId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (formData.line_ids.length === 0) {
      setMessage({ type: "error", text: "少なくとも1つの路線を選択してください" })
      setLoading(false)
      return
    }

    try {
      const result = await createStation(formData, userId)

      if (result.success) {
        setMessage({ type: "success", text: "駅を登録しました" })

        // フォームをリセット
        setFormData({
          name: "",
          line_ids: [],
          latitude: undefined,
          longitude: undefined,
          prefecture: "",
          city: "",
          address: "",
          station_code: "",
        })
        setSelectedLines([])
        setLineSelection({ companyId: "", lineId: "" })

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
            <div className="space-y-2">
              <Label htmlFor="station_code">駅コード</Label>
              <Input
                id="station_code"
                value={formData.station_code}
                onChange={(e) => setFormData({ ...formData, station_code: e.target.value })}
                placeholder="JY17"
              />
            </div>
          </div>

          {/* 路線選択 */}
          <div className="space-y-4">
            <Label>路線 *</Label>

            {/* 選択された路線一覧 */}
            {selectedLines.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">選択された路線:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedLines.map((line) => (
                    <Badge key={line.id} variant="secondary" className="flex items-center gap-2">
                      <span>{line.railway_companies?.name}</span>
                      <span>{line.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(line.id)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 路線追加フォーム */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm font-medium mb-3">路線を追加</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

                <Button type="button" onClick={handleAddLine} disabled={!lineSelection.lineId} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  追加
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
