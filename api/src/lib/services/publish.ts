import { PubSub } from "@google-cloud/pubsub";

// Create a new instance of the PubSub client
const pubsub = new PubSub();
const { PUBSUB_TOPIC: topicName } = process.env;

// Function to publish a message to a topic
async function publishMessage(
  message: { [key: string]: any } | string
): Promise<void> {
  if (!topicName) {
    throw new Error("Missing PUBSUB_TOPIC environment variable");
  }
  try {
    const topic = pubsub.topic(topicName);

    if (typeof message === "object") {
      message = JSON.stringify(message);
    }

    await topic.publish(Buffer.from(message));

    console.log(`Message published to topic: ${topicName}`);
  } catch (error) {
    console.error("Error publishing message:", error);
  }
}

export { publishMessage };
