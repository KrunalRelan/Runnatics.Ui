/**
 * Test utility to verify timezone conversion functions work across all timezones
 * Run this to ensure convertLocalToUTC and convertUTCToLocal work correctly
 * 
 * Usage in browser console:
 * import { testAllTimezones } from '@/main/src/utils/dateTimeUtils.test'
 * testAllTimezones()
 */

import { convertLocalToUTC, convertUTCToLocal } from './dateTimeUtils';
import { timeZoneOptions } from '@/main/src/models/TimeZoneOptions';
import dayjs from 'dayjs';

/**
 * Test a single timezone conversion
 * @param timezone - IANA timezone string
 * @param localTimeString - Local time as "YYYY-MM-DDTHH:mm"
 * @returns Object with conversion results
 */
export function testTimezoneConversion(
  timezone: string,
  localTimeString: string = '2026-02-20T14:30' // Default: Feb 20, 2026, 2:30 PM
) {
  try {
    const utcTime = convertLocalToUTC(localTimeString, timezone);
    const backToLocal = convertUTCToLocal(utcTime, timezone);
    
    const success = backToLocal === localTimeString;
    
    return {
      timezone,
      localTimeInput: localTimeString,
      convertedToUTC: utcTime,
      convertedBackToLocal: backToLocal,
      success,
      error: null,
    };
  } catch (error: any) {
    return {
      timezone,
      localTimeInput: localTimeString,
      convertedToUTC: null,
      convertedBackToLocal: null,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Test all available timezones
 * @returns Array of test results
 */
export function testAllTimezones() {
  const testDateTime = '2026-02-20T14:30'; // Feb 20, 2026, 2:30 PM
  
  console.log('🧪 Testing Timezone Conversions');
  console.log('=' .repeat(80));
  console.log(`Test Date/Time: ${testDateTime} (local time in each timezone)\n`);

  const results = timeZoneOptions.map((tz) =>
    testTimezoneConversion(tz.value, testDateTime)
  );

  let successCount = 0;
  let failCount = 0;

  results.forEach((result) => {
    if (result.success) {
      successCount++;
      console.log(`✅ ${result.timezone.padEnd(25)} | UTC: ${result.convertedToUTC}`);
    } else {
      failCount++;
      console.error(`❌ ${result.timezone.padEnd(25)} | Error: ${result.error}`);
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log(`📊 Summary: ${successCount} passed, ${failCount} failed out of ${results.length} timezones`);
  console.log('='.repeat(80));

  return results;
}

/**
 * Test specific timezones with detailed output
 */
export function testSpecificTimezones(...timezones: string[]) {
  const testDateTime = '2026-02-20T14:30';
  
  console.log('🧪 Detailed Timezone Conversion Test');
  console.log('='.repeat(100));

  timezones.forEach((tz) => {
    const result = testTimezoneConversion(tz, testDateTime);
    
    console.log(`\nTimezone: ${tz}`);
    console.log(`  Local Input:      ${result.localTimeInput}`);
    console.log(`  Converted to UTC: ${result.convertedToUTC}`);
    console.log(`  Back to Local:    ${result.convertedBackToLocal}`);
    console.log(`  Status:           ${result.success ? '✅ PASS' : `❌ FAIL - ${result.error}`}`);
    
    // Show the offset
    try {
      const offset = dayjs.tz(result.localTimeInput, tz).format('Z');
      console.log(`  UTC Offset:       ${offset}`);
    } catch (e) {
      console.log(`  UTC Offset:       Unable to determine`);
    }
  });

  console.log('\n' + '='.repeat(100));
}

/**
 * Test edge cases like DST transitions
 */
export function testDSTEdgeCases() {
  console.log('🧪 Testing DST Transition Edge Cases');
  console.log('='.repeat(80));

  // Test some timezones around spring forward (US Eastern in March)
  const testCases = [
    {
      timezone: 'America/New_York',
      dates: [
        '2026-03-07T14:00', // Before DST
        '2026-03-08T14:00', // During DST transition
        '2026-03-09T14:00', // After DST
      ],
    },
    {
      timezone: 'Europe/London',
      dates: [
        '2026-03-28T14:00', // Before BST
        '2026-03-29T14:00', // BST transition
        '2026-03-30T14:00', // After BST
      ],
    },
    {
      timezone: 'Australia/Sydney',
      dates: [
        '2026-09-30T14:00', // Before AEDT
        '2026-10-01T14:00', // During transition
        '2026-10-02T14:00', // After AEDT
      ],
    },
  ];

  testCases.forEach(({ timezone, dates }) => {
    console.log(`\n${timezone}:`);
    dates.forEach((date) => {
      const result = testTimezoneConversion(timezone, date);
      const status = result.success ? '✅' : '❌';
      console.log(
        `  ${status} ${date} → UTC: ${result.convertedToUTC} → Local: ${result.convertedBackToLocal}`
      );
    });
  });

  console.log('\n' + '='.repeat(80));
}

/**
 * Manual test: Convert a specific local time to UTC and verify with other timezones
 */
export function testSpecificConversion(localTime: string, timezone: string) {
  console.log(`\n🔄 Testing Conversion for ${timezone}`);
  console.log(`Local Time: ${localTime}`);

  const utcTime = convertLocalToUTC(localTime, timezone);
  console.log(`UTC Time: ${utcTime}`);

  // Show what this UTC time looks like in other timezones
  const testTimezones = [
    'UTC',
    'Asia/Kolkata',
    'Europe/London',
    'America/New_York',
    'Asia/Tokyo',
  ];

  console.log('\nWhat this UTC time looks like in other timezones:');
  testTimezones.forEach((tz) => {
    const localInTz = convertUTCToLocal(utcTime, tz);
    console.log(`  ${tz.padEnd(25)}: ${localInTz}`);
  });
}

// Export for debugging
export const TimezoneTestUtils = {
  testTimezoneConversion,
  testAllTimezones,
  testSpecificTimezones,
  testDSTEdgeCases,
  testSpecificConversion,
};
