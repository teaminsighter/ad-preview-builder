'use client';

interface LinkedInFeedAdProps {
  companyName: string;
  companyLogoUrl?: string;
  headline: string;
  introText: string;
  imageUrl: string;
  ctaText: string;
  websiteUrl?: string;
}

export default function LinkedInFeedAd({
  companyName,
  companyLogoUrl,
  headline,
  introText,
  imageUrl,
  ctaText,
  websiteUrl = 'company.com',
}: LinkedInFeedAdProps) {
  return (
    <div className="w-full max-w-[550px] bg-white rounded-lg border border-gray-200 shadow-sm font-['system-ui',_-apple-system,_sans-serif]">
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-start gap-3">
          {/* Company Logo */}
          <div className="w-12 h-12 rounded-sm overflow-hidden bg-gray-100 flex-shrink-0">
            {companyLogoUrl ? (
              <img src={companyLogoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#0A66C2] text-white text-xl font-bold">
                {companyName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Company Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm text-gray-900 hover:text-[#0A66C2] hover:underline cursor-pointer">
                {companyName || 'Company Name'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Promoted
            </p>
          </div>

          {/* More Options */}
          <button className="text-gray-500 hover:bg-gray-100 p-1 rounded-full">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
        </div>

        {/* Intro Text */}
        <p className="mt-3 text-sm text-gray-800 leading-relaxed">
          {introText || 'Your intro text will appear here. Describe your offer and engage your professional audience.'}
        </p>
      </div>

      {/* Image */}
      <div className="relative bg-gray-100">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="w-full aspect-[1.91/1] object-cover" />
        ) : (
          <div className="w-full aspect-[1.91/1] flex items-center justify-center bg-gradient-to-br from-[#0A66C2]/10 to-[#0A66C2]/5">
            <svg className="w-20 h-20 text-[#0A66C2]/30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {headline || 'Your headline will appear here'}
            </p>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {websiteUrl}
            </p>
          </div>
          <button className="ml-4 px-5 py-2 bg-[#0A66C2] text-white text-sm font-semibold rounded-full hover:bg-[#004182] transition-colors flex-shrink-0">
            {ctaText || 'Learn more'}
          </button>
        </div>
      </div>

      {/* Engagement Bar */}
      <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-1 text-xs text-gray-500">
        <div className="flex -space-x-1">
          <span className="w-4 h-4 rounded-full bg-[#0A66C2] flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 9V5a3 3 0 00-6 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
          </span>
          <span className="w-4 h-4 rounded-full bg-[#7FC15E] flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8 17.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM9.5 8c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5S9.5 8.83 9.5 8zm6.5 9.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
            </svg>
          </span>
          <span className="w-4 h-4 rounded-full bg-[#F5BB5C] flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-5-6c.78 2.34 2.72 4 5 4s4.22-1.66 5-4H7z"/>
            </svg>
          </span>
        </div>
        <span className="ml-1">2,847</span>
        <span className="mx-1">•</span>
        <span>156 comments</span>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-around">
        <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
          </svg>
          Like
        </button>
        <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          Comment
        </button>
        <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
          </svg>
          Repost
        </button>
        <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
          Send
        </button>
      </div>
    </div>
  );
}
