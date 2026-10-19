# Task 02: Build Page Shell and Navigation System

**Module:** 2 — Recreate the portal's frontend foundation  
**Sprint/Day:** Week 1, Day 02  
**Task:** 02 — Build the page shell and navigation  
**Status:** Completed  
**Deliverable Path:** `reports/week-1/day-02/task-02-page-shell.md`  

---

## 1. Executive Summary & Objective

The objective of **Task 02** is to engineer a robust, accessible, and fully responsive **Page Shell and Navigation Architecture** for the **GRID-INDIA IIT Bombay (GI-IITB) Experimental Forecasting Portal**.

Building on the comprehensive UI audit from Task 01, this page shell establishes the foundational frame that houses all three primary views of the application:
1. **View A — Login Screen:** Earth sphere visualization + secure sign-in card.
2. **View B — Main Forecasting Dashboard:** Upper controls, selection summary, KPI tiles, geographic map placeholder, dual energy charts, and tabular data panel.
3. **View C — Admin Panel:** Entity management dock, system status banner, operational KPI cards, maintenance mode toggle, and plant configuration table.

All components are built using **React 19 + TypeScript + Vite**, fully isolated inside `c:\IIT\Tasks\Day 2` without touching the production codebase (`D:\grid-iitb`).

---

## 2. Acceptance Criteria & Verification Matrix

| Acceptance Criteria | Requirement Specification | Implementation Details | Status |
| :--- | :--- | :--- | :--- |
| **Approved Training Layout** | Add/extend only the approved training layout using clean routing conventions. | Structured inside `c:\IIT\Tasks\Day 2\src\` with state-driven view routing in `<AppShell>` and `<App>`. | ✅ PASSED |
| **Header Recreated** | Recreate header with IITB emblem, GRID-INDIA logo, title, and forecast modes. | `<Header />` includes vector badges for IITB & GRID-INDIA, centered title, Nowcast/Intra/Medium mode chips, theme toggle, and Super Admin badge. | ✅ PASSED |
| **Sidebar Recreated** | Dedicated navigation dock with active states and mobile drawer. | `<Sidebar />` renders 6-item admin icon navigation (`Overview`, `Users`, `Plants`, `Regions`, `Analytics`, `Security`) with indicator bars and tooltips. | ✅ PASSED |
| **Active Nav State** | Active item is visually clear and unambiguous. | Active buttons display high-contrast border highlights (`#8b5cf6` / `#f59e0b`), elevated background (`#27272a`), indicator dots, and `aria-current="page"`. | ✅ PASSED |
| **Keyboard Focus Rings** | Focus states clearly visible across all interactive elements. | Custom `:focus-visible` CSS rules implement a 2px vibrant purple ring (`#8b5cf6`) with 2px offset. Includes an accessible **"Skip to main content"** link. | ✅ PASSED |
| **Icon Components Reused** | Clean, semantic SVG icon components. | Extracted into `<Icons.*>` dictionary (`Dashboard`, `Users`, `Plants`, `Regions`, `Analytics`, `Security`, `Sun`, `Moon`, `Menu`, etc.). | ✅ PASSED |
| **Multi-View Navigation** | Navigation functions smoothly between training views. | Instant zero-lag navigation between `Login`, `Dashboard`, and `Admin` views with synchronized state. | ✅ PASSED |
| **Responsive Foundation** | Fluid layout across Desktop, Tablet, and Mobile widths. | CSS Flexbox & CSS Grid with media queries and an interactive viewport simulator (100% Desktop, 768px Tablet, 375px Mobile). | ✅ PASSED |

---

## 3. Architecture & Component Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│                              <AppShell>                                │
├────────────────────────────────────────────────────────────────────────┤
│  [Skip to main content link] (#main-content)                           │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                            <Header>                              │  │
│  │  [IITB] [GRID-INDIA]    [GI-IITB Forecast Title]     [View Tabs] │  │
│  │                         [Nowcast|Intra|Medium]       [Theme/User]│  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌───────────────┬──────────────────────────────────────────────────┐  │
│  │   <Sidebar>   │                <main id="main-content">          │  │
│  │  (Admin only) │                                                  │  │
│  │  ┌─────────┐  │  ┌────────────────────────────────────────────┐  │  │
│  │  │Overview │  │  │                                            │  │  │
│  │  │Users    │  │  │   Active View Component:                   │  │  │
│  │  │Plants   │  │  │   - <LoginShellView />                     │  │  │
│  │  │Regions  │  │  │   - <DashboardShellView />                 │  │  │
│  │  │Analytics│  │  │   - <AdminShellView />                     │  │  │
│  │  │Security │  │  │                                            │  │  │
│  │  └─────────┘  │  └────────────────────────────────────────────┘  │  │
│  └───────────────┴──────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                            <Footer>                              │  │
│  │  GI-IITB Experimental Forecast Portal • Training Sandbox Mode    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.1 `<AppShell />` (`src/components/AppShell.tsx`)
The master container responsible for:
* **Layout Orchestration:** Places the `<Header>` at top, conditionally mounts `<Sidebar>` when the admin view is active, and encloses view content inside `<main id="main-content">`.
* **Theme Management:** Supports Dark (`#090909`) and Light (`#f4f4f5`) modes with smooth CSS color transitions.
* **Accessibility Anchor:** Provides the standard WCAG-compliant skip-link for keyboard screen-reader users.
* **Testing Harness:** Includes a fixed floating toolbar allowing reviewers to toggle viewport widths (`100% Desktop`, `768px Tablet`, `375px Mobile`) directly within the browser.

### 3.2 `<Header />` (`src/components/Header.tsx`)
Matches the live production portal's exact brand composition:
* **Logos:** Left-aligned Indian Institute of Technology Bombay (`<IITBEmblem />`) and National Load Despatch Centre (`<GridIndiaLogo />`).
* **Title & Subtitle:** Centered portal branding *"GI-IITB (GRID-INDIA IITB) Experimental Forecast"* with mode indicator chips (`Nowcast`, `Intra`, `Medium`).
* **Navigation Switcher:** Prominent segmented button bar switching between `Forecast Dashboard`, `Admin Panel`, and `Login View`.
* **Utility Actions:** Light/Dark theme toggle button, Super Admin profile badge, and Logout CTA.

### 3.3 `<Sidebar />` (`src/components/Sidebar.tsx`)
Recreates the vertical icon dock observed in the original Admin Panel:
* **6 Administrative Sections:**
  1. `Overview`: High-level metrics, system telemetry, and maintenance control.
  2. `Users`: RBAC role management and operator credentials.
  3. `Plants`: Comprehensive plant registry, capacity parameters, and pipeline toggles.
  4. `Regions`: Regional load despatch centers (WR, SR, NR, ER, NER).
  5. `Analytics`: Pipeline performance, forecast MAPE tracking, and telemetry logs.
  6. `Security`: Audit logs, firewall rules, and token permissions.
* **Visual States:** Active item features a 3px violet indicator pill (`#8b5cf6`), elevated background, and tooltip hover labels.
* **Mobile Drawer:** Slides in smoothly from the left on mobile screens with a dark backdrop overlay.

### 3.4 `<Icons />` (`src/components/Icons.tsx`)
A modular collection of crisp, semantic SVG icons without third-party library overhead:
* `Dashboard`, `Users`, `Plants`, `Regions`, `Analytics`, `Security`, `Sun`, `Moon`, `Menu`, `Close`, `LogOut`, `Refresh`, `Filter`, `CheckCircle`, `AlertCircle`, `IITBEmblem`, and `GridIndiaLogo`.

---

## 4. Navigation & State Management

The shell architecture employs explicit state-driven routing:

```typescript
// App.tsx State Contract
const [currentView, setCurrentView] = useState<'dashboard' | 'admin' | 'login'>('dashboard');
const [adminSection, setAdminSection] = useState<AdminSubSection>('overview');
const [viewportWidth, setViewportWidth] = useState<'100%' | '768px' | '375px'>('100%');
```

### View Transition Logic:
* **Login Success:** Clicking "Mock Login (Enter Portal)" in `<LoginShellView>` switches `currentView` to `'dashboard'`.
* **Admin Switch:** Clicking "Admin Panel" in the header or "Quick Switch to Admin Panel" button transitions directly to `'admin'` view, triggering the dynamic sidebar appearance.
* **Forecast Return:** Clicking "Return to Forecast Dashboard" returns user seamlessly to `'dashboard'`.
* **Logout Action:** Clicking "Sign Out" clears active session state and redirects to `'login'`.

---

## 5. Accessibility & Keyboard Navigation Focus

To fulfill the strict accessibility criteria (*"keyboard focus is visible"*), explicit focus-visible styles were designed into every interactive element:

```css
/* Visible Keyboard Focus Rings */
button:focus-visible,
a:focus-visible,
select:focus-visible,
input:focus-visible {
  outline: none !important;
  box-shadow: 0 0 0 2px #090909, 0 0 0 4px #8b5cf6 !important;
}

/* Skip-to-content accessible link */
.skip-link:focus {
  top: 10px !important;
  outline: none !important;
  box-shadow: 0 0 0 3px #f59e0b !important;
}
```

### Keyboard Flow Test:
1. **Tab Key:** Moves focus sequentially through:
   * Skip link -> Mobile Menu button (if visible) -> Logo links -> Navigation tabs -> Theme button -> User badge -> Logout CTA -> Sidebar items -> Main view inputs.
2. **Space / Enter Key:** Triggers view switches and drawer toggles instantly.
3. **Esc Key:** Dismisses mobile sidebar drawers.

---

## 6. Responsive Viewport Adaptations

| Breakpoint | Layout Adaptations |
| :--- | :--- |
| **Desktop (>1024px)** | Full horizontal header with inline navigation tabs; permanent 64px vertical sidebar dock in Admin mode; multi-column content layout. |
| **Tablet (768px - 1024px)** | Header adjusts padding; view switcher buttons scale down; sidebar remains vertical; summary cards switch to 2-column grid. |
| **Mobile (<768px)** | Header logos scale to compact badges; hamburger menu button appears; admin sidebar collapses into a sliding off-canvas drawer; single-column content stacking. |

---

## 7. Deliverables & Source Code Index

All assets have been created in `c:\IIT\Tasks\Day 2`:

| File Path | Description |
| :--- | :--- |
| `src/components/AppShell.tsx` | Master shell layout, theme state, skip link, and viewport frame. |
| `src/components/Header.tsx` | Global top navigation bar, logos, mode badges, view tabs, and theme toggle. |
| `src/components/Sidebar.tsx` | Vertical icon dock for Admin navigation with mobile drawer support. |
| `src/components/Icons.tsx` | Semantic vector icons and institutional emblems. |
| `src/views/LoginShellView.tsx` | View A shell: 3D Earth globe visualization and mock login card. |
| `src/views/DashboardShellView.tsx` | View B shell: Controls panel, forecast summary, KPI cards, charts, and table. |
| `src/views/AdminShellView.tsx` | View C shell: System status banner, admin KPI tiles, and plants management table. |
| `src/App.tsx` | Top-level routing and state connector. |
| `src/main.tsx` & `index.html` | React 19 application entrypoint. |
| `interactive-demo.html` | **Zero-install standalone HTML preview** allowing instantaneous browser verification. |

---

## 8. How to Verify & Inspect

### Option 1: Standalone Browser Preview (Recommended — No Build Required)
Double-click or open directly in any browser:
```
file:///C:/IIT/Tasks/Day%202/interactive-demo.html
```
* Test view switching between **Dashboard**, **Admin Panel**, and **Login**.
* Test the **Dark / Light theme** toggle.
* Use the top **Viewport Simulator** bar (`Desktop 100%`, `Tablet 768px`, `Mobile 375px`) to inspect responsive layouts.
* Press `Tab` repeatedly to observe vibrant purple focus rings across all interactive controls.

### Option 2: Vite Development Server
Inside `c:\IIT\Tasks\Day 2`:
```bash
npm install
npm run dev
```
Open `http://localhost:3001` in your browser.

---

## 9. Conclusion & Readiness for Task 03

**Task 02 is 100% complete and validated.** The page shell and navigation foundation provide clean, modular containers for the remaining Day 2 tasks:
* **Task 03:** Recreate login and theme states (form validation, show/hide password, simulated loading).
* **Task 04:** Recreate dashboard filters and KPI cards (dynamic state binding).
* **Task 05:** Add responsive data visualizations and states (SVG charts and mock map wrapper).

