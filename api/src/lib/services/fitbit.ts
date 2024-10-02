import axios from "axios";
import { FitbitOauthClient } from "../oauth";
import logger from "../../util/logger";
import { FitbitActivityLog, FitbitActivityResponse, FitbitDistanceUnit, FitbitHeartRateLog, FitbitHeartRatePeriod, FitbitHrvLog, FitbitServiceCollection, FitbitSleepLog, FitbitSummary, FitbitUser } from "../../types/fitbit";
import { RequireAtLeastOne } from "../../types/util";
import UserService from "./user";

type ActivityLogsParams = {
  afterDate: string;
  beforeDate: string;
  sort?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

type GetActivityLogsParams = RequireAtLeastOne<ActivityLogsParams, 'afterDate' | 'beforeDate'>;

export class NoUnseenActivitiesError extends Error {
  constructor() {
    super('No unseen activities');
    this.name = 'NoUnseenActivitiesError';
  }
}

const FitbitApi = (tokens: { access_token: string; refresh_token: string }) => {
  const { access_token, refresh_token } = tokens;

  const instance = axios.create({
    baseURL: "https://api.fitbit.com/1",
    headers: {
      "Content-Type": "application/json",
    },
  });

  instance.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${access_token}`;
    return config;
  });

  const handleRefreshToken = async (error: any) => {
    if (error.response.status !== 401) {
      throw error;
    }
    const request = error.config;
    try {
      request.headers.Authorization = `Bearer ${await FitbitOauthClient.refreshAccessToken(
        refresh_token
      )}`;
      return instance(request);
    } catch (error) {
      throw error;
    }
  };

  instance.interceptors.response.use(null, handleRefreshToken);

  const fetchUser = async (userId?: string) => {
    const response = await instance.get<{ user: FitbitUser }>(`/user/${userId ?? "-"}/profile.json`);
    return response.data.user;
  };

  const fetchHrvData = async (date: string, userId?: string) => {
    const response = await instance.get(
      `/user/${userId ?? "-"}/hrv/date/${date}.json`
    );
    logger.info('Fetched hrv data', { date });
    return response.data;
  };

  const fetchSleepData = async (date: string, userId?: string) => {
    const response = await instance.get(
      `/user/${userId ?? "-"}/sleep/date/${date}.json`
    );
    logger.info('Fetched sleep data', { date });
    return response.data;
  }

  const fetchHrData = async (date: string, period: FitbitHeartRatePeriod = '1d', userId?: string) => {
    const response = await instance.get(
      `/user/${userId ?? "-"}/activities/heart/date/${date}/${period}.json`
    );
    logger.info('Fetched hr data', { date });
    return response.data;
  }

  const clearSubscriptions = async () => {
    const response = await instance.get<FitbitServiceCollection>(`/user/-/apiSubscriptions.json`);
    const { apiSubscriptions } = response.data;

    const collectionTypes = apiSubscriptions.map((sub) => ({ type: sub.collectionType, id: sub.subscriptionId }));
    return Promise.all(collectionTypes.map(({ type, id }) => {
      logger.info('Deleting subscription', { type, id });
      return instance.delete(`/user/-/${type}/apiSubscriptions/${id}.json`);
    }));
  }

  const getSubscriptionId = (id: string, type: string) => {
    return `helth-api-${type}-${id}.json`;
  }

  const createSubscription = async (id: string, type: string) => {
    const url = `/user/-/${type}/apiSubscriptions/${getSubscriptionId(id, type)}`;
    try {
      const response = await instance.post(url);
      logger.info('Created subscription', { type });
      return response.data;
    } catch (error) {
      logger.error('Failed to create subscription', { type, url, error });
    }
  }

  const getSubscriptions = async () => {
    const response = await instance.get(`/user/-/apiSubscriptions.json`);
    return response.data;
  }

  const fetchActivities = async (params: GetActivityLogsParams) => {
    const defaultActivityLogsParams: Omit<GetActivityLogsParams, 'afterDate' | 'beforeDate'> = {
      sort: 'desc',
      limit: 10,
      offset: 0,
    }
    const response = await instance.get<FitbitActivityResponse>(`/user/-/activities/list.json`, { params: { ...defaultActivityLogsParams, ...params } });
    return response.data;
  }

  return {
    fetchUser,
    fetchHrvData,
    fetchSleepData,
    fetchHrData,
    fetchActivities,
    createSubscription,
    clearSubscriptions,
    getSubscriptions
  };
};

const FitbitService = (tokens: {
  access_token: string;
  refresh_token: string;
}) => {
  const getUser = async (userId?: string) => {
    const user = await FitbitApi(tokens).fetchUser(userId);
    return user;
  }
  const getSummary = async (date: string): Promise<FitbitSummary> => {
    const fitbitApi = FitbitApi(tokens);

    const hrvData: FitbitHrvLog = await fitbitApi.fetchHrvData(date);
    const sleepData: FitbitSleepLog = await fitbitApi.fetchSleepData(date);
    const hrData: FitbitHeartRateLog = await fitbitApi.fetchHrData(date);

    return {
      date,
      hrvData,
      sleepData,
      hrData,
    };
  }
  const subscribe = async () => {
    const fitbitApi = FitbitApi(tokens);
    const user = await fitbitApi.fetchUser();
    await fitbitApi.clearSubscriptions();
    const collectionTypes = ['activities', 'sleep'];
    const results = await Promise.allSettled(collectionTypes.map((type) => fitbitApi.createSubscription(user.encodedId, type)));
    logger.info('Finished creating subscriptions', { user: user.encodedId, results: results.map((pResult) => pResult.status) });
  }
  const getSubscriptions = async () => {
    const fitbitApi = FitbitApi(tokens);
    const subscriptions = await fitbitApi.getSubscriptions();
    return subscriptions;
  }
  const clearSubscriptions = async () => {
    const fitbitApi = FitbitApi(tokens);
    return fitbitApi.clearSubscriptions();
  }
  const getUnseenActivities = async (activities: Array<FitbitActivityLog>) => {
    const user = await UserService.getUserByRefreshToken(tokens.refresh_token);
    if (!user) throw new Error('User not found');

    const seenActivities = user.seenActivities ?? [];
    const unseenActivities = activities.filter((activity) => !seenActivities.includes(activity.logId));
    return unseenActivities;
  }
  const getActivityLogs = async (params: GetActivityLogsParams) => {
    const fitbitApi = FitbitApi(tokens);
    const activityResponse = await fitbitApi.fetchActivities(params);
    const activities = await getUnseenActivities(activityResponse.activities);

    if (!activities.length) {
      throw new NoUnseenActivitiesError();
    }

    return activities;
  }
  const getActivityDuration = (durationMs: number) => {
    const durationSeconds = Math.floor(durationMs / 1000);
    const hours = Math.floor(durationSeconds / 3600);
    const minutes = Math.floor((durationSeconds % 3600) / 60);
    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  }
  const getActivityDistance = (distance: number | undefined, distanceUnit: FitbitDistanceUnit | undefined) => {
    if (!distance) return '0';
    if (distanceUnit === 'Kilometer') {
      const distanceInMiles = distance * 0.621371;
      return distanceInMiles.toFixed(2);
    }
    return distance.toFixed(2);
  }
  return {
    getUser,
    getSummary,
    getSubscriptions,
    getActivityLogs,
    getActivityDuration,
    getActivityDistance,
    clearSubscriptions,
    subscribe,
  };
};

export default FitbitService;
