# Day 4 · Task 1: Inventory of Useful V2 HTTP Endpoints

**Platform:** GRID-INDIA IITB (GI-IITB) Renewable Energy Forecasting Platform  
**Report Date:** 2026-10-19  
**Source Code Base:** Production V2 Architecture (`D:\grid-iitb`)  
**Deliverable Target:** `reports/week-1/day-04/task-01-api-inventory.md`

---

## 1. Executive Summary

This inventory documents the HTTP API endpoints implemented in the GRID-IITB V2 platform. Rather than guessing access privileges, route authentication rules were determined by inspecting:
1. The **edge proxy middleware** (`src/proxy.ts`), which defines the `PUBLIC_ROUTES` whitelist and enforces JWT authentication for all other `/api/*` routes.
2. The **identity helper** (`src/lib/getUser.ts`), which extracts and cryptographically verifies the token from the `Authorization: Bearer <token>` header or the `token` HttpOnly cookie.
3. The **role authorization guards** (`src/lib/roles.ts` and route-specific handlers), which enforce RBAC hierarchy (`super_admin` > `admin` > `region_admin` > `state_admin` / `viewer`).

---

## 2. API Endpoints Inventory Table

| # | HTTP Method | Route Path | Purpose & Grid Functionality | Auth Expectation | Source Route File |
| :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `GET` | `/api/health` | Probes database health via `SELECT 1`. Returns system timestamp and degraded status if DB is restarting. | **Public** (Whitelisted in `proxy.ts`) | `src/app/api/health/route.ts` |
| **2** | `GET` | `/api/status` | Inquires whether global maintenance mode is active. Client uses this for non-authenticated pre-flight gating. | **Public** (Whitelisted in `proxy.ts`) | `src/app/api/status/route.ts` |
| **3** | `POST` | `/api/auth` | Authenticates operator username/password with bcrypt, computes territorial permissions (`allowedRegionIds`), signs JWT, and sets `token` HttpOnly cookie. | **Public** (Whitelisted in `proxy.ts`) | `src/app/api/auth/route.ts` |
| **4** | `POST` | `/api/auth/logout` | Terminates active operator session by invalidating and expiring the `token` cookie. | **Public / Session** | `src/app/api/auth/logout/route.ts` |
| **5** | `GET` | `/api/regions` | Returns control areas (States, ISTS, and Pooling Stations) filtered by caller's territorial scope. | **Authenticated** (JWT / Cookie required) | `src/app/api/regions/route.ts` |
| **6** | `GET` | `/api/plants` | Returns renewable energy generation plants (Solar, Wind, Hybrid) belonging to the caller's authorized regions. | **Authenticated** (JWT / Cookie required) | `src/app/api/plants/route.ts` |
| **7** | `GET` | `/api/series` | Returns 96-block time series forecast (GHI irradiance, solar power, wind power) alongside real SCADA actuals. | **Authenticated** (`getAuthUser(req)`) | `src/app/api/series/route.ts` |
| **8** | `GET` | `/api/actuals` | Fetches raw 15-minute telemetry actuals ingested from SLDC SCADA and plant RTUs. | **Authenticated** (`getAuthUser(req)`) | `src/app/api/actuals/route.ts` |
| **9** | `GET` | `/api/aggregated` | Computes hierarchical forecast aggregation across sub-stations, control areas, and regional grids. | **Authenticated** (`getAuthUser(req)`) | `src/app/api/aggregated/route.ts` |
| **10** | `GET` | `/api/admin/live-actuals` | Telemetry coverage telemetry: tracks block counts (0–96), packet loss, latency, and telemetry gaps across all plants. | **Admin Role** (`super_admin`, `admin`, `region_admin`) | `src/app/api/admin/live-actuals/route.ts` |
| **11** | `GET` | `/api/admin/users` | Lists user accounts and territorial state delegations based on caller's management hierarchy. | **Admin Role** (`canManageUsers`) | `src/app/api/admin/users/route.ts` |
| **12** | `POST` | `/api/admin/users` | Provisions a new user account with hashed credentials and assigned state checkboxes. | **Admin Role** (`canManageUsers` + role hierarchy) | `src/app/api/admin/users/route.ts` |
| **13** | `GET` | `/api/admin/features` | Returns the state of all 10 pipeline feature flags (Nowcasting, Radiative Models, SCADA Alerting, etc.). | **Public Read** (`proxy.ts`) | `src/app/api/admin/features/route.ts` |
| **14** | `POST` | `/api/admin/settings` | Updates critical system settings such as activating or deactivating Maintenance Mode. | **Super Admin Only** (`role === "super_admin"`) | `src/app/api/admin/settings/route.ts` |

---

## 3. Code-Level Authentication Derivation

### A. Edge Proxy Whitelist Verification (`src/proxy.ts`)

In `src/proxy.ts`, the middleware intercepts every incoming request before it reaches Next.js route handlers:

```typescript
// Explicit whitelist from src/proxy.ts
const PUBLIC_ROUTES = [
  "/login",
  "/maintenance",
  "/api/health",
  "/api/auth",
  "/api/admin/seed",
  "/api/admin/features",
  "/api/status",
  "/_next",
  ...
]

if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
  return addCors(NextResponse.next(), origin)
}
```

* **Finding:** Any endpoint starting with `/api/health`, `/api/auth`, `/api/status`, or `/api/admin/features` is processed without requiring an `Authorization` header or session cookie.
* **All other endpoints** fall through to the JWT verification block:
  ```typescript
  const token = extractBearer(req.headers.get("authorization")) ?? req.cookies.get(COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  ```

### B. Admin RBAC Gate Verification

For administrative endpoints, `src/proxy.ts` and `src/lib/roles.ts` enforce an additional privilege layer:

```typescript
if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
  const adminRoles = ["super_admin", "admin", "region_admin"]
  if (!adminRoles.includes(payload.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
}
```

Furthermore, in `src/app/api/admin/settings/route.ts`:
```typescript
if (caller.role !== "super_admin") {
  return forbidden() // Returns 403 Forbidden
}
```

---

## 4. Key Takeaways for API Consumers

1. **Dual Transport Authentication:** Protected routes accept either a standard `Authorization: Bearer <jwt>` HTTP header or an `HttpOnly` cookie named `token`. This allows both browser web clients and automated tools (e.g., Postman, cron jobs) to securely query the API.
2. **Context-Aware Scoping:** Endpoints such as `/api/regions` and `/api/plants` do not take an arbitrary `user_id` query param. The server securely extracts identity from the verified cryptographic token and dynamically restricts the database query to `user.allowedRegionIds`.
3. **Structured Response Contracts:** All responses follow standardized envelope structures:
   - Success: `{ "data": ... }` or `{ "ok": true }`
   - Failure: `{ "error": "Descriptive message" }` with standard HTTP error codes (`400`, `401`, `403`, `404`, `500`).
