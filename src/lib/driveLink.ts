// Google Drive share links (drive.google.com/file/d/…/view) don't render in
// <img>/<video> tags. These helpers rewrite them to direct-content endpoints.
// The file must be shared "Anyone with the link – Viewer". Large videos
// (~100MB+) hit Drive's virus-scan page and may not stream.

export function driveFileId(url: string): string | null {
  if (!/(?:drive|docs)\.google\.com/.test(url)) return null;
  const m =
    url.match(/\/file\/d\/([\w-]+)/) ||
    url.match(/[?&]id=([\w-]+)/) ||
    url.match(/\/d\/([\w-]+)/);
  return m ? m[1] : null;
}

export const driveImageUrl = (id: string) => `https://lh3.googleusercontent.com/d/${id}=w2000`;
export const driveVideoUrl = (id: string) => `https://drive.google.com/uc?export=download&id=${id}`;

// Rewrite a Drive share link to a direct URL for the given media kind;
// non-Drive URLs pass through untouched.
export function normalizeMediaUrl(url: string, kind: 'image' | 'video' = 'image'): string {
  const id = driveFileId(url);
  if (!id) return url;
  return kind === 'video' ? driveVideoUrl(id) : driveImageUrl(id);
}
