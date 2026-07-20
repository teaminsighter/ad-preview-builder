// Built-in demo images (inline SVG data URIs) so campaign builders start
// with a complete, green-checklist state without needing any uploads.

const svgUri = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

export const DEMO_LANDSCAPE_IMG = svgUri(
  `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='314'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#6366f1'/><stop offset='1' stop-color='#a855f7'/></linearGradient></defs><rect width='600' height='314' fill='url(#g)'/><circle cx='470' cy='90' r='110' fill='rgba(255,255,255,0.12)'/><circle cx='90' cy='260' r='70' fill='rgba(255,255,255,0.10)'/><text x='50%' y='46%' fill='white' font-family='Arial,sans-serif' font-size='40' font-weight='bold' text-anchor='middle'>Demo Store</text><text x='50%' y='62%' fill='rgba(255,255,255,0.85)' font-family='Arial,sans-serif' font-size='20' text-anchor='middle'>Premium Wireless Headphones</text></svg>`
);

export const DEMO_SQUARE_IMG = svgUri(
  `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#6366f1'/><stop offset='1' stop-color='#a855f7'/></linearGradient></defs><rect width='400' height='400' fill='url(#g)'/><circle cx='320' cy='80' r='90' fill='rgba(255,255,255,0.12)'/><text x='50%' y='48%' fill='white' font-family='Arial,sans-serif' font-size='36' font-weight='bold' text-anchor='middle'>Demo</text><text x='50%' y='60%' fill='white' font-family='Arial,sans-serif' font-size='36' font-weight='bold' text-anchor='middle'>Store</text></svg>`
);

export const DEMO_LOGO_IMG = svgUri(
  `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='200' height='200' rx='100' fill='#6366f1'/><text x='50%' y='54%' fill='white' font-family='Arial,sans-serif' font-size='96' font-weight='bold' text-anchor='middle' dominant-baseline='middle'>D</text></svg>`
);

export const DEMO_PRODUCT_IMG = svgUri(
  `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect width='400' height='400' fill='#f3f4f6'/><g transform='translate(200,190)'><path d='M-90 30 v-40 a90 90 0 0 1 180 0 v40' fill='none' stroke='#374151' stroke-width='22' stroke-linecap='round'/><rect x='-118' y='10' width='46' height='90' rx='20' fill='#6366f1'/><rect x='72' y='10' width='46' height='90' rx='20' fill='#6366f1'/></g><text x='50%' y='88%' fill='#6b7280' font-family='Arial,sans-serif' font-size='22' text-anchor='middle'>Wireless Headphones</text></svg>`
);
