'use client';

interface GoogleSearchAdProps {
  headlines: string[];
  descriptions: string[];
  displayUrl: string;
  finalUrl: string;
  sitelinks?: { title: string; description: string }[];
}

export default function GoogleSearchAd({
  headlines,
  descriptions,
  displayUrl,
  finalUrl,
  sitelinks = [],
}: GoogleSearchAdProps) {
  const displayDomain = displayUrl || 'example.com';

  return (
    <div className="bg-white rounded-lg p-4 max-w-[600px] font-sans">
      {/* Sponsored Label */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs text-gray-600 font-medium">Sponsored</span>
      </div>

      {/* URL Line */}
      <div className="flex items-center gap-1 mb-1">
        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
          {displayDomain.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-gray-800">{displayDomain}</span>
          <span className="text-xs text-gray-500">{finalUrl || `https://${displayDomain}`}</span>
        </div>
      </div>

      {/* Headlines */}
      <h3 className="text-xl text-[#1a0dab] hover:underline cursor-pointer leading-tight mb-1">
        {headlines.filter(h => h).slice(0, 3).join(' | ')}
      </h3>

      {/* Descriptions */}
      <p className="text-sm text-gray-600 leading-relaxed">
        {descriptions.filter(d => d).slice(0, 2).join(' ')}
      </p>

      {/* Sitelinks */}
      {sitelinks.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {sitelinks.slice(0, 4).map((link, i) => (
            <div key={i} className="text-sm">
              <span className="text-[#1a0dab] hover:underline cursor-pointer">{link.title}</span>
              {link.description && (
                <p className="text-xs text-gray-500">{link.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
