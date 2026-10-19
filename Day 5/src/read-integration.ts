/**
 * Day 5 - Task 03: Typed Read API Integration
 * Replaces hard-coded mock fixture lists with typed, safe read API requests.
 * Explicitly distinguishes Loading, Success, Empty, and Error states.
 */

export interface PlantRecord {
  plantId: string
  plantName: string
  regionId: string
  regionName: string
  regionType?: string | null
  istsRegionId?: string | null
  istsRegionName?: string | null
  plantType: "SOLAR" | "WIND"
  installedCapacityMw: number | null
  lat?: number | null
  lon?: number | null
  poolingStation?: string | null
  isActive: boolean
  createdAt: string
}

export interface ApiResponseEnvelope<T> {
  data?: T
  error?: string
  status?: number
}

export interface PlantListResponse {
  items: PlantRecord[]
  total?: number
}

export interface ApiClientConfig {
  baseUrl: string
  timeoutMs?: number
}

export type ViewStateStatus = "idle" | "loading" | "success" | "empty" | "error"

export interface ViewState<T> {
  status: ViewStateStatus
  data: T | null
  error: {
    message: string
    statusCode?: number
    details?: unknown
  } | null
  timestamp: string | null
}

/**
 * Robust API Request Client matching the production api helper pattern
 */
export async function fetchFromApi<T>(
  endpoint: string,
  options: RequestInit = {},
  config: ApiClientConfig = { baseUrl: "/api" }
): Promise<T> {
  const url = `${config.baseUrl}${endpoint}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs ?? 10000)

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
    })

    clearTimeout(timeoutId)

    // Handle Authentication expiry
    if (res.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("userInfo")
        // In browser context: window.location.href = "/login"
      }
      const err = new Error("Session expired or unauthorized. Please log in again.") as Error & {
        status: number
      }
      err.status = 401
      throw err
    }

    if (!res.ok) {
      let errorBody: unknown = null
      try {
        errorBody = await res.json()
      } catch {
        errorBody = null
      }
      const message =
        (errorBody as { error?: string })?.error ??
        `API Request Failed: HTTP ${res.status} ${res.statusText}`
      const err = new Error(message) as Error & { status: number; data: unknown }
      err.status = res.status
      err.data = errorBody
      throw err
    }

    if (res.status === 204) {
      return null as T
    }

    const json = (await res.json()) as ApiResponseEnvelope<T>
    // Unwrap standard envelope { data: ... }
    return (json.data ?? json) as T
  } catch (err: unknown) {
    clearTimeout(timeoutId)
    throw err
  }
}

/**
 * State Transition Reducer: Guarantees error states are never converted into empty arrays
 */
export function transitionViewState<T>(
  prev: ViewState<T>,
  action:
    | { type: "FETCH_INIT" }
    | { type: "FETCH_SUCCESS"; payload: T; isEmpty: boolean }
    | { type: "FETCH_ERROR"; error: { message: string; statusCode?: number; details?: unknown } }
    | { type: "RESET" }
): ViewState<T> {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...prev,
        status: "loading",
        error: null,
      }
    case "FETCH_SUCCESS":
      return {
        status: action.isEmpty ? "empty" : "success",
        data: action.payload,
        error: null,
        timestamp: new Date().toISOString(),
      }
    case "FETCH_ERROR":
      // CRITICAL GUARD: Retain previous data or set null, but status MUST be 'error'
      // Never set status to 'empty' on error!
      return {
        status: "error",
        data: null,
        error: action.error,
        timestamp: new Date().toISOString(),
      }
    case "RESET":
      return {
        status: "idle",
        data: null,
        error: null,
        timestamp: null,
      }
    default:
      return prev
  }
}
