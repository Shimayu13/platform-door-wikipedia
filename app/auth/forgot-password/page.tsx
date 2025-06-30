"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, Send, CheckCircle, AlertCircle, Train } from "lucide-react"
import Link from "next/link"
import { sendPasswordResetEmail } from "@/lib/auth"

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (!email.trim()) {
      setMessage({ type: "error", text: "メールアドレスを入力してください" })
      setLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setMessage({ type: "error", text: "有効なメールアドレスを入力してください" })
      setLoading(false)
      return
    }

    try {
      const result = await sendPasswordResetEmail(email)

      if (result.success) {
        setMessage({ 
          type: "success", 
          text: "パスワードリセットメールを送信しました。メールをご確認ください。" 
        })
        setIsSubmitted(true)
      } else {
        setMessage({ type: "error", text: result.error || "メール送信に失敗しました" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "予期しないエラーが発生しました" })
    } finally {
      setLoading(false)
    }
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
          <p className="text-gray-600">パスワードリセット</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>パスワードをお忘れですか？</span>
            </CardTitle>
            <CardDescription>
              {isSubmitted
                ? "メールをご確認ください"
                : "登録済みのメールアドレスにパスワードリセットのリンクをお送りします"}
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

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? "送信中..." : "リセットメールを送信"}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-medium text-green-900 mb-1">メールを送信しました</h3>
                  <p className="text-sm text-green-700">
                    {email} にパスワードリセットのリンクをお送りしました。
                  </p>
                </div>

                <div className="text-sm text-gray-600 space-y-2">
                  <p>• メールが届かない場合は、迷惑メールフォルダもご確認ください</p>
                  <p>• リンクの有効期限は24時間です</p>
                  <p>• メールが届かない場合は、もう一度お試しください</p>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsSubmitted(false)
                    setMessage(null)
                    setEmail("")
                  }}
                >
                  別のメールアドレスで再送信
                </Button>
              </div>
            )}

            <div className="mt-6 text-center">
              <Button variant="ghost" asChild>
                <Link href="/auth">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  ログインページに戻る
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
