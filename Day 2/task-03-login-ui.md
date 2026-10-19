# Task 03: Recreate Login and Theme States as a UI Exercise

**Module:** 2 — Recreate the portal's frontend foundation  
**Sprint/Day:** Week 1, Day 02  
**Task:** 03 — Recreate login and theme states as a UI exercise  
**Status:** Completed  
**Deliverable Path:** `reports/week-1/day-02/task-03-login-ui.md`  

---

## 1. Executive Summary & Objective

The objective of **Task 03** is to recreate the **Login Page Experience** (View A) of the GRID-INDIA IIT Bombay (GI-IITB) portal as an isolated, accessible, and strictly non-persistent UI exercise.

Based on the live portal design:
* **Visual Identity:** Split-screen layout featuring a 3D Earth telemetry sphere with solar irradiance annotations on the left, paired with a floating, high-contrast dark card on the right.
* **Form Hierarchy:** Explicit labeled inputs (`Username`, `Password`), an accessible password visibility toggle (`🙈` / `👁️`), an energetic amber submit button (`#f59e0b`), and live validation banners.
* **Security & Non-Persistence Guarantee:** Adheres strictly to security requirements:
  * No real credential check is performed.
  * Passwords and usernames are strictly ephemeral in component React state (`useState`).
  * Zero credentials are written to `localStorage`, `sessionStorage`, cookies, or browser caches.
  * Zero credentials are emitted to `console.log` or remote telemetry.
  * Success is explicitly labeled as **[Mock Success Verified]**.

---

## 2. Acceptance Criteria & Verification Matrix

| Acceptance Criteria | Requirement Specification | Implementation Details | Status |
| :--- | :--- | :--- | :--- |
| **Existing Hierarchy & Style** | Match login form hierarchy, field labels, typography, and card style. | Implemented in `LoginShellView.tsx` matching View A audit with 12px card border-radius, `#141414` card surface, and uppercase field labels. | ✅ PASSED |
| **Labeled Fields** | Form inputs have explicit, accessible labels. | `<label htmlFor="login-username">` and `<label htmlFor="login-password">` with high-contrast text and keyboard focus indicators. | ✅ PASSED |
| **Show/Hide Password** | Interactive toggle between masked and plain text password. | Toggle button changes `type="password"` to `type="text"` with accessible `aria-label`. | ✅ PASSED |
| **Submit / Loading State** | Visual loading indicator when user submits. | Button shows animated spinner, darkens to amber `#92400e`, and changes text to *"Authenticating Mock Session..."* with `disabled={true}`. | ✅ PASSED |
| **Validation Messages** | Clear error messages when required inputs are empty or invalid. | Accessible alert banner (`role="alert"`) displays error details and highlights empty fields with `#ef4444` borders. | ✅ PASSED |
| **Theme Toggle Integration** | Theme toggle available and functions smoothly. | Dark mode (`#090909`) and Light mode (`#f4f4f5`) supported with seamless CSS color transitions. | ✅ PASSED |
| **Mock-Only Success Labeling** | Simulated success is clearly labeled as mock. | Green banner (`#10b981`) explicitly announces *"Mock Success Verified (Simulation approved)"*. | ✅ PASSED |
| **Zero Storage & Log Leakage** | No credentials persisted or logged. | Code audit verifies 0 `localStorage` writes, 0 `sessionStorage` writes, and 0 `console.log` statements for credentials. | ✅ PASSED |

---

## 3. UI State Demonstration & State Matrix

To provide instructors and code reviewers with immediate verification capability, a **Task 03 State Simulator Bar** was embedded directly above the login view:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 🧪 Task 03 State Simulator:                                                      │
│ [1. Empty State] [2. Loading State] [3. Error State] [4. Mock Success] [Reset]  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Detailed State Breakdown:

1. **State 1 — Empty / Idle State:**
   - Fields: Username and Password inputs are empty or blank.
   - Behavior: If the user attempts submission, form triggers instant accessible client-side validation: *"Please fill in both username and password fields to continue."*
   
2. **State 2 — Loading State:**
   - Trigger: Occurs upon submitting valid inputs or clicking the simulator button.
   - UI Response: Inputs are disabled (`disabled={true}`), form submit button switches to an animated CSS ring spinner with text *"Authenticating Mock Session..."*.
   - Duration: 1.2 seconds simulated asynchronous delay.

3. **State 3 — Error State:**
   - Trigger: Occurs when submitting empty inputs or testing rejection (e.g. entering `error` as the mock username).
   - UI Response: Renders a high-contrast red alert box (`role="alert"`, `aria-live="assertive"`) with an `<Icons.AlertCircle />` icon: *"Authentication rejected: Unauthorized access token or invalid mock credentials."*

4. **State 4 — Mock-Only Success State:**
   - Trigger: Submitting valid sample credentials (e.g., `superadmin` / `forecast@2026`).
   - UI Response: Displays a green success banner (`role="status"`, `aria-live="polite"`) with `<Icons.CheckCircle />`:
     > `[Mock Success Verified] Simulation approved. Directing to training dashboard...`
   - Navigation: Smoothly redirects to the main forecasting dashboard after a 1.2-second confirmation pause.

---

## 4. Security & Privacy Audit

The codebase was audited to ensure compliance with strict privacy guidelines:

```typescript
// Audited from LoginShellView.tsx:
// 1. Inputs exist only in ephemeral component memory:
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');

// 2. Verified absence of dangerous storage patterns:
// NO: localStorage.setItem('user', ...)
// NO: sessionStorage.setItem('token', ...)
// NO: document.cookie = ...
// NO: console.log({ username, password })
```

---

## 5. Deliverable Files

| File | Path | Role |
| :--- | :--- | :--- |
| **Component Source** | `src/views/LoginShellView.tsx` | Complete Login UI component with 4 interactive states & simulator bar. |
| **Report (Deliverable)** | `reports/week-1/day-02/task-03-login-ui.md` | Formal audit report meeting all training syllabus specifications. |
| **Root Copy** | `task-03-login-ui.md` | Root folder quick-access copy. |

---

## 6. Verification Steps

1. In the browser (`http://localhost:3001` or `interactive-demo.html`), open the **Login View**.
2. Click **"1. Empty State"** and hit **"Authorize & Launch Forecast Dashboard"** to see the accessible validation alert.
3. Click **"2. Loading State"** to inspect the spinner and disabled button state.
4. Click **"3. Error State"** to verify the red alert banner and accessibility attributes.
5. Click **"4. Mock Success State"** or click **"Autofill Sample Operator Credentials"** and submit to watch the full mock authentication and transition to the dashboard.
6. Toggle the **Sun / Moon** icon in the header to inspect login form contrast under both dark and light colorways.

---

## 7. 1:1 Recreation of Authentic GRID-IITB Portal Login Page

Based on the reference screenshot (`media_1792312010290_70690968.png`) and the original production portal codebase (`D:\grid-iitb\src\app\login\page.tsx` & `src/components/ui/globe.tsx`), the Login view was recreated 1:1 with complete fidelity:

1. **Left Visual Area (Photorealistic 3D Earth Globe):**
   - **Three.js Sphere:** Rendered via `<Globe />` with smooth Y-axis auto-rotation, starfield particle system, directional lighting, and mouse drag interaction.
   - **Official Earth Texture:** Uses `/textures/earth_map.jpg` containing the precise longitude/latitude grid overlay and the red equator line.
   - **Branding Logos (Top-Left):**
     - Circular IIT Bombay emblem (`/images/iitb.jpg`) with `IITB` tracking text.
     - GRID-INDIA white rounded card (`/images/grid_india.png`) with `GRID-INDIA` tracking text.
   - **Inspirational Quote (Bottom-Left):**
     - Amber vertical accent pill (`#f59e0b`).
     - White italicized quote: *“Advanced forecasting models for a sustainable energy future.”*

2. **Right Authentication Column:**
   - **Theme Control (Top-Right):** Floating `Theme` toggle button with sun/moon icon.
   - **Header Hierarchy:**
     - `Welcome Back` in bold amber (`#f59e0b`, 32px, font-weight: 800).
     - Subtitle: `Enter your credentials to access the forecast dashboard.` (13px, muted gray `#71717a`).
   - **Card Container:**
     - 14px rounded corners, dark `#111113` surface, `#27272a` 1px border, deep drop shadow.
     - Subheadings: `GI-IITB Experimental Forecast` (white bold) and `NOWCASTING • INTRA • MEDIUM` (amber uppercase, 0.2em letter spacing).
     - Inputs: Form fields matching the screenshot's light-blue/white styling (`#e8edf5`) with dark text (`#0f172a`), explicit `Username` and `Password` labels.
     - Show/Hide Password button: Interactive eye toggle (`👁️` / `🙈`) positioned inside the field.
     - Primary Button: Bright amber `Secure Login` (`#f59e0b`, 42px height, 800 weight), switching to `Signing in...` with spinner on submit.
     - Footer: `Restricted Access • System v3.0`.

3. **Task 03 Training Compliance:**
   - Discreet Task 03 floating simulator pill at top center (`Empty`, `Loading`, `Error`, `Mock Success`, `Reset`).
   - Strict zero-persistence policy: zero credentials written to `localStorage`, zero console logging, and strictly ephemeral component state.



