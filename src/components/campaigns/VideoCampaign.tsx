'use client';

import { useEffect, useState } from 'react';
import ImageUpload from '@/components/ImageUpload';
import YouTubeInStreamAd from '@/components/previews/YouTubeInStreamAd';
import YouTubeShortsAd from '@/components/previews/YouTubeShortsAd';
import { SectionCard, SummaryRow, GField, GToggle, PhoneFrame, PlacementTabs, ReadyItem, AdStrength } from './ui';
import { DEMO_LANDSCAPE_IMG } from './demo';

type Placement = 'instream' | 'shorts';

const STORAGE_KEY = 'videoCampaignData';

export default function VideoCampaign() {
  const [campaignName, setCampaignName] = useState('Video Campaign');
  const [bidding, setBidding] = useState('Target CPV');
  const [budgetType, setBudgetType] = useState<'daily' | 'total'>('daily');
  const [budget, setBudget] = useState('50');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [networkSearch, setNetworkSearch] = useState(true);
  const [networkVideos, setNetworkVideos] = useState(true);
  const [networkPartners, setNetworkPartners] = useState(false);
  const [multiFormat, setMultiFormat] = useState(true);

  // Ad creative — starts with demo data
  const [videoUrl, setVideoUrl] = useState('https://youtube.com/watch?v=demo-store-ad');
  const [channelName, setChannelName] = useState('Demo Store');
  const [headline, setHeadline] = useState('Experience Studio-Quality Sound');
  const [description, setDescription] = useState('Premium wireless headphones with 40-hour battery life.');
  const [displayUrl, setDisplayUrl] = useState('demostore.com');
  const [ctaText, setCtaText] = useState('Shop now');
  const [thumbnailUrl, setThumbnailUrl] = useState(DEMO_LANDSCAPE_IMG);

  const [placement, setPlacement] = useState<Placement>('instream');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.campaignName) setCampaignName(d.campaignName);
        if (d.bidding) setBidding(d.bidding);
        if (d.budgetType) setBudgetType(d.budgetType);
        if (d.budget) setBudget(d.budget);
        if (d.startDate) setStartDate(d.startDate);
        if (d.endDate) setEndDate(d.endDate);
        if (d.networkSearch !== undefined) setNetworkSearch(d.networkSearch);
        if (d.networkVideos !== undefined) setNetworkVideos(d.networkVideos);
        if (d.networkPartners !== undefined) setNetworkPartners(d.networkPartners);
        if (d.multiFormat !== undefined) setMultiFormat(d.multiFormat);
        if (d.videoUrl) setVideoUrl(d.videoUrl);
        if (d.channelName) setChannelName(d.channelName);
        if (d.headline) setHeadline(d.headline);
        if (d.description) setDescription(d.description);
        if (d.displayUrl) setDisplayUrl(d.displayUrl);
        if (d.ctaText) setCtaText(d.ctaText);
        if (d.thumbnailUrl) setThumbnailUrl(d.thumbnailUrl);
      }
    } catch { /* ignore corrupt saves */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      campaignName, bidding, budgetType, budget, startDate, endDate,
      networkSearch, networkVideos, networkPartners, multiFormat,
      videoUrl, channelName, headline, description, displayUrl, ctaText, thumbnailUrl,
    }));
  }, [loaded, campaignName, bidding, budgetType, budget, startDate, endDate,
      networkSearch, networkVideos, networkPartners, multiFormat,
      videoUrl, channelName, headline, description, displayUrl, ctaText, thumbnailUrl]);

  const strengthChecks = [
    { label: 'Video', done: !!videoUrl || !!thumbnailUrl },
    { label: 'Headline', done: !!headline },
    { label: 'Description', done: !!description },
    { label: 'Display URL', done: !!displayUrl },
    { label: 'CTA', done: !!ctaText },
  ];
  const adStrengthOk = strengthChecks.filter(c => c.done).length >= 4;

  const placementTabs: { id: Placement; label: string }[] = [
    { id: 'instream', label: 'In-stream' },
    { id: 'shorts', label: 'Shorts' },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">
      {/* ==== Center: campaign settings ==== */}
      <div className="space-y-4">
        <SectionCard title="Campaign name">
          <GField label="Campaign name" value={campaignName} onChange={setCampaignName} maxLength={256} required />
        </SectionCard>

        <SectionCard title="Bidding">
          <label className="block text-xs text-gray-600 mb-1">What do you want to focus on?</label>
          <select
            value={bidding}
            onChange={(e) => setBidding(e.target.value)}
            className="w-full max-w-md px-3 py-2.5 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-600"
          >
            {['Target CPV', 'Maximize views', 'Target CPM', 'Viewable CPM'].map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <p className="text-xs text-gray-500 mt-2">
            {bidding === 'Target CPV'
              ? 'Pay for each view of your video ad. Best for building consideration.'
              : bidding === 'Maximize views'
                ? 'Get as many views as possible within your budget.'
                : 'Pay per thousand impressions. Best for awareness and reach.'}
          </p>
        </SectionCard>

        <SectionCard title="Budget and dates" subtitle="Enter budget type and amount">
          <div className="flex gap-3 items-start">
            <select
              value={budgetType}
              onChange={(e) => setBudgetType(e.target.value as 'daily' | 'total')}
              className="px-3 py-2.5 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="daily">Daily</option>
              <option value="total">Campaign total</option>
            </select>
            <div className="flex-1 max-w-[220px]">
              <GField label="Amount" value={budget} onChange={setBudget} placeholder="$" required />
            </div>
          </div>
          <div className="mt-3 border border-gray-200 rounded-lg px-4 py-3 grid grid-cols-2 gap-3 max-w-md">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Start date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">End date (optional)</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Networks" subtitle="Where your video ads can appear">
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={networkSearch} onChange={(e) => setNetworkSearch(e.target.checked)} className="accent-blue-600" />
              <span className="text-sm text-gray-800">YouTube search results</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={networkVideos} onChange={(e) => setNetworkVideos(e.target.checked)} className="accent-blue-600" />
              <span className="text-sm text-gray-800">YouTube videos</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={networkPartners} onChange={(e) => setNetworkPartners(e.target.checked)} className="accent-blue-600" />
              <span className="text-sm text-gray-800">Video partners on the Display Network</span>
            </label>
          </div>
        </SectionCard>

        <SectionCard title="Multi-format ads" subtitle="Let Google show your video across in-stream, in-feed, and Shorts formats">
          <GToggle checked={multiFormat} onChange={setMultiFormat} label="Serve across all eligible formats" />
        </SectionCard>

        <div className="space-y-2">
          <SummaryRow title="Location and language" summary="All countries and territories" />
          <SummaryRow title="Content exclusions" summary="Standard inventory" />
          <SummaryRow title="Devices" summary="All eligible devices" />
          <SummaryRow title="Ad schedule" summary="All day" />
        </div>

        {/* Ad creative */}
        <SectionCard title="Create your video ad">
          <div className="space-y-4">
            <AdStrength checks={strengthChecks} />
            <GField label="Your YouTube video URL" value={videoUrl} onChange={setVideoUrl} placeholder="https://youtube.com/watch?v=..." required />
            <ImageUpload label="Video thumbnail (16:9)" value={thumbnailUrl} onChange={setThumbnailUrl} aspectRatio="16:9" />
            <GField label="Channel name" value={channelName} onChange={setChannelName} placeholder="yourbrand" />
            <GField label="Headline" value={headline} onChange={setHeadline} maxLength={90} required />
            <GField label="Description" value={description} onChange={setDescription} maxLength={70} multiline required />
            <div className="grid grid-cols-2 gap-4">
              <GField label="Display URL" value={displayUrl} onChange={setDisplayUrl} placeholder="example.com" />
              <div>
                <label className="block text-xs text-gray-600 mb-1">Call to action</label>
                <select
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-600"
                >
                  {['Learn more', 'Shop now', 'Sign up', 'Subscribe', 'Watch more', 'Visit site', 'Book now', 'Download'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ==== Right: sticky preview + readiness ==== */}
      <div className="xl:sticky xl:top-24 space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <h3 className="text-base font-medium text-gray-900 mb-3">Preview</h3>
          <PlacementTabs tabs={placementTabs} active={placement} onSelect={setPlacement} />
          <PhoneFrame contentWidth={placement === 'instream' ? 480 : 302}>
            {placement === 'instream' ? (
              <YouTubeInStreamAd headline={headline} description={description} displayUrl={displayUrl} ctaText={ctaText} thumbnailUrl={thumbnailUrl} />
            ) : (
              <YouTubeShortsAd username={channelName || 'yourbrand'} description={description} ctaText={ctaText} imageUrl={thumbnailUrl} />
            )}
          </PhoneFrame>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
          <h3 className="text-lg font-normal text-gray-900 mb-2">
            {budget && adStrengthOk ? 'Your campaign is ready' : 'Your campaign is not ready to run yet'}
          </h3>
          <div className="space-y-1">
            <p className="text-xs text-gray-500 mt-2">Bidding</p>
            <ReadyItem ok label={bidding} />
            <p className="text-xs text-gray-500 mt-2">Budget</p>
            <ReadyItem ok={!!budget} warn={!budget} label={budget ? `${budgetType === 'daily' ? 'Daily' : 'Total'} budget: $${budget}` : 'Set budget'} />
            <p className="text-xs text-gray-500 mt-2">Networks</p>
            <ReadyItem ok={networkSearch || networkVideos || networkPartners} warn={!(networkSearch || networkVideos || networkPartners)} label={[networkSearch && 'YouTube search', networkVideos && 'YouTube videos', networkPartners && 'Video partners'].filter(Boolean).join(', ') || 'Select a network'} />
            <p className="text-xs text-gray-500 mt-2">Ad Strength</p>
            <ReadyItem ok={adStrengthOk} warn={!adStrengthOk} label={adStrengthOk ? 'Good' : 'Incomplete'} />
          </div>
        </div>
      </div>
    </div>
  );
}
