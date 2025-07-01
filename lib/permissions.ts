// lib/permissions.ts - 完全版
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
  MANAGE_LINES = "manage_lines",        // 路線管理
  MANAGE_STATIONS = "manage_stations",  // 駅管理
  CREATE_LINES = "create_lines",        // 路線作成
  UPDATE_LINES = "update_lines",        // 路線更新
  DELETE_LINES = "delete_lines",        // 路線削除

  // 開発者権限
  MANAGE_USERS = "manage_users",
  CHANGE_USER_ROLES = "change_user_roles",
  SYSTEM_ADMIN = "system_admin",
  DELETE_ANY_CONTENT = "delete_any_content",
}

// ロール別権限マッピング
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  閲覧者: [Permission.VIEW_CONTENT],
  提供者: [
    Permission.VIEW_CONTENT, 
    Permission.CREATE_STATION_INFO, 
    Permission.UPDATE_STATION_INFO
  ],
  編集者: [
    Permission.VIEW_CONTENT,
    Permission.CREATE_STATION_INFO,
    Permission.UPDATE_STATION_INFO,
    Permission.DELETE_STATION_INFO,
    Permission.MODERATE_CONTENT,
    Permission.MANAGE_NEWS,
    Permission.EDIT_LAYOUT,
    Permission.MANAGE_LINES,     // 路線管理追加
    Permission.MANAGE_STATIONS,  // 駅管理追加
    Permission.CREATE_LINES,
    Permission.UPDATE_LINES,
    Permission.DELETE_LINES,
  ],
  開発者: [
    Permission.VIEW_CONTENT,
    Permission.CREATE_STATION_INFO,
    Permission.UPDATE_STATION_INFO,
    Permission.DELETE_STATION_INFO,
    Permission.MODERATE_CONTENT,
    Permission.MANAGE_NEWS,
    Permission.EDIT_LAYOUT,
    Permission.MANAGE_LINES,     // 路線管理追加
    Permission.MANAGE_STATIONS,  // 駅管理追加
    Permission.CREATE_LINES,
    Permission.UPDATE_LINES,
    Permission.DELETE_LINES,
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
  編集者: "情報の削除・編集、ニュース管理、路線・駅管理が可能",
  開発者: "すべての権限を持つ（ユーザー管理、ロール変更等）",
}

// ロールの色分け
export const ROLE_COLORS: Record<UserRole, string> = {
  閲覧者: "bg-gray-100 text-gray-800",
  提供者: "bg-blue-100 text-blue-800",
  編集者: "bg-green-100 text-green-800",
  開発者: "bg-purple-100 text-purple-800",
}

// 管理画面アクセス用の便利関数
export function canAccessAdmin(userRole: UserRole | undefined): boolean {
  if (!userRole) return false
  return hasHigherOrEqualRole(userRole, "編集者")
}

export function canManageLines(userRole: UserRole | undefined): boolean {
  if (!userRole) return false
  return hasPermission(userRole, Permission.MANAGE_LINES)
}

export function canManageStations(userRole: UserRole | undefined): boolean {
  if (!userRole) return false
  return hasPermission(userRole, Permission.MANAGE_STATIONS)
}

export function canManageUsers(userRole: UserRole | undefined): boolean {
  if (!userRole) return false
  return hasPermission(userRole, Permission.MANAGE_USERS)
}

export function canManageNews(userRole: UserRole | undefined): boolean {
  if (!userRole) return false
  return hasPermission(userRole, Permission.MANAGE_NEWS)
}

// 権限名の日本語表示
export const PERMISSION_NAMES: Record<Permission, string> = {
  [Permission.VIEW_CONTENT]: "コンテンツ閲覧",
  [Permission.CREATE_STATION_INFO]: "駅情報作成",
  [Permission.UPDATE_STATION_INFO]: "駅情報更新",
  [Permission.DELETE_STATION_INFO]: "駅情報削除",
  [Permission.MODERATE_CONTENT]: "コンテンツ管理",
  [Permission.MANAGE_NEWS]: "ニュース管理",
  [Permission.EDIT_LAYOUT]: "レイアウト編集",
  [Permission.MANAGE_LINES]: "路線管理",
  [Permission.MANAGE_STATIONS]: "駅管理",
  [Permission.CREATE_LINES]: "路線作成",
  [Permission.UPDATE_LINES]: "路線更新",
  [Permission.DELETE_LINES]: "路線削除",
  [Permission.MANAGE_USERS]: "ユーザー管理",
  [Permission.CHANGE_USER_ROLES]: "ロール変更",
  [Permission.SYSTEM_ADMIN]: "システム管理",
  [Permission.DELETE_ANY_CONTENT]: "コンテンツ削除（全権限）",
}

// デバッグ用：ユーザーの全権限を取得
export function getUserPermissions(userRole: UserRole | undefined): Permission[] {
  if (!userRole) return []
  return ROLE_PERMISSIONS[userRole]
}

// デバッグ用：権限の詳細情報を取得
export function getPermissionDetails(userRole: UserRole | undefined) {
  if (!userRole) return { role: "未認証", permissions: [], level: 0 }
  
  return {
    role: userRole,
    permissions: ROLE_PERMISSIONS[userRole].map(p => ({
      permission: p,
      name: PERMISSION_NAMES[p]
    })),
    level: ROLE_LEVELS[userRole],
    description: ROLE_DESCRIPTIONS[userRole]
  }
}