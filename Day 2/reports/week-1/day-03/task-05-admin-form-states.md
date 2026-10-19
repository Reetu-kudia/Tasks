# Task 05: Practice Forms, Field-Level Validation, and Confirmation UX

**Module:** 3 — Login/session concepts and admin-facing UI  
**Sprint/Day:** Week 1, Day 03  
**Task:** 05 — Practice forms and confirmation UX  
**Status:** Completed  
**Deliverable Path:** `reports/week-1/day-03/task-05-admin-form-states.md`  
**Implemented Component:** `src/components/admin/AdminPlantsTable.tsx` (Embedded Form & Confirmation Modal)

---

## 1. Executive Summary

This task implements an administrative form submission workflow designed around **defensive UX principles**:
1. Synchronous, field-level input validation before submission.
2. Distinct visual presentation for valid vs. invalid field states.
3. Two-stage confirmation dialog UX before applying state changes.
4. Safe cancellation semantics guaranteeing zero accidental mutations.
5. Strict local sandbox execution (no live backend mutation endpoints invoked).

The implementation is integrated into `AdminPlantsTable.tsx` in `src/components/admin/AdminPlantsTable.tsx`, allowing administrators to create new generation assets or edit existing records safely.

---

## 2. Form Architecture & Local State Management

The form utilizes local component state to handle form inputs, field-level errors, confirmation modals, and feedback toasts:

```typescript
// Modal & Editing Target State
const [isModalOpen, setIsModalOpen] = useState(false);
const [editingPlant, setEditingPlant] = useState<PlantRecord | null>(null);

// Form Fields Model
const [formData, setFormData] = useState({
  name: '',
  type: 'SOLAR' as 'SOLAR' | 'WIND' | 'HYBRID',
  region: 'Maharashtra',
  capacityMw: '',
  status: 'ACTIVE' as 'ACTIVE' | 'MAINTENANCE' | 'OFFLINE',
  poolingStation: '',
});

// Field-Level Validation Errors
const [fieldErrors, setFieldErrors] = useState<{
  name?: string;
  capacityMw?: string;
  region?: string;
}>({});

// Two-Stage Confirmation Dialog Trigger
const [showConfirmDialog, setShowConfirmDialog] = useState(false);

// Post-Submission Visual Feedback
const [toastMessage, setToastMessage] = useState<string | null>(null);
```

---

## 3. Field-Level Validation Rules

Validation runs synchronously when the user clicks **"Review & Save"**:

```tsx
const validateForm = () => {
  const errors: { name?: string; capacityMw?: string; region?: string } = {};

  // Rule 1: Plant Name required and cannot be empty string
  if (!formData.name.trim()) {
    errors.name = 'Plant Name is required and cannot be blank.';
  }

  // Rule 2: Capacity must be a finite, strictly positive number (> 0 MW)
  const capNum = parseFloat(formData.capacityMw);
  if (!formData.capacityMw || isNaN(capNum) || capNum <= 0) {
    errors.capacityMw = 'Installed capacity must be a positive number (> 0 MW).';
  }

  // Rule 3: Region is required
  if (!formData.region.trim()) {
    errors.region = 'State / Region is required.';
  }

  setFieldErrors(errors);
  return Object.keys(errors).length === 0;
};
```

### Visual Error Treatment:
When validation fails:
- The input border turns red (`#ef4444`).
- A dedicated error message appears directly beneath the offending input field in bold red text (`fontSize: 10px`).
- The submission process is halted immediately, and the confirmation dialog is **not** displayed.

---

## 4. Two-Stage Confirmation Dialog UX

To prevent accidental data modification in mission-critical grid environments, valid submissions trigger a dedicated **Confirmation Dialog Modal**:

```
┌──────────────────────────────────────────────────────────────┐
│  Confirm Plant Registration                                  │
├──────────────────────────────────────────────────────────────┤
│  Are you sure you want to add this plant to the registry?   │
│                                                              │
│  • Plant Name:  PAVAGADA_SOLAR_PARK                          │
│  • Type:        SOLAR                                        │
│  • Region:      Karnataka                                    │
│  • Capacity:    2050 MW                                      │
│  • Status:      ACTIVE                                       │
│                                                              │
│  [ Cancel / Go Back ]              [ Yes, Confirm & Save ]   │
└──────────────────────────────────────────────────────────────┘
```

### Technical Workflow:
1. User clicks **"Review & Save"** in the edit form.
2. If `validateForm()` passes, `setShowConfirmDialog(true)` displays the confirmation modal.
3. If the user clicks **"Yes, Confirm & Save"**:
   - For **Create:** A new record with a unique `Date.now()` ID is prepended to `plants`.
   - For **Edit:** The existing plant is updated in-place via an immutable map.
   - A transient green success toast appears at the bottom-right for 3.5 seconds.
   - All modals are closed.

---

## 5. Safe Cancellation UX Guarantee

A primary acceptance criterion of Task 5 is that cancelling leaves the data list completely unchanged:

```tsx
const handleCancel = () => {
  setIsModalOpen(false);
  setShowConfirmDialog(false);
  setFieldErrors({});
  // `plants` state is completely untouched
};
```

### Verified Behaviors:
- Clicking **"Cancel"** in the main form closes the form modal without altering `plants`.
- Clicking the top-right **"✕"** button closes without side effects.
- Clicking **"Back to Edit"** in the confirmation dialog returns the user to the form with all typed values preserved.
- Clicking the dark backdrop overlay safely cancels without mutations.

---

## 6. Valid vs. Invalid Outcomes Comparison

| Scenario | User Action | System Outcome |
|---|---|---|
| **Empty Name** | Clicks "Review & Save" with blank name | Blocked. Shows *"Plant Name is required and cannot be blank."* Red border on input. No confirmation dialog. List unchanged. |
| **Negative Capacity** | Enters `-50` in Capacity | Blocked. Shows *"Installed capacity must be a positive number (> 0 MW)."* Red border on input. List unchanged. |
| **Valid Record** | Enters `"PAVAGADA_SOLAR_PARK"`, `2050` MW | Validation passes. Shows Confirmation Dialog with summary. Upon confirmation, record is added and green toast appears. |
| **User Cancels** | Opens edit modal, types changes, clicks "Cancel" | Modals close. Record remains in its original state with no changes applied. |

---

## 7. No Real Mutation Endpoint Invocation

In accordance with sandbox safety rules:
- No `fetch()`, `axios`, or REST `POST`/`PUT`/`DELETE` calls are made to backend endpoints (`/api/admin/plants`).
- All state modifications occur strictly within the component's React memory (`useState<PlantRecord[]>`).
- Reloading the page resets the table cleanly back to `INITIAL_PLANTS`.

---

## 8. Verification and Build Status

- **Component:** `src/components/admin/AdminPlantsTable.tsx`
- **Container View:** `src/views/AdminShellView.tsx`
- **TypeScript Verification:** Passed (`tsc --noEmit` exited 0).
- **Vite Production Build:** Successfully bundled without errors.
