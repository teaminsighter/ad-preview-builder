'use client';

import { useEffect, useRef, useState } from 'react';
import ImageUpload from '@/components/ImageUpload';
import GoogleSearchAd from '@/components/previews/GoogleSearchAd';
import GoogleDisplayAd from '@/components/previews/GoogleDisplayAd';
import YouTubeInStreamAd from '@/components/previews/YouTubeInStreamAd';
import GmailAd from '@/components/previews/GmailAd';
import DiscoverAd from '@/components/previews/DiscoverAd';
import { SectionCard, GField, AdStrength, PhoneFrame, PlacementTabs, DownloadPreviewButton } from './ui';
import { DEMO_LANDSCAPE_IMG, DEMO_SQUARE_IMG, DEMO_LOGO_IMG } from './demo';

type Placement = 'search' | 'display' | 'youtube' | 'gmail' | 'discover';

const STORAGE_KEY = 'pmaxAssetGroupData';

const CTA_OPTIONS = ['Automated', 'Learn more', 'Get quote', 'Apply now', 'Sign up', 'Contact us', 'Subscribe', 'Download', 'Book now', 'Shop now'];

export default function PMaxAssetGroup() {
  const [assetGroupName, setAssetGroupName] = useState('Asset Group 1');
  const [finalUrl, setFinalUrl] = useState('https://www.demostore.com');
  const [businessName, setBusinessName] = useState('Demo Store');
  const [logoUrl, setLogoUrl] = useState(DEMO_LOGO_IMG);
  const [headlines, setHeadlines] = useState<string[]>(
    ['Premium Wireless Headphones', 'Free Shipping Over $50', 'Shop the New Collection', '40-Hour Battery Life', 'Noise Cancelling Audio', ...Array(10).fill('')]
  );
  const [visibleHeadlines, setVisibleHeadlines] = useState(5);
  const [longHeadlines, setLongHeadlines] = useState<string[]>(
    ['Experience Studio-Quality Sound with Demo Store Wireless Headphones', 'Demo Store | Premium Audio for Everyday Listening', ...Array(3).fill('')]
  );
  const [visibleLongHeadlines, setVisibleLongHeadlines] = useState(2);
  const [descriptions, setDescriptions] = useState<string[]>(
    ['Noise-cancelling headphones with 40-hour battery life.', 'Free shipping and 30-day returns on all orders. Shop the full collection today.', ...Array(3).fill('')]
  );
  const [visibleDescriptions, setVisibleDescriptions] = useState(2);
  const [imageUrls, setImageUrls] = useState<string[]>([DEMO_LANDSCAPE_IMG, DEMO_SQUARE_IMG]);
  const [videoUrl, setVideoUrl] = useState('https://youtube.com/watch?v=demo-store-ad');
  const [sitelinks, setSitelinks] = useState<{ title: string; description1: string; description2: string }[]>([
    { title: 'Best Sellers', description1: 'Our most popular headphones', description2: '' },
    { title: 'New Arrivals', description1: 'Fresh drops every week', description2: '' },
    { title: '', description1: '', description2: '' },
    { title: '', description1: '', description2: '' },
  ]);
  const [ctaText, setCtaText] = useState('Shop now');
  const [searchThemes, setSearchThemes] = useState('wireless headphones, bluetooth audio, noise cancelling');
  const [audienceName, setAudienceName] = useState('Audio enthusiasts - In-market shoppers');
  const [placement, setPlacement] = useState<Placement>('search');
  const [loaded, setLoaded] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Load persisted asset group
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.assetGroupName) setAssetGroupName(d.assetGroupName);
        if (d.finalUrl) setFinalUrl(d.finalUrl);
        if (d.businessName) setBusinessName(d.businessName);
        if (d.logoUrl) setLogoUrl(d.logoUrl);
        // Only restore lists that actually contain data — an all-empty saved list
        // must not wipe the demo defaults
        if (Array.isArray(d.headlines) && d.headlines.some(Boolean)) setHeadlines(d.headlines);
        if (Array.isArray(d.longHeadlines) && d.longHeadlines.some(Boolean)) setLongHeadlines(d.longHeadlines);
        if (Array.isArray(d.descriptions) && d.descriptions.some(Boolean)) setDescriptions(d.descriptions);
        if (Array.isArray(d.imageUrls) && d.imageUrls.some(Boolean)) setImageUrls(d.imageUrls);
        if (d.videoUrl) setVideoUrl(d.videoUrl);
        if (Array.isArray(d.sitelinks) && d.sitelinks.some((x: { title?: string }) => x?.title)) setSitelinks(d.sitelinks);
        if (d.ctaText) setCtaText(d.ctaText);
        if (d.searchThemes) setSearchThemes(d.searchThemes);
        if (d.audienceName) setAudienceName(d.audienceName);
      }
    } catch { /* ignore corrupt saves */ }
    setLoaded(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      assetGroupName, finalUrl, businessName, logoUrl, headlines, longHeadlines,
      descriptions, imageUrls, videoUrl, sitelinks, ctaText, searchThemes, audienceName,
    }));
  }, [loaded, assetGroupName, finalUrl, businessName, logoUrl, headlines, longHeadlines,
      descriptions, imageUrls, videoUrl, sitelinks, ctaText, searchThemes, audienceName]);

  const setListItem = (list: string[], set: (v: string[]) => void, i: number, v: string) => {
    const next = [...list];
    next[i] = v;
    set(next);
  };

  const filledHeadlines = headlines.filter(Boolean);
  const filledLongHeadlines = longHeadlines.filter(Boolean);
  const filledDescriptions = descriptions.filter(Boolean);

  const strengthChecks = [
    { label: 'Headlines', done: filledHeadlines.length >= 3 },
    { label: 'Long headlines', done: filledLongHeadlines.length >= 1 },
    { label: 'Descriptions', done: filledDescriptions.length >= 2 },
    { label: 'Images', done: imageUrls.some(Boolean) },
    { label: 'Videos', done: !!videoUrl },
    { label: 'Sitelinks', done: sitelinks.filter(s => s.title).length >= 2 },
  ];

  const displayDomain = finalUrl.replace(/^https?:\/\//, '').split('/')[0] || 'example.com';
  const primaryHeadline = filledHeadlines[0] || '';
  const primaryLongHeadline = filledLongHeadlines[0] || primaryHeadline;
  const primaryDescription = filledDescriptions[0] || '';
  const primaryImage = imageUrls.find(Boolean) || '';

  const renderPlacementPreview = () => {
    switch (placement) {
      case 'search':
        return (
          <GoogleSearchAd
            headlines={headlines}
            descriptions={descriptions}
            displayUrl={displayDomain}
            businessName={businessName}
            businessLogoUrl={logoUrl}
            sitelinks={sitelinks}
            imageUrls={imageUrls}
          />
        );
      case 'display':
        return <GoogleDisplayAd headline={primaryHeadline} description={primaryDescription} businessName={businessName} imageUrl={primaryImage} logoUrl={logoUrl} ctaText={ctaText === 'Automated' ? 'Learn more' : ctaText} />;
      case 'youtube':
        return <YouTubeInStreamAd headline={primaryHeadline} description={primaryDescription} displayUrl={displayDomain} ctaText={ctaText === 'Automated' ? 'Learn more' : ctaText} thumbnailUrl={primaryImage} />;
      case 'gmail':
        return <GmailAd senderName={businessName} subject={primaryHeadline} previewText={primaryDescription} logoUrl={logoUrl} />;
      case 'discover':
        return <DiscoverAd headline={primaryLongHeadline} description={primaryDescription} businessName={businessName} imageUrl={primaryImage} logoUrl={logoUrl} />;
    }
  };

  const placementTabs: { id: Placement; label: string }[] = [
    { id: 'search', label: 'Search' },
    { id: 'display', label: 'Display' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'gmail', label: 'Gmail' },
    { id: 'discover', label: 'Discover' },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 items-start">
      {/* ==== Left: Asset group editor ==== */}
      <div className="space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-5 py-4">
          <h2 className="text-xl font-normal text-gray-900">Asset group</h2>
          <p className="text-sm text-gray-600 mt-1">
            Show high quality ads to the right people. Start by adding your assets, the building blocks of every ad.
            Google will test different combinations to create high performing ads across the formats and networks that
            work best for your goals and the audiences you want to reach.
          </p>
        </div>

        <SectionCard title="Asset group name">
          <GField label="Asset group name" value={assetGroupName} onChange={setAssetGroupName} maxLength={128} />
        </SectionCard>

        <SectionCard title="Final URL">
          <GField label="Final URL" value={finalUrl} onChange={setFinalUrl} placeholder="https://example.com/" required />
        </SectionCard>

        <SectionCard title="Brand guidelines" subtitle="Control how your brand appears in ads for this campaign.">
          <div className="space-y-4">
            <GField label="Business name" value={businessName} onChange={setBusinessName} maxLength={25} required />
            <div>
              <p className="text-xs text-gray-600 mb-1">Logos ({logoUrl ? 1 : 0}/5)</p>
              <ImageUpload label="Add logo" value={logoUrl} onChange={setLogoUrl} aspectRatio="1:1" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Assets" subtitle="Headlines and descriptions generated based on your final URL, products and services">
          <div className="space-y-6">
            <AdStrength checks={strengthChecks} />

            {/* Headlines */}
            <div>
              <p className="text-sm font-medium text-gray-800 mb-2">Headlines ({filledHeadlines.length}/15)</p>
              <div className="space-y-2">
                {headlines.slice(0, visibleHeadlines).map((h, i) => (
                  <GField
                    key={i}
                    label={i < 3 ? `Headline ${i + 1} (required)` : `Headline ${i + 1}`}
                    value={h}
                    onChange={(v) => setListItem(headlines, setHeadlines, i, v)}
                    maxLength={30}
                  />
                ))}
              </div>
              {visibleHeadlines < 15 && (
                <button type="button" onClick={() => setVisibleHeadlines(Math.min(15, visibleHeadlines + 5))} className="text-sm font-medium text-blue-600 hover:underline mt-2">
                  + Headline
                </button>
              )}
            </div>

            {/* Long headlines */}
            <div>
              <p className="text-sm font-medium text-gray-800 mb-2">Long headlines ({filledLongHeadlines.length}/5)</p>
              <div className="space-y-2">
                {longHeadlines.slice(0, visibleLongHeadlines).map((h, i) => (
                  <GField
                    key={i}
                    label={`Long headline ${i + 1}`}
                    value={h}
                    onChange={(v) => setListItem(longHeadlines, setLongHeadlines, i, v)}
                    maxLength={90}
                  />
                ))}
              </div>
              {visibleLongHeadlines < 5 && (
                <button type="button" onClick={() => setVisibleLongHeadlines(visibleLongHeadlines + 1)} className="text-sm font-medium text-blue-600 hover:underline mt-2">
                  + Long headline
                </button>
              )}
            </div>

            {/* Descriptions */}
            <div>
              <p className="text-sm font-medium text-gray-800 mb-2">Descriptions ({filledDescriptions.length}/5)</p>
              <div className="space-y-2">
                {descriptions.slice(0, visibleDescriptions).map((d, i) => (
                  <GField
                    key={i}
                    label={i === 0 ? 'Short description (required)' : `Description ${i + 1}`}
                    value={d}
                    onChange={(v) => setListItem(descriptions, setDescriptions, i, v)}
                    maxLength={i === 0 ? 60 : 90}
                    multiline
                  />
                ))}
              </div>
              {visibleDescriptions < 5 && (
                <button type="button" onClick={() => setVisibleDescriptions(visibleDescriptions + 1)} className="text-sm font-medium text-blue-600 hover:underline mt-2">
                  + Description
                </button>
              )}
            </div>

            {/* Images */}
            <div>
              <p className="text-sm font-medium text-gray-800 mb-2">Images ({imageUrls.filter(Boolean).length}/20)</p>
              <div className="grid grid-cols-2 gap-3">
                <ImageUpload label="Image (1.91:1)" value={imageUrls[0]} onChange={(v) => setListItem(imageUrls, setImageUrls, 0, v)} aspectRatio="1.91:1" />
                <ImageUpload label="Square image (1:1)" value={imageUrls[1]} onChange={(v) => setListItem(imageUrls, setImageUrls, 1, v)} aspectRatio="1:1" />
              </div>
            </div>

            {/* Videos */}
            <div>
              <p className="text-sm font-medium text-gray-800 mb-2">Videos ({videoUrl ? 1 : 0}/5)</p>
              <GField label="YouTube video URL (optional)" value={videoUrl} onChange={setVideoUrl} placeholder="https://youtube.com/watch?v=..." />
              <p className="text-xs text-gray-500 mt-1">If you don&apos;t add a video, Google may auto-generate one from your assets.</p>
            </div>

            {/* Sitelinks */}
            <div>
              <p className="text-sm font-medium text-gray-800 mb-2">Sitelinks ({sitelinks.filter(s => s.title).length}/4)</p>
              <div className="space-y-3">
                {sitelinks.map((s, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
                    <GField
                      label={`Sitelink ${i + 1}${i < 2 ? ' (recommended)' : ''}`}
                      value={s.title}
                      onChange={(v) => setSitelinks(sitelinks.map((x, xi) => xi === i ? { ...x, title: v } : x))}
                      maxLength={25}
                    />
                    {s.title && (
                      <GField
                        label="Description"
                        value={s.description1}
                        onChange={(v) => setSitelinks(sitelinks.map((x, xi) => xi === i ? { ...x, description1: v } : x))}
                        maxLength={35}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Call to action */}
            <div>
              <p className="text-sm font-medium text-gray-800 mb-2">Call to action</p>
              <select
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-600"
              >
                {CTA_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </SectionCard>

        {/* Signals */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-5 py-4">
          <h2 className="text-xl font-normal text-gray-900">Signals</h2>
          <p className="text-sm text-gray-600 mt-1">
            Signals provide valuable information about the people you want to reach. They help guide who sees your ads on Google Search, YouTube, and more.
          </p>
        </div>

        <SectionCard title="Search themes" subtitle="What are some words or phrases people use when searching for your products or services?">
          <GField label="Add search themes (up to 25)" value={searchThemes} onChange={setSearchThemes} placeholder="e.g. solar panels, home energy, EV charging" />
        </SectionCard>

        <SectionCard title="Audience signal" subtitle="Reach the right customers faster across Google with an audience signal.">
          <GField label="Audience name — add a name for your audience to save it to your library (optional)" value={audienceName} onChange={setAudienceName} placeholder="e.g. Solar intenders" />
        </SectionCard>
      </div>

      {/* ==== Right: sticky preview ==== */}
      <div className="xl:sticky xl:top-24">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-medium text-gray-900">Preview</h3>
            <DownloadPreviewButton targetRef={previewRef} filename={`pmax-${placement}`} />
          </div>
          <PlacementTabs tabs={placementTabs} active={placement} onSelect={setPlacement} />
          <div ref={previewRef}>
            <PhoneFrame contentWidth={{ search: 302, display: 302, youtube: 480, gmail: 600, discover: 360 }[placement]}>
              {renderPlacementPreview()}
            </PhoneFrame>
          </div>
        </div>
      </div>
    </div>
  );
}
