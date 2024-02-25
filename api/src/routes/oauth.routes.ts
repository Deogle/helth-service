import { FitbitOauthClient, WhoopOauthClient } from "../lib/oauth";
import { Router } from "express";
import UserService from "../lib/services/user";
import FitbitService from "../lib/services/fitbit";
import WhoopService from "../lib/services/whoop";

const oauthRouter = Router();

oauthRouter.get("/fitbit", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).send("no email provided");
  const authCode = await FitbitOauthClient.fetchAuthCode(email as string);
  res.status(200).send({ url: authCode });
});

oauthRouter.post("/fitbit/auth", async (req, res) => {
  const { email, code } = req.body;
  if (!email) return res.status(400).send("no email provided");
  if (!code) return res.status(400).send("no code provided");

  try {
    const existingUser = await UserService.getUserByEmail(email);
    if (existingUser)
      return res
        .status(400)
        .json({ email: existingUser.email, provider: existingUser.provider });

    const tokens = await FitbitOauthClient.fetchTokens(code);

    const fitbitUserData = await FitbitService(tokens).getUser();
    await FitbitService(tokens).subscribeToActivities();

    const userData = {
      email,
      provider: "fitbit",
      ...tokens,
      ...fitbitUserData,
    };

    await UserService.create(email, userData);
    res.status(201).json({ email, provider: userData.provider });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Something went wrong");
  }
});

oauthRouter.post("/fitbit/tokens", async (req, res) => {
  const { accessToken, refreshToken } = req.body;
  if (!accessToken || !refreshToken)
    return res.status(400).send("no tokens provided");

  const tokens = await FitbitOauthClient.refreshAccessToken(refreshToken);

  res.status(200).json(tokens);
});

oauthRouter.get("/whoop", async (req, res) => {
  const authCode = await WhoopOauthClient.fetchAuthCode();

  res.status(200).send(authCode);
});

oauthRouter.post("/whoop/auth", async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).send("no code provided");

  const tokens = await WhoopOauthClient.fetchTokens(code);
  const tokenFunction = () => {
    return tokens;
  };
  const whoopUserData = await WhoopService(tokenFunction).getUser();

  const existingUser = await UserService.getUserByEmail(whoopUserData.email);
  if (existingUser)
    return res
      .status(400)
      .json({ email: existingUser.email, provider: existingUser.provider });

  const userData = {
    ...whoopUserData,
    ...tokens,
    provider: "whoop",
  };

  await UserService.create(whoopUserData.email, userData);

  res.status(201).end();
});

oauthRouter.post("/whoop/tokens", async (req, res) => {
  const { accessToken, refreshToken } = req.body;
  if (!accessToken || !refreshToken)
    return res.status(400).send("no tokens provided");

  const tokens = await WhoopOauthClient.refreshAccessToken(refreshToken);

  res.status(200).json(tokens);
});

export default oauthRouter;
