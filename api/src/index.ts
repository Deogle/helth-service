import express from "express";

import dotenv from "dotenv";
dotenv.config();

import { json } from "body-parser";
import usersRouter from "./routes/users.routes";
import oauthRouter from "./routes/oauth.routes";
import summaryRouter from "./routes/summary.routes";
import webhookRouter from "./routes/webhook.routes";

const app = express();

app.use(json());

const loggerMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  console.log(`${req.method} ${req.path}`);
  next();
};

app.get("/health", (req, res) => {
  res.status(200).end();
});

app.use(loggerMiddleware);

app.use("/users", usersRouter);
app.use("/oauth", oauthRouter);
app.use("/summary", summaryRouter);
app.use("/webhooks", webhookRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
