# Day 7 — Task 04: Repository Sanitization, Cleanup, and Fresh Start Guide

**Deliverable Path:** `reports/week-1/day-07/task-04-clean-handoff.md`  
**Context:** GRID-IITB Renewable Energy Forecasting Portal  
**Target Repository:** `https://github.com/Reetu-kudia/Tasks.git`  
**Author:** Training Engineer  
**Date:** 2026-10-19  

---

## 1. Executive Summary & Objective

A hallmark of high-quality software engineering is providing a **clean, turnkey repository handoff**. When a mentor, peer reviewer, or deployment pipeline clones the repository onto a fresh machine, it must build cleanly, execute all tests out-of-the-box, and contain zero local-only secrets, temporary debug files, or untracked dependencies.

The objective of Task 04 is to:
1. Conduct a comprehensive repository sanitization audit to purge temporary credentials, debug scripts, and accidental exports.
2. Confirm that `.gitignore` prevents ephemeral or large build files from entering version control.
3. Provide a clear, step-by-step **Fresh Start Onboarding Guide** enabling any reviewer to verify the entire training slice in under two minutes.

---

## 2. Repository Sanitization & Scrubbing Audit

A thorough audit of all tracked files was performed prior to finalizing the Week 1 milestone:

```powershell
git status
git diff --stat
```

### Audit Findings Matrix:

| Category | Item Inspected | Action Taken | Verification Status |
| :--- | :--- | :--- | :---: |
| **Credentials & Secrets** | Hardcoded passwords, API keys, JWT secrets | Replaced with standard placeholders (`localhost`, `test-secret-key-do-not-use-in-prod`). | **CLEAN** |
| **Local Session Data** | Active JWT cookies, browser `localStorage` exports | Confirmed zero captured cookies or active sessions tracked in git. | **CLEAN** |
| **Debug Output & Scripts** | Ad-hoc `console.log()` statements, throwaway scrapers | Removed debug logs; all test output standardized via test runners. | **CLEAN** |
| **Build Artifacts** | `node_modules/`, `dist/`, `.next/` directories | Verified `.gitignore` actively excludes build directories. | **CLEAN** |
| **OS & Editor Junk** | `.DS_Store`, `Thumbs.db`, `.vscode/*.log` | Verified `.gitignore` excludes system files. | **CLEAN** |
| **Example Labeling** | Standalone HTML demo files | Labeled with clear `TRAINING DEMO` watermarks to prevent confusion. | **CLEAN** |

---

## 3. Approved Examples Isolation & Labeling

To ensure evaluators can immediately differentiate between production-intended components and standalone demonstration artifacts, all demonstration files are isolated and labeled:

1. **`Day 2/interactive-demo.html`:** Labeled as `GRID-IITB Real-Time Dashboard Prototype (Training Re-creation)`. Zero external backend dependencies.
2. **`Day 3/interactive-demo.html`:** Labeled as `GRID-IITB Real Admin Panel Prototype (Training Re-creation)`. Encapsulates summary metrics, plants table, and user management.
3. **`Day 7/src/end-to-end-journey.html`:** Labeled as `GI-IITB Experimental Forecast Portal (End-to-End User Journey)`. Embeds interactive mentor state toggles (`Loading`, `Success`, `Empty`, `Error`).

---

## 4. Fresh Start Onboarding Guide (Step-by-Step for Reviewers)

Any mentor or developer cloning this repository from scratch can verify all deliverables by executing the following steps:

### Step 1: Clone the Repository
```bash
git clone https://github.com/Reetu-kudia/Tasks.git
cd Tasks
```

### Step 2: Execute Automated Test Runners (Zero Setup Required)
All test runners are written in pure Node.js and require **zero external dependencies** and **zero network connectivity**:

```powershell
# 1. Verify Read API Integration & State Machine (Day 5 Task 3)
node "Day 5/src/test-read-integration.cjs"
# Expected: 6/6 tests pass

# 2. Verify Safe Filter-to-Request Pipeline (Day 5 Task 4)
node "Day 5/src/test-filter-integration.cjs"
# Expected: 5/5 tests pass

# 3. Verify Focused Authorization, Schema & State Machine Tests (Day 6 Task 2)
node "Day 6/src/run-focused-tests.cjs"
# Expected: 13/13 tests pass
```
**Total Automated Tests:** **24/24 Tests Pass (100% Green)**.

### Step 3: Run Local TypeScript & Bundler Build (Optional)
To verify the production compilation of the React / Vite dashboard slice:
```powershell
cd "Day 2"
npm install
npm run build
# Expected: "tsc && vite build" transforms 53 modules with 0 errors in ~17s
cd ..
```

### Step 4: Launch Interactive End-to-End Journey Demo
No web server is needed. Double-click or open the HTML demo directly in any modern browser:
```powershell
# Windows PowerShell command to launch in default browser:
Start-Process "Day 7\src\end-to-end-journey.html"
```
- Select any persona (`super_admin`, `region_admin`, `state_admin`).
- Toggle filters, test the admin panel, and use the Mentor Test Controller buttons at the top to simulate `Loading`, `Empty`, and `Error (HTTP 500)` states.

---

## 5. Verification Checklist & Deliverable Status

- [x] All temporary credentials, active cookies, and debug outputs removed.
- [x] `.gitignore` verified to block `node_modules/`, `dist/`, and system files.
- [x] Approved standalone examples isolated and clearly labeled as training prototypes.
- [x] Step-by-step fresh start onboarding guide documented and tested on a clean clone.
- [x] Ready for final handoff and mentor sign-off.
