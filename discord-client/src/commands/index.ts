import { BaseInteraction, Collection, Events, REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";
import config from "../config";
import { CommandClient } from "../util/types";
import logger from "../util/logger";

const commandPath = path.join(__dirname, "./");
const commandFiles = fs.readdirSync(commandPath).filter((file) => {
  if (file === "index.ts") return false;
  return file.endsWith(".ts");
});

const loadCommands = async (client: CommandClient) => {
  await Promise.all(
    commandFiles.map(async (file) => {
      const command = (await import(path.join(commandPath, file))).default;
      if (!command.data || !command.execute)
        throw new Error(
          "[ERROR] The Command is not valid - missing data or execute"
        );
      client.commands?.set(command.data.name, command);
    })
  );
};

const registerInteractionHandler = (client: CommandClient) => {
  client.on(Events.InteractionCreate, (interaction: BaseInteraction) => {
    if (!interaction.isChatInputCommand()) return;
    const interactionClient: CommandClient = interaction.client;
    const command = interactionClient.commands?.get(interaction.commandName);

    if (!command) return;
    command.execute(interaction);
  });
};

const registerCommands = async (client: CommandClient) => {
  client.commands = new Collection();

  await loadCommands(client);
  registerInteractionHandler(client);

  const guildList = client.guilds.cache.map((guild) => guild.id);

  const rest = new REST().setToken(config.token);

  const commandJSON = client.commands?.map((command) => command.data.toJSON());
  if (!commandJSON)
    throw new Error(
      "No commands found to register (commandJSON is undefined) - check your commands folder"
    );

  guildList.forEach(async (guildId) => {
    try {
      await rest.put(
        Routes.applicationGuildCommands(config.clientId, guildId),
        {
          body: commandJSON,
        }
      );
    } catch (error) {
      logger.error(`Failed to register app commands (/) for guild`, {guild: guildId, error})
    }
  });
};

export { registerCommands };
