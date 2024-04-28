import { OAuth2Client, generateCodeVerifier } from "@badgateway/oauth2-client";
import axios from "axios";
import UserService from "../services/user";

const FITBIT_AUTH_URL = "https://www.fitbit.com/oauth2/authorize";
const FITBIT_TOKEN_URL = "https://api.fitbit.com/oauth2/token";

const { FITBIT_CLIENT_ID, FITBIT_CLIENT_SECRET, FITBIT_REDIRECT_URL } =
  process.env as { [key: string]: string };

const codeVerifier = generateCodeVerifier();

const FitbitOauthClient = {
  client: new OAuth2Client({
    clientId: FITBIT_CLIENT_ID,
    clientSecret: FITBIT_CLIENT_SECRET,
    tokenEndpoint: FITBIT_TOKEN_URL,
    authorizationEndpoint: FITBIT_AUTH_URL,
  }),
  fetchTokens: async (code: string | null) => {
    if (!code) throw new Error("No code found");

    const tokenUrl = FitbitOauthClient.client.settings.tokenEndpoint;
    if (!tokenUrl) throw new Error("No token endpoint found");

    const payload = {
      client_id: FitbitOauthClient.client.settings.clientId,
      code: code,
      grant_type: "authorization_code",
      code_verifier: await codeVerifier,
      redirect_uri: FITBIT_REDIRECT_URL,
    };

    const config = {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${FITBIT_CLIENT_ID}:${FITBIT_CLIENT_SECRET}`
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };
    try {
      const tokenResponse = await axios.post(tokenUrl, payload, config);
      return tokenResponse.data;
    } catch (error: any) {
      console.error(error.name, error.code, error.message, error.response.data);
      throw new Error("Failed to fetch tokens");
    }
  },
  fetchAuthCode: async (email: string) => {
    const code = await codeVerifier;
    const authUrl =
      await FitbitOauthClient.client.authorizationCode.getAuthorizeUri({
        redirectUri: FITBIT_REDIRECT_URL,
        state: email,
        codeVerifier: code,
      });
    const scopes = [
      "activity",
      "heartrate",
      "location",
      "nutrition",
      "profile",
      "settings",
      "sleep",
      "weight",
    ];
    return `${authUrl}&scope=${scopes
      .map((s) => encodeURIComponent(s))
      .join(" ")}`;
  },
  refreshAccessToken: async (refreshToken: string) => {
    const tokenUrl = FitbitOauthClient.client.settings.tokenEndpoint;
    if (!tokenUrl) throw new Error("No token endpoint found");

    const tokenResponse = await axios.post(
      tokenUrl,
      {
        client_id: FitbitOauthClient.client.settings.clientId,
        client_secret: FitbitOauthClient.client.settings.clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const tokens = tokenResponse.data;
    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error("No tokens found");
    }

    UserService.updateTokens(refreshToken, { ...tokens });

    return tokens.access_token;
  },
};

export default FitbitOauthClient;
