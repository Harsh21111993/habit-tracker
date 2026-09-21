// Netlify Function v2: unsubscribe
// Removes a push subscription when the user disables notifications.
//
// POST /api/unsubscribe
// Body: { endpoint: string }

import type { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

const STORE_NAME = 'push-subscriptions';

interface UnsubscribeBody {
  endpoint: string;
}

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

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
    const body = JSON.parse(event.body || '{}') as UnsubscribeBody;
    if (!body.endpoint) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing endpoint' }),
      };
    }

    const subId = Buffer.from(body.endpoint).toString('base64url').slice(0, 40);
    const store = getStore(STORE_NAME);
    await store.delete(subId);

    console.log(`[unsubscribe] removed subscription ${subId}`);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error('[unsubscribe] error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to remove subscription' }),
    };
  }
};
