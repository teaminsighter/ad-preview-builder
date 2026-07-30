// Auto-fill from a Google Sheet or Doc. The raw content arrives via
// /api/import-doc (or the public gviz CSV endpoint as a fallback); this module
// turns sheet CSV / doc text into the loadAdData() payload shape page.tsx uses.
//
// Recognized layouts:
//  - Sheet, header row:   Headline 1 | Headline 2 | Primary Text | CTA ...
//  - Sheet, label column: Headline 1 | Summer Sale     (one field per row)
//  - Doc:                 "Label: value" lines; multi-line values continue
//                         until the next labelled line.

import { normalizeMediaUrl } from './driveLink';

export type ParsedImport = { data: Record<string, unknown>; filled: string[] };

type Entry = { base: string; idx?: number; value: string };

// alias (normalized: lowercase alphanumerics) → canonical field base
const FIELD_ALIASES: Record<string, string> = {
  primarytext: 'primarytext', primarytexts: 'primarytext', bodytext: 'primarytext',
  body: 'primarytext', adcopy: 'primarytext', copy: 'primarytext', text: 'primarytext',
  headline: 'headline', headlines: 'headline', title: 'headline',
  shortheadline: 'shortheadline', longheadline: 'longheadline',
  description: 'description', descriptions: 'description', desc: 'description',
  businessname: 'businessname', brandname: 'businessname', brand: 'businessname',
  advertiser: 'businessname', company: 'businessname', companyname: 'businessname',
  pagename: 'pagename', facebookpage: 'pagename', fbpage: 'pagename', page: 'pagename',
  instagramaccount: 'instagram', instagram: 'instagram', igaccount: 'instagram', ighandle: 'instagram',
  cta: 'cta', calltoaction: 'cta', ctabutton: 'cta', button: 'cta', buttontext: 'cta',
  finalurl: 'finalurl', landingpage: 'finalurl', landingpageurl: 'finalurl',
  websiteurl: 'finalurl', website: 'finalurl', destinationurl: 'finalurl',
  url: 'finalurl', link: 'finalurl', linkurl: 'finalurl',
  displayurl: 'displayurl', displaylink: 'displayurl',
  path: 'path', displaypath: 'path',
  sitelink: 'sitelink', sitelinks: 'sitelink',
  callout: 'callout', callouts: 'callout', calloutextension: 'callout',
  snippetheader: 'snippetheader', structuredsnippetheader: 'snippetheader',
  snippet: 'snippetvalue', snippetvalue: 'snippetvalue', snippetvalues: 'snippetvalue',
  structuredsnippet: 'snippetvalue',
  phone: 'phone', phonenumber: 'phone',
  image: 'image', imageurl: 'image', creative: 'image', creativeurl: 'image',
  media: 'image', mediaurl: 'image',
  video: 'video', videourl: 'video', videolink: 'video',
  logo: 'logo', logourl: 'logo', pageimage: 'logo', profileimage: 'logo', profilepicture: 'logo',
  adname: 'adname',
  platform: 'platform', channel: 'platform', network: 'platform',
  caption: 'caption',
  username: 'username', handle: 'username',
};

// "Headline 2" → { base: 'headline', idx: 2 }; unknown labels → null
function splitLabel(raw: string): { base: string; idx?: number } | null {
  const norm = raw.toLowerCase().replace(/[^a-z0-9]+/g, '');
  if (!norm || norm.length > 40) return null;
  const m = norm.match(/^([a-z]+?)(\d+)?$/);
  if (!m) return null;
  const base = FIELD_ALIASES[m[1]] ?? FIELD_ALIASES[norm];
  if (!base) return null;
  return { base, idx: m[2] ? parseInt(m[2], 10) : undefined };
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else inQuotes = false;
      } else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = ''; rows.push(row); row = [];
    } else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim() !== ''));
}

function collectFromSheet(rows: string[][]): Entry[] {
  if (!rows.length) return [];
  const headerHits = rows[0].filter(c => splitLabel(c)).length;
  const keyHits = rows.filter(r => splitLabel(r[0] || '')).length;
  const entries: Entry[] = [];

  if (keyHits >= headerHits && keyHits >= 1) {
    // Label in the first column, value(s) in the rest of the row
    for (const r of rows) {
      const label = splitLabel(r[0] || '');
      if (!label) continue;
      const values = r.slice(1).map(c => c.trim()).filter(Boolean);
      values.forEach((value, j) => entries.push({
        base: label.base,
        idx: label.idx ?? (values.length > 1 ? j + 1 : undefined),
        value,
      }));
    }
    return entries;
  }

  if (headerHits >= 1) {
    // Header row, one ad (or one copy variant) per data row
    const cols = rows[0].map(c => splitLabel(c));
    const dataRows = rows.slice(1);
    dataRows.forEach((r, ri) => {
      cols.forEach((label, ci) => {
        if (!label) return;
        const value = (r[ci] || '').trim();
        if (!value) return;
        entries.push({
          base: label.base,
          idx: dataRows.length === 1 ? label.idx : (label.idx ?? ri + 1),
          value,
        });
      });
    });
  }
  return entries;
}

function collectFromDoc(text: string): Entry[] {
  const entries: Entry[] = [];
  let current: Entry | null = null;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    const m = line.match(/^([A-Za-z][A-Za-z0-9 _/-]{0,40}?)\s*[:\-–—\t]\s*(.*)$/);
    const label = m ? splitLabel(m[1]) : null;
    if (label) {
      if (current) entries.push(current);
      current = { ...label, value: m![2].trim() };
    } else if (current && line) {
      current.value = current.value ? current.value + '\n' + line : line;
    } else if (current) {
      // blank line closes the current field
      entries.push(current);
      current = null;
    }
  }
  if (current) entries.push(current);
  return entries.filter(e => e.value);
}

function buildAdData(entries: Entry[]): ParsedImport {
  const byBase = new Map<string, Entry[]>();
  for (const e of entries) {
    if (!byBase.has(e.base)) byBase.set(e.base, []);
    byBase.get(e.base)!.push(e);
  }

  // Fixed-size array: numbered entries land on their slot, the rest fill gaps
  const fill = (base: string, size: number): string[] | null => {
    const es = byBase.get(base);
    if (!es?.length) return null;
    const out: string[] = Array(size).fill('');
    const rest: string[] = [];
    for (const e of es) {
      if (e.idx && e.idx >= 1 && e.idx <= size && !out[e.idx - 1]) out[e.idx - 1] = e.value;
      else rest.push(e.value);
    }
    for (const v of rest) {
      const free = out.indexOf('');
      if (free === -1) break;
      out[free] = v;
    }
    return out;
  };
  const first = (base: string): string | null => byBase.get(base)?.[0]?.value ?? null;
  const count = (arr: string[]) => arr.filter(Boolean).length;

  const data: Record<string, unknown> = {};
  const filled: string[] = [];

  const headlines = fill('headline', 15);
  if (headlines) {
    data.headlines = headlines;
    data.metaHeadlines = headlines.slice(0, 5);
    data.bingHeadlines = headlines;
    data.headline = headlines.find(Boolean);
    filled.push(`${count(headlines)} headline${count(headlines) > 1 ? 's' : ''}`);
  }
  const descriptions = fill('description', 4);
  if (descriptions) {
    data.descriptions = descriptions;
    data.bingDescriptions = descriptions;
    data.metaDescription = descriptions.find(Boolean);
    data.description = descriptions.find(Boolean);
    filled.push(`${count(descriptions)} description${count(descriptions) > 1 ? 's' : ''}`);
  }
  const primary = fill('primarytext', 5);
  if (primary) {
    data.primaryTexts = primary;
    filled.push(`${count(primary)} primary text${count(primary) > 1 ? 's' : ''}`);
  }

  const business = first('businessname');
  if (business) {
    data.businessName = business;
    data.bingBusinessName = business;
    if (!byBase.has('pagename')) data.pageName = business;
    filled.push('business name');
  }
  const page = first('pagename');
  if (page) { data.pageName = page; filled.push('page name'); }
  const instagram = first('instagram');
  if (instagram) {
    const handle = instagram.replace(/^@/, '');
    data.instagramAccount = handle;
    data.username = handle;
    filled.push('Instagram account');
  }
  const username = first('username');
  if (username) data.username = username.replace(/^@/, '');

  const cta = first('cta');
  if (cta) {
    data.metaCtaText = cta;
    data.ctaText = cta;
    data.tiktokCta = cta;
    filled.push('CTA button');
  }

  const finalUrl = first('finalurl');
  if (finalUrl) {
    data.finalUrl = finalUrl;
    data.metaDestinationUrl = finalUrl;
    data.bingFinalUrl = finalUrl;
    try {
      const host = new URL(finalUrl.startsWith('http') ? finalUrl : `https://${finalUrl}`).hostname.replace(/^www\./, '');
      if (!byBase.has('displayurl')) { data.displayUrl = host; data.linkDisplay = host.toUpperCase(); }
    } catch { /* not a parsable URL — keep as typed */ }
    filled.push('final URL');
  }
  const displayUrl = first('displayurl');
  if (displayUrl) {
    data.displayUrl = displayUrl;
    data.linkDisplay = displayUrl;
    filled.push('display URL');
  }
  const paths = fill('path', 2);
  if (paths) {
    if (paths[0]) { data.path1 = paths[0]; data.bingPath1 = paths[0]; }
    if (paths[1]) { data.path2 = paths[1]; data.bingPath2 = paths[1]; }
    filled.push('display path');
  }

  const sitelinks = fill('sitelink', 8);
  if (sitelinks) {
    data.sitelinks = sitelinks.map(title => ({ title, description1: '', description2: '', url: '' }));
    filled.push(`${count(sitelinks)} sitelink${count(sitelinks) > 1 ? 's' : ''}`);
  }
  const callouts = fill('callout', 10);
  if (callouts) { data.callouts = callouts; filled.push(`${count(callouts)} callout${count(callouts) > 1 ? 's' : ''}`); }
  const snippetHeader = first('snippetheader');
  if (snippetHeader) data.snippetHeader = snippetHeader;
  const snippets = fill('snippetvalue', 10);
  if (snippets) { data.snippetValues = snippets; filled.push('structured snippets'); }
  const phone = first('phone');
  if (phone) { data.phoneNumber = phone; filled.push('phone number'); }

  // Media: "Image"/"Media" labels (kind sniffed from the extension) plus
  // explicit "Video" labels. Google Drive share links become direct URLs.
  const mediaList: { url: string; kind: 'image' | 'video' }[] = [];
  for (const e of byBase.get('image') ?? []) {
    const isVideo = /\.(mp4|mov|webm|m4v)(\?|$)/i.test(e.value);
    mediaList.push({ url: normalizeMediaUrl(e.value, isVideo ? 'video' : 'image'), kind: isVideo ? 'video' : 'image' });
  }
  for (const e of byBase.get('video') ?? []) {
    mediaList.push({ url: normalizeMediaUrl(e.value, 'video'), kind: 'video' });
  }
  if (mediaList.length) {
    const urls: string[] = Array(10).fill('');
    const kinds: string[] = Array(10).fill('image');
    mediaList.slice(0, 10).forEach((m, i) => { urls[i] = m.url; kinds[i] = m.kind; });
    data.metaMediaUrls = urls;
    data.metaMediaKinds = kinds;
    const firstImage = mediaList.find(m => m.kind === 'image');
    if (firstImage) {
      data.imageUrl = firstImage.url;
      data.bingImageUrl = firstImage.url;
      data.metaImageUrl = firstImage.url;
    }
    const firstVideo = mediaList.find(m => m.kind === 'video');
    if (firstVideo) {
      data.tiktokMediaUrl = firstVideo.url;
      data.tiktokMediaKind = 'video';
    }
    filled.push(`${mediaList.length} media URL${mediaList.length > 1 ? 's' : ''}`);
  }
  const logo = first('logo');
  if (logo) {
    const logoUrl = normalizeMediaUrl(logo, 'image');
    data.businessLogoUrl = logoUrl;
    data.logoUrl = logoUrl;
    data.pageImageUrl = logoUrl;
    filled.push('logo');
  }

  const shortHeadline = first('shortheadline');
  if (shortHeadline) data.bingShortHeadline = shortHeadline;
  const longHeadline = first('longheadline');
  if (longHeadline) data.bingLongHeadline = longHeadline;
  const adName = first('adname');
  if (adName) data.metaAdName = adName;
  const caption = first('caption');
  if (caption) data.caption = caption;

  const platformRaw = (first('platform') || '').toLowerCase();
  if (/meta|facebook|instagram|fb|ig/.test(platformRaw)) data.platform = 'meta';
  else if (/google|search|youtube/.test(platformRaw)) data.platform = 'google';
  else if (/tiktok/.test(platformRaw)) data.platform = 'tiktok';
  else if (/bing|microsoft/.test(platformRaw)) data.platform = 'bing';
  else if (primary) data.platform = 'meta'; // primary text only exists on Meta

  return { data, filled };
}

export function parseImportedDoc(kind: 'sheet' | 'doc', text: string): ParsedImport {
  const entries = kind === 'sheet' ? collectFromSheet(parseCsv(text)) : collectFromDoc(text);
  const result = buildAdData(entries);
  if (!result.filled.length) {
    throw new Error(
      'No recognizable ad fields found. Label your content with e.g. "Headline 1", "Description", "Primary Text", "CTA", "Final URL" — as a header row or first column in a Sheet, or "Label: value" lines in a Doc.'
    );
  }
  return result;
}

// Auto-fill from an uploaded file: .xlsx/.xls (first tab with recognizable
// labels wins), .csv/.tsv, or plain text with "Label: value" lines.
export async function parseImportedFile(file: File): Promise<ParsedImport> {
  const name = file.name.toLowerCase();

  if (/\.(xlsx|xls)$/.test(name)) {
    const XLSX = await import('xlsx');
    const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    let lastError: Error | null = null;
    for (const sheetName of wb.SheetNames) {
      try {
        return parseImportedDoc('sheet', XLSX.utils.sheet_to_csv(wb.Sheets[sheetName]));
      } catch (err) {
        lastError = err as Error;
      }
    }
    throw lastError ?? new Error('The workbook has no sheets with content.');
  }

  const text = await file.text();
  if (name.endsWith('.csv')) return parseImportedDoc('sheet', text);
  if (name.endsWith('.tsv')) {
    const quote = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = text.split(/\r?\n/).map(l => l.split('\t').map(quote).join(',')).join('\n');
    return parseImportedDoc('sheet', csv);
  }
  // .txt and anything else: "Label: value" lines first, pasted CSV as fallback
  try {
    return parseImportedDoc('doc', text);
  } catch {
    return parseImportedDoc('sheet', text);
  }
}

// Public sheets can also be fetched straight from the browser via the gviz CSV
// endpoint (it sends CORS headers) — used when the Pages Function isn't
// available, e.g. in local dev. Docs have no CORS-friendly equivalent.
export function directSheetCsvUrl(link: string): string | null {
  const m = link.match(/docs\.google\.com\/spreadsheets\/d\/([\w-]+)/);
  if (!m) return null;
  const gid = (link.match(/[#?&]gid=(\d+)/) || [])[1];
  return `https://docs.google.com/spreadsheets/d/${m[1]}/gviz/tq?tqx=out:csv${gid ? `&gid=${gid}` : ''}`;
}
