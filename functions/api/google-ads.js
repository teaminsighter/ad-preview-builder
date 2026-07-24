// Cloudflare Pages Function — Google Ads Transparency Center search.
// Google offers NO official API; this proxies SerpApi's
// google_ads_transparency_center engine (paid service) and keeps the
// key server-side.
//
// Setup: Cloudflare dashboard → Workers & Pages → this project →
// Settings → Environment variables → add SERPAPI_KEY, then redeploy.

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

// SerpApi region codes = 2000 + ISO 3166-1 numeric
const REGIONS = { NZ: '2554', AU: '2036', US: '2840', GB: '2826', CA: '2124', IE: '2372' };

export async function onRequestGet({ request, env }) {
  if (!env.SERPAPI_KEY) return json({ error: 'not_configured' });

  const url = new URL(request.url);
  const q = url.searchParams.get('q');
  if (!q) return json({ error: 'missing_query' }, 400);
  const country = (url.searchParams.get('country') || 'NZ').toUpperCase().slice(0, 2);

  const api = new URL('https://serpapi.com/search.json');
  api.searchParams.set('engine', 'google_ads_transparency_center');
  api.searchParams.set('text', q);
  if (REGIONS[country]) api.searchParams.set('region', REGIONS[country]);
  api.searchParams.set('api_key', env.SERPAPI_KEY);

  try {
    const res = await fetch(api.toString());
    const data = await res.json();
    if (data.error) return json({ error: 'serpapi_error', message: String(data.error) });
    const ads = (data.ad_creatives || []).slice(0, 24).map((a) => ({
      advertiser: a.advertiser,
      format: a.format,
      image: a.image,
      link: a.link,
      details_link: a.details_link,
      first_shown: a.first_shown,
      last_shown: a.last_shown,
      target_domain: a.target_domain,
    }));
    return json({ ads });
  } catch {
    return json({ error: 'upstream_failed', message: 'Could not reach SerpApi' }, 502);
  }
}
