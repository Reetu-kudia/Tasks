# Task 05: Complete Architecture & Technical Deep-Dive

This document provides a comprehensive, production-grade guide to **Task 05 (Build and Call a Tiny Training API)** within the GI-IITB solar telemetry platform. It breaks down backend routing conventions, HTTP mechanics, full-stack integration, and client-side inspection.

---

## 1. High-Level Summary: What Was the Goal of Task 5?

In **Task 03**, we built the visual `EnergySummaryCard` component.  
In **Task 04**, we added client-side `FilterControls` with state and event handlers.  
However, in modern enterprise platforms like **GI-IITB**, telemetry and forecasts do not live in the frontend — they are retrieved from **Backend APIs / Microservices**.

**The Goal of Task 05 was to complete the Full-Stack Circle:**
1. **Build a Backend Route Handler:** Create an isolated, non-sensitive demo route at `/api/training/energy` returning strongly-typed JSON with appropriate HTTP status codes.
2. **Demonstrate Successful & Intentional Error Responses:**
   - **`200 OK`**: When given valid parameters (e.g. `?region=WR&date=2026-10-14`).
   - **`400 Bad Request`**: When a required parameter (`region`) is omitted.
   - **`404 Not Found`**: When an unrecognized region code is queried.
3. **Inspect HTTP Metadata:** Verify status codes, response headers (`Content-Type`, `X-Training-API`, `X-Response-Time-Ms`), and JSON payloads using `curl` / Postman and a built-in visual HTTP Inspector panel.
4. **Full-Stack UI Integration:** Call this API from the training UI, feed the response into React state, and dynamically populate the Task 03 `EnergySummaryCard` components.

---

## 2. Technical Architecture & File Map

Under the **DRY (Don't Repeat Yourself) Monolithic Architecture**:
- All runnable source code for Task 05 lives in the main codebase at `c:\IIT\Tasks\Day 1\Task 3\src\task-5-api\`.
- The backend route handler is configured as native server middleware in `c:\IIT\Tasks\Day 1\Task 3\vite.config.ts`.
- It imports the **single master component** `EnergySummaryCard.tsx` from `c:\IIT\Tasks\Day 1\Task 3\src\components\`.
- This folder (`Day 1/Task 5/`) houses formal submission reports, screenshots, and standalone interactive demo.

```
c:\IIT\Tasks\Day 1\
├── Task 3\                                <--- ⭐ Main Executable Codebase
│   ├── vite.config.ts                     # Backend Route Handler Middleware (/api/training/energy)
│   └── src\
│       ├── components\
│       │   └── EnergySummaryCard.tsx      # Shared Master Card Component (Task 03)
│       ├── task-4-filter\                 # Shared Filter Components (Task 04)
│       │   └── FilterControls.tsx
│       └── task-5-api\                    # Task 05 Feature Module
│           ├── types.ts                   # Strict TypeScript API interfaces
│           ├── apiService.ts              # Client API helper & response wrapper
│           ├── ApiInspectorPanel.tsx      # Visual HTTP Status, Header & JSON Inspector
│           └── Task5View.tsx              # Full-Stack Integration Page
│
└── Task 5\                                <--- 📁 Formal Deliverables
    ├── task-05-first-api.md               # Official submission report
    ├── task-05-understanding.md           # This comprehensive technical guide
    ├── interactive-demo.html              # Standalone 1-click preview
    └── image&video\                       # Screenshots
        ├── 1-Desktop.png
        └── 2-Mobile.png
```

---

## 3. The 4 Foundational Concepts Explained

The Task 05 prompt requires a formal technical mastery of four core internet concepts:

### ① HTTP Methods (Why `GET`?)
* **HTTP Methods (Verbs)** describe the intended action of a request:
  - `GET`: Safe, idempotent retrieval of data. Does NOT modify server state. Can be cached by CDNs and bookmarked.
  - `POST`: Submitting data to create a new resource or perform a non-idempotent calculation.
  - `PUT` / `PATCH`: Updating existing data.
  - `DELETE`: Removing a resource.
* **Why `GET` for Task 05?**  
  Telemetry queries are read-only operations. Querying solar telemetry for `Western Region` does not mutate any grid state, making `GET` the only architecturally correct choice.

---

### ② HTTP Status Codes (The Language of Server Responses)
HTTP status codes are standardized 3-digit numbers categorizing the outcome of a request:

| Code Range | Category | Task 05 Implementation |
| :--- | :--- | :--- |
| **`2xx` (Success)** | Request was received, understood, and accepted. | **`200 OK`**: Returns telemetry payload for valid region (`WR`, `NR`, `SR`, etc.). |
| **`4xx` (Client Error)** | The client made an invalid request. | **`400 Bad Request`**: Client failed to supply required query parameter `?region`.<br>**`404 Not Found`**: Client requested an invalid region (`UNKNOWN_REGION`). |
| **`5xx` (Server Error)** | The server failed while processing a valid request. | Handled gracefully with try/catch fallbacks. |

---

### ③ JSON (JavaScript Object Notation)
* **What it is:** A lightweight, text-based data interchange format that is language-independent.
* **Why modern web APIs use JSON:**
  - Machine-readable and human-readable.
  - Native parsing in JavaScript/TypeScript via `JSON.parse()` and `JSON.stringify()`.
  - Type safety: TypeScript interfaces enforce shape matching across frontend and backend.
* **Task 05 JSON Contract:**
  ```json
  {
    "success": true,
    "data": {
      "regionId": "WR",
      "regionName": "Western Region (WR)",
      "regionCode": "GRID-WR",
      "installedCapacityMW": 26655.2,
      "currentForecastMW": 18450.0,
      "substationsCount": 138,
      "gridStatus": "NORMAL",
      "revision": "Rev 04",
      "queriedDate": "2026-10-14",
      "timestamp": "2026-10-16T05:45:00.000Z"
    },
    "meta": {
      "responseTimeMs": 12,
      "apiVersion": "1.0.0-training",
      "server": "Training Route Handler"
    }
  }
  ```

---

### ④ The Complete Request / Response Lifecycle

```
[ 1. User Action ]
  Click "Call API (200 OK)" with region="WR", date="2026-10-14"
         │
         ▼
[ 2. Client API Helper: apiService.ts ]
  Executes: fetch('/api/training/energy?region=WR&date=2026-10-14')
         │
         ▼  (HTTP GET packet sent over network/localhost)
[ 3. Server Route Middleware: vite.config.ts ]
  - Intercepts path: '/api/training/energy'
  - Extracts search params: region="WR", date="2026-10-14"
  - Validates:
      If region is missing ───► Return status 400 + { success: false, error: "BAD_REQUEST" }
      If region is unknown ───► Return status 404 + { success: false, error: "NOT_FOUND" }
      If region is valid   ───► Return status 200 + { success: true, data: { ... } }
  - Sets Response Headers:
      Content-Type: application/json
      X-Training-API: Task-05
      X-Response-Time-Ms: 12
         │
         ▼  (HTTP Response packet sent back)
[ 4. Client Promise Resolution ]
  - Reads res.status (200)
  - Reads res.headers (Content-Type, X-Training-API)
  - Deserializes res.json() into typed TypeScript object
         │
         ▼
[ 5. React State Update in Task5View.tsx ]
  setApiResult(result)  ──►  Updates ApiInspectorPanel (Status pill, Headers, JSON)
  setActiveData(data)   ──►  Updates Task 3 EnergySummaryCard (Capacity, Forecast, Nodes)
```

---

## 4. Component Walkthrough & Code Details

### 1. `types.ts`
Defines strict discriminating union types:
```typescript
export interface EnergyApiSuccessResponse {
  success: true;
  data: RegionalEnergyTelemetry;
  meta: { responseTimeMs: number; apiVersion: string; server: string; };
}

export interface EnergyApiErrorResponse {
  success: false;
  error: { code: string; message: string; details?: string; };
}

export type EnergyApiResponse = EnergyApiSuccessResponse | EnergyApiErrorResponse;
```
Because `success` is typed as `true` vs `false`, TypeScript automatically narrows the data shape when checking `if (result.success)`.

### 2. `apiService.ts`
The client-side API client:
- Invokes native `fetch()`.
- Captures round-trip execution latency (`performance.now()`).
- Normalizes response headers into a clean `Record<string, string>`.
- Returns an `ApiExecutionResult` containing status, statusText, headers, parsed data, and raw JSON text.

### 3. `ApiInspectorPanel.tsx`
A visual debugging panel designed for evaluators and engineers:
- **Status Pill:** Dynamically colored (Green `#10b981` for 200, Red `#ef4444` for 400, Amber `#f59e0b` for 404).
- **Target Line:** Shows the exact HTTP Verb and URL.
- **Headers Box:** Displays all HTTP response headers formatted in Consolas monospace.
- **JSON Box:** Formatted JSON payload with syntax color-coding.

### 4. `Task5View.tsx`
The full-stack coordinator:
- Integrates Task 4 `FilterControls` for interactive input.
- Adds 3 instant testing buttons (`Call API 200 OK`, `Test 400 Error`, `Test 404 Error`).
- Renders the `ApiInspectorPanel`.
- Feeds live payload data into **3 Task 03 `EnergySummaryCard` components**:
  - `📍 Regional Capacity`: Displays `activeData.installedCapacityMW` MW with ISTS/Region badge and revision metadata.
  - `⚡ Current Forecast`: Displays `activeData.currentForecastMW` MW with date badge and model metadata.
  - `📈 Telemetry Substations`: Displays `activeData.substationsCount` Nodes with grid link status.

---

## 5. Verification with `curl` / Terminal Commands

Evaluators can verify the route handler outside the browser using `curl`:

### Case 1: 200 OK
```bash
curl -i "http://localhost:3000/api/training/energy?region=WR&date=2026-10-14"
```
**HTTP Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json
X-Training-API: Task-05
X-Response-Time-Ms: 12

{
  "success": true,
  "data": {
    "regionId": "WR",
    "regionName": "Western Region (WR)",
    "regionCode": "GRID-WR",
    "installedCapacityMW": 26655.2,
    "currentForecastMW": 18450,
    "substationsCount": 138,
    "gridStatus": "NORMAL",
    "revision": "Rev 04",
    "queriedDate": "2026-10-14"
  }
}
```

### Case 2: Intentional 400 Bad Request
```bash
curl -i "http://localhost:3000/api/training/energy"
```
**HTTP Response:**
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json
X-Status-Reason: Parameter-Missing

{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Missing required query parameter \"region\"."
  }
}
```

### Case 3: Intentional 404 Not Found
```bash
curl -i "http://localhost:3000/api/training/energy?region=UNKNOWN"
```
**HTTP Response:**
```http
HTTP/1.1 404 Not Found
Content-Type: application/json
X-Status-Reason: Entity-Not-Found

{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Region \"UNKNOWN\" not recognized."
  }
}
```

---

## 6. How to Run & Test

1. **Terminal Command:**
   ```powershell
   cd "c:\IIT\Tasks\Day 1\Task 3"
   npm run dev
   ```
2. Open `http://localhost:3000` and click the **"Task 05: First API & Inspector"** tab.
3. Click **Call API (200 OK)** $\rightarrow$ Status turns green, JSON body shows telemetry, cards populate.
4. Click **Test 400 Error** $\rightarrow$ Status turns red, JSON shows `BAD_REQUEST`, cards enter error fallback state.
5. Click **Test 404 Error** $\rightarrow$ Status turns amber, JSON shows `NOT_FOUND`.

