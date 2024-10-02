export enum WebhookTypes {
  RECOVERY_UPDATED,
  WORKOUT_UPDATED,
}

export enum FitnessUpdateTypes {
  WORKOUT = "workout",
  RECOVERY = "recovery",
}

export interface PubSubBaseMessage {
  email: string;
  provider: 'whoop' | 'fitbit';
}

export interface PubSubActivityMessage extends PubSubBaseMessage {
  type: FitnessUpdateTypes.WORKOUT;
  date: string;
  strain?: string;
  activity: string;
  duration: string;
  calories: string;
  avgHr: string;
  maxHr: string;
  distance: string
}

export interface PubSubRecoveryMessage extends PubSubBaseMessage {
  type: FitnessUpdateTypes.RECOVERY;
  date: string;
  aggregatedScore: string;
  restingHr: string;
  hrv: string;
  sleepTime: string;
}

export type PubSubMessage = PubSubActivityMessage | PubSubRecoveryMessage;
