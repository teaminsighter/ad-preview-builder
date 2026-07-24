// Sign-in endpoint (no sign-up — a single team password).
// GET  → { enabled }  whether a password gate is configured
// POST → { token }    on correct password (30-day HMAC token)
//
// Configure: add APP_PASSWORD in Cloudflare → Workers & Pages → project →
// Settings → Environment variables → redeploy. Remove it to disable login.

import { getEnv, makeToken } from '../_auth.js';

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

export async function onRequestGet({ env }) {
  return json({ enabled: !!getEnv(env, 'APP_PASSWORD') });
}

export async function onRequestPost({ request, env }) {
  const secret = getEnv(env, 'APP_PASSWORD');
  if (!secret) return json({ error: 'not_configured' });
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }
  const supplied = String(body.password || '');
  if (supplied !== secret) return json({ error: 'wrong_password' }, 401);
  return json({ token: await makeToken(secret) });
}
