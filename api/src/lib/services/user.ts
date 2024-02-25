import { FitnessUpdateTypes, WebhookTypes } from "../../types/api";
import { WhoopWorkoutData } from "../../types/whoop";
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

const millisecondsToHours = (milliseconds: number) => {
  return (milliseconds / 1000 / 60 / 60).toFixed(3);
};

const whoopRecoveryToRecord = (summary: any) => {
  return {
    type: FitnessUpdateTypes.RECOVERY,
    date: summary.created_at,
    aggregatedScore: summary.recoveryScore.recovery_score,
    restingHr: summary.recoveryScore.resting_heart_rate.toFixed(0),
    hrv: summary.recoveryScore.hrv_rmssd_milli.toFixed(0),
    sleepTime: aggregateSleepScore(summary.sleepScore.stage_summary),
  };
};

const whoopWorkoutToRecord = (workout: WhoopWorkoutData) => {
  return {
    type: FitnessUpdateTypes.WORKOUT,
    date: workout.start,
    strain: WhoopService().getWorkoutStrain(workout.score.strain),
    activity: WhoopService().getWorkoutType(workout.sport_id),
    duration: WhoopService().getWorkoutDuration(workout.start, workout.end),
    calories: WhoopService().getWorkoutCalories(workout.score.kilojoule),
    avgHr: workout.score.average_heart_rate.toFixed(0),
    maxHr: workout.score.max_heart_rate.toFixed(0),
    distance: WhoopService().getWorkoutDistance(workout.score.distance_meter),
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
  async getUserByWhoopId(whoopId: Number) {
    const user = await DB.getUserByWhoopId(whoopId);
    return user;
  },
  async create(email: string, data: object) {
    const user = await DB.createUser(email, data);
    return user;
  },
  async delete(email: string) {
    const user = await DB.deleteUser(email);
    return user;
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
  async getActivity(email: string, date: string, activityId: string | Number) {
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
      console.error(error.response);
    }
    return activity;
  },
  async getSummary(email: string, date: string) {
    const user = await DB.getUserByEmail(email);
    if (!user) throw new Error("User not found");

    let summary;

    const tokenFunction = async () => {
      return defaultTokenFunction(email);
    };

    try {
      switch (user.provider) {
        case "fitbit":
          summary = await FitbitService({
            access_token: user.access_token,
            refresh_token: user.refresh_token,
          }).getSummary(date);
          break;
        case "whoop":
          const whoopSummary = await WhoopService(tokenFunction).getSummary(
            date
          );
          summary = {
            email,
            provider: user.provider,
            ...whoopRecoveryToRecord(whoopSummary),
          };
          break;
        default:
          throw new Error("Provider not supported");
      }
    } catch (error) {
      throw error;
    }

    return summary;
  },
};

export default UserService;
