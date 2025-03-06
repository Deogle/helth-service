import { Router } from "express";
import UserService from "../lib/services/user";
import FitbitService from "../lib/services/fitbit";
import logger from "../util/logger";

const usersRouter = Router();

usersRouter.get("/fitbit/:email", async (req, res) => {
  const authHeader = req.headers["x-auth-header"];

  if (authHeader !== "auth") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  logger.warn("Access to /fitbit/:email endpoint", { email: req.params.email });

  const email = decodeURIComponent(req.params.email);
  const user = await UserService.getUserByEmail(email);

  if (!user) return res.status(404).json({ error: "User not found" });

  const fitbit = FitbitService({
    access_token: user.access_token,
    refresh_token: user.refresh_token,
  });

  const subcriptionStatus = await fitbit.getSubscriptions();

  res.status(200).json(subcriptionStatus);
});

usersRouter.get("/:email", async (req, res) => {
  const email = decodeURIComponent(req.params.email);
  try {
    const user = await UserService.getUserByEmail(email);
    res.status(200).json(user);
  } catch (error) {
    logger.error(error);
    return res.sendStatus(500);
  }
});

usersRouter.delete("/:email", async (req, res) => {
  const email = decodeURIComponent(req.params.email);
  try {
    const user = await UserService.delete(email);
    res.status(200).json(user);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.sendStatus(500);
  }
});

usersRouter.post("/", async (req, res) => {
  const { email, data } = req.body;
  const user = await UserService.create(email, data);
  res.status(201).json(user);
});

export default usersRouter;
