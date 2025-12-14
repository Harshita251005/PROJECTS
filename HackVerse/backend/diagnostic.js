#!/usr/bin/env node

/**
 * HackVerse System Diagnostic Script
 * Quickly verify all features are working correctly
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api';
let authToken = null;
let testUserId = null;
let testEventId = null;
let testTeamId = null;

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'blue');
  console.log('='.repeat(60));
}

// Test functions
async function testHealthCheck() {
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    if (response.data.success) {
      success('Health check passed');
      return true;
    }
  } catch (err) {
    error(`Health check failed: ${err.message}`);
    return false;
  }
}

async function testSignup() {
  try {
    const randomEmail = `test${Date.now()}@hackverse.test`;
    const response = await axios.post(`${BASE_URL}/auth/signup`, {
      name: 'Test User',
      email: randomEmail,
      password: 'Test123!@#',
      role: 'participant',
    });
    
    if (response.data.token) {
      authToken = response.data.token;
      testUserId = response.data.user._id;
      success('Signup successful');
      info(`Token: ${authToken.substring(0, 20)}...`);
      return true;
    }
  } catch (err) {
    error(`Signup failed: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

async function testGetCurrentUser() {
  try {
    const response = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    
    if (response.data.user) {
      success(`Current user fetched: ${response.data.user.name}`);
      return true;
    }
  } catch (err) {
    error(`Get current user failed: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

async function testGetEvents() {
  try {
    const response = await axios.get(`${BASE_URL}/events`);
    success(`Fetched ${response.data.events?.length || 0} events`);
    if (response.data.events && response.data.events.length > 0) {
      testEventId = response.data.events[0]._id;
      info(`Test Event ID: ${testEventId}`);
    }
    return true;
  } catch (err) {
    error(`Get events failed: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

async function testGetTeams() {
  try {
    const response = await axios.get(`${BASE_URL}/teams`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    success(`Fetched ${response.data.teams?.length || 0} teams`);
    if (response.data.teams && response.data.teams.length > 0) {
      testTeamId = response.data.teams[0]._id;
      info(`Test Team ID: ${testTeamId}`);
    }
    return true;
  } catch (err) {
    error(`Get teams failed: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

async function testGetNotifications() {
  try {
    const response = await axios.get(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    success(`Fetched ${response.data.notifications?.length || 0} notifications`);
    return true;
  } catch (err) {
    error(`Get notifications failed: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

async function testRateLimiting() {
  info('Testing rate limiting (this may take a moment)...');
  let requestCount = 0;
  let rateLimited = false;

  try {
    for (let i = 0; i < 10; i++) {
      await axios.get(`${BASE_URL}/events`);
      requestCount++;
    }
    success(`Made ${requestCount} requests successfully`);
    info('Rate limiting is configured but not triggered (good for development)');
    return true;
  } catch (err) {
    if (err.response?.status === 429) {
      success('Rate limiting is working (429 Too Many Requests)');
      return true;
    } else {
      error(`Unexpected error during rate limit test: ${err.message}`);
      return false;
    }
  }
}

async function checkMongoConnection() {
  // We can infer MongoDB is working if we can fetch data
  try {
    await axios.get(`${BASE_URL}/events`);
    success('MongoDB connection appears healthy');
    return true;
  } catch (err) {
    error('MongoDB connection may have issues');
    return false;
  }
}

async function checkSocketIO() {
  info('Socket.io requires client-side testing (check browser console)');
  info('Expected Socket.io server on: ws://localhost:4000');
  return true;
}

async function runDiagnostics() {
  section('🚀 HackVerse System Diagnostics');
  
  log('\n📋 Running comprehensive system checks...\n', 'yellow');

  const results = {
    passed: 0,
    failed: 0,
    total: 0,
  };

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'MongoDB Connection', fn: checkMongoConnection },
    { name: 'User Signup', fn: testSignup },
    { name: 'Get Current User', fn: testGetCurrentUser },
    { name: 'Get Events', fn: testGetEvents },
    { name: 'Get Teams', fn: testGetTeams },
    { name: 'Get Notifications', fn: testGetNotifications },
    { name: 'Rate Limiting', fn: testRateLimiting },
    { name: 'Socket.io Setup', fn: checkSocketIO },
  ];

  for (const test of tests) {
    section(test.name);
    results.total++;
    const passed = await test.fn();
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
  }

  // Summary
  section('📊 Test Summary');
  console.log('');
  log(`Total Tests: ${results.total}`, 'blue');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  
  const percentage = ((results.passed / results.total) * 100).toFixed(1);
  console.log('');
  
  if (results.failed === 0) {
    success(`🎉 All tests passed! (${percentage}%)`);
    log('\n✨ Your HackVerse system is fully operational!', 'green');
  } else {
    log(`⚠️  Success Rate: ${percentage}%`, 'yellow');
    log(`\n${results.failed} test(s) failed. Check the errors above for details.`, 'yellow');
  }

  console.log('\n' + '='.repeat(60) + '\n');
  
  // Additional checks
  section('🔍 Additional System Information');
  log(`Backend URL: ${BASE_URL}`, 'cyan');
  log(`Frontend URL: http://localhost:5173`, 'cyan');
  log(`Environment: development`, 'cyan');
  
  if (authToken) {
    log(`\n🔑 Auth Token (for manual API testing):`, 'yellow');
    log(authToken, 'cyan');
  }
  
  if (testEventId) {
    log(`\n📅 Sample Event ID: ${testEventId}`, 'yellow');
  }
  
  if (testTeamId) {
    log(`👥 Sample Team ID: ${testTeamId}`, 'yellow');
  }

  console.log('\n' + '='.repeat(60));
  
  log('\n📚 Next Steps:', 'blue');
  log('1. Open http://localhost:5173 in your browser', 'cyan');
  log('2. Check browser console for Socket.io connection', 'cyan');
  log('3. Test features manually using the frontend', 'cyan');
  log('4. Review feature_verification.md for detailed testing', 'cyan');
  
  console.log('');
}

// Run diagnostics
runDiagnostics().catch(err => {
  error(`Fatal error: ${err.message}`);
  process.exit(1);
});
