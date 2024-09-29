import axios from "axios";
import { FitbitOauthClient } from "../oauth";
import logger from "../../util/logger";
import { FitbitHeartRateLog, FitbitHeartRatePeriod, FitbitHrvLog, FitbitSleepLog, FitbitSummary } from "../../types/fitbit";

export type FitbitUser = {
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
    const response = await instance.get(`/user/${userId ?? "-"}/profile.json`);
    return response.data.user as FitbitUser;
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

  const subscribeToActivities = async () => {
    const response = await instance.post(
      `/user/-/activities/apiSubscriptions/helth-api.json`
    );
    return response.data;
  };

  const subscribeToSleep = async () => {
    const response = await instance.post(
      `/user/-/sleep/apiSubscriptions/helth-api.json`
    )
    return response.data;
  }

  return {
    fetchUser,
    fetchHrvData,
    fetchSleepData,
    fetchHrData,
    subscribeToActivities,
    subscribeToSleep
  };
};

const FitbitService = (tokens: {
  access_token: string;
  refresh_token: string;
}) => {
  const getUser = async (userId?: string) => {
    const user = await FitbitApi(tokens).fetchUser(userId);
    return user;
  };
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
  };
  const subscribe = async () => {
    const fitbitApi = FitbitApi(tokens);
    const user = await fitbitApi.fetchUser();
    const status = await Promise.all([fitbitApi.subscribeToActivities(), fitbitApi.subscribeToSleep()])
    logger.info("Created fitbit subscriptions", { user: user.encodedId, status });
  };
  return {
    getUser,
    getSummary,
    subscribe,
  };
};

export default FitbitService;
