// Cloudflare Pages Function — owner's storage manager for the MEDIA bucket.
//
// Share videos are uploaded to R2 by /api/upload-media and served from
// /media/<key>. This endpoint lets the app list and delete them without
// opening the Cloudflare dashboard. Editable-share JSON lives under shares/
// and is managed by /api/shared-ad, so it is excluded here.
//
// - GET:    list stored media files (auth required)
// - DELETE ?key=<key>: remove one file (auth required). Any share link that
//   embeds the file keeps working, but that video shows as missing.

import { checkAuth } from '../_auth.js';

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

// Same shape /media/[key].js serves: uuid or sha256 hash + short extension
const KEY_RE = /^([a-f0-9-]{36}|[a-f0-9]{64})\.[a-z0-9]{1,8}$/;

export async function onRequestGet({ request, env }) {
  if (!(await checkAuth(request, env))) return json({ error: 'unauthorized' }, 401);
  if (!env.MEDIA) return json({ error: 'not_configured', message: 'R2 bucket MEDIA is not bound' }, 501);

  const files = [];
  let cursor;
  do {
    const page = await env.MEDIA.list({ limit: 1000, cursor });
    for (const obj of page.objects) {
      if (!KEY_RE.test(obj.key)) continue; // skips shares/ JSON and anything foreign
      files.push({
        key: obj.key,
        size: obj.size,
        uploaded: obj.uploaded ? new Date(obj.uploaded).getTime() : null,
      });
    }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);

  files.sort((a, b) => (b.uploaded || 0) - (a.uploaded || 0));
  return json({ files });
}

export async function onRequestDelete({ request, env }) {
  if (!(await checkAuth(request, env))) return json({ error: 'unauthorized' }, 401);
  if (!env.MEDIA) return json({ error: 'not_configured', message: 'R2 bucket MEDIA is not bound' }, 501);
  const key = new URL(request.url).searchParams.get('key') || '';
  if (!KEY_RE.test(key)) return json({ error: 'bad_key' }, 400);
  await env.MEDIA.delete(key);
  return json({ ok: true });
}
