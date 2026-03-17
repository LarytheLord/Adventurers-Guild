/**
 * Discord webhook notification utility.
 * Sends messages to configured Discord channels.
 * Fails gracefully if webhook URLs are not configured.
 */

type DiscordChannel = 'reviews' | 'quests' | 'alerts';

const WEBHOOK_URLS: Record<DiscordChannel, string | undefined> = {
  reviews: process.env.DISCORD_WEBHOOK_REVIEWS,
  quests: process.env.DISCORD_WEBHOOK_QUESTS,
  alerts: process.env.DISCORD_WEBHOOK_ALERTS,
};

export async function notifyDiscord(
  channel: DiscordChannel,
  message: string
): Promise<void> {
  const webhookUrl = WEBHOOK_URLS[channel];
  if (!webhookUrl) return; // Graceful fallback — no webhook configured

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message }),
    });
  } catch (error) {
    // Log but don't throw — Discord notifications should never block core functionality
    console.error(`Discord notification failed (${channel}):`, error);
  }
}
