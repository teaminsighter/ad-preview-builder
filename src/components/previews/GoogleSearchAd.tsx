'use client';

interface Sitelink {
  title: string;
  description1?: string;
  description2?: string;
  url?: string;
}

interface PriceItem {
  header: string;
  description: string;
  price: string;
  unit: string;
}

interface PromotionAsset {
  occasion: string;
  promotionType: 'monetary' | 'percentage' | 'none';
  promotionValue: string;
  item: string;
  finalUrl?: string;
}

interface GoogleSearchAdProps {
  headlines: string[];
  descriptions: string[];
  displayUrl: string;
  path1?: string;
  path2?: string;
  businessName?: string;
  businessLogoUrl?: string;
  sitelinks?: Sitelink[];
  callouts?: string[];
  structuredSnippets?: {
    header: string;
    values: string[];
  };
  phoneNumber?: string;
  priceAssets?: PriceItem[];
  promotion?: PromotionAsset;
  imageUrls?: string[];
}

export default function GoogleSearchAd({
  headlines,
  descriptions,
  displayUrl,
  path1 = '',
  path2 = '',
  businessName = '',
  businessLogoUrl,
  sitelinks = [],
  callouts = [],
  structuredSnippets,
  phoneNumber,
  priceAssets = [],
  promotion,
  imageUrls = [],
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

  // Filter active sitelinks
  const activeSitelinks = sitelinks.filter(s => s.title && s.title.trim()).slice(0, 4);

  // Filter active callouts
  const activeCallouts = callouts.filter(c => c && c.trim()).slice(0, 4);

  // Check if structured snippets have content
  const hasStructuredSnippets = structuredSnippets?.header &&
    structuredSnippets.values.some(v => v && v.trim());

  // Filter active price items
  const activePriceItems = priceAssets.filter(p => p.header && p.header.trim()).slice(0, 8);

  // Check promotion
  const hasPromotion = promotion?.item && promotion.promotionType !== 'none';

  // First image
  const primaryImage = imageUrls.find(url => url && url.trim());

  return (
    <div className="w-full max-w-[650px] font-['Google_Sans',_'Roboto',_Arial,_sans-serif]">
      {/* Google Search Results Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Search Result Card */}
        <div className="p-4">
          {/* Sponsored Badge */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-medium text-gray-600 bg-white border border-gray-300 rounded px-1.5 py-0.5">
              Sponsored
            </span>
          </div>

          {/* Main Ad Content with optional image */}
          <div className="flex gap-4">
            {/* Left Content */}
            <div className="flex-1 min-w-0">
              {/* Favicon + Site Info */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {businessLogoUrl ? (
                    <img src={businessLogoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm text-gray-800 truncate font-medium">
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

              {/* Phone Number (Call Asset) */}
              {phoneNumber && (
                <div className="flex items-center gap-1 text-sm text-[#1a0dab] mb-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                  <span className="hover:underline cursor-pointer">{phoneNumber}</span>
                </div>
              )}

              {/* Description */}
              <p className="text-sm text-[#4d5156] leading-relaxed">
                {descriptionText}
              </p>
            </div>

            {/* Image Asset (if present) */}
            {primaryImage && (
              <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <img src={primaryImage} alt="" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Promotion Asset */}
          {hasPromotion && (
            <div className="mt-2 inline-flex items-center gap-1.5 text-sm text-[#1a0dab] bg-blue-50 px-2 py-1 rounded">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
              </svg>
              <span>
                {promotion?.promotionType === 'percentage'
                  ? `${promotion.promotionValue}% off`
                  : promotion?.promotionType === 'monetary'
                    ? `$${promotion.promotionValue} off`
                    : ''
                } {promotion?.item}
                {promotion?.occasion && promotion.occasion !== 'None' && ` - ${promotion.occasion}`}
              </span>
            </div>
          )}

          {/* Callouts */}
          {activeCallouts.length > 0 && (
            <div className="flex flex-wrap gap-x-1 text-sm text-[#4d5156] mt-2">
              {activeCallouts.map((callout, i) => (
                <span key={i} className="flex items-center">
                  {i > 0 && <span className="text-gray-400 mx-1">·</span>}
                  <span>{callout}</span>
                </span>
              ))}
            </div>
          )}

          {/* Structured Snippets */}
          {hasStructuredSnippets && (
            <div className="text-sm text-[#4d5156] mt-2">
              <span className="font-medium">{structuredSnippets.header}: </span>
              <span>{structuredSnippets.values.filter(v => v && v.trim()).join(', ')}</span>
            </div>
          )}

          {/* Price Assets */}
          {activePriceItems.length >= 3 && (
            <div className="mt-3 overflow-x-auto">
              <div className="flex gap-2 pb-1">
                {activePriceItems.map((item, i) => (
                  <div key={i} className="flex-shrink-0 border border-gray-200 rounded-lg p-2 min-w-[120px] hover:border-gray-300 cursor-pointer">
                    <div className="text-[#1a0dab] text-sm font-medium hover:underline">{item.header}</div>
                    <div className="text-[#202124] text-sm font-bold">{item.price}{item.unit && <span className="text-xs font-normal text-gray-500">/{item.unit}</span>}</div>
                    {item.description && <div className="text-xs text-gray-500 truncate">{item.description}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sitelinks */}
          {activeSitelinks.length >= 2 && (
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
              {activeSitelinks.map((link, i) => (
                <div key={i} className="min-w-0">
                  <a href="#" className="text-[#1a0dab] text-sm hover:underline font-medium truncate block">
                    {link.title}
                  </a>
                  {(link.description1 || link.description2) && (
                    <p className="text-xs text-[#4d5156] line-clamp-2">
                      {[link.description1, link.description2].filter(Boolean).join(' ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 mx-4"></div>

        {/* Sample organic result for context */}
        <div className="p-4 opacity-40">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0"></div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Similar result</span>
              <span className="text-xs text-gray-500">https://similar-site.com</span>
            </div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-100 rounded w-full mb-1"></div>
          <div className="h-3 bg-gray-100 rounded w-2/3"></div>
        </div>
      </div>

      {/* Ad Strength Indicator */}
      <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Ad strength</span>
          <span className={`text-sm font-medium ${
            activeHeadlines.length >= 8 && activeDescriptions.length >= 4
              ? 'text-green-600'
              : activeHeadlines.length >= 5 && activeDescriptions.length >= 3
                ? 'text-yellow-600'
                : 'text-red-600'
          }`}>
            {activeHeadlines.length >= 8 && activeDescriptions.length >= 4
              ? 'Excellent'
              : activeHeadlines.length >= 5 && activeDescriptions.length >= 3
                ? 'Good'
                : activeHeadlines.length >= 3 && activeDescriptions.length >= 2
                  ? 'Average'
                  : 'Poor'}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              activeHeadlines.length >= 8 && activeDescriptions.length >= 4
                ? 'bg-green-500 w-full'
                : activeHeadlines.length >= 5 && activeDescriptions.length >= 3
                  ? 'bg-yellow-500 w-3/4'
                  : activeHeadlines.length >= 3 && activeDescriptions.length >= 2
                    ? 'bg-orange-500 w-1/2'
                    : 'bg-red-500 w-1/4'
            }`}
          />
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {activeHeadlines.length}/15 headlines · {activeDescriptions.length}/4 descriptions
          {activeSitelinks.length > 0 && ` · ${activeSitelinks.length} sitelinks`}
          {activeCallouts.length > 0 && ` · ${activeCallouts.length} callouts`}
        </div>
      </div>
    </div>
  );
}
