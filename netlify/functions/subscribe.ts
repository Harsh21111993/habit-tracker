// Netlify Function v2: subscribe
// Receives a Web Push subscription from the client and stores it in Netlify
// Blobs. Used by send-reminders.ts to know which devices to push to.
//
// POST /api/subscribe
// Body: { subscription: PushSubscriptionJSON }
// Returns: { success: true } or { error: string }

import type { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

const STORE_NAME = 'push-subscriptions';

interface SubscribeBody {
  subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
    expirationTime?: number | null;
  };
}

export const handler: Handler = async (event) => {
  // CORS headers - allow the tracker (any origin) to call this endpoint
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}') as SubscribeBody;
    if (!body.subscription?.endpoint || !body.subscription?.keys?.p256dh || !body.subscription?.keys?.auth) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing subscription fields' }),
      };
    }

    // Use a hash of the endpoint as the blob key (so each device is stored
    // separately, and re-subscription just overwrites the same key)
    const subId = Buffer.from(body.subscription.endpoint).toString('base64url').slice(0, 40);

    const store = getStore(STORE_NAME);
    await store.setJSON(subId, {
      subscription: body.subscription,
      createdAt: new Date().toISOString(),
    });

    console.log(`[subscribe] stored subscription ${subId} for endpoint ${body.subscription.endpoint.substring(0, 60)}...`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, id: subId }),
    };
  } catch (err) {
    console.error('[subscribe] error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to store subscription', detail: String(err) }),
    };
  }
};
