// app/auth/reset-password/page.tsx - 修正版
"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Train, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { confirmPasswordReset } from "@/lib/auth"

// useSearchParams()を使用するコンポーネントを分離
function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [completed, setCompleted] = useState(false)

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })

  // URLパラメータからアクセストークンを確認
  useEffect(() => {
    const accessToken = searchParams.get('access_token')
    const type = searchParams.get('type')

    if (!accessToken || type !== 'recovery') {
      setMessage({
        type: "error",
        text: "無効なリセットリンクです。もう一度パスワードリセットをお試しください。"
      })
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // バリデーション
    if (formData.password.length < 6) {
      setMessage({
        type: "error",
        text: "パスワードは6文字以上で入力してください"
      })
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({
        type: "error",
        text: "パスワードが一致しません"
      })
      setLoading(false)
      return
    }

    try {
      const result = await confirmPasswordReset(formData.password)

      if (result.success) {
        setMessage({
          type: "success",
          text: "パスワードを正常に変更しました"
        })
        setCompleted(true)
        
        // 3秒後にログインページにリダイレクト
        setTimeout(() => {
          router.push("/auth")
        }, 3000)
      } else {
        setMessage({
          type: "error",
          text: result.error || "パスワードの変更に失敗しました"
        })
      }
    } catch (error) {
      console.error("Password reset error:", error)
      setMessage({
        type: "error",
        text: "予期しないエラーが発生しました"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lock className="h-5 w-5 mr-2" />
          パスワード再設定
        </CardTitle>
        <CardDescription>
          {completed 
            ? "パスワードの変更が完了しました"
            : "新しいパスワードを入力してください"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {completed ? (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                パスワードが正常に変更されました。
                まもなくログインページに移動します。
              </AlertDescription>
            </Alert>

            <Button asChild className="w-full">
              <Link href="/auth">ログインページに移動</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* メッセージ表示 */}
            {message && (
              <Alert className={message.type === "error" ? "border-red-200" : "border-green-200"}>
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

            <div className="space-y-2">
              <Label htmlFor="password">新しいパスワード</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="6文字以上"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">パスワード確認</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="もう一度入力"
                  required
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !formData.password || !formData.confirmPassword}
            >
              {loading ? "変更中..." : "パスワードを変更"}
            </Button>

            <div className="text-center">
              <Button variant="ghost" asChild>
                <Link href="/auth">ログインページに戻る</Link>
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

// ローディングコンポーネント
function Loading() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lock className="h-5 w-5 mr-2" />
          パスワード再設定
        </CardTitle>
        <CardDescription>
          読み込み中...
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </CardContent>
    </Card>
  )
}

// メインコンポーネント - Suspenseでラップ
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Train className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">ホームドア情報局</h1>
          </div>
          <p className="text-gray-600">新しいパスワードを設定</p>
        </div>

        {/* Suspenseでラップされたコンポーネント */}
        <Suspense fallback={<Loading />}>
          <ResetPasswordForm />
        </Suspense>

        {/* フッター */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>
            パスワードは安全な場所に保管し、
            <br />
            他人と共有しないでください
          </p>
        </div>
      </div>
    </div>
  )
}