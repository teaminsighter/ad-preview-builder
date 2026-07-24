'use client';

import AdMedia from './AdMedia';

interface InstagramReelsAdProps {
  username: string;
  profileImageUrl?: string;
  imageUrl?: string;
  mediaKind?: 'image' | 'video';
  caption: string;
  ctaText?: string;
  musicName?: string;
}

export default function InstagramReelsAd({
  username,
  profileImageUrl,
  imageUrl,
  mediaKind,
  caption,
  ctaText = 'Shop Now',
  musicName = 'Original Audio',
}: InstagramReelsAdProps) {
  return (
    <div className="w-[270px] h-[480px] bg-black rounded-2xl overflow-hidden relative font-sans shadow-xl">
      {/* Background */}
      <div className="absolute inset-0">
        {imageUrl ? (
          <AdMedia url={imageUrl} kind={mediaKind} alt="Reel" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-500 via-purple-600 to-blue-600 flex items-center justify-center">
            <svg className="w-20 h-20 text-white/30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
            </svg>
          </div>
        )}
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent"></div>

      {/* Sponsored Badge */}
      <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded">
        Sponsored
      </div>

      {/* Right Side Actions */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5">
        <button className="flex flex-col items-center text-white drop-shadow-lg">
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span className="text-xs mt-1">24.5K</span>
        </button>
        <button className="flex flex-col items-center text-white drop-shadow-lg">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <span className="text-xs mt-1">892</span>
        </button>
        <button className="flex flex-col items-center text-white drop-shadow-lg">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
          <span className="text-xs mt-1">Share</span>
        </button>
        <button className="flex flex-col items-center text-white drop-shadow-lg">
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </button>

        {/* Music Disc */}
        <div className="w-8 h-8 rounded-lg border-2 border-white overflow-hidden animate-spin" style={{ animationDuration: '3s' }}>
          {profileImageUrl ? (
            <img src={profileImageUrl} alt="Music" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-pink-500 to-purple-600"></div>
          )}
        </div>
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-14 p-4">
        {/* Username and Follow */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-black p-[1px]">
              <div className="w-full h-full rounded-full overflow-hidden">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt={username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold">
                    {username?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                )}
              </div>
            </div>
          </div>
          <span className="text-white font-semibold text-sm">{username || 'username'}</span>
          <button className="border border-white text-white text-xs px-2 py-0.5 rounded font-medium">
            Follow
          </button>
        </div>

        {/* Caption */}
        <p className="text-white text-sm mb-2 line-clamp-2 drop-shadow">
          {caption || 'Your caption here... #ad #sponsored'}
        </p>

        {/* Music */}
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
          <span className="text-white text-xs">{musicName}</span>
        </div>

        {/* CTA Button */}
        <button className="w-full bg-white text-black font-semibold py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors">
          {ctaText}
        </button>
      </div>

      {/* Reels Icon */}
      <div className="absolute top-3 right-3">
        <svg className="w-6 h-6 text-white drop-shadow" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
        </svg>
      </div>
    </div>
  );
}
