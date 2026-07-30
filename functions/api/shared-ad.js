// Cloudflare Pages Function — editable ("collab") share links.
//
// Unlike #s= links (whole ad packed into the URL, view-only), an editable
// share stores the ad JSON in the MEDIA R2 bucket under shares/<uuid>.json.
// The link carries only the id (#e=<id>); recipients load the latest copy,
// edit in the full builder, and save back with their email attached.
//
// - POST  (owner, app-authenticated): create a share      → { id }
// - GET   ?id=<uuid> (unauthenticated — the unguessable id IS the
//         capability, same trust model as /media/<key>):  → { data, ... }
// - PUT   { id, email, data } (unauthenticated + email):  save an edit
//
// Every save is also forwarded to the Apps Script webhook in
// SHEET_WEBHOOK_URL (see apps-script/SharedAdEdits.gs) so the master
// Google Sheet always shows the latest copy and who last touched it.

import { checkAuth, getEnv } from '../_auth.js';

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

const ID_RE = /^[a-f0-9-]{36}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_BODY = 20 * 1024 * 1024; // downscaled images travel as data URLs
const key = (id) => `shares/${id}.json`;

const readShare = async (env, id) => {
  const obj = await env.MEDIA.get(key(id));
  if (!obj) return null;
  try {
    return JSON.parse(await obj.text());
  } catch {
    return null;
  }
};

// Flatten the ad payload into labelled sheet columns
const joinList = (v) => (Array.isArray(v) ? v.filter(Boolean).join(' | ') : '');
const sheetValues = (data) => ({
  'Ad Name': data.metaAdName || '',
  Platform: data.platform || '',
  Headlines: joinList(data.headlines?.some?.((h) => h) ? data.headlines : data.metaHeadlines),
  Descriptions: joinList(data.descriptions?.some?.((d) => d) ? data.descriptions : [data.metaDescription]),
  'Primary Texts': joinList(data.primaryTexts),
  CTA: data.metaCtaText || data.ctaText || '',
  'Final URL': data.finalUrl || data.metaDestinationUrl || '',
  'Page / Business': data.pageName || data.businessName || '',
});

const pushToSheet = async (env, id, email, data, shareUrl) => {
  const webhook = getEnv(env, 'SHEET_WEBHOOK_URL');
  if (!webhook) return 'not_configured';
  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        id,
        email,
        editedAt: new Date().toISOString(),
        shareUrl,
        values: sheetValues(data),
      }),
      redirect: 'follow', // Apps Script replies via a 302 to googleusercontent
    });
    return res.ok ? 'synced' : 'failed';
  } catch {
    return 'failed';
  }
};

export async function onRequestGet({ request, env }) {
  if (!env.MEDIA) return json({ error: 'not_configured', message: 'R2 bucket MEDIA is not bound' }, 501);
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!ID_RE.test(id)) return json({ error: 'bad_id' }, 400);
  const share = await readShare(env, id);
  if (!share) return json({ error: 'not_found', message: 'This share link no longer exists.' }, 404);
  const lastEdit = share.edits[share.edits.length - 1];
  return json({
    data: share.data,
    updatedAt: lastEdit ? lastEdit.at : share.createdAt,
    lastEditor: lastEdit ? lastEdit.email : null,
    editCount: share.edits.length,
  });
}

export async function onRequestPost({ request, env }) {
  if (!(await checkAuth(request, env))) return json({ error: 'unauthorized' }, 401);
  if (!env.MEDIA) return json({ error: 'not_configured', message: 'R2 bucket MEDIA is not bound' }, 501);
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY) {
    return json({ error: 'too_large' }, 413);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad_json' }, 400);
  }
  if (!body || typeof body.data !== 'object' || body.data === null) {
    return json({ error: 'missing_data' }, 400);
  }
  const id = crypto.randomUUID();
  await env.MEDIA.put(
    key(id),
    JSON.stringify({ data: body.data, createdAt: Date.now(), edits: [] }),
    { httpMetadata: { contentType: 'application/json' } }
  );
  return json({ id });
}

export async function onRequestPut({ request, env }) {
  if (!env.MEDIA) return json({ error: 'not_configured', message: 'R2 bucket MEDIA is not bound' }, 501);
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY) {
    return json({ error: 'too_large', message: 'The ad is too large to save — remove some uploaded images.' }, 413);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad_json' }, 400);
  }
  const id = String(body?.id || '');
  const email = String(body?.email || '').trim().toLowerCase();
  if (!ID_RE.test(id)) return json({ error: 'bad_id' }, 400);
  if (!EMAIL_RE.test(email)) {
    return json({ error: 'bad_email', message: 'A valid email address is required to save changes.' }, 400);
  }
  if (typeof body.data !== 'object' || body.data === null) return json({ error: 'missing_data' }, 400);

  const share = await readShare(env, id);
  if (!share) return json({ error: 'not_found', message: 'This share link no longer exists.' }, 404);

  share.data = body.data;
  share.edits.push({ email, at: Date.now() });
  if (share.edits.length > 200) share.edits = share.edits.slice(-200);
  await env.MEDIA.put(key(id), JSON.stringify(share), {
    httpMetadata: { contentType: 'application/json' },
  });

  const shareUrl = `${new URL(request.url).origin}/#e=${id}`;
  const sheet = await pushToSheet(env, id, email, body.data, shareUrl);
  return json({ ok: true, sheet });
}
