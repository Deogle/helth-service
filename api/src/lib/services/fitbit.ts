import axios from "axios";
import { FitbitOauthClient } from "../oauth";

//fitbit user data type
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
    return response.data;
  };

  const subscribeToActivities = async () => {
    const response = await instance.post(
      `/user/-/activities/apiSubscriptions/helth-api.json`
    );
    return response.data;
  };

  return {
    fetchUser,
    fetchHrvData,
    subscribeToActivities,
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
  const getSummary = async (date: string) => {
    const hrvData = await FitbitApi(tokens).fetchHrvData(date);
    console.log(hrvData);
  };
  const subscribeToActivities = async () => {
    const status = await FitbitApi(tokens).subscribeToActivities();
    console.log(status);
  };
  return {
    getUser,
    getSummary,
    subscribeToActivities,
  };
};

export default FitbitService;
