import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { commands } from './commands.js';

const { DISCORD_TOKEN, DISCORD_CLIENT_ID } = process.env;
if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
  console.error('❌ Set DISCORD_TOKEN and DISCORD_CLIENT_ID in .env');
  process.exit(1);
}
const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

try {
  // Deploy slash commands globally across all Discord servers
  console.log(`🚀 Deploying ${commands.length} slash commands globally...`);
  const registered = await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: commands });

  console.log(`🌍 ✅ Successfully deployed ${registered.length} GLOBAL slash commands across all Discord servers!`);
  console.log(`Active commands (${registered.length}): ${registered.map(c => '/' + c.name).join(', ')}`);
} catch (error) {
  console.error('❌ Failed to deploy global commands:', error);
  process.exit(1);
}


