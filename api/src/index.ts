import express from "express";

import dotenv from "dotenv";
dotenv.config();

import { json } from "body-parser";
import usersRouter from "./routes/users.routes";
import oauthRouter from "./routes/oauth.routes";
import summaryRouter from "./routes/summary.routes";
import webhookRouter from "./routes/webhook.routes";
import RateLimiter from "express-rate-limit";

const app = express();

app.use(json());

app.enable("trust proxy");

const loggerMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  console.log(`${req.method} ${req.path}`);
  next();
};

const limiter = RateLimiter({
  windowMs: 60 * 1000,
  max: 100,
  message: "Too many requests",
});

app.get("/", (_, res) => {
  res.status(405).end();
});

app.get("/health", (_, res) => {
  res.status(200).end();
});

app.use(loggerMiddleware);
app.use(limiter);

app.use("/users", usersRouter);
app.use("/oauth", oauthRouter);
app.use("/summary", summaryRouter);
app.use("/webhooks", webhookRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
