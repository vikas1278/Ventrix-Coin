import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags
} from 'discord.js';
import { multiplierForPicks, MINE_COUNT } from '../../services/gaming.js';
import { coinIcon } from '../../utils/common.js';

export function renderMine(session) {
  const active = session.status === 'active';
  const safePicks = session.revealed.length;
  const currentMultiplierRaw = multiplierForPicks(safePicks);
  const nextMultiplierRaw = safePicks < 6 ? multiplierForPicks(safePicks + 1) : currentMultiplierRaw;

  const currentCashout = safePicks > 0 ? Math.floor(session.bet * currentMultiplierRaw) : 0;
  const nextCashout = safePicks < 6 ? Math.floor(session.bet * nextMultiplierRaw) : currentCashout;

  const currentMultiplier = safePicks > 0 ? (currentCashout / session.bet) : 0;
  const nextMultiplier = safePicks < 6 ? (nextCashout / session.bet) : currentMultiplier;

  let accentColor = 0x7dbbeb; // Sky blue
  let textContent = '';
  const playerName = session.playerName || 'Player';
  const cIcon = coinIcon();

  if (active) {
    textContent =
      `💣 **${playerName}** started a mines game.\n\n` +
      `**Bet:** \`${session.bet.toLocaleString()}\` ${cIcon}  **Mines:** \`${MINE_COUNT}\`\n` +
      `**Cash Out:** \`${currentCashout.toLocaleString()}\` ${cIcon} \`(${currentMultiplier.toFixed(2)}x)\`\n` +
      `**Next:** \`${nextCashout.toLocaleString()}\` ${cIcon} \`(${nextMultiplier.toFixed(2)}x)\``;
  } else if (session.status === 'lost') {
    accentColor = 0xed4245; // Danger red
    textContent =
      `💥 **${playerName}** touched a mine!\n\n` +
      `**Bet:** \`${session.bet.toLocaleString()}\` ${cIcon}  **Mines:** \`${MINE_COUNT}\`\n` +
      `~~**Cash Out:** \`${currentCashout.toLocaleString()}\` \`(${currentMultiplier.toFixed(2)}x)\`~~\n` +
      `~~**Next:** \`${nextCashout.toLocaleString()}\` \`(${nextMultiplier.toFixed(2)}x)\`~~`;
  } else if (session.status === 'cashed_out') {
    accentColor = 0x57f287; // Success green
    const payout = session.payout || currentCashout;
    const profit = payout - session.bet;
    textContent =
      `💰 **${playerName}** cashed out!\n\n` +
      `**Bet:** \`${session.bet.toLocaleString()}\` ${cIcon}  **Mines:** \`${MINE_COUNT}\`\n` +
      `**Payout:** \`${payout.toLocaleString()}\` ${cIcon} \`(${currentMultiplier.toFixed(2)}x)\`\n` +
      `**Profit:** \`+${profit.toLocaleString()}\` ${cIcon}`;
  } else if (session.status === 'won') {
    accentColor = 0x57f287; // Success green
    const payout = session.payout || currentCashout;
    const profit = payout - session.bet;
    textContent =
      `🏆 **${playerName}** cleared the entire board!\n\n` +
      `**Bet:** \`${session.bet.toLocaleString()}\` ${cIcon}  **Mines:** \`${MINE_COUNT}\`\n` +
      `**Won:** \`${payout.toLocaleString()}\` ${cIcon} \`(${currentMultiplier.toFixed(2)}x)\`\n` +
      `**Profit:** \`+${profit.toLocaleString()}\` ${cIcon}`;
  } else if (session.status === 'expired') {
    if (safePicks > 0) {
      accentColor = 0x57f287; // Success green
      const payout = session.payout || currentCashout;
      const profit = payout - session.bet;
      textContent =
        `⏰ **${playerName}** time expired — Auto Cashed Out!\n\n` +
        `**Bet:** \`${session.bet.toLocaleString()}\` ${cIcon}  **Mines:** \`${MINE_COUNT}\`\n` +
        `**Payout:** \`${payout.toLocaleString()}\` ${cIcon} \`(${currentMultiplier.toFixed(2)}x)\`\n` +
        `**${profit >= 0 ? 'Profit' : 'Result'}:** \`${profit >= 0 ? '+' : ''}${profit.toLocaleString()}\` ${cIcon}`;
    } else {
      accentColor = 0x747f8d; // Neutral slate
      textContent =
        `⌛ **${playerName}** time expired without any moves.\n\n` +
        `**Bet:** \`${session.bet.toLocaleString()}\` ${cIcon}  **Mines:** \`${MINE_COUNT}\`\n` +
        `**Refunded:** \`+${session.bet.toLocaleString()}\` ${cIcon} *(No moves played)*`;
    }
  }

  const container = new ContainerBuilder()
    .setAccentColor(accentColor)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(textContent)
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setDivider(true)
    );

  const rows = [];
  for (let row = 0; row < 3; row++) {
    const components = [];
    for (let col = 0; col < 3; col++) {
      const index = row * 3 + col;
      const revealed = session.revealed.includes(index);
      const isMine = session.minePositions.includes(index);
      const isExploded = session.status === 'lost' && (session.explodedIndex === index || (session.explodedIndex === undefined && session.minePositions[0] === index));

      const button = new ButtonBuilder()
        .setCustomId(`mine:tile:${session.sessionId}:${index}`);

      if (active) {
        if (revealed) {
          button.setEmoji('💎');
          button.setStyle(ButtonStyle.Success);
          button.setDisabled(true);
        } else {
          button.setLabel('?');
          button.setStyle(ButtonStyle.Secondary);
          button.setDisabled(false);
        }
      } else {
        button.setDisabled(true);

        if (isExploded) {
          button.setEmoji('💥');
          button.setStyle(ButtonStyle.Danger);
        } else if (revealed && !isMine) {
          button.setEmoji('💎');
          button.setStyle(ButtonStyle.Success);
        } else if (isMine) {
          button.setEmoji('💣');
          button.setStyle(ButtonStyle.Secondary);
        } else {
          button.setEmoji('💎');
          button.setStyle(ButtonStyle.Secondary);
        }
      }

      components.push(button);
    }
    rows.push(new ActionRowBuilder().addComponents(components));
  }

  const cashoutRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`mine:cashout:${session.sessionId}`)
      .setLabel('Cash Out')
      .setEmoji('💵')
      .setStyle(ButtonStyle.Success)
      .setDisabled(!active || safePicks === 0)
  );

  container.addActionRowComponents(...rows, cashoutRow);

  return {
    content: null,
    flags: MessageFlags.IsComponentsV2,
    components: [container]
  };
}

