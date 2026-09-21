// Netlify Function: unsubscribe
// Removes push subscription from Netlify Postgres database

import type { Handler } from '@netlify/functions';
import pg from 'pg';

const { Client } = pg;

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

  const connectionString = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'NETLIFY_DATABASE_URL env var not set' }),
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

    const client = new Client({ connectionString });
    await client.connect();
    await client.query('DELETE FROM push_subscriptions WHERE id = $1', [subId]);
    await client.end();

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
