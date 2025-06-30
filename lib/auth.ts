"use client"

import { createClient } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import type { UserRole } from "./permissions"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface User {
  id: string
  email: string
  user_metadata?: {
    [key: string]: any
  }
  app_metadata?: {
    [key: string]: any
  }
}

export interface UserProfile {
  id: string
  username?: string
  display_name?: string
  bio?: string
  avatar_url?: string
  role: UserRole
  created_at: string
  updated_at: string
}

// 認証状態を管理するカスタムフック
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 初期認証状態を取得
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

            // === デバッグログを追加 ===
      console.log('Initial session:', session);
      console.log('Session user:', session?.user);
      // === ここまで ===
      
      setUser(session?.user || null)
      setLoading(false)
    }

    getInitialSession()

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null)
      setLoading(false)

      // ユーザーがサインアップした場合、プロフィールを作成
      if (event === "SIGNED_UP" && session?.user) {
        await createUserProfile(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}

// ユーザープロフィールを作成
export async function createUserProfile(user: any) {
  try {
    // 既存のプロフィールをチェック
    const existingProfile = await getUserProfile(user.id)
    if (existingProfile) {
      return existingProfile
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .insert({
        id: user.id,
        display_name: user.user_metadata?.display_name || user.email?.split("@")[0] || "ユーザー",
        role: "閲覧者", // デフォルトロール
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating user profile:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error creating user profile:", error)
    return null
  }
}

// ユーザープロフィールを取得
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase.from("user_profiles").select("*").eq("id", userId)

    if (error) {
      console.error("Error fetching user profile:", error)
      return null
    }

    // データが存在しない場合はnullを返す
    if (!data || data.length === 0) {
      return null
    }

    // 複数のプロフィールが存在する場合は最初のものを返す
    return data[0]
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
}

// ユーザープロフィールを更新
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  try {
    const { error } = await supabase
      .from("user_profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("Error updating user profile:", error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating user profile:", error)
    return { success: false, error }
  }
}

// ユーザーロールを変更（開発者のみ）
export async function changeUserRole(userId: string, newRole: UserRole, currentUserRole: UserRole) {
  try {
    // 開発者のみがロール変更可能
    if (currentUserRole !== "開発者") {
      return { success: false, error: "権限がありません" }
    }

    const { error } = await supabase
      .from("user_profiles")
      .update({
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("Error changing user role:", error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error("Error changing user role:", error)
    return { success: false, error }
  }
}

// 全ユーザーを取得（開発者・編集者のみ）
export async function getAllUsers(currentUserRole: UserRole) {
  try {
    // 編集者以上のみがユーザー一覧を取得可能
    if (currentUserRole !== "開発者" && currentUserRole !== "編集者") {
      return { success: false, error: "権限がありません", data: [] }
    }

    const { data, error } = await supabase.from("user_profiles").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching users:", error)
      return { success: false, error, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Error fetching users:", error)
    return { success: false, error, data: [] }
  }
}

// サインアップ
export async function signUp(email: string, password: string, displayName?: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: "サインアップに失敗しました" }
  }
}

// サインイン
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: "サインインに失敗しました" }
  }
}

// サインアウト
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: "サインアウトに失敗しました" }
  }
}

// パスワードリセット
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: "パスワードリセットに失敗しました" }
  }
}

// プロフィールを取得または作成
export async function getOrCreateUserProfile(userId: string, userEmail?: string): Promise<UserProfile | null> {
  try {
    // まずプロフィールを取得を試みる
    let profile = await getUserProfile(userId)

    // プロフィールが存在しない場合は作成
    if (!profile) {
      const { data, error } = await supabase
        .from("user_profiles")
        .insert({
          id: userId,
          display_name: userEmail?.split("@")[0] || "ユーザー",
          role: "閲覧者", // デフォルトロール
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating user profile:", error)
        return null
      }

      profile = data
    }

    return profile
  } catch (error) {
    console.error("Error getting or creating user profile:", error)
    return null
  }
}

// パスワード変更（ログイン済みユーザー用）
export async function changePassword(currentPassword: string, newPassword: string) {
  try {
    // 現在のパスワードで再認証
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      return { success: false, error: "ユーザー情報を取得できませんでした" }
    }

    // 現在のパスワードで認証確認
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })

    if (verifyError) {
      return { success: false, error: "現在のパスワードが正しくありません" }
    }

    // 新しいパスワードに更新
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: "パスワード変更に失敗しました" }
  }
}

// パスワードリセットメール送信
export async function sendPasswordResetEmail(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: "パスワードリセットメールの送信に失敗しました" }
  }
}

// パスワードリセット確認（メールリンクから）
export async function confirmPasswordReset(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: "パスワードの更新に失敗しました" }
  }
}