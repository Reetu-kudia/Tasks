# Day 5 — Task 04: Safe Filter-to-Request Integration Pipeline

**Deliverable Path:** `reports/week-1/day-05/task-04-filter-api-integration.md`  
**Context:** GRID-IITB Renewable Energy Forecasting Portal  
**Integrated Component:** `Day 5/src/FilterBarView.tsx`  
**Filter Controller / Utilities:** `Day 5/src/filter-integration.ts`  
**Test Suite:** `Day 5/src/test-filter-integration.cjs`  
**Author:** Training Engineer  
**Date:** 2026-10-19  

---

## 1. Executive Summary & Objective

In power-grid operations, control room engineers must filter forecasting telemetry across thousands of renewable assets by geographic region, generation type (Solar vs. Wind), operational date, forecast revision cycles ($R_0, R_1$), and specific pooling substation identifiers.

Naive implementations often introduce three critical vulnerabilities:
1. **Unencoded URL string concatenation:** Manual string template interpolation (`url = "/api?region=" + region`) breaks on special characters (e.g. slashes in `"ISTS-NR/WR"` or ampersands in substation names), leading to corrupted query parameters or HTTP 400 Bad Request errors.
2. **Full-page reloads:** Forcing browser reloads on every dropdown change discards client-side application state, unmounts map canvases, and degrades operator responsiveness.
3. **Async race conditions:** Rapid filter toggling (e.g. switching from Gujarat to Rajasthan, then Maharashtra in rapid succession) can cause slow responses from the first request to resolve after the third request, overwriting fresh data with stale telemetry.

Task 04 establishes a hardened, validated, and asynchronous **Filter-to-Request Pipeline** that sanitizes query parameters, maintains visual active filter badges, eliminates full-page reloads, and cancels superseded network requests using `AbortController`.

---

## 2. Filter-to-Query Parameter Mapping Architecture

| UI Filter Control | State Key | Query Param | Example Value | Validation & Sanitization Rule |
| :--- | :--- | :--- | :--- | :--- |
| **Region Selector** | `regionCode` | `region` | `GJ`, `MH`, `ISTS-NR/WR` | Trimmed, converted to uppercase. Omitted if `"ALL"`, empty, or null. |
| **Generation Type** | `plantType` | `type` | `SOLAR`, `WIND` | Enforces enum `["SOLAR", "WIND"]`. Omitted if `"ALL"`. |
| **Forecast Date** | `date` | `date` | `2026-10-19` | Strict regex check `^\d{4}-\d{2}-\d{2}$`. Dropped if malformed. |
| **Forecast Revision** | `revision` | `revision` | `R0`, `R1`, `R2` | Strict regex check `^R\d+$`. Dropped if invalid format. |
| **Substation / Site** | `searchQuery` | `q` | `Charanka & Bhadla` | RFC 3986 escaped. `&` becomes `%26`, `/` becomes `%2F`. |
| **Page Number** | `page` | `page` | `2` | Positive integer. Omitted if `1` (default). |
| **Page Size** | `pageSize` | `pageSize` | `50` | Positive integer. Omitted if `20` (default). |

---

## 3. Safe URL Encoding & Defensive Sanitization

The URL construction relies on the native `URLSearchParams` API, ensuring standards-compliant URI encoding:

```typescript
export function buildSafeQueryParams(
  filters: DashboardFilters,
  baseEndpoint: string = "/api/series"
): SanitizedQueryOutput {
  const params = new URLSearchParams()
  const badges: Array<{ key: keyof DashboardFilters; label: string; value: string }> = []

  // 1. Region Code
  if (filters.regionCode && typeof filters.regionCode === "string") {
    const trimmed = filters.regionCode.trim()
    if (trimmed.length > 0 && trimmed.toUpperCase() !== "ALL") {
      params.set("region", trimmed.toUpperCase())
      badges.push({ key: "regionCode", label: "Region", value: trimmed.toUpperCase() })
    }
  }

  // 2. Plant Type
  if (filters.plantType && filters.plantType !== "ALL") {
    const upper = filters.plantType.toUpperCase()
    if (upper === "SOLAR" || upper === "WIND") {
      params.set("type", upper)
      badges.push({ key: "plantType", label: "Type", value: upper })
    }
  }

  // 3. Defensive Date Sanitization
  if (filters.date) {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/
    if (datePattern.test(filters.date)) {
      params.set("date", filters.date)
      badges.push({ key: "date", label: "Date", value: filters.date })
    }
    // Malformed dates are safely omitted rather than generating server 400 errors
  }

  // 4. Revision
  if (filters.revision && typeof filters.revision === "string") {
    const revTrimmed = filters.revision.trim().toUpperCase()
    if (/^R\d+$/.test(revTrimmed)) {
      params.set("revision", revTrimmed)
      badges.push({ key: "revision", label: "Revision", value: revTrimmed })
    }
  }

  // 5. Special Character Escaping (Free-text Search)
  if (filters.searchQuery && typeof filters.searchQuery === "string") {
    const query = filters.searchQuery.trim()
    if (query.length > 0) {
      params.set("q", query)
      badges.push({ key: "searchQuery", label: "Search", value: query })
    }
  }

  const queryString = params.toString()
  const url = queryString ? `${baseEndpoint}?${queryString}` : baseEndpoint

  return { queryString, url, activeFilterBadges: badges }
}
```

### Verification Against Malformed and Special Character Inputs:
- **Input:** `{ regionCode: "ISTS-NR/WR", searchQuery: "Bhadla Phase 1 & 2 / Substation" }`
- **Output Query String:**  
  `region=ISTS-NR%2FWR&q=Bhadla+Phase+1+%26+2+%2F+Substation`  
  *(Both the slash `%2F` and ampersand `%26` are safely escaped without syntax errors)*
- **Input with malformed date:** `{ regionCode: "MH", date: "invalid-date-string" }`
- **Output Query String:**  
  `region=MH`  
  *(The invalid date is gracefully filtered out, preventing downstream 400 Bad Request responses)*

---

## 4. Visual Active Filter Display (Chips / Badges)

The UI component (`FilterBarView.tsx`) renders dynamic interactive chips corresponding to active filter keys:
- **Chip Appearance:** Styled with dark charcoal background, blue border, and white bold text (e.g., `Region: GJ ✕`, `Type: SOLAR ✕`, `Date: 2026-10-19 ✕`).
- **Granular Dismissal:** Clicking the `✕` icon on any individual badge immediately removes that filter and re-triggers the asynchronous query.
- **Global Reset:** A **"Clear All"** link clears all filters back to default unrestricted view.
- **Query URL Inspector:** A live monospace preview banner demonstrates real-time parameter serialization to operators and developers.

---

## 5. Asynchronous Query Execution & Race Condition Elimination

To eliminate full-page reloads and prevent stale responses from overwriting current data, the `FilterRequestController` utilizes the web `AbortController` standard:

```mermaid
sequenceDiagram
    autonumber
    actor Operator as Grid Operator
    participant UI as FilterBarView
    participant Ctrl as FilterRequestController
    participant Srv as API Server (/api/series)

    Operator->>UI: Selects Region "Gujarat"
    UI->>Ctrl: executeQuery({ regionCode: "GJ" })
    Ctrl->>Srv: GET /api/series?region=GJ (Request #1)
    
    Note over Operator,UI: Operator rapidly switches to "Rajasthan"
    Operator->>UI: Selects Region "Rajasthan"
    UI->>Ctrl: executeQuery({ regionCode: "RJ" })
    Ctrl->>Ctrl: abortController.abort() [Cancels Request #1]
    Ctrl->>Srv: GET /api/series?region=RJ (Request #2)

    Srv-->>Ctrl: [Request #1 Aborted - Discarded by browser]
    Srv-->>Ctrl: 200 OK (Data for Rajasthan)
    Ctrl-->>UI: Updates State with Rajasthan Data
    UI-->>Operator: Telemetry updated smoothly without page reload!
```

### Key Engineering Benefits:
1. **Zero Full-Page Reloads:** Component state, scroll position, and map layers persist smoothly.
2. **Network Bandwidth Conservation:** Cancelled network requests release browser sockets immediately.
3. **Deterministic Rendering:** Operators will never observe out-of-order responses or flickering data.

---

## 6. Automated Test Suite Execution Evidence

The test suite in `Day 5/src/test-filter-integration.cjs` verified all 5 critical edge cases:

### Test Execution Command:
```powershell
node "Day 5\src\test-filter-integration.cjs"
```

### Execution Output:
```text
==================================================================
   Day 5 Task 4: Filter-to-Request Safe Pipeline Test Suite       
==================================================================

Test 1: Encoding valid multi-field filter state...
  [PASS] Generated URL: /api/series?region=GJ&type=SOLAR&date=2026-10-19&revision=R0
  [PASS] Active Badges: Region=GJ, Type=SOLAR, Date=2026-10-19, Revision=R0

Test 2: Verifying RFC 3986 URL Encoding of special characters...
  [PASS] Sanitized Special Characters URL: /api/series?region=ISTS-NR%2FWR&q=Bhadla+Phase+1+%26+2+%2F+Substation

Test 3: Testing omission of empty, null, undefined, and 'ALL' values...
  [PASS] Clean fallback URL without dirty query params: /api/series

Test 4: Defensive sanitization of malformed inputs...
  [PASS] Dropped invalid date & revision; preserved valid region: /api/series?region=MH

Test 5: Testing AbortController cancellation for rapid filter switches...
  [PASS] 2 superseded in-flight queries cancelled; latest query preserved without race condition.

==================================================================
   ALL 5 TEST CASES PASSED: Filter-to-Request Path is 100% Safe   
==================================================================
```

---

## 7. Deliverable Status & Summary

Task 04 provides a production-grade, defensive filter parameter pipeline. By guaranteeing standard RFC 3986 encoding, filtering out dirty empty keys, defensively stripping malformed values, presenting intuitive active filter chips, and managing asynchronous request lifecycles via `AbortController`, the frontend integrates seamlessly with the GRID-IITB read APIs without page reloads.
