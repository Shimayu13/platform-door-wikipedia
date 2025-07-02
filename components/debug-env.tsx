// components/debug-env.tsx - 環境変数デバッグコンポーネント（必要に応じて使用）
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DebugEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return (
    <Card className="mb-8 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-800">環境変数デバッグ情報</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div>
          <strong className="text-blue-900">NEXT_PUBLIC_SUPABASE_URL:</strong>
          <span className="ml-2 font-mono">
            {supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "❌ 未設定"}
          </span>
        </div>
        <div>
          <strong className="text-blue-900">NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>
          <span className="ml-2 font-mono">
            {supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : "❌ 未設定"}
          </span>
        </div>
        <div className="mt-4 p-3 bg-blue-100 rounded">
          <p className="text-blue-800 text-xs">
            <strong>注意:</strong> 本番環境では、このコンポーネントを削除してください。
            機密情報が露出する可能性があります。
          </p>
        </div>
      </CardContent>
    </Card>
  )
}