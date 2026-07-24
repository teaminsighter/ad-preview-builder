// Cloudflare Pages Function — automatic competitor discovery.
//
// Input: the user's website domain (or a niche keyword) + country.
// 1. If a domain: fetch the homepage and extract niche keywords from the
//    <title> / meta description.
// 2. Search the Meta Ad Library (via the same Apify actor as /api/meta-ads)
//    for active ads matching those keywords in that country.
// 3. Aggregate by advertiser page: whoever runs the most ads in the niche
//    IS the competition, ranked. The user's own brand is filtered out.
//
// Uses APIFY_TOKEN (same free allowance as the Meta library search).

import { checkAuth } from '../_auth.js';

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

const getEnv = (env, name) => {
  if (env[name]) return String(env[name]).trim();
  const key = Object.keys(env).find((k) => k.trim() === name);
  return key ? String(env[key]).trim() : undefined;
};

// Pull a usable niche phrase out of a homepage's title/meta tags
const extractKeywords = (html, brandHint) => {
  const pick = (re) => {
    const m = html.match(re);
    return m ? m[1].replace(/\s+/g, ' ').trim() : '';
  };
  const title = pick(/<title[^>]*>([^<]{3,200})<\/title>/i);
  const desc =
    pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{3,300})["']/i) ||
    pick(/<meta[^>]+content=["']([^"']{3,300})["'][^>]+name=["']description["']/i);
  const ogTitle = pick(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']{3,200})["']/i);

  const candidates = [];
  [title, ogTitle].forEach((t) => {
    if (!t) return;
    // Split "Brand | Tagline about the niche" style titles into segments
    t.split(/[|•·–—-]{1,2}/).forEach((seg) => {
      const s = seg.trim();
      if (s.split(' ').length >= 2 && s.length >= 8) candidates.push(s);
    });
  });
  if (desc) {
    const firstSentence = desc.split(/[.!?]/)[0].trim();
    if (firstSentence.split(' ').length >= 3) candidates.push(firstSentence);
  }

  // Distil each candidate down to its core niche phrase: drop hype words,
  // geo words and stopwords, keep the first few meaningful words in order.
  // "Find New Zealand's Top Real Estate Agents Fast" → "real estate agents"
  const STOP = new Set([
    'find', 'fast', 'top', 'best', 'your', 'get', 'the', 'a', 'an', 'of', 'for', 'and',
    'with', 'in', 'to', 'we', 'our', 'you', 'now', 'today', 'free', 'online', 'official',
    'site', 'website', 'welcome', 'more', 'here', 'easy', 'easily', 'quality', 'trusted',
    'leading', 'premier', 'number', 'one', 'no1',extra(brandHint),
    'new', 'zealand', "zealand's", 'zealands', 'nz', 'aotearoa', 'australia', 'australian', 'au',
  ].filter(Boolean));

  const distil = (text) => {
    const tokens = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1 && !STOP.has(w));
    return tokens.slice(0, 3).join(' ');
  };

  const brand = (brandHint || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const phrases = [];
  for (const c of candidates) {
    const p = distil(c);
    if (!p) continue;
    if (brand && p.replace(/[^a-z0-9]/g, '').includes(brand)) continue;
    if (!phrases.includes(p)) phrases.push(p);
    if (phrases.length >= 2) break;
  }
  return phrases;
};

// Brand token itself must never survive into the niche phrase
const extra = (brandHint) => (brandHint || '').toLowerCase().replace(/[^a-z0-9]/g, '') || null;

export async function onRequestGet({ request, env }) {
  if (!(await checkAuth(request, env))) return json({ error: 'unauthorized' }, 401);
  const APIFY_TOKEN = getEnv(env, 'APIFY_TOKEN');
  if (!APIFY_TOKEN) return json({ error: 'not_configured' });

  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();
  if (!q) return json({ error: 'missing_query' }, 400);
  const country = (url.searchParams.get('country') || 'NZ').toUpperCase().slice(0, 2);

  const looksLikeDomain = /\.[a-z]{2,}/i.test(q) && !q.includes(' ');
  let keywords = [];
  let brandName = q;

  if (looksLikeDomain) {
    const domain = q.replace(/^https?:\/\//, '').split('/')[0];
    brandName = domain.split('.')[0];
    try {
      const res = await fetch(`https://${domain}`, {
        headers: { 'user-agent': 'Mozilla/5.0 (compatible; AdPreviewBuilder/1.0)' },
        redirect: 'follow',
      });
      const html = (await res.text()).slice(0, 200000);
      keywords = extractKeywords(html, brandName);
    } catch {
      /* site unreachable — fall through */
    }
    if (!keywords.length) {
      return json({
        error: 'no_keywords',
        message: `Couldn't detect a niche from ${domain} — try again with a keyword that describes the business (e.g. "real estate agent").`,
      });
    }
  } else {
    keywords = [q];
    brandName = '';
  }

  // Scrape the Ad Library for the primary niche keyword
  const keyword = keywords[0];
  const libraryUrl =
    'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=' +
    encodeURIComponent(country) +
    '&q=' +
    encodeURIComponent(keyword) +
    '&search_type=keyword_unordered&media_type=all';
  const api =
    'https://api.apify.com/v2/acts/curious_coder~facebook-ads-library-scraper/run-sync-get-dataset-items?timeout=150&token=' +
    encodeURIComponent(APIFY_TOKEN);

  let items;
  try {
    const res = await fetch(api, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ urls: [{ url: libraryUrl }], count: 50 }),
    });
    items = await res.json();
    if (!Array.isArray(items)) {
      return json({
        error: 'provider_error',
        message: (items && items.error && items.error.message) || 'Apify run failed',
      });
    }
  } catch {
    return json({ error: 'upstream_failed', message: 'Could not reach Apify' }, 502);
  }

  // Aggregate advertisers; the busiest pages in the niche are the competitors
  const brandKey = brandName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const pages = new Map();
  for (const a of items) {
    const name = a.page_name || a.pageName;
    if (!name) continue;
    const nameKey = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (brandKey && (nameKey.includes(brandKey) || brandKey.includes(nameKey))) continue;
    const snap = a.snapshot || {};
    const img = (Array.isArray(snap.images) && snap.images[0]) || {};
    const video = (Array.isArray(snap.videos) && snap.videos[0]) || {};
    const body = typeof snap.body === 'string' ? snap.body : (snap.body && snap.body.text) || '';
    const entry = pages.get(nameKey) || {
      page_name: name,
      page_id: a.page_id || a.pageId,
      ad_count: 0,
      image: undefined,
      sample_text: '',
    };
    entry.ad_count += 1;
    if (!entry.image)
      entry.image =
        img.original_image_url || img.resized_image_url || img.url || video.video_preview_image_url;
    if (!entry.sample_text && body) entry.sample_text = body.slice(0, 140);
    pages.set(nameKey, entry);
  }

  const competitors = [...pages.values()].sort((a, b) => b.ad_count - a.ad_count).slice(0, 12);
  return json({ keywords, keyword_used: keyword, competitors, ads_scanned: items.length });
}
