// Cloudflare Pages Function — Meta Ad Library search, multi-provider.
// First configured provider wins:
//
//   1. APIFY_TOKEN         — apify.com FREE plan: $5 credits renew monthly,
//                            actor costs $0.75/1,000 ads ≈ 6,600 ads/month
//                            free. All countries, no identity verification.
//                            Searches take ~30-90s (a live scrape runs).
//   2. SEARCHAPI_KEY       — searchapi.io (fast; ONE key also powers the
//                            Google endpoint; 100 free searches, then paid)
//   3. SCRAPECREATORS_API_KEY — scrapecreators.com (full coverage, paid)
//   4. META_ACCESS_TOKEN   — official Graph ads_archive (free forever, but
//                            requires the account owner's identity
//                            verification; political + UK/EU ads only)
//
// Env vars: Cloudflare dashboard → Workers & Pages → project → Settings →
// Environment variables → add → redeploy.

import { checkAuth } from '../_auth.js';

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

// Tolerate accidental whitespace in dashboard-entered variable names/values
const getEnv = (env, name) => {
  if (env[name]) return String(env[name]).trim();
  const key = Object.keys(env).find((k) => k.trim() === name);
  return key ? String(env[key]).trim() : undefined;
};

const toIso = (d) => {
  if (!d) return undefined;
  if (typeof d === 'number') return new Date(d * (d < 1e12 ? 1000 : 1)).toISOString();
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
};

// Normalise an Ad Library-shaped ad (ad_archive_id + snapshot), covering the
// snake_case and camelCase variants used by Apify/ScrapeCreators/SearchAPI
const mapArchiveAd = (a) => {
  const snap = a.snapshot || {};
  const card = (Array.isArray(snap.cards) && snap.cards[0]) || {};
  const body =
    (typeof snap.body === 'string' ? snap.body : snap.body && snap.body.text) ||
    (typeof card.body === 'string' ? card.body : card.body && card.body.text) ||
    '';
  const img = (Array.isArray(snap.images) && snap.images[0]) || {};
  const video = (Array.isArray(snap.videos) && snap.videos[0]) || {};
  const rawPlatforms =
    a.publisher_platform ?? a.publisherPlatform ?? a.publisher_platforms ?? [];
  const platforms = Array.isArray(rawPlatforms) ? rawPlatforms : [rawPlatforms];
  const archiveId = a.ad_archive_id || a.adArchiveID || a.adArchiveId || a.id;
  return {
    id: String(archiveId || ''),
    page_name: a.page_name || a.pageName,
    ad_creative_bodies: body ? [body] : [],
    ad_creative_link_titles: snap.title ? [snap.title] : card.title ? [card.title] : [],
    ad_delivery_start_time: toIso(a.start_date ?? a.startDate),
    ad_snapshot_url: archiveId
      ? `https://www.facebook.com/ads/library/?id=${archiveId}`
      : a.ad_snapshot_url,
    publisher_platforms: platforms.filter(Boolean).map((p) => String(p).toLowerCase()),
    image:
      img.original_image_url ||
      img.resized_image_url ||
      img.url ||
      video.video_preview_image_url ||
      card.original_image_url ||
      card.resized_image_url ||
      undefined,
  };
};

export async function onRequestGet({ request, env }) {
  if (!(await checkAuth(request, env))) return json({ error: 'unauthorized' }, 401);
  const url = new URL(request.url);
  const q = url.searchParams.get('q');
  if (!q) return json({ error: 'missing_query' }, 400);
  const country = (url.searchParams.get('country') || 'NZ').toUpperCase().slice(0, 2);
  const status = url.searchParams.get('status') === 'ALL' ? 'ALL' : 'ACTIVE';

  // Provider 1: Apify — FREE forever ($5 credits renew monthly ≈ 6,600 ads).
  // Runs a live scrape of the Ad Library, so allow up to ~2 minutes.
  const APIFY_TOKEN = getEnv(env, 'APIFY_TOKEN');
  if (APIFY_TOKEN) {
    const libraryUrl =
      'https://www.facebook.com/ads/library/?active_status=' +
      status.toLowerCase() +
      '&ad_type=all&country=' +
      encodeURIComponent(country) +
      '&q=' +
      encodeURIComponent(q) +
      '&search_type=keyword_unordered&media_type=all';
    const api =
      'https://api.apify.com/v2/acts/curious_coder~facebook-ads-library-scraper/run-sync-get-dataset-items?timeout=120&token=' +
      encodeURIComponent(APIFY_TOKEN);
    try {
      const res = await fetch(api, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ urls: [{ url: libraryUrl }], count: 24 }),
      });
      const data = await res.json();
      if (!Array.isArray(data)) {
        return json({
          error: 'provider_error',
          message: (data && data.error && data.error.message) || 'Apify run failed',
        });
      }
      return json({ ads: data.slice(0, 24).map(mapArchiveAd) });
    } catch {
      return json({ error: 'upstream_failed', message: 'Could not reach Apify' }, 502);
    }
  }

  // Provider 2: SearchAPI.io — one key for Meta AND Google
  const SEARCHAPI_KEY = getEnv(env, 'SEARCHAPI_KEY');
  if (SEARCHAPI_KEY) {
    const api = new URL('https://www.searchapi.io/api/v1/search');
    api.searchParams.set('engine', 'meta_ad_library');
    api.searchParams.set('q', q);
    api.searchParams.set('country', country);
    api.searchParams.set('active_status', status.toLowerCase());
    api.searchParams.set('api_key', SEARCHAPI_KEY);
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
  const SCRAPECREATORS_API_KEY = getEnv(env, 'SCRAPECREATORS_API_KEY');
  if (SCRAPECREATORS_API_KEY) {
    const api = new URL('https://api.scrapecreators.com/v1/facebook/adLibrary/search/ads');
    api.searchParams.set('query', q);
    api.searchParams.set('country', country);
    api.searchParams.set('status', status);
    api.searchParams.set('media_type', 'ALL');
    try {
      const res = await fetch(api.toString(), {
        headers: { 'x-api-key': SCRAPECREATORS_API_KEY },
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
  const META_ACCESS_TOKEN = getEnv(env, 'META_ACCESS_TOKEN');
  if (META_ACCESS_TOKEN) {
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
    api.searchParams.set('access_token', META_ACCESS_TOKEN);
    try {
      const res = await fetch(api.toString());
      const data = await res.json();
      if (data.error) return json({ error: 'meta_api_error', message: data.error.message });
      return json({ ads: data.data || [] });
    } catch {
      return json({ error: 'upstream_failed', message: 'Could not reach the Meta API' }, 502);
    }
  }

  return json({ error: 'not_configured', env_keys_seen: Object.keys(env) });
}
