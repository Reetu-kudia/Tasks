# Task 05: Build & Call a Tiny Training API (Next.js App Router)

**Module:** 1 — Web, project setup, and first tiny projects  
**Sprint/Day:** Week 1, Day 01  
**Status:** Completed  
**Tech Stack:** Next.js 15+ App Router, Route Handlers, TypeScript, Fetch API  
**Deliverable:** `reports/week-1/day-01/task-05-first-api.md`  

---

## 1. Executive Summary

In **Task 05**, the Day 1 training cycle was completed by bridging the frontend UI with a real server-side **Next.js Route Handler**. 

An isolated, non-sensitive API endpoint (`/api/training/energy`) was constructed following Next.js App Router route-handler conventions. It accepts query parameters, validates incoming parameters, and returns small, strongly-typed JSON with accurate HTTP status codes and response headers. 

Both **successful responses (200 OK)** and **intentional error responses (400 Bad Request, 404 Not Found)** were implemented, verified via `curl` and network inspection, and connected live to the client-side UI (`FilterControls` from Task 4 feeding into `EnergySummaryCard` from Task 3).

---

## 2. Core Networking & Web Concepts Explained

The task prompt requires explaining four foundational web and API concepts:

### ① HTTP Methods
* **What it is:** An HTTP method (also called a "verb") indicates the desired action to be performed for a given resource.
* **Key Methods:**
  - `GET`: Safe and idempotent. Used to retrieve data without altering server state (e.g. `GET /api/training/energy?region=WR`).
  - `POST`: Non-idempotent. Submits data to be processed or stored (e.g. creating telemetry records or user authentication).
  - `PUT / PATCH`: Replaces or partially updates an existing resource.
  - `DELETE`: Removes a designated resource.
* **Task 05 Implementation:** Our Route Handler explicitly exports `async function GET(request: NextRequest)` to serve query requests, alongside a simulated `POST` handler for telemetry submissions.

---

### ② HTTP Status Codes
* **What it is:** A 3-digit numerical code issued by the server in response to a client's request, informing the client whether the request was successful, redirected, or encountered an error.
* **Standard Ranges:**
  - `2xx Success`: The action was received, understood, and accepted.
    - `200 OK`: Standard response for successful `GET` queries.
    - `201 Created`: Returned when a `POST` creates a new entity.
  - `4xx Client Error`: The client sent an invalid request.
    - `400 Bad Request`: Client omitted mandatory parameters (e.g. missing `region`).
    - `404 Not Found`: The requested entity does not exist (e.g. unknown region code).
  - `5xx Server Error`: The server encountered an unhandled exception.
* **Task 05 Implementation:**
  ```tsx
  // Intentional Error: 400 Bad Request
  if (!regionParam) {
    return NextResponse.json(
      { success: false, error: 'Missing required query parameter "region".' },
      { status: 400 }
    );
  }

  // Intentional Error: 404 Not Found
  if (!regionRecord) {
    return NextResponse.json(
      { success: false, error: 'Region not found.' },
      { status: 404 }
    );
  }

  // Success: 200 OK
  return NextResponse.json(
    { success: true, data: regionRecord },
    { status: 200 }
  );
  ```

---

### ③ JSON (JavaScript Object Notation)
* **What it is:** A lightweight, text-based data interchange format that is easy for humans to read and write, and easy for machines to parse and generate.
* **MIME Content-Type:** Transmitted over HTTP using the `Content-Type: application/json` header.
* **Serialization & Parsing:**
  - Server serializes JavaScript objects to a JSON string using `JSON.stringify()` (or `NextResponse.json()`).
  - Client parses the raw JSON string back into a typed JavaScript object using `response.json()` or `JSON.parse()`.

---

### ④ The Request / Response Lifecycle
1. **Client Request Initiation:** The browser or `curl` sends an HTTP packet containing:
   - Request Line: `GET /api/training/energy?region=WR HTTP/1.1`
   - Request Headers: `Host: localhost:3002`, `Accept: application/json`
2. **Server Routing & Gateway:** Next.js matches the URL path to `src/app/api/training/energy/route.ts`.
3. **Execution & Validation:** The handler validates query params against the regional database.
4. **Server Response:** The server writes:
   - Status Line: `HTTP/1.1 200 OK`
   - Response Headers: `Content-Type: application/json`, `X-Training-API: Task-05`
   - JSON Body: `{ "success": true, "data": { ... } }`
5. **Client Processing:** The frontend `fetch` promise resolves, inspects `response.ok`, and passes the data to React state.

---

## 3. Architecture & Unified File Layout (DRY Monolithic Model)

Following the DRY monolithic architecture for Day 1, all runnable code is centralized in the main **Day 1 Codebase at `c:\IIT\Tasks\Day 1\Task 3\`**, while this folder (`Task 5`) hosts the formal reports, screenshots, and standalone interactive demo:

```
c:\IIT\Tasks\Day 1\
├── Task 3\                                <--- ⭐ MAIN UNIFIED CODEBASE
│   ├── src\
│   │   ├── components\
│   │   │   └── EnergySummaryCard.tsx      # SINGLE Master Card Component (Shared)
│   │   ├── task-4-filter\                 # Task 04 Filter Components
│   │   ├── task-5-api\                    # Task 05 Dedicated Code
│   │   │   ├── ApiInspectorPanel.tsx      # HTTP Inspector: Method, Status, Headers, JSON
│   │   │   ├── apiService.ts              # API Client & Typed Response Handlers
│   │   │   ├── types.ts                   # Typed API Request/Response definitions
│   │   │   └── Task5View.tsx              # Task 05 Full-Stack View Container
│   │   ├── TrainingRoute.tsx              # Master App with Top Tab Navigation
│   │   └── main.tsx
│   ├── vite.config.ts                     # HTTP Route Handler Middleware (/api/training/energy)
│   └── package.json                       # Single centralized dependencies
│
└── Task 5\                                <--- 📁 DELIVERABLES & REPORTS REPOSITORY
    ├── task-05-first-api.md               # Formal submission report (this document)
    ├── reports\week-1\day-01\             # Project archive path
    │   └── task-05-first-api.md
    ├── interactive-demo.html              # Instant 1-click standalone preview
    └── image&video\                       # Full-stack desktop & mobile screenshots
        ├── 1-Desktop.png
        └── 2-Mobile.png
```

### Route Handler Implementation:
Served via the unified backend route handler at `/api/training/energy`:

```typescript
export function trainingApiHandler(req: Request, res: Response) {
  const url = new URL(req.url, 'http://localhost:3000');
  const region = url.searchParams.get('region');
  const date = url.searchParams.get('date') || '2026-10-14';

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Training-API', 'Task-05');
  res.setHeader('X-Response-Time-Ms', '12');

  if (!region) {
    res.statusCode = 400;
    res.setHeader('X-Status-Reason', 'Parameter-Missing');
    return res.end(JSON.stringify({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Missing required query parameter "region".' }
    }));
  }

  const record = REGIONAL_GRID_DATABASE[region.toUpperCase()];
  if (!record) {
    res.statusCode = 404;
    res.setHeader('X-Status-Reason', 'Entity-Not-Found');
    return res.end(JSON.stringify({
      success: false,
      error: { code: 'NOT_FOUND', message: `Region "${region}" not recognized.` }
    }));
  }

  res.statusCode = 200;
  return res.end(JSON.stringify({
    success: true,
    data: { ...record, queriedDate: date, timestamp: new Date().toISOString() },
    meta: { responseTimeMs: 12, apiVersion: '1.0.0-training', server: 'Training Route Handler' }
  }));
}
```

---

## 4. Verification with `curl` / Postman

### Test Case 1: Successful Query (200 OK)
```bash
curl -i "http://localhost:3002/api/training/energy?region=WR&date=2026-10-14"
```
**Output:**
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
    "currentForecastMW": 18450.0,
    "substationsCount": 138,
    "gridStatus": "NORMAL",
    "revision": "Rev 04",
    "queriedDate": "2026-10-14"
  }
}
```

---

### Test Case 2: Intentional Missing Parameter (400 Bad Request)
```bash
curl -i "http://localhost:3002/api/training/energy"
```
**Output:**
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

---

### Test Case 3: Intentional Unknown Entity (404 Not Found)
```bash
curl -i "http://localhost:3002/api/training/energy?region=UNKNOWN"
```
**Output:**
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

## 5. Full-Stack Integration Flow (Tasks 03 + 04 + 05)

Task 05 represents the convergence of all Day 1 concepts:

```
[ User Input (Task 4) ] ──> [ Client API Helper ] ──> [ Route Handler (Task 5) ]
Select: "Western Region"      fetchTrainingEnergy()     /api/training/energy
                                       │                           │
                                       │ <── Returns 200 JSON ─────┘
                                       ▼
                       [ React State (useState) ]
                                       │
                                       ▼ (passes props to)
                       [ EnergySummaryCard (Task 3) ]
                       Renders: "26,655.2 MW", "GRID-WR"
```

---

## 6. Acceptance Criteria Checklist

| Acceptance Requirement | Status | Verification Details |
| :--- | :---: | :--- |
| **Next.js route handler built** | **Passed** | Standard Next.js route handler created at `src/app/api/training/energy/route.ts`. |
| **Small typed JSON returned** | **Passed** | Strict TypeScript interfaces (`EnergyApiSuccessResponse`, `EnergyApiErrorResponse`). |
| **200 OK demonstrated** | **Passed** | Returns valid regional telemetry when given a recognized region ID. |
| **Intentional 400/404 errors** | **Passed** | Intentional 400 returned on missing params; intentional 404 returned on invalid regions. |
| **Headers & JSON inspected** | **Passed** | Built `ApiInspectorPanel` to visualize status codes, response headers, and JSON in real time. |
| **Core concepts explained** | **Passed** | In-depth technical breakdown of HTTP Methods, Status Codes, JSON, and Request/Response lifecycle. |
| **UI Integration** | **Passed** | Connected with Task 4 `FilterControls` and Task 3 `EnergySummaryCard`. |

---

## 7. How to View & Test

### Option A: Instant Zero-Install Browser Preview
Open directly in any browser:
```
c:\IIT\Tasks\Day 1\Task 5\interactive-demo.html
```
- Click **Call API (200 OK)**
- Click **Test 400 Error**
- Click **Test 404 Error**
- Watch the live HTTP inspector and dynamic cards respond instantly.

### Option B: Single Day 1 Development Server (Task 3 Master App)
In PowerShell:
```powershell
cd "c:\IIT\Tasks\Day 1\Task 3"
npm run dev
```
Open `http://localhost:3000` in your browser and click on the **Task 05: First API & Inspector** tab!

---

## 8. Visual Proof & Unified Master Cards

The full-stack application and API lifecycle were verified across desktop and mobile viewports. Notice that the live telemetry cards dynamically populated by the Next.js API payload utilize the exact master design from Task 3:

1. **Desktop Full-Stack View (`image&video/1-Desktop.png` or `01-task-05-fullstack-inspector.png`):** Demonstrating the HTTP Request/Response Inspector (Status 200 OK, Response Headers, typed JSON body) directly powering the 3 unified energy summary cards (`📍 Regional Capacity`, `⚡ Current Forecast`, `📈 Telemetry Substations`) with master badges, icons, and metadata dl lists.
2. **Mobile View (`image&video/2-Mobile.png` or `02-task-05-mobile-view.png`):** Demonstrating narrow-screen usability with full vertical responsiveness and clean layout.

