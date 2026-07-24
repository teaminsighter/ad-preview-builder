// Cloudflare Pages Function — Google Ads Transparency Center search.
// Google offers NO official API. Providers, first configured wins:
//
//   1. SEARCHAPI_KEY — searchapi.io (same key as the Meta endpoint;
//      100 free searches to start). Searches by advertiser domain, or
//      resolves a brand name to an advertiser first.
//   2. SERPAPI_KEY  — serpapi.com (free tier: 100 searches/month).
//
// Env vars: Cloudflare dashboard → Workers & Pages → project → Settings →
// Environment variables → add → redeploy.

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

// SerpApi region codes = 2000 + ISO 3166-1 numeric
const SERPAPI_REGIONS = { NZ: '2554', AU: '2036', US: '2840', GB: '2826', CA: '2124', IE: '2372' };

const mapCreative = (a) => ({
  advertiser: (a.advertiser && (a.advertiser.name || a.advertiser)) || undefined,
  format: a.format,
  image: a.image || a.thumbnail || undefined,
  link: a.link,
  details_link: a.details_link,
  first_shown: a.first_shown || a.first_shown_datetime,
  last_shown: a.last_shown || a.last_shown_datetime,
  target_domain: a.target_domain,
});

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();
  if (!q) return json({ error: 'missing_query' }, 400);
  const country = (url.searchParams.get('country') || 'NZ').toUpperCase().slice(0, 2);

  // Provider 1: SearchAPI.io
  if (env.SEARCHAPI_KEY) {
    const call = async (params) => {
      const api = new URL('https://www.searchapi.io/api/v1/search');
      Object.entries(params).forEach(([k, v]) => api.searchParams.set(k, v));
      api.searchParams.set('api_key', env.SEARCHAPI_KEY);
      const res = await fetch(api.toString());
      return res.json();
    };
    try {
      const looksLikeDomain = /\.[a-z]{2,}$/i.test(q) && !q.includes(' ');
      let domain = looksLikeDomain ? q.replace(/^https?:\/\//, '').split('/')[0] : null;
      let advertiserId = null;

      if (!domain) {
        // Resolve brand name → advertiser via the advertiser-search engine
        const found = await call({
          engine: 'google_ads_transparency_center_advertiser_search',
          q,
        });
        const advertisers = found.advertisers || found.results || [];
        if (advertisers.length) {
          advertiserId = advertisers[0].id || advertisers[0].advertiser_id;
          domain = advertisers[0].domain;
        }
      }
      if (!domain && !advertiserId) {
        return json({ ads: [], note: 'No advertiser found for this name — try their website domain (e.g. competitor.co.nz).' });
      }

      const params = { engine: 'google_ads_transparency_center', region: country };
      if (advertiserId) params.advertiser_id = advertiserId;
      else params.domain = domain;
      let data = await call(params);
      if (data.error && params.region) {
        // Some regions may be unsupported — retry without the filter
        delete params.region;
        data = await call(params);
      }
      if (data.error) return json({ error: 'provider_error', message: String(data.error) });
      return json({ ads: (data.ad_creatives || []).slice(0, 24).map(mapCreative) });
    } catch {
      return json({ error: 'upstream_failed', message: 'Could not reach SearchAPI.io' }, 502);
    }
  }

  // Provider 2: SerpApi
  if (env.SERPAPI_KEY) {
    const api = new URL('https://serpapi.com/search.json');
    api.searchParams.set('engine', 'google_ads_transparency_center');
    api.searchParams.set('text', q);
    if (SERPAPI_REGIONS[country]) api.searchParams.set('region', SERPAPI_REGIONS[country]);
    api.searchParams.set('api_key', env.SERPAPI_KEY);
    try {
      const res = await fetch(api.toString());
      const data = await res.json();
      if (data.error) return json({ error: 'serpapi_error', message: String(data.error) });
      return json({ ads: (data.ad_creatives || []).slice(0, 24).map(mapCreative) });
    } catch {
      return json({ error: 'upstream_failed', message: 'Could not reach SerpApi' }, 502);
    }
  }

  return json({ error: 'not_configured' });
}
