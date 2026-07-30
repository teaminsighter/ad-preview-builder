# Ad Operations Sync — Setup

Two Apps Script files that live inside the Ad Operations Master Google Sheet and
launch ads on Google Ads and Meta from rows marked `READY`. No server needed.

## 1. Create the sheet

1. Upload `templates/Ad-Operations-Master.xlsx` to Google Drive.
2. Open it → **File → Save as Google Sheets**.

## 2. Install the scripts

1. In the sheet: **Extensions → Apps Script**.
2. Create two script files and paste in `GoogleAdsSync.gs` and `MetaAdsSync.gs`.
3. **Project Settings → check "Show appsscript.json manifest"**, then replace its
   contents with `appsscript.json` from this folder (adds the `adwords` OAuth scope).

## 3. Script properties (Project Settings → Script Properties)

| Property | Value |
|---|---|
| `GADS_DEVELOPER_TOKEN` | Your Google Ads developer token |
| `GADS_CUSTOMER_ID` | Target ad account id, digits only (e.g. `1234567890`) |
| `GADS_LOGIN_CUSTOMER_ID` | MCC id — only if the token lives under a manager account |
| `META_ACCESS_TOKEN` | System-user token with `ads_management` (Business Manager → System Users) |
| `META_AD_ACCOUNT_ID` | Ad account id, digits only, no `act_` prefix |
| `META_PAGE_ID` | Facebook Page the ads run from |
| `META_IG_ACCOUNT_ID` | Instagram actor id (optional, needed for IG placements) |
| `META_COUNTRIES` | Default geo targeting, e.g. `AU` or `AU,NZ` |

## 4. First run + triggers

1. In the editor run `syncGoogleAds` once — approve the OAuth consent
   (the Google account you approve with must have access to the ad account).
2. Run `syncMetaAds` once.
3. **Triggers (clock icon) → Add Trigger**: `syncGoogleAds`, time-driven, hourly.
   Repeat for `syncMetaAds`.

## 5. Daily workflow

1. Build the ad in the ad-preview-builder app, copy values into a row of
   `Google_Search` / `Meta_Ads` (+ a row in `Campaigns` the first time).
2. Set the campaign row and the ad row `status` to `READY`.
3. Next run: campaign + ads are created **PAUSED** on the platform,
   `api_id` / `api_status` / `last_synced` are written back to the row.
4. Review in Google Ads / Ads Manager and enable.

## Notes & current scope

- Google: Search campaigns + RSAs are fully automated. PMax / Demand Gen /
  Video / Shopping tabs are data-complete but need extra mutate code —
  extend `syncGoogleCampaigns_` when needed (the developer token already permits it).
- Meta: all objectives supported; ad set targeting is created with the default
  country only — refine audiences in Ads Manager after upload.
- Everything is created paused; nothing spends until you enable it.
- Errors land in the row's `api_status` as `ERROR: <message>` — fix the row,
  clear `api_status`, keep `status = READY`, and the next run retries.
  (Rows with a non-empty `api_id` are never touched again.)

## 6. Shared-ad edit sync (SharedAdEdits.gs)

Editable share links from the preview builder ("Share > Editable link") save
each edit back to this spreadsheet.

1. Add `SharedAdEdits.gs` to the same Apps Script project.
2. Deploy > **New deployment** > type **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
3. Copy the web app URL (`https://script.google.com/macros/s/…/exec`).
4. Cloudflare dashboard > Workers & Pages > ad-preview-builder > Settings >
   Environment variables > add `SHEET_WEBHOOK_URL` = that URL (Production),
   then redeploy.

Resulting tabs (auto-created):

- **Ad Edits** — one row per share link with the latest copy: share id, link,
  last editor email, last edited time, headlines, descriptions, primary
  texts, CTA, final URL, page/business name.
- **Edit Log** — one appended row per save: when, share id, editor email.

If you redeploy the web app, the URL changes — update `SHEET_WEBHOOK_URL`.
