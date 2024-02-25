import { Request, Response, NextFunction, Router, raw } from "express";
import crypto from "crypto";
import UserService from "../lib/services/user";
import { WhoopWebhookData, WhoopWebhookType } from "../types/whoop";
import dayjs from "dayjs";
import DB from "../lib/db";
import axios from "axios";
import { FitbitWebhookData } from "../types/fitbit";
import { WebhookTypes } from "../types/api";

const webhookRouter = Router();

const { WHOOP_CLIENT_SECRET } = process.env as { [key: string]: string };

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
  if (!user) return null;
  const recoverySummary = await UserService.getSummary(
    user.email,
    dayjs().format("YYYY-MM-DD")
  );
  const urlList = await DB.getAllWebhookUrls();

  console.log(`Sending recovery update to ${urlList.length} webhooks`);

  await Promise.allSettled(
    urlList.map(async (url) => {
      try {
        await axios.post(url, recoverySummary);
        DB.logSuccessfulWebhook(url);
      } catch (error) {
        DB.logFailedWebhook(url);
      }
    })
  );
};

const handleWorkoutUpdated = async (data: WhoopWebhookData) => {
  const user = await UserService.getUserByWhoopId(data.user_id);
  console.log("Fetching workout", data.id);
  if (!user) return null;
  const whoopWorkoutSummary = await UserService.getActivity(
    user.email,
    dayjs().format("YYYY-MM-DD"),
    data.id
  );

  const urlList = await DB.getAllWebhookUrls();

  console.log(`Sending workout update to ${urlList.length} webhooks`);

  await Promise.allSettled(
    urlList.map(async (url) => {
      try {
        await axios.post(url, whoopWorkoutSummary);
        DB.logSuccessfulWebhook(url);
      } catch (error) {
        DB.logFailedWebhook(url);
      }
    })
  );
};

//TODO implement handler for workout updated
const processWhoopWebhookData = async (data: WhoopWebhookData) => {
  console.log(`Received webhook for user ${data.user_id} of type ${data.type}`);
  switch (data.type) {
    case WhoopWebhookType.RECOVERY_UPDATED:
      await handleRecoveryUpdated(data);
    case WhoopWebhookType.RECOVERY_DELTED:
      break;
    case WhoopWebhookType.WORKOUT_UPDATED:
      await handleWorkoutUpdated(data);
      break;
    case WhoopWebhookType.WORKOUT_DELETED:
      break;
    case WhoopWebhookType.SLEEP_UPDATED:
      break;
    case WhoopWebhookType.SLEEP_DELETED:
      break;
    default:
      console.log("Invalid webhook type");
  }
};

const processFitbitWebhookData = async (data: FitbitWebhookData) => {
  console.log(data);
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
  const validationCode =
    "5faaae68edc10db5c2056b513578dcd16411d8dd3a0c9960425d2b13c6fe298e";
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
  console.log("WEBHOOK RECEIVED");

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
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default webhookRouter;
