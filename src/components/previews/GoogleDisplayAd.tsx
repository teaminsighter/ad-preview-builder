'use client';

interface GoogleDisplayAdProps {
  headline: string;
  description: string;
  businessName: string;
  imageUrl?: string;
  logoUrl?: string;
  ctaText?: string;
  size?: 'medium-rectangle' | 'leaderboard' | 'large-rectangle';
}

export default function GoogleDisplayAd({
  headline,
  description,
  businessName,
  imageUrl,
  logoUrl,
  ctaText = 'Learn More',
  size = 'medium-rectangle',
}: GoogleDisplayAdProps) {
  const sizeClasses = {
    'medium-rectangle': 'w-[300px] h-[250px]',
    'leaderboard': 'w-[728px] h-[90px]',
    'large-rectangle': 'w-[336px] h-[280px]',
  };

  const isLeaderboard = size === 'leaderboard';

  return (
    <div
      className={`${sizeClasses[size]} bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200 flex ${isLeaderboard ? 'flex-row' : 'flex-col'}`}
    >
      {/* Image Section */}
      <div className={`${isLeaderboard ? 'w-1/3 h-full' : 'h-1/2 w-full'} bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden`}>
        {imageUrl ? (
          <img src={imageUrl} alt="Ad" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-opacity-50">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </div>
        )}
        <div className="absolute top-1 left-1 bg-white/90 rounded px-1 text-[10px] text-gray-600">Ad</div>
      </div>

      {/* Content Section */}
      <div className={`${isLeaderboard ? 'w-2/3' : 'h-1/2'} p-3 flex flex-col justify-between`}>
        <div>
          {/* Logo and Business Name */}
          <div className="flex items-center gap-2 mb-1">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-5 h-5 rounded-full" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                {businessName.charAt(0)}
              </div>
            )}
            <span className="text-xs text-gray-600">{businessName}</span>
          </div>

          {/* Headline */}
          <h4 className={`font-semibold text-gray-900 leading-tight ${isLeaderboard ? 'text-sm' : 'text-base'} line-clamp-2`}>
            {headline || 'Your Headline Here'}
          </h4>

          {/* Description */}
          {!isLeaderboard && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              {description || 'Your description here'}
            </p>
          )}
        </div>

        {/* CTA Button */}
        <button className={`bg-blue-600 hover:bg-blue-700 text-white rounded ${isLeaderboard ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm'} font-medium w-fit`}>
          {ctaText}
        </button>
      </div>
    </div>
  );
}
