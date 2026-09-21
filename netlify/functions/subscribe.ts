// Netlify Function: subscribe
// Stores push subscription in Netlify Postgres database

import type { Handler } from '@netlify/functions';
import pg from 'pg';

const { Client } = pg;

interface SubscribeBody {
  subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
    expirationTime?: number | null;
  };
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

  const connectionString = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'NETLIFY_DATABASE_URL env var not set' }),
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

    const client = new Client({ connectionString });
    await client.connect();

    await client.query(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id TEXT PRIMARY KEY,
        endpoint TEXT NOT NULL,
        subscription JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    const subId = Buffer.from(body.subscription.endpoint).toString('base64url').slice(0, 40);

    await client.query(
      `INSERT INTO push_subscriptions (id, endpoint, subscription)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET subscription = $3, created_at = NOW()`,
      [subId, body.subscription.endpoint, JSON.stringify(body.subscription)]
    );

    await client.end();

    console.log(`[subscribe] stored subscription ${subId}`);

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
