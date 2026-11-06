import { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { Blacklist } from '../../models.js';
import { ownerOnly } from '../../utils/common.js';

export const data = new SlashCommandBuilder()
  .setName('bot-blacklist')
  .setDescription('Blacklist a server from using the bot (Bot Owner Only)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false)
  .addStringOption(option =>
    option
      .setName('guild-id')
      .setDescription('The 17-20 digit Discord Server ID to blacklist')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('reason')
      .setDescription('Reason for blacklisting this server')
      .setRequired(true)
  );

export async function execute(interaction) {
  if (!ownerOnly(interaction)) {
    return interaction.reply({
      content: '❌ This command is strictly restricted to **Bot Owners**.',
      flags: MessageFlags.Ephemeral
    });
  }

  const guildId = interaction.options.getString('guild-id').trim();
  const reason = interaction.options.getString('reason').trim();

  await Blacklist.findOneAndUpdate(
    { guildId },
    {
      guildId,
      reason,
      blacklistedBy: interaction.user.id
    },
    { upsert: true, new: true }
  );

  const guildObj = interaction.client.guilds.cache.get(guildId);
  const serverName = guildObj ? guildObj.name : 'Unknown Server';

  return interaction.reply({
    content: `🚫 Server **${serverName}** (\`${guildId}\`) has been **blacklisted**.\n**Reason:** ${reason}`,
    flags: MessageFlags.Ephemeral
  });
}

