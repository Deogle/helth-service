// Require the necessary discord.js classes
import { Client, GatewayIntentBits } from "discord.js";
import { registerCommands } from "./commands";
import { registerEvents } from "./events";
import config from "./config";
import { initializeServer } from "./http";

const { token } = config;

// Create a new client instance
(async () => {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  registerEvents(client);
  await client.login(token);
  registerCommands(client);

  await initializeServer(client);
})();
