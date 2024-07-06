import { Channel, Client, EmbedBuilder, Events, TextChannel } from "discord.js";
import { createEmbed } from "../embeds/recovery-updated";
import {
  CommandClient,
  FitnessRecoveryData,
  FitnessWorkoutData,
} from "../util/types";
import WorkoutUpdatedEmbed from "../embeds/workout-updated";
import logger from "../util/logger";

const getFitnessChannels = (client: Client) => {
  const channels = client.channels.cache
    .filter((channel) => channel instanceof TextChannel)
    .map((channel) => channel);
  const fitnessChannelList = channels.filter(
    (channel) => (channel as TextChannel).name === "fitness"
  );
  if (!fitnessChannelList.length) {
    logger.error('Fitness channel not found')
    return [];
  }
  return fitnessChannelList;
};

const sendEmbedToChannels = (channelList: Channel[], embed: EmbedBuilder) => {
  channelList.forEach((channel) => {
    (channel as TextChannel).send({ embeds: [embed] });
  });
}

const registerEvents = (client: Client) => {
  client.on(Events.ClientReady, (client) => {
    logger.info('Client is ready', { userTag: client.user?.tag });
  });

  (client as CommandClient).onRecoveryUpdated = (data: FitnessRecoveryData) => {
    const embed = createEmbed(data);
    const fitnessChannelList = getFitnessChannels(client);
    sendEmbedToChannels(fitnessChannelList, embed);
  };

  (client as CommandClient).onWorkoutUpdated = (data: FitnessWorkoutData) => {
    const embed = WorkoutUpdatedEmbed().createEmbed(data);
    const fitnessChannelList = getFitnessChannels(client);
    sendEmbedToChannels(fitnessChannelList, embed);
  };
};

export { registerEvents };
