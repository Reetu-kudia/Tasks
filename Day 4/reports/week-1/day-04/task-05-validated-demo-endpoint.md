# Day 4 · Task 5: Validated Demo API Operation

**Platform:** GRID-INDIA IITB (GI-IITB) Renewable Energy Forecasting Platform  
**Report Date:** 2026-10-19  
**Implementation Source:** [`Day 4/src/demo-endpoint.ts`](file:///c:/IIT/Tasks/Day%204/src/demo-endpoint.ts) & [`Day 4/src/demo-endpoint.js`](file:///c:/IIT/Tasks/Day%204/src/demo-endpoint.js)  
**Test Suite Runner:** [`Day 4/src/test-demo-endpoint.cjs`](file:///c:/IIT/Tasks/Day%204/src/test-demo-endpoint.cjs)  
**Postman Verification:** [`Day 4/grid-iitb-sanitized.postman_collection.json`](file:///c:/IIT/Tasks/Day%204/grid-iitb-sanitized.postman_collection.json)  
**Deliverable Target:** `reports/week-1/day-04/task-05-validated-demo-endpoint.md`

---

## 1. Objectives & Compliance Guardrails

In compliance with the training guidelines:
- **Sandbox Boundary:** Created strictly within the training sandbox environment (`c:\IIT\Tasks\Day 4\src\demo-endpoint.ts`).
- **Zero Production Mutations:** Read-only / fixture-backed operational logic. Does not call mutation endpoints or modify persistent production database state.
- **Strict Server-Side Validation:** Enforces runtime type checks, regular expressions, and bounded ranges on all incoming request fields.
- **Sanitized Secrets:** No hard-coded credentials, private API keys, or database connection strings.

---

## 2. API Contract Specification

* **HTTP Method:** `POST`
* **Route Path:** `/api/training/telemetry-inspect`
* **Content-Type:** `application/json`

### Request Schema

| Field Name | Type | Mandatory? | Validation Rule | Description |
| :--- | :---: | :---: | :--- | :--- |
| `plantCode` | `string` | **Yes** | Uppercase alphanumeric + underscore, length `4..32`. Regex: `/^[A-Z0-9_]{4,32}$/` | Monitored generation asset identifier (e.g. `ACL_PSS3_KPS1_S`). |
| `date` | `string` | **Yes** | ISO-8601 Date regex: `/^\d{4}-\d{2}-\d{2}$/` | Target dispatch forecast date (e.g. `2026-10-19`). |
| `region` | `string` | **Yes** | Enum: `["GJ", "MH", "MP", "CG", "ISTS"]` | Territorial control area jurisdiction. |
| `blockCount` | `number` | No | Integer between `1` and `96`. Default: `96`. | Number of 15-minute operational dispatch blocks to synthesize. |
| `model` | `string` | No | Enum: `["NOWCASTING", "INTRA", "MEDIUM", "ENSEMBLE"]`. Default: `NOWCASTING`. | Predictive forecasting model pipeline. |

---

## 3. Success vs Failure Payloads

### A. Valid Request (`200 OK`)

**Request Payload:**
```json
{
  "plantCode": "ACL_PSS3_KPS1_S",
  "date": "2026-10-19",
  "region": "GJ",
  "model": "NOWCASTING",
  "blockCount": 96
}
```

**Response Payload (`HTTP 200 OK`):**
```json
{
  "ok": true,
  "data": {
    "plantCode": "ACL_PSS3_KPS1_S",
    "region": "GJ",
    "date": "2026-10-19",
    "model": "NOWCASTING",
    "blockCount": 96,
    "summary": {
      "peakPredMw": 280.0,
      "peakActualMw": 268.4,
      "avgCoveragePct": 100.0,
      "telemetryStatus": "NORMAL"
    },
    "blocks": [
      {
        "blockIndex": 1,
        "timeIst": "00:00",
        "ghiWm2": 0,
        "powerPredMw": 0.0,
        "powerActualMw": 0.0
      },
      {
        "blockIndex": 48,
        "timeIst": "12:00",
        "ghiWm2": 850,
        "powerPredMw": 280.0,
        "powerActualMw": 268.4
      }
    ]
  }
}
```

---

### B. Invalid Request: Malformed Date (`400 Bad Request`)

**Request Payload:**
```json
{
  "plantCode": "ACL_PSS3_KPS1_S",
  "date": "19-10-2026",
  "region": "GJ"
}
```

**Response Payload (`HTTP 400 Bad Request`):**
```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "field": "date",
    "message": "Field \"date\" must follow YYYY-MM-DD format (e.g. 2026-10-19). Received: \"19-10-2026\""
  }
}
```

---

### C. Invalid Request: Unknown Region (`400 Bad Request`)

**Request Payload:**
```json
{
  "plantCode": "ACL_PSS3_KPS1_S",
  "date": "2026-10-19",
  "region": "UNKNOWN_REGION"
}
```

**Response Payload (`HTTP 400 Bad Request`):**
```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "field": "region",
    "message": "Invalid region: \"UNKNOWN_REGION\". Permitted control areas: GJ, MH, MP, CG, ISTS."
  }
}
```

---

## 4. Test Suite Execution & Verification Results

The automated test suite (`Day 4/src/test-demo-endpoint.cjs`) exercises both valid inputs and comprehensive negative cases:

```bash
node "c:\IIT\Tasks\Day 4\src\test-demo-endpoint.cjs"
```

### Execution Output:
```text
===============================================================
GRID-IITB Day 4 Task 5: Server-Side Validation Test Suite
===============================================================

[PASS] TC-1: Valid payload with 96 blocks (GJ region)
       HTTP 200 -> Data items generated: 96
[PASS] TC-2: Valid minimal payload (defaults to 96 blocks, NOWCASTING)
       HTTP 200 -> Data items generated: 96
[PASS] TC-3: Missing plantCode
       HTTP 400 -> Field "plantCode" is required and must be a string.
[PASS] TC-4: Malformed date format (19-10-2026 instead of 2026-10-19)
       HTTP 400 -> Field "date" must follow YYYY-MM-DD format (e.g. 2026-10-19). Received: "19-10-2026"
[PASS] TC-5: Invalid region (XYZ)
       HTTP 400 -> Invalid region: "XYZ". Permitted control areas: GJ, MH, MP, CG, ISTS.
[PASS] TC-6: Out-of-bounds blockCount (150 > 96)
       HTTP 400 -> Field "blockCount" must be an integer between 1 and 96. Received: 150
[PASS] TC-7: Unsupported forecasting model (QUANTUM_AI)
       HTTP 400 -> Invalid forecasting model: "QUANTUM_AI". Permitted: NOWCASTING, INTRA, MEDIUM, ENSEMBLE.

---------------------------------------------------------------
Results: 7 PASSED, 0 FAILED out of 7 tests.
---------------------------------------------------------------
```

---

## 5. Postman Integration

The request definitions for both valid and invalid test cases are integrated into [`Day 4/grid-iitb-sanitized.postman_collection.json`](file:///c:/IIT/Tasks/Day%204/grid-iitb-sanitized.postman_collection.json) under folder **"4. Validated Demo API Operation (Task 5)"**.

Developers can import the collection directly into Postman to test:
1. Valid 96-block generation returns `200 OK`.
2. Invalid date format returns `400 Bad Request` with target field `"date"`.
3. Unknown region code returns `400 Bad Request` with target field `"region"`.

