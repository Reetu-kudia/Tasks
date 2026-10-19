# Day 6 — Task 02: Focused Tests for the Training Slice

**Deliverable Path:** `reports/week-1/day-06/task-02-focused-tests.md`  
**Context:** GRID-IITB Renewable Energy Forecasting Portal  
**Test Module:** `Day 6/src/focused-tests.ts`  
**Test Runner:** `Day 6/src/run-focused-tests.cjs`  
**Author:** Training Engineer  
**Date:** 2026-10-19  

---

## 1. Executive Summary & Objective

In modern continuous integration (CI) workflows, running massive end-to-end integration suites across every commit is slow and prone to flakiness caused by external network dependencies or shared service outages. 

The objective of Task 02 is to design, implement, and execute a **focused, self-contained test suite** specifically targeting the training slice:
1. **Server Authorization & Role Guard Logic:** Verifying role hierarchy ranks, role-based action guards (`canManagePlants`, `canManageRegions`, `canManageFeatures`), hierarchical role creation boundaries (`creatableRoles`), and regional tenancy constraints (`canAccessRegion`).
2. **Input Validation Schemas:** Verifying boundary validation for administrative write payloads (empty names, non-UUID strings, negative capacities, out-of-bounds geographic coordinates, and invalid plant type enums).
3. **Component State Machine & Error Integrity:** Programmatically verifying that API transport failures (HTTP 500 / 401) transition to explicit error states and are **never** treated as successful empty data sets.

> [!IMPORTANT]
> **Safety & Isolation Principle:** These focused tests contain **zero hardcoded credentials**, **zero shared database dependencies**, and **zero external network calls**. They execute purely in-memory, making them 100% repeatable in any isolated environment.

---

## 2. Test Suite Architecture & Coverage Matrix

The test runner in `Day 6/src/run-focused-tests.cjs` evaluates 13 distinct assertions categorized across the three core training slices:

| Test # | Category | Target Function / Module | Test Description | Expected Result | Scenario Type |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **01** | Authorization | `roleRank`, `canManage*` | Super Admin universal permissions | Rank 50, all guards evaluate `true` | Positive |
| **02** | Authorization | `canManageFeatures` | Admin cannot manage feature flags | Guard evaluates `false` (super_admin only) | Negative / Guard |
| **03** | Authorization | `canManageRegions` | Region Admin cannot manage global regions | Guard evaluates `false` (admin+ only) | Negative / Guard |
| **04** | Authorization | `canManagePlants` | State Admin denied administrative operations | All administrative guards evaluate `false` | **Negative Denial** |
| **05** | Authorization | `creatableRoles` | Hierarchical role escalation prevention | Admin cannot create super_admin; state_admin creates none | Security Guard |
| **06** | Tenancy | `canAccessRegion` | Regional tenancy boundary enforcement | Western admin denied access to Northern region | **Negative Tenancy** |
| **07** | Validation | `validatePlantInput` | Valid plant creation payload | Validation passes, returns sanitized object | Positive |
| **08** | Validation | `validatePlantInput` | Empty or whitespace plant name | Fails: `"plantName is required"` | **Negative Input** |
| **09** | Validation | `validatePlantInput` | Malformed non-UUID `regionId` | Fails: `"regionId must be a valid UUID"` | **Negative Input** |
| **10** | Validation | `validatePlantInput` | Negative capacity value (`-50 MW`) | Fails: `"installedCapacityMw must be a positive number"` | **Negative Input** |
| **11** | Validation | `validatePlantInput` | Geographic coordinates exceed limits (`lat: 95°`) | Fails: lat must be between -90 and 90 | **Negative Input** |
| **12** | Validation | `validatePlantInput` | Unsupported generation type (`"COAL"`) | Fails: `"plantType must be either SOLAR or WIND"` | **Negative Input** |
| **13** | State Machine | `transitionViewState` | Server error handling | Status is `error`, data is `null`, never `empty` | **Data Safety** |

---

## 3. Detailed Analysis of Negative & Edge Cases Tested

### 3.1 Authorization Denial Verification (Test 04 & 06)
- **State Admin Denial:** We assert that when an operator authenticated as `state_admin` attempts to manage plants, `canManagePlants(caller)` returns `false`. This proves server-side rejection occurs even if the client UI had rendered the button.
- **Tenancy Boundary:** We assert that when a `region_admin` with `allowedRegionIds: ["reg-western-123"]` calls `canAccessRegion(caller, "reg-northern-999")`, the function returns `false`. This ensures cross-region data leakage is prevented.

### 3.2 Coordinate & Numeric Boundary Verification (Test 10 & 11)
- In the real physical world, renewable plants have physical spatial bounds and positive power outputs:
  - Latitude must reside within $[-90.0, 90.0]$. Supplying $95.0^\circ$ is caught and rejected.
  - Longitude must reside within $[-180.0, 180.0]$. Supplying $220.0^\circ$ is caught and rejected.
  - Generating capacity must be strictly positive ($> 0$). Supplying $-50.0\text{ MW}$ is caught and rejected.

### 3.3 State Machine Error Masking Prevention (Test 13)
- An API failure (such as an HTTP 500 database pool exhaustion) must never transition `status` to `"empty"`.
- We assert:
  ```javascript
  assert.strictEqual(state.status, "error");
  assert.notStrictEqual(state.status, "empty");
  assert.strictEqual(state.error.statusCode, 500);
  ```
  This ensures operators are presented with a clear system alert rather than being misled into believing no assets exist.

---

## 4. Execution Evidence & Terminal Output

### Test Execution Command:
```powershell
node "Day 6\src\run-focused-tests.cjs"
```

### Transcript:
```text
==================================================================
   Day 6 Task 2: Focused Test Suite (Training Slice Verification) 
==================================================================

Test 1: Super Admin role rank is 50 with universal privileges... [PASS]
Test 2: Admin role can manage plants and regions, but NOT features... [PASS]
Test 3: Region Admin role can manage plants, but NOT global regions... [PASS]
Test 4: State Admin role is DENIED plant and region management (Negative Auth Case)... [PASS]
Test 5: Hierarchical role creation prevents privilege escalation... [PASS]
Test 6: Regional tenancy guard denies access to out-of-scope regions (Negative Tenancy Case)... [PASS]
Test 7: Valid plant creation payload passes validation... [PASS]
Test 8: Validation fails when plantName is empty (Negative Validation Case)... [PASS]
Test 9: Validation fails when regionId is not a valid UUID (Negative Validation Case)... [PASS]
Test 10: Validation fails when capacity is negative or zero (Negative Validation Case)... [PASS]
Test 11: Validation fails when coordinates exceed geographic boundaries (Negative Validation Case)... [PASS]
Test 12: Validation fails for unsupported plant types (Negative Validation Case)... [PASS]
Test 13: Component state transitions to error and NEVER masks failure as empty data... [PASS]

==================================================================
   ALL 13/13 FOCUSED TESTS PASSED SUCCESSFULLY!          
==================================================================
```

---

## 5. Conclusion & Deliverable Status

Task 02 establishes a robust, fast-running, and isolated verification test harness. With 13 test cases covering positive paths, security authorization denials, input schema bounds, and state machine integrity, the training slice is thoroughly guarded against regressions without relying on brittle external services.

