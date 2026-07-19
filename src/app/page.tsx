'use client';

import { useState } from 'react';
import GoogleSearchAd from '@/components/previews/GoogleSearchAd';
import GoogleDisplayAd from '@/components/previews/GoogleDisplayAd';
import YouTubeInStreamAd from '@/components/previews/YouTubeInStreamAd';
import YouTubeShortsAd from '@/components/previews/YouTubeShortsAd';
import GmailAd from '@/components/previews/GmailAd';
import DiscoverAd from '@/components/previews/DiscoverAd';
import MetaFeedAd from '@/components/previews/MetaFeedAd';
import InstagramFeedAd from '@/components/previews/InstagramFeedAd';
import InstagramStoryAd from '@/components/previews/InstagramStoryAd';
import InstagramReelsAd from '@/components/previews/InstagramReelsAd';
import FacebookStoriesAd from '@/components/previews/FacebookStoriesAd';
import ImageUpload from '@/components/ImageUpload';

type Platform = 'google' | 'meta';
type GoogleAdType = 'search' | 'display' | 'youtube-instream' | 'youtube-shorts' | 'gmail' | 'discover';
type MetaAdType = 'fb-feed' | 'fb-stories' | 'ig-feed' | 'ig-stories' | 'ig-reels';

const googleAdTypes: { id: GoogleAdType; label: string }[] = [
  { id: 'search', label: 'Search' },
  { id: 'display', label: 'Display' },
  { id: 'youtube-instream', label: 'YouTube' },
  { id: 'youtube-shorts', label: 'Shorts' },
  { id: 'gmail', label: 'Gmail' },
  { id: 'discover', label: 'Discover' },
];

const metaAdTypes: { id: MetaAdType; label: string }[] = [
  { id: 'fb-feed', label: 'FB Feed' },
  { id: 'fb-stories', label: 'FB Stories' },
  { id: 'ig-feed', label: 'IG Feed' },
  { id: 'ig-stories', label: 'IG Stories' },
  { id: 'ig-reels', label: 'Reels' },
];

export default function Home() {
  const [platform, setPlatform] = useState<Platform>('google');
  const [googleAdType, setGoogleAdType] = useState<GoogleAdType>('search');
  const [metaAdType, setMetaAdType] = useState<MetaAdType>('fb-feed');

  // Google Ads State
  const [businessName, setBusinessName] = useState('');
  const [businessLogoUrl, setBusinessLogoUrl] = useState('');
  const [headlines, setHeadlines] = useState<string[]>(Array(15).fill(''));
  const [descriptions, setDescriptions] = useState<string[]>(Array(4).fill(''));
  const [displayUrl, setDisplayUrl] = useState('');
  const [finalUrl, setFinalUrl] = useState('');
  const [path1, setPath1] = useState('');
  const [path2, setPath2] = useState('');

  // Sitelinks (up to 8, with 25 char title, 35 char descriptions)
  const [sitelinks, setSitelinks] = useState<{ title: string; description1: string; description2: string; url: string }[]>(
    Array(8).fill(null).map(() => ({ title: '', description1: '', description2: '', url: '' }))
  );

  // Callouts (up to 10, 25 chars each)
  const [callouts, setCallouts] = useState<string[]>(Array(10).fill(''));

  // Structured Snippets
  const [snippetHeader, setSnippetHeader] = useState('Types');
  const [snippetValues, setSnippetValues] = useState<string[]>(Array(10).fill(''));

  // Call Asset
  const [phoneNumber, setPhoneNumber] = useState('');

  // Price Assets (min 3, up to 8)
  const [priceAssets, setPriceAssets] = useState<{ header: string; description: string; price: string; unit: string }[]>(
    Array(5).fill(null).map(() => ({ header: '', description: '', price: '', unit: '' }))
  );

  // Promotion Asset
  const [promotion, setPromotion] = useState({
    occasion: 'None',
    promotionType: 'none' as 'monetary' | 'percentage' | 'none',
    promotionValue: '',
    item: '',
  });

  // Image Assets (up to 4)
  const [searchImageUrls, setSearchImageUrls] = useState<string[]>(['', '', '', '']);

  // Active editor section (for non-search types)
  const [activeAssetSection, setActiveAssetSection] = useState<string>('headlines');

  // Visible headline/description count (start with 5 headlines, 2 descriptions)
  const [visibleHeadlines, setVisibleHeadlines] = useState(5);
  const [visibleDescriptions, setVisibleDescriptions] = useState(2);
  const [visibleSitelinks, setVisibleSitelinks] = useState(2);
  const [visibleCallouts, setVisibleCallouts] = useState(4);

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    headlines: true,
    descriptions: true,
    images: false,
    sitelinks: false,
    promotions: false,
    prices: false,
    calls: false,
    callouts: false,
    snippets: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const [imageUrl, setImageUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [ctaText, setCtaText] = useState('Learn More');
  const [displaySize, setDisplaySize] = useState<'medium-rectangle' | 'leaderboard' | 'large-rectangle'>('medium-rectangle');

  // Structured snippet header options
  const snippetHeaders = [
    'Amenities', 'Brands', 'Courses', 'Degree programs', 'Destinations',
    'Featured hotels', 'Insurance coverage', 'Models', 'Neighborhoods',
    'Service catalog', 'Shows', 'Styles', 'Types'
  ];

  // Promotion occasions
  const promotionOccasions = [
    'None', 'New Year', 'Valentine\'s Day', 'Easter', 'Mother\'s Day',
    'Father\'s Day', 'Labor Day', 'Back to School', 'Halloween',
    'Black Friday', 'Cyber Monday', 'Christmas', 'Boxing Day',
    'Chinese New Year', 'Carnival', 'Diwali', 'Eid', 'Independence Day',
    'End of Season', 'Winter Sale', 'Summer Sale', 'Fall Sale', 'Spring Sale'
  ];

  // Price units
  const priceUnits = ['', 'hour', 'day', 'week', 'month', 'year', 'night', 'item', 'session'];

  // Meta Ads State
  const [pageName, setPageName] = useState('');
  const [username, setUsername] = useState('');
  const [primaryText, setPrimaryText] = useState('');
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [caption, setCaption] = useState('');
  const [metaImageUrl, setMetaImageUrl] = useState('');
  const [metaCtaText, setMetaCtaText] = useState('Learn More');
  const [linkDisplay, setLinkDisplay] = useState('');
  const [pageImageUrl, setPageImageUrl] = useState('');

  const renderGoogleEditor = () => {
    switch (googleAdType) {
      case 'search':
        return (
          <div className="space-y-0 divide-y divide-gray-200">
            {/* Final URL Section */}
            <div className="pb-4">
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                Final URL
                <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={finalUrl}
                onChange={(e) => setFinalUrl(e.target.value)}
                placeholder="https://example.com/landing-page"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Display path</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{displayUrl || 'example.com'} /</span>
                  <input
                    type="text"
                    value={path1}
                    onChange={(e) => setPath1(e.target.value)}
                    placeholder="path1"
                    maxLength={15}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <span className="text-gray-400">/</span>
                  <input
                    type="text"
                    value={path2}
                    onChange={(e) => setPath2(e.target.value)}
                    placeholder="path2"
                    maxLength={15}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Headlines Section */}
            <div className="py-4">
              <button
                onClick={() => toggleSection('headlines')}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.headlines ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Headlines (30 chars max)</span>
                </div>
                <span className="text-xs text-gray-500">{headlines.filter(h => h.trim()).length}/15 added</span>
              </button>
              {expandedSections.headlines && (
                <div className="mt-4 space-y-3 pl-7">
                  {headlines.slice(0, visibleHeadlines).map((h, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm text-gray-400 w-5">{i + 1}</span>
                      <input
                        type="text"
                        value={h}
                        onChange={(e) => {
                          const newHeadlines = [...headlines];
                          newHeadlines[i] = e.target.value;
                          setHeadlines(newHeadlines);
                        }}
                        placeholder={`Headline ${i + 1}${i < 3 ? ' *' : ''}`}
                        maxLength={30}
                        className={`flex-1 px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                          i < 3 ? 'border-blue-200 bg-blue-50/50' : 'border-gray-300'
                        }`}
                      />
                      <span className="text-xs text-gray-400 w-10 text-right">{h.length}/30</span>
                    </div>
                  ))}
                  {visibleHeadlines < 15 && (
                    <button
                      onClick={() => setVisibleHeadlines(Math.min(visibleHeadlines + 5, 15))}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add more headlines
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Descriptions Section */}
            <div className="py-4">
              <button
                onClick={() => toggleSection('descriptions')}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.descriptions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Descriptions (90 chars max)</span>
                </div>
                <span className="text-xs text-gray-500">{descriptions.filter(d => d.trim()).length}/4 added</span>
              </button>
              {expandedSections.descriptions && (
                <div className="mt-4 space-y-3 pl-7">
                  {descriptions.slice(0, visibleDescriptions).map((d, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-sm text-gray-400 w-5 pt-2.5">{i + 1}</span>
                      <textarea
                        value={d}
                        onChange={(e) => {
                          const newDescriptions = [...descriptions];
                          newDescriptions[i] = e.target.value;
                          setDescriptions(newDescriptions);
                        }}
                        placeholder={`Description ${i + 1}${i < 2 ? ' *' : ''}`}
                        maxLength={90}
                        rows={2}
                        className={`flex-1 px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm resize-none ${
                          i < 2 ? 'border-blue-200 bg-blue-50/50' : 'border-gray-300'
                        }`}
                      />
                      <span className="text-xs text-gray-400 w-10 text-right pt-2.5">{d.length}/90</span>
                    </div>
                  ))}
                  {visibleDescriptions < 4 && (
                    <button
                      onClick={() => setVisibleDescriptions(Math.min(visibleDescriptions + 2, 4))}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add more descriptions
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Images Section */}
            <div className="py-4">
              <button
                onClick={() => toggleSection('images')}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.images ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Images</span>
                </div>
                <span className="text-xs text-gray-500">{searchImageUrls.filter(u => u).length}/4 added</span>
              </button>
              {expandedSections.images && (
                <div className="mt-4 pl-7">
                  <p className="text-xs text-gray-500 mb-3">Add images to your campaign</p>
                  <div className="grid grid-cols-4 gap-2">
                    {searchImageUrls.map((url, i) => (
                      <div key={i} className="aspect-square">
                        <ImageUpload
                          label=""
                          value={url}
                          onChange={(newUrl) => {
                            const newUrls = [...searchImageUrls];
                            newUrls[i] = newUrl;
                            setSearchImageUrls(newUrls);
                          }}
                          aspectRatio="1:1"
                          className="h-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Business Name */}
            <div className="py-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">Business name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your Business Name"
                maxLength={25}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Business Logo */}
            <div className="py-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">Business logo</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden">
                  {businessLogoUrl ? (
                    <img src={businessLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <ImageUpload
                  label=""
                  value={businessLogoUrl}
                  onChange={setBusinessLogoUrl}
                  aspectRatio="1:1"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Sitelinks Section */}
            <div className="py-4">
              <button
                onClick={() => toggleSection('sitelinks')}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.sitelinks ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Sitelinks</span>
                </div>
                <span className="text-xs text-gray-500">{sitelinks.filter(s => s.title.trim()).length}/8 added</span>
              </button>
              {expandedSections.sitelinks && (
                <div className="mt-4 pl-7 space-y-3">
                  <p className="text-xs text-gray-500">Add links to your ads to take people to specific pages on your website.</p>
                  {sitelinks.slice(0, visibleSitelinks).map((link, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Sitelink {i + 1}</span>
                        <span className="text-xs text-gray-400">{link.title.length}/25</span>
                      </div>
                      <input
                        type="text"
                        value={link.title}
                        onChange={(e) => {
                          const newSitelinks = [...sitelinks];
                          newSitelinks[i] = { ...newSitelinks[i], title: e.target.value };
                          setSitelinks(newSitelinks);
                        }}
                        placeholder="Sitelink text"
                        maxLength={25}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={link.description1}
                          onChange={(e) => {
                            const newSitelinks = [...sitelinks];
                            newSitelinks[i] = { ...newSitelinks[i], description1: e.target.value };
                            setSitelinks(newSitelinks);
                          }}
                          placeholder="Description line 1"
                          maxLength={35}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="text"
                          value={link.description2}
                          onChange={(e) => {
                            const newSitelinks = [...sitelinks];
                            newSitelinks[i] = { ...newSitelinks[i], description2: e.target.value };
                            setSitelinks(newSitelinks);
                          }}
                          placeholder="Description line 2"
                          maxLength={35}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                  {visibleSitelinks < 8 && (
                    <button
                      onClick={() => setVisibleSitelinks(Math.min(visibleSitelinks + 2, 8))}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add more sitelinks
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Promotions Section */}
            <div className="py-4">
              <button
                onClick={() => toggleSection('promotions')}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.promotions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Promotions</span>
                </div>
              </button>
              {expandedSections.promotions && (
                <div className="mt-4 pl-7 space-y-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Occasion</label>
                    <select
                      value={promotion.occasion}
                      onChange={(e) => setPromotion({ ...promotion, occasion: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      {promotionOccasions.map((occasion) => (
                        <option key={occasion} value={occasion}>{occasion}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Discount type</label>
                      <select
                        value={promotion.promotionType}
                        onChange={(e) => setPromotion({ ...promotion, promotionType: e.target.value as 'monetary' | 'percentage' | 'none' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="none">None</option>
                        <option value="percentage">Percent off</option>
                        <option value="monetary">Money off</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Value</label>
                      <input
                        type="text"
                        value={promotion.promotionValue}
                        onChange={(e) => setPromotion({ ...promotion, promotionValue: e.target.value })}
                        placeholder={promotion.promotionType === 'percentage' ? '20' : '50'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        disabled={promotion.promotionType === 'none'}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Item (20 chars)</label>
                    <input
                      type="text"
                      value={promotion.item}
                      onChange={(e) => setPromotion({ ...promotion, item: e.target.value })}
                      placeholder="all orders"
                      maxLength={20}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Prices Section */}
            <div className="py-4">
              <button
                onClick={() => toggleSection('prices')}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.prices ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Prices</span>
                </div>
              </button>
              {expandedSections.prices && (
                <div className="mt-4 pl-7 space-y-3">
                  {priceAssets.slice(0, 3).map((item, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
                      <span className="text-xs font-medium text-gray-500">Price {i + 1}</span>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={item.header}
                          onChange={(e) => {
                            const newItems = [...priceAssets];
                            newItems[i] = { ...newItems[i], header: e.target.value };
                            setPriceAssets(newItems);
                          }}
                          placeholder="Item name"
                          maxLength={25}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="text"
                          value={item.price}
                          onChange={(e) => {
                            const newItems = [...priceAssets];
                            newItems[i] = { ...newItems[i], price: e.target.value };
                            setPriceAssets(newItems);
                          }}
                          placeholder="$99.99"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Calls Section */}
            <div className="py-4">
              <button
                onClick={() => toggleSection('calls')}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.calls ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Calls</span>
                </div>
              </button>
              {expandedSections.calls && (
                <div className="mt-4 pl-7">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              )}
            </div>

            {/* Callouts Section */}
            <div className="py-4">
              <button
                onClick={() => toggleSection('callouts')}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.callouts ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Callouts</span>
                </div>
                <span className="text-xs text-gray-500">{callouts.filter(c => c.trim()).length}/10 added</span>
              </button>
              {expandedSections.callouts && (
                <div className="mt-4 pl-7 space-y-2">
                  <p className="text-xs text-gray-500 mb-2">Add more business information</p>
                  {callouts.slice(0, visibleCallouts).map((callout, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={callout}
                        onChange={(e) => {
                          const newCallouts = [...callouts];
                          newCallouts[i] = e.target.value;
                          setCallouts(newCallouts);
                        }}
                        placeholder={`Callout ${i + 1}`}
                        maxLength={25}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <span className="text-xs text-gray-400 w-10 text-right">{callout.length}/25</span>
                    </div>
                  ))}
                  {visibleCallouts < 10 && (
                    <button
                      onClick={() => setVisibleCallouts(Math.min(visibleCallouts + 4, 10))}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add more callouts
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Structured Snippets Section */}
            <div className="py-4">
              <button
                onClick={() => toggleSection('snippets')}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.snippets ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Structured snippets</span>
                </div>
              </button>
              {expandedSections.snippets && (
                <div className="mt-4 pl-7 space-y-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Header</label>
                    <select
                      value={snippetHeader}
                      onChange={(e) => setSnippetHeader(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      {snippetHeaders.map((header) => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    {snippetValues.slice(0, 4).map((value, i) => (
                      <input
                        key={i}
                        type="text"
                        value={value}
                        onChange={(e) => {
                          const newValues = [...snippetValues];
                          newValues[i] = e.target.value;
                          setSnippetValues(newValues);
                        }}
                        placeholder={`Value ${i + 1}`}
                        maxLength={25}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'display':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ad Size</label>
              <select
                value={displaySize}
                onChange={(e) => setDisplaySize(e.target.value as typeof displaySize)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="medium-rectangle">Medium Rectangle (300x250)</option>
                <option value="leaderboard">Leaderboard (728x90)</option>
                <option value="large-rectangle">Large Rectangle (336x280)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your Business"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Your headline"
                maxLength={30}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Your description"
                maxLength={90}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <ImageUpload
              label="Ad Image"
              value={imageUrl}
              onChange={setImageUrl}
              aspectRatio="1.91:1"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button</label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="Learn More"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'youtube-instream':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Your headline"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Your description"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display URL</label>
              <input
                type="text"
                value={displayUrl}
                onChange={(e) => setDisplayUrl(e.target.value)}
                placeholder="example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <ImageUpload
              label="Video Thumbnail"
              value={imageUrl}
              onChange={setImageUrl}
              aspectRatio="16:9"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button</label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="Learn More"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'youtube-shorts':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username/Channel</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourbrand"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Your short description..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <ImageUpload
              label="Short Video/Image (9:16)"
              value={imageUrl}
              onChange={setImageUrl}
              aspectRatio="9:16"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button</label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="Visit"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'gmail':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sender Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your Company"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Your email subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preview Text</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Email preview text..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <ImageUpload
              label="Logo (optional)"
              value={logoUrl}
              onChange={setLogoUrl}
              aspectRatio="1:1"
            />
          </div>
        );

      case 'discover':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your Business"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Catchy headline"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Your description"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <ImageUpload
              label="Card Image (1.91:1)"
              value={imageUrl}
              onChange={setImageUrl}
              aspectRatio="1.91:1"
            />
            <ImageUpload
              label="Logo (optional)"
              value={logoUrl}
              onChange={setLogoUrl}
              aspectRatio="1:1"
            />
          </div>
        );
    }
  };

  const renderMetaEditor = () => {
    switch (metaAdType) {
      case 'fb-feed':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Page Name</label>
              <input
                type="text"
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
                placeholder="Your Page"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Text</label>
              <textarea
                value={primaryText}
                onChange={(e) => setPrimaryText(e.target.value)}
                placeholder="Your main message..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Your headline"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Link description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <ImageUpload
              label="Ad Image (1:1 or 1.91:1)"
              value={metaImageUrl}
              onChange={setMetaImageUrl}
              aspectRatio="1:1"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display Link</label>
                <input
                  type="text"
                  value={linkDisplay}
                  onChange={(e) => setLinkDisplay(e.target.value)}
                  placeholder="example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button</label>
                <select
                  value={metaCtaText}
                  onChange={(e) => setMetaCtaText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option>Learn More</option>
                  <option>Shop Now</option>
                  <option>Sign Up</option>
                  <option>Book Now</option>
                  <option>Contact Us</option>
                  <option>Download</option>
                  <option>Get Offer</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'fb-stories':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Page Name</label>
              <input
                type="text"
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
                placeholder="Your Page"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Headline (optional)</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Story headline"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <ImageUpload
              label="Story Image (9:16)"
              value={metaImageUrl}
              onChange={setMetaImageUrl}
              aspectRatio="9:16"
            />
            <ImageUpload
              label="Page Profile Image"
              value={pageImageUrl}
              onChange={setPageImageUrl}
              aspectRatio="1:1"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link Display</label>
                <input
                  type="text"
                  value={linkDisplay}
                  onChange={(e) => setLinkDisplay(e.target.value)}
                  placeholder="example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button</label>
                <select
                  value={metaCtaText}
                  onChange={(e) => setMetaCtaText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option>Learn More</option>
                  <option>Shop Now</option>
                  <option>Sign Up</option>
                  <option>Swipe Up</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'ig-feed':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourbrand"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Your caption..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <ImageUpload
              label="Post Image (1:1)"
              value={metaImageUrl}
              onChange={setMetaImageUrl}
              aspectRatio="1:1"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="text"
                  value={linkDisplay}
                  onChange={(e) => setLinkDisplay(e.target.value)}
                  placeholder="example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button</label>
                <select
                  value={metaCtaText}
                  onChange={(e) => setMetaCtaText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option>Learn More</option>
                  <option>Shop Now</option>
                  <option>Sign Up</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'ig-stories':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourbrand"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <ImageUpload
              label="Story Image (9:16)"
              value={metaImageUrl}
              onChange={setMetaImageUrl}
              aspectRatio="9:16"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button</label>
              <select
                value={metaCtaText}
                onChange={(e) => setMetaCtaText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option>Learn More</option>
                <option>Shop Now</option>
                <option>Swipe Up</option>
              </select>
            </div>
          </div>
        );

      case 'ig-reels':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourbrand"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Your caption... #ad"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <ImageUpload
              label="Reel Image/Video (9:16)"
              value={metaImageUrl}
              onChange={setMetaImageUrl}
              aspectRatio="9:16"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button</label>
              <select
                value={metaCtaText}
                onChange={(e) => setMetaCtaText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option>Shop Now</option>
                <option>Learn More</option>
                <option>Sign Up</option>
              </select>
            </div>
          </div>
        );
    }
  };

  const renderGooglePreview = () => {
    switch (googleAdType) {
      case 'search':
        return (
          <GoogleSearchAd
            headlines={headlines}
            descriptions={descriptions}
            displayUrl={displayUrl}
            path1={path1}
            path2={path2}
            businessName={businessName}
            businessLogoUrl={businessLogoUrl}
            sitelinks={sitelinks}
            callouts={callouts}
            structuredSnippets={{ header: snippetHeader, values: snippetValues }}
            phoneNumber={phoneNumber}
            priceAssets={priceAssets}
            promotion={promotion}
            imageUrls={searchImageUrls}
          />
        );
      case 'display':
        return <GoogleDisplayAd headline={headline} description={description} businessName={businessName} imageUrl={imageUrl} ctaText={ctaText} size={displaySize} />;
      case 'youtube-instream':
        return <YouTubeInStreamAd headline={headline} description={description} displayUrl={displayUrl} ctaText={ctaText} thumbnailUrl={imageUrl} />;
      case 'youtube-shorts':
        return <YouTubeShortsAd username={username} description={description} ctaText={ctaText} imageUrl={imageUrl} />;
      case 'gmail':
        return <GmailAd senderName={businessName} subject={headline} previewText={description} logoUrl={logoUrl} />;
      case 'discover':
        return <DiscoverAd headline={headline} description={description} businessName={businessName} imageUrl={imageUrl} logoUrl={logoUrl} />;
    }
  };

  const renderMetaPreview = () => {
    switch (metaAdType) {
      case 'fb-feed':
        return <MetaFeedAd pageName={pageName} primaryText={primaryText} headline={headline} description={description} imageUrl={metaImageUrl} ctaText={metaCtaText} linkDisplay={linkDisplay} />;
      case 'fb-stories':
        return <FacebookStoriesAd pageName={pageName} pageImageUrl={pageImageUrl} imageUrl={metaImageUrl} headline={headline} ctaText={metaCtaText} linkDisplay={linkDisplay} />;
      case 'ig-feed':
        return <InstagramFeedAd username={username} caption={caption} imageUrl={metaImageUrl} ctaText={metaCtaText} website={linkDisplay} />;
      case 'ig-stories':
        return <InstagramStoryAd username={username} imageUrl={metaImageUrl} ctaText={metaCtaText} />;
      case 'ig-reels':
        return <InstagramReelsAd username={username} caption={caption} imageUrl={metaImageUrl} ctaText={metaCtaText} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Ad Preview Builder</h1>
          <p className="text-gray-600 text-sm">Preview your ads before publishing to Google Ads & Meta Ads</p>
        </div>
      </header>

      {/* Platform Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-4">
            <button
              onClick={() => setPlatform('google')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                platform === 'google'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill={platform === 'google' ? '#4285F4' : '#9CA3AF'} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill={platform === 'google' ? '#34A853' : '#9CA3AF'} d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill={platform === 'google' ? '#FBBC05' : '#9CA3AF'} d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill={platform === 'google' ? '#EA4335' : '#9CA3AF'} d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google Ads
            </button>
            <button
              onClick={() => setPlatform('meta')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                platform === 'meta'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill={platform === 'meta' ? '#1877F2' : '#9CA3AF'}>
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Meta Ads
            </button>
          </nav>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto py-2">
            {platform === 'google' ? (
              googleAdTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setGoogleAdType(type.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                    googleAdType === type.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              ))
            ) : (
              metaAdTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setMetaAdType(type.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                    metaAdType === type.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              ))
            )}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ad Content</h2>
            {platform === 'google' ? renderGoogleEditor() : renderMetaEditor()}
          </div>

          {/* Preview Panel */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>
            <div className="flex items-center justify-center min-h-[500px] bg-gray-50 rounded-lg p-4 overflow-auto">
              {platform === 'google' ? renderGooglePreview() : renderMetaPreview()}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
          Ad Preview Builder - Preview your Google Ads & Meta ads before publishing
        </div>
      </footer>
    </div>
  );
}
