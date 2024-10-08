enum FitbitCollectionType {
  activities = 'activities',
  body = 'body',
  food = 'foods',
  sleep = 'sleep',
  deleteUser = 'deleteUser',
  userRevokedAccess = 'userRevokedAccess',
}

interface FitbitWebhookData {
  collectionType: string;
  date: string;
  ownerId: string;
  ownerType: string;
  subscriptionId: string;
}

interface FitbitHrvLog {
  hrv: Array<{
    value: {
      dailyRmssd: number;
      deepRmssd: number;
    }
    dateTime: string
  }>
}

interface FitbitHeartRateLog {
  'activities-heart': Array<{
    dateTime: string;
    value: {
      customHeartRateZones: Array<{
        caloriesOut: number;
        max: number;
        min: number;
        minutes: number;
        name: string;
      }>,
      heartRateZones: Array<{
        caloriesOut: number;
        max: number;
        min: number;
        minutes: number;
        name: string;
      }>,
      restingHeartRate: number;
    }
  }>
}

type SleepLevel = 'wake' | 'light' | 'deep' | 'rem';

type SleepLevelRecord = {
  dateTime: string;
  level: SleepLevel;
  seconds: number;
}

interface FitbitSleepRecord {
  dateOfSleep: string;
  duration: number;
  efficiency: number;
  endTime: string
  isMainSleep: boolean;
  infoCode: number;
  levels: Array<SleepLevelRecord>
  shortData: Array<SleepLevelRecord>
  summary: {
    [Property in SleepLevel]: {
      count: number;
      minutes: number;
      thirtyDayAvgMinutes: number;
    }
  }
  logId: number;
  minutesAfterWakeup: number;
  minutesAsleep: number;
  minutesAwake: number;
  logType: 'auto_detected' | 'manual';
  startTime: string;
  timeInBed: number;
  type: 'stages' | 'classic';
}

interface FitbitSleepLog {
  sleep: Array<FitbitSleepRecord>,
  summary: {
    stages: {
      [Property in SleepLevel]: number
    }
    totalMinutesAsleep: number;
    totalSleepRecords: number;
    totalTimeInBed: number;
  }
}

type FitbitHeartRatePeriod = '1d' | '7d' | '30d' | '1w' | '1m';
type FitbitDistanceUnit = 'Kilometer' | 'Mile';

interface FitbitSummary {
  date: string
  hrvData: FitbitHrvLog;
  sleepData: FitbitSleepLog;
  hrData: FitbitHeartRateLog;
}

interface FitbitSubscription {
  collectionType: string;
  ownerId: string;
  ownerType: string;
  subscriberId: string;
  subscriptionId: string;
}

interface FitbitServiceCollection {
  apiSubscriptions: Array<FitbitSubscription>;
}

type FitbitUser = {
  age: number;
  ambassador: boolean;
  avatar: string;
  avatar150: string;
  avatar640: string;
  averageDailySteps: number;
  challengesBeta: boolean;
  clockTimeDisplayFormat: string;
  corporate: boolean;
  corporateAdmin: boolean;
  country: string;
  dateOfBirth: string;
  displayName: string;
  displayNameSetting: string;
  distanceUnit: FitbitDistanceUnit;
  encodedId: string;
  features: {
    exerciseGoal: boolean;
  };
  foodsLocale: string;
  fullName: string;
  gender: string;
  glucoseUnit: string;
  height: number;
  heightUnit: string;
  isBugReportEnabled: boolean;
  isChild: boolean;
  isCoach: boolean;
  languageLocale: string;
  legalTermsAcceptRequired: boolean;
  locale: string;
  memberSince: string;
  mfaEnabled: boolean;
  offsetFromUTCMillis: number;
  startDayOfWeek: string;
  strideLengthRunning: number;
  strideLengthRunningType: string;
  strideLengthWalking: number;
  strideLengthWalkingType: string;
  swimUnit: string;
  timezone: string;
  topBadges: any[];
  waterUnit: string;
  waterUnitName: string;
  weight: number;
  weightUnit: string;
};

type FitbitActivityLevel = 'sedentary' | 'lightly' | 'fairly' | 'very';
type TrackerFeature = 'CALORIES' | 'DISTANCE' | 'ELEVATION' | 'HEARTRATE' | 'GPS' | 'PACE' | 'VO2_MAX' | 'STEPS';

interface FitbitActivitySource {
  id: string;
  name: string;
  type: string;
  url: string;
  trackerFeatures: Array<TrackerFeature>;
}

interface FitbitActivityLog {
  logId: number
  activityTypeId: number
  activityName: string
  calories: number
  distance?: number
  steps: number
  speed: number
  pace: number
  averageHeartRate: number
  duration: number
  activeDuration: number
  activityLeve: Array<{
    minutes: number
    name: FitbitActivityLevel
  }>
  distanceUnit?: FitbitDistanceUnit
  source: FitbitActivitySource
  manualSpecified: {
    calories: boolean;
    distance: boolean;
    steps: boolean;
  }
  intervalWorkoutData: {
    intervalSummary: Array<unknown>;
    numRepeats: number;
  }
  heartRateZones: Array<HeartRateZoneReport>
  activeZoneMinutes: {
    totalMinutes: number;
    minutesInHeartRateZones: Array<MinutesInZoneReport>
  }
  inProgress: boolean;
  caloriesLink: string;
  heartRateLink: string;
  tcxLink: string;
  lastModified: string;
  startTime: string;
  originalStartTime: string;
  originalDuration: number;
  elevationGain: number;
  hasActiveZoneMinutes: boolean;
}

type HeartRateZoneMap = {
  1: 'Cardio';
  2: 'Fat Burn';
  3: 'Peak';
  4: 'Out of Range';
}

interface HeartRateZoneReport {
  caloriesOut: number;
  max: number;
  min: number;
  minutes: number;
  name: HeartRateZoneMap[keyof HeartRateZoneMap];
}

interface MinutesInZoneReport {
  minutes: number;
  zoneName: HeartRateZoneMap[keyof HeartRateZoneMap];
  order: number;
  type: string;
  minuteMultiplier: number;
}

interface FitbitActivityResponse {
  afterDate?: string;
  beforeDate?: string;
  sort: 'asc' | 'desc';
  next: string;
  previous: string;
  limit: number;
  offset: number;
  activities: Array<FitbitActivityLog>;
}

export {
  FitbitUser,
  FitbitServiceCollection,
  FitbitSubscription,
  FitbitSummary,
  FitbitWebhookData,
  FitbitCollectionType,
  FitbitHeartRatePeriod,
  FitbitSleepLog,
  FitbitHrvLog,
  FitbitHeartRateLog,
  FitbitActivityResponse,
  FitbitActivityLog,
  FitbitDistanceUnit
};
