import axios from "axios";
import dayjs from "dayjs";
import { WhoopOauthClient } from "../oauth";
import { WhoopWorkoutMap } from "../../types/whoop";

const WhoopApi = async (
  tokenFunction: () => Promise<{ access_token: string; refresh_token: string }>
) => {
  let { access_token, refresh_token } = await tokenFunction();

  const whoopInstance = axios.create({
    baseURL: "https://api.prod.whoop.com/developer/v1",
    headers: {
      "Content-Type": "application/json",
    },
  });

  whoopInstance.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${access_token}`;
    return config;
  });

  const handleRefreshToken = async (error: any) => {
    if (error.response.status !== 401) {
      throw error;
    }
    try {
      const request = error.config;
      access_token = await WhoopOauthClient.refreshAccessToken(refresh_token);
      return whoopInstance(request);
    } catch (error) {
      throw error;
    }
  };

  whoopInstance.interceptors.response.use(null, handleRefreshToken);

  const fetchUser = async () => {
    const response = await whoopInstance.get("/user/profile/basic");
    return response.data;
  };

  const fetchRecoveryRecords = async () => {
    const response = await whoopInstance.get("/recovery");
    return response.data;
  };

  const fetchSleepRecords = async () => {
    const response = await whoopInstance.get("/activity/sleep");
    return response.data;
  };

  const fetchWorkout = async (activityId: string | Number) => {
    const response = await whoopInstance.get(`/activity/workout/${activityId}`);
    return response.data;
  };

  return {
    fetchUser,
    fetchRecoveryRecords,
    fetchSleepRecords,
    fetchWorkout,
  };
};

const WhoopService = (
  tokenFunction?: () => Promise<{
    access_token: string;
    refresh_token: string;
  }>
) => {
  const getWorkoutType = (sportId: Number) => {
    return WhoopWorkoutMap.get(sportId.toString()) ?? "Unknown";
  };

  const getUser = async () => {
    if (!tokenFunction) throw new Error("Token function not provided");
    const user = await (await WhoopApi(tokenFunction)).fetchUser();
    return user;
  };

  const getSummary = async (date: string) => {
    if (!tokenFunction) throw new Error("Token function not provided");
    const recoveryList = (
      await (await WhoopApi(tokenFunction)).fetchRecoveryRecords()
    ).records;

    const recovery =
      recoveryList.find((recovery: any) => {
        return dayjs(recovery.date).format("YYYY-MM-DD") === date;
      }) ?? {};

    recovery.recoveryScore = recovery.score;
    delete recovery.score;

    const sleepList = (
      await (await WhoopApi(tokenFunction)).fetchSleepRecords()
    ).records;

    const sleep =
      sleepList.find((sleep: any) => {
        return dayjs(sleep.date).format("YYYY-MM-DD") === date;
      }) ?? {};

    sleep.sleepScore = sleep.score;
    delete sleep.score;

    if (!recovery) console.error(`Summary for ${date} not found.`);
    if (!sleep) console.error(`Sleep for ${date} not found.`);

    const summary = {
      ...recovery,
      ...sleep,
    };

    return summary;
  };

  const getWorkout = async (activityId: string | Number) => {
    if (!tokenFunction) throw new Error("Token function not provided");
    const workout = await (
      await WhoopApi(tokenFunction)
    ).fetchWorkout(activityId);
    return workout;
  };

  const getWorkoutDuration = (start: string, end: string) => {
    const startTime = dayjs(start);
    const endTime = dayjs(end);
    const duration = endTime.diff(startTime, "minutes");

    if (duration > 60) {
      return `${Math.floor(duration / 60)}h ${duration % 60}m`;
    } else {
      return `${duration}m`;
    }
  };

  const getWorkoutStrain = (strain: number) => {
    return strain > 1 ? strain.toFixed(0) : strain.toPrecision(2);
  };

  const getWorkoutDistance = (distanceInMeters: number) => {
    const distanceInMiles = distanceInMeters / 1609.344;
    return distanceInMiles.toFixed(2);
  };

  const getWorkoutCalories = (kilojoles: number) => {
    const calories = kilojoles * 0.239006;
    return calories.toFixed(0);
  };

  return {
    getUser,
    getSummary,
    getWorkout,
    getWorkoutType,
    getWorkoutDuration,
    getWorkoutStrain,
    getWorkoutDistance,
    getWorkoutCalories,
  };
};
export default WhoopService;
