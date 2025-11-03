// src/main/src/models/TimeZoneOptions.ts

export interface TimeZoneOption {
  value: string;
  label: string;
}

export const timeZoneOptions: TimeZoneOption[] = [
  // Americas
  { value: "America/New_York", label: "(UTC-05:00) Eastern Time - New York" },
  { value: "America/Chicago", label: "(UTC-06:00) Central Time - Chicago" },
  { value: "America/Denver", label: "(UTC-07:00) Mountain Time - Denver" },
  { value: "America/Los_Angeles", label: "(UTC-08:00) Pacific Time - Los Angeles" },
  { value: "America/Anchorage", label: "(UTC-09:00) Alaska Time - Anchorage" },
  { value: "Pacific/Honolulu", label: "(UTC-10:00) Hawaii Time - Honolulu" },
  { value: "America/Toronto", label: "(UTC-05:00) Eastern Time - Toronto" },
  { value: "America/Vancouver", label: "(UTC-08:00) Pacific Time - Vancouver" },
  { value: "America/Mexico_City", label: "(UTC-06:00) Mexico City" },
  { value: "America/Sao_Paulo", label: "(UTC-03:00) São Paulo" },
  { value: "America/Buenos_Aires", label: "(UTC-03:00) Buenos Aires" },
  
  // Europe
  { value: "Europe/London", label: "(UTC+00:00) London" },
  { value: "Europe/Paris", label: "(UTC+01:00) Paris" },
  { value: "Europe/Berlin", label: "(UTC+01:00) Berlin" },
  { value: "Europe/Rome", label: "(UTC+01:00) Rome" },
  { value: "Europe/Madrid", label: "(UTC+01:00) Madrid" },
  { value: "Europe/Amsterdam", label: "(UTC+01:00) Amsterdam" },
  { value: "Europe/Brussels", label: "(UTC+01:00) Brussels" },
  { value: "Europe/Vienna", label: "(UTC+01:00) Vienna" },
  { value: "Europe/Warsaw", label: "(UTC+01:00) Warsaw" },
  { value: "Europe/Stockholm", label: "(UTC+01:00) Stockholm" },
  { value: "Europe/Athens", label: "(UTC+02:00) Athens" },
  { value: "Europe/Istanbul", label: "(UTC+03:00) Istanbul" },
  { value: "Europe/Moscow", label: "(UTC+03:00) Moscow" },
  
  // Asia
  { value: "Asia/Dubai", label: "(UTC+04:00) Dubai" },
  { value: "Asia/Karachi", label: "(UTC+05:00) Karachi" },
  { value: "Asia/Kolkata", label: "(UTC+05:30) India Standard Time - Kolkata" },
  { value: "Asia/Dhaka", label: "(UTC+06:00) Dhaka" },
  { value: "Asia/Bangkok", label: "(UTC+07:00) Bangkok" },
  { value: "Asia/Singapore", label: "(UTC+08:00) Singapore" },
  { value: "Asia/Hong_Kong", label: "(UTC+08:00) Hong Kong" },
  { value: "Asia/Shanghai", label: "(UTC+08:00) China Standard Time - Shanghai" },
  { value: "Asia/Tokyo", label: "(UTC+09:00) Tokyo" },
  { value: "Asia/Seoul", label: "(UTC+09:00) Seoul" },
  { value: "Asia/Jakarta", label: "(UTC+07:00) Jakarta" },
  { value: "Asia/Manila", label: "(UTC+08:00) Manila" },
  
  // Australia & Pacific
  { value: "Australia/Sydney", label: "(UTC+10:00) Sydney" },
  { value: "Australia/Melbourne", label: "(UTC+10:00) Melbourne" },
  { value: "Australia/Brisbane", label: "(UTC+10:00) Brisbane" },
  { value: "Australia/Perth", label: "(UTC+08:00) Perth" },
  { value: "Pacific/Auckland", label: "(UTC+12:00) Auckland" },
  { value: "Pacific/Fiji", label: "(UTC+12:00) Fiji" },
  
  // Middle East & Africa
  { value: "Africa/Cairo", label: "(UTC+02:00) Cairo" },
  { value: "Africa/Johannesburg", label: "(UTC+02:00) Johannesburg" },
  { value: "Africa/Nairobi", label: "(UTC+03:00) Nairobi" },
  { value: "Africa/Lagos", label: "(UTC+01:00) Lagos" },
  
  // UTC
  { value: "UTC", label: "(UTC+00:00) Coordinated Universal Time" },
];
