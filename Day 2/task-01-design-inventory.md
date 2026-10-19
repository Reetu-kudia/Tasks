# Task 01: Comprehensive Design Inventory & UI System Audit

**Module:** 2 — Recreate the portal's frontend foundation  
**Sprint/Day:** Week 1, Day 02  
**Task:** 01 — Create a design inventory  
**Status:** Completed  
**Deliverable Path:** `reports/week-1/day-02/task-01-design-inventory.md`  

---

## 1. Executive Summary & Audit Scope

This document establishes the official **Design Inventory and UI System Audit** for the **GRID-INDIA IIT Bombay (GI-IITB) Experimental Forecasting Portal**. 

Based on high-resolution reference screenshots and recordings of the live production portal, this inventory catalogs every visual pattern, layout region, design token, typography rule, and interactive component across three primary views:
1. **View A — Login Page (Entry Screen)**
2. **View B — Main Forecasting Dashboard (Operational Hub)**
3. **View C — Admin Panel (System & Entity Management)**

Each pattern is evaluated across **Desktop Viewports (>1024px)** and **Mobile Viewports (375px - 640px)** to ensure full responsive recreation in Day 2 Tasks 02 through 05.

---

## 2. Core Color Palette & Design Tokens

The visual identity of the GI-IITB portal is a **dense, high-contrast dark theme** engineered for 24/7 mission-critical grid monitoring. It employs deep charcoal surfaces with vibrant, role-specific accent colors.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        COLOR TOKEN PALETTE                             │
├───────────────────┬──────────────┬─────────────────────────────────────┤
│ Token Name        │ Hex Code     │ Semantic Role                       │
├───────────────────┼──────────────┼─────────────────────────────────────┤
│ --bg-canvas       │ #090909      │ Deep black overall page canvas      │
│ --bg-card         │ #141414      │ Card, panel & container background  │
│ --bg-surface-elev │ #1a1a1a      │ Elevated form boxes & toolbars      │
│ --bg-input        │ #121212      │ Input fields & select dropdowns     │
│ --border-subtle   │ #27272a      │ Standard container & card borders   │
│ --border-hover    │ #3f3f46      │ Interactive focus & hover borders   │
│ --accent-orange   │ #f59e0b      │ Primary brand, CTA & GHI curve      │
│ --accent-purple   │ #8b5cf6      │ Forecast blocks (T..T+3) & active   │
│ --accent-green    │ #10b981      │ Live solar actuals & Excel download │
│ --accent-blue     │ #38bdf8      │ Solar power predicted curve (MW)    │
│ --accent-red      │ #ef4444      │ Logout, danger actions, maintenance │
│ --text-primary    │ #ffffff      │ High-contrast headings & titles     │
│ --text-secondary  │ #e4e4e7      │ Tabular numbers, values, body text  │
│ --text-muted      │ #71717a      │ Field labels, timestamps, metadata  │
└───────────────────┴──────────────┴─────────────────────────────────────┘
```

### Key Token Usage in Reference Screenshots:
* **`--accent-orange` (`#f59e0b` / `#ea580c`):** Used for the "Secure Login" button on the login screen, "Apply to Dashboard" button, GHI irradiance curve, and uppercase section category badges.
* **`--accent-purple` (`#8b5cf6`):** Highlights upcoming forecast intervals ($T, T+1, T+2, T+3$), time block badges (`08:30`, `08:45`), and active navigation states.
* **`--accent-green` (`#10b981`):** Highlights actual grid readings (`solar_actual`), active pipeline toggles, and the "Download Excel (244)" button.
* **`--accent-blue` (`#38bdf8`):** Visualizes the predicted solar generation curve (`solar_pred`) and informational metrics.

---

## 3. Typography Scale & Hierarchy

The application employs clean, sans-serif typography optimized for dense numeric telemetry:

| Hierarchy Level | Font Size | Weight | Letter Spacing | Example Text from Screenshots |
| :--- | :---: | :---: | :---: | :--- |
| **Hero Title (`h1`)** | `22px - 24px` | `800` (Bold) | `-0.01em` | "GI-IITB Experimental Forecast", "Welcome Back" |
| **Subtitle / Slogan** | `13px - 14px` | `400` (Regular) | `Normal` | "NOWCASTING · INTRA · MEDIUM", "Enter your credentials" |
| **Section Labels** | `11px - 12px` | `700` (Bold) | `+0.12em` | "CONTROLS", "SUMMARY", "GHI (W/m²)", "SOLAR POWER (MW)" |
| **Large Metric Numbers**| `24px - 28px` | `800` (Bold) | `-0.02em` | "26655.2 MW", "7,868.1 MW", "1768", "23" |
| **Input / Body Text** | `12px - 13px` | `400 / 500` | `Normal` | "superadmin", "Western Region", "Nowcasting" |
| **Field Labels** | `11px` | `600` (Medium) | `+0.04em` | "Generation Type", "State / ISTS Category", "Run Date" |
| **Badges & Micro Text** | `10px` | `700` (Bold) | `+0.05em` | "COMING SOON", "ISTS", "Live IST", "Rev 04", "v3.0" |

> **Formatting Rule:** All numerical values use **tabular figures** (`font-variant-numeric: tabular-nums`) to prevent horizontal layout jiggle during live data updates.

---

## 4. Spacing, Borders & Density System

The dashboard layout is engineered for **dense screen efficiency**:
* **Baseline Spacing:** Multiples of 4px (`4px`, `8px`, `12px`, `16px`, `24px`).
* **Card Padding:** Compact `14px - 16px` on desktop; `12px` on mobile.
* **Border Radii:**
  - Standard cards: `8px` (`rounded-lg`).
  - Inputs, select dropdowns & buttons: `6px` (`rounded-md`).
  - Status badges & pills: `4px` (`rounded`).
  - Circular buttons / avatars: `9999px` (`rounded-full`).
* **Border Lines:** Thin `1px solid #27272a` throughout; no heavy drop-shadows or gradients.

---

## 5. Page Regions Breakdown: Desktop vs. Mobile

### View A: Login Page (Screenshot 1)
```
┌────────────────────────────────────────────────────────────────────────┐
│ [IITB Logo] [GRID-INDIA Logo]                           [Theme Toggle] │
├───────────────────────────────────┬────────────────────────────────────┤
│                                   │          Welcome Back              │
│                                   │    Enter credentials to access     │
│        3D Rotating Earth          │ ┌────────────────────────────────┐ │
│        Photographic Globe         │ │ GI-IITB Experimental Forecast  │ │
│                                   │ │ Username: [ superadmin       ] │ │
│  "Advanced forecasting models     │ │ Password: [ **********     👁 ] │ │
│   for a sustainable energy        │ │ [     Secure Login           ] │ │
│   future."                        │ └────────────────────────────────┘ │
│                                   │    Restricted Access · System v3.0 │
└───────────────────────────────────┴────────────────────────────────────┘
```
* **Desktop Layout:** Two-column split. The left 55% showcases the rotating 3D Earth globe with an inspirational quote. The right 45% houses the centered login card (`#1a1a1a`).
* **Mobile Layout:** The 3D globe is scaled down and positioned above the login form, or hidden on very small viewports (<480px). The login form expands to 100% width with touch-friendly 44px tap targets.

---

### View B: Main Forecasting Dashboard (Screenshots 2 & 3)
```
┌────────────────────────────────────────────────────────────────────────┐
│ [IITB]   GI-IITB (GRID-INDIA IITB) Experimental Forecast   [GRID-INDIA]│
├───────────────────────────────────┬────────────────────────────────────┤
│ CONTROLS                          │ SUMMARY                            │
│ [Gen Type] [Region] [State/ISTS]  │ [Forecast Context] [Upcoming Blocks]│
│ [State]    [Plant]  [Run Date]    │ Installed Capacity: 26,655.2 MW    │
│ [Forecasting Type]  [Revision]    │ T: 0.0  T+1: 0.0  T+2: 0.0  T+3: 0.0│
│ ┌───────────────────────────────┐ │ [Weather Alert - COMING SOON]      │
│ │ SELECTION SUMMARY             │ ├────────────────────────────────────┤
│ │ Solar · Nowcasting · All Grids│ │ GHI (W/m²) Area Chart (Orange)     │
│ └───────────────────────────────┘ │ [00:00 ........... 12:00 ... 20:00]│
│ [ Apply to Dashboard ] (Auto 10m) ├────────────────────────────────────┤
│ [Admin Panel] [Theme] [Logout]    │ SOLAR POWER (MW) Chart (Blue/Green)│
├───────────────────────────────────┼────────────────────────────────────┤
│ PLANT MAP                         │ LOWER DATA PANEL                   │
│ OpenStreetMap of India            │ [Date Range] [Filters] [Download]  │
│ Clustered solar plant markers     │ Table: Plant | IST | Rev | GHI | MW│
└───────────────────────────────────┴────────────────────────────────────┘
```
* **Desktop Layout:** 
  - **Upper Row:** 2 columns. Left: Controls panel with 8 dropdowns + Selection Summary + Apply button. Right: KPI summary cards (Forecast Context, Upcoming Blocks, Weather Alert).
  - **Middle Row:** 2 columns. Left: Interactive Leaflet map of India. Right: Stacked GHI Irradiance chart and Solar Power MW chart.
  - **Lower Row:** Full-width scrollable data panel with table filters, green "Download Excel" button, and 15-min interval telemetry rows.
* **Mobile Layout:** Stacks vertically into a clean single column:
  1. Top Branding Header.
  2. Controls Panel (collapsible accordion to save vertical height).
  3. KPI Metric Cards (horizontal scroll or stacked 1-column cards).
  4. GHI & Solar Power Charts (scaled with touch tooltips).
  5. Plant Map (aspect-ratio 16:9).
  6. Lower Data Table (horizontally scrollable with sticky first column).

---

### View C: Admin Panel (Screenshots 4 & 5)
```
┌──┬─────────────────────────────────────────────────────────────────────┐
│🎛️│ [🛡️ ADMIN PANEL]                             🔔 Super Admin [Badge] │
├──┼─────────────────────────────────────────────────────────────────────┤
│👥│ Admin Dashboard                                                     │
│🏭│ Full system control — all regions, features, and users              │
│🗺️│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                 │
│📈│ │ USERS: 5 │ │PLANTS:1768│ │REGIONS:23│ │FEATURES:9│                 │
│⚙️│ └──────────┘ └──────────┘ └──────────┘ └──────────┘                 │
│  │ SUPER ADMIN QUICK ACTIONS:                                          │
│  │ [ Manage Features ]  [ Toggle Maintenance ]  [ Create Admin User ]  │
│  ├─────────────────────────────────────────────────────────────────────┤
│  │ Plants Management Table                                [+ Add Plant]│
│  │ [Search plant...] [All areas ▾] [All statuses ▾]                    │
│  │ Table: Plant Name | Type | Control Area | MW | Portal/Pipeline | Act│
└──┴─────────────────────────────────────────────────────────────────────┘
```
* **Desktop Layout:** Persistent narrow left icon sidebar (`w-16`) containing 6 navigation icons (Dashboard, Users, Plants, Regions, Analytics, Security). Main stage displays 4 KPI summary tiles, 3 quick action buttons, and the interactive Plants Data Table with status toggles.
* **Mobile Layout:** The sidebar collapses into a top hamburger navigation drawer. The 4 KPI tiles adapt to a 2x2 grid. The Plants Management Table features horizontal container scrolling.

---

## 6. Shared vs. Page-Specific Component Matrix

To ensure DRY (Don't Repeat Yourself) architecture, UI elements are categorized as either **Shared Components** or **Page-Specific Components**:

| Component Pattern | Classification | Shared Between | Exact Visual Specification |
| :--- | :---: | :--- | :--- |
| **Branding Top Header** | **Shared** | Login, Dashboard, Admin | Black bar (`#0d0d0d`), IITB Logo (left), GRID-INDIA Logo (right), bold center title. |
| **Theme Toggle Switch** | **Shared** | Login, Dashboard, Admin | Outlined rounded pill with sun/moon icon, switches dark/light mode tokens. |
| **Primary Action Buttons** | **Shared** | Login, Dashboard, Admin | Solid amber/orange (`#f59e0b`), black bold text (`font-weight: 700`), 6px border radius. |
| **Card Container Shell** | **Shared** | Dashboard, Admin | `#141414` background, `1px solid #27272a`, `8px` border-radius, clean internal padding. |
| **Metric DL (Description List)**| **Shared** | Dashboard, Admin | `<dl>`, `<dt>` label (11px Zinc 500 uppercase), `<dd>` value (24px-28px bold tabular number). |
| **Form Inputs & Selects** | **Shared** | Dashboard, Admin | `#121212` background, `#3f3f46` border, `#f4f4f5` text, purple focus ring (`#8b5cf6`). |
| **Data Table Pattern** | **Shared** | Dashboard, Admin | Dark header row, subtle `#27272a` bottom borders, hover row highlight (`#1a1a1a`), monospace timestamps. |
| **Status Badges & Pills** | **Shared** | Dashboard, Admin | 10px uppercase bold pills: Violet (Forecast), Amber (Warning), Green (Live/Success). |
| **3D Earth Globe Visual** | **Page-Specific** | **Login Only** | Photographic/WebGL spherical Earth on left hero section with atmospheric glow. |
| **Show/Hide Password Input** | **Page-Specific** | **Login Only** | Input field with internal eye toggle SVG icon to switch input `type="password"` and `type="text"`. |
| **Parameter Controls Toolbar**| **Page-Specific** | **Dashboard Only**| 8-dropdown grid + Selection Summary repeating chosen values + "Apply to Dashboard" button. |
| **Leaflet Plant Map** | **Page-Specific** | **Dashboard Only**| Interactive India tile map with circular orange plant location markers. |
| **GHI & Solar Area Charts** | **Page-Specific** | **Dashboard Only**| Time-series SVG/Canvas area charts with diurnal sun curve and dual series. |
| **Download Excel Button** | **Page-Specific** | **Dashboard Only**| Green button (`#10b981`) with download icon and dynamic record count indicator. |
| **Vertical Icon Sidebar** | **Page-Specific** | **Admin Only** | Narrow fixed sidebar with icon-only navigation, active indicator, and hover tooltips. |
| **Toggle Switches (Switches)**| **Page-Specific** | **Admin Only** | Rounded switch pills (green for active, gray for inactive) for Portal & Pipeline feeds. |

---

## 7. Form Controls & Interactive Patterns

### 1. Form Inputs & Dropdowns:
* Normal state: `background: #121212`, `border: 1px solid #3f3f46`, `color: #f4f4f5`.
* Focus state: `border-color: #8b5cf6`, `box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.25)`.
* Disabled state: `opacity: 0.5`, `cursor: not-allowed`.

### 2. Button Variations:
* **Primary Brand CTA (Login / Apply):** `bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold`.
* **Success CTA (Excel Export / Add Plant):** `bg-[#10b981] hover:bg-[#059669] text-white font-bold`.
* **Danger CTA (Logout):** `bg-[#dc2626] hover:bg-[#b91c1c] text-white`.
* **Outlined Action (Admin Quick Actions):** `bg-transparent border border-[#3f3f46] hover:bg-[#27272a] text-white`.

---

## 8. Accessibility & Responsiveness Audit Checklist

| Requirement | Implementation Strategy | Status |
| :--- | :--- | :---: |
| **Contrast Ratios (WCAG AA/AAA)** | Text ratio > 7:1 for white-on-black; > 4.5:1 for amber labels. | **Audited** |
| **Non-Color Dependent Status** | Status communicated via text + icon + badge (not color alone). | **Audited** |
| **Visible Keyboard Focus** | All interactive elements use `focus:ring-2 focus:ring-[#8b5cf6]`. | **Audited** |
| **Touch Target Size** | Minimum 44x44px for buttons and interactive controls on mobile. | **Audited** |
| **Desktop Usability (>1024px)** | High-density multi-column layout without clipping or horizontal overflow. | **Audited** |
| **Tablet Usability (768px)** | 2-column wrapping, auto-fitting card grids. | **Audited** |
| **Mobile Usability (375px)** | Clean single-column vertical stack, horizontal container scroll for data tables. | **Audited** |

---

## 9. Conclusion & Next Implementation Steps

This Design Inventory establishes the complete visual contract for Day 2:
1. **Task 02 (Next Step):** Build the **Page Shell (`<AppShell>`)** and shared navigation reusing the audited header, logos, active nav states, and responsive layout.
2. **Task 03:** Implement the **Login Form & Theme Switcher** matching View A.
3. **Task 04:** Build the **Dashboard Controls Toolbar & Selection Summary** matching View B.
4. **Task 05:** Build the **GHI & Solar Power Area Charts, Plant Map, and Data Table** with responsive states.

