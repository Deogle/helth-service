import logger from "../../util/logger";
import { PubSubMessage } from "../../types/api";
import { createClient } from "redis";

const PUBSUB_CHANNEL = "pubsub:message";

async function publishMessage(message: PubSubMessage): Promise<void> {
  const client = createClient({
    url: process.env.REDIS_URL!,
  });

  client.on("error", (err) => console.log("redis client error", err));
  await client.connect();
  await client.publish(PUBSUB_CHANNEL, JSON.stringify(message));
  logger.info("published message to redis pubsub");

  await client.quit();
}

export { publishMessage };
