"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Train, Users, Shield, CheckCircle, ArrowRight } from "lucide-react"
import { usePermissions } from "@/hooks/use-permissions"
import { StationSelector } from "@/components/station-selector"
import { PlatformDoorForm } from "@/components/platform-door-form"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Station } from "@/lib/supabase"
import { StationForm } from "@/components/station-form"

export default function ContributePage() {
  const { user, profile, loading: permissionsLoading, canEditContent, hasRole } = usePermissions()
  const router = useRouter()
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [step, setStep] = useState<"register" | "select" | "edit">("register")

  useEffect(() => {
    if (!permissionsLoading && !canEditContent()) {
      router.push("/auth")
    }
  }, [permissionsLoading, canEditContent, router])

  const handleStationSelect = (station: Station) => {
    setSelectedStation(station)
    setStep("edit")
  }

  const handleBackToSelect = () => {
    setSelectedStation(null)
    setStep("select")
  }

  const handleBackToRegister = () => {
    setSelectedStation(null)
    setStep("register")
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
            <Shield className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">権限が必要です</h2>
            <p className="text-gray-600 mb-4">この機能は提供者以上のロールが必要です</p>
            <div className="space-y-2">
              <Button asChild>
                <Link href="/auth">ログイン</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">ホームに戻る</Link>
              </Button>
            </div>
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
              <Train className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">ホームドア情報局</h1>
            </div>
            <nav className="flex space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/">ホーム</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/stations">駅検索</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/companies">鉄道会社</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/profile">プロフィール</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ページヘッダー */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="h-6 w-6 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">情報提供</h2>
          </div>
          <p className="text-gray-600">ホームドア設置状況の情報を入力・更新できます</p>
        </div>

        {/* ユーザー情報 */}
        {profile && (
          <Alert className="mb-6 border-blue-200">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <strong>{profile.display_name}</strong> さん（{profile.role}）としてログイン中
            </AlertDescription>
          </Alert>
        )}

        {/* ステップインジケーター */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
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
            <div className="mb-4">
              <Button variant="outline" onClick={handleBackToRegister}>
                ← 駅登録に戻る
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <StationSelector onStationSelect={handleStationSelect} selectedStation={selectedStation} />
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
            <PlatformDoorForm station={selectedStation} userId={user.id} canDelete={hasRole("編集者")} />
          </div>
        )}
      </main>
    </div>
  )
}
