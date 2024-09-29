import { Request, Response, NextFunction, Router, raw } from "express";
import crypto from "crypto";
import UserService from "../lib/services/user";
import { WhoopWebhookData, WhoopWebhookType } from "../types/whoop";
import dayjs from "dayjs";
import DB from "../lib/db";
import { FitbitWebhookData } from "../types/fitbit";
import { publishMessage } from "../lib/services/publish";
import logger from "../util/logger";

const webhookRouter = Router();

interface WebhookEnvironmentVars extends NodeJS.ProcessEnv {
  WHOOP_CLIENT_SECRET: string;
  FITBIT_VALIDATION_CODE: string;
}

const { WHOOP_CLIENT_SECRET, FITBIT_VALIDATION_CODE } = process.env as WebhookEnvironmentVars;

const missingEnvVars = ["WHOOP_CLIENT_SECRET", "FITBIT_VALIDATION_CODE"].filter(
  (key) => !process.env[key]
);

if(missingEnvVars.length) {
  logger.error("Missing required environment variables", { missingEnvVars });
  process.exit(1)
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

const handleWorkoutUpdated = async (data: WhoopWebhookData) => {
  const user = await UserService.getUserByWhoopId(data.user_id);
  logger.info("Fetching workout", { userId: user?.email, webhookData: data });

  if (!user) return null;
  const whoopWorkoutSummary = await UserService.getActivity(
    user.email,
    dayjs().format("YYYY-MM-DD"),
    data.id
  );

  return whoopWorkoutSummary;
};

const processWhoopWebhookData = async (data: WhoopWebhookData) => {
  logger.info("Received whoop webhook request", { data });
  let message: { [key: string]: any } | null = null;
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
    logger.info("Publishing message", { pubsubData: message });
    publishMessage(message);
  } catch (error) {
    logger.error("Error processing webhook data", { data, error });
  }
};

const processFitbitWebhookData = async (data: FitbitWebhookData) => {
  logger.info("Received fitbit webhook request", { data });
};

webhookRouter.post(
  "/whoop",
  [validateWhoopWebhookRequest],
  async (req: Request, res: Response) => {
    const data = req.body as WhoopWebhookData;
    processWhoopWebhookData(data);
    res.status(204).json({ message: "Webhook received" });
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
  fitbitWebhookData.forEach(processFitbitWebhookData);

  res.status(204).json({ message: "Webhook received" });
});

webhookRouter.post("/register", async (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "Missing url - required" });

  try {
    const isWebhookCreated = await DB.registerWebhook(url);
    if (isWebhookCreated) {
      return res.status(201).json({ message: "Webhook registered" });
    }
    return res.status(304).json({ error: "Webhook already registered" });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default webhookRouter;
