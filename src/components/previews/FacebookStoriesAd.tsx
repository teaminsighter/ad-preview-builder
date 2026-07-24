'use client';

import AdMedia from './AdMedia';

interface FacebookStoriesAdProps {
  pageName: string;
  pageImageUrl?: string;
  imageUrl?: string;
  mediaKind?: 'image' | 'video';
  headline?: string;
  ctaText?: string;
  linkDisplay?: string;
}

export default function FacebookStoriesAd({
  pageName,
  pageImageUrl,
  imageUrl,
  mediaKind,
  headline,
  ctaText = 'Learn More',
  linkDisplay = 'example.com',
}: FacebookStoriesAdProps) {
  return (
    <div className="w-[270px] h-[480px] bg-black rounded-2xl overflow-hidden relative font-sans shadow-xl">
      {/* Background */}
      <div className="absolute inset-0">
        {imageUrl ? (
          <AdMedia url={imageUrl} kind={mediaKind} alt="Story" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 flex items-center justify-center">
            <svg className="w-20 h-20 text-white/30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
            </svg>
          </div>
        )}
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent"></div>

      {/* Progress Bar */}
      <div className="absolute top-2 left-2 right-2 flex gap-1">
        <div className="h-0.5 flex-1 bg-white/30 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-white rounded-full"></div>
        </div>
      </div>

      {/* Header */}
      <div className="absolute top-5 left-0 right-0 px-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden border-2 border-blue-500">
            {pageImageUrl ? (
              <img src={pageImageUrl} alt={pageName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-sm">
                {pageName?.charAt(0)?.toUpperCase() || 'P'}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-white font-semibold text-sm drop-shadow">{pageName || 'Page Name'}</span>
              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
            </div>
            <span className="text-white/70 text-xs">Sponsored</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-white">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
            </svg>
          </button>
          <button className="text-white">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
          <button className="text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {/* Headline if provided */}
        {headline && (
          <p className="text-white text-lg font-semibold mb-3 text-center drop-shadow-lg">
            {headline}
          </p>
        )}

        {/* Swipe Up Indicator */}
        <div className="flex flex-col items-center gap-1 mb-3">
          <svg className="w-6 h-6 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"/>
          </svg>
          <span className="text-white/80 text-xs">{linkDisplay}</span>
        </div>

        {/* CTA Button */}
        <button className="w-full bg-white text-gray-900 font-semibold py-2.5 rounded-full text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
          {ctaText}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
          </svg>
        </button>

        {/* Reply Bar */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 bg-white/20 rounded-full px-4 py-2">
            <span className="text-white/60 text-sm">Reply to {pageName}...</span>
          </div>
          <button className="text-white">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
          <button className="text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Facebook Logo */}
      <div className="absolute bottom-24 right-3">
        <svg className="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
        </svg>
      </div>
    </div>
  );
}
