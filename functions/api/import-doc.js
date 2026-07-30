// Cloudflare Pages Function — fetch a public Google Sheet or Doc for the
// auto-fill importer. The file must be shared "Anyone with the link – Viewer".
// Sheets come back as CSV, Docs as plain text; all parsing happens client-side
// (src/lib/importDoc.ts). Proxying avoids CORS and keeps error messages clear.

import { checkAuth } from '../_auth.js';

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

export async function onRequestGet({ request, env }) {
  if (!(await checkAuth(request, env))) return json({ error: 'unauthorized' }, 401);

  const link = new URL(request.url).searchParams.get('url') || '';
  const sheet = link.match(/docs\.google\.com\/spreadsheets\/d\/([\w-]+)/);
  const doc = link.match(/docs\.google\.com\/document\/d\/([\w-]+)/);
  if (!sheet && !doc) {
    return json({ error: 'bad_url', message: 'Paste a Google Sheets or Google Docs link.' }, 400);
  }

  const gid = (link.match(/[#?&]gid=(\d+)/) || [])[1] || '0';
  const target = sheet
    ? `https://docs.google.com/spreadsheets/d/${sheet[1]}/export?format=csv&gid=${gid}`
    : `https://docs.google.com/document/d/${doc[1]}/export?format=txt`;

  let res;
  try {
    res = await fetch(target, { redirect: 'follow' });
  } catch {
    return json({ error: 'upstream_failed', message: 'Could not reach Google Docs.' }, 502);
  }

  const contentType = res.headers.get('content-type') || '';
  if (!res.ok || contentType.includes('text/html')) {
    return json({
      error: 'not_public',
      message:
        'Google refused access to that file. Open its Share settings, set "Anyone with the link – Viewer", then try again.',
    });
  }

  const text = await res.text();
  return json({ kind: sheet ? 'sheet' : 'doc', text: text.slice(0, 500000) });
}
