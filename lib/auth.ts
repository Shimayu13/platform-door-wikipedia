// lib/auth.ts - 認証システム修正版
"use client"

import { createClient } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import type { UserRole } from "./permissions"
import { User as SupabaseUser } from '@supabase/auth-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 型定義を統一
export type User = SupabaseUser

export interface UserProfile {
  id: string
  name?: string
  username?: string
  display_name?: string
  bio?: string
  location?: string
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
      try {
        const {
          data: { session },
          error
        } = await supabase.auth.getSession()

        if (error) {
          console.error('Session error:', error)
          setUser(null)
        } else {
          console.log('🔐 Initial session:', session?.user?.id ? 'User logged in' : 'No user')
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('Error getting session:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state change:', event, session?.user?.id ? 'User logged in' : 'No user')
      
      setUser(session?.user ?? null)
      setLoading(false)

      // ユーザーがサインインした場合、プロフィールを作成または取得
      if (event === "SIGNED_IN" && session?.user) {
        await getOrCreateUserProfile(session.user.id, session.user.email)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}

// ユーザープロフィールを取得
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log("🔍 getUserProfile called with userId:", userId)
    
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Error fetching user profile:", error)
      return null
    }

    console.log("✅ getUserProfile result:", data)
    return data
  } catch (error) {
    console.error("Error in getUserProfile:", error)
    return null
  }
}

// ユーザープロフィールを作成または取得
export async function getOrCreateUserProfile(userId: string, userEmail?: string): Promise<UserProfile | null> {
  try {
    console.log("🔧 getOrCreateUserProfile called:", userId)
    
    // まずプロフィールを取得を試みる
    let profile = await getUserProfile(userId)

    // プロフィールが存在しない場合は作成
    if (!profile) {
      console.log("👤 Creating new user profile for:", userId)
      
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
      console.log("✅ Created user profile:", profile)
    }

    return profile
  } catch (error) {
    console.error("Error getting or creating user profile:", error)
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
export async function changeUserRole(userId: string, newRole: UserRole, currentUserRole: UserRole): Promise<{ success: boolean; error?: string }> {
  try {
    if (currentUserRole !== "開発者") {
      return { success: false, error: "権限がありません" }
    }

    const { error } = await supabase
      .from("user_profiles")
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq("id", userId)

    if (error) {
      console.error("Error changing user role:", error)
      return { success: false, error: "ロールの変更に失敗しました" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in changeUserRole:", error)
    return { success: false, error: "予期しないエラーが発生しました" }
  }
}

// 全ユーザーを取得（開発者のみ）
export async function getAllUsers(userRole: UserRole): Promise<{ success: boolean; data?: UserProfile[]; error?: string }> {
  try {
    if (userRole !== "開発者") {
      return { success: false, error: "権限がありません" }
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching all users:", error)
      return { success: false, error: "ユーザー一覧の取得に失敗しました" }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error in getAllUsers:", error)
    return { success: false, error: "予期しないエラーが発生しました" }
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

    console.log("✅ Sign in successful:", data.user?.id)
    return { success: true, data }
  } catch (error) {
    console.error("Sign in error:", error)
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

    console.log("✅ Sign out successful")
    return { success: true }
  } catch (error) {
    console.error("Sign out error:", error)
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

// パスワードリセットメール送信（エイリアス）
export async function sendPasswordResetEmail(email: string) {
  return resetPassword(email)
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