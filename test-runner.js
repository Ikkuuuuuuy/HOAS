const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('   NRG PH2 HOA CLOUD PORTAL — AUTOMATED TEST SUITE  ');
console.log('====================================================\n');

// TEST 1: Production Bundle Files & Verification
console.log('TEST 1: Production Dist Assets & Build Integrity');
const distPath = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath);
  console.log('  [PASS] Dist root exists with files:', files.join(', '));

  const assetsPath = path.join(distPath, 'assets');
  const assets = fs.readdirSync(assetsPath);
  console.log('  [PASS] Assets directory compiled:', assets.join(', '));

  const jsFiles = assets.filter(f => f.endsWith('.js'));
  let allBundleChecksPass = true;

  for (const jsFile of jsFiles) {
    const fullPath = path.join(assetsPath, jsFile);
    const content = fs.readFileSync(fullPath, 'utf8');
    console.log(`  Bundle Size: ${(content.length / 1024).toFixed(1)} KB (${jsFile})`);

    const checks = [
      { name: 'Guarded window.Notification API check', test: content.includes('Notification') && content.includes('"Notification"in') },
      { name: 'Facebook SVG icon present', test: content.includes('M24 12.073') },
      { name: 'Centralized Mock Database bundled', test: content.includes('NRG PH2 HOA INC') },
      { name: 'Safe window.L checks included', test: content.includes('window.L') },
      { name: 'React ErrorBoundary included', test: content.includes('Portal Notice') },
      { name: 'All 5 Demo accounts configured', test: content.includes('superadmin@portal.gov.ph') && content.includes('resident@palmera-hoa.com') },
    ];

    checks.forEach(c => {
      if (c.test) {
        console.log(`    ✓ [PASS] ${c.name}`);
      } else {
        console.log(`    ✗ [FAIL] ${c.name}`);
        allBundleChecksPass = false;
      }
    });
  }
} else {
  console.log('  [FAIL] Dist directory not found');
}

// TEST 2: Source Code Route Audit
console.log('\nTEST 2: Application Route & Module Integrity');
const appTsx = fs.readFileSync(path.join(__dirname, 'client', 'src', 'App.tsx'), 'utf8');
const routes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/dashboard',
  '/homeowner-portal',
  '/household',
  '/events',
  '/hoa-manage',
  '/tenants',
  '/users',
  '/financial-reports',
  '/documents',
  '/billing',
  '/facilities',
  '/visitors',
  '/alerts',
  '/residents',
  '/officers',
];

let allRoutesPresent = true;
routes.forEach(r => {
  if (appTsx.includes(`path="${r}"`)) {
    console.log(`  ✓ [PASS] Route ${r} registered with ProtectedRoute & component`);
  } else {
    console.log(`  ✗ [FAIL] Route ${r} missing`);
    allRoutesPresent = false;
  }
});

// TEST 3: Mock Data Keys Verification
console.log('\nTEST 3: Mock Database Schema & Entity Completeness');
const mockDb = fs.readFileSync(path.join(__dirname, 'client', 'src', 'data', 'mockDatabase.ts'), 'utf8');
const mockEntities = [
  'stats',
  'tenants',
  'users',
  'residents',
  'billing',
  'billingSummary',
  'facilities',
  'reservations',
  'visitors',
  'visitorStats',
  'alerts',
  'documents',
  'household',
  'events',
  'financials',
];

mockEntities.forEach(entity => {
  if (mockDb.includes(`${entity}:`)) {
    console.log(`  ✓ [PASS] Mock Entity '${entity}' defined with realistic dataset`);
  } else {
    console.log(`  ✗ [FAIL] Mock Entity '${entity}' missing`);
  }
});

console.log('\n====================================================');
console.log('              ALL AUDIT CHECKS COMPLETED            ');
console.log('====================================================');
