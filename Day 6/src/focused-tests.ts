/**
 * Day 6 - Task 02: Focused Tests for the Training Slice
 * Tests RBAC authorization guards, Zod input validation schemas,
 * and view state machine transitions without secrets or external services.
 */

// ─── 1. Role Authorization Slice ─────────────────────────────────────────────

export type UserRole = "super_admin" | "admin" | "region_admin" | "state_admin" | "ists_admin"

export interface UserClaims {
  userId: string
  uname: string
  role: UserRole
  allowedRegionIds: string[]
}

const RANK: Record<UserRole, number> = {
  super_admin: 50,
  admin: 40,
  region_admin: 30,
  state_admin: 10,
  ists_admin: 10,
}

export const roleRank = (role: UserRole): number => RANK[role] ?? 0
export const isSuperAdmin = (u: UserClaims): boolean => u.role === "super_admin"
export const isAdmin = (u: UserClaims): boolean => u.role === "admin" || isSuperAdmin(u)
export const isRegionAdmin = (u: UserClaims): boolean => u.role === "region_admin" || isAdmin(u)
export const canManagePlants = (u: UserClaims): boolean => isRegionAdmin(u)
export const canManageRegions = (u: UserClaims): boolean => isAdmin(u)
export const canManageUsers = (u: UserClaims): boolean => isRegionAdmin(u)

export const creatableRoles = (creator: UserRole): UserRole[] => {
  switch (creator) {
    case "super_admin":
      return ["admin", "region_admin", "state_admin", "ists_admin"]
    case "admin":
      return ["region_admin", "state_admin", "ists_admin"]
    case "region_admin":
      return ["state_admin", "ists_admin"]
    default:
      return []
  }
}

export const canAccessRegion = (user: UserClaims, regionId: string): boolean => {
  if (!user.allowedRegionIds.length) return true
  return user.allowedRegionIds.includes(regionId)
}

export const canAccessPlant = (
  user: UserClaims,
  plantRegionId: string,
  plantIstsRegionId?: string | null
): boolean => {
  if (!user.allowedRegionIds.length) return true
  return (
    user.allowedRegionIds.includes(plantRegionId) ||
    (!!plantIstsRegionId && user.allowedRegionIds.includes(plantIstsRegionId))
  )
}

// ─── 2. Validation Schema Slice (Zod-compatible validation) ───────────────────

export interface PlantInput {
  plantName: string
  regionId: string
  istsRegionId?: string | null
  plantType?: "SOLAR" | "WIND"
  installedCapacityMw?: number | null
  lat?: number | null
  lon?: number | null
  poolingStation?: string | null
}

export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: string[]
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function validatePlantInput(input: unknown): ValidationResult<PlantInput> {
  const errors: string[] = []

  if (!input || typeof input !== "object") {
    return { success: false, errors: ["Input must be a valid JSON object"] }
  }

  const p = input as Record<string, unknown>

  // Plant Name
  if (typeof p.plantName !== "string" || p.plantName.trim().length === 0) {
    errors.push("plantName is required and must not be empty")
  } else if (p.plantName.length > 200) {
    errors.push("plantName must not exceed 200 characters")
  }

  // Region ID (UUID)
  if (typeof p.regionId !== "string" || !UUID_REGEX.test(p.regionId)) {
    errors.push("regionId must be a valid UUID")
  }

  // ISTS Region ID (Optional UUID)
  if (p.istsRegionId !== undefined && p.istsRegionId !== null) {
    if (typeof p.istsRegionId !== "string" || !UUID_REGEX.test(p.istsRegionId)) {
      errors.push("istsRegionId must be a valid UUID if provided")
    }
  }

  // Plant Type
  const plantType = p.plantType ?? "SOLAR"
  if (plantType !== "SOLAR" && plantType !== "WIND") {
    errors.push("plantType must be either SOLAR or WIND")
  }

  // Installed Capacity MW
  if (p.installedCapacityMw !== undefined && p.installedCapacityMw !== null) {
    if (typeof p.installedCapacityMw !== "number" || isNaN(p.installedCapacityMw) || p.installedCapacityMw <= 0) {
      errors.push("installedCapacityMw must be a positive number")
    }
  }

  // Coordinates
  if (p.lat !== undefined && p.lat !== null) {
    if (typeof p.lat !== "number" || isNaN(p.lat) || p.lat < -90 || p.lat > 90) {
      errors.push("lat must be a number between -90 and 90")
    }
  }

  if (p.lon !== undefined && p.lon !== null) {
    if (typeof p.lon !== "number" || isNaN(p.lon) || p.lon < -180 || p.lon > 180) {
      errors.push("lon must be a number between -180 and 180")
    }
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  return {
    success: true,
    data: {
      plantName: (p.plantName as string).trim(),
      regionId: p.regionId as string,
      istsRegionId: (p.istsRegionId as string) || null,
      plantType: plantType as "SOLAR" | "WIND",
      installedCapacityMw: typeof p.installedCapacityMw === "number" ? p.installedCapacityMw : null,
      lat: typeof p.lat === "number" ? p.lat : null,
      lon: typeof p.lon === "number" ? p.lon : null,
      poolingStation: typeof p.poolingStation === "string" ? p.poolingStation.trim() : null,
    },
  }
}
