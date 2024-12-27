const handlePubSubMessage = (client: any, message: any) => {
  if (message.type === "workout") {
    client.onWorkoutUpdated(message);
    return true;
  } else if (message.type == "recovery") {
    client.onRecoveryUpdated(message);
    return true;
  } else {
    return false;
  }
};

export { handlePubSubMessage };
