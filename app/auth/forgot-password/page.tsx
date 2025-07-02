// app/auth/forgot-password/page.tsx - パスワードリセットページ
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Train, ArrowLeft, Mail, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { sendPasswordResetEmail } from "@/lib/auth"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const result = await sendPasswordResetEmail(email)

      if (result.success) {
        setMessage({
          type: "success",
          text: "パスワードリセットメールを送信しました。メールをご確認ください。"
        })
        setSent(true)
      } else {
        setMessage({
          type: "error",
          text: result.error || "メールの送信に失敗しました"
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Train className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">ホームドア情報局</h1>
          </div>
          <p className="text-gray-600">パスワードをお忘れの場合</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              パスワードリセット
            </CardTitle>
            <CardDescription>
              {sent 
                ? "メールを送信しました"
                : "登録されたメールアドレスにリセット用のリンクをお送りします"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    パスワードリセット用のリンクを含むメールを送信しました。
                    メールボックスをご確認ください。
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• メールが届かない場合は、迷惑メールフォルダもご確認ください</p>
                  <p>• リンクの有効期限は24時間です</p>
                  <p>• メールアドレスが間違っている場合は、もう一度お試しください</p>
                </div>

                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSent(false)
                      setMessage(null)
                      setEmail("")
                    }}
                    className="flex-1"
                  >
                    再送信
                  </Button>
                  <Button asChild className="flex-1">
                    <Link href="/auth">ログインに戻る</Link>
                  </Button>
                </div>
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
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    disabled={loading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "送信中..." : "リセットメールを送信"}
                </Button>

                <div className="text-center">
                  <Button variant="ghost" asChild>
                    <Link href="/auth">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      ログインに戻る
                    </Link>
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* フッター */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>
            メールアドレスを間違えて登録した場合は、
            <br />
            新しいアカウントを作成してください
          </p>
        </div>
      </div>
    </div>
  )
}