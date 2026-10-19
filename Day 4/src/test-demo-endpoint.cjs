const { validateAndProcessTelemetry } = require('./demo-endpoint');

console.log('===============================================================');
console.log('GRID-IITB Day 4 Task 5: Server-Side Validation Test Suite');
console.log('===============================================================\n');

let passCount = 0;
let failCount = 0;

function runTest(testName, input, expectedStatus, expectedField) {
  const result = validateAndProcessTelemetry(input);
  const statusMatch = result.status === expectedStatus;
  const fieldMatch = expectedField
    ? !result.body.ok && result.body.error.field === expectedField
    : result.body.ok;

  if (statusMatch && fieldMatch) {
    console.log(`[PASS] ${testName}`);
    console.log(`       HTTP ${result.status} -> ${result.body.ok ? 'Data items generated: ' + result.body.data.blocks.length : result.body.error.message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${testName}`);
    console.error(`       Expected HTTP ${expectedStatus}, got ${result.status}`);
    console.error(`       Body:`, JSON.stringify(result.body, null, 2));
    failCount++;
  }
}

// Case 1: Valid Complete Payload
runTest('TC-1: Valid payload with 96 blocks (GJ region)', {
  plantCode: 'ACL_PSS3_KPS1_S',
  date: '2026-10-19',
  region: 'GJ',
  model: 'NOWCASTING',
  blockCount: 96,
}, 200);

// Case 2: Valid Minimal Payload (Defaults applied)
runTest('TC-2: Valid minimal payload (defaults to 96 blocks, NOWCASTING)', {
  plantCode: 'BHADLA_NTPC_S',
  date: '2026-10-19',
  region: 'ISTS',
}, 200);

// Case 3: Missing Plant Code
runTest('TC-3: Missing plantCode', {
  date: '2026-10-19',
  region: 'GJ',
}, 400, 'plantCode');

// Case 4: Invalid Date Format (DD-MM-YYYY instead of YYYY-MM-DD)
runTest('TC-4: Malformed date format (19-10-2026 instead of 2026-10-19)', {
  plantCode: 'ACL_PSS3_KPS1_S',
  date: '19-10-2026',
  region: 'GJ',
}, 400, 'date');

// Case 5: Invalid Region / Unknown Control Area
runTest('TC-5: Invalid region (XYZ)', {
  plantCode: 'ACL_PSS3_KPS1_S',
  date: '2026-10-19',
  region: 'XYZ',
}, 400, 'region');

// Case 6: Out-of-bounds Block Count (e.g. 150 blocks > 96)
runTest('TC-6: Out-of-bounds blockCount (150 > 96)', {
  plantCode: 'ACL_PSS3_KPS1_S',
  date: '2026-10-19',
  region: 'GJ',
  blockCount: 150,
}, 400, 'blockCount');

// Case 7: Unsupported Forecasting Model
runTest('TC-7: Unsupported forecasting model (QUANTUM_AI)', {
  plantCode: 'ACL_PSS3_KPS1_S',
  date: '2026-10-19',
  region: 'GJ',
  model: 'QUANTUM_AI',
}, 400, 'model');

console.log('\n---------------------------------------------------------------');
console.log(`Results: ${passCount} PASSED, ${failCount} FAILED out of ${passCount + failCount} tests.`);
console.log('---------------------------------------------------------------');

process.exit(failCount === 0 ? 0 : 1);

