import { Request, Response, NextFunction, Router, raw } from "express";
import crypto from "crypto";
import UserService from "../lib/services/user";
import { WhoopWebhookData, WhoopWebhookType } from "../types/whoop";
import dayjs from "dayjs";
import { FitbitCollectionType, FitbitWebhookData } from "../types/fitbit";
import { publishMessage } from "../lib/services/publish";
import logger from "../util/logger";
import { PubSubMessage } from "../types/api";
import FitbitService, { NoUnseenActivitiesError } from "../lib/services/fitbit";

const webhookRouter = Router();

interface WebhookEnvironmentVars extends NodeJS.ProcessEnv {
  WHOOP_CLIENT_SECRET: string;
  FITBIT_VALIDATION_CODE: string;
}

const { WHOOP_CLIENT_SECRET, FITBIT_VALIDATION_CODE } =
  process.env as WebhookEnvironmentVars;

const missingEnvVars = ["WHOOP_CLIENT_SECRET", "FITBIT_VALIDATION_CODE"].filter(
  (key) => !process.env[key]
);

if (missingEnvVars.length) {
  logger.error("Missing required environment variables", { missingEnvVars });
  process.exit(1);
}

webhookRouter.use(raw({ type: "application/json" }));

const validateWhoopWebhookRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.headers["x-ignore-signature"] === "true") return next();
  const hmac = crypto.createHmac("sha256", WHOOP_CLIENT_SECRET);
  const timestamp = req.headers["x-whoop-signature-timestamp"];

  const rawBody = JSON.stringify(req.body).trim();

  const signature = hmac
    .update(timestamp + rawBody.toString())
    .digest("base64");

  if (signature !== req.headers["x-whoop-signature"]) {
    return res.status(401).json({ error: "Invalid signature" });
  }
  next();
};

const handleRecoveryUpdated = async (data: WhoopWebhookData) => {
  const user = await UserService.getUserByWhoopId(data.user_id);
  logger.info(`Fetching recovery summary`, {
    userId: user?.email,
    webhookData: data,
  });
  if (!user) return null;
  const recoverySummary = await UserService.getSummary(
    user.email,
    dayjs().format("YYYY-MM-DD")
  );

  return recoverySummary;
};

const handleFitbitSleep = async (data: FitbitWebhookData) => {
  const user = await UserService.getUserByFitbitEncodedId(data.ownerId);
  if (!user) return null;
  const fitbitSummary = await UserService.getSummary(user.email, data.date);
  return fitbitSummary;
};

const handleFitbitActivity = async (data: FitbitWebhookData) => {
  const user = await UserService.getUserByFitbitEncodedId(data.ownerId);
  if (!user) return null;

  const tokens = {
    access_token: user.access_token,
    refresh_token: user.refresh_token,
  };
  const afterDate = dayjs(data.date).subtract(1, "day").format("YYYY-MM-DD");
  const fitbit = FitbitService(tokens);
  const activities = await fitbit.getActivityLogs({ afterDate });
  if (activities.length > 1) {
    logger.info("Found multiple unseen activities, reporting first", {
      activities: activities.map((a) => a.logId),
    });
  }
  const activity = activities[0];
  const activityMessage = await UserService.getActivity(
    user.email,
    activity.logId,
    activity
  );
  await UserService.markActivityAsSeen(user.email, activity.logId);
  return activityMessage;
};

const handleWorkoutUpdated = async (data: WhoopWebhookData) => {
  const user = await UserService.getUserByWhoopId(data.user_id);
  logger.info("Fetching workout", { userId: user?.email, webhookData: data });

  if (!user) return null;
  const whoopWorkoutSummary = await UserService.getActivity(
    user.email,
    data.id
  );

  return whoopWorkoutSummary;
};

const processWhoopWebhookData = async (data: WhoopWebhookData) => {
  logger.info("Received whoop webhook request", { data });
  let message: PubSubMessage | null = null;
  try {
    switch (data.type) {
      case WhoopWebhookType.RECOVERY_UPDATED:
        message = await handleRecoveryUpdated(data);
        break;
      case WhoopWebhookType.RECOVERY_DELTED:
        break;
      case WhoopWebhookType.WORKOUT_UPDATED:
        message = await handleWorkoutUpdated(data);
        break;
      case WhoopWebhookType.WORKOUT_DELETED:
      case WhoopWebhookType.SLEEP_UPDATED:
      case WhoopWebhookType.SLEEP_DELETED:
      default:
        logger.warn("Webhook handler not implemented", { type: data.type });
        return;
    }
    if (!message) {
      logger.error("Failed to process webhook data", { data });
      return;
    }
    logger.info("Publishing whoop message", { pubsubData: message });
    publishMessage(message);
  } catch (error) {
    logger.error("Error processing webhook data", { data, error });
  }
};

const processFitbitWebhookData = async (data: FitbitWebhookData) => {
  logger.info("Received fitbit webhook request", { data });
  const type = data.collectionType;
  let message: PubSubMessage | null = null;
  try {
    switch (type) {
      case FitbitCollectionType.activities:
        message = await handleFitbitActivity(data);
        break;
      case FitbitCollectionType.sleep:
        message = await handleFitbitSleep(data);
        break;
      default:
        logger.warn("Webhook handler not implemented", { type });
        return;
    }

    if (!message) {
      logger.error("Failed to process webhook data", { data });
      return;
    }

    logger.info("Publishing fitbit message", { pubsubData: message });
    publishMessage(message as PubSubMessage);
  } catch (error) {
    if (error instanceof NoUnseenActivitiesError) {
      logger.info("No unseen activities", { data });
      return;
    }
    logger.error("Error processing webhook data", { data, error });
  }
};

webhookRouter.post(
  "/whoop",
  [validateWhoopWebhookRequest],
  async (req: Request, res: Response) => {
    const data = req.body as WhoopWebhookData;
    processWhoopWebhookData(data);
    res.status(204).json({ message: "Whoop webhook received" });
  }
);

webhookRouter.get("/fitbit", async (req: Request, res: Response) => {
  const validationCode = FITBIT_VALIDATION_CODE;
  const { verify } = req.query;
  if (!verify) {
    return res.status(400).json({ error: "Missing validation code" });
  }
  if (verify !== validationCode) {
    return res.status(404).json({ error: "Invalid validation code" });
  }
  return res.status(204).json({ message: "Validation code received" });
});

webhookRouter.post("/fitbit", async (req: Request, res: Response) => {
  const fitbitWebhookData: FitbitWebhookData[] = req.body;
  res.status(204).json({ message: "Fitbit webhook received" });
  for (const message of fitbitWebhookData) {
    await processFitbitWebhookData(message);
  }
});

export default webhookRouter;
