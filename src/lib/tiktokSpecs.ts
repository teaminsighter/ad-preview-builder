// TikTok Ads creative specs — 2026 (In-Feed, non-Spark).
// Sources: TikTok Ads Manager requirements + current spec guides
// (AdNabu, Vizup, Recharm safe-zone guide).

import { PlacementSpec } from './metaSpecs';

export const TIKTOK_SPEC: PlacementSpec = {
  label: 'TikTok In-Feed',
  image: {
    // Image ads only serve on some placements; video is the primary format
    ratios: [9 / 16],
    ratioLabel: '9:16 full screen',
    recommendedResolution: '1080 × 1920 px (9:16)',
    minWidth: 540,
    minHeight: 960,
    fileTypes: ['JPG', 'PNG'],
    maxFileMB: 100,
  },
  video: {
    ratios: [9 / 16, 1, 16 / 9],
    ratioLabel: '9:16 strongly recommended (1:1 and 16:9 supported, lower priority)',
    recommendedResolution: '1080 × 1920 px (9:16)',
    minWidth: 540,
    minHeight: 960,
    fileTypes: ['MP4', 'MOV', 'MPEG', 'AVI', '3GP (H.264 + AAC)'],
    maxFileMB: 500,
    minDurationSec: 5,
    maxDurationSec: 60,
    sweetSpot: '9–15 s, hook in the first 3 s',
  },
  safeZone: 'Keep key content in a centred ~880 × 1440 px area — TikTok UI covers ~350 px at the bottom (caption, CTA, music) and the right rail (like/comment/share)',
  textNotes: 'Ad text: 1–100 characters — emojis and hashtags count. Display name: 2–40 characters.',
};

export const TIKTOK_TEXT_LIMITS = {
  adTextMax: 100,
  displayNameMin: 2,
  displayNameMax: 40,
};

// Bitrate floor TikTok enforces on upload
export const TIKTOK_MIN_BITRATE = '516 kbps (2,500+ kbps recommended for detailed footage)';

// Official CTA button options in TikTok Ads Manager
export const TIKTOK_CTAS = [
  'Learn More', 'Shop Now', 'Sign Up', 'Download', 'Contact Us',
  'Apply Now', 'Book Now', 'Order Now', 'Play Game', 'Watch Now',
  'Get Quote', 'Subscribe', 'Install Now', 'Read More', 'View Now',
  'Interested', 'Visit Store', 'Get Showtimes', 'Listen Now', 'Experience Now',
];
