// components/station-selector.tsx を置き換える内容
"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Search, 
  MapPin, 
  Train, 
  Edit, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Clock,
  Eye
} from "lucide-react"
import { getStations, type Station } from "@/lib/supabase"

interface StationSelectorProps {
  onStationSelect: (station: Station) => void
  selectedStation?: Station | null
  userRole?: string
  userId?: string
  onStationEdit?: (station: Station) => void
  onStationDelete?: (station: Station) => void
  showManagementButtons?: boolean // 編集・削除ボタンの表示制御
}

export function StationSelector({ 
  onStationSelect, 
  selectedStation,
  userRole,
  userId,
  onStationEdit,
  onStationDelete,
  showManagementButtons = false
}: StationSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setLoading(true)
    setMessage(null)
    try {
      const results = await getStations({ search: searchTerm })
      setStations(results)
      setSearched(true)
      
      if (results.length === 0) {
        setMessage({ 
          type: "error", 
          text: `「${searchTerm}」に該当する駅が見つかりませんでした。別のキーワードで検索してください。` 
        })
      }
    } catch (error) {
      console.error("Error searching stations:", error)
      setMessage({ 
        type: "error", 
        text: "検索中にエラーが発生しました。もう一度お試しください。" 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleEditClick = (e: React.MouseEvent, station: Station) => {
    e.stopPropagation() // 駅選択を防ぐ
    onStationEdit?.(station)
  }

  const handleDeleteClick = (e: React.MouseEvent, station: Station) => {
    e.stopPropagation() // 駅選択を防ぐ
    if (confirm(`「${station.name}」を削除しますか？この操作は取り消せません。`)) {
      onStationDelete?.(station)
    }
  }

  const handleViewClick = (e: React.MouseEvent, station: Station) => {
    e.stopPropagation() // 駅選択を防ぐ
    onStationSelect(station)
  }

  // 権限チェック
  const canEdit = userRole && ['編集者', '開発者'].includes(userRole)
  const canDelete = userRole && ['編集者', '開発者'].includes(userRole)

  // ホームドア設置状況の統計を計算
  const getStationStats = (station: Station) => {
    const platformDoors = station.platform_doors || []
    const total = platformDoors.length
    const completed = platformDoors.filter(door => door.status === '稼働').length
    const inProgress = platformDoors.filter(door => 
      ['設置', '復元', '仮覆工'].includes(door.status)
    ).length
    
    return { total, completed, inProgress }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>駅を選択</span>
          {showManagementButtons && (
            <Badge variant="outline" className="text-xs">
              管理モード
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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

          {/* 検索フォーム */}
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="駅名を入力して検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading || !searchTerm.trim()}>
              {loading ? "検索中..." : "検索"}
            </Button>
          </div>

          {/* 選択された駅 */}
          {selectedStation && !showManagementButtons && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-900">{selectedStation.name}</h3>
                  <div className="space-y-1 mt-2">
                    {selectedStation.station_lines?.map((stationLine, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-blue-700">
                        <Train className="h-3 w-3" />
                        <span>{stationLine.lines?.name}</span>
                        <span>•</span>
                        <span>{stationLine.lines?.railway_companies?.name}</span>
                        {stationLine.station_code && (
                          <Badge variant="outline" className="text-xs bg-white">
                            {stationLine.station_code}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <Badge variant="secondary">選択中</Badge>
              </div>
            </div>
          )}

          {/* 検索結果 */}
          {searched && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">
                検索結果 ({stations.length}件)
                {showManagementButtons && stations.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    - 編集・削除が可能です
                  </span>
                )}
              </h4>
              
              {stations.length > 0 ? (
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {stations.map((station) => {
                    const stats = getStationStats(station)
                    return (
                      <div
                        key={station.id}
                        className={`p-4 border rounded-lg transition-colors ${
                          selectedStation?.id === station.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        } ${!showManagementButtons ? "cursor-pointer" : ""}`}
                        onClick={!showManagementButtons ? () => onStationSelect(station) : undefined}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h5 className="font-medium text-lg">{station.name}</h5>
                              
                              {/* ホームドア統計 */}
                              {stats.total > 0 && (
                                <div className="flex items-center gap-1">
                                  {stats.completed > 0 && (
                                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                      稼働 {stats.completed}
                                    </Badge>
                                  )}
                                  {stats.inProgress > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      工事中 {stats.inProgress}
                                    </Badge>
                                  )}
                                  {stats.total > stats.completed + stats.inProgress && (
                                    <Badge variant="outline" className="text-xs text-gray-600">
                                      未設置 {stats.total - stats.completed - stats.inProgress}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* 路線情報 */}
                            <div className="space-y-1 mb-2">
                              {station.station_lines?.map((stationLine, index) => (
                                <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Train className="h-3 w-3" />
                                  <span className="font-medium">{stationLine.lines?.name}</span>
                                  <span>•</span>
                                  <span>{stationLine.lines?.railway_companies?.name}</span>
                                  {stationLine.station_code && (
                                    <Badge variant="outline" className="text-xs">
                                      {stationLine.station_code}
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* 所在地情報 */}
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <MapPin className="h-3 w-3" />
                              <span>{station.prefecture}</span>
                              {station.city && <span>{station.city}</span>}
                              {station.address && <span>{station.address}</span>}
                            </div>

                            {/* ホームドア情報サマリー */}
                            {stats.total > 0 && (
                              <div className="mt-2 text-xs text-gray-600">
                                ホームドア情報: 全{stats.total}ホーム
                                {stats.completed > 0 && (
                                  <span className="text-green-600 ml-1">
                                    (稼働率: {Math.round((stats.completed / stats.total) * 100)}%)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* アクションボタン */}
                          <div className="flex gap-2 ml-4">
                            {showManagementButtons ? (
                              <>
                                {/* 管理モード: 表示、編集、削除ボタン */}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => handleViewClick(e, station)}
                                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  表示
                                </Button>
                                
                                {canEdit && onStationEdit && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => handleEditClick(e, station)}
                                    className="text-green-600 border-green-200 hover:bg-green-50"
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    編集
                                  </Button>
                                )}
                                
                                {canDelete && onStationDelete && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => handleDeleteClick(e, station)}
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    削除
                                  </Button>
                                )}
                              </>
                            ) : (
                              /* 通常モード: 選択状態表示のみ */
                              selectedStation?.id === station.id && (
                                <Badge variant="secondary">選択中</Badge>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>検索結果が見つかりませんでした</p>
                  <p className="text-sm">別のキーワードで検索してください</p>
                </div>
              )}
            </div>
          )}

          {!searched && !selectedStation && (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>駅名を入力して検索してください</p>
              {showManagementButtons && (
                <p className="text-sm mt-1">管理モードでは編集・削除が可能です</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}