import 'dotenv/config';
import dns from 'node:dns';
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}
import mongoose from 'mongoose';
import { Client, GatewayIntentBits, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags } from 'discord.js';
import { handleCommand, handleComponent, handleAutocomplete, commands } from './commands.js';
import { startGmailPolling } from './services/gmail-verifier.js';
import { startRoleExpirationService } from './services/role-expiration.js';
import { startDropboxScheduler } from './services/dropbox.js';
import { getBotDbName, loadAdminsFromDb, getOwnerIds } from './utils/common.js';
import { Guild, DropboxEvent, Blacklist, migrateLedgerIndexes } from './models.js';
import { startWebServer, setServerBotContext } from './web/server.js';
import { deploySlashCommands } from './deploy-commands.js';

if (!process.env.DISCORD_TOKEN || !process.env.MONGODB_URI) {
  console.error('\x1b[31m[ERROR] Missing DISCORD_TOKEN or MONGODB_URI in .env file.\x1b[0m');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ]
});

// Start live HTML dashboard immediately for Render / Cloud port detection
const webServer = startWebServer(client, commands);

client.once(Events.ClientReady, async ready => {
  const owners = getOwnerIds();
  const dbAdmins = await loadAdminsFromDb();
  const dbName = getBotDbName();
  const gmailConfigured = Boolean(
    process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN
  );

  const botName = ready.user.displayName || ready.user.username || 'Vyntrix Coin Bot';
  const botHeader = `⚡  ${botName.toUpperCase()} — NEXT-GEN ECONOMY  🪙`;
  const padding = Math.max(0, Math.floor((65 - botHeader.length) / 2));

  // Run ledger index migration for two-sided transfer consensus
  await migrateLedgerIndexes().catch(() => {});

  // Styled Modern Terminal Banner
  console.log('\n\x1b[36m' + '═'.repeat(65) + '\x1b[0m');
  console.log('\x1b[1m\x1b[36m' + ' '.repeat(padding) + botHeader + '\x1b[0m');
  console.log('\x1b[36m' + '═'.repeat(65) + '\x1b[0m');
  console.log(`\x1b[32m✔ [DISCORD]    \x1b[0mLogged in as \x1b[1m${ready.user.tag}\x1b[0m (ID: ${ready.user.id})`);
  console.log(`\x1b[32m✔ [DATABASE]   \x1b[0mMongoDB Atlas ➔ Database: \x1b[1m\x1b[33m'${dbName}'\x1b[0m (\x1b[32mConnected\x1b[0m)`);
  console.log(`\x1b[34mℹ [OWNERS]     \x1b[0m\x1b[1m${owners.length}\x1b[0m Bot Owner(s) configured in .env (Super-Admin)`);
  console.log(
    `\x1b[34mℹ [ADMINS]     \x1b[0m\x1b[1m${dbAdmins.length}\x1b[0m Admin(s) active in Database (/admin-add)`
  );
  console.log(`\x1b[34mℹ [COMMANDS]   \x1b[0m\x1b[1m${commands.length}\x1b[0m slash commands loaded (bot-owner, admin, public)`);

  if (process.env.DISCORD_CLIENT_SECRET) {
    console.log(`\x1b[32m✔ [OAUTH2]     \x1b[0mDiscord 1-Click Login active (DISCORD_CLIENT_SECRET loaded)`);
  } else {
    console.log(`\x1b[33m⚠ [OAUTH2]     \x1b[0mDiscord 1-Click Login disabled (DISCORD_CLIENT_SECRET missing in .env)`);
  }

  if (gmailConfigured) {
    console.log(`\x1b[32m✔ [GMAIL]      \x1b[0mAutomatic UPI verification active (polling every ${process.env.GMAIL_POLL_SECONDS || 60}s)`);
    startGmailPolling(client);
  } else {
    console.log('\x1b[34mℹ [GMAIL]      \x1b[0mAutomatic email verification disabled (manual /approve-payment active)');
  }

  // Start background role expiration monitor
  startRoleExpirationService(client, 20);

  // Start background Dropbox scheduler and recovery worker
  startDropboxScheduler(client, 5);

  // Sync active guilds into database directory
  for (const g of ready.guilds.cache.values()) {
    await Guild.findOneAndUpdate(
      { guildId: g.id },
      {
        guildId: g.id,
        guildName: g.name,
        iconUrl: g.iconURL() || '',
        memberCount: g.memberCount || 0,
        status: 'active',
        lastActiveAt: new Date(),
      },
      { upsert: true }
    ).catch(() => {});
  }

  setServerBotContext(client, commands);
  console.log(`\x1b[32m✔ [SERVERS]    \x1b[0mActive in \x1b[1m${ready.guilds.cache.size}\x1b[0m Discord server(s)`);
  console.log('\x1b[35m' + '═'.repeat(65) + '\x1b[0m');
  console.log('\x1b[1m\x1b[32m🚀 Status: ONLINE & READY — Listening for slash commands!\x1b[0m\n');
});

client.on(Events.GuildCreate, async guild => {
  console.log(`\x1b[32m✔ [JOINED SERVER]\x1b[0m ${guild.name} (ID: ${guild.id}, Members: ${guild.memberCount})`);
  await Guild.findOneAndUpdate(
    { guildId: guild.id },
    {
      guildId: guild.id,
      guildName: guild.name,
      iconUrl: guild.iconURL() || '',
      memberCount: guild.memberCount || 0,
      status: 'active',
      joinedAt: new Date(),
      lastActiveAt: new Date(),
    },
    { upsert: true }
  ).catch(() => {});
});

client.on(Events.GuildDelete, async guild => {
  console.log(`\x1b[33m⚠ [LEFT SERVER]\x1b[0m ${guild.name} (ID: ${guild.id})`);

  // 1. Mark status as 'left' in Guild model
  await Guild.findOneAndUpdate(
    { guildId: guild.id },
    {
      status: 'left',
      leftAt: new Date(),
    }
  ).catch(() => {});

  // 2. Pause/Cancel active dropboxes for this server
  await DropboxEvent.updateMany(
    { guildId: guild.id, status: { $in: ['active', 'ready', 'pending_setup'] } },
    { status: 'cancelled', cancelReason: 'Bot was removed from server', cancelledBy: 'system' }
  ).catch(() => {});

  // 3. Send notification with 1-click wipe button to Bot Owners
  try {
    const { getGuildRecordCounts } = await import('./commands/bot-owner/clear-server.js');
    const counts = await getGuildRecordCounts(guild.id).catch(() => ({ total: 0 }));

    if (counts.total > 0) {
      const alertEmbed = new EmbedBuilder()
        .setColor(0xed4245)
        .setTitle('⚠️  Bot Removed From Server')
        .setDescription(
          `The bot was removed or kicked from:\n` +
          `🏰 **${guild.name || 'Unknown Server'}** (\`${guild.id}\`)\n\n` +
          `📊 **Database Data Footprint:**\n` +
          `• 👛 Wallets: \`${counts.wallets}\`\n` +
          `• 🛍️ Shop Items: \`${counts.products}\`\n` +
          `• 📦 Orders: \`${counts.orders}\`\n` +
          `• 🎁 Drops: \`${counts.dropboxEvents}\`\n` +
          `• 🔢 **Total DB Records:** **${counts.total}**\n\n` +
          `You can wipe all data for this server now, or keep it preserved for when the bot is re-invited.`
        )
        .setTimestamp();

      const alertRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`wipe_guild_${guild.id}`)
          .setLabel('🗑️ Wipe Server Data Now')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(`keep_guild_${guild.id}`)
          .setLabel('💾 Keep Data for Future')
          .setStyle(ButtonStyle.Secondary)
      );

      const owners = getOwnerIds();
      for (const ownerId of owners) {
        try {
          const user = await client.users.fetch(ownerId).catch(() => null);
          if (user) {
            await user.send({ embeds: [alertEmbed], components: [alertRow] }).catch(() => {});
          }
        } catch {}
      }
    }
  } catch (e) {
    console.error('Error handling guildDelete notification:', e);
  }
});


client.on(Events.InteractionCreate, async interaction => {
  try {
    if (interaction.guildId) {
      const blocked = await Blacklist.findOne({ guildId: interaction.guildId }).lean().catch(() => null);
      if (blocked && !interaction.commandName?.startsWith('bot-')) {
        return interaction.reply({
          content: `❌ This server is not permitted to use this bot.\n**Reason:** ${blocked.reason}`,
          flags: MessageFlags.Ephemeral
        }).catch(() => {});
      }
    }

    if (interaction.isChatInputCommand()) {
      const time = new Date().toLocaleTimeString('en-IN', { hour12: false });
      console.log(`\x1b[90m[${time}]\x1b[0m \x1b[36m/${interaction.commandName}\x1b[0m used by \x1b[33m${interaction.user.tag}\x1b[0m in \x1b[35m${interaction.guild?.name || 'DM'}\x1b[0m`);
      await handleCommand(interaction);
    } else if (interaction.isAutocomplete()) {
      await handleAutocomplete(interaction);
    } else if (interaction.isButton() || interaction.isStringSelectMenu() || interaction.isModalSubmit()) {
      await handleComponent(interaction);
    }
  } catch (err) {
    if (err?.code === 10062) return; // Stale interaction ignored
    console.error('\x1b[31m[DISCORD CLIENT ERROR]\x1b[0m', err);
  }
});

client.on(Events.Error, err => console.error('\x1b[31m[DISCORD CLIENT ERROR]\x1b[0m', err));

mongoose.connection.on('error', err => {
  console.error('\x1b[31m[MONGODB CONNECTION ERROR]\x1b[0m', err?.message || err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('\x1b[33m[MONGODB]\x1b[0m Disconnected from database. Auto-reconnecting...');
});

mongoose.connection.on('reconnected', () => {
  console.log('\x1b[32m✔ [MONGODB]\x1b[0m Reconnected to MongoDB Atlas.');
});

try {
  const dbName = getBotDbName();
  await mongoose.connect(process.env.MONGODB_URI, { dbName, serverSelectionTimeoutMS: 15000 });
  await deploySlashCommands().catch(err => console.warn('[DEPLOY] Auto-deploy warning:', err.message));
  await client.login(process.env.DISCORD_TOKEN);
} catch (error) {
  console.error('\x1b[31m[STARTUP FAILED]\x1b[0m', error);
  process.exit(1);
}

process.on('unhandledRejection', reason => {
  if (reason?.code === 10062 || reason?.message?.includes('Unknown interaction')) return;
  console.error('\x1b[31m[UNHANDLED REJECTION]\x1b[0m', reason);
});

process.on('uncaughtException', err => {
  if (err?.code === 10062 || err?.message?.includes('Unknown interaction')) return;
  console.error('\x1b[31m[UNCAUGHT EXCEPTION]\x1b[0m', err);
});

const shutdown = async () => {
  webServer?.close();
  await mongoose.disconnect().catch(() => {});
  client.destroy();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
