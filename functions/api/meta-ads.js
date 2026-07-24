// Cloudflare Pages Function — proxies Meta's official Ad Library API
// (Graph API ads_archive) so the access token never reaches the browser.
//
// Setup: Cloudflare dashboard → Workers & Pages → this project →
// Settings → Environment variables → add META_ACCESS_TOKEN, then redeploy.
//
// Coverage (Meta's rules, not ours): political/issue ads worldwide plus
// all ads delivered to the EU. Ads shown only outside the EU are largely
// not returned by this official endpoint.

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

export async function onRequestGet({ request, env }) {
  if (!env.META_ACCESS_TOKEN) return json({ error: 'not_configured' });

  const url = new URL(request.url);
  const q = url.searchParams.get('q');
  if (!q) return json({ error: 'missing_query' }, 400);
  const country = (url.searchParams.get('country') || 'NZ').toUpperCase().slice(0, 2);
  const status = url.searchParams.get('status') === 'ALL' ? 'ALL' : 'ACTIVE';

  const api = new URL('https://graph.facebook.com/v21.0/ads_archive');
  api.searchParams.set('search_terms', q);
  api.searchParams.set('ad_reached_countries', JSON.stringify([country]));
  api.searchParams.set('ad_active_status', status);
  api.searchParams.set('ad_type', 'ALL');
  api.searchParams.set('limit', '24');
  api.searchParams.set(
    'fields',
    'id,page_id,page_name,ad_creative_bodies,ad_creative_link_titles,ad_creative_link_descriptions,ad_delivery_start_time,ad_delivery_stop_time,ad_snapshot_url,publisher_platforms'
  );
  api.searchParams.set('access_token', env.META_ACCESS_TOKEN);

  try {
    const res = await fetch(api.toString());
    const data = await res.json();
    if (data.error) return json({ error: 'meta_api_error', message: data.error.message });
    return json({ ads: data.data || [] });
  } catch {
    return json({ error: 'upstream_failed', message: 'Could not reach the Meta API' }, 502);
  }
}
