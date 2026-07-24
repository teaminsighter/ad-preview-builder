'use client';

interface BingAudienceAdProps {
  imageUrl?: string;
  shortHeadline: string;
  longHeadline: string;
  adText: string;
  businessName: string;
}

// Microsoft Audience Network native ad — the card style used across
// MSN, Outlook.com and Edge new-tab feeds.
export default function BingAudienceAd({
  imageUrl,
  shortHeadline,
  longHeadline,
  adText,
  businessName,
}: BingAudienceAdProps) {
  return (
    <div className="bg-white rounded-lg shadow-md w-[360px] max-w-full overflow-hidden font-sans border border-gray-200">
      {/* Image — MSAN primary asset is 1.91:1 */}
      <div className="aspect-[1.91/1] bg-gradient-to-br from-gray-200 to-gray-300">
        {imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={imageUrl} alt="Ad" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-base font-semibold text-gray-900 leading-snug line-clamp-2">
          {longHeadline || shortHeadline || 'Your long headline appears here'}
        </h3>
        {adText && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{adText}</p>}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-gray-500 border border-gray-300 rounded px-1 leading-4">Ad</span>
            <span className="text-xs text-gray-500">{businessName || 'Your business'}</span>
          </div>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
