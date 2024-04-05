import express from "express";
import config from "./config";
import axios, { AxiosError } from "axios";

const initializeServer = async (client: any) => {
  const app = express();
  app.use(express.json());

  //register this client with the server
  try {
    console.log("Registering webhook with api");
    await axios.post(`${config.apiUrl}/webhooks/register`, {
      url: config.webhookUrl,
    });
    console.log("Webhook registered successfully at ", config.webhookUrl);
  } catch (error: AxiosError | any) {
    if (error.response?.status === 304) {
      console.log("Webhook already registered at", config.webhookUrl);
    } else {
      console.error(`Failed to register webhook: ${error.message}`);
    }
  }

  app.post("/webhook", (req, res) => {
    if (req.body.type === "workout") {
      client.onWorkoutUpdated(req.body);
      console.log(`Received workout update for user ${req.body.email}`);
      return res.status(200).json({ message: "success" });
    } else if (req.body.type === "recovery") {
      client.onRecoveryUpdated(req.body);
      console.log(`Received recovery update for user ${req.body.email}`);
      return res.status(200).json({ message: "success" });
    } else {
      console.error("Received unknown event type", req.body.type);
      return res.status(400).json({ message: "unknown event type" });
    }
  });

  app.get("/health", (_, res) => {
    res.status(200).end();
  });

  const { port } = config;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
};

export { initializeServer };
