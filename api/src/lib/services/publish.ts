import { PubSub } from "@google-cloud/pubsub";
import logger from "../../util/logger";
import { PubSubMessage } from "../../types/api";

// Create a new instance of the PubSub client
const pubsub = new PubSub();
const { PUBSUB_TOPIC: topicName } = process.env;

// Function to publish a message to a topic
async function publishMessage(
  message: PubSubMessage
): Promise<void> {
  if (!topicName) {
    throw new Error("Missing PUBSUB_TOPIC environment variable");
  }
  try {
    const topic = pubsub.topic(topicName);

    await topic.publishMessage({
      json: message,
    });

    logger.info("Published message", {
      topic: topic.name,
      pubsubData: message,
    });
  } catch (error) {
    logger.error("Error publishing message", error);
  }
}

export { publishMessage };
