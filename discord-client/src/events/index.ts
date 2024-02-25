import { Client, Events, TextChannel } from "discord.js";
import { createEmbed } from "../embeds/recovery-updated";
import {
  CommandClient,
  FitnessRecoveryData,
  FitnessWorkoutData,
} from "../util/types";
import WorkoutUpdatedEmbed from "../embeds/workout-updated";

const getFitnessChannel = (client: Client) => {
  const channels = client.channels.cache
    .filter((channel) => channel instanceof TextChannel)
    .map((channel) => channel);
  const fitnessChannelList = channels.filter(
    (channel) => (channel as TextChannel).name === "fitness"
  );
  if (!fitnessChannelList.length) {
    console.log("Fitness channel not found");
    return;
  }
  return fitnessChannelList;
};

const registerEvents = (client: Client) => {
  client.on(Events.ClientReady, (client) => {
    console.log(`Ready! Logged in as ${client.user.tag}`);
  });

  (client as CommandClient).onRecoveryUpdated = (data: FitnessRecoveryData) => {
    const embed = createEmbed(data);
    const fitnessChannelList = getFitnessChannel(client);
    fitnessChannelList?.forEach((channel) => {
      (channel as TextChannel).send({ embeds: [embed] });
    });
  };

  (client as CommandClient).onWorkoutUpdated = (data: FitnessWorkoutData) => {
    const embed = WorkoutUpdatedEmbed().createEmbed(data);
    const fitnessChannelList = getFitnessChannel(client);
    fitnessChannelList?.forEach((channel) => {
      (channel as TextChannel).send({ embeds: [embed] });
    });
  };
};

export { registerEvents };
