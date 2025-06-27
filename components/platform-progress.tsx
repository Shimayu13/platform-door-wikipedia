import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, XCircle, Settings, Wrench } from "lucide-react"
import type { PlatformDoor } from "@/lib/supabase"

interface PlatformProgressProps {
  platformDoors: PlatformDoor[]
  showDetails?: boolean
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

const getStatusBadge = (status: string) => {
  const variants = {
    稼働: "default",
    設置: "secondary",
    復元: "outline",
    仮覆工: "secondary",
    未設置: "destructive",
  } as const

  return <Badge variant={variants[status as keyof typeof variants] || "secondary"}>{status}</Badge>
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

export function PlatformProgress({ platformDoors, showDetails = false }: PlatformProgressProps) {
  if (!platformDoors || platformDoors.length === 0) {
    return <div className="text-center text-gray-500 py-4">ホーム情報がありません</div>
  }

  const totalPlatforms = platformDoors.length
  const installedCount = platformDoors.filter((door) => door.status === "稼働").length
  const progressPercentage = totalPlatforms > 0 ? (installedCount / totalPlatforms) * 100 : 0

  const statusCounts = platformDoors.reduce(
    (acc, door) => {
      acc[door.status] = (acc[door.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  if (!showDetails) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span>設置進捗</span>
          <span className="font-medium">
            {installedCount}/{totalPlatforms} ホーム
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex justify-between text-xs text-gray-600">
          <span>{Math.round(progressPercentage)}% 完了</span>
          <span>{totalPlatforms - installedCount} ホーム残り</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 全体進捗 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">ホームドア設置進捗</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">全体進捗</span>
              <span className="text-lg font-bold">
                {installedCount}/{totalPlatforms}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">完了率: </span>
                <span className="font-medium">{Math.round(progressPercentage)}%</span>
              </div>
              <div>
                <span className="text-gray-600">残り: </span>
                <span className="font-medium">{totalPlatforms - installedCount} ホーム</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 状況別サマリー */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">設置状況サマリー</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status)}
                  <span className="text-sm font-medium">{status}</span>
                </div>
                <span className="text-sm font-bold">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ホーム別詳細 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">ホーム別詳細</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {platformDoors
              .sort((a, b) => {
                // 番線順にソート（数字部分を考慮）
                const aNum = Number.parseInt(a.platform_number) || 0
                const bNum = Number.parseInt(b.platform_number) || 0
                return aNum - bNum
              })
              .map((door) => (
                <div key={door.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{door.platform_number}番線</span>
                        {door.platform_name && <span className="text-sm text-gray-600">({door.platform_name})</span>}
                      </div>
                      {door.door_type && (
                        <div className="text-xs text-gray-500 mt-1">
                          {door.door_type}
                          {door.manufacturer && ` / ${door.manufacturer}`}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(door.status)}
                      {getStatusBadge(door.status)}
                    </div>
                  </div>

                  {/* 進捗バー（個別ホーム用） */}
                  <div className="mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getStatusColor(door.status)}`}
                        style={{
                          width:
                            door.status === "稼働"
                              ? "100%"
                              : door.status === "設置"
                                ? "80%"
                                : door.status === "復元"
                                  ? "60%"
                                  : door.status === "仮覆工"
                                    ? "40%"
                                    : "0%",
                        }}
                      />
                    </div>
                  </div>

                  {/* 日付情報 */}
                  <div className="text-xs text-gray-600 space-y-1">
                    {door.installation_datetime && (
                      <div>設置日時: {new Date(door.installation_datetime).toLocaleString("ja-JP")}</div>
                    )}
                    {door.operation_datetime && (
                      <div>稼働日時: {new Date(door.operation_datetime).toLocaleString("ja-JP")}</div>
                    )}
                    {door.notes && <div className="text-gray-500 mt-1">{door.notes}</div>}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
