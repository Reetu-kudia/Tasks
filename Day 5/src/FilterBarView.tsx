import React, { useState, useEffect, useMemo, useCallback } from "react"
import {
  DashboardFilters,
  buildSafeQueryParams,
  FilterRequestController,
} from "./filter-integration"

interface FilterBarViewProps {
  onFiltersChange?: (queryUrl: string, filters: DashboardFilters) => void
}

export const FilterBarView: React.FC<FilterBarViewProps> = ({ onFiltersChange }) => {
  const [filters, setFilters] = useState<DashboardFilters>({
    regionCode: "GJ",
    plantType: "ALL",
    date: "2026-10-19",
    revision: "R0",
    searchQuery: "",
  })

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [queryCount, setQueryCount] = useState<number>(0)

  const controller = useMemo(() => new FilterRequestController(), [])

  const { url, activeFilterBadges } = useMemo(
    () => buildSafeQueryParams(filters, "/api/series"),
    [filters]
  )

  const applyFilters = useCallback(async () => {
    setIsLoading(true)
    try {
      // Execute without full-page reload
      await controller.executeQuery(
        filters,
        "/api/series",
        async (queryUrl, signal) => {
          // Simulated mock fetch respecting cancellation signal
          return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
              resolve({ status: "ok", timestamp: new Date().toISOString() })
            }, 300)

            signal.addEventListener("abort", () => {
              clearTimeout(timer)
              reject(new DOMException("Aborted", "AbortError"))
            })
          })
        }
      )
      setQueryCount((c) => c + 1)
      if (onFiltersChange) {
        onFiltersChange(url, filters)
      }
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        console.error("Filter request error:", err)
      }
    } finally {
      setIsLoading(false)
    }
  }, [filters, controller, url, onFiltersChange])

  // Trigger query automatically when filters change (debounced/cancelled safely)
  useEffect(() => {
    applyFilters()
  }, [filters, applyFilters])

  const removeFilter = (key: keyof DashboardFilters) => {
    setFilters((prev) => {
      const next = { ...prev }
      if (key === "plantType") next.plantType = "ALL"
      else delete next[key]
      return next
    })
  }

  const clearAllFilters = () => {
    setFilters({
      regionCode: undefined,
      plantType: "ALL",
      date: undefined,
      revision: undefined,
      searchQuery: "",
    })
  }

  return (
    <div className="bg-[#111318] border border-gray-800 rounded-lg p-4 font-sans text-gray-200 shadow-md">
      {/* Title & Request Metric */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-800 text-xs">
        <span className="font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Safe Filter-to-Request Control Panel
        </span>
        <div className="flex items-center gap-3 text-gray-500">
          <span>Async Dispatches: <strong className="text-gray-300 font-mono">{queryCount}</strong></span>
          <span className="text-emerald-400">Zero Page Reloads</span>
        </div>
      </div>

      {/* Filter Controls Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
        {/* 1. Region Selector */}
        <div>
          <label className="block text-[11px] font-medium text-gray-400 mb-1">Region</label>
          <select
            value={filters.regionCode ?? "ALL"}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                regionCode: e.target.value === "ALL" ? undefined : e.target.value,
              }))
            }
            className="w-full bg-[#1c212b] border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Regions</option>
            <option value="GJ">GJ - Gujarat</option>
            <option value="MH">MH - Maharashtra</option>
            <option value="RJ">RJ - Rajasthan</option>
            <option value="WR">WR - Western Region (ISTS)</option>
            <option value="NR">NR - Northern Region (ISTS)</option>
          </select>
        </div>

        {/* 2. Plant Type */}
        <div>
          <label className="block text-[11px] font-medium text-gray-400 mb-1">Generation Type</label>
          <select
            value={filters.plantType ?? "ALL"}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                plantType: e.target.value as DashboardFilters["plantType"],
              }))
            }
            className="w-full bg-[#1c212b] border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Types</option>
            <option value="SOLAR">Solar Only</option>
            <option value="WIND">Wind Only</option>
          </select>
        </div>

        {/* 3. Date Picker */}
        <div>
          <label className="block text-[11px] font-medium text-gray-400 mb-1">Forecast Date</label>
          <input
            type="date"
            value={filters.date ?? ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                date: e.target.value || undefined,
              }))
            }
            className="w-full bg-[#1c212b] border border-gray-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* 4. Revision */}
        <div>
          <label className="block text-[11px] font-medium text-gray-400 mb-1">Forecast Revision</label>
          <select
            value={filters.revision ?? ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                revision: e.target.value || undefined,
              }))
            }
            className="w-full bg-[#1c212b] border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Latest Run</option>
            <option value="R0">R0 (Day-Ahead Base)</option>
            <option value="R1">R1 (Intra-Day Rev 1)</option>
            <option value="R2">R2 (Intra-Day Rev 2)</option>
          </select>
        </div>

        {/* 5. Search Bar */}
        <div>
          <label className="block text-[11px] font-medium text-gray-400 mb-1">Site / Substation</label>
          <input
            type="text"
            placeholder="e.g. Charanka & Bhadla"
            value={filters.searchQuery ?? ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                searchQuery: e.target.value,
              }))
            }
            className="w-full bg-[#1c212b] border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Active Filter Chips / Badges */}
      <div className="mt-4 pt-3 border-t border-gray-800/80 flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-gray-500 font-medium mr-1">Active Filters:</span>
        {activeFilterBadges.length === 0 ? (
          <span className="text-[11px] text-gray-600 italic">None (Displaying unrestricted dataset)</span>
        ) : (
          <>
            {activeFilterBadges.map((badge) => (
              <span
                key={badge.key}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] bg-blue-950/60 border border-blue-700/60 text-blue-300 font-medium"
              >
                <span>{badge.label}:</span>
                <strong className="text-white">{badge.value}</strong>
                <button
                  type="button"
                  onClick={() => removeFilter(badge.key)}
                  className="hover:text-red-400 ml-1 text-gray-400 font-bold"
                  title={`Remove ${badge.label} filter`}
                >
                  &times;
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-[11px] text-gray-400 hover:text-white underline ml-2 transition"
            >
              Clear All
            </button>
          </>
        )}
      </div>

      {/* Query URL Preview & Loading Indicator */}
      <div className="mt-3 p-2 bg-[#0d0f12] rounded border border-gray-800/80 flex items-center justify-between text-[11px] font-mono">
        <div className="truncate text-gray-400">
          <span className="text-emerald-500 select-none mr-1.5">&gt;</span>
          <span className="text-gray-500">Query URL:</span>{" "}
          <span className="text-blue-400">{url}</span>
        </div>
        {isLoading && (
          <span className="text-amber-400 flex items-center gap-1.5 shrink-0 pl-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
            Syncing...
          </span>
        )}
      </div>
    </div>
  )
}
