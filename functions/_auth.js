// Shared auth helpers for Pages Functions (files starting with _ are not routed).
//
// Sign-in is a single shared password set as APP_PASSWORD in the Cloudflare
// environment. Successful login returns an HMAC-signed token valid 30 days;
// the costly API endpoints require it whenever APP_PASSWORD is configured.
// If APP_PASSWORD is not set, the app stays open (no lockout by default).

const enc = new TextEncoder();

export const getEnv = (env, name) => {
  if (env[name]) return String(env[name]).trim();
  const key = Object.keys(env).find((k) => k.trim() === name);
  return key ? String(env[key]).trim() : undefined;
};

const toHex = (buf) =>
  [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

const sign = async (secret, payload) => {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return toHex(await crypto.subtle.sign('HMAC', key, enc.encode('adpv:' + payload)));
};

export const makeToken = async (secret) => {
  const expiry = Date.now() + 1000 * 60 * 60 * 24 * 30;
  return `${expiry}.${await sign(secret, String(expiry))}`;
};

// True when the request may proceed (auth disabled, or a valid token supplied)
export const checkAuth = async (request, env) => {
  const secret = getEnv(env, 'APP_PASSWORD');
  if (!secret) return true;
  const token = request.headers.get('x-auth') || '';
  const [expiry, sig] = token.split('.');
  if (!expiry || !sig) return false;
  if (!/^\d+$/.test(expiry) || Number(expiry) < Date.now()) return false;
  return (await sign(secret, expiry)) === sig;
};
