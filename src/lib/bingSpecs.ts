// Microsoft Advertising (Bing Ads) creative specs — 2026.
// Sources: Microsoft Advertising API docs (Responsive Search Ads),
// Microsoft Audience Network creative specifications.

import { MediaSpec } from './metaSpecs';

// Responsive Search Ads on the Bing SERP — same shape as Google RSAs
export const BING_RSA = {
  headlineCount: 15,
  headlineMin: 3,
  headlineMax: 30,
  descriptionCount: 4,
  descriptionMin: 2,
  descriptionMax: 90,
  pathMax: 15,
};

// Microsoft Audience Network (native ads across MSN, Outlook, Edge, partners)
export const BING_AUDIENCE = {
  shortHeadlineMax: 30,
  longHeadlineMax: 90,
  adTextMax: 90,
  businessNameMax: 25,
};

// MSAN image: 1.91:1 landscape is the primary asset; 1:1 also serves
export const BING_AUDIENCE_IMAGE: MediaSpec = {
  ratios: [1.91, 1],
  ratioLabel: '1.91:1 recommended (1:1 supported)',
  recommendedResolution: '1200 × 628 px (1.91:1) or 1200 × 1200 px (1:1)',
  minWidth: 703,
  minHeight: 368,
  fileTypes: ['JPG', 'PNG'],
  maxFileMB: 5,
  qualityFloor: 0,
};
