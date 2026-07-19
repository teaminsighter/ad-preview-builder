'use client';

import { useState } from 'react';
import GoogleSearchAd from '@/components/previews/GoogleSearchAd';
import GoogleDisplayAd from '@/components/previews/GoogleDisplayAd';
import MetaFeedAd from '@/components/previews/MetaFeedAd';
import InstagramFeedAd from '@/components/previews/InstagramFeedAd';
import InstagramStoryAd from '@/components/previews/InstagramStoryAd';

type AdType = 'google-search' | 'google-display' | 'meta-feed' | 'instagram-feed' | 'instagram-story';

const adTypes: { id: AdType; label: string; icon: string }[] = [
  { id: 'google-search', label: 'Google Search', icon: '🔍' },
  { id: 'google-display', label: 'Google Display', icon: '🖼️' },
  { id: 'meta-feed', label: 'Facebook Feed', icon: '📘' },
  { id: 'instagram-feed', label: 'Instagram Feed', icon: '📷' },
  { id: 'instagram-story', label: 'Instagram Story', icon: '📱' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<AdType>('google-search');

  // Google Search Ad State
  const [searchHeadlines, setSearchHeadlines] = useState(['', '', '']);
  const [searchDescriptions, setSearchDescriptions] = useState(['', '']);
  const [searchDisplayUrl, setSearchDisplayUrl] = useState('');
  const [searchFinalUrl, setSearchFinalUrl] = useState('');

  // Google Display Ad State
  const [displayHeadline, setDisplayHeadline] = useState('');
  const [displayDescription, setDisplayDescription] = useState('');
  const [displayBusinessName, setDisplayBusinessName] = useState('');
  const [displayImageUrl, setDisplayImageUrl] = useState('');
  const [displayCtaText, setDisplayCtaText] = useState('Learn More');
  const [displaySize, setDisplaySize] = useState<'medium-rectangle' | 'leaderboard' | 'large-rectangle'>('medium-rectangle');

  // Meta Feed Ad State
  const [metaPageName, setMetaPageName] = useState('');
  const [metaPrimaryText, setMetaPrimaryText] = useState('');
  const [metaHeadline, setMetaHeadline] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaImageUrl, setMetaImageUrl] = useState('');
  const [metaCtaText, setMetaCtaText] = useState('Learn More');
  const [metaLinkDisplay, setMetaLinkDisplay] = useState('');

  // Instagram Feed Ad State
  const [igFeedUsername, setIgFeedUsername] = useState('');
  const [igFeedCaption, setIgFeedCaption] = useState('');
  const [igFeedImageUrl, setIgFeedImageUrl] = useState('');
  const [igFeedCtaText, setIgFeedCtaText] = useState('Learn More');
  const [igFeedWebsite, setIgFeedWebsite] = useState('');

  // Instagram Story Ad State
  const [igStoryUsername, setIgStoryUsername] = useState('');
  const [igStoryImageUrl, setIgStoryImageUrl] = useState('');
  const [igStoryCtaText, setIgStoryCtaText] = useState('Learn More');

  const renderEditor = () => {
    switch (activeTab) {
      case 'google-search':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Headlines (max 30 chars each)</label>
              {searchHeadlines.map((h, i) => (
                <input
                  key={i}
                  type="text"
                  value={h}
                  onChange={(e) => {
                    const newHeadlines = [...searchHeadlines];
                    newHeadlines[i] = e.target.value;
                    setSearchHeadlines(newHeadlines);
                  }}
                  placeholder={`Headline ${i + 1}`}
                  maxLength={30}
                  className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descriptions (max 90 chars each)</label>
              {searchDescriptions.map((d, i) => (
                <textarea
                  key={i}
                  value={d}
                  onChange={(e) => {
                    const newDescriptions = [...searchDescriptions];
                    newDescriptions[i] = e.target.value;
                    setSearchDescriptions(newDescriptions);
                  }}
                  placeholder={`Description ${i + 1}`}
                  maxLength={90}
                  rows={2}
                  className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display URL</label>
                <input
                  type="text"
                  value={searchDisplayUrl}
                  onChange={(e) => setSearchDisplayUrl(e.target.value)}
                  placeholder="example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Final URL</label>
                <input
                  type="text"
                  value={searchFinalUrl}
                  onChange={(e) => setSearchFinalUrl(e.target.value)}
                  placeholder="https://example.com/page"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 'google-display':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ad Size</label>
              <select
                value={displaySize}
                onChange={(e) => setDisplaySize(e.target.value as typeof displaySize)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                value={displayBusinessName}
                onChange={(e) => setDisplayBusinessName(e.target.value)}
                placeholder="Your Business"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
              <input
                type="text"
                value={displayHeadline}
                onChange={(e) => setDisplayHeadline(e.target.value)}
                placeholder="Your headline here"
                maxLength={30}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={displayDescription}
                onChange={(e) => setDisplayDescription(e.target.value)}
                placeholder="Your description here"
                maxLength={90}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (optional)</label>
              <input
                type="url"
                value={displayImageUrl}
                onChange={(e) => setDisplayImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button Text</label>
              <input
                type="text"
                value={displayCtaText}
                onChange={(e) => setDisplayCtaText(e.target.value)}
                placeholder="Learn More"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );

      case 'meta-feed':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Page Name</label>
              <input
                type="text"
                value={metaPageName}
                onChange={(e) => setMetaPageName(e.target.value)}
                placeholder="Your Page Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Text</label>
              <textarea
                value={metaPrimaryText}
                onChange={(e) => setMetaPrimaryText(e.target.value)}
                placeholder="Your main message..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
              <input
                type="text"
                value={metaHeadline}
                onChange={(e) => setMetaHeadline(e.target.value)}
                placeholder="Your headline"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Link description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (optional)</label>
              <input
                type="url"
                value={metaImageUrl}
                onChange={(e) => setMetaImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display Link</label>
                <input
                  type="text"
                  value={metaLinkDisplay}
                  onChange={(e) => setMetaLinkDisplay(e.target.value)}
                  placeholder="example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button</label>
                <select
                  value={metaCtaText}
                  onChange={(e) => setMetaCtaText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      case 'instagram-feed':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={igFeedUsername}
                onChange={(e) => setIgFeedUsername(e.target.value)}
                placeholder="yourbrand"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
              <textarea
                value={igFeedCaption}
                onChange={(e) => setIgFeedCaption(e.target.value)}
                placeholder="Your caption here..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (optional)</label>
              <input
                type="url"
                value={igFeedImageUrl}
                onChange={(e) => setIgFeedImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="text"
                  value={igFeedWebsite}
                  onChange={(e) => setIgFeedWebsite(e.target.value)}
                  placeholder="example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button</label>
                <select
                  value={igFeedCtaText}
                  onChange={(e) => setIgFeedCtaText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option>Learn More</option>
                  <option>Shop Now</option>
                  <option>Sign Up</option>
                  <option>Book Now</option>
                  <option>Contact Us</option>
                  <option>Download</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'instagram-story':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={igStoryUsername}
                onChange={(e) => setIgStoryUsername(e.target.value)}
                placeholder="yourbrand"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Story Image URL (optional)</label>
              <input
                type="url"
                value={igStoryImageUrl}
                onChange={(e) => setIgStoryImageUrl(e.target.value)}
                placeholder="https://example.com/story-image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 1080x1920 (9:16 ratio)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button</label>
              <select
                value={igStoryCtaText}
                onChange={(e) => setIgStoryCtaText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option>Learn More</option>
                <option>Shop Now</option>
                <option>Sign Up</option>
                <option>Book Now</option>
                <option>Swipe Up</option>
                <option>Download</option>
              </select>
            </div>
          </div>
        );
    }
  };

  const renderPreview = () => {
    switch (activeTab) {
      case 'google-search':
        return (
          <GoogleSearchAd
            headlines={searchHeadlines}
            descriptions={searchDescriptions}
            displayUrl={searchDisplayUrl}
            finalUrl={searchFinalUrl}
          />
        );
      case 'google-display':
        return (
          <GoogleDisplayAd
            headline={displayHeadline}
            description={displayDescription}
            businessName={displayBusinessName}
            imageUrl={displayImageUrl}
            ctaText={displayCtaText}
            size={displaySize}
          />
        );
      case 'meta-feed':
        return (
          <MetaFeedAd
            pageName={metaPageName}
            primaryText={metaPrimaryText}
            headline={metaHeadline}
            description={metaDescription}
            imageUrl={metaImageUrl}
            ctaText={metaCtaText}
            linkDisplay={metaLinkDisplay}
          />
        );
      case 'instagram-feed':
        return (
          <InstagramFeedAd
            username={igFeedUsername}
            caption={igFeedCaption}
            imageUrl={igFeedImageUrl}
            ctaText={igFeedCtaText}
            website={igFeedWebsite}
          />
        );
      case 'instagram-story':
        return (
          <InstagramStoryAd
            username={igStoryUsername}
            imageUrl={igStoryImageUrl}
            ctaText={igStoryCtaText}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Ad Preview Builder</h1>
          <p className="text-gray-600 text-sm">Preview how your ads will look on Google and Meta platforms</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto">
            {adTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setActiveTab(type.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === type.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ad Content</h2>
            {renderEditor()}
          </div>

          {/* Preview Panel */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>
            <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg p-4">
              {renderPreview()}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
          Ad Preview Builder - Preview your ads before publishing
        </div>
      </footer>
    </div>
  );
}
