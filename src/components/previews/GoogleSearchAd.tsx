'use client';

interface GoogleSearchAdProps {
  headlines: string[];
  descriptions: string[];
  displayUrl: string;
  path1?: string;
  path2?: string;
  businessName?: string;
  sitelinks?: { title: string; description?: string; url?: string }[];
  callouts?: string[];
}

export default function GoogleSearchAd({
  headlines,
  descriptions,
  displayUrl,
  path1 = '',
  path2 = '',
  businessName = '',
  sitelinks = [],
  callouts = [],
}: GoogleSearchAdProps) {
  const displayDomain = displayUrl || 'example.com';
  const cleanDomain = displayDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');

  // Build display URL with paths
  const buildDisplayUrl = () => {
    let url = cleanDomain;
    if (path1) url += ` › ${path1}`;
    if (path2) url += ` › ${path2}`;
    return url;
  };

  // Combine headlines (show first 3 that have content, joined by |)
  const activeHeadlines = headlines.filter(h => h && h.trim()).slice(0, 3);
  const headlineText = activeHeadlines.length > 0
    ? activeHeadlines.join(' | ')
    : 'Your Headline Here';

  // Combine descriptions
  const activeDescriptions = descriptions.filter(d => d && d.trim()).slice(0, 2);
  const descriptionText = activeDescriptions.length > 0
    ? activeDescriptions.join(' ')
    : 'Your description will appear here. Add compelling copy to attract customers.';

  return (
    <div className="w-full max-w-[600px] font-['Google_Sans',_'Roboto',_Arial,_sans-serif]">
      {/* Google Search Results Container */}
      <div className="bg-white">
        {/* Search Result Card */}
        <div className="p-4 hover:bg-gray-50 rounded-lg transition-colors">
          {/* Sponsored Badge + URL Line */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-medium text-gray-600 bg-white border border-gray-300 rounded px-1.5 py-0.5">
              Sponsored
            </span>
          </div>

          {/* Favicon + Site Info */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm text-gray-800 truncate">
                {businessName || cleanDomain}
              </span>
              <span className="text-xs text-gray-600 truncate">
                {buildDisplayUrl()}
              </span>
            </div>
            <button className="ml-auto text-gray-400 hover:text-gray-600 flex-shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
          </div>

          {/* Ad Headline */}
          <h3 className="text-xl text-[#1a0dab] hover:underline cursor-pointer leading-snug mb-1 font-normal">
            {headlineText}
          </h3>

          {/* Description */}
          <p className="text-sm text-[#4d5156] leading-relaxed mb-2">
            {descriptionText}
          </p>

          {/* Callouts */}
          {callouts.length > 0 && callouts.some(c => c && c.trim()) && (
            <div className="flex flex-wrap gap-x-3 text-sm text-[#4d5156] mb-2">
              {callouts.filter(c => c && c.trim()).slice(0, 4).map((callout, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="text-gray-400">·</span>
                  <span>{callout}</span>
                </span>
              ))}
            </div>
          )}

          {/* Sitelinks */}
          {sitelinks.length > 0 && sitelinks.some(s => s.title && s.title.trim()) && (
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
              {sitelinks.filter(s => s.title && s.title.trim()).slice(0, 4).map((link, i) => (
                <div key={i} className="min-w-0">
                  <a href="#" className="text-[#1a0dab] text-sm hover:underline truncate block">
                    {link.title}
                  </a>
                  {link.description && (
                    <p className="text-xs text-[#4d5156] truncate">{link.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider showing more results */}
        <div className="border-t border-gray-100 mx-4"></div>

        {/* Sample organic result for context */}
        <div className="p-4 opacity-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0"></div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Similar site</span>
              <span className="text-xs text-gray-500">https://similar-site.com</span>
            </div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-100 rounded w-full mb-1"></div>
          <div className="h-3 bg-gray-100 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
}
