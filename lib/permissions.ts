// 権限管理システム

export type UserRole = "閲覧者" | "提供者" | "編集者" | "開発者"

// ロールの階層レベル（数値が高いほど上位権限）
export const ROLE_LEVELS: Record<UserRole, number> = {
  閲覧者: 1,
  提供者: 2,
  編集者: 3,
  開発者: 4,
}

// 権限の種類
export enum Permission {
  // 基本権限
  VIEW_CONTENT = "view_content",

  // 提供者権限
  CREATE_STATION_INFO = "create_station_info",
  UPDATE_STATION_INFO = "update_station_info",

  // 編集者権限
  DELETE_STATION_INFO = "delete_station_info",
  MODERATE_CONTENT = "moderate_content",
  MANAGE_NEWS = "manage_news",
  EDIT_LAYOUT = "edit_layout",

  // 開発者権限
  MANAGE_USERS = "manage_users",
  CHANGE_USER_ROLES = "change_user_roles",
  SYSTEM_ADMIN = "system_admin",
  DELETE_ANY_CONTENT = "delete_any_content",
}

// ロール別権限マッピング
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  閲覧者: [Permission.VIEW_CONTENT],
  提供者: [Permission.VIEW_CONTENT, Permission.CREATE_STATION_INFO, Permission.UPDATE_STATION_INFO],
  編集者: [
    Permission.VIEW_CONTENT,
    Permission.CREATE_STATION_INFO,
    Permission.UPDATE_STATION_INFO,
    Permission.DELETE_STATION_INFO,
    Permission.MODERATE_CONTENT,
    Permission.MANAGE_NEWS,
    Permission.EDIT_LAYOUT,
  ],
  開発者: [
    Permission.VIEW_CONTENT,
    Permission.CREATE_STATION_INFO,
    Permission.UPDATE_STATION_INFO,
    Permission.DELETE_STATION_INFO,
    Permission.MODERATE_CONTENT,
    Permission.MANAGE_NEWS,
    Permission.EDIT_LAYOUT,
    Permission.MANAGE_USERS,
    Permission.CHANGE_USER_ROLES,
    Permission.SYSTEM_ADMIN,
    Permission.DELETE_ANY_CONTENT,
  ],
}

// 権限チェック関数
export function hasPermission(userRole: UserRole | undefined, permission: Permission): boolean {
  if (!userRole) return false
  return ROLE_PERMISSIONS[userRole].includes(permission)
}

// ロール比較関数（上位ロールかどうか）
export function hasHigherOrEqualRole(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole]
}

// ロール名の表示用関数
export function getRoleDisplayName(role: UserRole): string {
  return role
}

// ロールの説明
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  閲覧者: "サイトの閲覧のみ可能",
  提供者: "駅情報の入力・更新が可能",
  編集者: "情報の削除・編集、ニュース管理、レイアウト変更が可能",
  開発者: "すべての権限を持つ（ユーザー管理、ロール変更等）",
}

// ロールの色分け
export const ROLE_COLORS: Record<UserRole, string> = {
  閲覧者: "bg-gray-100 text-gray-800",
  提供者: "bg-blue-100 text-blue-800",
  編集者: "bg-green-100 text-green-800",
  開発者: "bg-purple-100 text-purple-800",
}
