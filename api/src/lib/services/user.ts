import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(tz);

import { FitnessUpdateTypes, PubSubActivityMessage, PubSubBaseMessage, PubSubRecoveryMessage } from "../../types/api";
import { FitbitSleepLog, FitbitSummary, FitbitUser } from "../../types/fitbit";
import { WhoopWorkoutData } from "../../types/whoop";
import logger from "../../util/logger";
import DB from "../db";
import FitbitService from "./fitbit";
import WhoopService from "./whoop";

const defaultTokenFunction = async (email: string) => {
  const user = await DB.getUserByEmail(email);
  if (!user) throw new Error("User not found");
  return {
    access_token: user.access_token,
    refresh_token: user.refresh_token,
  };
};

const aggregateSleepScore = (stageSummary: any) => {
  return millisecondsToHours(
    stageSummary.total_light_sleep_time_milli +
    stageSummary.total_slow_wave_sleep_time_milli +
    stageSummary.total_rem_sleep_time_milli
  );
};

const aggregateFitbitSleepScore = (sleepData: FitbitSleepLog) => {
  const totalMs = sleepData.sleep.reduce((acc, sleepRecord) => {
    acc += sleepRecord.duration
    return acc
  }, 0)
  return millisecondsToHours(totalMs);
}

const millisecondsToHours = (milliseconds: number) => {
  return (milliseconds / 1000 / 60 / 60).toFixed(3);
};

const fitbitSummaryToRecord = (user: FitbitUser, summary: FitbitSummary): Omit<PubSubRecoveryMessage, "email" | "provider"> => {
  const fromLocalTime = (date: string) => {
    const userTz = user.timezone;
    return dayjs.tz(date, userTz).utc().format();
  }

  return {
    type: FitnessUpdateTypes.RECOVERY,
    aggregatedScore: '100',
    date: fromLocalTime(summary.sleepData.sleep[0].endTime),
    restingHr: summary.hrData["activities-heart"][0]?.value.restingHeartRate.toFixed(0),
    hrv: summary.hrvData.hrv[0]?.value.deepRmssd.toFixed(0),
    sleepTime: aggregateFitbitSleepScore(summary.sleepData),
  };
}

const whoopRecoveryToRecord = (summary: any): Omit<PubSubRecoveryMessage, "email" | "provider"> => {
  return {
    type: FitnessUpdateTypes.RECOVERY,
    date: summary.created_at as string,
    aggregatedScore: summary.recoveryScore.recovery_score as string,
    restingHr: summary.recoveryScore.resting_heart_rate.toFixed(0),
    hrv: summary.recoveryScore.hrv_rmssd_milli.toFixed(0),
    sleepTime: aggregateSleepScore(summary.sleepScore.stage_summary),
  };
};

const whoopWorkoutToRecord = (workout: WhoopWorkoutData) => {
  const whoop = WhoopService();
  return {
    type: FitnessUpdateTypes.WORKOUT,
    date: workout.start,
    strain: whoop.getWorkoutStrain(workout.score.strain),
    activity: whoop.getWorkoutType(workout.sport_id),
    duration: whoop.getWorkoutDuration(workout.start, workout.end),
    calories: whoop.getWorkoutCalories(workout.score.kilojoule),
    avgHr: workout.score.average_heart_rate.toFixed(0),
    maxHr: workout.score.max_heart_rate.toFixed(0),
    distance: whoop.getWorkoutDistance(workout.score.distance_meter),
  };
};

const UserService = {
  async getAllUsers() {
    const users = await DB.getAllUsers();
    return users;
  },
  async getUserByEmail(email: string) {
    const user = await DB.getUserByEmail(email);
    return user;
  },
  async getUserByFitbitEncodedId(encodedId: string) {
    const user = await DB.getUserByEncodedId(encodedId);
    return user
  },
  async getUserByWhoopId(whoopId: Number) {
    const user = await DB.getUserByWhoopId(whoopId);
    return user;
  },
  async getUserByRefreshToken(refreshToken: string) {
    const user = await DB.getUserByRefreshToken(refreshToken);
    return user;
  },
  async create(email: string, data: object) {
    const user = await DB.createUser(email, data);
    return user;
  },
  async delete(email: string) {
    const user = await DB.getUserByEmail(email);
    if (!user) throw new Error("User not found");

    logger.info("Deleting user", { email, provider: user.provider });
    try {
      if (user.provider === "fitbit") {
        const fitbit = FitbitService({ access_token: user.access_token, refresh_token: user.refresh_token });
        await fitbit.clearSubscriptions();
        logger.info('Cleaned up fitbit subscriptions', { email, provider: user.provider });
      }

      await DB.deleteUser(email);
      logger.info("Deleted user", { email, provider: user.provider });
      return user;
    } catch (error) {
      logger.error("Failed to delete user - FIX UP NOW", { email, provider: user.provider });
      throw new Error("Failed to delete user, please contact an administator");
    }
  },
  async updateTokens(
    refreshToken: string,
    updatedTokens: { access_token: string; refresh_token: string }
  ) {
    const user = await DB.getUserByRefreshToken(refreshToken);
    if (!user) throw new Error("User not found");
    const updatedUser = await DB.updateUser(user.email, updatedTokens);
    return updatedUser;
  },
  async getActivity(email: string, date: string, activityId: string | Number): Promise<PubSubActivityMessage> {
    const user = await DB.getUserByEmail(email);
    if (!user) throw new Error("User not found");

    let activity;

    const tokenFunction = async () => {
      return defaultTokenFunction(email);
    };

    try {
      switch (user.provider) {
        case "whoop":
          activity = await WhoopService(tokenFunction).getWorkout(activityId);
          activity = {
            email,
            provider: user.provider,
            ...whoopWorkoutToRecord(activity),
          };
          break;
        default:
          throw new Error("Provider not supported");
      }
    } catch (error: any) {
      logger.error(error);
    }
    return activity;
  },
  async getSummary(email: string, date: string): Promise<PubSubRecoveryMessage> {
    const user = await DB.getUserByEmail(email);
    if (!user) throw new Error("User not found");

    let summary: PubSubRecoveryMessage | null = null;

    const tokenFunction = async () => {
      return defaultTokenFunction(email);
    };

    switch (user.provider) {
      case "fitbit":
        const fitbitSummary = await FitbitService({
          access_token: user.access_token,
          refresh_token: user.refresh_token,
        }).getSummary(date);
        summary = {
          email,
          provider: user.provider,
          ...fitbitSummaryToRecord((user as FitbitUser), fitbitSummary),
        };
        break;
      case "whoop":
        const whoopSummary = await WhoopService(tokenFunction).getSummary(date);
        summary = {
          email,
          provider: user.provider,
          ...whoopRecoveryToRecord(whoopSummary),
        };
        break;
      default:
        throw new Error("Provider not supported");
    }

    if (!summary) {
      logger.error("Failed to get summary", { email, date });
      throw new Error("Failed to get summary");
    }

    return summary;
  },
};

export default UserService;
