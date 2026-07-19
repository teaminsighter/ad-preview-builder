'use client';

interface YouTubeInStreamAdProps {
  headline: string;
  description: string;
  displayUrl: string;
  ctaText?: string;
  thumbnailUrl?: string;
  videoTitle?: string;
}

export default function YouTubeInStreamAd({
  headline,
  description,
  displayUrl,
  ctaText = 'Learn More',
  thumbnailUrl,
  videoTitle = 'Video Title Here',
}: YouTubeInStreamAdProps) {
  return (
    <div className="w-[480px] bg-black rounded-lg overflow-hidden shadow-xl font-sans">
      {/* Video Area */}
      <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt="Video" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white/50">
              <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <p className="text-sm">Video Preview</p>
            </div>
          </div>
        )}

        {/* Ad Badge */}
        <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded">
          Ad
        </div>

        {/* Skip Button */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-sm px-3 py-1 rounded flex items-center gap-2">
          <span>Skip Ads</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
          </svg>
        </div>

        {/* Video Progress */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
          <div className="h-full w-1/4 bg-yellow-500"></div>
        </div>
      </div>

      {/* Ad Info Panel */}
      <div className="bg-[#212121] p-3">
        <div className="flex gap-3">
          {/* Thumbnail */}
          <div className="w-24 h-14 bg-gray-700 rounded overflow-hidden flex-shrink-0">
            {thumbnailUrl ? (
              <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
              </div>
            )}
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white text-sm font-medium line-clamp-1">
              {headline || 'Your Headline Here'}
            </h3>
            <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">
              {description || 'Your description here'}
            </p>
            <p className="text-gray-500 text-xs mt-1">
              {displayUrl || 'example.com'}
            </p>
          </div>

          {/* CTA Button */}
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded self-center flex-shrink-0">
            {ctaText}
          </button>
        </div>
      </div>

      {/* Video Title Bar */}
      <div className="bg-[#181818] px-3 py-2 border-t border-gray-800">
        <p className="text-white text-sm font-medium line-clamp-1">{videoTitle}</p>
        <p className="text-gray-400 text-xs">1.2M views • 2 days ago</p>
      </div>
    </div>
  );
}
