// Meta (Facebook/Instagram) creative specs per placement — 2026.
// Sources: Meta Ads Guide + current spec sheets (Hootsuite, Superscale, AdNabu).
// Since March 2026 FB/IG Stories and Reels share a single unified 9:16 safe zone.

export type MetaPlacement = 'fb-feed' | 'fb-stories' | 'ig-feed' | 'ig-stories' | 'ig-reels';
export type MediaKind = 'image' | 'video';

export interface MediaSpec {
  // Ratios accepted without cropping, as width/height numbers
  ratios: number[];
  ratioLabel: string;
  recommendedResolution: string;
  minWidth: number;
  minHeight: number;
  fileTypes: string[];
  maxFileMB: number;
  // Video only
  minDurationSec?: number;
  maxDurationSec?: number;
  sweetSpot?: string;
}

export interface PlacementSpec {
  label: string;
  image: MediaSpec;
  video: MediaSpec;
  safeZone?: string;
  textNotes: string;
}

// Ratio helpers
const R_1_1 = 1;
const R_4_5 = 4 / 5;
const R_9_16 = 9 / 16;
const R_191_1 = 1.91;

export const META_TEXT_LIMITS = {
  primaryVisible: 125,
  primaryMax: 2200,
  headlineRecommended: 40,
  headlineMax: 255,
  descriptionVisible: 30,
  adNameMax: 400,
};

export const META_SPECS: Record<MetaPlacement, PlacementSpec> = {
  'fb-feed': {
    label: 'Facebook Feed',
    image: {
      ratios: [R_4_5, R_1_1, R_191_1],
      ratioLabel: '4:5 recommended (1:1 and 1.91:1 supported)',
      recommendedResolution: '1080 × 1350 px (4:5)',
      minWidth: 600,
      minHeight: 600,
      fileTypes: ['JPG', 'PNG'],
      maxFileMB: 30,
    },
    video: {
      ratios: [R_4_5, R_1_1],
      ratioLabel: '4:5 recommended',
      recommendedResolution: '1080 × 1350 px (4:5)',
      minWidth: 1080,
      minHeight: 1080,
      fileTypes: ['MP4', 'MOV (H.264, AAC audio)'],
      maxFileMB: 4096,
      minDurationSec: 1,
      maxDurationSec: 241 * 60,
      sweetSpot: '15–30 s, hook in the first 1.5 s',
    },
    safeZone: 'Keep text/logos out of the top 14% and bottom 20%',
    textNotes: 'Primary text: 125 chars visible. Headline: ~27 visible / 40 recommended. Description shows on some placements only.',
  },
  'ig-feed': {
    label: 'Instagram Feed',
    image: {
      ratios: [R_4_5, R_1_1],
      ratioLabel: '4:5 recommended (1:1 supported)',
      recommendedResolution: '1080 × 1350 px (4:5)',
      minWidth: 600,
      minHeight: 600,
      fileTypes: ['JPG', 'PNG'],
      maxFileMB: 30,
    },
    video: {
      ratios: [R_4_5, R_1_1],
      ratioLabel: '4:5 recommended',
      recommendedResolution: '1080 × 1350 px (4:5)',
      minWidth: 1080,
      minHeight: 1080,
      fileTypes: ['MP4', 'MOV (H.264, AAC audio)'],
      maxFileMB: 4096,
      minDurationSec: 1,
      maxDurationSec: 60 * 60,
      sweetSpot: '15–30 s, hook in the first 1.5 s',
    },
    textNotes: 'Caption uses primary text (125 chars visible before "… more").',
  },
  'fb-stories': {
    label: 'Facebook Stories',
    image: {
      ratios: [R_9_16],
      ratioLabel: '9:16 full screen',
      recommendedResolution: '1080 × 1920 px (9:16)',
      minWidth: 600,
      minHeight: 1067,
      fileTypes: ['JPG', 'PNG'],
      maxFileMB: 30,
    },
    video: {
      ratios: [R_9_16],
      ratioLabel: '9:16 full screen',
      recommendedResolution: '1080 × 1920 px (9:16)',
      minWidth: 720,
      minHeight: 1280,
      fileTypes: ['MP4', 'MOV (H.264, AAC audio)'],
      maxFileMB: 4096,
      minDurationSec: 1,
      maxDurationSec: 120,
      sweetSpot: '15 s or less per Story card',
    },
    safeZone: 'Unified 9:16 safe zone: top 14%, bottom 35%, sides 6% clear of key content',
    textNotes: 'Primary text is not displayed — put the message in the creative. Headline optional.',
  },
  'ig-stories': {
    label: 'Instagram Stories',
    image: {
      ratios: [R_9_16],
      ratioLabel: '9:16 full screen',
      recommendedResolution: '1080 × 1920 px (9:16)',
      minWidth: 600,
      minHeight: 1067,
      fileTypes: ['JPG', 'PNG'],
      maxFileMB: 30,
    },
    video: {
      ratios: [R_9_16],
      ratioLabel: '9:16 full screen',
      recommendedResolution: '1080 × 1920 px (9:16)',
      minWidth: 720,
      minHeight: 1280,
      fileTypes: ['MP4', 'MOV (H.264, AAC audio)'],
      maxFileMB: 4096,
      minDurationSec: 1,
      maxDurationSec: 120,
      sweetSpot: '15 s or less per Story card',
    },
    safeZone: 'Unified 9:16 safe zone: top 14%, bottom 35%, sides 6% clear of key content',
    textNotes: 'Primary text is not displayed — put the message in the creative.',
  },
  'ig-reels': {
    label: 'Instagram Reels',
    image: {
      ratios: [R_9_16],
      ratioLabel: '9:16 only',
      recommendedResolution: '1080 × 1920 px (9:16)',
      minWidth: 600,
      minHeight: 1067,
      fileTypes: ['JPG', 'PNG'],
      maxFileMB: 30,
    },
    video: {
      ratios: [R_9_16],
      ratioLabel: '9:16 only (strict)',
      recommendedResolution: '1080 × 1920 px (9:16)',
      minWidth: 720,
      minHeight: 1280,
      fileTypes: ['MP4', 'MOV (H.264, AAC audio)'],
      maxFileMB: 4096,
      minDurationSec: 1,
      maxDurationSec: 90,
      sweetSpot: '15–30 s, hook in the first 1.5 s',
    },
    safeZone: 'Unified 9:16 safe zone: top 14%, bottom 35%, sides 6% clear of key content',
    textNotes: 'Primary text: 72 chars visible before truncation. Keep overlay text minimal.',
  },
};

// Carousel is a format, not a placement — cards share these specs
export const CAROUSEL_SPEC = {
  cards: '2–10 cards (all cards should use the same ratio)',
  ratioLabel: '1:1 recommended (4:5 supported)',
  recommendedResolution: '1080 × 1080 px per card',
  headlinePerCard: 40,
  primaryPerCard: 125,
};

export interface MediaInfo {
  width: number;
  height: number;
  bytes?: number;
  durationSec?: number;
}

export interface MediaVerdict {
  ok: boolean;
  issues: string[];
}

// Validate probed media against a placement's spec. Ratio tolerance ±3% (Meta's own tolerance).
export function validateMedia(placement: MetaPlacement, kind: MediaKind, info: MediaInfo): MediaVerdict {
  const spec = META_SPECS[placement][kind];
  const issues: string[] = [];
  const ratio = info.width / info.height;

  const ratioOk = spec.ratios.some(r => Math.abs(ratio - r) / r <= 0.03);
  if (!ratioOk) {
    issues.push(`Aspect ratio ${formatRatio(info.width, info.height)} — this placement expects ${spec.ratioLabel}. Meta will crop or letterbox it.`);
  }

  if (info.width < spec.minWidth || info.height < spec.minHeight) {
    issues.push(`Resolution ${info.width} × ${info.height} px is below the ${spec.minWidth} × ${spec.minHeight} px minimum.`);
  } else if (Math.min(info.width, info.height) < 1080) {
    issues.push(`Short edge under 1080 px — Meta's quality model may deprioritise delivery and raise CPM. Recommended: ${spec.recommendedResolution}.`);
  }

  if (info.bytes !== undefined && info.bytes > spec.maxFileMB * 1024 * 1024) {
    issues.push(`File is ${(info.bytes / 1024 / 1024).toFixed(1)} MB — over the ${spec.maxFileMB >= 1024 ? `${spec.maxFileMB / 1024} GB` : `${spec.maxFileMB} MB`} limit.`);
  }

  if (kind === 'video' && info.durationSec !== undefined) {
    if (spec.maxDurationSec && info.durationSec > spec.maxDurationSec) {
      issues.push(`Video is ${formatDuration(info.durationSec)} — over this placement's ${formatDuration(spec.maxDurationSec)} maximum.`);
    }
    if (spec.minDurationSec && info.durationSec < spec.minDurationSec) {
      issues.push(`Video is shorter than the ${spec.minDurationSec} s minimum.`);
    }
  }

  return { ok: issues.length === 0, issues };
}

export function formatRatio(w: number, h: number): string {
  const known: [number, string][] = [[1, '1:1'], [4 / 5, '4:5'], [9 / 16, '9:16'], [1.91, '1.91:1'], [16 / 9, '16:9']];
  const r = w / h;
  for (const [value, label] of known) {
    if (Math.abs(r - value) / value <= 0.03) return label;
  }
  return r.toFixed(2) + ':1';
}

export function formatDuration(sec: number): string {
  if (sec < 90) return `${Math.round(sec)} s`;
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return s ? `${m} min ${s} s` : `${m} min`;
}

// Best-effort video detection for URLs where the kind wasn't tracked
export function looksLikeVideoUrl(url: string): boolean {
  return url.startsWith('data:video') || /\.(mp4|mov|webm|m4v)(\?|#|$)/i.test(url);
}
