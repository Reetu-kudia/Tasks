# Task 03: Unified Training Dashboard (Integrated with Task 04 Filters & Task 05 API)

**Module:** 1 — Web, project setup, and first tiny projects  
**Sprint/Day:** Week 1, Day 01  
**Status:** Completed & Unified  
**Deliverable:** `reports/week-1/day-01/task-03-summary-card.md`  

---

## 1. Executive Summary & Unified Architecture

In accordance with instructor and project requirements, **Task 03 (Energy Summary Card Component)** has been updated to become the **single unified training dashboard**. 
Rather than keeping separate dashboards or tabs for Task 04 and Task 05:
1. **Task 04 Controlled Filters** (Grid Region dropdown, Forecast Run Date picker, Clear Filters) are integrated directly into the top of the Task 03 dashboard.
2. **Task 05 Training API & Inspector** (`GET /api/training/energy?region=...&date=...`) runs directly inside Task 03, returning typed JSON responses, HTTP status codes (`200 OK`, `400 Bad Request`, `404 Not Found`), and response headers.
3. **The API response directly drives the existing Task 03 Energy Summary Cards**, without duplicating cards or creating a second dashboard section.
4. **All original Task 03 functionality is preserved**: Upcoming Forecast Blocks (T to T+3), Forecast Context / Installed Capacity, Live Solar Power, Solar Radiation (GHI), side-by-side state verification cards, and Desktop / Tablet (768px) / Mobile (375px) viewport simulation controls.

---

## 2. Files Created & Modified

| File | Change Description |
| :--- | :--- |
| `src/TrainingRoute.tsx` | **Modified:** Converted from 3-tab layout into a **single unified dashboard**. Hosts controlled filters, API test buttons, collapsible network inspector, and cards connected directly to live API state. |
| `src/task-5-api/types.ts` | **Modified:** Enriched `RegionalEnergyTelemetry` and `ForecastBlockData` to supply regional forecast blocks, actual solar generation, GHI radiation, and metadata. |
| `vite.config.ts` | **Modified:** Enriched Vite server middleware for `GET /api/training/energy` with multi-region datasets (`ALL`, `WR`, `NR`, `SR`, `ER`, `NER`), status codes (`200`, `400`, `404`), and custom headers (`X-Training-API`, `X-Response-Time-Ms`). |
| `src/task-5-api/apiService.ts` | **Modified:** Updated client-side API fetch client and fallback database to match the enriched schema. |
| `src/app/api/training/energy/route.ts` | **Created:** Standard Next.js App Router Route Handler using Web standard `Request` and `Response`, providing zero-dependency route compliance. |
| `interactive-demo.html` | **Modified:** Standalone zero-install interactive preview updated to the unified architecture with live controlled filters, simulated API status codes, and reactive cards. |
| `reports/week-1/day-01/task-03-summary-card.md` | **Updated:** Comprehensive training report documenting the unified integration. |

---

## 3. Filter Behavior (Task 04 Integration)

The filters are placed in a compact, accessible toolbar above the cards:

* **Grid Region (`#grid-region-select`):**
  - Controlled dropdown supporting all approved training regions:
    - `WR`: Western Region (Default)
    - `NR`: Northern Region
    - `SR`: Southern Region
    - `ER`: Eastern Region (demonstrates null actuals / empty state)
    - `NER`: North Eastern Region (demonstrates null GHI sensor / empty state)
    - `ALL`: All Grids (National View)
  - Selecting a region immediately updates the React state and triggers an API request for that region.
* **Forecast Run Date (`#forecast-date-input`):**
  - Controlled HTML5 `<input type="date">`. Default is `2026-10-14`.
  - Date changes update the query string and metadata headers across the cards.
* **Clear Filters Button:**
  - One-click reset that restores Region to `WR` and Date to `2026-10-14`.
  - Automatically re-queries the API and re-renders the dashboard consistently.
* **Stale Request Protection:**
  - Implemented via a `latestRequestIdRef` tracking reference in `TrainingRoute.tsx`. Slower, out-of-order network responses are discarded if a newer filter selection has already been made.

---

## 4. Training API Endpoint & Response Structure (Task 05 Integration)

### Endpoint Specification:
```http
GET /api/training/energy?region={REGION_CODE}&date={YYYY-MM-DD}
```

### Response Schema Contract:
```typescript
export interface EnergyApiSuccessResponse {
  success: true;
  data: {
    regionId: string;
    regionName: string;
    regionCode: string;
    installedCapacityMW: number;
    currentForecastMW: number;
    forecastBlocks: Array<{
      label: string;    // 'T', 'T+1', 'T+2', 'T+3'
      sublabel: string; // '08:30', '08:45', etc.
      value: number | null;
      unit: string;
    }>;
    actualSolarMW: number | null;
    solarRadiationGhi: number | null;
    substationsCount: number;
    gridStatus: 'NORMAL' | 'ALERT' | 'OFFLINE';
    revision: string;
    queriedDate: string;
    timeRange: string;
    timestamp: string;
  };
  meta: {
    responseTimeMs: number;
    apiVersion: string;
    server: string;
  };
}
```

### HTTP Status Codes & Error Handling:
1. **`200 OK`**: Triggered when a recognized region is passed (e.g., `?region=WR`). Returns telemetry data.
2. **`400 Bad Request`**: Triggered via **"Test 400 Error"** button (omits `region` parameter). Server returns:
   ```json
   {
     "success": false,
     "error": {
       "code": "BAD_REQUEST",
       "message": "Missing required query parameter \"region\".",
       "details": "Usage: GET /api/training/energy?region=WR&date=2026-10-14"
     }
   }
   ```
   Renders a clear red validation banner: *"⚠️ 400 Bad Request: Missing required query parameter 'region'."*
3. **`404 Not Found`**: Triggered via **"Test 404 Error"** button (sends `region=UNKNOWN_REGION`). Server returns:
   ```json
   {
     "success": false,
     "error": {
       "code": "NOT_FOUND",
       "message": "Region \"UNKNOWN_REGION\" not recognized in grid dataset.",
       "details": "Allowed regions: ALL, WR, NR, SR, ER, NER"
     }
   }
   ```
   Renders an amber alert banner: *"🔍 404 Not Found: Region not recognized in grid dataset."*

---

## 5. Field Mapping from API Response to Existing Task 03 Cards

| Existing Task 03 Card | API Response Field | Behavior When Present | Behavior When Missing / Null |
| :--- | :--- | :--- | :--- |
| **Upcoming Forecast Blocks (`T, T+1, T+2, T+3`)** | `data.forecastBlocks[i].value` | Renders dynamic MW value in violet tabular typography (e.g. `8,250.7 MW` for WR; `5,420.0 MW` for NR). | Renders fallback dash `—` and message: *"No forecast data available for selected filters"*. |
| **Forecast Context / Installed Capacity** | `data.installedCapacityMW`, `data.revision`, `data.timeRange`, `data.regionCode` | Amber card displays regional capacity (e.g. `26,655.2 MW` for WR; `72,450.5 MW` for ALL), active revision, and queried date range. | Falls back to default context and empty state if API call fails. |
| **Live Solar Power** | `data.actualSolarMW` | Green card displays actual generation (e.g. `7,842.3 MW` for WR; `5,120.8 MW` for NR) with `Live IST` badge. | When null (e.g., in `ER` or `NER`), displays fallback dash `—` with `No Feed` badge: *"Telemetry feed unavailable for Eastern Region (ER)"*. |
| **Solar Radiation (GHI)** | `data.solarRadiationGhi` | Blue card displays GHI in `W/m²` (e.g. `842.5 W/m²` for WR) with `Clear Sky` badge. | When null (e.g., in `ER` or `NER`), displays fallback dash `—` with `No Sensor` badge: *"GHI pyranometer offline in Eastern Region (ER)"*. |

---

## 6. Verification of States & Responsiveness

### State Verification:
- **Loading State:** Tested both via real API fetch latency (`isApiLoading`) and via manual **"Toggle Loading"** button. Renders WCAG-accessible shimmer pulse skeleton cards with `aria-busy="true"` and `aria-live="polite"`.
- **Empty State:** Tested via manual **"Toggle Empty"** button, when regions have null metrics (`ER`, `NER`), or upon API error. No layout breakage occurs.
- **Collapsible Network Inspector:** Tested via **"Inspect API ▾"** button. Displays live HTTP request URL, response headers (`Content-Type`, `X-Training-API`, `X-Response-Time-Ms`), and syntax-highlighted formatted JSON without requiring a separate page.

### Viewport Verification:
- **Desktop (1200px):** 4-column forecast block grid, 3-column context/telemetry grid, horizontal filter toolbar.
- **Tablet (768px):** Auto-wrapping grid cards, preserved typography, zero horizontal scrollbars.
- **Mobile (375px):** Single-column stacked cards, full touch-friendly targets, font scales gracefully from 28px to 24px.

---

## 7. Build, Lint & Quality Results

Verification command executed:
```powershell
npm run build
```

Result log:
```
> task-03-summary-card@1.0.0 build
> tsc && vite build

vite v6.4.4 building for production...
transforming...
✓ 33 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.78 kB │ gzip:  0.49 kB
dist/assets/index-DHL1iKvb.css    3.26 kB │ gzip:  1.15 kB
dist/assets/index-iWnXW4jw.js   252.42 kB │ gzip: 76.96 kB
✓ built in 5.77s
```

* **TypeScript Compilation:** Passed with 0 errors.
* **Console Warnings/Errors:** 0 warnings, 0 errors.
* **Production Integrity:** The live portal repository (`grid-iitb`) was completely untouched.

---

## 8. How to Test & Review

### Option A: Interactive Zero-Install Browser Preview
Open directly in any browser:
```
c:\IIT\Tasks\Day 1\Task 3\interactive-demo.html
```

### Option B: Local React 19 Development Server
```powershell
cd "c:\IIT\Tasks\Day 1\Task 3"
npm run dev
```
Open `http://localhost:3000` to interact with the unified dashboard.
