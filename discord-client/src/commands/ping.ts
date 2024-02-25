import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const PingCommand = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Test command - returns pong!"),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply("pong!");
  },
};

export default PingCommand;
