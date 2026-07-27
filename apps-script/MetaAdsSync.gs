/**
 * Meta Ads sync — reads the Ad Operations Master sheet and launches
 * campaigns, ad sets and ads via the Meta Marketing (Graph) API.
 *
 * Setup (once):
 *   1. Same Apps Script project as GoogleAdsSync.gs.
 *   2. Project Settings > Script Properties, add:
 *        META_ACCESS_TOKEN   system-user token with ads_management (Business Manager)
 *        META_AD_ACCOUNT_ID  digits only, no "act_" prefix
 *        META_PAGE_ID        the Facebook Page the ads run from
 *        META_IG_ACCOUNT_ID  Instagram actor id (optional, for IG placements)
 *        META_COUNTRIES      default geo targeting, e.g. AU or AU,NZ
 *   3. Add an hourly time-driven trigger for syncMetaAds.
 *
 * Behaviour:
 *   - Campaigns tab: platform=meta, status=READY, empty api_id -> creates PAUSED campaign.
 *   - Meta_Ads tab: status=READY, empty api_id -> creates/reuses the ad set (by name),
 *     builds the creative from the row, creates the ad PAUSED, writes ids back.
 *   - Detailed targeting/audiences are refined in Ads Manager after upload.
 */

var META_API = 'https://graph.facebook.com/v23.0';

var META_OBJECTIVES = {
  sales: 'OUTCOME_SALES', leads: 'OUTCOME_LEADS', traffic: 'OUTCOME_TRAFFIC',
  awareness: 'OUTCOME_AWARENESS', engagement: 'OUTCOME_ENGAGEMENT', app: 'OUTCOME_APP_PROMOTION'
};

var META_CTA = {
  'Learn More': 'LEARN_MORE', 'Shop Now': 'SHOP_NOW', 'Sign Up': 'SIGN_UP',
  'Download': 'DOWNLOAD', 'Contact Us': 'CONTACT_US', 'Apply Now': 'APPLY_NOW',
  'Book Now': 'BOOK_NOW', 'Get Offer': 'GET_OFFER', 'Get Quote': 'GET_QUOTE',
  'Subscribe': 'SUBSCRIBE', 'Order Now': 'ORDER_NOW', 'Send Message': 'MESSAGE_PAGE',
  'Watch More': 'WATCH_MORE'
};

// placement key -> [publisher_platform, position field, position value]
var META_PLACEMENTS = {
  'fb-feed':    ['facebook',  'facebook_positions',  'feed'],
  'fb-stories': ['facebook',  'facebook_positions',  'story'],
  'ig-feed':    ['instagram', 'instagram_positions', 'stream'],
  'ig-stories': ['instagram', 'instagram_positions', 'story'],
  'ig-reels':   ['instagram', 'instagram_positions', 'reels']
};

function syncMetaAds() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  syncMetaCampaigns_(ss);
  syncMetaAdRows_(ss);
}

// ---------- Campaigns ----------

function syncMetaCampaigns_(ss) {
  var tab = sheetTable_(ss, 'Campaigns');
  tab.rows.forEach(function (row) {
    if (row.get('platform') !== 'meta') return;
    if (row.get('status') !== 'READY' || row.get('api_id')) return;

    try {
      var res = metaPost_('/act_' + metaProp_('META_AD_ACCOUNT_ID') + '/campaigns', {
        name: row.get('campaign_name'),
        objective: META_OBJECTIVES[row.get('campaign_type')] || 'OUTCOME_TRAFFIC',
        status: 'PAUSED',
        special_ad_categories: JSON.stringify([])
      });
      row.write('api_id', res.id);
      row.write('api_status', 'UPLOADED (paused)');
    } catch (e) {
      row.write('api_status', 'ERROR: ' + trim_(e));
    }
    row.write('last_synced', new Date());
  });
}

// ---------- Ads ----------

function syncMetaAdRows_(ss) {
  var camps = sheetTable_(ss, 'Campaigns');
  var campById = {};
  camps.rows.forEach(function (r) { campById[r.get('campaign_id')] = r; });

  var assets = assetMap_(ss);
  var tab = sheetTable_(ss, 'Meta_Ads');

  tab.rows.forEach(function (row) {
    if (row.get('status') !== 'READY' || row.get('api_id')) return;

    var camp = campById[row.get('campaign_id')];
    if (!camp || !camp.get('api_id') || camp.get('platform') !== 'meta') {
      row.write('api_status', 'ERROR: campaign not uploaded yet (' + row.get('campaign_id') + ')');
      row.write('last_synced', new Date());
      return;
    }

    try {
      var adsetId = findOrCreateAdSet_(camp, row);
      var creativeId = createCreative_(row, assets);
      var ad = metaPost_('/act_' + metaProp_('META_AD_ACCOUNT_ID') + '/ads', {
        name: row.get('ad_id') + ' ' + (row.get('headline_1') || ''),
        adset_id: adsetId,
        creative: JSON.stringify({ creative_id: creativeId }),
        status: 'PAUSED'
      });
      row.write('api_id', ad.id);
      row.write('api_status', 'UPLOADED (paused, adset ' + adsetId + ')');
    } catch (e) {
      row.write('api_status', 'ERROR: ' + trim_(e));
    }
    row.write('last_synced', new Date());
  });
}

function findOrCreateAdSet_(camp, row) {
  var name = row.get('adset_name') || (camp.get('campaign_name') + ' ad set');
  var acct = '/act_' + metaProp_('META_AD_ACCOUNT_ID');

  var existing = metaGet_(acct + '/adsets', {
    fields: 'id,name',
    filtering: JSON.stringify([
      { field: 'name', operator: 'EQUAL', value: name },
      { field: 'campaign.id', operator: 'EQUAL', value: camp.get('api_id') }
    ])
  });
  if (existing.data && existing.data.length) return existing.data[0].id;

  var targeting = { geo_locations: { countries: metaProp_('META_COUNTRIES', 'AU').split(',').map(function (c) { return c.trim(); }) } };
  var placements = row.get('placements');
  if (placements) {
    var platforms = {}, positions = {};
    placements.split(',').forEach(function (p) {
      var m = META_PLACEMENTS[p.trim()];
      if (!m) return;
      platforms[m[0]] = true;
      positions[m[1]] = positions[m[1]] || {};
      positions[m[1]][m[2]] = true;
    });
    targeting.publisher_platforms = Object.keys(platforms);
    Object.keys(positions).forEach(function (f) { targeting[f] = Object.keys(positions[f]); });
  } // blank placements = Advantage+ (Meta chooses)

  var params = {
    name: name,
    campaign_id: camp.get('api_id'),
    daily_budget: String(Math.round(Number(camp.get('daily_budget') || 10) * 100)),
    billing_event: 'IMPRESSIONS',
    optimization_goal: 'LINK_CLICKS',
    bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
    targeting: JSON.stringify(targeting),
    status: 'PAUSED'
  };
  if (camp.get('start_date')) params.start_time = dateStr_(camp.get('start_date')) + 'T00:00:00+10:00';
  if (camp.get('end_date')) params.end_time = dateStr_(camp.get('end_date')) + 'T23:59:00+10:00';

  return metaPost_(acct + '/adsets', params).id;
}

function createCreative_(row, assets) {
  var media = row.get('media_asset_1');
  var imageUrl = assets[media] || media; // asset_id lookup, else assume it's already a URL

  var linkData = {
    link: row.get('destination_url'),
    message: row.get('primary_text_1'),
    name: row.get('headline_1'),
    description: row.get('description'),
    call_to_action: {
      type: META_CTA[row.get('cta')] || 'LEARN_MORE',
      value: { link: row.get('destination_url') }
    }
  };
  if (imageUrl) linkData.picture = imageUrl;
  if (row.get('display_link')) linkData.caption = row.get('display_link');

  var storySpec = { page_id: metaProp_('META_PAGE_ID'), link_data: linkData };
  var ig = metaProp_('META_IG_ACCOUNT_ID', '');
  if (ig) storySpec.instagram_actor_id = ig;

  var params = {
    name: row.get('ad_id') + ' creative',
    object_story_spec: JSON.stringify(storySpec)
  };

  // Extra text variations -> Advantage+ multiple text options
  var bodies = collect_(row, 'primary_text_', 5);
  var titles = collect_(row, 'headline_', 5);
  if (row.get('advantage_plus_creative') === 'TRUE' && (bodies.length > 1 || titles.length > 1)) {
    params.asset_feed_spec = JSON.stringify({
      bodies: bodies.map(function (t) { return { text: t }; }),
      titles: titles.map(function (t) { return { text: t }; }),
      optimization_type: 'DEGREES_OF_FREEDOM'
    });
  }

  return metaPost_('/act_' + metaProp_('META_AD_ACCOUNT_ID') + '/adcreatives', params).id;
}

function assetMap_(ss) {
  var map = {};
  sheetTable_(ss, 'Assets').rows.forEach(function (r) {
    if (r.get('asset_id')) map[r.get('asset_id')] = r.get('url');
  });
  return map;
}

// ---------- Graph API helpers ----------

function metaProp_(key, fallback) {
  var v = PropertiesService.getScriptProperties().getProperty(key);
  if (!v && fallback === undefined) throw new Error('Missing script property ' + key);
  return v || fallback;
}

function metaPost_(path, params) {
  params.access_token = metaProp_('META_ACCESS_TOKEN');
  var resp = UrlFetchApp.fetch(META_API + path, { method: 'post', payload: params, muteHttpExceptions: true });
  var body = JSON.parse(resp.getContentText());
  if (body.error) throw new Error(body.error.error_user_msg || body.error.message);
  return body;
}

function metaGet_(path, params) {
  params.access_token = metaProp_('META_ACCESS_TOKEN');
  var qs = Object.keys(params).map(function (k) { return k + '=' + encodeURIComponent(params[k]); }).join('&');
  var resp = UrlFetchApp.fetch(META_API + path + '?' + qs, { muteHttpExceptions: true });
  var body = JSON.parse(resp.getContentText());
  if (body.error) throw new Error(body.error.error_user_msg || body.error.message);
  return body;
}
