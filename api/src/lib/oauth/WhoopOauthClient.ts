import { OAuth2Client } from "@badgateway/oauth2-client";
import axios from "axios";
import UserService from "../services/user";
import logger from "../../util/logger";

const WHOOP_AUTH_URL = "https://api.prod.whoop.com/oauth/oauth2/auth";
const WHOOP_TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token";
const { WHOOP_CLIENT_ID, WHOOP_CLIENT_SECRET, WHOOP_REDIRECT_URL } =
  process.env as { [key: string]: string };

const WhoopOauthClient = {
  client: new OAuth2Client({
    clientId: WHOOP_CLIENT_ID,
    clientSecret: WHOOP_CLIENT_SECRET,
    tokenEndpoint: WHOOP_TOKEN_URL,
    authorizationEndpoint: WHOOP_AUTH_URL,
  }),
  fetchTokens: async (code: string | null) => {
    if (!code) throw new Error("No code found");

    const tokenUrl = WhoopOauthClient.client.settings.tokenEndpoint;
    if (!tokenUrl) throw new Error("No token endpoint found");

    const tokenResponse = await axios.post(
      tokenUrl,
      {
        client_id: WhoopOauthClient.client.settings.clientId,
        client_secret: WhoopOauthClient.client.settings.clientSecret,
        code: code,
        redirect_uri: WHOOP_REDIRECT_URL,
        grant_type: "authorization_code",
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return tokenResponse.data;
  },
  fetchAuthCode: async () => {
    const authUrl =
      await WhoopOauthClient.client.authorizationCode.getAuthorizeUri({
        redirectUri: WHOOP_REDIRECT_URL,
        state: "stateTest",
      });
    const scopes = [
      "offline",
      "read:recovery",
      "read:cycles",
      "read:sleep",
      "read:profile",
      "read:workout",
    ];
    return `${authUrl}&scope=${scopes
      .map((s) => encodeURIComponent(s))
      .join(" ")}`;
  },
  refreshAccessToken: async (refreshToken: string) => {
    logger.debug("Refreshing whoop access token");
    const tokenUrl = WhoopOauthClient.client.settings.tokenEndpoint;
    if (!tokenUrl) throw new Error("No token endpoint found");

    try {
      const tokenResponse = await axios.post(
        tokenUrl,
        {
          client_id: WhoopOauthClient.client.settings.clientId,
          client_secret: WhoopOauthClient.client.settings.clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
          scope: "offline",
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      const tokens = tokenResponse.data;
      await UserService.updateTokens(refreshToken, { ...tokens });

      return tokens.access_token;
    } catch (error) {
      logger.error("Failed to refresh token", error);
    }
  },
};

export default WhoopOauthClient;
