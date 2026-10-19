/**
 * Day 5 - Task 04: Safe Filter-to-Request Integration Pipeline
 * Encodes, validates, and manages filter state for read API requests.
 * Eliminates race conditions with AbortController and avoids full-page reloads.
 */

export interface DashboardFilters {
  regionCode?: string
  plantType?: "SOLAR" | "WIND" | "ALL"
  date?: string // YYYY-MM-DD
  revision?: string // R0, R1, R2
  searchQuery?: string
  page?: number
  pageSize?: number
}

export interface SanitizedQueryOutput {
  queryString: string
  url: string
  activeFilterBadges: Array<{ key: keyof DashboardFilters; label: string; value: string }>
}

/**
 * Validates and encodes filter parameters safely using URLSearchParams.
 * Strips empty/undefined/all fields and sanitizes malformed inputs.
 */
export function buildSafeQueryParams(
  filters: DashboardFilters,
  baseEndpoint: string = "/api/series"
): SanitizedQueryOutput {
  const params = new URLSearchParams()
  const badges: Array<{ key: keyof DashboardFilters; label: string; value: string }> = []

  // 1. Validate and encode Region Code
  if (filters.regionCode && typeof filters.regionCode === "string") {
    const trimmed = filters.regionCode.trim()
    if (trimmed.length > 0 && trimmed.toUpperCase() !== "ALL") {
      params.set("region", trimmed.toUpperCase())
      badges.push({ key: "regionCode", label: "Region", value: trimmed.toUpperCase() })
    }
  }

  // 2. Validate and encode Plant Type
  if (filters.plantType && filters.plantType !== "ALL") {
    const upper = filters.plantType.toUpperCase()
    if (upper === "SOLAR" || upper === "WIND") {
      params.set("type", upper)
      badges.push({ key: "plantType", label: "Type", value: upper })
    }
  }

  // 3. Validate Date format (YYYY-MM-DD)
  if (filters.date) {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/
    if (datePattern.test(filters.date)) {
      params.set("date", filters.date)
      badges.push({ key: "date", label: "Date", value: filters.date })
    }
    // If date format is invalid, it is safely omitted rather than breaking the request
  }

  // 4. Validate and encode Revision (e.g. R0, R1, R2)
  if (filters.revision && typeof filters.revision === "string") {
    const revTrimmed = filters.revision.trim().toUpperCase()
    if (/^R\d+$/.test(revTrimmed)) {
      params.set("revision", revTrimmed)
      badges.push({ key: "revision", label: "Revision", value: revTrimmed })
    }
  }

  // 5. Validate and encode Free-text Search (safely URL-encodes special chars like &, /, spaces)
  if (filters.searchQuery && typeof filters.searchQuery === "string") {
    const query = filters.searchQuery.trim()
    if (query.length > 0) {
      params.set("q", query)
      badges.push({ key: "searchQuery", label: "Search", value: query })
    }
  }

  // 6. Pagination parameters
  if (filters.page && Number.isInteger(filters.page) && filters.page > 1) {
    params.set("page", String(filters.page))
  }
  if (filters.pageSize && Number.isInteger(filters.pageSize) && filters.pageSize !== 20) {
    params.set("pageSize", String(filters.pageSize))
  }

  const queryString = params.toString()
  const url = queryString ? `${baseEndpoint}?${queryString}` : baseEndpoint

  return {
    queryString,
    url,
    activeFilterBadges: badges,
  }
}

/**
 * Filter Request Controller: Manages async dispatches and handles cancellation
 */
export class FilterRequestController {
  private activeController: AbortController | null = null

  /**
   * Dispatches a query request with automatic cancellation of in-flight stale requests
   */
  async executeQuery<T>(
    filters: DashboardFilters,
    baseEndpoint: string = "/api/series",
    fetcher?: (url: string, signal: AbortSignal) => Promise<T>
  ): Promise<{ data: T; queryUrl: string; badges: SanitizedQueryOutput["activeFilterBadges"] }> {
    // 1. Abort any previous pending request (prevents race conditions)
    if (this.activeController) {
      this.activeController.abort("New filter applied")
    }

    const controller = new AbortController()
    this.activeController = controller

    const { url, activeFilterBadges } = buildSafeQueryParams(filters, baseEndpoint)

    try {
      let result: T
      if (fetcher) {
        result = await fetcher(url, controller.signal)
      } else {
        const res = await fetch(url, {
          signal: controller.signal,
          credentials: "include",
          headers: { Accept: "application/json" },
        })
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Filter query failed`)
        }
        const json = await res.json()
        result = (json.data ?? json) as T
      }

      return {
        data: result,
        queryUrl: url,
        badges: activeFilterBadges,
      }
    } finally {
      if (this.activeController === controller) {
        this.activeController = null
      }
    }
  }

  /**
   * Cancel currently pending request
   */
  abort(): void {
    if (this.activeController) {
      this.activeController.abort("Manually aborted by user")
      this.activeController = null
    }
  }
}

