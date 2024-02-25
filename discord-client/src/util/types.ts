import { Client, Collection } from "discord.js";

export type FitnessRecoveryData = {
  email: string;
  provider: string;
  date: string;
  aggregatedScore: number;
  restingHr: string;
  hrv: string;
  sleepTime: string;
};

export type FitnessWorkoutData = {
  email: string;
  provider: string;
  date: string;
  strain: string;
  activity: string;
  duration: string;
  calories: number;
  avgHr: string;
  maxHr: string;
  distance: string;
};

export type CommandClient = Client & {
  commands?: Collection<string, any>;
  onRecoveryUpdated?: (data: FitnessRecoveryData) => void;
  onWorkoutUpdated?: (data: FitnessWorkoutData) => void;
};
