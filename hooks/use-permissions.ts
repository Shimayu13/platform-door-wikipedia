"use client"

import { useEffect, useState } from "react"
import { useAuthContext } from "@/components/auth-provider"
import { getUserProfile, type UserProfile } from "@/lib/auth"
import { hasPermission, hasHigherOrEqualRole, Permission, type UserRole } from "@/lib/permissions"

export function usePermissions() {
  const { user, loading: authLoading } = useAuthContext()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setProfile(null)
        setLoading(false)
        return
      }

      try {
        const userProfile = await getUserProfile(user.id)
        setProfile(userProfile)
      } catch (error) {
        console.error("Error loading user profile:", error)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      loadProfile()
    }
  }, [user, authLoading])

  // 権限チェック関数
  const hasPermissionCheck = (permission: Permission): boolean => {
    return hasPermission(profile?.role, permission)
  }

  // ロールチェック関数
  const hasRole = (requiredRole: UserRole): boolean => {
    return hasHigherOrEqualRole(profile?.role, requiredRole)
  }

  // 特定の権限チェック関数
  const canEditContent = (): boolean => {
    return hasPermissionCheck(Permission.CREATE_STATION_INFO) || hasPermissionCheck(Permission.UPDATE_STATION_INFO)
  }

  const canDeleteContent = (): boolean => {
    return hasPermissionCheck(Permission.DELETE_STATION_INFO)
  }

  const canManageUsers = (): boolean => {
    return hasPermissionCheck(Permission.MANAGE_USERS)
  }

  const canManageNews = (): boolean => {
    return hasPermissionCheck(Permission.MANAGE_NEWS)
  }

  const isAdmin = (): boolean => {
    return hasRole("開発者")
  }

  const isEditor = (): boolean => {
    return hasRole("編集者")
  }

  const isContributor = (): boolean => {
    return hasRole("提供者")
  }

  return {
    user,
    profile,
    userRole: profile?.role,
    loading: authLoading || loading,
    
    // 権限チェック関数
    hasPermission: hasPermissionCheck,
    hasRole,
    
    // 便利関数
    canEditContent,
    canDeleteContent,
    canManageUsers,
    canManageNews,
    isAdmin,
    isEditor,
    isContributor,
  }
}