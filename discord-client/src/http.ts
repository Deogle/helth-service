import express from "express";
import config from "./config";
import axios, { AxiosError } from "axios";

const parsePubSubMessage = (messageData: { [k: string]: string }) => {
  if (!messageData.data) return messageData;
  console.log("Parsing pubsub message");
  return JSON.parse(Buffer.from(messageData.data, "base64").toString());
};

const initializeServer = async (client: any) => {
  const app = express();
  app.use(express.json());

  // //register this client with the server
  // try {
  //   console.log("Registering webhook with api", config.apiUrl);
  //   await axios.post(`${config.apiUrl}/webhooks/register`, {
  //     url: config.webhookUrl,
  //   });
  //   console.log("Webhook registered successfully at ", config.webhookUrl);
  // } catch (error: AxiosError | any) {
  //   if (error.response?.status === 304) {
  //     console.log("Webhook already registered at", config.webhookUrl);
  //   } else {
  //     console.error(`Failed to register webhook: ${error.message}`);
  //   }
  // }

  app.post("/webhook", (req, res) => {
    if (!req.body) {
      console.error("Received empty request body");
      return res.status(400).json({ message: "empty request body" });
    }
    if (!req.body.message) {
      console.error("Received malformed request body");
      return res.status(400).json({ message: "missing message" });
    }

    const messageData = parsePubSubMessage(req.body.message);

    if (messageData.type === "workout") {
      client.onWorkoutUpdated(messageData);
      console.log(`Received workout update for user ${messageData.email}`);
      return res.status(200).json({ message: "success" });
    } else if (messageData.type == "recovery") {
      client.onRecoveryUpdated(messageData);
      console.log(`Received recovery update for user ${messageData.email}`);
      return res.status(200).json({ message: "success" });
    } else {
      console.error("Received unknown event type", messageData.type);
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
