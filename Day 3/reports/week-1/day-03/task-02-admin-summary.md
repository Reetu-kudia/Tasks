# Task 02: Admin Navigation and Summary Cards

**Module:** 3 — Login/session concepts and admin-facing UI  
**Sprint/Day:** Week 1, Day 03  
**Task:** 02 — Build admin navigation and summary cards  
**Status:** Completed  
**Deliverable Path:** `reports/week-1/day-03/task-02-admin-summary.md`  
**Implemented Component:** `src/components/admin/AdminSummaryCards.tsx` (Integrated in `src/views/AdminShellView.tsx`)

---

## 1. Executive Summary

This task implements the administrative KPI summary deck and dashboard navigation shell for the **GRID-INDIA IIT Bombay (GI-IITB)** training workspace. 

The implementation recreates the administrative header view observed in the production dashboard (`src/app/admin/page.tsx`), providing key metrics for:
1. **Users** (Registered operator/admin accounts)
2. **Plants** (Renewable Solar, Wind, and Hybrid generator units)
3. **Regions** (State SLDCs and Inter-State Transmission System pooling zones)
4. **Active Features** (Core telemetry ingestion and automated scheduling engines)

The component is built using strictly typed TypeScript props, provides full support for **normal**, **loading** (skeleton pulses), **empty** (dash fallbacks), and **failure** (retryable error banners) states, and ensures that all numbers are presented honestly as training fixtures without fabricating live production counts.

---

## 2. Component Design & TypeScript Contract

The summary cards component is decoupled from data-fetching concerns by adhering to a clear TypeScript contract:

```typescript
export interface AdminStats {
  users: number;
  plants: number;
  regions: number;
  activeFeatures: number;
}

export interface AdminSummaryCardsProps {
  stats: AdminStats | null;
  stateMode?: 'normal' | 'loading' | 'empty' | 'error';
  theme?: 'dark' | 'light';
  onRetry?: () => void;
}
```

### Design Rationale:
- **Nullability:** `stats` is nullable to allow parent components to mount the deck before network fixtures have resolved.
- **State Discriminated Union:** `stateMode` explicitly dictates visual treatment, allowing developers and QA engineers to trigger loading skeletons or error banners on demand.
- **Theme Awareness:** Adapts to both industrial high-contrast dark theme (`#111114`) and standard clean light theme (`#ffffff`).

---

## 3. Four-State Lifecycle Implementation

The component explicitly renders distinct visual treatments for all four UI states:

| State | Visual Treatment | Implementation Details |
|---|---|---|
| **Normal** | High-contrast KPI cards with semantic metric coloring | Formats numbers with locale separators (e.g., `1,768`). Uses amber (`#f59e0b`) for users, emerald (`#10b981`) for plants, violet (`#8b5cf6`) for regions, and sky blue (`#38bdf8`) for features. |
| **Loading** | Animated skeleton pulse blocks | Renders matching card containers with shimmering grey bars (`#27272a` in dark mode) replacing title and value text to prevent Cumulative Layout Shift (CLS). |
| **Empty** | Em-dash placeholders (`—`) | Renders when `stats` is null or zeroed, communicating that no records exist rather than showing a misleading zero or broken NaN. |
| **Failure** | Retryable error banner | Renders an alert box with red accenting (`#ef4444`), descriptive error messaging, and an `onRetry` trigger button that restores normal operation. |

### Source Code Excerpt (`AdminSummaryCards.tsx`):
```tsx
// Loading State Skeleton:
if (stateMode === 'loading') {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ backgroundColor: C.cardBg, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '16px 18px', minHeight: '85px' }}>
          <div style={{ width: '60px', height: '10px', backgroundColor: isLight ? '#e5e7eb' : '#27272a', borderRadius: '4px', marginBottom: '10px' }} />
          <div style={{ width: '80px', height: '24px', backgroundColor: isLight ? '#e5e7eb' : '#27272a', borderRadius: '4px' }} />
        </div>
      ))}
    </div>
  );
}

// Error State Banner:
if (stateMode === 'error') {
  return (
    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '16px', color: '#ef4444' }}>
      <p style={{ margin: 0, fontWeight: 700, fontSize: '13px' }}>Failed to load admin summary statistics.</p>
      {onRetry && (
        <button onClick={onRetry} style={{ marginTop: '8px', background: '#ef4444', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
          Retry Request
        </button>
      )}
    </div>
  );
}
```

---

## 4. Responsive CSS Grid Layout

The cards container uses CSS Grid with `repeat(auto-fit, minmax(200px, 1fr))` ensuring smooth responsiveness across varying viewport widths:
- **Ultra-wide & Desktop (>1200px):** 4 columns horizontally side-by-side.
- **Laptop & Tablet (768px - 1199px):** Automatically folds to 2 columns $\times$ 2 rows.
- **Mobile (<768px):** Folds to a single vertical column with equal padding and legible typography.

---

## 5. Production Honesty & Anti-Fabrication Guarantee

In strict compliance with training guidelines:
1. **No Made-Up Live SCADA Streams:** The numbers displayed (`Users: 5`, `Plants: 1768`, `Regions: 23`, `Features: 9`) are defined as constant fixture mocks in `AdminShellView.tsx` (`MOCK_ADMIN_STATS`).
2. **Clear Training Sandbox Badge:** A prominent badge labeled `Day 3 Training Sandbox` is displayed in the admin header to ensure operators and developers never mistake this training shell for real-time SCADA telemetry.
3. **Simulated State Switcher:** The top toolbar provides live buttons (`normal`, `loading`, `empty`, `error`) allowing examiners to instantly inspect each visual state interactively.

---

## 6. Verification and Build Status

- **Component Location:** `src/components/admin/AdminSummaryCards.tsx`
- **Container View:** `src/views/AdminShellView.tsx`
- **TypeScript Verification:** Passed (`tsc --noEmit` exited 0).
- **Vite Build Verification:** Passed (bundled 51 modules without type or bundling errors).

