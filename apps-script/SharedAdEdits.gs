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
