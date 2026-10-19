# Day 4 · Task 2: Sanitized Postman Collection

**Platform:** GRID-INDIA IITB (GI-IITB) Renewable Energy Forecasting Platform  
**Report Date:** 2026-10-19  
**Deliverable Target:** `reports/week-1/day-04/task-02-postman-collection.md`  
**Executable Collection:** [`Day 4/grid-iitb-sanitized.postman_collection.json`](file:///c:/IIT/Tasks/Day%204/grid-iitb-sanitized.postman_collection.json)

---

## 1. Objectives & Sanitization Philosophy

In power-grid operational and critical infrastructure software, exporting Postman collections containing active JWT tokens, production API keys, or live user credentials poses severe cybersecurity risks.

This collection adheres to the following sanitization policies:
1. **Empty Secret Placeholders:** Variables `authToken` and `testPassword` are set to empty strings (`""`) by default.
2. **Localhost & Test Environments:** Target `baseUrl` defaults to local training (`http://localhost:3000`).
3. **Automated Test Scripts:** The login request uses Postman's client-side test sandbox to auto-capture the JWT token into a temporary session variable upon successful authentication, eliminating the need to copy-paste tokens.
4. **Permitted Read Scopes Only:** Includes read-only queries (`GET /api/regions`, `GET /api/plants`) rather than destructive mutation endpoints.

---

## 2. Environment Variables Specification

| Variable Key | Initial Value (Safe for Export) | Current Value (Local Test Only) | Purpose |
| :--- | :---: | :---: | :--- |
| `baseUrl` | `http://localhost:3000` | `http://localhost:3000` | Local development and proxy server root. |
| `testUsername` | `admin` | `admin` | Test operator username for local sandbox login. |
| `testPassword` | `""` *(empty)* | *(entered locally at test time)* | Password placeholder; never exported to Git. |
| `authToken` | `""` *(empty)* | *(auto-set by Login script)* | Temporary Bearer JWT token stored in memory. |

---

## 3. Ordered Requests Documentation

### Request 1: Health Probe (DB & Service Readiness)
* **Method:** `GET`
* **URL:** `{{baseUrl}}/api/health`
* **Headers:** `Accept: application/json`
* **Auth Requirement:** None (Public)
* **Expected Status:** `200 OK`
* **Expected Response Shape:**
  ```json
  {
    "ok": true,
    "ts": "2026-10-19T08:30:00.000Z"
  }
  ```
* **Degraded Fallback Shape (DB offline):**
  ```json
  {
    "ok": true,
    "db": "degraded",
    "ts": "2026-10-19T08:30:00.000Z"
  }
  ```

---

### Request 2: Operator Login (Issue Token & Cookie)
* **Method:** `POST`
* **URL:** `{{baseUrl}}/api/auth`
* **Headers:**
  - `Content-Type: application/json`
  - `Accept: application/json`
* **Request Body:**
  ```json
  {
    "username": "{{testUsername}}",
    "password": "{{testPassword}}"
  }
  ```
* **Auth Requirement:** None (Public authentication gateway)
* **Expected Status:** `200 OK`
* **Response Header:** `Set-Cookie: token=eyJhbGci...; Path=/; HttpOnly; SameSite=Lax`
* **Expected Response Shape:**
  ```json
  {
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "role": "super_admin",
      "uname": "admin",
      "displayName": "National Despatch Lead"
    }
  }
  ```
* **Postman Auto-Extract Test Script:**
  ```javascript
  if (pm.response.code === 200) {
    const json = pm.response.json();
    if (json.data && json.data.token) {
      pm.collectionVariables.set("authToken", json.data.token);
      console.log("Session token captured successfully.");
    }
  }
  ```

---

### Request 3: System Maintenance Status
* **Method:** `GET`
* **URL:** `{{baseUrl}}/api/status`
* **Headers:** `Accept: application/json`
* **Auth Requirement:** None (Public)
* **Expected Status:** `200 OK`
* **Expected Response Shape:**
  ```json
  {
    "maintenance": false
  }
  ```

---

### Request 4: Get Authorized Regions (Permitted Read)
* **Method:** `GET`
* **URL:** `{{baseUrl}}/api/regions`
* **Headers:**
  - `Authorization: Bearer {{authToken}}`
  - `Accept: application/json`
* **Auth Requirement:** Authenticated (Requires valid token or cookie)
* **Expected Status:** `200 OK`
* **Expected Response Shape:**
  ```json
  {
    "data": {
      "items": [
        {
          "regionId": "d290f1ee-6c54-4b01-90e6-d701748f0851",
          "regionCode": "GJ",
          "regionName": "Gujarat SLDC",
          "regionType": "state"
        },
        {
          "regionId": "c180e2aa-5b43-4a00-80e5-c601637e0740",
          "regionCode": "MH",
          "regionName": "Maharashtra SLDC",
          "regionType": "state"
        },
        {
          "regionId": "b070d199-4a32-49ff-70d4-b500526d0630",
          "regionCode": "WR-ISTS",
          "regionName": "Western Region ISTS",
          "regionType": "ists"
        }
      ]
    }
  }
  ```

---

## 4. Verification in Postman

1. Open Postman.
2. Click **Import** -> Select [`Day 4/grid-iitb-sanitized.postman_collection.json`](file:///c:/IIT/Tasks/Day%204/grid-iitb-sanitized.postman_collection.json).
3. Under collection variables, verify that `testPassword` and `authToken` are empty.
4. Execute `Health Probe` -> verify `200 OK`.
5. Enter local password into `testPassword` variable -> Execute `Operator Login` -> token is automatically populated into `{{authToken}}`.
6. Execute `Get Authorized Regions` -> verify `200 OK` with territorial jurisdiction items.
