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

export { FitbitSummary, FitbitWebhookData, FitbitCollectionType, FitbitHeartRatePeriod, FitbitSleepLog, FitbitHrvLog, FitbitHeartRateLog };
