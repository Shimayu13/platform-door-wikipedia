"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Train, ExternalLink, TrendingUp } from "lucide-react"
import Link from "next/link"
import { getRailwayCompanies } from "@/lib/supabase"

export default async function CompaniesPage() {
  const companies = await getRailwayCompanies()

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
                <Link href="/contribute">情報提供</Link>
              </Button>
              <Button variant="outline" size="sm">
                ログイン
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">鉄道会社一覧</h2>
          <p className="text-gray-600">各鉄道会社のホームドア整備状況を確認できます</p>
        </div>

        {/* 統計サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{companies.length}</div>
              <div className="text-sm text-gray-600">登録鉄道会社数</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {companies.filter((c) => c.type === "JR").length}
              </div>
              <div className="text-sm text-gray-600">JR各社</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {companies.filter((c) => c.type === "私鉄").length}
              </div>
              <div className="text-sm text-gray-600">私鉄各社</div>
            </CardContent>
          </Card>
        </div>

        {/* 会社一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={company.type === "JR" ? "default" : "secondary"}>{company.type}</Badge>
                    </div>
                  </div>
                  <Train className="h-6 w-6 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">整備状況</span>
                    <span className="font-medium">準備中</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">路線数</span>
                    <span className="font-medium">準備中</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">駅数</span>
                    <span className="font-medium">準備中</span>
                  </div>

                  <div className="pt-3 space-y-2">
                    <Button variant="outline" className="w-full" size="sm" asChild>
                      <Link href={`/companies/${company.id}`}>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        整備状況を見る
                      </Link>
                    </Button>
                    {company.website_url && (
                      <Button variant="ghost" className="w-full" size="sm" asChild>
                        <a href={company.website_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          公式サイト
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {companies.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-400 mb-4">
                <Train className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">鉄道会社データを準備中です</h3>
              <p className="text-gray-600 mb-4">データベースのセットアップが完了すると会社情報が表示されます</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                再読み込み
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
