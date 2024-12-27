import { createClient } from "redis";
import { handlePubSubMessage } from "./events/handler";
import logger from "./util/logger";

const PUBSUB_CHANNEL = "pubsub:message";

const initRedisSubscriber = async (client: any) => {
  const redisClient = createClient({
    url: process.env.REDIS_URL!,
  });

  const messageListener = (message: string, channel: string) => {
    const messageData = JSON.parse(message);
    logger.info("Received message", { messageData, channel });
    handlePubSubMessage(client, JSON.parse(message));
  };

  const subscriber = redisClient.duplicate();

  await subscriber.connect();
  logger.info("Redis subscriber connected");

  await subscriber.subscribe(PUBSUB_CHANNEL, messageListener);
  logger.info("Redis subscriber subscribed", { channel: PUBSUB_CHANNEL });
};

export { initRedisSubscriber };
