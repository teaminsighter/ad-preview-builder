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
  const [headlines, setHeadlines] = useState<string[]>(Array(15).fill(''));
  const [descriptions, setDescriptions] = useState<string[]>(Array(4).fill(''));
  const [displayUrl, setDisplayUrl] = useState('');
  const [finalUrl, setFinalUrl] = useState('');
  const [path1, setPath1] = useState('');
  const [path2, setPath2] = useState('');
  const [sitelinks, setSitelinks] = useState<{ title: string; description: string }[]>([
    { title: '', description: '' },
    { title: '', description: '' },
    { title: '', description: '' },
    { title: '', description: '' },
  ]);
  const [callouts, setCallouts] = useState<string[]>(['', '', '', '']);
  const [imageUrl, setImageUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [ctaText, setCtaText] = useState('Learn More');
  const [displaySize, setDisplaySize] = useState<'medium-rectangle' | 'leaderboard' | 'large-rectangle'>('medium-rectangle');

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
          <div className="space-y-6">
            {/* Final URL & Business Name */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Final URL</label>
                <input
                  type="text"
                  value={finalUrl}
                  onChange={(e) => setFinalUrl(e.target.value)}
                  placeholder="https://example.com/page"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Path 1</label>
                  <input
                    type="text"
                    value={path1}
                    onChange={(e) => setPath1(e.target.value)}
                    placeholder="products"
                    maxLength={15}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Path 2</label>
                  <input
                    type="text"
                    value={path2}
                    onChange={(e) => setPath2(e.target.value)}
                    placeholder="sale"
                    maxLength={15}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your Business Name"
                  maxLength={25}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Headlines Section */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">Headlines (max 30 chars each)</label>
                <span className="text-xs text-gray-500">{headlines.filter(h => h.trim()).length}/15 added</span>
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
                {headlines.map((h, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
                    <input
                      type="text"
                      value={h}
                      onChange={(e) => {
                        const newHeadlines = [...headlines];
                        newHeadlines[i] = e.target.value;
                        setHeadlines(newHeadlines);
                      }}
                      placeholder={`Headline ${i + 1}${i < 3 ? ' (required)' : ''}`}
                      maxLength={30}
                      className={`flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-sm ${
                        i < 3 ? 'border-blue-300 bg-blue-50/30' : 'border-gray-300'
                      }`}
                    />
                    <span className="text-xs text-gray-400 w-8">{h.length}/30</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Descriptions Section */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">Descriptions (max 90 chars each)</label>
                <span className="text-xs text-gray-500">{descriptions.filter(d => d.trim()).length}/4 added</span>
              </div>
              <div className="space-y-2">
                {descriptions.map((d, i) => (
                  <div key={i}>
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-gray-400 w-5 pt-2">{i + 1}.</span>
                      <textarea
                        value={d}
                        onChange={(e) => {
                          const newDescriptions = [...descriptions];
                          newDescriptions[i] = e.target.value;
                          setDescriptions(newDescriptions);
                        }}
                        placeholder={`Description ${i + 1}${i < 2 ? ' (required)' : ''}`}
                        maxLength={90}
                        rows={2}
                        className={`flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-sm resize-none ${
                          i < 2 ? 'border-blue-300 bg-blue-50/30' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    <div className="text-right text-xs text-gray-400 mr-1">{d.length}/90</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sitelinks Section */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">Sitelinks (optional)</label>
              <div className="space-y-3">
                {sitelinks.map((link, i) => (
                  <div key={i} className="bg-gray-50 p-3 rounded-lg">
                    <input
                      type="text"
                      value={link.title}
                      onChange={(e) => {
                        const newSitelinks = [...sitelinks];
                        newSitelinks[i] = { ...newSitelinks[i], title: e.target.value };
                        setSitelinks(newSitelinks);
                      }}
                      placeholder={`Sitelink ${i + 1} title`}
                      maxLength={25}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm mb-2"
                    />
                    <input
                      type="text"
                      value={link.description}
                      onChange={(e) => {
                        const newSitelinks = [...sitelinks];
                        newSitelinks[i] = { ...newSitelinks[i], description: e.target.value };
                        setSitelinks(newSitelinks);
                      }}
                      placeholder="Description (optional)"
                      maxLength={35}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Callouts Section */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">Callouts (optional)</label>
              <div className="grid grid-cols-2 gap-2">
                {callouts.map((callout, i) => (
                  <input
                    key={i}
                    type="text"
                    value={callout}
                    onChange={(e) => {
                      const newCallouts = [...callouts];
                      newCallouts[i] = e.target.value;
                      setCallouts(newCallouts);
                    }}
                    placeholder={`Callout ${i + 1}`}
                    maxLength={25}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                ))}
              </div>
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
            sitelinks={sitelinks}
            callouts={callouts}
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
          <p className="text-gray-600 text-sm">Preview your ads before publishing to Google PMax & Meta Ads</p>
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
              Google PMax
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
          Ad Preview Builder - Preview your Google PMax & Meta ads before publishing
        </div>
      </footer>
    </div>
  );
}
