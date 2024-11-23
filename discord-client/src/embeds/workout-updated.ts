import { EmbedBuilder } from "discord.js";
import { FitnessWorkoutData } from "../util/types";
import logger from "../util/logger";

const WorkoutUpdatedEmbed = () => {
  const StrainMap = {
    HIGH: 0x0093e7,
  };

  const getWorkoutColor = (strain: string) => {
    return StrainMap.HIGH;
  };

  const getWorkoutIntensity = (strain: string, provider: string) => {
    if (provider === "whoop") {
      return `${((parseInt(strain) / 21) * 100).toFixed(0)}%`;
    }
    return "N/A";
  };

  const createEmbed = (data: FitnessWorkoutData) => {
    logger.info("Creating workout updated embed", { data });
    const embed = new EmbedBuilder()
      .setColor(getWorkoutColor(data.strain))
      .setTitle("Workout Updated")
      .setDescription(`**${data.email}** just finished a workout!`)
      .setTimestamp(new Date(data.date))
      .addFields(
        {
          name: "Activity",
          value: data.activity,
          inline: true,
        },
        {
          name: "Duration",
          value: data.duration,
          inline: true,
        },
        {
          name: "Average Heart Rate",
          value: data.avgHr,
          inline: true,
        },
        { name: "Max Heart Rate", value: data.maxHr, inline: true },
        {
          name: "Calories",
          value: `${data.calories}`,
          inline: true,
        }
      );

    if (getWorkoutIntensity(data.strain, data.provider) !== "N/A") {
      embed.addFields({
        name: "Intensity",
        value: data.strain,
        inline: true,
      });
    }

    if (parseFloat(data.distance) > 0) {
      embed.addFields({
        name: "Distance",
        value: data.distance,
        inline: true,
      });
    }

    return embed;
  };
  return {
    createEmbed,
  };
};
export default WorkoutUpdatedEmbed;
