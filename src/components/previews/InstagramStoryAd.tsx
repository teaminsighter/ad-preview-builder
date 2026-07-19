'use client';

interface InstagramStoryAdProps {
  username: string;
  profileImageUrl?: string;
  imageUrl?: string;
  ctaText?: string;
}

export default function InstagramStoryAd({
  username,
  profileImageUrl,
  imageUrl,
  ctaText = 'Learn More',
}: InstagramStoryAdProps) {
  return (
    <div className="w-[270px] h-[480px] bg-black rounded-2xl overflow-hidden relative font-sans shadow-xl">
      {/* Background Image */}
      <div className="absolute inset-0">
        {imageUrl ? (
          <img src={imageUrl} alt="Story" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center">
            <svg className="w-20 h-20 text-white/30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="absolute top-2 left-2 right-2 flex gap-1">
        <div className="h-0.5 flex-1 bg-white/30 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-white rounded-full"></div>
        </div>
      </div>

      {/* Header */}
      <div className="absolute top-4 left-0 right-0 px-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-black p-[1px]">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center overflow-hidden">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt={username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-xs font-bold">{username.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-white text-sm font-semibold drop-shadow">{username}</span>
            <span className="text-white/70 text-xs">Sponsored</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-white">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
          <button className="text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* CTA at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex flex-col items-center gap-2">
          {/* Swipe Up Indicator */}
          <div className="flex flex-col items-center text-white">
            <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"/>
            </svg>
          </div>
          <button className="bg-white text-black font-semibold px-6 py-2 rounded-full text-sm hover:bg-gray-100 transition-colors">
            {ctaText}
          </button>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="absolute bottom-20 right-3 flex flex-col gap-4">
        <button className="text-white drop-shadow">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </button>
        <button className="text-white drop-shadow">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
