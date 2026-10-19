import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { setCoinRate, inrToCoins, formatCoins, coinIcon, coinName, C, err, replyEmbed, adminOnly } from '../../utils/common.js';

export const data = new SlashCommandBuilder()
  .setName('set-rate')
  .setDescription('Configure the coin conversion rate: how many coins per 1 INR (admin)')
  .addNumberOption(o => o.setName('rate').setDescription('Coins per 1 INR (e.g. 1 means ₹100 = 100 coins)').setRequired(true).setMinValue(0.01));

export async function execute(interaction) {
  if (!adminOnly(interaction)) {
    return replyEmbed(interaction, err('Access Denied', 'This command is restricted to administrators.'));
  }

  const rate = interaction.options.getNumber('rate');
  await setCoinRate(rate, interaction.user.id, interaction.guildId || 'global');

  const embed = new EmbedBuilder()
    .setColor(C.success)
    .setTitle('⚙️  Conversion Rate Updated')
    .setDescription(`The INR-to-${coinName()} conversion rate has been updated.`)
    .addFields(
      { name: `${coinIcon()} New Rate`, value: `**1 INR = ${rate} ${coinName()}**`, inline: true },
      { name: '💡 Example',  value: `₹100 payment = **${formatCoins(inrToCoins(100, rate))}**`, inline: true },
      { name: '🛡️ Set By',   value: `<@${interaction.user.id}>`, inline: true },
    )
    .setFooter({ text: 'All new /buycoin orders will use this conversion rate' })
    .setTimestamp();

  return replyEmbed(interaction, embed);
}
