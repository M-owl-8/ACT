/**
 * Quick test script to verify all fixes are working
 * Run with: node test-fixes.js
 */

console.log('🧪 Testing ACT Mobile App Fixes...\n');

// Test 1: Check if Sentry is installed
console.log('Test 1: Checking Sentry installation...');
try {
  const sentry = require('@sentry/react-native');
  console.log('✅ @sentry/react-native is installed');
  console.log('   Version:', require('./package.json').dependencies['@sentry/react-native']);
} catch (e) {
  console.log('❌ @sentry/react-native is NOT installed');
  console.log('   Error:', e.message);
}

// Test 2: Check if sentryService can be loaded
console.log('\nTest 2: Checking sentryService...');
try {
  // This will test the dynamic require in sentryService
  const sentryService = require('./src/services/sentryService');
  console.log('✅ sentryService loads successfully');
  console.log('   Exports:', Object.keys(sentryService).slice(0, 5).join(', '), '...');
} catch (e) {
  console.log('❌ sentryService failed to load');
  console.log('   Error:', e.message);
}

// Test 3: Check if notificationService has initializeNotifications
console.log('\nTest 3: Checking notificationService...');
try {
  const notificationService = require('./src/services/notificationService');
  if (notificationService.initializeNotifications) {
    console.log('✅ initializeNotifications function exists');
  } else {
    console.log('❌ initializeNotifications function NOT found');
  }
  console.log('   Exports:', Object.keys(notificationService).join(', '));
} catch (e) {
  console.log('❌ notificationService failed to load');
  console.log('   Error:', e.message);
}

// Test 4: Check package.json dependencies
console.log('\nTest 4: Checking package.json dependencies...');
try {
  const pkg = require('./package.json');
  const deps = pkg.dependencies;
  
  const requiredDeps = [
    '@sentry/react-native',
    'expo-blur',
    'expo-notifications',
    'expo-constants'
  ];
  
  requiredDeps.forEach(dep => {
    if (deps[dep]) {
      console.log(`✅ ${dep}: ${deps[dep]}`);
    } else {
      console.log(`❌ ${dep}: NOT INSTALLED`);
    }
  });
} catch (e) {
  console.log('❌ Failed to read package.json');
  console.log('   Error:', e.message);
}

console.log('\n✨ Test complete!\n');
console.log('Next steps:');
console.log('1. Restart Metro bundler: npm start');
console.log('2. Run on Android: npm run android');
console.log('3. Check console for initialization logs');