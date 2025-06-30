"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Lock, CheckCircle, AlertCircle, Train, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { confirmPasswordReset } from "@/lib/auth"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/auth"

// クライアントコンポーネント - SearchParamsを使用する部分
function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isValidToken, setIsValidToken] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  })

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    // URLパラメータからトークンを確認
    const checkToken = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        // セッションがあるかチェック
        if (user) {
          setIsValidToken(true)
        } else {
          setMessage({ type: "error", text: "無効なリンクです。再度パスワードリセットを依頼してください。" })
        }
      } catch (error) {
        setMessage({ type: "error", text: "リンクの確認に失敗しました。" })
      } finally {
        setChecking(false)
      }
    }

    checkToken()
  }, [])

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // バリデーション
    if (formData.newPassword.length < 6) {
      setMessage({ type: "error", text: "パスワードは6文字以上で入力してください" })
      setLoading(false)
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "パスワードが一致しません" })
      setLoading(false)
      return
    }

    try {
      const result = await confirmPasswordReset(formData.newPassword)

      if (result.success) {
        setMessage({ type: "success", text: "パスワードを更新しました。新しいパスワードでログインしてください。" })
        
        // 3秒後にログインページにリダイレクト
        setTimeout(() => {
          router.push("/auth")
        }, 3000)
      } else {
        setMessage({ type: "error", text: result.error || "パスワード更新に失敗しました" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "予期しないエラーが発生しました" })
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <Shield className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">リンクを確認中...</p>
        </div>
      </div>
    )
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Train className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold">Platform Door</h1>
            </div>
            <p className="text-gray-600">社内Wikipediaシステム</p>
          </div>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">無効なリンク</CardTitle>
              <CardDescription className="text-center">
                このパスワードリセットリンクは無効です
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {message && (
                <Alert variant={message.type === "error" ? "destructive" : "default"} className="mb-4">
                  <AlertDescription>
                    {message.type === "error" ? (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {message.text}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        {message.text}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <Link href="/auth/forgot-password">
                <Button className="w-full" variant="outline">
                  パスワードを再設定する
                </Button>
              </Link>

              <div className="text-center mt-4">
                <Link href="/auth" className="text-sm text-blue-600 hover:underline">
                  ログイン画面に戻る
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Train className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold">Platform Door</h1>
          </div>
          <p className="text-gray-600">社内Wikipediaシステム</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">新しいパスワードの設定</CardTitle>
            <CardDescription className="text-center">
              アカウントの新しいパスワードを設定してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            {message && (
              <Alert variant={message.type === "error" ? "destructive" : "default"} className="mb-4">
                <AlertDescription>
                  {message.type === "error" ? (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {message.text}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      {message.text}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">新しいパスワード</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    placeholder="6文字以上で入力"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("new")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">パスワードの確認</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="同じパスワードを入力"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirm")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Lock className="mr-2 h-4 w-4 animate-spin" />
                    処理中...
                  </>
                ) : (
                  "パスワードを更新する"
                )}
              </Button>
            </form>

            <div className="text-center mt-4">
              <Link href="/auth" className="text-sm text-blue-600 hover:underline">
                ログイン画面に戻る
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// メインのページコンポーネント
export default function ResetPasswordClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <Shield className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}