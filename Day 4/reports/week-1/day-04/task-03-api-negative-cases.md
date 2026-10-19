# Day 4 · Task 3: API Negative Testing & Failure Behavior Analysis

**Platform:** GRID-INDIA IITB (GI-IITB) Renewable Energy Forecasting Platform  
**Report Date:** 2026-10-19  
**Deliverable Target:** `reports/week-1/day-04/task-03-api-negative-cases.md`

---

## 1. Objectives & Testing Principles

A resilient power-grid software system must fail predictably and gracefully. When unexpected, malformed, or malicious requests strike the HTTP layer, the server must:
1. Reject invalid payloads before database querying or calculation cycles take place.
2. Return standard HTTP status codes (`400`, `401`, `403`, `404`) rather than unhandled exceptions (`500`) or hanging connections.
3. Provide sanitised, machine-readable error bodies without exposing internal stack traces, database schema details, or system paths.
4. Allow the client-side user interface to communicate the issue clearly to the operator.

---

## 2. Test Case Matrix

| Case ID | Test Scenario | HTTP Method & Path | Auth State | Expected HTTP Status | Expected Response Shape | UI Presentation Strategy |
| :---: | :--- | :--- | :---: | :---: | :--- | :--- |
| **TC-01** | **Allowed Read (Success)** | `GET /api/health` | Public | `200 OK` | `{"ok": true, "ts": "..."}` | Live telemetry pulse indicator glows green; system status reads "Connected". |
| **TC-02** | **Missing Mandatory Payload** | `POST /api/auth` (empty body `{}`) | Public | `400 Bad Request` | `{"error": "username and password are required"}` | Form highlights both inputs with red border; displays inline message *"Username and password are required"*. |
| **TC-03** | **Malformed Query Parameters** | `GET /api/series?plant_id=p-1` (missing date & model) | Valid Auth | `400 Bad Request` | `{"error": "Provide either run_id OR (region_id + date + revision + model_name)"}` | Chart renders clean placeholder banner: *"Incomplete parameters: please select Run Date and Forecasting Model"*. |
| **TC-04** | **Unauthenticated Access** | `GET /api/regions` (no token/cookie) | Unauthenticated | `401 Unauthorized` | `{"error": "Unauthorized"}` | Displays toast notification: *"Session expired or credentials missing"*; automatically redirects operator to `/login`. |
| **TC-05** | **Insufficient Role Clearance** | `POST /api/admin/settings` (viewer calling super_admin route) | State Admin / Viewer Token | `403 Forbidden` | `{"error": "Forbidden"}` | Disables action buttons; displays warning modal: *"Super Admin clearance required to modify system settings"*. |

---

## 3. Deep Dive into Test Scenarios

### Test Case 1: Permitted Read (Success Baseline)
* **Request:**
  ```http
  GET /api/health HTTP/1.1
  Host: localhost:3000
  Accept: application/json
  ```
* **Response:**
  ```http
  HTTP/1.1 200 OK
  Content-Type: application/json

  {
    "ok": true,
    "ts": "2026-10-19T08:35:12.184Z"
  }
  ```
* **Client UI Presentation:**
  - The status badge in the header displays a solid green indicator: `● System Operational`.
  - Background polling timers continue normally on their 15-minute interval.

---

### Test Case 2: Missing Credentials on Auth (Failure - 400 Bad Request)
* **Request:**
  ```http
  POST /api/auth HTTP/1.1
  Host: localhost:3000
  Content-Type: application/json

  {
    "username": ""
  }
  ```
* **Response:**
  ```http
  HTTP/1.1 400 Bad Request
  Content-Type: application/json

  {
    "error": "username and password are required"
  }
  ```
* **Server-Side Validation Evidence (`src/app/api/auth/route.ts`):**
  ```typescript
  const schema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
  })
  const parsed = schema.safeParse(body)
  if (!parsed.success) return badRequest("username and password are required")
  ```
* **Client UI Presentation:**
  - Login button stops loading spinner and returns to interactive state.
  - An inline red alert appears above the inputs: `⚠️ username and password are required`.
  - Focus is automatically set back to the first invalid field.

---

### Test Case 3: Incomplete Multi-Parameter Query (Failure - 400 Bad Request)
* **Request:**
  ```http
  GET /api/series?plant_id=9877b077-96a8-4447-97d5-d014bc083cf4 HTTP/1.1
  Host: localhost:3000
  Authorization: Bearer <valid_token>
  ```
* **Response:**
  ```http
  HTTP/1.1 400 Bad Request
  Content-Type: application/json

  {
    "error": "Provide either run_id OR (region_id + date + revision + model_name)"
  }
  ```
* **Server-Side Validation Evidence (`src/app/api/series/route.ts`):**
  ```typescript
  const schema = z.object({
    plant_id: z.string().uuid(),
    run_id: z.string().uuid().optional(),
    region_id: z.string().uuid().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    revision: z.string().optional(),
    model_name: z.string().optional(),
  }).refine(
    (d) => d.run_id || (d.region_id && d.date && d.revision && d.model_name),
    { message: "Provide either run_id OR (region_id + date + revision + model_name)" }
  )
  ```
* **Client UI Presentation:**
  - Chart canvas does not crash or display broken SVG axes.
  - A friendly placeholder state appears: *"Please complete all required filter selections (Region, Date, Model, and Revision) to render predictions."*

---

### Test Case 4: Unauthenticated Access (Failure - 401 Unauthorized)
* **Request:**
  ```http
  GET /api/regions HTTP/1.1
  Host: localhost:3000
  ```
* **Response:**
  ```http
  HTTP/1.1 401 Unauthorized
  Content-Type: application/json

  {
    "error": "Unauthorized"
  }
  ```
* **Server-Side Edge Proxy Evidence (`src/proxy.ts`):**
  ```typescript
  const token = extractBearer(req.headers.get("authorization")) ?? req.cookies.get(COOKIE_NAME)?.value
  if (!token) {
    if (isApiRoute(pathname)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.redirect(new URL("/login", req.url))
  }
  ```
* **Client UI Presentation:**
  - The client HTTP interceptor intercepts the `401` response.
  - Clears any stale in-memory operator state.
  - Displays a toast: *"Your session has expired. Redirecting to login..."*.
  - Redirects the browser route to `/login`.

---

### Test Case 5: Role Hierarchy Violation (Failure - 403 Forbidden)
* **Request:**
  ```http
  POST /api/admin/users HTTP/1.1
  Host: localhost:3000
  Authorization: Bearer <state_admin_token>
  Content-Type: application/json

  {
    "uname": "new_superadmin",
    "password": "Password123!",
    "role": "super_admin"
  }
  ```
* **Response:**
  ```http
  HTTP/1.1 403 Forbidden
  Content-Type: application/json

  {
    "error": "Forbidden"
  }
  ```
* **Server-Side Authorization Evidence (`src/app/api/admin/users/route.ts`):**
  ```typescript
  const allowed = creatableRoles(caller.role)
  if (!allowed.includes(role)) {
    return forbidden() // A state_admin cannot create a super_admin!
  }
  ```
* **Client UI Presentation:**
  - Modal displays a red error notice: *"Security policy breach: You cannot create user roles with greater authority than your own clearance."*
  - Creation request is refused, leaving the existing user directory untouched.

---

## 4. Key Takeaways for Frontend Error Resilience

1. **Never Assume 200 OK:** Every `fetch` or `axios` call must explicitly inspect `response.ok` or catch HTTP status codes before attempting to access `response.data`.
2. **Handle Safe Error Bodies:** When the server returns `{ "error": "message" }`, the UI should display the exact message to the user rather than generic strings like *"Something went wrong"*.
3. **Prevent Infinite Redirect Loops:** Public routes (`/login`, `/api/health`) must never trigger 401 redirect cascades.

