'use client';

import AdMedia from './AdMedia';

interface CarouselCard {
  url: string;
  kind?: 'image' | 'video';
}

interface MetaFeedAdProps {
  pageName: string;
  pageImageUrl?: string;
  primaryText: string;
  headline: string;
  description: string;
  imageUrl?: string;
  mediaKind?: 'image' | 'video';
  carouselCards?: CarouselCard[];
  ctaText?: string;
  linkDisplay?: string;
}

export default function MetaFeedAd({
  pageName,
  pageImageUrl,
  primaryText,
  headline,
  description,
  imageUrl,
  mediaKind,
  carouselCards,
  ctaText = 'Learn More',
  linkDisplay = 'example.com',
}: MetaFeedAdProps) {
  const isCarousel = carouselCards && carouselCards.length >= 2;

  return (
    <div className="bg-white rounded-lg shadow-md max-w-[500px] w-[380px] font-sans">
      {/* Header */}
      <div className="p-3 flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center overflow-hidden">
          {pageImageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={pageImageUrl} alt={pageName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-bold">{(pageName || 'P').charAt(0)}</span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-900 text-sm">{pageName || 'Page Name'}</span>
            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>Sponsored</span>
            <span>·</span>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </button>
      </div>

      {/* Primary Text */}
      <div className="px-3 pb-2">
        <p className="text-sm text-gray-800 whitespace-pre-wrap">
          {primaryText || 'Your primary text here. This is where you write your main message to engage your audience.'}
        </p>
      </div>

      {isCarousel ? (
        /* Carousel cards (2–10, each with its own link band) */
        <div className="flex gap-2 overflow-x-auto px-3 pb-1">
          {carouselCards!.map((card, i) => (
            <div key={i} className="flex-shrink-0 w-[240px] border border-gray-200 rounded-lg overflow-hidden">
              <div className="aspect-square bg-gray-100">
                <AdMedia url={card.url} kind={card.kind} alt={`Card ${i + 1}`} />
              </div>
              <div className="px-2 py-2 bg-gray-50 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-xs truncate">{headline || 'Your Headline Here'}</p>
                  <p className="text-[11px] text-gray-500 truncate">{linkDisplay || 'example.com'}</p>
                </div>
                <button className="flex-shrink-0 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-2.5 rounded text-xs">
                  {ctaText}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Media — Meta recommends 4:5 for feed */}
          <div className="aspect-[4/5] bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
            {imageUrl ? (
              <AdMedia url={imageUrl} kind={mediaKind} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
              </div>
            )}
          </div>

          {/* Link band — display link, headline, description with CTA on the right */}
          <div className="px-3 py-2.5 bg-gray-100 border-t border-gray-200 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-gray-500 uppercase truncate">{linkDisplay || 'example.com'}</p>
              <p className="font-semibold text-gray-900 text-sm line-clamp-1">{headline || 'Your Headline Here'}</p>
              {description && <p className="text-sm text-gray-500 line-clamp-1">{description}</p>}
            </div>
            <button className="flex-shrink-0 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1.5 px-3 rounded text-sm">
              {ctaText}
            </button>
          </div>
        </>
      )}

      {/* Engagement */}
      <div className="px-3 py-2 border-t border-gray-200 flex items-center justify-between text-gray-500 text-sm">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 hover:text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
            </svg>
            Like
          </button>
          <button className="flex items-center gap-1 hover:text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            Comment
          </button>
        </div>
        <button className="flex items-center gap-1 hover:text-blue-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
          </svg>
          Share
        </button>
      </div>
    </div>
  );
}
