// Certificate Template Models

export enum CertificateFieldType {
  PARTICIPANT_NAME = 'ParticipantName',
  CHIP_TIME = 'ChipTime',
  GUN_TIME = 'GunTime',
  BIB_NUMBER = 'BibNumber',
  OVERALL_GENDER_RANK = 'GenderRank',
  OVERALL_RANK = 'OverallRank',
  CATEGORY_RANK = 'CategoryRank',
  RACE_CATEGORY = 'RaceCategory',
  CATEGORY = 'Category',
  GENDER = 'Gender',
  TIME_HRS = 'TimeHrs',
  TIME_MINS = 'TimeMins',
  TIME_SECS = 'TimeSecs',
  DISTANCE = 'Distance',
  PHOTO = 'Photo',
  EVENT_NAME = 'EventName',
  EVENT_DATE = 'EventDate',
  CUSTOM_TEXT = 'CustomText'
}

export interface CertificateField {
  id: string;
  fieldType: CertificateFieldType;
  content: string; // For custom text or placeholder display
  xCoordinate: number;
  yCoordinate: number;
  font: string;
  fontSize: number;
  fontColor: string; // HEX code without #
  width?: number;
  height?: number;
  alignment?: 'left' | 'center' | 'right';
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
}

export interface CertificateTemplate {
  id?: string;
  eventId: string;
  raceId?: string; // Optional - can be race-specific or event-wide
  name: string;
  description?: string;
  backgroundImageUrl?: string;
  backgroundImageData?: string; // Base64 for upload
  width: number; // Certificate width in pixels
  height: number; // Certificate height in pixels
  fields: CertificateField[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CertificateGenerationRequest {
  templateId: string;
  participantId: string;
  raceId: string;
}

export interface CertificateGenerationResponse {
  certificateUrl: string;
  certificateData?: string; // Base64 PDF
}

// Field type metadata for UI
export interface FieldTypeMetadata {
  type: CertificateFieldType;
  label: string;
  placeholder: string;
  description: string;
  sampleValue: string;
}

export const FIELD_TYPE_METADATA: FieldTypeMetadata[] = [
  {
    type: CertificateFieldType.PARTICIPANT_NAME,
    label: 'Participant Name',
    placeholder: '[name]',
    description: 'Full name of the participant',
    sampleValue: 'Chetan Lohani'
  },
  {
    type: CertificateFieldType.BIB_NUMBER,
    label: 'BIB Number',
    placeholder: '[bib]',
    description: 'Participant\'s bib number',
    sampleValue: '2101'
  },
  {
    type: CertificateFieldType.RACE_CATEGORY,
    label: 'Race Category',
    placeholder: '[race_category]',
    description: 'Race category name',
    sampleValue: '21.1 KM'
  },
  {
    type: CertificateFieldType.CATEGORY,
    label: 'Category',
    placeholder: '[category]',
    description: 'Participant category',
    sampleValue: 'Open'
  },
  {
    type: CertificateFieldType.CHIP_TIME,
    label: 'Chip Time',
    placeholder: '[chip_time]',
    description: 'Chip-based finish time',
    sampleValue: '02:01:58'
  },
  {
    type: CertificateFieldType.GUN_TIME,
    label: 'Gun Time',
    placeholder: '[gun_time]',
    description: 'Gun time from race start',
    sampleValue: '02:03:45'
  },
  {
    type: CertificateFieldType.TIME_HRS,
    label: 'Time (Hours)',
    placeholder: '[time_hrs]',
    description: 'Hours component of time',
    sampleValue: '02'
  },
  {
    type: CertificateFieldType.TIME_MINS,
    label: 'Time (Minutes)',
    placeholder: '[time_mins]',
    description: 'Minutes component of time',
    sampleValue: '01'
  },
  {
    type: CertificateFieldType.TIME_SECS,
    label: 'Time (Seconds)',
    placeholder: '[time_secs]',
    description: 'Seconds component of time',
    sampleValue: '58'
  },
  {
    type: CertificateFieldType.OVERALL_RANK,
    label: 'Overall Rank',
    placeholder: '[overall_rank]',
    description: 'Overall position in the race',
    sampleValue: '42'
  },
  {
    type: CertificateFieldType.CATEGORY_RANK,
    label: 'Category Rank',
    placeholder: '[category_rank]',
    description: 'Position within age/category',
    sampleValue: '5'
  },
  {
    type: CertificateFieldType.OVERALL_GENDER_RANK,
    label: 'Overall Gender Rank',
    placeholder: '[overall_gender_rank]',
    description: 'Overall position within gender',
    sampleValue: '38'
  },
  {
    type: CertificateFieldType.GENDER,
    label: 'Gender',
    placeholder: '[gender]',
    description: 'Participant gender',
    sampleValue: 'Male'
  },
  {
    type: CertificateFieldType.DISTANCE,
    label: 'Distance',
    placeholder: '[distance]',
    description: 'Distance covered by runner (for time bound races)',
    sampleValue: '18.5 KM'
  },
  {
    type: CertificateFieldType.PHOTO,
    label: 'Photo',
    placeholder: '[photo]',
    description: 'Participant photo',
    sampleValue: 'photo.jpg'
  },
  {
    type: CertificateFieldType.EVENT_NAME,
    label: 'Event Name',
    placeholder: '[event_name]',
    description: 'Name of the event',
    sampleValue: '4th Gurugram City Half Marathon 2025'
  },
  {
    type: CertificateFieldType.EVENT_DATE,
    label: 'Event Date',
    placeholder: '[event_date]',
    description: 'Date of the event',
    sampleValue: 'December 21, 2025'
  },
  {
    type: CertificateFieldType.CUSTOM_TEXT,
    label: 'Custom Text',
    placeholder: 'Enter text',
    description: 'Static text (not dynamic)',
    sampleValue: 'FOR SUCCESSFULLY COMPLETING'
  }
];
