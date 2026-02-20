#!/usr/bin/env node

/**
 * Timezone Conversion Verification Script
 * Run with: node verify-timezones.js
 * 
 * This script tests the timezone conversion logic to ensure it works
 * correctly with all timezones in the dropdown
 */

import dayjsLib from 'dayjs';
import utcPlugin from 'dayjs/plugin/utc.js';
import timezonePlugin from 'dayjs/plugin/timezone.js';

const dayjs = dayjsLib;

// Extend dayjs
dayjs.extend(utcPlugin);
dayjs.extend(timezonePlugin);

// All timezones from the app
const timeZones = [
  // Americas
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "America/Toronto",
  "America/Vancouver",
  "America/Mexico_City",
  "America/Sao_Paulo",
  "America/Buenos_Aires",
  
  // Europe
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Rome",
  "Europe/Madrid",
  "Europe/Amsterdam",
  "Europe/Brussels",
  "Europe/Vienna",
  "Europe/Warsaw",
  "Europe/Stockholm",
  "Europe/Athens",
  "Europe/Istanbul",
  "Europe/Moscow",
  
  // Asia
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Dhaka",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Hong_Kong",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Jakarta",
  "Asia/Manila",
  
  // Australia & Pacific
  "Australia/Sydney",
  "Australia/Melbourne",
  "Australia/Brisbane",
  "Australia/Perth",
  "Pacific/Auckland",
  "Pacific/Fiji",
  
  // Middle East & Africa
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Africa/Nairobi",
  "Africa/Lagos",
  
  // UTC
  "UTC",
];

/**
 * Convert local time to UTC
 */
function convertLocalToUTC(localDateTimeString, timeZone) {
  if (!localDateTimeString || !timeZone) {
    return '';
  }
  try {
    // Use keepLocalTime flag to treat input as local time in specified timezone
    const utcTime = dayjs(localDateTimeString).tz(timeZone, true).utc().toISOString();
    return utcTime;
  } catch (error) {
    console.error('Error converting local to UTC:', error);
    return '';
  }
}

/**
 * Convert UTC time to local
 */
function convertUTCToLocal(utcDateTimeString, timeZone) {
  if (!utcDateTimeString || !timeZone) {
    return '';
  }
  try {
    const localTime = dayjs.utc(utcDateTimeString)
      .tz(timeZone)
      .format('YYYY-MM-DDTHH:mm');
    return localTime;
  } catch (error) {
    console.error('Error converting UTC to local:', error);
    return '';
  }
}

/**
 * Test a timezone conversion
 */
function testTimezone(tz, localTime) {
  try {
    const utcTime = convertLocalToUTC(localTime, tz);
    const backToLocal = convertUTCToLocal(utcTime, tz);
    
    const success = backToLocal === localTime;
    
    return {
      timezone: tz,
      success,
      local: localTime,
      utc: utcTime,
      backToLocal: backToLocal,
      error: null,
    };
  } catch (error) {
    return {
      timezone: tz,
      success: false,
      local: localTime,
      utc: null,
      backToLocal: null,
      error: error.message,
    };
  }
}

// Main test
console.log('='.repeat(100));
console.log('🧪 Testing Timezone Conversion for All Available Timezones');
console.log('='.repeat(100));

const testLocalTime = '2026-02-20T14:30'; // Feb 20, 2026, 2:30 PM
console.log(`\nTest Date/Time: ${testLocalTime} (in each timezone)\n`);

const results = timeZones.map(tz => testTimezone(tz, testLocalTime));

let successCount = 0;
let failCount = 0;

results.forEach((result) => {
  if (result.success) {
    successCount++;
    const offset = dayjs.tz(result.local, result.timezone).format('Z');
    console.log(
      `✅ ${result.timezone.padEnd(25)} | Offset: ${offset.padEnd(6)} | UTC: ${result.utc.split('T')[1].split('Z')[0]}`
    );
  } else {
    failCount++;
    console.error(`❌ ${result.timezone.padEnd(25)} | Error: ${result.error}`);
  }
});

console.log('\n' + '='.repeat(100));
console.log(`📊 Summary: ${successCount} ✅ passed, ${failCount} ❌ failed out of ${results.length} timezones`);
console.log('='.repeat(100));

// Test a specific conversion with detailed output
console.log('\n\n📋 Detailed Example: Converting 14:30 in Different Timezones to UTC');
console.log('='.repeat(100));

const exampleTimezones = [
  'Asia/Kolkata',      // UTC+5:30
  'America/New_York',  // UTC-5:00
  'Europe/London',     // UTC+0:00
  'Australia/Sydney',  // UTC+11:00 (approximate)
];

exampleTimezones.forEach(tz => {
  const result = testTimezone(tz, testLocalTime);
  const offset = dayjs.tz(result.local, tz).format('Z');
  console.log(`\n${tz}:`);
  console.log(`  Input (local):        ${result.local}`);
  console.log(`  UTC Offset:           ${offset}`);
  console.log(`  Converted to UTC:     ${result.utc}`);
  console.log(`  Verify (back local):  ${result.backToLocal}`);
  console.log(`  Status:               ${result.success ? '✅ CORRECT' : '❌ FAILED'}`);
});

console.log('\n' + '='.repeat(100));

// Show timezones with issues, if any
if (failCount > 0) {
  console.log('\n⚠️ Timezones with Issues:');
  results.filter(r => !r.success).forEach(r => {
    console.log(`  - ${r.timezone}: ${r.error}`);
  });
}

console.log('\n✨ Verification Complete!\n');
