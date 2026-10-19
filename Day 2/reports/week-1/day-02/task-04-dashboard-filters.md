# Task 04: Recreate Dashboard Filters and KPI Cards

**Module:** 2 — Recreate the portal's frontend foundation  
**Sprint/Day:** Week 1, Day 02  
**Task:** 04 — Recreate dashboard filters and KPI cards  
**Status:** Completed  
**Deliverable Path:** `reports/week-1/day-02/task-04-dashboard-filters.md`  

---

## 1. Executive Summary & Objective

The objective of **Task 04** is to reconstruct the **Forecast Controls Panel** and **Active Selection Summary KPI Cards** (View B) of the GRID-INDIA IIT Bombay (GI-IITB) portal using clearly labeled, client-side sample values.

Key architectural highlights:
1. **Interactive Control Group (8 Parameters):**
   - Generation Type (`Solar`, `Wind`, `Hydro`)
   - Grid Region (`All Grids`, `Western Region`, `Southern Region`, `Northern Region`, `Eastern Region`)
   - Category (`State`, `ISTS`)
   - State (`Maharashtra`, `Madhya Pradesh`, `Gujarat`, `Rajasthan`, `Tamil Nadu`, `All States`)
   - Plant (`All Plants`, `220_33KV_BAKTAPUR`, `400KV_NAGDA`, etc.)
   - Forecasting Type (`Nowcasting`, `Intra`, `Medium`)
   - Run Date picker (`YYYY-MM-DD`)
   - Revision (`Latest`, `R0`, `R1`, `R2`)
2. **Dynamic State-Driven Sample Summary:**
   - User selections in the filters dynamically recalculate and update the sample KPI metrics in real time upon clicking **"Apply to Dashboard"**.
   - Clear visual feedback with an *"Unsaved Changes"* / *"✓ Applied"* badge.
3. **Strict Compliance & Labeling:**
   - Every metric displays explicit units (`MW`, `W/m²`, `%`).
   - Clearly labeled disclaimer: *"Illustrative training layout; selections use mock data. No live API or actual forecast data implied."*

---

## 2. Acceptance Criteria & Verification Matrix

| Acceptance Criteria | Requirement Specification | Implementation Details | Status |
| :--- | :--- | :--- | :--- |
| **Fake, Clearly Labeled Sample Values** | Date, region, and generation-type controls using sample values. | 8 controls implemented in `ForecastFilters.tsx` with unambiguous labels and default training values. | ✅ PASSED |
| **Selection State Drives Summary** | Filter state directly drives displayed sample results. | `KPICards.tsx` computes Installed Capacity, GHI peak, and 4-block time-slot forecasts ($T..T+3$) based on selected Region and Generation Type. | ✅ PASSED |
| **Units Shown Universally** | All metric values accompanied by standard engineering units. | Megawatts (`MW`), Irradiance (`W/m²`), Percentages (`%`), and Timestamps (`HH:MM`) rendered on all cards. | ✅ PASSED |
| **No Live API Implied** | Clear disclaimers that values are illustrative mock data. | Explicit disclaimers positioned in both the controls panel header and summary card headers. | ✅ PASSED |
| **Apply & Reset Actions** | Independent buffer and apply workflow. | Separate `filters` buffer and `appliedFilters` state; changes only propagate to KPIs when "Apply to Dashboard" is clicked. "Reset" restores defaults. | ✅ PASSED |

---

## 3. Component Architecture & Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DashboardShellView.tsx                          │
├───────────────────────────────────┬────────────────────────────────────┤
│      <ForecastFilters />          │           <KPICards />             │
│                                   │                                    │
│  [Generation Type: Solar/Wind]    │  [Active Selection Summary]        │
│  [Grid Region: Western/All]       │  • Solar • Western • Maharashtra   │
│  [State: Maharashtra]             │                                    │
│  [Plant: All / Specific]          │  [Upcoming 15-min Forecast Blocks] │
│  [Forecast Type: Nowcast/Intra]   │  • T   (08:30) -> 8,250.7 MW       │
│  [Run Date: 2026-10-17]           │  • T+1 (08:45) -> 8,310.2 MW       │
│  [Revision: Latest]               │  • T+2 (09:00) -> 8,495.0 MW       │
│                                   │  • T+3 (09:15) -> 8,620.4 MW       │
│  ┌─────────────┐ ┌──────────────┐ │                                    │
│  │ Reset       │ │ Apply        │ │  [Summary Metric KPI Row]          │
│  └─────────────┘ └──────────────┘ │  • Installed Capacity: 11,994.8 MW │
│                                   │  • Peak Irradiance: 945.8 W/m²     │
│                                   │  • Model MAPE Error: 4.18 %        │
│                                   │  • Active Telemetry: 244/248 Plants│
└───────────────────────────────────┴────────────────────────────────────┘
```

### Dynamic Mock Calculation Model:
When user changes the generation type or region:
* **Solar:** Diurnal bell-shaped power profile, Installed capacity based on regional scaling (e.g. All Grids = 26,655.2 MW, Western = 11,994.8 MW).
* **Wind:** Flat/seasonal baseline output, Installed capacity scales to 14,280.5 MW, GHI irradiance is disabled/marked `N/A`.
* **Individual Plant:** Capacity snaps to 278.0 MW (e.g., 220_33KV_BAKTAPUR) and telemetry status updates to `1 / 1 Active`.

---

## 4. Deliverable Files

| File | Path | Role |
| :--- | :--- | :--- |
| **Filter Component** | `src/components/ForecastFilters.tsx` | 8-parameter filter controls with Apply/Reset logic. |
| **KPI Component** | `src/components/KPICards.tsx` | Selection summary chips, 4-block upcoming forecast cards, and 4 metric KPI tiles. |
| **Dashboard Shell** | `src/views/DashboardShellView.tsx` | Parent container wiring filter state to KPI presentation. |
| **Deliverable Report** | `reports/week-1/day-02/task-04-dashboard-filters.md` | Official compliance report. |
| **Root Copy** | `task-04-dashboard-filters.md` | Quick access copy. |

---

## 5. How to Verify

1. Run `npm run dev` or open `interactive-demo.html` in browser.
2. Ensure you are on the **Forecast Dashboard** tab.
3. In the **FORECAST CONTROLS & FILTERS** panel:
   - Change **Generation Type** from `Solar` to `Wind`. Notice the badge changes to *"● Unsaved Changes"*.
   - Click **"Apply to Dashboard"**.
   - Observe the **Active Selection Summary** update immediately:
     - Installed Capacity adjusts to `14,280.5 MW`.
     - Peak GHI switches to `N/A` (since wind does not use solar irradiance).
     - Upcoming block values ($T..T+3$) dynamically recalculate.
4. Select a specific plant (e.g., `220_33KV_BAKTAPUR`) and click **Apply**:
   - Telemetry status changes from `244 / 248 Active` to `1 / 1 Active`.
   - Capacity changes to `278.0 MW`.
5. Click **"Reset"** to return all controls and KPIs to default state.

