// Cloudflare Pages Function — store uploaded share videos in R2.
//
// Used by the "Share preview" flow: uploaded videos are blob: URLs that can't
// travel inside a share link, so they're POSTed here and replaced with a
// permanent /media/<key> URL served by functions/media/[key].js.
//
// Setup: Cloudflare dashboard → Workers & Pages → project → Settings →
// Bindings → Add → R2 bucket → variable name MEDIA → pick/create a bucket →
// redeploy. Without the binding this returns not_configured and the share
// flow falls back to dropping videos (the old behaviour).

import { checkAuth } from '../_auth.js';

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

const EXT = {
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
  'video/x-m4v': 'm4v',
};

// Keep uploads under the Workers request-body limit (100 MiB on free plans)
const MAX_BYTES = 95 * 1024 * 1024;

export async function onRequestPost({ request, env }) {
  if (!(await checkAuth(request, env))) return json({ error: 'unauthorized' }, 401);
  if (!env.MEDIA) {
    return json(
      { error: 'not_configured', message: 'Add an R2 bucket binding named MEDIA to this Pages project' },
      501
    );
  }

  const type = (request.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  if (!type.startsWith('video/')) {
    return json({ error: 'unsupported_type', message: 'Only video uploads are accepted' }, 415);
  }

  const length = Number(request.headers.get('content-length') || 0);
  if (!length) return json({ error: 'missing_body', message: 'Empty upload' }, 400);
  if (length > MAX_BYTES) {
    return json({ error: 'too_large', message: 'Videos must be under 95 MB to share' }, 413);
  }

  const ext = EXT[type] || type.split('/')[1].replace(/[^a-z0-9]/g, '').slice(0, 8) || 'bin';
  const key = `${crypto.randomUUID()}.${ext}`;
  try {
    await env.MEDIA.put(key, request.body, { httpMetadata: { contentType: type } });
  } catch (e) {
    return json({ error: 'storage_failed', message: e && e.message ? e.message : 'R2 write failed' }, 502);
  }
  return json({ url: `/media/${key}` });
}
