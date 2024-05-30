import express from "express";

import dotenv from "dotenv";
dotenv.config();

import { json } from "body-parser";
import usersRouter from "./routes/users.routes";
import oauthRouter from "./routes/oauth.routes";
import summaryRouter from "./routes/summary.routes";
import webhookRouter from "./routes/webhook.routes";
import RateLimiter from "express-rate-limit";
import logger from "./util/logger";

const app = express();

app.use(json());

app.enable("trust proxy");

const limiter = RateLimiter({
  windowMs: 60 * 1000,
  max: 100,
  message: "Too many requests",
  //snippet from https://github.com/express-rate-limit/express-rate-limit/wiki/Troubleshooting-Proxy-Issues
  keyGenerator(request: any, _response: any): string {
    if (!request.ip) {
      logger.warn("request.ip is missing!");
      return request.socket.remoteAddress;
    }
    return request.ip.replace(/:\d+[^:]*$/, "");
  },
});

app.get("/", (_, res) => {
  res.status(405).end();
});

app.get("/health", (_, res) => {
  res.status(200).end();
});

app.use(limiter);

app.use("/users", usersRouter);
app.use("/oauth", oauthRouter);
app.use("/summary", summaryRouter);
app.use("/webhooks", webhookRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  logger.info(`Server running`, { port });
});
