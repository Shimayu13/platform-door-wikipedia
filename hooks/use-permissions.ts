"use client"

import { useAuthContext } from "@/components/auth-provider"
import { getUserProfile, type UserProfile } from "@/lib/auth"
import { hasPermission, hasHigherOrEqualRole, type UserRole, Permission } from "@/lib/permissions"
import { useEffect, useState } from "react"

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

  const userRole = profile?.role

  return {
    user,
    profile,
    userRole,
    loading: authLoading || loading,
    hasPermission: (permission: Permission) => hasPermission(userRole, permission),
    hasRole: (requiredRole: UserRole) => hasHigherOrEqualRole(userRole, requiredRole),
    canManageUsers: () => hasPermission(userRole, Permission.MANAGE_USERS),
    canEditContent: () => hasPermission(userRole, Permission.UPDATE_STATION_INFO),
    canDeleteContent: () => hasPermission(userRole, Permission.DELETE_STATION_INFO),
    canManageNews: () => hasPermission(userRole, Permission.MANAGE_NEWS),
    isAdmin: () => userRole === "開発者",
    isEditor: () => hasHigherOrEqualRole(userRole, "編集者"),
    isContributor: () => hasHigherOrEqualRole(userRole, "提供者"),
  }
}
