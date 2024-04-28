import type { AxiosRequestConfig } from "axios";
import { env } from "$env/dynamic/private";
import axios from "axios";

const apiUrl = env.API_URL;

// import { GoogleAuth } from "google-auth-library";
// const auth = new GoogleAuth({scopes: ["https://www.googleapis.com/auth/cloud-platform"]});

// const applyGoogleAuthInterceptor = (instance: AxiosInstance) => {
//   const targetAudience = apiUrl.replace("https://", "");
//   console.debug(
//     `${instance.defaults.baseURL} with target audience ${targetAudience}`
//   );

//   instance.interceptors.request.use(async (config) => {
//     const client = await auth.getIdTokenClient(targetAudience);
//     const res = await client.getAccessToken();
//     console.log(res);

//     // config.headers["X-Serverless-Authorization"] = `Bearer ${token}`;
//     return config;
//   });
// };

const createPrivAxiosInstance = (
  endpoint: string = "",
  config?: AxiosRequestConfig
) => {
  const instance = axios.create({
    baseURL: `${apiUrl}/${endpoint}`,
    headers: {
      "Content-Type": "application/json",
    },
    ...config,
  });

  //add auth interceptor
  return instance;
};

export { createPrivAxiosInstance };
