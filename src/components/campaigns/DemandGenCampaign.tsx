'use client';

import { useEffect, useRef, useState } from 'react';
import ImageUpload from '@/components/ImageUpload';
import DiscoverAd from '@/components/previews/DiscoverAd';
import GmailAd from '@/components/previews/GmailAd';
import YouTubeInStreamAd from '@/components/previews/YouTubeInStreamAd';
import YouTubeShortsAd from '@/components/previews/YouTubeShortsAd';
import { SectionCard, SummaryRow, GField, GToggle, InfoBanner, PhoneFrame, PlacementTabs, ReadyItem, AdStrength, DownloadPreviewButton } from './ui';
import { DEMO_LANDSCAPE_IMG, DEMO_LOGO_IMG } from './demo';

type Placement = 'discover' | 'gmail' | 'youtube' | 'shorts';
type Goal = 'conversions' | 'clicks' | 'conversion-value' | 'youtube-engagements';

const STORAGE_KEY = 'demandGenCampaignData';

const GOALS: { id: Goal; label: string; description: string; disabled?: boolean }[] = [
  { id: 'conversions', label: 'Conversions', description: 'Get more sales or other conversion actions with your audiences by using a conversion based bid strategy' },
  { id: 'clicks', label: 'Clicks', description: 'Get more traffic or engagement with your ads using a cost-per-click based bid strategy' },
  { id: 'conversion-value', label: 'Conversion value', description: 'Get more sales or other conversion actions to get the most value or at a value you set', disabled: true },
  { id: 'youtube-engagements', label: 'YouTube engagements', description: 'Get more YouTube subscriptions and engagements' },
];

export default function DemandGenCampaign() {
  const [campaignName, setCampaignName] = useState('Demand Gen Campaign');
  const [productFeed, setProductFeed] = useState(false);
  const [goal, setGoal] = useState<Goal>('conversions');
  const [conversionGoal, setConversionGoal] = useState<'leads' | 'purchases'>('leads');
  const [viewThrough, setViewThrough] = useState(false);
  const [useTargetCpa, setUseTargetCpa] = useState(false);
  const [targetCpa, setTargetCpa] = useState('');
  const [budgetType, setBudgetType] = useState<'daily' | 'total'>('daily');
  const [budget, setBudget] = useState('50');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customerAcquisition, setCustomerAcquisition] = useState(false);
  const [mainColor, setMainColor] = useState('#6366f1');
  const [accentColor, setAccentColor] = useState('#a855f7');
  const [font, setFont] = useState('Any font');
  const [euPolitical, setEuPolitical] = useState<'' | 'yes' | 'no'>('no');

  // Ad creative — starts with demo data
  const [businessName, setBusinessName] = useState('Demo Store');
  const [logoUrl, setLogoUrl] = useState(DEMO_LOGO_IMG);
  const [headline, setHeadline] = useState('Premium Wireless Headphones');
  const [description, setDescription] = useState('Noise-cancelling headphones with 40-hour battery life. Free shipping on all orders.');
  const [imageUrl, setImageUrl] = useState(DEMO_LANDSCAPE_IMG);
  const [ctaText, setCtaText] = useState('Shop now');

  const [placement, setPlacement] = useState<Placement>('discover');
  const [loaded, setLoaded] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.campaignName) setCampaignName(d.campaignName);
        if (d.productFeed !== undefined) setProductFeed(d.productFeed);
        if (d.goal) setGoal(d.goal);
        if (d.conversionGoal) setConversionGoal(d.conversionGoal);
        if (d.viewThrough !== undefined) setViewThrough(d.viewThrough);
        if (d.useTargetCpa !== undefined) setUseTargetCpa(d.useTargetCpa);
        if (d.targetCpa) setTargetCpa(d.targetCpa);
        if (d.budgetType) setBudgetType(d.budgetType);
        if (d.budget) setBudget(d.budget);
        if (d.startDate) setStartDate(d.startDate);
        if (d.endDate) setEndDate(d.endDate);
        if (d.customerAcquisition !== undefined) setCustomerAcquisition(d.customerAcquisition);
        if (d.mainColor) setMainColor(d.mainColor);
        if (d.accentColor) setAccentColor(d.accentColor);
        if (d.font) setFont(d.font);
        if (d.euPolitical) setEuPolitical(d.euPolitical);
        if (d.businessName) setBusinessName(d.businessName);
        if (d.logoUrl) setLogoUrl(d.logoUrl);
        if (d.headline) setHeadline(d.headline);
        if (d.description) setDescription(d.description);
        if (d.imageUrl) setImageUrl(d.imageUrl);
        if (d.ctaText) setCtaText(d.ctaText);
      }
    } catch { /* ignore corrupt saves */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      campaignName, productFeed, goal, conversionGoal, viewThrough, useTargetCpa, targetCpa,
      budgetType, budget, startDate, endDate, customerAcquisition, mainColor, accentColor,
      font, euPolitical, businessName, logoUrl, headline, description, imageUrl, ctaText,
    }));
  }, [loaded, campaignName, productFeed, goal, conversionGoal, viewThrough, useTargetCpa, targetCpa,
      budgetType, budget, startDate, endDate, customerAcquisition, mainColor, accentColor,
      font, euPolitical, businessName, logoUrl, headline, description, imageUrl, ctaText]);

  const strengthChecks = [
    { label: 'Business name', done: !!businessName },
    { label: 'Headline', done: !!headline },
    { label: 'Description', done: !!description },
    { label: 'Image', done: !!imageUrl },
    { label: 'Logo', done: !!logoUrl },
  ];
  const adStrengthOk = strengthChecks.filter(c => c.done).length >= 4;

  const renderPlacementPreview = () => {
    switch (placement) {
      case 'discover':
        return <DiscoverAd headline={headline} description={description} businessName={businessName} imageUrl={imageUrl} logoUrl={logoUrl} />;
      case 'gmail':
        return <GmailAd senderName={businessName} subject={headline} previewText={description} logoUrl={logoUrl} />;
      case 'youtube':
        return <YouTubeInStreamAd headline={headline} description={description} displayUrl={businessName ? businessName.toLowerCase().replace(/\s+/g, '') + '.com' : 'example.com'} ctaText={ctaText} thumbnailUrl={imageUrl} />;
      case 'shorts':
        return <YouTubeShortsAd username={businessName || 'yourbrand'} description={description} ctaText={ctaText} imageUrl={imageUrl} profileImageUrl={logoUrl} />;
    }
  };

  const placementTabs: { id: Placement; label: string }[] = [
    { id: 'discover', label: 'Discover' },
    { id: 'gmail', label: 'Gmail' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'shorts', label: 'Shorts' },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">
      {/* ==== Center: campaign settings ==== */}
      <div className="space-y-4">
        <SectionCard title="Campaign name">
          <GField label="Campaign name" value={campaignName} onChange={setCampaignName} maxLength={256} required />
        </SectionCard>

        <SectionCard title="Product feeds" subtitle="Use a product feed with your campaign to show the most relevant products in your ads">
          <GToggle checked={productFeed} onChange={setProductFeed} label="Run a product feed campaign" />
          <InfoBanner>
            Improve your campaign performance by adding your product feed. On average, advertisers see 33% more
            conversions at a similar cost per action (CPA) by adding product feeds to Demand Gen campaigns.
          </InfoBanner>
        </SectionCard>

        <SectionCard title="Campaign goal">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {GOALS.map((g) => (
              <button
                key={g.id}
                type="button"
                disabled={g.disabled}
                onClick={() => !g.disabled && setGoal(g.id)}
                className={`relative text-left p-4 rounded-lg border transition-all ${
                  g.disabled
                    ? 'border-gray-200 opacity-50 cursor-not-allowed'
                    : goal === g.id
                      ? 'border-blue-600 ring-1 ring-blue-600 bg-blue-50/30'
                      : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {goal === g.id && !g.disabled && (
                  <svg className="absolute top-2 right-2 w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-2 15l-5-5 1.4-1.4L10 14.2l7.6-7.6L19 8l-9 9z"/>
                  </svg>
                )}
                <p className={`text-sm font-medium ${goal === g.id && !g.disabled ? 'text-blue-700' : 'text-gray-800'}`}>{g.label}</p>
                <p className="text-xs text-gray-500 mt-1.5">{g.description}</p>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Conversion goals">
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
            <div className="grid grid-cols-4 gap-2 px-4 py-2 text-xs text-gray-500">
              <span>Conversion Goals</span><span>Conversion Source</span><span>Conversion Actions</span><span>Value</span>
            </div>
            {([
              { id: 'leads' as const, label: 'Converted leads' },
              { id: 'purchases' as const, label: 'Purchases' },
            ]).map((row) => (
              <label key={row.id} className="grid grid-cols-4 gap-2 px-4 py-3 items-center cursor-pointer hover:bg-gray-50">
                <span className="flex items-center gap-2 text-sm text-gray-800">
                  <input
                    type="radio"
                    name="conversionGoal"
                    checked={conversionGoal === row.id}
                    onChange={() => setConversionGoal(row.id)}
                    className="accent-blue-600"
                  />
                  <span>{row.label}<span className="block text-xs text-gray-500">(account default)</span></span>
                </span>
                <span className="text-sm text-gray-600">Website</span>
                <span className="text-sm text-gray-400">—</span>
                <span className="text-sm text-gray-600">Dynamic</span>
              </label>
            ))}
          </div>
          <button type="button" className="text-sm font-medium text-blue-600 hover:underline mt-3">Add goal</button>
        </SectionCard>

        <SectionCard title="View-through conversion optimization" badge="BETA">
          <p className="text-sm text-gray-600 mb-3">
            Google Ads can include view-through conversions, in addition to click-through and engaged-view conversions,
            when bidding and reporting. While in beta, not all channels are supported.
          </p>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={viewThrough} onChange={(e) => setViewThrough(e.target.checked)} className="mt-1 accent-blue-600" />
            <span className="text-sm text-gray-800">
              Include view-through conversions
              <span className="block text-xs text-gray-500">Recorded when users view (but don&apos;t interact with) an ad and then later convert</span>
            </span>
          </label>
        </SectionCard>

        <SectionCard title="Target cost per action">
          <p className="text-sm text-gray-600 mb-3">
            By default, your campaign will aim to maximize your conversions. You can set an optional target cost per
            conversion (Target CPA) to optimize for getting conversions at a specific cost per conversion.
          </p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={useTargetCpa} onChange={(e) => setUseTargetCpa(e.target.checked)} className="accent-blue-600" />
            <span className="text-sm text-gray-800">Set a target cost per action (optional)</span>
          </label>
          {useTargetCpa && (
            <div className="mt-3 max-w-[200px]">
              <GField label="Target CPA" value={targetCpa} onChange={setTargetCpa} placeholder="$" />
            </div>
          )}
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

        <SectionCard title="Customer acquisition">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={customerAcquisition} onChange={(e) => setCustomerAcquisition(e.target.checked)} className="accent-blue-600" />
            <span className="text-sm text-gray-800">Adjust your bidding to help acquire new customers</span>
          </label>
          <p className="text-xs text-gray-500 mt-2">
            By default, your campaign bids equally for new and existing customers. You can configure customer
            acquisition settings to optimize for acquiring new customers.
          </p>
        </SectionCard>

        <SectionCard title="Brand guidelines" subtitle="Control how your brand appears in ads for this campaign.">
          <p className="text-sm font-medium text-gray-800 mb-2">Custom colors</p>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <GField label="Main color" value={mainColor} onChange={setMainColor} placeholder="#1a73e8" />
                </div>
                <div className="w-7 h-7 rounded-full border border-gray-300 mt-1" style={{ backgroundColor: mainColor || '#ffffff' }} />
              </div>
              <p className="text-xs text-gray-400 -mt-1">Example: #ffffff</p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <GField label="Accent color" value={accentColor} onChange={setAccentColor} placeholder="#fbbc05" />
                </div>
                <div className="w-7 h-7 rounded-full border border-gray-300 mt-1" style={{ backgroundColor: accentColor || '#ffffff' }} />
              </div>
              <p className="text-xs text-gray-400 -mt-1">Example: #ffffff</p>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-800 mt-4 mb-2">Font</p>
          <select
            value={font}
            onChange={(e) => setFont(e.target.value)}
            className="w-full max-w-md px-3 py-2.5 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-600"
          >
            {['Any font', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins'].map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </SectionCard>

        <SectionCard title="EU political ads">
          <p className="text-sm text-gray-800 mb-1">Does your campaign have European Union political ads?</p>
          {!euPolitical && <p className="text-xs text-red-600 mb-2">Required</p>}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="euPolitical" checked={euPolitical === 'yes'} onChange={() => setEuPolitical('yes')} className="accent-blue-600" />
              <span className="text-sm text-gray-800">Yes, this campaign has EU political ads</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="euPolitical" checked={euPolitical === 'no'} onChange={() => setEuPolitical('no')} className="accent-blue-600" />
              <span className="text-sm text-gray-800">No, this campaign doesn&apos;t have EU political ads</span>
            </label>
          </div>
        </SectionCard>

        <div className="space-y-2">
          <SummaryRow title="Location and language" summary="Set at ad group, include people with presence in locations" />
          <SummaryRow title="Devices" summary="All eligible devices (computers, mobile, tablet, and TV screens)" />
          <SummaryRow title="Ad schedule" summary="All day" />
          <SummaryRow title="Third-party measurement" summary="None" />
          <SummaryRow title="Campaign URL options" summary="No options set" />
          <SummaryRow title="IP exclusions" summary="No exclusions set" />
        </div>

        {/* Ad creative */}
        <SectionCard title="Ad" subtitle="Add the creative assets for your Demand Gen ad">
          <div className="space-y-4">
            <AdStrength checks={strengthChecks} />
            <GField label="Business name" value={businessName} onChange={setBusinessName} maxLength={25} required />
            <ImageUpload label="Logo (1:1)" value={logoUrl} onChange={setLogoUrl} aspectRatio="1:1" />
            <GField label="Headline" value={headline} onChange={setHeadline} maxLength={40} required />
            <GField label="Description" value={description} onChange={setDescription} maxLength={90} multiline required />
            <ImageUpload label="Image (1.91:1)" value={imageUrl} onChange={setImageUrl} aspectRatio="1.91:1" />
            <div>
              <label className="block text-xs text-gray-600 mb-1">Call to action</label>
              <select
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-600"
              >
                {['Learn more', 'Shop now', 'Sign up', 'Subscribe', 'Get quote', 'Contact us', 'Book now', 'Download'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </SectionCard>

        {/* Preview */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-medium text-gray-900">Preview</h3>
            <DownloadPreviewButton targetRef={previewRef} filename={`demand-gen-${placement}`} />
          </div>
          <PlacementTabs tabs={placementTabs} active={placement} onSelect={setPlacement} />
          <div ref={previewRef}>
            <PhoneFrame contentWidth={{ discover: 360, gmail: 600, youtube: 480, shorts: 302 }[placement]}>
              {renderPlacementPreview()}
            </PhoneFrame>
          </div>
        </div>
      </div>

      {/* ==== Right sidebar: readiness ==== */}
      <div className="xl:sticky xl:top-24 space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <h3 className="text-lg font-normal text-gray-900">
              {budget && euPolitical && adStrengthOk ? 'Your campaign is ready' : 'Your campaign is not ready to run yet'}
            </h3>
          </div>
          {/* Channel icons */}
          <div className="flex items-center gap-2 my-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/><path fill="#FFF" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#EA4335" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg>
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#34A853" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle fill="#FFF" cx="12" cy="9" r="2.5"/></svg>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2"><rect x="3" y="4" width="18" height="14" rx="2"/><path strokeLinecap="round" d="M8 21h8"/></svg>
          </div>
          <p className="text-sm font-medium text-gray-700 mb-2">Details</p>
          <div className="space-y-1">
            <p className="text-xs text-gray-500 mt-2">Conversion goals</p>
            <ReadyItem ok label={conversionGoal === 'leads' ? 'Converted leads' : 'Purchases'} />
            <p className="text-xs text-gray-500 mt-2">Bidding</p>
            <ReadyItem ok label={goal === 'clicks' ? 'Maximize clicks' : 'Maximize conversions'} />
            <p className="text-xs text-gray-500 mt-2">Budget</p>
            <ReadyItem ok={!!budget} warn={!budget} label={budget ? `${budgetType === 'daily' ? 'Daily' : 'Total'} budget: $${budget}` : 'Set budget'} />
            <p className="text-xs text-gray-500 mt-2">Targeting</p>
            <ReadyItem ok={false} label="Set at ad group" />
            <p className="text-xs text-gray-500 mt-2">Ad Strength</p>
            <ReadyItem ok={adStrengthOk} warn={!adStrengthOk} label={adStrengthOk ? 'Good' : 'Incomplete'} />
            <p className="text-xs text-gray-500 mt-2">EU political ads</p>
            <ReadyItem ok={!!euPolitical} warn={!euPolitical} label={euPolitical ? (euPolitical === 'yes' ? 'Has EU political ads' : 'No EU political ads') : 'Answer required'} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
            <p className="text-sm font-medium text-gray-800">Your estimated performance</p>
          </div>
          <p className="text-xs text-gray-500">
            {budget ? 'Estimates are based on your budget and targeting settings.' : 'Set a budget to view performance estimates for this campaign'}
          </p>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-800">Available campaign impressions</p>
            <p className="text-xs text-gray-500 mt-0.5">{budget ? 'Estimates will appear here' : '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
