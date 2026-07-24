// Cloudflare Pages Function — Meta Ad Library search, dual provider.
//
// Provider A (recommended for NZ/AU coverage): ScrapeCreators.
//   Set SCRAPECREATORS_API_KEY. Full coverage of all countries, no
//   Meta identity verification needed. Paid (per-credit).
//
// Provider B (official, free): Meta Graph API ads_archive.
//   Set META_ACCESS_TOKEN. Coverage is limited by Meta to political/
//   issue ads worldwide + ads delivered to the UK/EU, and the token's
//   Facebook user must complete identity verification at
//   facebook.com/ads/library/api first.
//
// Both are mapped to the same response shape the UI renders.
// Set env vars in: Cloudflare dashboard → Workers & Pages → project →
// Settings → Environment variables, then redeploy.

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q');
  if (!q) return json({ error: 'missing_query' }, 400);
  const country = (url.searchParams.get('country') || 'NZ').toUpperCase().slice(0, 2);
  const status = url.searchParams.get('status') === 'ALL' ? 'ALL' : 'ACTIVE';

  // Provider A: ScrapeCreators — full country coverage
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
      const ads = (data.searchResults || []).slice(0, 24).map((a) => {
        const snap = a.snapshot || {};
        const img = (Array.isArray(snap.images) && snap.images[0]) || {};
        const video = (Array.isArray(snap.videos) && snap.videos[0]) || {};
        return {
          id: String(a.ad_archive_id || ''),
          page_name: a.page_name,
          ad_creative_bodies: snap.body && snap.body.text ? [snap.body.text] : [],
          ad_creative_link_titles: snap.title ? [snap.title] : [],
          ad_delivery_start_time: a.start_date ? new Date(a.start_date * 1000).toISOString() : undefined,
          ad_snapshot_url: a.ad_archive_id
            ? `https://www.facebook.com/ads/library/?id=${a.ad_archive_id}`
            : undefined,
          publisher_platforms: Array.isArray(a.publisher_platform)
            ? a.publisher_platform.map((p) => String(p).toLowerCase())
            : a.publisher_platform
            ? [String(a.publisher_platform).toLowerCase()]
            : [],
          image:
            img.original_image_url ||
            img.resized_image_url ||
            img.url ||
            video.video_preview_image_url ||
            undefined,
        };
      });
      return json({ ads });
    } catch {
      return json({ error: 'upstream_failed', message: 'Could not reach ScrapeCreators' }, 502);
    }
  }

  // Provider B: official Meta ads_archive
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
