# Task 04: Complete Architecture & Technical Deep-Dive

This document provides an exhaustive, production-grade technical explanation of **Task 04 (Controlled Input & Filter Interaction)** within the GI-IITB solar telemetry platform. It covers theoretical foundations, component interactions, accessibility standards, and code walkthroughs.

---

## 1. High-Level Context: Why Does This Task Exist?

In the live **GI-IITB Experimental Forecast** platform:
- India's power grid is categorized into 5 Regional Load Despatch Centres (RLDCs): **Northern (NR)**, **Western (WR)**, **Southern (SR)**, **Eastern (ER)**, and **North-Eastern (NER)**, along with National Aggregation (**ALL**).
- Solar radiation, cloud cover, and installed photovoltaic capacity differ drastically by region.
- Grid operators and forecasting algorithms require **date-specific** and **region-specific** analysis.

In **Task 03**, we built the visual `EnergySummaryCard` component. However, that component was purely presentational (static props).  
**Task 04 bridges the gap between user intention and UI presentation:**  
It introduces interactive form controls (Region Dropdown & Date Picker) that capture user intent and instantly reflect it across the UI using reactive state management.

---

## 2. Technical Architecture & File Map

Under the **DRY (Don't Repeat Yourself) Monolithic Architecture** adopted for Day 1:
- All executable code for Task 04 resides inside the main codebase at `c:\IIT\Tasks\Day 1\Task 3\src\task-4-filter\`.
- It imports the **single master component** `EnergySummaryCard.tsx` from `c:\IIT\Tasks\Day 1\Task 3\src\components\`.
- This folder (`Day 1/Task 4/`) stores the formal submission reports, screenshots, and zero-install standalone demo.

```
c:\IIT\Tasks\Day 1\
├── Task 3\                                <--- Main Executable Codebase
│   └── src\
│       ├── components\
│       │   └── EnergySummaryCard.tsx      # Shared Master Card Component (Task 03)
│       └── task-4-filter\                 # Task 04 Feature Module
│           ├── regions.ts                 # Regional metadata database
│           ├── FilterControls.types.ts    # TypeScript interface contracts
│           ├── FilterControls.module.css  # Scoped responsive styles & breakpoints
│           ├── FilterControls.tsx         # Accessible controlled form UI
│           ├── SelectionResultPanel.tsx   # Synchronized selection & empty state panel
│           └── Task4View.tsx              # State manager & container component
│
└── Task 4\                                <--- Formal Deliverables
    ├── task-04-filter-interaction.md      # Official submission report
    ├── task-04-understanding.md           # This comprehensive guide
    ├── interactive-demo.html              # Standalone 1-click preview
    └── image&video\                       # Screenshots
        ├── 1-Desktop.png
        └── 2-Mobile.png
```

---

## 3. The 3 Core Concepts: In-Depth Breakdown

### ① State (`useState`)
* **What it is:** In React, **State** is a component's internal, reactive memory.
* **Why plain variables fail:**  
  ```ts
  // ❌ INCORRECT: Plain JavaScript variable
  let region = 'WR';
  function changeRegion(newRegion) {
    region = newRegion; // Variable changes in RAM, but React DOES NOT KNOW to re-render the screen!
  }
  ```
  In standard JavaScript, changing a local variable does not notify the browser to update the DOM.
* **The React State mechanism:**
  ```tsx
  // ✅ CORRECT: React State Hook
  const [selectedRegion, setSelectedRegion] = useState<string>('WR');
  ```
  When `setSelectedRegion('NR')` is executed:
  1. React queues a state update.
  2. React schedules a re-render cycle for `Task4View`.
  3. React runs its **Virtual DOM diffing algorithm (Reconciliation)**.
  4. Only the specific DOM nodes that changed are patched in the actual browser DOM.

---

### ② Event Handlers & Synthetic Events
* **What it is:** A function that executes in response to a user action (selecting a dropdown item, entering a date, clicking a button).
* **React SyntheticEvent System:**  
  Rather than binding directly to browser-specific DOM events (which differ across Safari, Chrome, Edge), React wraps native browser events in a normalized `React.SyntheticEvent<T>`.
* **Implementation in Task 04:**
  ```tsx
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // 1. Intercept the user's selected value from the event target
    const newRegionValue = e.target.value;
    
    // 2. Dispatch the update to the parent state updater
    onRegionChange(newRegionValue);
  };
  ```
* **Event Delegation:** React does not attach an event listener to every single `<option>` or `<input>`. Instead, React attaches a single top-level event listener at the root DOM container (`#root`), drastically improving performance.

---

### ③ Controlled Inputs vs. Uncontrolled Inputs

| Feature | Controlled Input (Task 04) | Uncontrolled Input (Legacy DOM) |
| :--- | :--- | :--- |
| **Source of Truth** | **React State (`useState`)** | **Browser DOM (`element.value`)** |
| **Value Attribute** | Explicitly bound (`value={selectedRegion}`) | Unbound or `defaultValue` |
| **Change Tracking** | Real-time on every keystroke (`onChange`) | Extracted only on form submit via `ref` |
| **UI Synchronization** | Instant: Other components update in real-time | Delayed: Requires manual DOM query |
| **Input Validation** | Can format, mask, or reject invalid inputs live | Hard to validate until user submits |

#### The Controlled Input Pattern in Code:
```tsx
<select
  id="grid-region-select"
  value={selectedRegion}              // 1. PUSH: State pushes value into the input
  onChange={handleRegionChange}       // 2. PULL: User action pulls value back to State
  className={styles.selectInput}
>
  <option value="ALL">All Grids (National View)</option>
  <option value="WR">Western Region (WR)</option>
  <option value="NR">Northern Region (NR)</option>
</select>
```
**Why this matters:** Because `selectedRegion` is stored in React state, `SelectionResultPanel` and the downstream `EnergySummaryCards` don't need to read the `<select>` element from the DOM. They simply read `selectedRegion` from state. **The data flow is unidirectional and 100% predictable.**

---

## 4. Component Walkthrough & Data Flow

```
[ User interacts with Dropdown ]
              │
              ▼
    (onChange event fires)
              │
              ▼
    handleRegionChange()
              │
              ▼
    setSelectedRegion(newVal)
              │
              ▼
[ React triggers Re-render of Task4View ]
              │
              ├──────────────────────────────┬──────────────────────────────┐
              ▼                              ▼                              ▼
    <FilterControls />            <SelectionResultPanel />       <EnergySummaryCard />
    Shows selected item           Calculates telemetry info      Renders 26,655.2 MW
    in dropdown                   "138 Substations Connected"    Badge: "GRID-WR"
```

### Detailed Component Roles:

#### 1. `regions.ts` (Data Dictionary)
* Stores the single source of truth for grid regions:
  ```ts
  export interface RegionTelemetry {
    id: string;
    name: string;
    code: string;
    installedCapacityMW: number;
    substations: number;
    status: 'NORMAL' | 'ALERT' | 'OFFLINE';
  }
  ```
* Exports helper `getRegionById(id)` to retrieve capacity, substation count, and codes.

#### 2. `FilterControls.tsx` (Input UI)
* Pure controlled component. Receives `selectedRegion`, `selectedDate`, `onRegionChange`, `onDateChange`, and `onReset`.
* Disables the "Clear Filters" button when no active filters exist.

#### 3. `SelectionResultPanel.tsx` (Result & Empty State)
* When filters are active: Displays 4 telemetry metric tiles (Selected Region, Date, Capacity MW, Substations Connected).
* When filters are cleared (`!selectedRegion && !selectedDate`): Gracefully displays the **Empty State Box** with icon `📊` and informative helper text, preventing application crashes.

#### 4. `Task4View.tsx` (Parent Container)
* Owns the state:
  ```tsx
  const [selectedRegion, setSelectedRegion] = useState<string>('WR');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-14');
  const [viewportWidth, setViewportWidth] = useState<'100%' | '768px' | '375px'>('100%');
  ```
* Feeds `activeRegion` values into the Task 3 `EnergySummaryCard` components.

---

## 5. Accessibility (WCAG 2.1 Compliance)

Accessibility is not optional in production engineering. Task 04 implements the following accessibility features:

1. **Explicit Label-Input Association:**
   * Every form control is tied to a `<label>` using matching `htmlFor` and `id` attributes:
     ```tsx
     <label htmlFor="grid-region-select">Grid Region</label>
     <select id="grid-region-select" ... />
     ```
   * Screen readers announce the label immediately when the user focuses on the dropdown.
2. **Accessible Required Flags:**
   * Visual asterisks are hidden from screen readers (`<span aria-hidden="true">*</span>`) so they are not announced as "star".
   * Inputs declare programmatic requirement via `aria-required="true"`.
3. **Live Status Regions:**
   * The Empty State container uses `role="status"` so assistive technologies announce state changes when filters are cleared.

---

## 6. Mobile & Narrow-Screen Usability (375px Viewport)

Power grid engineers often access telemetry dashboards on tablets or mobile phones during field maintenance.

* **CSS Grid Desktop Layout (> 640px):**
  `grid-template-columns: 1fr 1fr auto;`  
  Region dropdown, date picker, and reset button sit side-by-side in a compact row.
* **CSS Grid Mobile Layout (< 640px / 375px):**
  ```css
  @media (max-width: 640px) {
    .filterForm {
      grid-template-columns: 1fr;
    }
    .resetBtn {
      width: 100%;
    }
  }
  ```
* **Touch Target Sizing:** All inputs and buttons maintain a minimum height of `38px` to ensure touch targets meet mobile usability guidelines.
* **Zero Horizontal Scroll:** Inputs expand smoothly to `100%` width without overflowing the screen.

---

## 7. How Task 4 Connects to Task 3 and Task 5

* **Connection to Task 3:**  
  Task 3 created the static card component (`EnergySummaryCard.tsx`). Task 4 imports that exact component and makes it reactive to user selections.
* **Connection to Task 5:**  
  In Task 5, we call a backend API (`GET /api/training/energy?region=WR&date=2026-10-14`). The query parameters `region` and `date` are directly supplied by **Task 4's state**!

---

## 8. Summary of How to Run & Verify

1. **Terminal Command:**
   ```powershell
   cd "c:\IIT\Tasks\Day 1\Task 3"
   npm run dev
   ```
2. Open `http://localhost:3000` and click the **"Task 04: Filter Interaction"** tab.
3. **Verification Steps:**
   - Change the region from **Western Region (WR)** to **Northern Region (NR)** $\rightarrow$ Notice Capacity changes from `26,655.2 MW` to `18,230.0 MW`.
   - Click **Mobile (375px)** $\rightarrow$ Form stacks vertically with full-width inputs.
   - Click **Clear Filters** $\rightarrow$ Graceful empty state renders without errors.

