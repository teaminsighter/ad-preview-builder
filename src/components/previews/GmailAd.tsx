'use client';

interface GmailAdProps {
  senderName: string;
  subject: string;
  previewText: string;
  logoUrl?: string;
}

export default function GmailAd({
  senderName,
  subject,
  previewText,
  logoUrl,
}: GmailAdProps) {
  return (
    <div className="w-[600px] bg-white rounded-lg shadow-lg overflow-hidden font-sans border border-gray-200">
      {/* Gmail Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <svg className="w-8 h-8" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6z"/>
            <path fill="#EA4335" d="M22 6l-10 7L2 6"/>
            <path fill="#FBBC05" d="M2 6v12h3.5L12 13l6.5 5H22V6"/>
            <path fill="#34A853" d="M22 18l-6.5-5L22 6"/>
            <path fill="#C5221F" d="M2 18l6.5-5L2 6"/>
          </svg>
          <span className="text-xl text-gray-700">Gmail</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200"></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 flex">
        <div className="px-6 py-3 border-b-2 border-blue-600 text-blue-600 font-medium text-sm flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
          Primary
        </div>
        <div className="px-6 py-3 text-gray-600 text-sm flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          Promotions
        </div>
        <div className="px-6 py-3 text-gray-600 text-sm flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
          </svg>
          Social
        </div>
      </div>

      {/* Ad Email Row */}
      <div className="bg-[#fef7e0] hover:shadow-md transition-shadow cursor-pointer">
        <div className="px-4 py-3 flex items-center gap-3">
          {/* Checkbox and Star */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
          </div>

          {/* Logo */}
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden flex-shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt={senderName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-sm">
                {senderName?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            )}
          </div>

          {/* Ad Badge */}
          <span className="bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            Ad
          </span>

          {/* Content */}
          <div className="flex-1 min-w-0 flex items-center">
            <span className="font-semibold text-gray-900 text-sm flex-shrink-0 w-40 truncate">
              {senderName || 'Advertiser Name'}
            </span>
            <div className="flex-1 min-w-0 ml-2">
              <span className="text-gray-900 text-sm font-medium">
                {subject || 'Email Subject Line'}
              </span>
              <span className="text-gray-600 text-sm">
                {' - '}{previewText || 'Preview text appears here...'}
              </span>
            </div>
          </div>

          {/* Time */}
          <span className="text-gray-600 text-xs flex-shrink-0">
            12:30 PM
          </span>
        </div>
      </div>

      {/* Regular Email Rows */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white hover:shadow-sm transition-shadow border-b border-gray-100">
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
              </svg>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
            <div className="flex-1 min-w-0 flex items-center">
              <span className="font-semibold text-gray-900 text-sm w-40 truncate">Regular Sender</span>
              <span className="text-gray-600 text-sm ml-2 truncate">Regular email subject - with preview text...</span>
            </div>
            <span className="text-gray-500 text-xs">Yesterday</span>
          </div>
        </div>
      ))}
    </div>
  );
}
