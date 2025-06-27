"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Train } from "lucide-react"
import { getStations, type Station } from "@/lib/supabase"

interface StationSelectorProps {
  onStationSelect: (station: Station) => void
  selectedStation?: Station | null
}

export function StationSelector({ onStationSelect, selectedStation }: StationSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setLoading(true)
    try {
      const results = await getStations({ search: searchTerm })
      setStations(results)
      setSearched(true)
    } catch (error) {
      console.error("Error searching stations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>駅を選択</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
          {selectedStation && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-900">{selectedStation.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-blue-700 mt-1">
                    <Train className="h-3 w-3" />
                    <span>{selectedStation.lines?.name}</span>
                    <span>•</span>
                    <span>{selectedStation.lines?.railway_companies?.name}</span>
                  </div>
                </div>
                <Badge variant="secondary">選択中</Badge>
              </div>
            </div>
          )}

          {/* 検索結果 */}
          {searched && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">検索結果 ({stations.length}件)</h4>
              {stations.length > 0 ? (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {stations.map((station) => (
                    <div
                      key={station.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedStation?.id === station.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                      onClick={() => onStationSelect(station)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium">{station.name}</h5>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                            <Train className="h-3 w-3" />
                            <span>{station.lines?.name}</span>
                            <span>•</span>
                            <span>{station.lines?.railway_companies?.name}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                            <MapPin className="h-3 w-3" />
                            <span>{station.prefecture}</span>
                            {station.city && <span>{station.city}</span>}
                          </div>
                        </div>
                        {station.station_code && (
                          <Badge variant="outline" className="text-xs">
                            {station.station_code}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
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
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
