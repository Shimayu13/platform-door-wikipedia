// app/auth/page.tsx - 認証ページ修正版
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Train, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn, signUp } from "@/lib/auth"
import { useAuthContext } from "@/components/auth-provider"

export default function AuthPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [signinForm, setSigninForm] = useState({
    email: "",
    password: "",
  })

  const [signupForm, setSignupForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
  })

  // ログイン済みユーザーをリダイレクト
  useEffect(() => {
    if (!authLoading && user) {
      console.log("🔄 User is already logged in, redirecting...")
      router.push("/")
    }
  }, [user, authLoading, router])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const result = await signIn(signinForm.email, signinForm.password)

      if (result.success) {
        setMessage({ type: "success", text: "ログインしました" })
        // ユーザーが認証状態に変わるまで少し待つ
        setTimeout(() => {
          router.push("/")
        }, 1000)
      } else {
        setMessage({ type: "error", text: result.error || "ログインに失敗しました" })
      }
    } catch (error) {
      console.error("Sign in error:", error)
      setMessage({ type: "error", text: "予期しないエラーが発生しました" })
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // バリデーション
    if (signupForm.password !== signupForm.confirmPassword) {
      setMessage({ type: "error", text: "パスワードが一致しません" })
      setLoading(false)
      return
    }

    if (signupForm.password.length < 6) {
      setMessage({ type: "error", text: "パスワードは6文字以上で入力してください" })
      setLoading(false)
      return
    }

    try {
      const result = await signUp(signupForm.email, signupForm.password, signupForm.displayName)

      if (result.success) {
        setMessage({ 
          type: "success", 
          text: "アカウントを作成しました。確認メールをお送りしました。" 
        })
        // フォームをリセット
        setSignupForm({
          email: "",
          password: "",
          confirmPassword: "",
          displayName: "",
        })
      } else {
        setMessage({ type: "error", text: result.error || "アカウント作成に失敗しました" })
      }
    } catch (error) {
      console.error("Sign up error:", error)
      setMessage({ type: "error", text: "予期しないエラーが発生しました" })
    } finally {
      setLoading(false)
    }
  }

  // ログインチェック中のローディング表示
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <Train className="h-8 w-8 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">認証状態を確認中...</p>
        </div>
      </div>
    )
  }

  // ログイン済みの場合は何も表示しない（リダイレクト中）
  if (user) {
    return null
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
          <p className="text-gray-600">アカウントにログインまたは新規登録</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>認証</CardTitle>
            <CardDescription>ログインまたは新規アカウントを作成してください</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">ログイン</TabsTrigger>
                <TabsTrigger value="signup">新規登録</TabsTrigger>
              </TabsList>

              {/* メッセージ表示 */}
              {message && (
                <Alert className={`mt-4 ${message.type === "error" ? "border-red-200" : "border-green-200"}`}>
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

              {/* ログインタブ */}
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">メールアドレス</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={signinForm.email}
                      onChange={(e) => setSigninForm({ ...signinForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">パスワード</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={signinForm.password}
                      onChange={(e) => setSigninForm({ ...signinForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "ログイン中..." : "ログイン"}
                  </Button>
                  
                  <div className="text-center">
                    <Button variant="link" size="sm" asChild>
                      <Link href="/auth/forgot-password">
                        パスワードをお忘れの場合
                      </Link>
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* 新規登録タブ */}
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">表示名</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={signupForm.displayName}
                      onChange={(e) => setSignupForm({ ...signupForm, displayName: e.target.value })}
                      placeholder="ユーザー名"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">メールアドレス</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">パスワード</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">パスワード確認</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "作成中..." : "アカウント作成"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* フッター */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>
            アカウントを作成することで、
            <br />
            利用規約とプライバシーポリシーに同意したものとみなします
          </p>
        </div>
      </div>
    </div>
  )
}