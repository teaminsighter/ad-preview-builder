'use client';

import AdMedia from './AdMedia';

interface InstagramFeedAdProps {
  username: string;
  profileImageUrl?: string;
  imageUrl?: string;
  mediaKind?: 'image' | 'video';
  caption: string;
  ctaText?: string;
  website?: string;
}

export default function InstagramFeedAd({
  username,
  profileImageUrl,
  imageUrl,
  mediaKind,
  caption,
  ctaText = 'Learn More',
  website = 'example.com',
}: InstagramFeedAdProps) {
  return (
    <div className="bg-white max-w-[400px] font-sans border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-white p-[1px]">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center overflow-hidden">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt={username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-xs font-bold">{username.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm text-gray-900">{username}</span>
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
            </div>
            <span className="text-xs text-gray-500">Sponsored</span>
          </div>
        </div>
        <button className="text-gray-500">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </button>
      </div>

      {/* Image */}
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative">
        {imageUrl ? (
          <AdMedia url={imageUrl} kind={mediaKind} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </div>
        )}
      </div>

      {/* CTA Bar */}
      <div className="px-3 py-2 bg-white border-t border-gray-100 flex items-center justify-between">
        <div className="text-sm">
          <p className="text-gray-500">{website}</p>
        </div>
        <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-1.5 rounded">
          {ctaText}
        </button>
      </div>

      {/* Actions */}
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="text-gray-900 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>
          <button className="text-gray-900 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </button>
          <button className="text-gray-900 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </div>
        <button className="text-gray-900 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
          </svg>
        </button>
      </div>

      {/* Caption — Instagram cuts at ~125 chars with "… more" */}
      <div className="px-3 pb-3">
        {(() => {
          const cap = caption || 'Your caption here...';
          const cut = cap.length > 125;
          return (
            <p className="text-sm">
              <span className="font-semibold">{username}</span>{' '}
              <span className="text-gray-800 whitespace-pre-wrap">{cut ? cap.slice(0, 125).trimEnd() : cap}</span>
              {cut && <span className="text-gray-400"> … more</span>}
            </p>
          );
        })()}
      </div>
    </div>
  );
}
