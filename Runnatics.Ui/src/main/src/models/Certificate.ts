// Certificate Template Models

export enum CertificateFieldType {
  PARTICIPANT_NAME = 'participant_name',
  BIB_NUMBER = 'bib_number',
  RACE_CATEGORY = 'race_category',
  RACE_DISTANCE = 'race_distance',
  CHIP_TIMING = 'chip_timing',
  GUN_TIMING = 'gun_timing',
  RANK_OVERALL = 'rank_overall',
  RANK_CATEGORY = 'rank_category',
  RANK_GENDER = 'rank_gender',
  EVENT_NAME = 'event_name',
  EVENT_DATE = 'event_date',
  CUSTOM_TEXT = 'custom_text'
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
    placeholder: '[bib_number]',
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
    type: CertificateFieldType.RACE_DISTANCE,
    label: 'Race Distance',
    placeholder: '[race_distance]',
    description: 'Distance of the race',
    sampleValue: '21.1 KM'
  },
  {
    type: CertificateFieldType.CHIP_TIMING,
    label: 'Chip Timing',
    placeholder: '[chip_timing]',
    description: 'Chip-based finish time',
    sampleValue: '02:01:58'
  },
  {
    type: CertificateFieldType.GUN_TIMING,
    label: 'Gun Timing',
    placeholder: '[gun_timing]',
    description: 'Gun time from race start',
    sampleValue: '02:03:45'
  },
  {
    type: CertificateFieldType.RANK_OVERALL,
    label: 'Overall Rank',
    placeholder: '[rank_overall]',
    description: 'Overall position in the race',
    sampleValue: '42'
  },
  {
    type: CertificateFieldType.RANK_CATEGORY,
    label: 'Category Rank',
    placeholder: '[rank_category]',
    description: 'Position within age/category',
    sampleValue: '5'
  },
  {
    type: CertificateFieldType.RANK_GENDER,
    label: 'Gender Rank',
    placeholder: '[rank_gender]',
    description: 'Position within gender',
    sampleValue: '38'
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
