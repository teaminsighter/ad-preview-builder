'use client';

import AdMedia from './AdMedia';

interface AdsOnFacebookReelsAdProps {
  pageName: string;
  primaryText: string;
  imageUrl?: string;
  mediaKind?: 'image' | 'video';
}

// "Ads on Facebook Reels" placement — the ad appears as a banner beneath
// someone else's reel (shown as a grey skeleton), matching Ads Manager's
// preview of the same name.
export default function AdsOnFacebookReelsAd({ pageName, primaryText, imageUrl, mediaKind }: AdsOnFacebookReelsAdProps) {
  return (
    <div className="w-[300px] bg-white rounded-lg shadow-md font-sans overflow-hidden">
      {/* Skeleton header of the organic reel */}
      <div className="p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-2.5 bg-gray-200 rounded w-3/4" />
          <div className="h-2 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="h-2.5 bg-gray-200 rounded w-2/3 mx-3 mb-3" />

      {/* Grey reel area with play button */}
      <div className="h-[280px] bg-gray-300 flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-gray-600/60 flex items-center justify-center">
          <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {/* The ad banner under the reel */}
      <div className="p-3 flex gap-3 items-start">
        <div className="w-16 h-24 rounded-md overflow-hidden bg-gray-100 relative flex-shrink-0">
          {imageUrl ? (
            <AdMedia url={imageUrl} kind={mediaKind} alt="Ad" />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-5 h-5 text-white drop-shadow" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-gray-900 leading-snug line-clamp-4">
            {primaryText || 'Your primary text here'}
          </p>
          <p className="text-xs text-gray-500 mt-1 truncate">{pageName || 'Page Name'} · Ad</p>
        </div>
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    </div>
  );
}
