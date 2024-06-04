import dotenv from "dotenv";
dotenv.config();

const config = {
  token: process.env.DISCORD_BOT_TOKEN ?? "",
  clientId: process.env.DISCORD_CLIENT_ID ?? "",
  secret: process.env.DISCORD_CLIENT_SECRET ?? "",
  port: process.env.PORT ?? 3000,
  apiUrl: process.env.API_URL ?? "",
};

export default config;
