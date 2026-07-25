// Cloudflare Pages Function — serve share media stored in R2 (see
// functions/api/upload-media.js).
//
// Intentionally unauthenticated: share-link recipients aren't signed in and
// <video> tags can't attach headers. Keys are unguessable UUIDs, so the URL
// itself is the capability — the same trust model as the share links that
// embed it. Range requests are supported (Safari refuses to play video
// without them).

const parseRange = (header) => {
  const m = /^bytes=(\d*)-(\d*)$/.exec(header || '');
  if (!m || (!m[1] && !m[2])) return undefined;
  if (!m[1]) return { suffix: Number(m[2]) };
  const offset = Number(m[1]);
  return m[2] ? { offset, length: Number(m[2]) - offset + 1 } : { offset };
};

export async function onRequestGet({ params, env, request }) {
  if (!env.MEDIA) return new Response('Not configured', { status: 404 });
  const key = String(params.key || '');
  if (!/^([a-f0-9-]{36}|[a-f0-9]{64})\.[a-z0-9]{1,8}$/.test(key)) return new Response('Not found', { status: 404 });

  const range = parseRange(request.headers.get('range'));
  let object;
  try {
    object = await env.MEDIA.get(key, range ? { range } : undefined);
  } catch {
    return new Response('Invalid range', { status: 416 });
  }
  if (!object) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  headers.set('accept-ranges', 'bytes');

  if (range) {
    const start = 'suffix' in range ? Math.max(0, object.size - range.suffix) : range.offset;
    const end = 'suffix' in range
      ? object.size - 1
      : range.offset + (range.length ?? object.size - range.offset) - 1;
    headers.set('content-range', `bytes ${start}-${Math.min(end, object.size - 1)}/${object.size}`);
    return new Response(object.body, { status: 206, headers });
  }
  return new Response(object.body, { headers });
}
