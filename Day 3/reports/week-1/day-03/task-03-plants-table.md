# Task 03: Mock Plants Management Table with Search and Filter

**Module:** 3 — Login/session concepts and admin-facing UI  
**Sprint/Day:** Week 1, Day 03  
**Task:** 03 — Build a mock plants table  
**Status:** Completed  
**Deliverable Path:** `reports/week-1/day-03/task-03-plants-table.md`  
**Implemented Component:** `src/components/admin/AdminPlantsTable.tsx` (Integrated in `src/views/AdminShellView.tsx`)

---

## 1. Executive Summary

This task implements an interactive, typed **Plants Management Table** inside the training sandbox.

In utility grid operations, managing renewable generating units (Solar, Wind, and Hybrid parks) requires rapid lookup by name, control area, and operational status. This component reproduces the table layout found in the production route (`src/app/admin/plants/page.tsx`), providing:
- Real-time client-side substring search by Plant Name and Region.
- Multi-state dropdown filter (`ALL`, `ACTIVE`, `MAINTENANCE`, `OFFLINE`).
- Fully local React component state management (no server mutations).
- Semantic HTML table structure (`table`, `thead`, `tbody`, `th`, `tr`, `td`) with full accessibility.
- Dedicated zero-results fallback state with a one-click "Clear Filters" action.

---

## 2. TypeScript Data Model

The plant record schema matches the core attributes of Indian renewable generation assets:

```typescript
export interface PlantRecord {
  id: string;
  name: string;
  type: 'SOLAR' | 'WIND' | 'HYBRID';
  region: string;
  capacityMw: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'OFFLINE';
  poolingStation?: string;
}

export interface AdminPlantsTableProps {
  theme?: 'dark' | 'light';
}
```

### Initial Training Fixture (`INITIAL_PLANTS`):
Ten initial plant records were created representing real grid entities across Madhya Pradesh, Gujarat, Rajasthan, and Maharashtra:
1. `220_33KV_BAKTAPUR` — SOLAR (278 MW), MP
2. `400KV_NAGDA` — SOLAR (85 MW), MP
3. `33_KV_LASOOR` — SOLAR (5.1 MW), MH
4. `ABReL_SPV2_(Malotra)` — SOLAR (86.3 MW), GJ
5. `CHARANKA_SOLAR_PARK` — SOLAR (600 MW), GJ
6. `BHADLA_SOLAR_PARK` — SOLAR (2245 MW), RJ
7. `DHIRUBHAI_AMBANI_SOLAR` — SOLAR (125 MW), RJ, Status: `MAINTENANCE`
8. `REWAS_SOLAR_PARK` — SOLAR (750 MW), MP
9. `SAKRI_SOLAR_PLANT` — SOLAR (125 MW), MH, Status: `OFFLINE`
10. `KUTCH_HYBRID_PARK` — HYBRID (1500 MW), GJ

---

## 3. Local State Filtering & Search Engine

The table uses React's `useMemo` hook to compute filtered rows efficiently whenever the user modifies search keywords or the status dropdown:

```tsx
const filteredPlants = useMemo(() => {
  return plants.filter((plant) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      plant.name.toLowerCase().includes(query) ||
      plant.region.toLowerCase().includes(query) ||
      (plant.poolingStation && plant.poolingStation.toLowerCase().includes(query));

    const matchesStatus = statusFilter === 'ALL' || plant.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
}, [plants, searchQuery, statusFilter]);
```

### Key Technical Properties:
- **Zero Latency:** Local component state (`useState`) handles all filter transitions instantaneously with no unnecessary network round-trips.
- **Combined Predicate:** Evaluates both substring search and status matching in a single pipeline.
- **Case-Insensitive:** Converts user input and fields to lowercase for friction-free typing.

---

## 4. Semantic Markup and Empty States

### Semantic Headings:
The table uses standard semantic HTML elements with distinct column headers:
- `PLANT NAME`
- `TYPE`
- `REGION / STATE`
- `CAPACITY (MW)`
- `STATUS`
- `POOLING SUBSTATION`
- `ACTIONS` (Edit / Delete)

### Empty-Search Fallback State:
When a query produces no matches (e.g., searching for `"NonExistentPlant"`), the table displays a custom zero-results card rather than a blank or broken grid:

```tsx
{filteredPlants.length === 0 && (
  <div style={{ textAlign: 'center', padding: '36px 16px', backgroundColor: isLight ? '#f9fafb' : '#0d0d10', borderRadius: '8px', border: `1px dashed ${C.border}`, margin: '16px 0' }}>
    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</div>
    <div style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>No matching plants found</div>
    <div style={{ fontSize: '11px', color: C.muted, marginTop: '4px' }}>
      No plants matched "{searchQuery}" with status "{statusFilter}".
    </div>
    <button
      onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }}
      style={{ marginTop: '12px', background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
    >
      Reset Filters
    </button>
  </div>
)}
```

---

## 5. Summary of Acceptance Criteria Met

| Syllabus Requirement | Status | Evidence |
|---|---|---|
| Typed list/table in training area | **Passed** | `PlantRecord` interface with 10 typed records. |
| Plant Name, Type, Region, Status | **Passed** | Rendered with color-coded type & status pills. |
| Add Search and Status Filter | **Passed** | Live text input + select dropdown (`ALL`, `ACTIVE`, `MAINTENANCE`, `OFFLINE`). |
| Local Component State Only | **Passed** | Uses `useState` / `useMemo`; zero mutation requests sent to production backend. |
| Semantic Headings & Accessibility | **Passed** | Semantic `table`, `thead`, `tbody`, `th`, `td` with proper scope and contrast. |
| Empty-Search Case Handled | **Passed** | Illustrated with icon, explanation, and "Reset Filters" action. |

---

## 6. Build and Runtime Verification

- **Component:** `src/components/admin/AdminPlantsTable.tsx`
- **TypeScript Check:** Strict typing satisfied; no `any` types used.
- **Vite Production Build:** Successfully compiled with 0 errors.

