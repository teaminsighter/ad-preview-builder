'use client';

interface TikTokFeedAdProps {
  username: string;
  caption: string;
  imageUrl: string;
  ctaText: string;
  profileImageUrl?: string;
  musicName?: string;
}

export default function TikTokFeedAd({
  username,
  caption,
  imageUrl,
  ctaText,
  profileImageUrl,
  musicName = 'Original Sound',
}: TikTokFeedAdProps) {
  return (
    <div className="w-[320px] h-[580px] bg-black rounded-2xl overflow-hidden relative shadow-2xl">
      {/* Video/Image Background */}
      <div className="absolute inset-0">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
            </svg>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Sponsored Badge */}
      <div className="absolute top-4 left-4 z-10">
        <span className="bg-gray-900/70 text-white text-xs px-2 py-1 rounded font-medium backdrop-blur-sm">
          Sponsored
        </span>
      </div>

      {/* Right Side Actions */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 z-10">
        {/* Profile */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-gray-800">
            {profileImageUrl ? (
              <img src={profileImageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold">
                {username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-[#FE2C55] rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 6v12m6-6H6" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Like */}
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <span className="text-white text-xs font-semibold">1.2M</span>
        </div>

        {/* Comment */}
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 6h-2V4c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h2v2c0 1.1.9 2 2 2h12l4 4V8c0-1.1-.9-2-2-2zm-13 2H3V4h14v10H8V8z"/>
            </svg>
          </div>
          <span className="text-white text-xs font-semibold">8.5K</span>
        </div>

        {/* Share */}
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
            </svg>
          </div>
          <span className="text-white text-xs font-semibold">Share</span>
        </div>

        {/* Music disc */}
        <div className="w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-700 animate-spin" style={{ animationDuration: '3s' }}>
          <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-gray-600" />
          </div>
        </div>
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-16 p-4 z-10">
        {/* Username */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-white font-bold text-base">@{username || 'username'}</span>
          <svg className="w-4 h-4 text-[#20D5EC]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
        </div>

        {/* Caption */}
        <p className="text-white text-sm mb-3 line-clamp-2">
          {caption || 'Your ad caption will appear here...'}
        </p>

        {/* Music */}
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
          <span className="text-white text-xs">{musicName}</span>
        </div>

        {/* CTA Button */}
        <button className="w-full bg-[#FE2C55] text-white font-semibold py-2.5 rounded-md text-sm">
          {ctaText || 'Learn More'}
        </button>
      </div>

      {/* TikTok Logo */}
      <div className="absolute top-4 right-4 z-10">
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" fill="#FE2C55"/>
          <path d="M16.37 2v.44a4.83 4.83 0 003.77 4.25 4.85 4.85 0 001 .1V3.4A4.83 4.83 0 0016.37 2z" fill="#25F4EE"/>
          <path d="M9.35 9.35a6.84 6.84 0 011 .05v3.5a2.93 2.93 0 00-.88-.13 2.89 2.89 0 00-2.31 4.64 2.89 2.89 0 005.2-1.74V2h3.45v.44a4.83 4.83 0 01-4.77 4.58 8.16 8.16 0 01-4.77-1.52v7a6.34 6.34 0 01-10.86 4.43A6.33 6.33 0 019.35 9.35z" fill="#25F4EE"/>
        </svg>
      </div>
    </div>
  );
}
