"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Lock, Shield, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useAuthContext } from "@/components/auth-provider"
import { changePassword } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ChangePasswordPage() {
  const { user, loading: authLoading } = useAuthContext()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
    }
  }, [user, authLoading, router])

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
      setMessage({ type: "error", text: "新しいパスワードは6文字以上で入力してください" })
      setLoading(false)
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "新しいパスワードが一致しません" })
      setLoading(false)
      return
    }

    if (formData.currentPassword === formData.newPassword) {
      setMessage({ type: "error", text: "現在のパスワードと同じパスワードは設定できません" })
      setLoading(false)
      return
    }

    try {
      const result = await changePassword(formData.currentPassword, formData.newPassword)

      if (result.success) {
        setMessage({ type: "success", text: "パスワードを変更しました" })
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        setMessage({ type: "error", text: result.error || "パスワード変更に失敗しました" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "予期しないエラーが発生しました" })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Lock className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">パスワード変更</h1>
            </div>
            <nav className="flex space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/profile">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  プロフィールに戻る
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">パスワード変更</h2>
          <p className="text-gray-600">セキュリティのため、定期的にパスワードを変更することを推奨します</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>新しいパスワードの設定</CardTitle>
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

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 現在のパスワード */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">現在のパスワード *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="pl-10 pr-10"
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => togglePasswordVisibility("current")}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

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
                <Label htmlFor="confirmPassword">新しいパスワード（確認）*</Label>
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

              {/* パスワード強度の説明 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">パスワードの要件</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 6文字以上で入力してください</li>
                  <li>• 英数字や記号を組み合わせると、より安全です</li>
                  <li>• 他のサービスで使用しているパスワードとは異なるものを設定してください</li>
                </ul>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                <Shield className="h-4 w-4 mr-2" />
                {loading ? "変更中..." : "パスワードを変更"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}