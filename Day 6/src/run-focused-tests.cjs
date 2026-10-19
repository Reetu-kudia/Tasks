/**
 * Day 6 Task 02: Focused Test Runner for Training Slice
 * Executes self-contained unit and integration assertions with zero external dependencies,
 * zero network sockets, and zero shared credentials.
 */

const assert = require("assert");

// ─── 1. Authorization Slice Implementation ───────────────────────────────────

const RANK = {
  super_admin: 50,
  admin: 40,
  region_admin: 30,
  state_admin: 10,
  ists_admin: 10,
};

const roleRank = (role) => RANK[role] ?? 0;
const isSuperAdmin = (u) => u.role === "super_admin";
const isAdmin = (u) => u.role === "admin" || isSuperAdmin(u);
const isRegionAdmin = (u) => u.role === "region_admin" || isAdmin(u);
const canManagePlants = (u) => isRegionAdmin(u);
const canManageRegions = (u) => isAdmin(u);
const canManageUsers = (u) => isRegionAdmin(u);
const canManageFeatures = (u) => isSuperAdmin(u);

const creatableRoles = (creator) => {
  switch (creator) {
    case "super_admin":
      return ["admin", "region_admin", "state_admin", "ists_admin"];
    case "admin":
      return ["region_admin", "state_admin", "ists_admin"];
    case "region_admin":
      return ["state_admin", "ists_admin"];
    default:
      return [];
  }
};

const canAccessRegion = (user, regionId) => {
  if (!user.allowedRegionIds || !user.allowedRegionIds.length) return true;
  return user.allowedRegionIds.includes(regionId);
};

// ─── 2. Validation Schema Slice ──────────────────────────────────────────────

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validatePlantInput(input) {
  const errors = [];
  if (!input || typeof input !== "object") {
    return { success: false, errors: ["Input must be a valid JSON object"] };
  }

  // Plant Name
  if (typeof input.plantName !== "string" || input.plantName.trim().length === 0) {
    errors.push("plantName is required and must not be empty");
  } else if (input.plantName.length > 200) {
    errors.push("plantName must not exceed 200 characters");
  }

  // Region ID (UUID)
  if (typeof input.regionId !== "string" || !UUID_REGEX.test(input.regionId)) {
    errors.push("regionId must be a valid UUID");
  }

  // Plant Type
  const plantType = input.plantType || "SOLAR";
  if (plantType !== "SOLAR" && plantType !== "WIND") {
    errors.push("plantType must be either SOLAR or WIND");
  }

  // Installed Capacity MW
  if (input.installedCapacityMw !== undefined && input.installedCapacityMw !== null) {
    if (typeof input.installedCapacityMw !== "number" || isNaN(input.installedCapacityMw) || input.installedCapacityMw <= 0) {
      errors.push("installedCapacityMw must be a positive number");
    }
  }

  // Latitude
  if (input.lat !== undefined && input.lat !== null) {
    if (typeof input.lat !== "number" || isNaN(input.lat) || input.lat < -90 || input.lat > 90) {
      errors.push("lat must be a number between -90 and 90");
    }
  }

  // Longitude
  if (input.lon !== undefined && input.lon !== null) {
    if (typeof input.lon !== "number" || isNaN(input.lon) || input.lon < -180 || input.lon > 180) {
      errors.push("lon must be a number between -180 and 180");
    }
  }

  if (errors.length > 0) return { success: false, errors };
  return { success: true, data: input };
}

// ─── 3. Component State Machine Transition Slice ─────────────────────────────

function transitionViewState(prev, action) {
  switch (action.type) {
    case "FETCH_INIT":
      return { ...prev, status: "loading", error: null };
    case "FETCH_SUCCESS":
      return {
        status: action.isEmpty ? "empty" : "success",
        data: action.payload,
        error: null,
        timestamp: new Date().toISOString(),
      };
    case "FETCH_ERROR":
      return {
        status: "error",
        data: null,
        error: action.error,
        timestamp: new Date().toISOString(),
      };
    default:
      return prev;
  }
}

// ─── TEST SUITE EXECUTION ─────────────────────────────────────────────────────

console.log("==================================================================");
console.log("   Day 6 Task 2: Focused Test Suite (Training Slice Verification) ");
console.log("==================================================================\n");

let passedCount = 0;
let totalCount = 0;

function runTest(name, fn) {
  totalCount++;
  process.stdout.write(`Test ${totalCount}: ${name}... `);
  try {
    fn();
    passedCount++;
    console.log("[PASS]");
  } catch (err) {
    console.log("[FAIL]");
    console.error(err);
    process.exit(1);
  }
}

// ── Authorization Tests ──
runTest("Super Admin role rank is 50 with universal privileges", () => {
  const superUser = { userId: "u-1", uname: "root", role: "super_admin", allowedRegionIds: [] };
  assert.strictEqual(roleRank(superUser.role), 50);
  assert.strictEqual(canManagePlants(superUser), true);
  assert.strictEqual(canManageRegions(superUser), true);
  assert.strictEqual(canManageFeatures(superUser), true);
});

runTest("Admin role can manage plants and regions, but NOT features", () => {
  const adminUser = { userId: "u-2", uname: "admin", role: "admin", allowedRegionIds: [] };
  assert.strictEqual(canManagePlants(adminUser), true);
  assert.strictEqual(canManageRegions(adminUser), true);
  assert.strictEqual(canManageFeatures(adminUser), false); // Feature management restricted to super_admin
});

runTest("Region Admin role can manage plants, but NOT global regions", () => {
  const regUser = { userId: "u-3", uname: "reg_admin", role: "region_admin", allowedRegionIds: ["reg-1"] };
  assert.strictEqual(canManagePlants(regUser), true);
  assert.strictEqual(canManageRegions(regUser), false); // Region management requires admin+
});

runTest("State Admin role is DENIED plant and region management (Negative Auth Case)", () => {
  const stateUser = { userId: "u-4", uname: "state_user", role: "state_admin", allowedRegionIds: ["reg-1"] };
  assert.strictEqual(canManagePlants(stateUser), false);
  assert.strictEqual(canManageRegions(stateUser), false);
  assert.strictEqual(canManageUsers(stateUser), false);
});

runTest("Hierarchical role creation prevents privilege escalation", () => {
  // admin cannot create super_admin
  assert.strictEqual(creatableRoles("admin").includes("super_admin"), false);
  // region_admin can only create state_admin and ists_admin
  assert.deepStrictEqual(creatableRoles("region_admin"), ["state_admin", "ists_admin"]);
  // state_admin cannot create any roles
  assert.deepStrictEqual(creatableRoles("state_admin"), []);
});

runTest("Regional tenancy guard denies access to out-of-scope regions (Negative Tenancy Case)", () => {
  const regUser = { userId: "u-3", uname: "reg_admin", role: "region_admin", allowedRegionIds: ["reg-western-123"] };
  assert.strictEqual(canAccessRegion(regUser, "reg-western-123"), true);
  assert.strictEqual(canAccessRegion(regUser, "reg-northern-999"), false); // Denied out-of-scope region
});

// ── Validation Schema Tests ──
runTest("Valid plant creation payload passes validation", () => {
  const validPayload = {
    plantName: "Charanka Solar Substation 1",
    regionId: "11111111-2222-3333-4444-555555555555",
    plantType: "SOLAR",
    installedCapacityMw: 250.5,
    lat: 23.91,
    lon: 71.21,
  };
  const result = validatePlantInput(validPayload);
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.data.plantName, "Charanka Solar Substation 1");
});

runTest("Validation fails when plantName is empty (Negative Validation Case)", () => {
  const invalidPayload = {
    plantName: "   ",
    regionId: "11111111-2222-3333-4444-555555555555",
  };
  const result = validatePlantInput(invalidPayload);
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.errors.some((e) => e.includes("plantName is required")), true);
});

runTest("Validation fails when regionId is not a valid UUID (Negative Validation Case)", () => {
  const invalidPayload = {
    plantName: "Valid Plant",
    regionId: "not-a-valid-uuid-string",
  };
  const result = validatePlantInput(invalidPayload);
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.errors.some((e) => e.includes("valid UUID")), true);
});

runTest("Validation fails when capacity is negative or zero (Negative Validation Case)", () => {
  const invalidPayload = {
    plantName: "Valid Plant",
    regionId: "11111111-2222-3333-4444-555555555555",
    installedCapacityMw: -50.0,
  };
  const result = validatePlantInput(invalidPayload);
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.errors.some((e) => e.includes("positive number")), true);
});

runTest("Validation fails when coordinates exceed geographic boundaries (Negative Validation Case)", () => {
  const invalidPayload = {
    plantName: "Valid Plant",
    regionId: "11111111-2222-3333-4444-555555555555",
    lat: 95.0, // Exceeds [-90, 90]
    lon: 220.0, // Exceeds [-180, 180]
  };
  const result = validatePlantInput(invalidPayload);
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.errors.length >= 2, true);
});

runTest("Validation fails for unsupported plant types (Negative Validation Case)", () => {
  const invalidPayload = {
    plantName: "Thermal Plant",
    regionId: "11111111-2222-3333-4444-555555555555",
    plantType: "COAL",
  };
  const result = validatePlantInput(invalidPayload);
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.errors.some((e) => e.includes("either SOLAR or WIND")), true);
});

// ── State Machine Tests ──
runTest("Component state transitions to error and NEVER masks failure as empty data", () => {
  let state = { status: "idle", data: null, error: null };
  state = transitionViewState(state, { type: "FETCH_INIT" });
  assert.strictEqual(state.status, "loading");

  state = transitionViewState(state, {
    type: "FETCH_ERROR",
    error: { message: "HTTP 500 Database Connection Failed", statusCode: 500 },
  });

  assert.strictEqual(state.status, "error");
  assert.notStrictEqual(state.status, "empty");
  assert.strictEqual(state.data, null);
  assert.strictEqual(state.error.statusCode, 500);
});

console.log("\n==================================================================");
console.log(`   ALL ${passedCount}/${totalCount} FOCUSED TESTS PASSED SUCCESSFULLY!          `);
console.log("==================================================================");
