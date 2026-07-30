/**
 * Shared Ad Edits webhook — receives saves from the Ad Preview Builder's
 * editable share links (functions/api/shared-ad.js) and mirrors them into
 * this spreadsheet.
 *
 * Setup (once):
 *   1. Open the Ad Operations Master sheet > Extensions > Apps Script and add
 *      this file to the same project as GoogleAdsSync.gs / MetaAdsSync.gs.
 *      (If the script isn't container-bound, set SHARED_EDITS_SPREADSHEET_ID
 *      in Project Settings > Script Properties.)
 *   2. Deploy > New deployment > Web app:
 *        Execute as: Me
 *        Who has access: Anyone
 *   3. Copy the web app URL and add it to the Cloudflare Pages project as the
 *      SHEET_WEBHOOK_URL environment variable, then redeploy the site.
 *
 * Behaviour:
 *   - "Ad Edits" tab: one row per share link, always the LATEST copy
 *     (share id, link, last editor, last edited, then the ad fields).
 *   - "Edit Log" tab: one row appended per save — the who/when history.
 */

var EDITS_SHEET = 'Ad Edits';
var LOG_SHEET = 'Edit Log';

function doPost(e) {
  var out = { ok: false };
  try {
    var payload = JSON.parse(e.postData.contents);
    if (!payload || !payload.id || !payload.email) throw new Error('bad payload');
    upsertLatestCopy_(payload);
    appendEditLog_(payload);
    out.sourceSheet = updateSourceSheet_(payload);
    out.ok = true;
  } catch (err) {
    out.error = String(err && err.message ? err.message : err);
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function sharedEditsSpreadsheet_() {
  var byId = PropertiesService.getScriptProperties().getProperty('SHARED_EDITS_SPREADSHEET_ID');
  if (byId) return SpreadsheetApp.openById(byId);
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (!active) throw new Error('Set SHARED_EDITS_SPREADSHEET_ID in Script Properties');
  return active;
}

function upsertLatestCopy_(payload) {
  var ss = sharedEditsSpreadsheet_();
  var sheet = ss.getSheetByName(EDITS_SHEET) || ss.insertSheet(EDITS_SHEET);
  var fixed = ['Share ID', 'Link', 'Last Editor', 'Last Edited'];
  var fieldNames = Object.keys(payload.values || {});
  var header = fixed.concat(fieldNames);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(header);
    sheet.setFrozenRows(1);
  } else {
    // Grow the header if this payload carries columns the sheet lacks yet
    var existing = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var missing = header.filter(function (h) { return existing.indexOf(h) === -1; });
    if (missing.length) {
      sheet.getRange(1, existing.length + 1, 1, missing.length).setValues([missing]);
    }
    header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  }

  var row = header.map(function (h) {
    if (h === 'Share ID') return payload.id;
    if (h === 'Link') return payload.shareUrl || '';
    if (h === 'Last Editor') return payload.email;
    if (h === 'Last Edited') return payload.editedAt || new Date().toISOString();
    return (payload.values && payload.values[h]) || '';
  });

  var ids = sheet.getLastRow() > 1
    ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues()
    : [];
  for (var i = 0; i < ids.length; i++) {
    if (ids[i][0] === payload.id) {
      sheet.getRange(i + 2, 1, 1, row.length).setValues([row]);
      return;
    }
  }
  sheet.appendRow(row);
}

function appendEditLog_(payload) {
  var ss = sharedEditsSpreadsheet_();
  var sheet = ss.getSheetByName(LOG_SHEET) || ss.insertSheet(LOG_SHEET);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['When', 'Share ID', 'Editor Email', 'Link']);
    sheet.setFrozenRows(1);
  }
  sheet.appendRow([
    payload.editedAt || new Date().toISOString(),
    payload.id,
    payload.email,
    payload.shareUrl || '',
  ]);
}

// ---- Source-sheet write-back --------------------------------------------
// When the ad was auto-filled from a Google Sheet, collab saves carry that
// sheet's id/gid plus structured field values. If this account can edit the
// sheet (shared as "Anyone with the link – Editor" or directly with this
// account), the edited values are written back onto its own labels.

var WRITEBACK_LABELS = {
  platform: 'platform',
  pagename: 'pageName', facebookpage: 'pageName', fbpage: 'pageName', page: 'pageName',
  businessname: 'businessName', brandname: 'businessName', brand: 'businessName',
  company: 'businessName', companyname: 'businessName',
  instagramaccount: 'instagram', instagram: 'instagram', igaccount: 'instagram', ighandle: 'instagram',
  adname: 'adName',
  primarytext: 'primaryTexts', primarytexts: 'primaryTexts', bodytext: 'primaryTexts',
  body: 'primaryTexts', adcopy: 'primaryTexts', copy: 'primaryTexts', text: 'primaryTexts',
  headline: 'headlines', headlines: 'headlines', title: 'headlines',
  description: 'descriptions', descriptions: 'descriptions', desc: 'descriptions',
  cta: 'cta', calltoaction: 'cta', ctabutton: 'cta', button: 'cta', buttontext: 'cta',
  finalurl: 'finalUrl', landingpage: 'finalUrl', landingpageurl: 'finalUrl',
  websiteurl: 'finalUrl', website: 'finalUrl', destinationurl: 'finalUrl',
  url: 'finalUrl', link: 'finalUrl', linkurl: 'finalUrl',
  displayurl: 'displayUrl', displaylink: 'displayUrl',
  path: 'path', displaypath: 'path',
  phone: 'phone', phonenumber: 'phone',
};

function splitWritebackLabel_(raw) {
  var norm = String(raw || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  if (!norm || norm.length > 40) return null;
  var m = norm.match(/^([a-z]+?)(\d+)?$/);
  if (!m) return null;
  var field = WRITEBACK_LABELS[m[1]] || WRITEBACK_LABELS[norm];
  if (!field) return null;
  return { field: field, idx: m[2] ? parseInt(m[2], 10) : null };
}

function writebackValue_(fields, lab) {
  if (lab.field === 'path') {
    return fields[lab.idx === 2 ? 'path2' : 'path1'];
  }
  var v = fields[lab.field];
  if (v === undefined || v === null) return null;
  if (Object.prototype.toString.call(v) === '[object Array]') {
    return v[(lab.idx || 1) - 1] || '';
  }
  return lab.idx && lab.idx > 1 ? null : v;
}

function updateSourceSheet_(payload) {
  if (!payload.sourceSheet || !payload.sourceSheet.id || !payload.fields) return 'none';
  var ss;
  try {
    ss = SpreadsheetApp.openById(payload.sourceSheet.id);
  } catch (e) {
    return 'no_access';
  }
  var sheet = null;
  if (payload.sourceSheet.gid != null && payload.sourceSheet.gid !== '') {
    var sheets = ss.getSheets();
    for (var i = 0; i < sheets.length; i++) {
      if (String(sheets[i].getSheetId()) === String(payload.sourceSheet.gid)) sheet = sheets[i];
    }
  }
  if (!sheet) sheet = ss.getSheets()[0];
  try {
    return writeBack_(sheet, payload.fields) ? 'updated' : 'no_labels';
  } catch (e) {
    return 'no_access';
  }
}

function writeBack_(sheet, fields) {
  var lastRow = Math.min(sheet.getLastRow(), 200);
  var lastCol = Math.min(sheet.getLastColumn(), 30);
  if (!lastRow || !lastCol) return false;
  var grid = sheet.getRange(1, 1, lastRow, lastCol).getValues();

  var colHits = 0;
  for (var r = 0; r < lastRow; r++) if (splitWritebackLabel_(grid[r][0])) colHits++;
  var rowHits = 0;
  for (var c = 0; c < lastCol; c++) if (splitWritebackLabel_(grid[0][c])) rowHits++;
  var wrote = false;

  if (colHits >= rowHits && colHits > 0) {
    // Labels down column A, values in column B. Unnumbered repeated labels
    // ("Headline" three times) get sequential indexes.
    var counters = {};
    for (var r2 = 0; r2 < lastRow; r2++) {
      var lab = splitWritebackLabel_(grid[r2][0]);
      if (!lab) continue;
      if (!lab.idx) {
        counters[lab.field] = (counters[lab.field] || 0) + 1;
        lab.idx = counters[lab.field];
      }
      var v = writebackValue_(fields, lab);
      if (v === null || v === undefined) continue;
      if (String(grid[r2][1]) !== String(v)) {
        sheet.getRange(r2 + 1, 2).setValue(v);
      }
      wrote = true;
    }
    return wrote;
  }

  if (rowHits > 0) {
    // Header row, values in the rows below. Unnumbered array columns get one
    // value per row; numbered columns ("Headline 2") get that single value.
    for (var c2 = 0; c2 < lastCol; c2++) {
      var lab2 = splitWritebackLabel_(grid[0][c2]);
      if (!lab2) continue;
      var val = lab2.field === 'path'
        ? fields[lab2.idx === 2 ? 'path2' : 'path1']
        : fields[lab2.field];
      if (val === undefined || val === null) continue;
      if (Object.prototype.toString.call(val) === '[object Array]') {
        if (lab2.idx) {
          sheet.getRange(2, c2 + 1).setValue(val[lab2.idx - 1] || '');
        } else {
          var n = Math.min(Math.max(val.length, 1), 15);
          for (var r3 = 0; r3 < n; r3++) {
            sheet.getRange(r3 + 2, c2 + 1).setValue(val[r3] || '');
          }
        }
      } else {
        sheet.getRange(2, c2 + 1).setValue(val);
      }
      wrote = true;
    }
    return wrote;
  }
  return false;
}

/**
 * Helper: builds an "Ad Copy Template" spreadsheet with every layout the
 * Ad Preview Builder's Auto-Fill understands (Meta Ad, Google Search,
 * Copy Variants, How To Use). Run from the editor; the new file's URL is
 * written to the execution log. Re-run any time for a fresh client template.
 */
function createTemplateSheet() {
  var ss = SpreadsheetApp.create('Ad Copy Template');

  var meta = ss.getSheets()[0];
  meta.setName('Meta Ad');
  var metaRows = [
    ['Platform', 'Facebook'],
    ['Page Name', 'Your Page Name'],
    ['Instagram Account', 'yourhandle'],
    ['Ad Name', 'July Campaign v1'],
    ['Primary Text 1', 'Struggling to get leads? Our system books qualified appointments for you every week.'],
    ['Primary Text 2', 'Stop chasing leads. Start closing them.'],
    ['Headline 1', 'Get 20+ Leads Per Week'],
    ['Headline 2', 'Book Your Free Demo'],
    ['Headline 3', 'Trusted By 100+ Businesses'],
    ['Description 1', 'No contracts. Cancel anytime.'],
    ['CTA', 'Learn More'],
    ['Final URL', 'https://example.com/offer'],
    ['Image', 'paste image URL or Google Drive share link here'],
    ['Video', 'optional: Google Drive share link to a video'],
    ['Logo', 'paste logo URL or Google Drive share link here'],
  ];
  meta.getRange(1, 1, metaRows.length, 2).setValues(metaRows);

  var g = ss.insertSheet('Google Search');
  var gRows = [
    ['Platform', 'Google'],
    ['Business Name', 'Your Business'],
    ['Final URL', 'https://example.com/landing'],
    ['Path 1', 'offers'],
    ['Path 2', 'demo'],
    ['Headline 1', 'Lead Generation Experts'],
    ['Headline 2', '20+ Qualified Leads Weekly'],
    ['Headline 3', 'Free Strategy Call'],
    ['Headline 4', 'No Lock-In Contracts'],
    ['Headline 5', 'Local & Trusted'],
    ['Headline 6', ''], ['Headline 7', ''], ['Headline 8', ''], ['Headline 9', ''], ['Headline 10', ''],
    ['Headline 11', ''], ['Headline 12', ''], ['Headline 13', ''], ['Headline 14', ''], ['Headline 15', ''],
    ['Description 1', 'We build and run your entire lead machine. Book a free demo today.'],
    ['Description 2', 'Trusted by 100+ local businesses. Results in the first 14 days.'],
    ['Description 3', ''], ['Description 4', ''],
    ['Sitelink 1', 'Pricing'], ['Sitelink 2', 'Case Studies'], ['Sitelink 3', 'About Us'], ['Sitelink 4', 'Contact'],
    ['Callout 1', 'Free Setup'], ['Callout 2', 'Cancel Anytime'], ['Callout 3', '5-Star Rated'], ['Callout 4', ''],
    ['Snippet Header', 'Services'],
    ['Snippet 1', 'Google Ads'], ['Snippet 2', 'Meta Ads'], ['Snippet 3', 'SEO'],
    ['Phone', '+64 21 123 4567'],
    ['Logo', 'paste logo URL or Drive link'],
  ];
  g.getRange(1, 1, gRows.length, 2).setValues(gRows);

  var v = ss.insertSheet('Copy Variants');
  var vRows = [
    ['Primary Text', 'Headline', 'Description', 'CTA', 'Final URL'],
    ['Struggling to get leads? We book them for you.', 'Get 20+ Leads Weekly', 'No contracts, cancel anytime', 'Learn More', 'https://example.com'],
    ['Stop chasing leads. Start closing them.', 'Book Your Free Demo', 'Results in 14 days', '', ''],
    ['Your competitors are already doing this.', 'Trusted By 100+ Brands', '', '', ''],
  ];
  v.getRange(1, 1, vRows.length, 5).setValues(vRows);
  v.getRange(1, 1, 1, 5).setFontWeight('bold');

  var h = ss.insertSheet('How To Use');
  var hRows = [
    ['HOW TO USE THIS TEMPLATE'],
    [''],
    ['1. Duplicate this file for each client/campaign (File > Make a copy).'],
    ['2. Fill in any tab — delete rows you do not need, labels are flexible.'],
    ['3. Share > "Anyone with the link – Viewer".'],
    ['4. In the Ad Preview Builder, click Auto-Fill and paste this sheet\'s link.'],
    ['   Tip: open the tab you want first — the link then contains that tab\'s gid.'],
    [''],
    ['Labels understood (case/spacing ignored, many synonyms):'],
    ['Headline / Title, Description, Primary Text / Body / Ad Copy, CTA / Call To Action,'],
    ['Final URL / Landing Page / Website, Display URL, Path 1-2, Business Name / Brand,'],
    ['Page Name, Instagram, Sitelink N, Callout N, Snippet Header, Snippet N, Phone,'],
    ['Image / Media / Creative, Video, Logo (all accept Google Drive share links),'],
    ['Platform (Facebook / Google / TikTok / Bing), Ad Name.'],
    [''],
    ['One import fills Google + Meta + Bing + TikTok fields at the same time.'],
  ];
  h.getRange(1, 1, hRows.length, 1).setValues(hRows);
  h.getRange(1, 1).setFontWeight('bold');

  [meta, g].forEach(function (s) {
    s.getRange(1, 1, s.getLastRow(), 1).setFontWeight('bold');
    s.setColumnWidth(1, 160);
    s.setColumnWidth(2, 520);
  });
  ss.setActiveSheet(meta);
  Logger.log('TEMPLATE URL: ' + ss.getUrl());
  return ss.getUrl();
}
