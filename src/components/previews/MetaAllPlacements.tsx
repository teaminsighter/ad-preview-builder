'use client';

import { useState } from 'react';
import MetaFeedAd from './MetaFeedAd';
import InstagramFeedAd from './InstagramFeedAd';
import InstagramStoryAd from './InstagramStoryAd';
import InstagramReelsAd from './InstagramReelsAd';
import FacebookStoriesAd from './FacebookStoriesAd';
import FacebookReelsAd from './FacebookReelsAd';
import AdsOnFacebookReelsAd from './AdsOnFacebookReelsAd';
import FacebookInStreamReelsAd from './FacebookInStreamReelsAd';

// Ads Manager-style "All placements" preview grid: every Meta placement in
// its own card with a platform icon + placement name header, filterable by
// the same groups Ads Manager uses.

type Group = 'all' | 'feeds' | 'stories';

interface Media {
  url?: string;
  kind?: 'image' | 'video';
}

interface CarouselCard {
  url: string;
  kind?: 'image' | 'video';
}

interface MetaAllPlacementsProps {
  pageName: string;
  username: string;
  pageImageUrl?: string;
  primaryText: string;
  caption: string;
  headline: string;
  description: string;
  ctaText?: string;
  linkDisplay?: string;
  // Placement customisation: feed placements show the media that best fits
  // 4:5, Stories/Reels the media that best fits 9:16
  feedMedia: Media;
  verticalMedia: Media;
  carouselCards?: CarouselCard[];
}

const FbIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.026 1.792-4.697 4.533-4.697 1.313 0 2.686.235 2.686.235v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
  </svg>
);

const IgIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="#262626">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const Dots = () => (
  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
);

const GROUPS: { id: Group; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'feeds', label: 'Feeds, In-stream ads for reels' },
  { id: 'stories', label: 'Stories, Status, Reels' },
];

export default function MetaAllPlacements(props: MetaAllPlacementsProps) {
  const [group, setGroup] = useState<Group>('all');
  const {
    pageName, username, pageImageUrl, primaryText, caption, headline,
    description, ctaText, linkDisplay, feedMedia, verticalMedia, carouselCards,
  } = props;

  const cards: {
    key: string;
    platform: 'fb' | 'ig';
    label: string;
    group: Exclude<Group, 'all'>;
    zoom?: number;
    node: React.ReactNode;
  }[] = [
    {
      key: 'fb-feed', platform: 'fb', label: 'Facebook Feed', group: 'feeds', zoom: 0.78,
      node: <MetaFeedAd pageName={pageName} pageImageUrl={pageImageUrl} primaryText={primaryText} headline={headline} description={description} imageUrl={feedMedia.url} mediaKind={feedMedia.kind} carouselCards={carouselCards} ctaText={ctaText} linkDisplay={linkDisplay} />,
    },
    {
      key: 'ig-feed', platform: 'ig', label: 'Instagram Feed', group: 'feeds', zoom: 0.82,
      node: <InstagramFeedAd username={username} caption={caption} imageUrl={feedMedia.url} mediaKind={feedMedia.kind} ctaText={ctaText} website={linkDisplay} profileImageUrl={pageImageUrl} />,
    },
    {
      key: 'ig-stories', platform: 'ig', label: 'Instagram Stories', group: 'stories',
      node: <InstagramStoryAd username={username} imageUrl={verticalMedia.url} mediaKind={verticalMedia.kind} ctaText={ctaText} profileImageUrl={pageImageUrl} />,
    },
    {
      key: 'fb-stories', platform: 'fb', label: 'Facebook Stories', group: 'stories',
      node: <FacebookStoriesAd pageName={pageName} pageImageUrl={pageImageUrl} imageUrl={verticalMedia.url} mediaKind={verticalMedia.kind} headline={headline} ctaText={ctaText} linkDisplay={linkDisplay} />,
    },
    {
      key: 'fb-reels', platform: 'fb', label: 'Facebook Reels', group: 'stories',
      node: <FacebookReelsAd pageName={pageName} pageImageUrl={pageImageUrl} imageUrl={verticalMedia.url} mediaKind={verticalMedia.kind} primaryText={primaryText} ctaText={ctaText} />,
    },
    {
      key: 'ads-on-fb-reels', platform: 'fb', label: 'Ads on Facebook Reels', group: 'feeds',
      node: <AdsOnFacebookReelsAd pageName={pageName} primaryText={primaryText} imageUrl={verticalMedia.url} mediaKind={verticalMedia.kind} />,
    },
    {
      key: 'fb-profile-feed', platform: 'fb', label: 'Facebook profile feed', group: 'feeds', zoom: 0.78,
      node: <MetaFeedAd pageName={pageName} pageImageUrl={pageImageUrl} primaryText={primaryText} headline={headline} description={description} imageUrl={feedMedia.url} mediaKind={feedMedia.kind} carouselCards={carouselCards} ctaText={ctaText} linkDisplay={linkDisplay} sponsoredNote="Ad · Not connected to you" />,
    },
    {
      key: 'fb-instream-reels', platform: 'fb', label: 'Facebook in-stream reels', group: 'feeds',
      node: <FacebookInStreamReelsAd pageName={pageName} pageImageUrl={pageImageUrl} primaryText={primaryText} linkDisplay={linkDisplay} imageUrl={verticalMedia.url} mediaKind={verticalMedia.kind} />,
    },
    {
      key: 'ig-reels', platform: 'ig', label: 'Instagram Reels', group: 'stories',
      node: <InstagramReelsAd username={username} profileImageUrl={pageImageUrl} imageUrl={verticalMedia.url} mediaKind={verticalMedia.kind} caption={caption} ctaText={ctaText} />,
    },
  ];

  const visible = cards.filter((c) => group === 'all' || c.group === group);

  return (
    <div className="w-full">
      {/* Placement group filter — same groups as Ads Manager */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {GROUPS.map((g) => (
          <button
            key={g.id}
            onClick={() => setGroup(g.id)}
            className={`px-3.5 py-1.5 text-[13px] font-medium rounded-lg border transition-colors ${
              group === g.id
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div
        className="grid gap-x-5 gap-y-10 justify-items-start items-start"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))' }}
      >
        {visible.map((c) => (
          <div key={c.key} className="w-full min-w-0">
            <div className="flex items-center justify-between mb-3 pr-1">
              <div className="flex items-center gap-2 min-w-0">
                {c.platform === 'fb' ? <FbIcon /> : <IgIcon />}
                <span className="text-[15px] font-semibold text-gray-900 truncate">{c.label}</span>
              </div>
              <Dots />
            </div>
            <div style={c.zoom ? { zoom: c.zoom } : undefined}>{c.node}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
