import { EmbedBuilder } from "@discordjs/builders";
import { FitnessRecoveryData } from "../util/types";

const RecoveryColorMap = {
  LOW: 0xff0026,
  MEDIUM: 0xffde00,
  HIGH: 0x16ec06,
};

const getRecoveryColor = (recovery: number) => {
  if (recovery < 33) return RecoveryColorMap.LOW;
  if (recovery < 67) return RecoveryColorMap.MEDIUM;
  return RecoveryColorMap.HIGH;
};

const convertSleepToHours = (hours: string) => {
  const sleepTime = parseFloat(hours);
  const minutes = Math.floor((sleepTime - Math.floor(sleepTime)) * 60);
  return `${Math.floor(sleepTime)}h ${minutes}m`;
};

const createEmbed = (data: FitnessRecoveryData) => {
  const embed = new EmbedBuilder()
    .setColor(getRecoveryColor(data.aggregatedScore))
    .setTitle("Fitness Recovery Update")
    .setDescription(`**${data.email}**'s recovery score has been updated!`)
    .setTimestamp(new Date(data.date))
    .addFields(
      {
        name: "Aggregated Score",
        value: `${data.aggregatedScore}`,
        inline: true,
      },
      {
        name: "Resting Heart Rate",
        value: data.restingHr,
        inline: true,
      },
      { name: "HRV", value: data.hrv, inline: true },
      {
        name: "Sleep Time",
        value: convertSleepToHours(data.sleepTime),
        inline: true,
      }
    );

  return embed;
};

export { createEmbed };
