/**
 * Google Ads sync — reads the Ad Operations Master sheet and launches
 * Search campaigns + Responsive Search Ads via the Google Ads REST API.
 *
 * Setup (once):
 *   1. Extensions > Apps Script from the sheet, paste this file + appsscript.json manifest.
 *   2. Project Settings > Script Properties, add:
 *        GADS_DEVELOPER_TOKEN   your developer token
 *        GADS_CUSTOMER_ID       target account, digits only e.g. 1234567890
 *        GADS_LOGIN_CUSTOMER_ID MCC id if the token is under a manager account (optional)
 *   3. Run syncGoogleAds once from the editor to authorize, then add an
 *      hourly time-driven trigger for syncGoogleAds.
 *
 * Behaviour:
 *   - Campaigns tab: rows with platform=google, campaign_type=search, status=READY,
 *     empty api_id -> creates budget + PAUSED campaign, writes api_id back.
 *   - Google_Search tab: rows with status=READY, empty api_id -> creates the ad
 *     group (reusing it if the name already exists) and the RSA, writes api_id back.
 *   - Everything is created PAUSED. You enable in the Google Ads UI after review.
 */

var GADS_API = 'https://googleads.googleapis.com/v19';

function syncGoogleAds() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  syncGoogleCampaigns_(ss);
  syncGoogleSearchAds_(ss);
}

// ---------- Campaigns ----------

function syncGoogleCampaigns_(ss) {
  var tab = sheetTable_(ss, 'Campaigns');
  tab.rows.forEach(function (row) {
    if (row.get('platform') !== 'google') return;
    if (row.get('campaign_type') !== 'search') return; // other types: extend here
    if (row.get('status') !== 'READY' || row.get('api_id')) return;

    try {
      var budget = String(Math.round(Number(row.get('daily_budget')) * 1e6));
      var ops = [
        { campaignBudgetOperation: { create: {
            resourceName: tempRes_('campaignBudgets'),
            name: row.get('campaign_name') + ' budget ' + Date.now(),
            amountMicros: budget,
            explicitlyShared: false
        } } },
        { campaignOperation: { create: buildCampaign_(row) } }
      ];
      var res = gadsMutate_(ops);
      var campRes = res.mutateOperationResponses[1].campaignResult.resourceName;
      row.write('api_id', campRes);
      row.write('api_status', 'UPLOADED (paused)');
    } catch (e) {
      row.write('api_status', 'ERROR: ' + trim_(e));
    }
    row.write('last_synced', new Date());
  });
}

function buildCampaign_(row) {
  var c = {
    resourceName: tempRes_('campaigns'),
    name: row.get('campaign_name'),
    advertisingChannelType: 'SEARCH',
    status: 'PAUSED',
    campaignBudget: tempRes_('campaignBudgets'),
    networkSettings: { targetGoogleSearch: true, targetSearchNetwork: false, targetContentNetwork: false }
  };
  if (row.get('start_date')) c.startDate = dateStr_(row.get('start_date'));
  if (row.get('end_date')) c.endDate = dateStr_(row.get('end_date'));

  var bid = row.get('bid_strategy') || 'maximize_conversions';
  if (bid === 'manual_cpc') c.manualCpc = { enhancedCpcEnabled: false };
  else if (bid === 'target_cpa' && row.get('target_cpa'))
    c.maximizeConversions = { targetCpaMicros: String(Math.round(Number(row.get('target_cpa')) * 1e6)) };
  else c.maximizeConversions = {};
  return c;
}

// ---------- Search ads (RSAs) ----------

function syncGoogleSearchAds_(ss) {
  var camps = sheetTable_(ss, 'Campaigns');
  var campById = {};
  camps.rows.forEach(function (r) { campById[r.get('campaign_id')] = r; });

  var tab = sheetTable_(ss, 'Google_Search');
  tab.rows.forEach(function (row) {
    if (row.get('status') !== 'READY' || row.get('api_id')) return;

    var camp = campById[row.get('campaign_id')];
    if (!camp || !camp.get('api_id') || camp.get('api_id').indexOf('/campaigns/') === -1) {
      row.write('api_status', 'ERROR: campaign not uploaded yet (' + row.get('campaign_id') + ')');
      row.write('last_synced', new Date());
      return;
    }

    try {
      var adGroupRes = findOrCreateAdGroup_(camp.get('api_id'), row.get('ad_group'));
      var headlines = collect_(row, 'headline_', 15).map(function (t) { return { text: t }; });
      var descriptions = collect_(row, 'description_', 4).map(function (t) { return { text: t }; });

      var res = gadsMutate_([{ adGroupAdOperation: { create: {
        adGroup: adGroupRes,
        status: 'PAUSED',
        ad: {
          finalUrls: [row.get('final_url')],
          responsiveSearchAd: {
            headlines: headlines,
            descriptions: descriptions,
            path1: row.get('path1') || undefined,
            path2: row.get('path2') || undefined
          }
        }
      } } }]);
      row.write('api_id', res.mutateOperationResponses[0].adGroupAdResult.resourceName);
      row.write('api_status', 'UPLOADED (paused)');
    } catch (e) {
      row.write('api_status', 'ERROR: ' + trim_(e));
    }
    row.write('last_synced', new Date());
  });
}

function findOrCreateAdGroup_(campaignRes, name) {
  var q = "SELECT ad_group.resource_name FROM ad_group WHERE ad_group.name = '" +
          name.replace(/'/g, "\\'") + "' AND campaign.resource_name = '" + campaignRes + "'";
  var found = gadsSearch_(q);
  if (found.length) return found[0].adGroup.resourceName;

  var res = gadsMutate_([{ adGroupOperation: { create: {
    name: name, campaign: campaignRes, type: 'SEARCH_STANDARD', status: 'ENABLED'
  } } }]);
  return res.mutateOperationResponses[0].adGroupResult.resourceName;
}

// ---------- Google Ads REST helpers ----------

function gadsHeaders_() {
  var props = PropertiesService.getScriptProperties();
  var h = {
    Authorization: 'Bearer ' + ScriptApp.getOAuthToken(),
    'developer-token': props.getProperty('GADS_DEVELOPER_TOKEN')
  };
  var mcc = props.getProperty('GADS_LOGIN_CUSTOMER_ID');
  if (mcc) h['login-customer-id'] = mcc.replace(/-/g, '');
  return h;
}

function customerId_() {
  return PropertiesService.getScriptProperties().getProperty('GADS_CUSTOMER_ID').replace(/-/g, '');
}

function gadsMutate_(mutateOperations) {
  var resp = UrlFetchApp.fetch(GADS_API + '/customers/' + customerId_() + '/googleAds:mutate', {
    method: 'post',
    contentType: 'application/json',
    headers: gadsHeaders_(),
    payload: JSON.stringify({ mutateOperations: mutateOperations }),
    muteHttpExceptions: true
  });
  var body = JSON.parse(resp.getContentText());
  if (resp.getResponseCode() >= 300) throw new Error(JSON.stringify(body.error && body.error.message || body));
  return body;
}

function gadsSearch_(query) {
  var resp = UrlFetchApp.fetch(GADS_API + '/customers/' + customerId_() + '/googleAds:search', {
    method: 'post',
    contentType: 'application/json',
    headers: gadsHeaders_(),
    payload: JSON.stringify({ query: query }),
    muteHttpExceptions: true
  });
  var body = JSON.parse(resp.getContentText());
  if (resp.getResponseCode() >= 300) throw new Error(JSON.stringify(body.error && body.error.message || body));
  return body.results || [];
}

function tempRes_(kind) {
  return 'customers/' + customerId_() + '/' + kind + '/-1';
}

// ---------- Sheet helpers (shared with MetaSync) ----------

function sheetTable_(ss, name) {
  var sh = ss.getSheetByName(name);
  var values = sh.getDataRange().getValues();
  var headers = values[0].map(String);
  var col = {};
  headers.forEach(function (h, i) { col[h] = i; });
  var rows = [];
  // data starts at row 3 (row 2 holds the spec/limits row)
  for (var r = 2; r < values.length; r++) {
    (function (rowIdx) {
      var v = values[rowIdx];
      if (v.join('') === '') return;
      rows.push({
        get: function (h) { return col[h] === undefined ? '' : String(v[col[h]]).trim(); },
        write: function (h, val) { if (col[h] !== undefined) sh.getRange(rowIdx + 1, col[h] + 1).setValue(val); }
      });
    })(r);
  }
  return { rows: rows };
}

function collect_(row, prefix, max) {
  var out = [];
  for (var i = 1; i <= max; i++) {
    var v = row.get(prefix + i);
    if (v) out.push(v);
  }
  return out;
}

function dateStr_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return String(v);
}

function trim_(e) {
  return String(e && e.message || e).slice(0, 400);
}
