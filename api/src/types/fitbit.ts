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
  distanceUnit: string;
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

export { FitbitUser, FitbitServiceCollection, FitbitSubscription, FitbitSummary, FitbitWebhookData, FitbitCollectionType, FitbitHeartRatePeriod, FitbitSleepLog, FitbitHrvLog, FitbitHeartRateLog };
