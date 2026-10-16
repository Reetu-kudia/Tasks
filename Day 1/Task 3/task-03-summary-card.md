# Task 03: Build a Tiny Frontend Card (Energy Summary Card)

**Module:** 1 — Web, project setup, and first tiny projects  
**Sprint/Day:** Week 1, Day 01  
**Status:** Completed  
**Deliverable:** `reports/week-1/day-01/task-03-summary-card.md`  

---

## 1. Executive Summary

For **Task 03**, a reusable, responsive **Energy Summary Card** component was created for the experimental solar forecasting platform. This component replicates the exact aesthetic, typography, and density of the metric cards found on the live **GI-IITB Experimental Forecast** dashboard (such as the *Upcoming Forecast* time blocks `T, T+1, T+2, T+3` and the *Forecast Context* card).

### Core Constraints & Adherence:
- **Zero Production Dashboard Alterations:** The live dashboard codebase (`grid-iitb`) was completely untouched. The component was developed and tested within a dedicated, instructor-approved standalone learning environment and training route in `c:\IIT\Tasks\Day 1\Task 3\`.
- **Props-Driven (No Hard-coding):** All displayed values (`title`, `value`, `unit`, `label`, `sublabel`, `variant`, `metadata`) are dynamically supplied via strongly-typed TypeScript props.
- **Semantic HTML:** Constructed using `<article>`, `<header>`, `<dl>`, `<dt>`, `<dd>`, and ARIA attributes for accessibility (`aria-busy`, `aria-live`, `role="status"`).
- **Comprehensive State Management:** Built-in support for **Active**, **Skeleton Loading**, and **Empty / No-Data** states.
- **Cross-Device Responsiveness:** Verified clean rendering at both mobile viewports (~375px) and desktop viewports (>1024px) with zero console warnings or errors.

---

## 2. Component Architecture & File Structure

The project has been organized into modular files located in `c:\IIT\Tasks\Day 1\Task 3\`:

```
c:\IIT\Tasks\Day 1\Task 3\
├── src\
│   ├── components\
│   │   ├── EnergySummaryCard.tsx          # Master shared React component (Used across Tasks 3, 4, 5)
│   │   ├── EnergySummaryCard.types.ts     # TypeScript interface definitions
│   │   └── EnergySummaryCard.module.css   # Theme styling & responsive CSS
│   ├── task-4-filter\                     # Task 04 Filter Feature Module
│   │   ├── FilterControls.tsx             # Controlled form inputs
│   │   ├── SelectionResultPanel.tsx       # Live result panel
│   │   └── Task4View.tsx                  # Task 04 interactive view
│   ├── task-5-api\                        # Task 05 API Feature Module
│   │   ├── ApiInspectorPanel.tsx          # HTTP response & JSON inspector
│   │   ├── apiService.ts                  # API fetch client & mock handlers
│   │   └── Task5View.tsx                  # Task 05 interactive view
│   ├── TrainingRoute.tsx                  # Master App with [Task 3] [Task 4] [Task 5] Tab Switcher
│   ├── main.tsx                           # React entry point
│   └── vite-env.d.ts                      # CSS modules & Vite types
├── interactive-demo.html                  # Standalone zero-install interactive tester
├── reports\week-1\day-01\
│   └── task-03-summary-card.md            # Formal submission report
├── package.json                           # Vite + React 19 + TypeScript configuration
├── tsconfig.json                          # Strict TypeScript configuration
└── vite.config.ts                         # Vite dev server + /api/training/energy route handler
```

---

## 3. Strongly-Typed Props Specification

The component contract is declared via `EnergySummaryCardProps` in `EnergySummaryCard.types.ts`:

```typescript
export type CardThemeVariant = 'violet' | 'amber' | 'green' | 'blue';

export interface MetaItem {
  label: string;
  value: string | number;
}

export interface EnergySummaryCardProps {
  title: string;                                    // Card title (e.g., "Upcoming Forecast")
  value?: number | string | null;                  // Metric value (e.g., 8250.7)
  unit?: string;                                   // Metric unit (e.g., "MW", "W/m²")
  label?: string;                                  // Primary label/block (e.g., "Time Block: T")
  sublabel?: string;                               // Secondary timestamp/badge (e.g., "08:30")
  variant?: CardThemeVariant;                      // 'violet' | 'amber' | 'green' | 'blue'
  icon?: React.ReactNode;                          // Leading icon component
  isLoading?: boolean;                             // Skeleton loading toggle
  isEmpty?: boolean;                               // Explicit empty state override
  emptyMessage?: string;                           // Contextual empty notice
  metadata?: MetaItem[];                           // Context key-value rows
  className?: string;                              // Style overrides
  onClick?: () => void;                            // Optional interactive action
}
```

---

## 4. Semantic HTML Structure

Rather than relying on unsemantic nested `<div>` tags, the card follows W3C and WCAG semantic markup standards:

```html
<article class="energy-card variant-violet" aria-label="Upcoming Forecast Block T">
  <!-- Semantic Header -->
  <header class="card-header">
    <div class="card-title-group">
      <span class="card-icon" aria-hidden="true">⚡</span>
      <h3 class="card-title">Upcoming Forecast</h3>
    </div>
    <span class="card-badge">08:30</span>
  </header>

  <!-- Metric Description List -->
  <dl class="metric-list">
    <div class="metric-label-row">
      <dt class="metric-label">Time Block: T</dt>
      <span class="metric-sublabel">08:30</span>
    </div>
    <dd class="metric-value-row">
      <span class="metric-value">8,250.7</span>
      <span class="metric-unit">MW</span>
    </dd>
  </dl>

  <!-- Optional Context Key-Value Pairs -->
  <dl class="meta-list">
    <div class="meta-row">
      <dt class="meta-label">Installed Capacity:</dt>
      <dd class="meta-val">26655.2 MW</dd>
    </div>
  </dl>
</article>
```

---

## 5. State Handling Verification

| State | Trigger Condition | Visual Appearance & Behavior |
| :--- | :--- | :--- |
| **Active State** | `value` provided, `isLoading=false`, `isEmpty=false` | Displays large tabular formatted number (e.g., `8,250.7`), uppercase unit (`MW`), accent color highlight (violet/green/amber/blue), and optional metadata rows. |
| **Loading State** | `isLoading=true` | Replaces metric text with an animated linear-gradient shimmer skeleton (`@keyframes shimmer`). Sets `aria-busy="true"` and `aria-live="polite"` for screen readers. |
| **Empty State** | `value === null` or `isEmpty=true` | Renders a clean muted dash (`—`) and a helpful fallback message (e.g., *"No data available for the selected period"*), preventing layout breakage or runtime errors. |

---

## 6. Styling & Responsiveness

### Color Tokens (Dashboard Match):
- **Card Background:** `#1a1a1a` (Zinc 900)
- **Border:** `#27272a` (Zinc 800) with hover state to `#3f3f46`
- **Primary Text:** `#e4e4e7` (Zinc 200)
- **Muted Labels:** `#71717a` (Zinc 500)
- **Metric Highlight Colors:**
  - Violet (`#8b5cf6`): Used for forecast blocks (`T, T+1, T+2, T+3`)
  - Green (`#10b981`): Used for live actual generation
  - Amber (`#f59e0b`): Used for forecast context and solar warnings
  - Blue (`#38bdf8`): Used for solar radiation (GHI)

### Responsive Breakpoints:
- **Desktop (>1024px):** Renders in an auto-fitting grid layout (`grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))`).
- **Tablet (768px):** Adapts fluidly without horizontal scroll, stacking context metadata cleanly.
- **Mobile (<640px / 375px):** Card scales padding to `12px`, value font scales from `28px` to `24px`, and layout stacks into a single column with full touch-friendly proportions.

---

## 7. Quality & Acceptance Checklist

| Acceptance Requirement | Status | Notes |
| :--- | :---: | :--- |
| **Values come from props, not hardcoded** | **Passed** | Verified in `EnergySummaryCard.tsx` — all text and numbers rendered from props. |
| **Loading state implemented** | **Passed** | CSS shimmer skeleton implemented with accessibility attributes. |
| **Empty/Fallback state implemented** | **Passed** | Fallback dash and descriptive message for missing values. |
| **Semantic HTML used** | **Passed** | `<article>`, `<header>`, `<h3>`, `<dl>`, `<dt>`, `<dd>`. |
| **Zero console errors** | **Passed** | Validated in training harness with 0 warnings/errors. |
| **Mobile & desktop responsiveness** | **Passed** | Tested across 375px, 768px, and 1200px viewports. |
| **Production dashboard unaltered** | **Passed** | Built in an isolated learning project under `Tasks/Day 1/Task 3`. |

---

## 8. How to View & Test the Implementation

### Option A: Instant Zero-Install Browser Preview
Double-click or open the following file directly in any web browser (Google Chrome, Microsoft Edge, etc.):
```
c:\IIT\Tasks\Day 1\Task 3\interactive-demo.html
```
- Includes live interactive buttons to toggle **Loading State ON/OFF**, **Empty State ON/OFF**, and instant viewport simulation (**Desktop**, **Tablet 768px**, **Mobile 375px**).

### Option B: Local React Development Server
In PowerShell or Terminal:
```powershell
cd "c:\IIT\Tasks\Day 1\Task 3"
npm install
npm run dev
```
Navigate to `http://localhost:3000` to view the full React 19 + TypeScript Training Route.

---

## 9. Visual Artifacts & Screenshots (`image&video/`)

All visual evidence and screenshots are stored in the project's [`image&video/`](./image&video/) folder:

1. **Desktop View (All Cards Active):**
   - File: `image&video/01-desktop-summary-cards.png`
   - Shows: Upcoming Forecast blocks (T, T+1, T+2, T+3), Forecast Context, Live Actuals, and Solar Radiation cards rendered in multi-column layout.

2. **Mobile View (Narrow Screen Usability - 375px):**
   - File: `image&video/02-mobile-responsive-view.png`
   - Shows: Fluid single-column stacked layout without horizontal scrollbars or layout shifts.

3. **Loading Skeleton State:**
   - File: `image&video/03-loading-skeleton-shimmer.png`
   - Shows: Pulse animated shimmer placeholders for the metric titles, badges, and values.


