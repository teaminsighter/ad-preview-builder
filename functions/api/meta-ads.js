// Cloudflare Pages Function — Meta Ad Library search, multi-provider.
// First configured provider wins:
//
//   1. SEARCHAPI_KEY       — searchapi.io (easiest: ONE key also powers the
//                            Google endpoint; full country coverage, no Meta
//                            identity verification; 100 free searches to start)
//   2. SCRAPECREATORS_API_KEY — scrapecreators.com (full coverage, paid)
//   3. META_ACCESS_TOKEN   — official Graph ads_archive (free, but requires
//                            the account owner's identity verification and
//                            only covers political ads + UK/EU-delivered ads)
//
// Env vars: Cloudflare dashboard → Workers & Pages → project → Settings →
// Environment variables → add → redeploy.

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

const toIso = (d) => {
  if (!d) return undefined;
  if (typeof d === 'number') return new Date(d * (d < 1e12 ? 1000 : 1)).toISOString();
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
};

// Normalise a ScrapeCreators/SearchAPI-style ad (ad_archive_id + snapshot)
const mapArchiveAd = (a) => {
  const snap = a.snapshot || {};
  const body = typeof snap.body === 'string' ? snap.body : (snap.body && snap.body.text) || '';
  const img = (Array.isArray(snap.images) && snap.images[0]) || {};
  const video = (Array.isArray(snap.videos) && snap.videos[0]) || {};
  const platforms = Array.isArray(a.publisher_platform)
    ? a.publisher_platform
    : a.publisher_platform
    ? [a.publisher_platform]
    : Array.isArray(a.publisher_platforms)
    ? a.publisher_platforms
    : [];
  return {
    id: String(a.ad_archive_id || a.id || ''),
    page_name: a.page_name,
    ad_creative_bodies: body ? [body] : [],
    ad_creative_link_titles: snap.title ? [snap.title] : [],
    ad_delivery_start_time: toIso(a.start_date),
    ad_snapshot_url: a.ad_archive_id
      ? `https://www.facebook.com/ads/library/?id=${a.ad_archive_id}`
      : a.ad_snapshot_url,
    publisher_platforms: platforms.map((p) => String(p).toLowerCase()),
    image:
      img.original_image_url ||
      img.resized_image_url ||
      img.url ||
      video.video_preview_image_url ||
      undefined,
  };
};

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q');
  if (!q) return json({ error: 'missing_query' }, 400);
  const country = (url.searchParams.get('country') || 'NZ').toUpperCase().slice(0, 2);
  const status = url.searchParams.get('status') === 'ALL' ? 'ALL' : 'ACTIVE';

  // Provider 1: SearchAPI.io — one key for Meta AND Google
  if (env.SEARCHAPI_KEY) {
    const api = new URL('https://www.searchapi.io/api/v1/search');
    api.searchParams.set('engine', 'meta_ad_library');
    api.searchParams.set('q', q);
    api.searchParams.set('country', country);
    api.searchParams.set('active_status', status.toLowerCase());
    api.searchParams.set('api_key', env.SEARCHAPI_KEY);
    try {
      const res = await fetch(api.toString());
      const data = await res.json();
      if (data.error) return json({ error: 'provider_error', message: String(data.error) });
      const raw = data.ads || data.results || [];
      return json({ ads: raw.slice(0, 24).map(mapArchiveAd) });
    } catch {
      return json({ error: 'upstream_failed', message: 'Could not reach SearchAPI.io' }, 502);
    }
  }

  // Provider 2: ScrapeCreators
  if (env.SCRAPECREATORS_API_KEY) {
    const api = new URL('https://api.scrapecreators.com/v1/facebook/adLibrary/search/ads');
    api.searchParams.set('query', q);
    api.searchParams.set('country', country);
    api.searchParams.set('status', status);
    api.searchParams.set('media_type', 'ALL');
    try {
      const res = await fetch(api.toString(), {
        headers: { 'x-api-key': env.SCRAPECREATORS_API_KEY },
      });
      const data = await res.json();
      if (!data.success && !Array.isArray(data.searchResults)) {
        return json({ error: 'provider_error', message: data.message || 'ScrapeCreators request failed' });
      }
      return json({ ads: (data.searchResults || []).slice(0, 24).map(mapArchiveAd) });
    } catch {
      return json({ error: 'upstream_failed', message: 'Could not reach ScrapeCreators' }, 502);
    }
  }

  // Provider 3: official Meta ads_archive
  if (env.META_ACCESS_TOKEN) {
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

  return json({ error: 'not_configured' });
}
