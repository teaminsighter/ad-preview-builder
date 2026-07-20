'use client';

interface GoogleShoppingAdProps {
  productTitle: string;
  productPrice: string;
  storeName: string;
  imageUrl?: string;
  rating?: string;
  reviewCount?: string;
  shipping?: string;
}

export default function GoogleShoppingAd({
  productTitle,
  productPrice,
  storeName,
  imageUrl,
  rating,
  reviewCount,
  shipping,
}: GoogleShoppingAdProps) {
  const ratingValue = Math.min(5, Math.max(0, parseFloat(rating || '4.5') || 4.5));

  const renderStars = () => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3 h-3 ${star <= Math.round(ratingValue) ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  return (
    <div className="w-[380px] bg-white rounded-xl shadow-lg overflow-hidden font-sans">
      {/* Google Search Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 shadow-sm">
            <span className="text-sm text-gray-800 truncate">{productTitle || 'your product'}</span>
            <svg className="w-4 h-4 text-blue-500 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
        </div>
        {/* Search tabs */}
        <div className="flex gap-4 mt-3 text-xs">
          <span className="text-gray-500">All</span>
          <span className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">Shopping</span>
          <span className="text-gray-500">Images</span>
          <span className="text-gray-500">Maps</span>
          <span className="text-gray-500">News</span>
        </div>
      </div>

      {/* Sponsored label */}
      <div className="px-4 pt-3">
        <span className="text-xs font-bold text-gray-900">Sponsored</span>
        <span className="text-xs text-gray-500"> · Shop {productTitle || 'products'}</span>
      </div>

      {/* Shopping Carousel */}
      <div className="flex gap-3 p-4 overflow-x-auto">
        {/* Main product card (the user's ad) */}
        <div className="w-[150px] flex-shrink-0 border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
          <div className="aspect-square bg-gray-50 relative">
            {imageUrl ? (
              <img src={imageUrl} alt={productTitle} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12zm-7-8c-1.66 0-3-1.34-3-3H7c0 2.76 2.24 5 5 5s5-2.24 5-5h-2c0 1.66-1.34 3-3 3z"/>
                </svg>
              </div>
            )}
          </div>
          <div className="p-2.5">
            <p className="text-xs text-gray-800 line-clamp-2 leading-4 min-h-[2rem]">
              {productTitle || 'Your Product Title Here'}
            </p>
            <p className="text-sm font-bold text-gray-900 mt-1">
              {productPrice || '$0.00'}
            </p>
            <p className="text-xs text-gray-500 truncate mt-0.5">{storeName || 'Your Store'}</p>
            <div className="flex items-center gap-1 mt-1">
              {renderStars()}
              <span className="text-xs text-gray-500">({reviewCount || '0'})</span>
            </div>
            {shipping && (
              <p className="text-xs text-gray-600 mt-1">{shipping}</p>
            )}
          </div>
        </div>

        {/* Competitor placeholder cards */}
        {[1, 2].map((i) => (
          <div key={i} className="w-[150px] flex-shrink-0 border border-gray-200 rounded-xl overflow-hidden opacity-60">
            <div className="aspect-square bg-gray-100 flex items-center justify-center text-gray-300">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </div>
            <div className="p-2.5">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mt-1"></div>
              <div className="h-3.5 bg-gray-300 rounded w-1/2 mt-2"></div>
              <div className="h-2.5 bg-gray-100 rounded w-3/4 mt-1.5"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
