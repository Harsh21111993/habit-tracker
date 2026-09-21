// Netlify Function v2: send-reminders (scheduled)
// Runs on a cron schedule (defined in netlify.toml) at 9 AM and 9 PM IST
// (= 03:30 UTC and 15:30 UTC). For each stored push subscription, sends a
// Web Push notification telling the user to check their habit tracker.
//
// Required Netlify env vars:
//   VAPID_PUBLIC_KEY  - the public key (also baked into the client)
//   VAPID_PRIVATE_KEY - the private key (server only)
//   VAPID_SUBJECT     - mailto: link for Web Push spec compliance

import type { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import webpush from 'web-push';

const STORE_NAME = 'push-subscriptions';

interface StoredEntry {
  subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
    expirationTime?: number | null;
  };
  createdAt: string;
}

// Determine which reminder kind to send based on the current UTC hour.
// Cron runs at 3 times daily (in IST):
//   - 03:30 UTC  =  09:00 IST  -> 'do'      (WWWWW morning habits)
//   - 13:30 UTC  =  19:00 IST  -> 'weights' (7 PM weight workout)
//   - 15:30 UTC  =  21:00 IST  -> 'dont'    (MAN's evening DON'Ts)
function getReminderKind(): 'do' | 'weights' | 'dont' | null {
  const hourUtc = new Date().getUTCHours();
  if (hourUtc === 3 || hourUtc === 4) return 'do';        // 09:00 IST
  if (hourUtc === 13 || hourUtc === 14) return 'weights'; // 19:00 IST
  if (hourUtc === 15 || hourUtc === 16) return 'dont';     // 21:00 IST
  return null;
}

function getPayload(kind: 'do' | 'weights' | 'dont'): { title: string; body: string; tag: string } {
  if (kind === 'do') {
    return {
      title: '🌅 Time to check your WWWWW tracker',
      body: '5 DO\'s not yet marked: Wakeup • Workout • Worship • Wisdom • Weights. Tap to check in.',
      tag: 'wwww-reminder',
    };
  }
  if (kind === 'weights') {
    return {
      title: '🏋️ Time for your Weights workout',
      body: '30-min weight training starts now. Build strength, build discipline. Tap to mark it done after.',
      tag: 'weights-reminder',
    };
  }
  return {
    title: '🌙 Time to check your MAN\'s tracker',
    body: '5 DON\'s not yet marked as avoided: Mast • Alcohol • Non-veg • Sugar • Snacking. Tap to check in.',
    tag: 'mans-reminder',
  };
}

export const handler: Handler = async (event) => {
  console.log('[send-reminders] invoked at', new Date().toISOString(), 'with event:', event.body?.substring(0, 200));

  // Read VAPID keys from env
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:tracker@example.com';

  if (!publicKey || !privateKey) {
    console.error('[send-reminders] missing VAPID env vars');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing VAPID env vars. Set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT in Netlify site settings.' }),
    };
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const kind = getReminderKind();
  if (!kind) {
    console.log('[send-reminders] no reminder scheduled for this hour, exiting');
    return {
      statusCode: 200,
      body: JSON.stringify({ skipped: true, reason: 'not a reminder hour' }),
    };
  }

  // Read all stored subscriptions
  const store = getStore(STORE_NAME);
  const list = await store.list();
  console.log(`[send-reminders] found ${list.blobs.length} subscriptions`);

  const payload = getPayload(kind);
  const pushPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    tag: payload.tag,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    requireInteraction: false,
    data: { url: '/' },
  });

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const blob of list.blobs) {
    try {
      const entry = (await store.get(blob.key, { type: 'json' })) as StoredEntry | null;
      if (!entry || !entry.subscription) {
        console.warn(`[send-reminders] no entry for key ${blob.key}, skipping`);
        continue;
      }

      const result = await webpush.sendNotification(entry.subscription, pushPayload, {
        TTL: 60 * 60, // 1 hour max lifetime if device is offline
        urgency: 'normal',
      });

      if (result.statusCode === 200 || result.statusCode === 201) {
        sent++;
        console.log(`[send-reminders] sent to ${blob.key} (${entry.subscription.endpoint.substring(0, 50)}...)`);
      } else {
        failed++;
        errors.push(`${blob.key}: ${result.statusCode} ${result.body?.substring(0, 100)}`);
        // If the endpoint is gone (410 Gone) or invalid (404), remove the subscription
        if (result.statusCode === 404 || result.statusCode === 410) {
          await store.delete(blob.key);
          console.log(`[send-reminders] removed stale subscription ${blob.key} (${result.statusCode})`);
        }
      }
    } catch (err) {
      failed++;
      const errMsg = String(err).substring(0, 100);
      errors.push(`${blob.key}: ${errMsg}`);
      console.error(`[send-reminders] error for ${blob.key}:`, errMsg);
    }
  }

  console.log(`[send-reminders] done. sent=${sent}, failed=${failed}`);
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      kind,
      sent,
      failed,
      errors: errors.slice(0, 5),
    }),
  };
};
