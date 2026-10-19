# Task 04: Mock Regions, Users Directory, and View-Only Settings

**Module:** 3 — Login/session concepts and admin-facing UI  
**Sprint/Day:** Week 1, Day 03  
**Task:** 04 — Build a mock regions/users view  
**Status:** Completed  
**Deliverable Path:** `reports/week-1/day-03/task-04-regions-and-users.md`  
**Implemented Components:**  
- `src/components/admin/AdminUsersView.tsx`  
- `src/components/admin/AdminRegionsView.tsx`  
(Integrated into `src/views/AdminShellView.tsx`)

---

## 1. Executive Summary

This task builds the administrative views for **User Directory & RBAC Security Clearance** and **Regional Control Areas (State SLDCs & ISTS Pooling Sub-stations)**, along with a view-only mock of global **Feature Flags and System Maintenance Settings**.

To maintain architectural rigor, this report explicitly maps each mock view to its corresponding production page and V2 API route in the GI-IITB repository (`D:\grid-iitb`), while documenting why mock user-interface representations **do not** enforce security boundaries.

---

## 2. Production Source Route & API Mapping

| View / Feature | Matching Production Page (Frontend) | Matching Production V2 API Route (Backend) | Purpose & Data Scope |
|---|---|---|---|
| **Users Directory** | `src/app/admin/users/page.tsx` (`/admin/users`) | `src/app/api/admin/users/route.ts` (`/api/admin/users`) | User account credentials, RBAC roles (`super_admin`, `admin`, `region_admin`, `state_admin`, `viewer`), and territorial assignment. |
| **Regions & Grids** | `src/app/admin/regions/page.tsx` (`/admin/regions`) | `src/app/api/admin/regions/route.ts` (`/api/admin/regions` & `/api/v2/regions`) | State SLDC jurisdiction boundaries, ISTS inter-state pooling nodes, and installed megawatt capacities. |
| **Feature Flags** | `src/app/admin/features/page.tsx` (`/admin/features`) | `src/app/api/admin/features/route.ts` | Toggles for sub-second telemetry, 96-block day-ahead scheduling, and experimental grid batteries. |
| **Maintenance Mode** | `src/app/admin/page.tsx` (Global banner) | `src/app/api/admin/system/route.ts` | Global emergency switch locking external ingress and public portal endpoints. |

---

## 3. Implementation of Mock User Directory (`AdminUsersView.tsx`)

### Data Fixture:
The user directory utilizes a typed fixture (`INITIAL_USERS`) capturing real operational roles:
1. `superadmin` — National Despatch Lead (`super_admin`, All Regions)
2. `wr_admin` — Western Region Chief (`region_admin`, Western Region)
3. `gujarat_operator` — Gujarat SLDC Operator (`state_admin`, Gujarat)
4. `mh_operator` — Maharashtra SLDC Operator (`state_admin`, Maharashtra)
5. `analyst_guest` — IIT Bombay RE Researcher (`viewer`, View Only)

### Visual Role Distinctions:
Roles are color-coded with semantic contrast:
- `SUPER ADMIN`: Amber badge (`#f59e0b`)
- `REGION ADMIN`: Sky Blue badge (`#38bdf8`)
- `STATE ADMIN`: Emerald badge (`#10b981`)
- `ADMIN`: Violet badge (`#8b5cf6`)
- `VIEWER`: Muted Slate badge (`#94a3b8`)

### State Simulator:
Includes on-screen toggle buttons allowing the examiner to simulate `normal`, `loading` (spinner), `empty` (zero state), and `error` (network timeout) views.

---

## 4. Implementation of Mock Regions & Grids (`AdminRegionsView.tsx`)

### Regional Fixtures:
Features both State SLDC areas and Inter-State Transmission Systems (ISTS):
- **State Control Areas:** Gujarat SLDC (420 plants, 18,450 MW), Maharashtra SLDC (385 plants, 16,200 MW), Madhya Pradesh SLDC (290 plants, 11,800 MW), Rajasthan SLDC (310 plants, 22,100 MW), Tamil Nadu SLDC (215 plants, 14,500 MW), Karnataka SLDC (148 plants, 9,800 MW).
- **ISTS Pooling Substations:** Western ISTS Grid Pooling (45 plants, 8,500 MW), Northern ISTS Transmission Pool (32 plants, 6,200 MW, Status: `MAINTENANCE`).

### Category Filtering Tabs:
Supports rapid switching between:
- `All Jurisdictions`
- `State SLDC Nodes`
- `ISTS Pooling Substations`

---

## 5. View-Only Mock Feature & Maintenance Settings

In compliance with syllabus requirements, feature switches are displayed with clear visual indicators that they are **view-only mock representations**:
- **Feature Grid:** Displays 6 core grid flags (Realtime Dispatch Telemetry, Automated Day-Ahead Scheduling, Grid Frequency Alerts, Extreme Weather Forecasting Engine, BESS Battery Degradation Telemetry, and Cross-Border Interconnection Trade).
- **Non-Mutating Sandbox Banner:** Explicit label reading `View-Only Sandbox · Non-mutating`.
- **Maintenance Simulation:** A toggle button simulates what the dashboard looks like when a maintenance window is active, accompanied by an explanatory banner:
  > *"⚠️ Simulated Maintenance Window: Telemetry ingestion and public portal APIs are locked. (Mock UI state only — no live server change)."*

---

## 6. Critical Security Note: UI Mock vs. Actual Enforcement

> [!WARNING]
> **Client-Side Rendering Does NOT Enforce Security Permissions**
> 
> The UI components created in this module (`AdminUsersView`, `AdminRegionsView`, and role dropdowns) are purely presentation layers running inside the client browser's JavaScript environment.
>
> 1. **No Authorization Authority:** Displaying an operator badge labeled `SUPER ADMIN` or rendering a hidden admin button in React does **not** grant authorization. Any malicious client could tamper with React props, flip client state, or issue raw HTTP `curl` requests directly to backend endpoints.
> 2. **Where Real Enforcement Happens:** True security enforcement occurs exclusively on the backend server:
>    - In `src/proxy.ts` (Edge middleware validating the `token` cookie signature via HMAC-SHA256).
>    - In route handlers (`src/app/api/admin/*`) calling `authenticateToken(request)` and verifying `payload.role === 'super_admin'`.
> 3. **Defense in Depth:** The client UI only hides controls for user convenience (reducing visual clutter); the server rejects unauthorized requests with `401 Unauthorized` or `403 Forbidden` regardless of client state.

---

## 7. Verification and Build Status

- **Components:** `src/components/admin/AdminUsersView.tsx` and `src/components/admin/AdminRegionsView.tsx`
- **Shell View:** `src/views/AdminShellView.tsx`
- **TypeScript Check:** Strict typing satisfied; no type errors.
- **Production Build:** Passes cleanly (`tsc && vite build` code 0).

