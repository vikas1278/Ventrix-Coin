import 'dotenv/config';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { REST, Routes } from 'discord.js';
import { commands } from './commands.js';

export async function deploySlashCommands() {
  const { DISCORD_TOKEN, DISCORD_CLIENT_ID } = process.env;
  if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
    console.error('❌ Set DISCORD_TOKEN and DISCORD_CLIENT_ID in .env');
    return false;
  }
  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

  try {
    console.log(`🚀 [DEPLOY] Deploying ${commands.length} slash commands globally...`);
    const registered = await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: commands });
    console.log(`🌍 ✅ [DEPLOY] Successfully deployed ${registered.length} GLOBAL slash commands across all Discord servers!`);
    return true;
  } catch (error) {
    console.error('❌ [DEPLOY] Failed to deploy global commands:', error.message || error);
    return false;
  }
}

// Automatically deploy if executed directly: `node src/deploy-commands.js`
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  deploySlashCommands();
}
