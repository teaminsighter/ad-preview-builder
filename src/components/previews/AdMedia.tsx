'use client';

import { looksLikeVideoUrl } from '@/lib/metaSpecs';

interface AdMediaProps {
  url: string;
  kind?: 'image' | 'video';
  alt?: string;
  className?: string;
}

// Renders ad media as <img> or autoplaying muted <video> so previews can show
// real video creative, matching how placements loop video ads.
export default function AdMedia({ url, kind, alt = 'Ad', className = 'w-full h-full object-cover' }: AdMediaProps) {
  const isVideo = kind === 'video' || (kind === undefined && looksLikeVideoUrl(url));
  if (isVideo) {
    return <video src={url} className={className} muted loop autoPlay playsInline />;
  }
  /* eslint-disable-next-line @next/next/no-img-element */
  return <img src={url} alt={alt} className={className} />;
}
