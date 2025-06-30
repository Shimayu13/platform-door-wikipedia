"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Train, Users, FileText, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"
import { CommonHeader } from "@/components/common-header"
import { useAuthContext } from "@/components/auth-provider"

export default function HomePage() {
  const { user } = useAuthContext()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <CommonHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヒーローセクション */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            全国のホームドア設置状況を
            <br />
            リアルタイムで確認
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            鉄道各社のホームドア整備計画から最新の設置状況まで、
            <br />
            詳細な情報を駅別・路線別で検索できます
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/stations">
                <MapPin className="h-5 w-5 mr-2" />
                駅を検索する
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/companies">
                <Train className="h-5 w-5 mr-2" />
                鉄道会社を見る
              </Link>
            </Button>
          </div>
        </div>

        {/* 主要機能 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>駅別検索</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                全国の駅を検索して、各ホームのドア設置状況を詳細に確認できます。
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link href="/stations">駅を検索</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Train className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>鉄道会社別</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                各鉄道会社のホームドア整備計画と進捗状況を一覧で確認できます。
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link href="/companies">会社一覧</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>情報提供</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                最新の設置情報や工事状況を投稿して、データベースを充実させましょう。
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link href={user ? "/contribute" : "/auth"}>
                  {user ? "情報を提供" : "ログインして参加"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 統計情報 */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">データベース統計</h3>
            <p className="text-gray-600">現在収録されている情報の概要</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">-</div>
              <div className="text-sm text-gray-600">登録駅数</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">-</div>
              <div className="text-sm text-gray-600">設置完了</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">-</div>
              <div className="text-sm text-gray-600">工事中</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">-</div>
              <div className="text-sm text-gray-600">計画中</div>
            </div>
          </div>
        </div>

        {/* 最新情報 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                最新ニュース
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Clock className="h-4 w-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">システム情報</p>
                    <p className="font-medium">データベースが正常に稼働中です</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/news">すべてのニュースを見る</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                注目の動向
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    全国的にホームドア設置が加速
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    安全性向上のため各社で整備計画が進行中
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-900">
                    情報提供者数が増加中
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    より正確で最新の情報が集まっています
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}