// Netlify Function: send-reminders (scheduled)
// Reads subscriptions from Postgres and sends Web Push at 9 AM, 7 PM, 9 PM IST

import type { Handler } from '@netlify/functions';
import pg from 'pg';
import webpush from 'web-push';

const { Client } = pg;

function getReminderKind(): 'do' | 'weights' | 'dont' | null {
  const hourUtc = new Date().getUTCHours();
  if (hourUtc === 3 || hourUtc === 4) return 'do';
  if (hourUtc === 13 || hourUtc === 14) return 'weights';
  if (hourUtc === 15 || hourUtc === 16) return 'dont';
  return null;
}

function getPayload(kind: 'do' | 'weights' | 'dont'): { title: string; body: string; tag: string } {
  if (kind === 'do') {
    return {
      title: '🌅 Time to check your WWWWW tracker',
      body: "5 DO's not yet marked: Wakeup • Workout • Worship • Wisdom • Weights. Tap to check in.",
      tag: 'wwww-reminder',
    };
  }
  if (kind === 'weights') {
    return {
      title: '🏋️ Time for your Weights workout',
      body: '30-min weight training starts now. Tap to mark it done after.',
      tag: 'weights-reminder',
    };
  }
  return {
    title: "🌙 Time to check your MAN's tracker",
    body: "5 DON'Ts not yet marked: Mast • Alcohol • Non-veg • Sugar • Snacking. Tap to check in.",
    tag: 'mans-reminder',
  };
}

export const handler: Handler = async (event) => {
  console.log('[send-reminders] invoked at', new Date().toISOString());

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:tracker@example.com';

  if (!publicKey || !privateKey) {
    console.error('[send-reminders] missing VAPID env vars');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing VAPID env vars' }),
    };
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const kind = getReminderKind();
  if (!kind) {
    console.log('[send-reminders] no reminder scheduled for this hour');
    return {
      statusCode: 200,
      body: JSON.stringify({ skipped: true }),
    };
  }

  const connectionString = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'NETLIFY_DATABASE_URL env var not set' }),
    };
  }

  const client = new Client({ connectionString });
  await client.connect();

  const result = await client.query('SELECT subscription FROM push_subscriptions');
  await client.end();

  console.log(`[send-reminders] found ${result.rows.length} subscriptions`);

  const payload = getPayload(kind);
  const pushPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    tag: payload.tag,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    data: { url: '/' },
  });

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const row of result.rows) {
    try {
      const subscription = row.subscription;
      const result = await webpush.sendNotification(subscription, pushPayload, {
        TTL: 60 * 60,
        urgency: 'normal',
      });

      if (result.statusCode === 200 || result.statusCode === 201) {
        sent++;
        console.log(`[send-reminders] sent to ${subscription.endpoint?.substring(0, 50)}...`);
      } else {
        failed++;
        errors.push(`${result.statusCode} ${result.body?.substring(0, 100)}`);
      }
    } catch (err) {
      failed++;
      errors.push(String(err).substring(0, 100));
      console.error('[send-reminders] error:', String(err).substring(0, 200));
    }
  }

  console.log(`[send-reminders] done. sent=${sent}, failed=${failed}`);
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, kind, sent, failed, errors: errors.slice(0, 5) }),
  };
};
