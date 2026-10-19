# Day 5 — Task 02: Schema and Database Safety Boundaries

**Deliverable Path:** `reports/week-1/day-05/task-02-data-model.md`  
**Context:** GRID-IITB Renewable Energy Forecasting Portal  
**Source Reference:** `D:\grid-iitb\prisma\schema.prisma`  
**Author:** Training Engineer  
**Date:** 2026-10-19  

---

## 1. Executive Summary & Objective

The GRID-IITB forecasting portal is an enterprise mission-critical system serving National Load Despatch Centres (NLDC), Regional Load Despatch Centres (RLDC), and State Load Despatch Centres (SLDC). Its underlying database stores sensitive national electrical grid topology, spatial renewable energy generation capacities, proprietary numerical weather prediction (NWP) machine learning runs, and millions of high-frequency 15-minute time-block generation predictions and actuals.

The objective of this task is twofold:
1. **Analyze and document the data model:** Inspect the relational schema definitions (`prisma/schema.prisma`), identifying all core entities, their primary keys, foreign keys, cascade delete behaviors, index strategies, and user role authorization boundaries.
2. **Establish strict database safety guardrails:** Articulate why production or shared database connections must never be probed, migrated, or mutated during training exercises, and specify the approved test-only isolation sources used for integration.

---

## 2. Complete Entity-Relationship (ER) Architecture

The following Mermaid ER diagram illustrates the core domain models, foreign key associations, junction tables, and operational audit entities defined in `prisma/schema.prisma`.

```mermaid
erDiagram
    User ||--o{ UserRegion : "assigned to"
    Region ||--o{ UserRegion : "assigned to"
    User ||--o{ UserGridRegion : "controls"
    User ||--o{ AuditLog : "generates"
    User ||--o{ User : "created_by"

    Region ||--o{ Plant : "PlantPrimaryRegion"
    Region ||--o{ Plant : "PlantIstsRegion (optional)"
    Region ||--o{ GridRegion : "belongs to"
    Region ||--o{ ForecastRun : "forecasted for"

    Plant ||--o{ MiPrediction : "time series pred"
    Plant ||--o{ WindActual : "actuals"
    ForecastRun ||--o{ MiPrediction : "contains predictions"

    User {
        uuid user_id PK
        string uname UK
        string password "bcrypt hash"
        string display_name
        string email
        string role "super_admin|admin|region_admin|state_admin|ists_admin"
        boolean is_active
        uuid created_by FK
        timestamptz created_at
    }

    Region {
        uuid region_id PK
        string region_code UK "e.g. GJ, MH, NR"
        string region_name
        string region_type "state | ists"
        timestamptz created_at
    }

    UserRegion {
        uuid user_id PK, FK
        uuid region_id PK, FK
    }

    UserGridRegion {
        uuid user_id PK, FK
        string grid_name PK "Western|Northern|Southern"
    }

    GridRegion {
        int id PK
        string grid_name "Western|Northern|Southern"
        uuid region_id FK
    }

    Plant {
        uuid plant_id PK
        string plant_name UK
        uuid region_id FK "Primary Region"
        uuid ists_region_id FK "ISTS Region (nullable)"
        string plant_type "SOLAR | WIND"
        float installed_capacity_mw
        float lat
        float lon
        string pooling_station
        boolean is_active
        uuid created_by
        timestamptz created_at
    }

    ForecastRun {
        uuid run_id PK
        string model_name
        uuid region_id FK
        string revision "R0, R1, etc."
        timestamptz run_t0_utc
        timestamptz run_t0_ist
        string run_t0_raw
        timestamptz created_at
    }

    MiPrediction {
        bigint id PK
        uuid run_id FK
        uuid plant_id FK
        timestamptz valid_time_utc
        timestamptz valid_time_ist
        string valid_time_raw
        float ghi_pred_wm2
        float ghi_actual_wm2
        float power_pred_mw
        float power_actual_mw
        float solar_power_pred_mw
        float solar_power_actual_mw
        float wind_power_pred_mw
        float wind_power_actual_mw
    }

    AuditLog {
        bigint id PK
        uuid user_id FK
        string endpoint
        string method
        string ip
        timestamptz timestamp
    }

    LiveActual {
        bigint id PK
        string plant_name
        string region
        float value_mw
        string quality
        string time_block
        timestamptz recorded_at
        timestamptz fetched_at
    }

    WindActual {
        bigint id PK
        uuid plant_id FK
        timestamptz time_block
        float wind_speed_ms
        float wind_power_mw
        timestamptz fetched_at
    }

    Feature {
        string feature_key PK
        string label
        string description
        boolean enabled
        int sort_order
        timestamptz updated_at
    }

    SystemSetting {
        string key PK
        string value
        timestamptz updated_at
    }

    Notification {
        bigint id PK
        string type "region_deleted | plant_deleted"
        string title
        string body
        uuid actor_id
        string actor_name
        boolean is_read
        timestamptz created_at
    }
```

---

## 3. Detailed Entity and Relationship Breakdown

### 3.1 `User`, Roles, and RBAC Hierarchies
The user management subsystem governs multi-tenant access across regional, state, and inter-state transmission boundaries.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `userId` (`user_id`) | UUID | Primary Key (`gen_random_uuid()`) | Unique system identifier. |
| `uname` | String | Unique (`@unique`), Min 3, Max 50 | Unique login username. |
| `password` | String | Not Null (Bcrypt hash) | Hashed password (12 rounds). |
| `displayName` | String | Optional | Human-readable user name. |
| `email` | String | Optional, Email format | Notification and alert address. |
| `role` | String | Default: `"state_admin"` | Role enum: `super_admin`, `admin`, `region_admin`, `state_admin`, `ists_admin`. |
| `isActive` | Boolean | Default: `true` | Soft-disable switch; disabled users cannot authenticate. |
| `createdBy` | UUID | Foreign Key -> `User.userId` | Creator reference for audit trails. |
| `createdAt` | Timestamptz | Default: `now()` | Registration timestamp. |

#### Role Hierarchy & Junction Tables:
1. **`super_admin` & `admin`:** Full administrative access across all regions, plants, users, and system settings.
2. **`region_admin`:** Scope bounded to specific grid zones (e.g. `"Western"`, `"Northern"`, `"Southern"`).
   - Linked via **`UserGridRegion`** junction table:
     - Composite Primary Key: `[userId, gridName]`.
     - Cascade delete: Deleting a user automatically purges their grid zone assignments.
3. **`state_admin` & `ists_admin`:** Scope bounded to specific state or ISTS regions.
   - Linked via **`UserRegion`** junction table:
     - Composite Primary Key: `[userId, regionId]`.
     - Cascade delete: Foreign keys to `User.userId` and `Region.regionId` both use `onDelete: Cascade`.

---

### 3.2 `Region` & `Plant` Topology
Represents the physical and jurisdictional hierarchy of renewable energy generating stations.

#### `Region` Table (`regions`):
- **Primary Key:** `regionId` (UUID).
- **Unique Constraint:** `regionCode` (`GJ`, `MH`, `RJ`, `NR`, `WR`, etc.).
- **Attributes:** `regionName` (e.g., "Gujarat", "Maharashtra", "Western Region ISTS"), `regionType` (`"state"` | `"ists"`).
- **Relations:** 
  - `plants`: Plants having this region as their primary jurisdictional region.
  - `istsPlants`: Plants assigned to this ISTS region for regional pooling.
  - `forecastRuns`: Forecast model runs calculated for this region.

#### `Plant` Table (`plants`):
- **Primary Key:** `plantId` (UUID).
- **Unique Constraint:** `plantName` is globally unique.
- **Foreign Keys:**
  - `regionId` (UUID, Not Null): References `Region.regionId` (`onDelete: Cascade`).
  - `istsRegionId` (UUID, Nullable): Optional dual-home reference to `Region.regionId` when a state plant is also mapped to an Inter-State Transmission Scheme.
- **Attributes:**
  - `plantType`: `"SOLAR"` | `"WIND"` (default: `"SOLAR"`).
  - `installedCapacityMw`: Float (e.g., 250.0 MW).
  - Spatial coordinates: `lat` (latitude), `lon` (longitude) with boundary limits (-90 to 90, -180 to 180).
  - `poolingStation`: Name of the substation/pooling bus connecting the site to the state/national grid.

---

### 3.3 Time-Series Prediction Engine: `ForecastRun` & `MiPrediction`
The forecasting engine produces periodic 15-minute resolution predictions across multiple revision cycles ($R_0, R_1, \dots$).

#### `ForecastRun` Table (`forecast_runs`):
- **Primary Key:** `runId` (UUID).
- **Foreign Key:** `regionId` -> `Region.regionId` (`onDelete: Cascade`).
- **Composite Unique Index:** `@@unique([modelName, regionId, revision, runT0Utc])`.
  - Prevents duplicate model executions from overwriting a historical run for the same model, region, revision, and base time ($T_0$).
- **Indexes:** Fast lookups on `[modelName, regionId]`, descending index on `runT0Utc`, descending index on `runT0Ist`.

#### `MiPrediction` Table (`mi_predictions`):
- **Primary Key:** `id` (BigInt autoincrement).
- **Foreign Keys:**
  - `runId` (UUID): References `ForecastRun.runId` (`onDelete: Cascade`).
  - `plantId` (UUID): References `Plant.plantId` (`onDelete: Cascade`).
- **Composite Unique Index:** `@@unique([runId, plantId, validTimeUtc])`.
  - Enforces that within any single forecast run, each plant has exactly one prediction per 15-minute time block.
- **Metrics stored:**
  - `ghiPredWm2`, `ghiActualWm2`: Global Horizontal Irradiance ($W/m^2$).
  - `powerPredMw`, `powerActualMw`: Aggregate generation power (MW).
  - Specific solar/wind breakdowns: `solarPowerPredMw`, `windPowerPredMw`.

---

### 3.4 Governance & Operational Logging: `AuditLog` & `Notification`
1. **`AuditLog` (`audit_log`):**
   - **Primary Key:** `id` (BigInt autoincrement).
   - **Foreign Key:** `userId` -> `User.userId` (Nullable).
   - **Fields:** `endpoint`, `method`, `ip`, `timestamp`.
   - **Index:** `@@index([timestamp(sort: Desc)])` for high-throughput chronological compliance audits.
2. **`Notification` (`notifications`):**
   - **Primary Key:** `id` (BigInt autoincrement).
   - **Fields:** `type` (`"region_deleted"` | `"plant_deleted"`), `title`, `body`, `actorId`, `actorName`, `isRead`, `createdAt`.
   - Emitted inside atomic database transactions (`prisma.$transaction`) whenever critical grid resources are removed.

---

## 4. Primary Keys, Foreign Keys & Referential Integrity Matrix

| Entity | Primary Key (PK) | Foreign Keys (FK) | Unique Constraints | Cascade Rules |
| :--- | :--- | :--- | :--- | :--- |
| `User` | `userId` (UUID) | `createdBy` -> `User.userId` | `uname` | Restrict / SetNull on creator delete |
| `Region` | `regionId` (UUID) | None | `regionCode` | Cascade to plants, runs, grid_regions |
| `UserRegion` | `[userId, regionId]` (Composite) | `userId` -> `User`<br>`regionId` -> `Region` | None | `onDelete: Cascade` on both FKs |
| `UserGridRegion` | `[userId, gridName]` (Composite) | `userId` -> `User` | None | `onDelete: Cascade` on user delete |
| `GridRegion` | `id` (Int autoincrement) | `regionId` -> `Region` | `[gridName, regionId]` | `onDelete: Cascade` on region delete |
| `Plant` | `plantId` (UUID) | `regionId` -> `Region`<br>`istsRegionId` -> `Region` | `plantName` | `onDelete: Cascade` on primary region; optional on ISTS |
| `ForecastRun` | `runId` (UUID) | `regionId` -> `Region` | `[modelName, regionId, revision, runT0Utc]` | `onDelete: Cascade` on region delete |
| `MiPrediction` | `id` (BigInt autoincrement) | `runId` -> `ForecastRun`<br>`plantId` -> `Plant` | `[runId, plantId, validTimeUtc]` | `onDelete: Cascade` on run or plant delete |
| `WindActual` | `id` (BigInt autoincrement) | `plantId` -> `Plant` | `[plantId, timeBlock]` | `onDelete: Cascade` on plant delete |
| `AuditLog` | `id` (BigInt autoincrement) | `userId` -> `User` | None | Foreign key without cascade (audit persists) |
| `Feature` | `featureKey` (String) | None | None | N/A |
| `SystemSetting` | `key` (String) | None | None | N/A |

---

## 5. Database Safety Boundaries & Operational Guardrails

### 5.1 Why Running Migrations or Touching Shared/Prod DBs is Strictly Forbidden
In a high-availability forecasting environment, executing database schema migration commands (`prisma migrate dev`, `prisma migrate deploy`, or `prisma db push`) against shared or production environments causes catastrophic operational failure:
1. **Exclusive Table Locks:** Running DDL operations (e.g. `ALTER TABLE`, adding foreign keys, changing column nullability) on TimescaleDB/PostgreSQL hyper-tables containing tens of millions of `mi_predictions` rows acquires exclusive table locks (`AccessExclusiveLock`). This stalls real-time ingestion pipelines from SLDC telemetry and crashes live forecast generation.
2. **Schema Drift & Desynchronization:** If an engineer alters column types or constraints in a shared development database without formal peer review and rollback scripts, other developers and upstream microservices experience deserialization exceptions.
3. **Accidental Data Loss:** Running `prisma db push` on an out-of-sync branch will attempt to drop unmapped columns, partitions, or tables, resulting in unrecoverable destruction of historical telemetry.
4. **Credential Exposure Risk:** Pointing local CLI tools to remote production databases requires transporting production database credentials (`DATABASE_URL`) onto local machines, violating government compliance mandates and security isolation boundaries.

### 5.2 Operational Guardrail Protocol
To ensure 100% database safety during training and feature development, the following operational boundaries are enforced:

| Guardrail Rule | Policy & Enforcement Mechanism |
| :--- | :--- |
| **No Production Connections** | The `DATABASE_URL` in local `.env` files must NEVER point to any production or staging host (`10.x.x.x` or external production domains). |
| **Strict Read-Only Reference** | The reference repository `D:\grid-iitb` is treated strictly as **read-only**. No files or database artifacts inside `D:\grid-iitb` may be edited, generated, or migrated. |
| **No Schema Alterations** | Running `npx prisma db push`, `npx prisma migrate dev`, or raw SQL DDL (`DROP`, `ALTER`, `TRUNCATE`) is blocked without explicit written mentor sign-off. |
| **Zero Secret Storage in Repositories** | No database passwords, connection strings, or JWT secret keys are ever committed to git. All configuration files must use placeholder variables (e.g., `DATABASE_URL="postgresql://user:password@localhost:5432/training_db"`). |

---

## 6. Approved Test-Only Sources for Integration

For the frontend and API integration tasks in Day 5, we utilize strictly approved, safe, test-only sources that do not mutate or endanger live data:

1. **Local Read-Only Fixtures & Mock Routers:**
   - Pre-generated static JSON fixtures reflecting real production response envelopes (`{ data: { items: [...] } }`).
   - Mock API service layer running in memory, simulating network latency, HTTP 200, 400, 401, and 500 error scenarios.
2. **Disposable Local PostgreSQL Container (Optional / Future Staging):**
   - If local database execution is required, an ephemeral Docker container (`docker run -p 5432:5432 postgres:15-alpine`) initialized with sanitized seed scripts (`prisma/seed.ts` containing synthetic plants like "Charanka Solar Park - Block 1") must be used.
   - Any data generated during training is fully disposable.
3. **Sanitized Postman Collection:**
   - Validated against local mock servers or isolated training endpoints using empty placeholders for environment secrets.

---

## 7. Verification Checklist & Mentor Sign-off Criteria

- [x] Schema entities, primary keys, and foreign keys systematically mapped.
- [x] User-to-Region and User-to-Grid junction tables documented with cascade delete semantics.
- [x] Time-series unique constraints (`ForecastRun` and `MiPrediction`) identified.
- [x] Database safety boundaries and risks of unapproved schema migrations explicitly analyzed.
- [x] Approved test-only isolation source confirmed before proceeding to read integration.

