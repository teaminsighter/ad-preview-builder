'use client';

import { useEffect, useRef, useState } from 'react';
import ImageUpload from '@/components/ImageUpload';
import GoogleDisplayAd from '@/components/previews/GoogleDisplayAd';
import GmailAd from '@/components/previews/GmailAd';
import YouTubeInStreamAd from '@/components/previews/YouTubeInStreamAd';
import { GField, PhoneFrame, ReadyItem, DownloadPreviewButton } from './ui';
import { DEMO_LANDSCAPE_IMG, DEMO_SQUARE_IMG, DEMO_LOGO_IMG } from './demo';

type Placement = 'display' | 'gmail' | 'youtube';
type DisplaySize = 'medium-rectangle' | 'leaderboard' | 'large-rectangle';

const STORAGE_KEY = 'displayCampaignData';

export default function DisplayCampaign() {
  const [finalUrl, setFinalUrl] = useState('https://www.demostore.com');
  const [businessName, setBusinessName] = useState('Demo Store');
  const [landscapeImageUrl, setLandscapeImageUrl] = useState(DEMO_LANDSCAPE_IMG);
  const [squareImageUrl, setSquareImageUrl] = useState(DEMO_SQUARE_IMG);
  const [logoUrl, setLogoUrl] = useState(DEMO_LOGO_IMG);
  const [videoUrl, setVideoUrl] = useState('');
  const [headlines, setHeadlines] = useState<string[]>(['Premium Wireless Headphones', ...Array(4).fill('')]);
  const [visibleHeadlines, setVisibleHeadlines] = useState(1);
  const [longHeadline, setLongHeadline] = useState('Experience Studio-Quality Sound with Demo Store Wireless Headphones');
  const [descriptions, setDescriptions] = useState<string[]>(['Noise-cancelling headphones with 40-hour battery life.', ...Array(4).fill('')]);
  const [visibleDescriptions, setVisibleDescriptions] = useState(1);
  const [ctaText, setCtaText] = useState('Shop now');
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);
  const [placement, setPlacement] = useState<Placement>('display');
  const [displaySize, setDisplaySize] = useState<DisplaySize>('medium-rectangle');
  const [loaded, setLoaded] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.finalUrl) setFinalUrl(d.finalUrl);
        if (d.businessName) setBusinessName(d.businessName);
        if (d.landscapeImageUrl) setLandscapeImageUrl(d.landscapeImageUrl);
        if (d.squareImageUrl) setSquareImageUrl(d.squareImageUrl);
        if (d.logoUrl) setLogoUrl(d.logoUrl);
        if (d.videoUrl) setVideoUrl(d.videoUrl);
        if (Array.isArray(d.headlines) && d.headlines.some(Boolean)) setHeadlines(d.headlines);
        if (d.longHeadline) setLongHeadline(d.longHeadline);
        if (Array.isArray(d.descriptions) && d.descriptions.some(Boolean)) setDescriptions(d.descriptions);
        if (d.ctaText) setCtaText(d.ctaText);
      }
    } catch { /* ignore corrupt saves */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      finalUrl, businessName, landscapeImageUrl, squareImageUrl, logoUrl, videoUrl,
      headlines, longHeadline, descriptions, ctaText,
    }));
  }, [loaded, finalUrl, businessName, landscapeImageUrl, squareImageUrl, logoUrl, videoUrl,
      headlines, longHeadline, descriptions, ctaText]);

  const filledHeadlines = headlines.filter(Boolean);
  const filledDescriptions = descriptions.filter(Boolean);
  const primaryImage = landscapeImageUrl || squareImageUrl;

  // Ad strength chips exactly as Google shows them for responsive display ads
  const strengthChecks = [
    { label: 'Images', done: !!landscapeImageUrl && !!squareImageUrl },
    { label: 'Videos', done: !!videoUrl },
    { label: 'Headlines', done: filledHeadlines.length >= 1 && !!longHeadline },
    { label: 'Descriptions', done: filledDescriptions.length >= 1 },
  ];
  const doneCount = strengthChecks.filter(c => c.done).length;
  const strengthLabel = !finalUrl || doneCount === 0 ? 'Incomplete' : doneCount === 1 ? 'Poor' : doneCount === 2 ? 'Average' : doneCount === 3 ? 'Good' : 'Excellent';
  const strengthColor = strengthLabel === 'Incomplete' ? 'text-gray-600' : strengthLabel === 'Poor' ? 'text-red-600' : strengthLabel === 'Average' ? 'text-amber-600' : strengthLabel === 'Good' ? 'text-blue-600' : 'text-green-600';

  const missingAssets = [
    !filledHeadlines.length && !longHeadline ? '1 headline or long headline' : null,
    !filledDescriptions.length ? '1 disclaimer or description' : null,
    !landscapeImageUrl ? '1 horizontal image' : null,
  ].filter(Boolean) as string[];

  const setListItem = (list: string[], set: (v: string[]) => void, i: number, v: string) => {
    const next = [...list];
    next[i] = v;
    set(next);
  };

  const displayDomain = finalUrl.replace(/^https?:\/\//, '').split('/')[0] || 'example.com';

  const renderPlacementPreview = () => {
    switch (placement) {
      case 'display':
        return missingAssets.length > 0 ? (
          // Locked-format card, like Google's "To unlock this format" notice
          <div className="w-[302px] bg-white border border-gray-200 rounded-lg p-4">
            <div className="border border-amber-300 bg-amber-50/40 rounded-lg p-4 mb-4">
              <div className="flex gap-2">
                <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                </svg>
                <div>
                  <p className="text-sm text-gray-800">To unlock this format, add the following assets:</p>
                  <ul className="list-disc ml-5 mt-1 space-y-0.5">
                    {missingAssets.map(m => <li key={m} className="text-sm text-gray-700">{m}</li>)}
                  </ul>
                </div>
              </div>
            </div>
            <div className="aspect-[1.91/1] bg-gray-200 rounded flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </div>
            <p className="font-bold text-gray-900 mt-3">{filledHeadlines[0] || 'Headline'}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-8 h-8 bg-gray-200 rounded flex-shrink-0" />
              <p className="text-xs text-gray-500 flex-1">{filledDescriptions[0] || 'Description'}</p>
              <div className="w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
              </div>
            </div>
            <div className="space-y-1.5 mt-4">
              {[...Array(8)].map((_, i) => <div key={i} className="h-2 bg-gray-100 rounded" />)}
            </div>
          </div>
        ) : (
          <GoogleDisplayAd
            headline={filledHeadlines[0] || ''}
            description={filledDescriptions[0] || ''}
            businessName={businessName}
            imageUrl={displaySize === 'medium-rectangle' ? squareImageUrl || landscapeImageUrl : landscapeImageUrl || squareImageUrl}
            logoUrl={logoUrl}
            ctaText={ctaText}
            size={displaySize}
          />
        );
      case 'gmail':
        return <GmailAd senderName={businessName} subject={filledHeadlines[0] || longHeadline} previewText={filledDescriptions[0] || ''} logoUrl={logoUrl} />;
      case 'youtube':
        return <YouTubeInStreamAd headline={filledHeadlines[0] || ''} description={filledDescriptions[0] || ''} displayUrl={displayDomain} ctaText={ctaText} thumbnailUrl={primaryImage} />;
    }
  };

  const previewWidth = placement === 'gmail' ? 600 : placement === 'youtube' ? 480 : displaySize === 'leaderboard' ? 728 : displaySize === 'large-rectangle' ? 336 : 302;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 items-start">
      {/* ==== Ad creation card ==== */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-normal text-gray-900">Ad creation</h2>
        </div>

        {/* Ad type */}
        <div className="px-5 py-6 text-center border-b border-gray-200">
          <p className="text-xs text-gray-500">In Progress</p>
          <p className="text-sm text-gray-900 mt-0.5">Responsive display ad</p>
          <button type="button" className="text-sm font-medium text-blue-600 hover:underline mt-0.5">Change</button>
        </div>

        {/* Ad strength bar */}
        <div className="bg-blue-50/70 border-b border-blue-100 px-5 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            <span className="text-sm text-gray-700">{finalUrl ? `Ads for ${displayDomain}` : 'Add a final URL'}</span>
          </div>
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full border-4 ${doneCount === 0 ? 'border-gray-300' : doneCount < 3 ? 'border-amber-400' : 'border-green-500'}`} />
              <div>
                <p className="text-xs font-medium text-gray-800">Ad strength <span className="text-gray-400">?</span></p>
                <p className={`text-xs ${strengthColor}`}>{strengthLabel}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-1">
              {strengthChecks.map((c) => (
                <span key={c.label} className="flex items-center gap-1.5 text-xs text-gray-700">
                  {c.done ? (
                    <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-2 15l-5-5 1.4-1.4L10 14.2l7.6-7.6L19 8l-9 9z"/></svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/></svg>
                  )}
                  {c.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px]">
          {/* ==== Left: asset fields ==== */}
          <div className="p-5 space-y-6 lg:border-r border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-800 mb-2">Final URL <span className="text-gray-400">?</span></p>
              <GField label="" value={finalUrl} onChange={setFinalUrl} placeholder="https://www.example.com" required />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800 mb-2">Business name <span className="text-gray-400">?</span></p>
              <GField label="" value={businessName} onChange={setBusinessName} placeholder="Business name" maxLength={25} required />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800">Images <span className="text-gray-400">?</span></p>
              <p className="text-xs text-gray-600 mb-2">Add up to 15 images <span className="text-blue-600 underline">Learn more</span></p>
              <div className="grid grid-cols-2 gap-3">
                <ImageUpload label="Landscape (1.91:1)" value={landscapeImageUrl} onChange={setLandscapeImageUrl} aspectRatio="1.91:1" />
                <ImageUpload label="Square (1:1)" value={squareImageUrl} onChange={setSquareImageUrl} aspectRatio="1:1" />
              </div>
              <p className={`text-xs mt-2 ${landscapeImageUrl ? 'text-green-700' : 'text-gray-500'}`}>At least 1 landscape image is required</p>
              <p className={`text-xs ${squareImageUrl ? 'text-green-700' : 'text-gray-500'}`}>At least 1 square image is required</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800">Logos <span className="text-gray-400">?</span></p>
              <p className="text-xs text-gray-600 mb-2">Add up to 5 logos</p>
              <ImageUpload label="Logo (1:1)" value={logoUrl} onChange={setLogoUrl} aspectRatio="1:1" />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800">Videos</p>
              <p className="text-xs text-gray-600 mb-2">Optional (portrait and landscape around 30 seconds work best)</p>
              <GField label="" value={videoUrl} onChange={setVideoUrl} placeholder="https://youtube.com/watch?v=..." />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800">Headlines <span className="text-gray-400">?</span></p>
              <p className="text-xs text-gray-600 mb-2">Add up to 5 headlines</p>
              <div className="space-y-2">
                {headlines.slice(0, visibleHeadlines).map((h, i) => (
                  <GField
                    key={i}
                    label=""
                    value={h}
                    onChange={(v) => setListItem(headlines, setHeadlines, i, v)}
                    placeholder="Headline"
                    maxLength={30}
                    required={i === 0}
                  />
                ))}
              </div>
              {visibleHeadlines < 5 && (
                <button type="button" onClick={() => setVisibleHeadlines(visibleHeadlines + 1)} className="text-sm font-medium text-blue-600 hover:underline mt-1">
                  + Headline
                </button>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800 mb-2">Long headline <span className="text-gray-400">?</span></p>
              <GField label="" value={longHeadline} onChange={setLongHeadline} placeholder="Long headline" maxLength={90} required />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800">Descriptions <span className="text-gray-400">?</span></p>
              <p className="text-xs text-gray-600 mb-2">Add up to 5 descriptions</p>
              <div className="space-y-2">
                {descriptions.slice(0, visibleDescriptions).map((d, i) => (
                  <GField
                    key={i}
                    label=""
                    value={d}
                    onChange={(v) => setListItem(descriptions, setDescriptions, i, v)}
                    placeholder="Description"
                    maxLength={90}
                    multiline
                    required={i === 0}
                  />
                ))}
              </div>
              {visibleDescriptions < 5 && (
                <button type="button" onClick={() => setVisibleDescriptions(visibleDescriptions + 1)} className="text-sm font-medium text-blue-600 hover:underline mt-1">
                  + Description
                </button>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <button type="button" className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                Additional format options
              </button>
              <button type="button" className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                Ad URL options
              </button>
              <button
                type="button"
                onClick={() => setMoreOptionsOpen(!moreOptionsOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-sm font-medium text-blue-600 hover:bg-blue-50"
              >
                More options
                <svg className={`w-4 h-4 transition-transform ${moreOptionsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
              </button>
              {moreOptionsOpen && (
                <div className="max-w-xs">
                  <label className="block text-xs text-gray-600 mb-1">Call to action</label>
                  <select
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-600"
                  >
                    {['Learn more', 'Shop now', 'Sign up', 'Subscribe', 'Get quote', 'Contact us', 'Book now', 'Download', 'Apply now'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              )}
              <p className="text-sm text-gray-600 pt-2">
                Your ads might not always include all your text and images. Some cropping or shortening may occur in
                some formats, and either of your custom colors may be used.
              </p>
            </div>
          </div>

          {/* ==== Right: preview ==== */}
          <div className="p-5 bg-gray-50/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-gray-900">Preview</h3>
              <div className="flex items-center gap-3 text-sm font-medium text-blue-600">
                <button type="button" className="hover:underline">Share</button>
                <DownloadPreviewButton targetRef={previewRef} filename={`display-${placement}`} />
              </div>
            </div>

            {/* Channel tabs like Google: Display / Gmail / YouTube */}
            <div className="flex justify-center gap-6 border-b border-gray-200 mb-5">
              {([
                { id: 'display' as Placement, label: 'Display', icon: <svg className="w-5 h-5 mx-auto" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2"><rect x="3" y="4" width="18" height="14" rx="2"/><path strokeLinecap="round" d="M8 21h8"/></svg> },
                { id: 'gmail' as Placement, label: 'Gmail', icon: <svg className="w-5 h-5 mx-auto" viewBox="0 0 24 24"><path fill="#EA4335" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg> },
                { id: 'youtube' as Placement, label: 'YouTube', icon: <svg className="w-5 h-5 mx-auto" viewBox="0 0 24 24"><path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/><path fill="#FFF" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
              ]).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setPlacement(t.id)}
                  className={`pb-2 px-1 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    placement === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t.icon}
                  <span className="block mt-1">{t.label}</span>
                </button>
              ))}
            </div>

            {placement === 'display' && missingAssets.length === 0 && (
              <select
                value={displaySize}
                onChange={(e) => setDisplaySize(e.target.value as DisplaySize)}
                className="mb-4 mx-auto block px-3 py-1.5 border border-gray-300 rounded text-xs text-gray-700 bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="medium-rectangle">Medium Rectangle (300×250)</option>
                <option value="large-rectangle">Large Rectangle (336×280)</option>
                <option value="leaderboard">Leaderboard (728×90)</option>
              </select>
            )}

            <div ref={previewRef}>
              <PhoneFrame contentWidth={previewWidth}>{renderPlacementPreview()}</PhoneFrame>
            </div>

            <p className="text-xs text-gray-500 text-center mt-5 px-2">
              Previews shown here are examples and don&apos;t include all possible formats. You&apos;re responsible for the
              content of your ads. Please make sure that your provided assets don&apos;t violate any Google policies or
              applicable laws, either individually, or in combination.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 flex gap-5">
          <button type="button" className="text-sm font-medium text-blue-600 hover:underline">Create ad</button>
          <button type="button" className="text-sm font-medium text-blue-600 hover:underline">Cancel</button>
        </div>
      </div>

      {/* ==== Sidebar: weekly estimates ==== */}
      <div className="xl:sticky xl:top-24 space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
          <h3 className="text-base font-medium text-gray-900 mb-3">Weekly estimates</h3>
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <p className="text-sm font-medium text-gray-800">Available impressions</p>
          </div>
          <p className="text-xs text-gray-500">Based on your targeting and settings but not your budget or bid</p>
          <p className="text-xs text-gray-500 underline decoration-dotted mt-2">Impressions</p>
          <p className="text-sm font-medium text-gray-900">{finalUrl ? 'Estimates will appear here' : '—'}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
            <p className="text-sm font-medium text-gray-800">Your estimated performance</p>
          </div>
          <p className="text-xs text-gray-500">To see estimated performance, enter the following settings:</p>
          <ul className="list-disc ml-5 mt-1">
            <li className="text-xs text-gray-700">Budget</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
          <h3 className="text-base font-medium text-gray-900 mb-2">Ad checklist</h3>
          <div className="space-y-1">
            <ReadyItem ok={!!finalUrl} warn={!finalUrl} label={finalUrl ? displayDomain : 'Add a final URL'} />
            <ReadyItem ok={!!businessName} warn={!businessName} label={businessName || 'Add business name'} />
            <ReadyItem ok={!!landscapeImageUrl && !!squareImageUrl} warn={!(landscapeImageUrl && squareImageUrl)} label="Landscape + square image" />
            <ReadyItem ok={filledHeadlines.length >= 1 && !!longHeadline} warn={!(filledHeadlines.length >= 1 && longHeadline)} label="Headline + long headline" />
            <ReadyItem ok={filledDescriptions.length >= 1} warn={filledDescriptions.length < 1} label="Description" />
          </div>
        </div>
      </div>
    </div>
  );
}
