// app/contribute/page.tsx の更新版
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Train, Users, Shield, CheckCircle, ArrowRight, AlertCircle, Edit } from "lucide-react"
import { usePermissions } from "@/hooks/use-permissions"
import { StationSelector } from "@/components/station-selector"
import { PlatformDoorForm } from "@/components/platform-door-form"
import { StationForm } from "@/components/station-form"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Station } from "@/lib/supabase"
import { deleteStation, updateStation, type StationUpdateInput } from "@/lib/actions"

export default function ContributePage() {
  const { user, profile, loading: permissionsLoading, canEditContent, hasRole } = usePermissions()
  const router = useRouter()
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [step, setStep] = useState<"register" | "select" | "edit" | "station-edit">("register")
  const [editingStation, setEditingStation] = useState<Station | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (!permissionsLoading && !canEditContent()) {
      router.push("/auth")
    }
  }, [permissionsLoading, canEditContent, router])

  const handleStationSelect = (station: Station) => {
    setSelectedStation(station)
    setStep("edit")
  }

  const handleStationEdit = async (station: Station) => {
    try {
      // 詳細な駅情報を取得（路線情報含む）
      const { getStationDetails } = await import('@/lib/actions')
      const result = await getStationDetails(station.id)
      
      if (result.success) {
        setEditingStation(result.data)
        setStep("station-edit")
      } else {
        setMessage({ 
          type: "error", 
          text: "駅情報の取得に失敗しました" 
        })
      }
    } catch (error) {
      console.error("Error fetching station details:", error)
      setMessage({ 
        type: "error", 
        text: "駅情報の取得中にエラーが発生しました" 
      })
    }
  }

  const handleStationDelete = async (station: Station) => {
    if (!user) return

    try {
      const result = await deleteStation(station.id, user.id)
      
      if (result.success) {
        setMessage({ 
          type: "success", 
          text: result.message || `「${station.name}」を削除しました` 
        })
        
        // 削除された駅が選択されていた場合はクリア
        if (selectedStation?.id === station.id) {
          setSelectedStation(null)
        }
        if (editingStation?.id === station.id) {
          setEditingStation(null)
        }
        
        // ステップを選択画面に戻す
        setStep("select")
      } else {
        setMessage({ 
          type: "error", 
          text: result.error || "駅の削除に失敗しました" 
        })
      }
    } catch (error) {
      console.error("Error deleting station:", error)
      setMessage({ 
        type: "error", 
        text: "予期しないエラーが発生しました" 
      })
    }
  }

  const handleStationEditSuccess = (updatedStation: any) => {
    setMessage({ 
      type: "success", 
      text: "駅情報を更新しました" 
    })
    setEditingStation(null)
    setStep("select")
  }

  const handleStationEditCancel = () => {
    setEditingStation(null)
    setStep("select")
  }

  const handleBackToSelect = () => {
    setSelectedStation(null)
    setStep("select")
  }

  const handleBackToRegister = () => {
    setSelectedStation(null)
    setEditingStation(null)
    setStep("register")
  }

  const clearMessage = () => {
    setMessage(null)
  }

  if (permissionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Train className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!canEditContent()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">ログインが必要です</h2>
            <p className="text-gray-600 mb-4">この機能を利用するにはログインしてください</p>
            <Button asChild>
              <Link href="/auth">ログイン</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">情報提供</h1>
            </div>
            <nav className="flex space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/">ホーム</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/profile">プロフィール</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 全体メッセージ */}
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

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">情報提供</h2>
          <p className="text-gray-600">ホームドア設置状況の情報を入力・更新できます</p>
        </div>

        {/* プロセスインジケーター */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
            <div className={`flex items-center space-x-2 ${step === "register" ? "text-blue-600" : "text-gray-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === "register" ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                1
              </div>
              <span className="font-medium">駅を登録</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center space-x-2 ${step === "select" ? "text-blue-600" : "text-gray-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === "select" ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                2
              </div>
              <span className="font-medium">駅を選択</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center space-x-2 ${step === "edit" ? "text-blue-600" : "text-gray-400"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === "edit" ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                3
              </div>
              <span className="font-medium">情報を入力</span>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        {step === "register" && hasRole("編集者") && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <StationForm userId={user!.id} onSuccess={() => setStep("select")} />
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>駅登録について</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <p>編集者以上のロールの方は新しい駅を登録できます。</p>
                    <p>• 正確な情報の入力をお願いします</p>
                    <p>• 緯度・経度は任意項目です</p>
                    <p>• 駅コードがある場合は入力してください</p>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" onClick={() => setStep("select")} className="w-full">
                      既存の駅から選択
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {step === "register" && !hasRole("編集者") && (
          <div className="text-center">
            <Button onClick={() => setStep("select")}>既存の駅から選択</Button>
          </div>
        )}

        {step === "select" && (
          <div>
            <div className="mb-4 flex gap-2">
              <Button variant="outline" onClick={handleBackToRegister}>
                ← 駅登録に戻る
              </Button>
              {hasRole("編集者") && (
                <Alert className="flex-1 border-blue-200 bg-blue-50">
                  <Edit className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700">
                    編集者権限により、駅情報の編集・削除が可能です
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <StationSelector 
                  onStationSelect={handleStationSelect} 
                  selectedStation={selectedStation}
                  userRole={profile?.role}
                  userId={user?.id}
                  onStationEdit={hasRole("編集者") ? handleStationEdit : undefined}
                  onStationDelete={hasRole("編集者") ? handleStationDelete : undefined}
                  showManagementButtons={hasRole("編集者")}
                />
              </div>
              <div className="space-y-6">
                {/* 使い方ガイド */}
                <Card>
                  <CardHeader>
                    <CardTitle>使い方</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start space-x-2">
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium mt-0.5">
                          1
                        </div>
                        <div>
                          <p className="font-medium">駅を検索</p>
                          <p className="text-gray-600">駅名を入力して情報を更新したい駅を検索します</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium mt-0.5">
                          2
                        </div>
                        <div>
                          <p className="font-medium">駅を選択</p>
                          <p className="text-gray-600">検索結果から対象の駅をクリックして選択します</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium mt-0.5">
                          3
                        </div>
                        <div>
                          <p className="font-medium">情報を入力</p>
                          <p className="text-gray-600">ホームドアの設置状況や詳細情報を入力します</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 編集者向けガイド */}
                {hasRole("編集者") && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600">編集者機能</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>駅情報の編集・削除</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>路線の追加・削除</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>ホームドア情報の削除</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 注意事項 */}
                <Card>
                  <CardHeader>
                    <CardTitle>注意事項</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>• 正確な情報の入力をお願いします</p>
                      <p>• 不明な項目は空欄でも構いません</p>
                      <p>• 設置日は確実な情報のみ入力してください</p>
                      <p>• 備考欄には追加の詳細情報を記載できます</p>
                      {hasRole("編集者") && (
                        <p className="text-orange-600">• 削除操作は取り消せません。慎重に行ってください</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {step === "edit" && selectedStation && user && (
          <div>
            <div className="mb-4">
              <Button variant="outline" onClick={handleBackToSelect}>
                ← 駅選択に戻る
              </Button>
            </div>
            <PlatformDoorForm 
              station={selectedStation} 
              userId={user.id} 
              canDelete={hasRole("編集者")} 
            />
          </div>
        )}

        {step === "station-edit" && editingStation && user && (
          <div>
            <div className="mb-4">
              <Button variant="outline" onClick={handleStationEditCancel}>
                ← 駅選択に戻る
              </Button>
            </div>
            <StationForm 
              userId={user.id}
              mode="edit"
              stationData={editingStation}
              onSuccess={handleStationEditSuccess}
              onCancel={handleStationEditCancel}
            />
          </div>
        )}
      </main>
    </div>
  )
}