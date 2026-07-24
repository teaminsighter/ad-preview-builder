'use client';

interface BingSearchAdProps {
  headlines: string[];
  descriptions: string[];
  displayUrl: string;
  path1?: string;
  path2?: string;
  businessName?: string;
}

// Bing SERP responsive search ad — modern Bing style: favicon row with
// site name + URL, "Ad" chip, blue headline, grey description.
export default function BingSearchAd({
  headlines,
  descriptions,
  displayUrl,
  path1,
  path2,
  businessName,
}: BingSearchAdProps) {
  const activeHeadlines = headlines.filter(h => h.trim()).slice(0, 3);
  const activeDescriptions = descriptions.filter(d => d.trim()).slice(0, 2);
  const shownUrl = `${displayUrl || 'www.example.com'}${path1 ? `/${path1}` : ''}${path2 ? `/${path2}` : ''}`;
  const title = activeHeadlines.length ? activeHeadlines.join(' - ') : 'Your Headline 1 - Your Headline 2';

  return (
    <div className="bg-white rounded-lg shadow-md w-[600px] max-w-full p-5 font-sans">
      {/* Bing search bar hint */}
      <div className="flex items-center gap-2 pb-4 mb-4 border-b border-gray-100">
        <svg className="w-6 h-6" viewBox="0 0 24 24">
          <path fill="#008373" d="M5 3v14.5L9.5 21l9.5-5.5v-4L9.5 15V7.5L7 6.5V3H5z"/>
          <path fill="#00A88E" d="M9.5 8.5l5.5 2-2 1.2 6 2.8L9.5 21v-6l4-2.3-4-1.7v-2.5z"/>
        </svg>
        <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-500">
          {activeHeadlines[0] || 'your search term'}
        </div>
      </div>

      {/* Ad result */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
            {(businessName || displayUrl || 'A').replace(/^www\./, '').charAt(0).toUpperCase()}
          </div>
          <div className="leading-tight">
            <p className="text-xs text-gray-800">{businessName || (displayUrl || 'example.com').replace(/^www\./, '')}</p>
            <p className="text-xs text-gray-500">{shownUrl}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-gray-600 border border-gray-300 rounded px-1 leading-4">Ad</span>
          <h3 className="text-xl text-[#1a0dab] hover:underline cursor-pointer truncate">{title}</h3>
        </div>
        <p className="text-sm text-gray-600 mt-1 leading-snug">
          {activeDescriptions.length
            ? activeDescriptions.join(' ')
            : 'Your description will appear here. Microsoft Advertising combines your best-performing descriptions.'}
        </p>
      </div>
    </div>
  );
}
