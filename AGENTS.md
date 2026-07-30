<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Ad Preview Builder

Pixel-accurate ad previews for Google Ads, Meta (FB/IG), Microsoft/Bing and
TikTok, plus client collaboration on the copy. Next.js static export
(`out/`) deployed on Cloudflare Pages with Pages Functions as the backend.

- **Production:** https://adpreview.insighter.digital (same CF Pages project
  as ad-preview-builder.pages.dev, GitHub repo `teaminsighter/ad-preview-builder`,
  auto-deploys on push to `main`)
- **Before pushing:** run `npm ci --dry-run` — Cloudflare's `npm ci` rejects
  lockfiles missing optional wasm entries. If it fails:
  `rm -rf node_modules package-lock.json && npm install`.
- `npm run build` must pass; `npm run lint` has pre-existing errors
  (setState-in-effect etc.) — don't add new ones.

## Layout

- `src/app/page.tsx` — the whole builder UI (one large client component):
  platform tabs, editors, share/auto-fill/collab logic. Ad state is a flat
  set of useStates; `getAdData()` / `loadAdData()` serialize and restore it
  (also the shape stored in share links and R2).
- `src/components/previews/*` — one component per ad placement.
- `src/components/campaigns/*` — Google campaign builders (Search via main
  page; PMax, Display, Video, Demand Gen, Shopping) + shared `ui.tsx`
  (`PhoneFrame` is the Google-style device mockup: fixed-height, never
  scrolls internally, auto-scales content via ResizeObserver).
- `src/lib/importDoc.ts` — Auto-Fill parser: CSV/doc-text/xlsx → ad data.
  Label aliases + three layouts (header row, label column, "Label: value"
  lines). `src/lib/driveLink.ts` rewrites Google Drive share links to
  direct-content URLs (lh3.googleusercontent for images, uc?export=download
  for videos).
- `functions/` — Cloudflare Pages Functions (backend):
  - `api/import-doc.js` — proxy-fetch public Sheets (CSV) / Docs (txt) for Auto-Fill
  - `api/shared-ad.js` — editable share links: POST create (auth) / GET load /
    PUT save (email required, forwards to sheet webhook) / DELETE (auth).
    Stored as `shares/<uuid>.json` in the MEDIA R2 bucket.
  - `api/upload-media.js` + `media/[key].js` — share videos in R2
  - `api/media-library.js` — owner list/delete of stored media (auth)
  - `_auth.js` — optional APP_PASSWORD gate; costly endpoints check `x-auth`
- `apps-script/` — Google Apps Script sources (mirror of what runs in the
  user's account): `SharedAdEdits.gs` is the sheet-sync webhook +
  source-sheet write-back + `createTemplateSheet()`. `SETUP.md` documents
  deployment. GoogleAdsSync/MetaAdsSync launch campaigns from the master sheet.

## Share links

- View-only `#s=<deflate+base64url>` — whole ad inside the URL, no backend
  (`src/lib/shareLink.ts`).
- Editable `#e=<uuid>` — ad stored in R2; recipient passes a one-time email
  gate (localStorage `adPreviewEditorEmail`), edits in the full builder, and
  "Save changes" PUTs the payload. Collab mode bypasses the login gate and
  local autosave. Owner manages links + storage under Share → Manage links
  & storage.

## Sheet sync (external infrastructure, teaminsighter@gmail.com account)

- Every collab save is forwarded to the Apps Script web app in the
  `SHEET_WEBHOOK_URL` env var (CF Pages → Settings → Variables). It upserts
  the "Ad Edits" tab and appends "Edit Log" in the **Ad Operations Master**
  spreadsheet, and — if the ad was Auto-Filled from a sheet (`sourceSheet`
  {id,gid} travels in the payload) — writes the edited values back onto that
  sheet's own labels. Write-back needs the source sheet shared with Editor
  access; import only needs link-Viewer.
- Webhook HTTP responses look broken from curl (302/405/Bengali 404 HTML)
  but the script still executes — verify against the sheet, not the response.
- Updating the webhook: paste code in the Apps Script editor → Deploy →
  Manage deployments → pencil → New version (keeps the same URL; a *new*
  deployment would change the URL and break `SHEET_WEBHOOK_URL`).

## Env vars (Cloudflare Pages)

`SHEET_WEBHOOK_URL` (sheet sync), `APP_PASSWORD` (optional login gate),
`APIFY_TOKEN` / `SERPAPI_KEY` (ad-library search), R2 bucket binding `MEDIA`.
Env/binding changes need a redeploy to take effect.
