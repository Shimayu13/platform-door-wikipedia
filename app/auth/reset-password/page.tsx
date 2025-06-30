"use client"

import { useState, useEffect } from "react"
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

export default function ResetPasswordPage() {
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
              <h1 className="text-2xl font-bold text-gray-900">ホームドア情報局</h1>
            </div>
          </div>

          <Card>
            <CardContent className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">無効なリンク</h2>
              <p className="text-gray-600 mb-4">
                このパスワードリセットリンクは無効または期限切れです。
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/auth/forgot-password">再度リセットを依頼</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/auth">ログインページに戻る</Link>
                </Button>
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
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Train className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">ホームドア情報局</h1>
          </div>
          <p className="text-gray-600">新しいパスワードの設定</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>パスワードの更新</span>
            </CardTitle>
            <CardDescription>
              新しいパスワードを設定してください
            </CardDescription>
          </CardHeader>
          <CardContent>
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

            {message?.type === "success" ? (
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <p className="text-gray-600">3秒後にログインページに移動します...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 新しいパスワード */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword">新しいパスワード *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="pl-10 pr-10"
                      placeholder="6文字以上で入力してください"
                      required
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2"
                      onClick={() => togglePasswordVisibility("new")}
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {formData.newPassword && formData.newPassword.length < 6 && (
                    <p className="text-sm text-red-600">パスワードは6文字以上で入力してください</p>
                  )}
                </div>

                {/* パスワード確認 */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">パスワード確認 *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pl-10 pr-10"
                      placeholder="パスワードを再入力してください"
                      required
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2"
                      onClick={() => togglePasswordVisibility("confirm")}
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                    <p className="text-sm text-red-600">パスワードが一致しません</p>
                  )}
                </div>

                {/* パスワード要件 */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">パスワードの要件</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• 6文字以上で入力してください</li>
                    <li>• 英数字や記号を組み合わせると、より安全です</li>
                  </ul>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  <Shield className="h-4 w-4 mr-2" />
                  {loading ? "更新中..." : "パスワードを更新"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}