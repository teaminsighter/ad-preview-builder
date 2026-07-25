'use client';

import AdMedia from './AdMedia';

interface FacebookInStreamReelsAdProps {
  pageName: string;
  pageImageUrl?: string;
  primaryText: string;
  linkDisplay?: string;
  imageUrl?: string;
  mediaKind?: 'image' | 'video';
}

// "Facebook in-stream reels" placement — the ad video plays inside a reel
// with a link chip underneath, surrounded by skeleton feed content, matching
// Ads Manager's preview of the same name.
export default function FacebookInStreamReelsAd({
  pageName,
  pageImageUrl,
  primaryText,
  linkDisplay = 'example.com',
  imageUrl,
  mediaKind,
}: FacebookInStreamReelsAdProps) {
  return (
    <div className="w-[300px] bg-white rounded-lg shadow-md font-sans overflow-hidden">
      {/* Skeleton header */}
      <div className="p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-2.5 bg-gray-200 rounded w-2/3" />
          <div className="h-2 bg-gray-200 rounded w-1/3" />
        </div>
        <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </div>

      {/* Ad media */}
      <div className="aspect-[4/5] bg-gray-100 relative">
        {imageUrl ? (
          <AdMedia url={imageUrl} kind={mediaKind} alt="Ad" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
        )}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-black/40 border-2 border-white flex items-center justify-center">
            <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Link chip */}
      <div className="m-3 p-2.5 bg-gray-100 rounded-xl flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
          {pageImageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={pageImageUrl} alt={pageName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-xs font-bold">{(pageName || 'P').charAt(0)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-gray-500 uppercase truncate">{linkDisplay}</p>
          <p className="text-[13px] font-semibold text-gray-900 truncate">{pageName || 'Page Name'}</p>
          <p className="text-xs text-gray-500 truncate">{primaryText || 'Your primary text here'}</p>
        </div>
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </div>

      {/* Skeleton rows below */}
      <div className="px-3 pb-3 space-y-2">
        <div className="h-2 bg-gray-200 rounded w-full" />
        <div className="h-2 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  );
}
