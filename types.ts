export interface LabData {
  totalTestosterone: string;
  freeTestosterone: string;
  estradiol: string;
  hematocrit: string;
}

export enum InjectionFrequency {
  ONCE_A_WEEK = 'Once a week',
  TWICE_A_WEEK = 'Twice a week',
  THREE_TIMES_A_WEEK = 'Three times a week or more',
  OTHER = 'Other',
}

export enum BloodTestTiming {
  PEAK = 'Peak (1-2 days after injection)',
  MID = 'Mid-cycle (3-5 days after injection)',
  TROUGH = 'Trough (day of next injection, before injecting)',
  UNSURE = 'Unsure',
}

export const SymptomsList = [
  'Anxiety',
  'Sleep disturbance',
  'Heart palpitations',
  'High blood pressure',
  'Chest pain',
  'Low libido',
  'Erectile dysfunction',
  'Fatigue',
  'Mood swings',
  'Acne',
  'Water retention',
  'None of the above'
];

export interface FormData {
  injectionFrequency: InjectionFrequency | '';
  bloodTestTiming: BloodTestTiming | '';
  labs: LabData;
  symptoms: string[];
}
