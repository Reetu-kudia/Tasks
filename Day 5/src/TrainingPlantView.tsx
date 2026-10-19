import React, { useState, useEffect, useCallback } from "react"
import {
  PlantRecord,
  PlantListResponse,
  ViewState,
  fetchFromApi,
  transitionViewState,
} from "./read-integration"

interface TrainingPlantViewProps {
  selectedRegionId?: string
  apiBaseUrl?: string
}

export const TrainingPlantView: React.FC<TrainingPlantViewProps> = ({
  selectedRegionId,
  apiBaseUrl = "/api",
}) => {
  const [state, setState] = useState<ViewState<PlantRecord[]>>({
    status: "idle",
    data: null,
    error: null,
    timestamp: null,
  })

  const loadPlants = useCallback(async () => {
    setState((prev) => transitionViewState(prev, { type: "FETCH_INIT" }))

    try {
      const endpoint = selectedRegionId
        ? `/admin/plants?regionId=${encodeURIComponent(selectedRegionId)}`
        : "/admin/plants"

      const response = await fetchFromApi<PlantListResponse>(
        endpoint,
        {},
        { baseUrl: apiBaseUrl }
      )

      const items = response?.items ?? []
      const isEmpty = items.length === 0

      setState((prev) =>
        transitionViewState(prev, {
          type: "FETCH_SUCCESS",
          payload: items,
          isEmpty,
        })
      )
    } catch (err: unknown) {
      const errorObj = err as { message?: string; status?: number; data?: unknown }
      setState((prev) =>
        transitionViewState(prev, {
          type: "FETCH_ERROR",
          error: {
            message: errorObj.message || "An unexpected error occurred while loading plants.",
            statusCode: errorObj.status || 500,
            details: errorObj.data,
          },
        })
      )
    }
  }, [selectedRegionId, apiBaseUrl])

  useEffect(() => {
    loadPlants()
  }, [loadPlants])

  return (
    <div className="bg-[#111318] border border-gray-800 rounded-lg p-5 text-gray-200 font-sans shadow-xl">
      {/* Header with Title and Status Indicator */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            Training Plant Registry (Read-API Integration)
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time synchronization with read API &middot; Never masks errors as empty states
          </p>
        </div>
        <div className="flex items-center gap-2">
          {state.timestamp && (
            <span className="text-[11px] text-gray-500">
              Synced: {new Date(state.timestamp).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => loadPlants()}
            disabled={state.status === "loading"}
            className="px-3 py-1.5 bg-[#1e232d] hover:bg-[#282f3d] disabled:opacity-50 text-xs font-medium text-gray-300 rounded border border-gray-700 transition"
          >
            {state.status === "loading" ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* 1. LOADING STATE */}
      {state.status === "loading" && (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-400">Querying plant records from API endpoint...</p>
          <div className="w-full max-w-md space-y-2 mt-4">
            <div className="h-4 bg-gray-800 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-800 rounded w-5/6 animate-pulse"></div>
            <div className="h-4 bg-gray-800 rounded w-4/6 animate-pulse"></div>
          </div>
        </div>
      )}

      {/* 2. ERROR STATE (Visibly Explained - Never masked as empty) */}
      {state.status === "error" && (
        <div className="my-6 p-4 rounded-lg bg-red-950/40 border border-red-700/60 text-red-200">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-red-400">
                  Read API Request Failed
                </h4>
                {state.error?.statusCode && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-900/60 border border-red-800 text-red-300">
                    HTTP {state.error.statusCode}
                  </span>
                )}
              </div>
              <p className="text-xs text-red-300 mt-1">
                {state.error?.message}
              </p>
              <p className="text-[11px] text-gray-400 mt-2">
                <strong>Failure Isolation:</strong> Other dashboard components remain fully usable.
                This error indicates a transport or server failure rather than an empty database table.
              </p>
              <div className="mt-3">
                <button
                  onClick={() => loadPlants()}
                  className="px-3 py-1 bg-red-800 hover:bg-red-700 text-white text-xs font-medium rounded transition"
                >
                  Retry Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. EMPTY STATE (Legitimate 0 records found) */}
      {state.status === "empty" && (
        <div className="py-12 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-800/80 flex items-center justify-center text-gray-500 text-xl">
            📂
          </div>
          <h3 className="text-sm font-medium text-gray-300">No Plants Registered</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {selectedRegionId
              ? `No solar or wind plants found for region ID ${selectedRegionId}.`
              : "No generating stations match your query. Try clearing filters or adding new plants."}
          </p>
        </div>
      )}

      {/* 4. SUCCESS STATE (Populated List) */}
      {state.status === "success" && state.data && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 bg-[#161a22]">
                <th className="py-2.5 px-3 font-semibold">Plant Name</th>
                <th className="py-2.5 px-3 font-semibold">Primary Region</th>
                <th className="py-2.5 px-3 font-semibold">ISTS Assignment</th>
                <th className="py-2.5 px-3 font-semibold">Type</th>
                <th className="py-2.5 px-3 font-semibold text-right">Capacity (MW)</th>
                <th className="py-2.5 px-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-mono">
              {state.data.map((plant) => (
                <tr key={plant.plantId} className="hover:bg-[#1a202c]/50 transition">
                  <td className="py-2.5 px-3 font-sans font-medium text-white">
                    {plant.plantName}
                  </td>
                  <td className="py-2.5 px-3 text-gray-300">
                    {plant.regionName}
                  </td>
                  <td className="py-2.5 px-3 text-gray-400">
                    {plant.istsRegionName || "—"}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        plant.plantType === "SOLAR"
                          ? "bg-amber-950/60 text-amber-400 border border-amber-800/60"
                          : "bg-cyan-950/60 text-cyan-400 border border-cyan-800/60"
                      }`}
                    >
                      {plant.plantType}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-400">
                    {plant.installedCapacityMw?.toFixed(1) ?? "—"}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        plant.isActive ? "bg-emerald-500" : "bg-gray-600"
                      }`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 text-[11px] text-gray-500 text-right">
            Displaying {state.data.length} active generation asset{state.data.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  )
}

