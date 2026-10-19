# Task 05: Responsive Data Visualizations, States, and Accessibility

**Module:** 2 — Recreate the portal's frontend foundation  
**Sprint/Day:** Week 1, Day 02  
**Task:** 05 — Add responsive data visualizations and states  
**Status:** Completed  
**Deliverable Path:** `reports/week-1/day-02/task-05-chart-and-responsive-states.md`  

---

## 1. Executive Summary & Objective

The objective of **Task 05** is to design and implement the **Responsive Data Visualizations, Interactive Telemetry Table, Regional GIS Map Placeholder, and State Handling Systems** for the GI-IITB Experimental Forecasting Portal.

Key achievements:
1. **Multi-Series Diurnal Forecast Chart (`ForecastCharts.tsx`):**
   - High-contrast responsive SVG line graph plotting Solar Power (MW, left Y-axis) and GHI Irradiance (W/m², right Y-axis) across 15-minute time intervals from 06:00 to 18:00.
   - **Crucial Accessibility Feature:** The graph is completely understandable **without relying on color alone** through the use of distinct line stroke dash patterns and geometric point markers (circles, squares, diamonds).
   - Accompanying natural-language text summary for screen reader and keyboard accessibility.
2. **Responsive Telemetry Data Table (`DataTable.tsx`):**
   - Displays 15-minute time blocks with GHI, Predicted, Actual, and Variance numbers.
   - Contrast-checked status badges (`OPTIMAL`, `ACCEPTABLE`, `DEVIATION`).
   - Simulated **"Download Excel (244)"** workflow with confirmation toast.
3. **Regional GIS Map Placeholder (`MapPlaceholder.tsx`):**
   - Stylized geographical telemetry wrapper marking key substation plants (Baktapur, Nagda, Malotra) with active cluster status.
4. **State Handling Suite (Normal, Loading Skeleton, Error Fallback):**
   - Built-in testing bar permitting instant verification of loading skeletons and error state recoveries across all visual components.

---

## 2. Acceptance Criteria & Verification Matrix

| Acceptance Criteria | Requirement Specification | Implementation Details | Status |
| :--- | :--- | :--- | :--- |
| **Understandable Without Color Alone** | Visualizations must distinguish data series using patterns/symbols, not just hue. | Series 1 (Predicted): Dashed stroke (`5,3`) + Solid Square (■)<br>Series 2 (Actual): Solid stroke + Solid Circle (●)<br>Series 3 (GHI): Dotted stroke (`2,2`) + Diamond (◆). Fully legible in monochrome / grayscale. | ✅ PASSED |
| **Small Responsive Chart** | Scalable SVG chart rendering without distortion at desktop & mobile. | Built with SVG `viewBox="0 0 800 260"` and horizontal scrolling container for small mobile viewports. | ✅ PASSED |
| **Responsive Data Table** | Tabular representation of telemetry with proper headings and units. | `<table>` with semantic `scope="col"`, numerical alignment, explicit units (`MW`, `W/m²`), and zebra striping. | ✅ PASSED |
| **Labeled Map Placeholder** | Regional grid visualization wrapper using mock coordinates. | Vector grid overlay, geo coordinates (`20.0°N - 28.5°N`), plant pins with MW capacity tags, and status dots. | ✅ PASSED |
| **Loading / Error Appearances** | Loading skeleton and error fallback states with retry capabilities. | Animated loading pulse placeholders and high-contrast red error alerts with interactive "Retry" buttons. | ✅ PASSED |
| **Readable Axes & Headings** | Clear typography and contrasting axes labels. | Dual Y-axes (Power MW on left, GHI on right) with dotted grid lines and prominent time block labels on X-axis. | ✅ PASSED |
| **Accessible Text Summary** | Accompanying text summary describing key data findings. | Accessible summary banner below chart detailing peak time (`12:00 PM`), peak power (`8,650 MW`), and GHI irradiance (`945 W/m²`). | ✅ PASSED |
| **Desktop & Mobile Checked** | Verified across desktop (>1024px), tablet (768px), and mobile (375px). | Layout flexes from 2-column side-by-side grid to vertically stacked single columns on mobile. | ✅ PASSED |

---

## 3. "Color-Blind Safe & Non-Color Dependent" Chart Design

In accordance with WCAG 2.1 Non-Text Contrast (1.4.11) and Use of Color (1.4.1), data series are distinguished via independent geometric signatures:

```
┌────────────────────────────────────────────────────────────────────────┐
│ SERIES IDENTIFICATION MATRIX (COLOR + PATTERN + MARKER SYMBOL)         │
├────────────────────┬──────────┬──────────────┬────────────┬────────────┤
│ Series Name        │ Color    │ Stroke Dash  │ Symbol     │ Axis       │
├────────────────────┼──────────┼──────────────┼────────────┼────────────┤
│ Solar Predicted    │ #38bdf8  │ Dashed (6,4) │ Square (■) │ Left (MW)  │
│ Solar Actual       │ #10b981  │ Solid        │ Circle (●) │ Left (MW)  │
│ GHI Irradiance     │ #f59e0b  │ Dotted (3,3) │ Diamond(◆) │ Right(W/m²)│
└────────────────────┴──────────┴──────────────┴────────────┴────────────┘
```

Even if printed in complete black and white or viewed through monochromatic color blindness, every data point and line can be unambiguously tracked.

---

## 4. Visualization State Matrix

Instructors can verify state transitions using the **Task 05 Visualization States** toggle bar at the top of the dashboard:

1. **Normal State:**
   - Full responsive SVG curve rendered with interactive markers.
   - Data table displaying active 15-minute intervals.
   - GIS map showing active regional clusters.
2. **Loading Skeleton State:**
   - Chart and table switch to high-contrast shimmering skeleton blocks.
   - Map displays *"Loading GIS regional plant map..."* placeholder.
3. **Error State:**
   - Visualizations display high-contrast `#ef4444` error panels with explicit alert role (`role="alert"`).
   - Each error card provides an accessible **"Retry Telemetry Load"** button that immediately recovers the interface to normal state upon click.

---

## 5. Deliverable Files

| File | Path | Role |
| :--- | :--- | :--- |
| **Chart Component** | `src/components/ForecastCharts.tsx` | Accessible multi-series SVG chart with dual Y-axes & text summary. |
| **Table Component** | `src/components/DataTable.tsx` | Responsive telemetry table with status badges and simulated Excel download. |
| **Map Component** | `src/components/MapPlaceholder.tsx` | Labeled GIS regional substation map wrapper. |
| **Dashboard Shell** | `src/views/DashboardShellView.tsx` | Full view integration with Task 05 testing state controller. |
| **Deliverable Report** | `reports/week-1/day-02/task-05-chart-and-responsive-states.md` | Formal audit deliverable. |
| **Root Copy** | `task-05-chart-and-responsive-states.md` | Quick access copy. |

---

## 6. How to Verify

1. Open `http://localhost:3001` or [`interactive-demo.html`](file:///c:/IIT/Tasks/Day%202/interactive-demo.html).
2. Go to the **Forecast Dashboard** view.
3. Scroll to the **SOLAR POWER & GHI IRRADIANCE** chart:
   - Notice the dashed line with squares, solid line with circles, and dotted line with diamonds.
   - Review the **Accessible Graph Summary** text box below the chart.
4. Test the **Task 05 State Inspector Bar**:
   - Click **"Loading Skeleton"**: Observe the chart, map, and data table transition into clean loading skeletons.
   - Click **"Error State"**: Observe the error banner and test clicking the **"Retry Telemetry Load"** button to restore normal operation.
5. In the **DATA TABLE**, click **"Download Excel (244)"**: Observe the green simulated export confirmation toast.
6. Use the top viewport switcher (`Desktop 100%`, `Tablet 768px`, `Mobile 375px`) to confirm that all visualizations resize without layout overflow.

