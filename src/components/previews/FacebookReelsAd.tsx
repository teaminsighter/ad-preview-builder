'use client';

import AdMedia from './AdMedia';

interface FacebookReelsAdProps {
  pageName: string;
  pageImageUrl?: string;
  imageUrl?: string;
  mediaKind?: 'image' | 'video';
  primaryText: string;
  ctaText?: string;
}

// Facebook Reels placement — full-bleed 9:16 video with the FB action rail
// (like/comment/share) on the right and page + primary text + CTA overlaid
// at the bottom, matching Ads Manager's "Facebook Reels" preview.
export default function FacebookReelsAd({
  pageName,
  pageImageUrl,
  imageUrl,
  mediaKind,
  primaryText,
  ctaText = 'Learn more',
}: FacebookReelsAdProps) {
  return (
    <div className="w-[270px] h-[480px] bg-black rounded-2xl overflow-hidden relative font-sans shadow-xl">
      {/* Background media */}
      <div className="absolute inset-0">
        {imageUrl ? (
          <AdMedia url={imageUrl} kind={mediaKind} alt="Reel" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
            <svg className="w-16 h-16 text-white/20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      {/* Right action rail */}
      <div className="absolute right-2.5 bottom-24 flex flex-col items-center gap-4 text-white">
        <svg className="w-6 h-6 drop-shadow" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        <svg className="w-6 h-6 drop-shadow" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <svg className="w-6 h-6 drop-shadow" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <svg className="w-6 h-6 drop-shadow" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </div>

      {/* Bottom overlay: page, primary text, CTA */}
      <div className="absolute bottom-0 left-0 right-11 p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
            {pageImageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={pageImageUrl} alt={pageName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-xs font-bold">{(pageName || 'P').charAt(0)}</span>
            )}
          </div>
          <span className="text-white font-semibold text-[13px] truncate drop-shadow">{pageName || 'Page Name'}</span>
          <svg className="w-3 h-3 text-white/80 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
        </div>
        <p className="text-white text-xs mb-2 drop-shadow">
          <span className="line-clamp-1">{primaryText || 'Your primary text here'}</span>
        </p>
        <button className="w-full bg-[#1877F2] text-white font-semibold py-2 rounded-md text-[13px]">
          {ctaText}
        </button>
        <span className="text-white/80 text-[10px] mt-1.5 inline-block drop-shadow">Ad</span>
      </div>
    </div>
  );
}
