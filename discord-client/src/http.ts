import express from "express";
import config from "./config";
import logger from "./util/logger";

const parsePubSubMessage = (messageData: { [k: string]: string }) => {
  if (!messageData.data) return messageData;
  logger.info("Parsing PubSub message", { messageData });
  return JSON.parse(Buffer.from(messageData.data, "base64").toString());
};

const initializeServer = async (client: any) => {
  const app = express();
  app.use(express.json());

  app.post("/webhook", (req, res) => {
    if (!req.body) {
      logger.error("Received empty request body")
      return res.status(400).json({ message: "empty request body" });
    }
    if (!req.body.message) {
      logger.error("Received malformed request body");
      return res.status(400).json({ message: "missing message" });
    }

    const messageData = parsePubSubMessage(req.body.message);

    if (messageData.type === "workout") {
      client.onWorkoutUpdated(messageData);
      return res.status(200).json({ message: "success" });
    } else if (messageData.type == "recovery") {
      client.onRecoveryUpdated(messageData);
      return res.status(200).json({ message: "success" });
    } else {
      logger.warn("Received unknown event type", { type: messageData.type});
      return res.status(400).json({ message: "unknown event type" });
    }
  });

  app.get("/health", (_, res) => {
    res.status(200).end();
  });

  const { port } = config;
  app.listen(port, () => {
    logger.info(`Discord client started`, { port });
  });
};
export { initializeServer };
