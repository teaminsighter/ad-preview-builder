'use client';

interface YouTubeShortsAdProps {
  username: string;
  description: string;
  ctaText?: string;
  imageUrl?: string;
  profileImageUrl?: string;
}

export default function YouTubeShortsAd({
  username,
  description,
  ctaText = 'Visit',
  imageUrl,
  profileImageUrl,
}: YouTubeShortsAdProps) {
  return (
    <div className="w-[270px] h-[480px] bg-black rounded-2xl overflow-hidden relative font-sans shadow-xl">
      {/* Background */}
      <div className="absolute inset-0">
        {imageUrl ? (
          <img src={imageUrl} alt="Short" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-600 via-pink-600 to-purple-700 flex items-center justify-center">
            <svg className="w-20 h-20 text-white/30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/>
            </svg>
          </div>
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>

      {/* Ad Badge */}
      <div className="absolute top-3 left-3 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded">
        Ad
      </div>

      {/* Shorts Logo */}
      <div className="absolute top-3 right-3 flex items-center gap-1">
        <div className="bg-red-600 rounded-full p-1">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/>
          </svg>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5">
        <button className="flex flex-col items-center text-white">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <span className="text-xs mt-1">123K</span>
        </button>
        <button className="flex flex-col items-center text-white">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/>
            </svg>
          </div>
          <span className="text-xs mt-1">456</span>
        </button>
        <button className="flex flex-col items-center text-white">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <span className="text-xs mt-1">Share</span>
        </button>
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-12 p-4">
        {/* Profile */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-full bg-gray-600 overflow-hidden">
            {profileImageUrl ? (
              <img src={profileImageUrl} alt={username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold">
                {username?.charAt(0)?.toUpperCase() || 'A'}
              </div>
            )}
          </div>
          <div>
            <p className="text-white font-medium text-sm">@{username || 'username'}</p>
            <p className="text-gray-300 text-xs">Sponsored</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-white text-sm mb-3 line-clamp-2">
          {description || 'Your ad description here...'}
        </p>

        {/* CTA Button */}
        <button className="w-full bg-white text-black font-semibold py-2.5 rounded-full text-sm hover:bg-gray-100 transition-colors">
          {ctaText}
        </button>
      </div>
    </div>
  );
}
