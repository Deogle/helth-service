import { PubSub } from "@google-cloud/pubsub";
import logger from "../../util/logger";
import { PubSubMessage } from "../../types/api";
import { MessageService } from "./messages";

// Create a new instance of the PubSub client
const pubsub = new PubSub();
const { PUBSUB_TOPIC: topicName } = process.env;

//Function to prevent publishing a duplicate message
async function checkIfDuplicateMessage(
  message: PubSubMessage
): Promise<boolean> {
  const messageHash = Buffer.from(JSON.stringify(message)).toString("base64");
  if (!messageHash) {
    throw new Error("Error hashing message");
  }

  const previousMessages = await MessageService.getMessages();
  const seen = previousMessages
    .map((msg: any) => msg.hash)
    .includes(messageHash);
  if (seen) {
    return true;
  }
  await MessageService.createSeenMessage(messageHash);
  return false;
}

async function publishMessage(message: PubSubMessage): Promise<void> {
  if (!topicName) {
    throw new Error("Missing PUBSUB_TOPIC environment variable");
  }
  if (await checkIfDuplicateMessage(message)) {
    logger.info("Ignoring duplicate message", { pubsubData: message });
    return;
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
