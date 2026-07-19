'use client';

interface DiscoverAdProps {
  headline: string;
  description: string;
  imageUrl?: string;
  logoUrl?: string;
  businessName: string;
}

export default function DiscoverAd({
  headline,
  description,
  imageUrl,
  logoUrl,
  businessName,
}: DiscoverAdProps) {
  return (
    <div className="w-[360px] bg-white rounded-xl shadow-lg overflow-hidden font-sans">
      {/* Google Discover Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="text-lg font-medium text-gray-800">Discover</span>
        </div>
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
            A
          </div>
        </div>
      </div>

      {/* Ad Card */}
      <div className="m-4 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Ad Badge */}
        <div className="px-3 py-2 flex items-center gap-2 bg-gray-50">
          <div className="w-6 h-6 rounded-full bg-blue-600 overflow-hidden flex items-center justify-center flex-shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt={businessName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-xs font-bold">
                {businessName?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            )}
          </div>
          <span className="text-sm text-gray-700 font-medium">{businessName || 'Advertiser'}</span>
          <span className="text-xs text-gray-500">· Sponsored</span>
        </div>

        {/* Image */}
        <div className="aspect-[1.91/1] bg-gradient-to-br from-blue-400 to-purple-500 relative">
          {imageUrl ? (
            <img src={imageUrl} alt="Ad" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="font-semibold text-gray-900 text-base line-clamp-2 mb-1">
            {headline || 'Your Headline Here'}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {description || 'Your description here. This text will appear below the headline.'}
          </p>
        </div>
      </div>

      {/* Regular Article Cards */}
      <div className="px-4 pb-4 space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-3 p-2 rounded-lg hover:bg-gray-50">
            <div className="w-24 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800 line-clamp-2">Regular article headline that appears in Discover feed</p>
              <p className="text-xs text-gray-500 mt-1">Source · 2h ago</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
