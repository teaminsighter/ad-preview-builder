'use client';

import { useState, useEffect, useRef } from 'react';
import GoogleSearchAd from '@/components/previews/GoogleSearchAd';
import GoogleDisplayAd from '@/components/previews/GoogleDisplayAd';
import YouTubeInStreamAd from '@/components/previews/YouTubeInStreamAd';
import YouTubeShortsAd from '@/components/previews/YouTubeShortsAd';
import GmailAd from '@/components/previews/GmailAd';
import DiscoverAd from '@/components/previews/DiscoverAd';
import GoogleShoppingAd from '@/components/previews/GoogleShoppingAd';
import PMaxAssetGroup from '@/components/campaigns/PMaxAssetGroup';
import DemandGenCampaign from '@/components/campaigns/DemandGenCampaign';
import VideoCampaign from '@/components/campaigns/VideoCampaign';
import DisplayCampaign from '@/components/campaigns/DisplayCampaign';
import { nodeToPngDataUrl } from '@/components/campaigns/ui';
import ShoppingCampaign from '@/components/campaigns/ShoppingCampaign';
import MetaFeedAd from '@/components/previews/MetaFeedAd';
import InstagramFeedAd from '@/components/previews/InstagramFeedAd';
import InstagramStoryAd from '@/components/previews/InstagramStoryAd';
import InstagramReelsAd from '@/components/previews/InstagramReelsAd';
import FacebookStoriesAd from '@/components/previews/FacebookStoriesAd';
import MetaAllPlacements from '@/components/previews/MetaAllPlacements';
import TikTokFeedAd from '@/components/previews/TikTokFeedAd';
import BingSearchAd from '@/components/previews/BingSearchAd';
import BingAudienceAd from '@/components/previews/BingAudienceAd';
import ImageUpload from '@/components/ImageUpload';
import MetaMediaUpload from '@/components/MetaMediaUpload';
import { META_SPECS, META_TEXT_LIMITS, CAROUSEL_SPEC, MediaKind, looksLikeVideoUrl } from '@/lib/metaSpecs';
import { TIKTOK_SPEC, TIKTOK_TEXT_LIMITS, TIKTOK_MIN_BITRATE, TIKTOK_CTAS } from '@/lib/tiktokSpecs';
import { BING_RSA, BING_AUDIENCE, BING_AUDIENCE_IMAGE } from '@/lib/bingSpecs';
import { encodeShareData, decodeShareData, downscaleImage } from '@/lib/shareLink';

type Platform = 'google' | 'meta' | 'tiktok' | 'bing' | 'utm' | 'library';
type GoogleAdType = 'search' | 'display' | 'youtube-instream' | 'youtube-shorts' | 'gmail' | 'discover' | 'shopping';
type GoogleCampaignType = 'pmax' | 'search' | 'demand-gen' | 'video' | 'display' | 'shopping';
type MetaAdType = 'fb-feed' | 'fb-stories' | 'ig-feed' | 'ig-stories' | 'ig-reels';
type BingAdType = 'search' | 'audience';

// Ad Library results (mapped by the Cloudflare Pages Functions in /functions/api)
interface MetaLibAd {
  id?: string;
  page_name?: string;
  ad_creative_bodies?: string[];
  ad_creative_link_titles?: string[];
  ad_delivery_start_time?: string;
  ad_snapshot_url?: string;
  publisher_platforms?: string[];
  image?: string;
}
interface FoundCompetitor {
  page_name: string;
  page_id?: string;
  ad_count: number;
  image?: string;
  sample_text?: string;
}

interface GoogleLibAd {
  advertiser?: string;
  format?: string;
  image?: string;
  link?: string;
  details_link?: string;
  first_shown?: string;
  last_shown?: string;
  target_domain?: string;
}

// UTM Parameter presets
const utmSourceOptions = ['google', 'facebook', 'instagram', 'twitter', 'linkedin', 'email', 'newsletter', 'bing', 'youtube', 'tiktok'];
const utmMediumOptions = ['cpc', 'cpm', 'social', 'email', 'organic', 'referral', 'display', 'video', 'affiliate', 'banner'];
const utmCampaignPresets = ['spring_sale', 'summer_promo', 'black_friday', 'brand_awareness', 'product_launch', 'retargeting'];

const googleAdTypes: { id: GoogleAdType; label: string }[] = [
  { id: 'search', label: 'Search' },
  { id: 'display', label: 'Display' },
  { id: 'youtube-instream', label: 'YouTube' },
  { id: 'youtube-shorts', label: 'Shorts' },
  { id: 'gmail', label: 'Gmail' },
  { id: 'discover', label: 'Discover' },
  { id: 'shopping', label: 'Shopping' },
];

// Google campaign types (mirrors the Google Ads campaign creation screen).
// Each campaign type maps to the placement formats it can serve on.
const googleCampaignTypes: {
  id: GoogleCampaignType;
  label: string;
  description: string;
  channels: string[];
  formats: GoogleAdType[];
}[] = [
  {
    id: 'pmax',
    label: 'Performance Max',
    description: "Drive website traffic by reaching the right people wherever they're browsing with ads on Google Search, YouTube, Display, and more",
    channels: ['google', 'youtube', 'gmail', 'maps', 'display'],
    formats: ['search', 'display', 'youtube-instream', 'youtube-shorts', 'gmail', 'discover', 'shopping'],
  },
  {
    id: 'search',
    label: 'Search',
    description: 'Drive website traffic from Google Search with text ads',
    channels: ['google'],
    formats: ['search'],
  },
  {
    id: 'demand-gen',
    label: 'Demand Gen',
    description: 'Drive demand and conversions on YouTube, Google Display Network, and more with image and video ads',
    channels: ['youtube', 'gmail', 'maps', 'display'],
    formats: ['discover', 'gmail', 'youtube-instream', 'youtube-shorts'],
  },
  {
    id: 'video',
    label: 'Video',
    description: 'Drive website traffic from YouTube with your video ads',
    channels: ['youtube', 'display'],
    formats: ['youtube-instream', 'youtube-shorts'],
  },
  {
    id: 'display',
    label: 'Display',
    description: 'Reach potential customers across 3 million sites and apps with your creative',
    channels: ['youtube', 'gmail', 'display'],
    formats: ['display'],
  },
  {
    id: 'shopping',
    label: 'Shopping',
    description: 'Promote your products from Merchant Center on Google Search with Shopping ads',
    channels: ['google'],
    formats: ['shopping'],
  },
];

// Small colored channel icons shown on campaign type cards
const channelIcon = (key: string) => {
  switch (key) {
    case 'google':
      return (
        <svg key={key} className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      );
    case 'youtube':
      return (
        <svg key={key} className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
          <path fill="#FFFFFF" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    case 'gmail':
      return (
        <svg key={key} className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#EA4335" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
        </svg>
      );
    case 'maps':
      return (
        <svg key={key} className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#34A853" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle fill="#FFFFFF" cx="12" cy="9" r="2.5"/>
        </svg>
      );
    case 'display':
      return (
        <svg key={key} className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2">
          <rect x="3" y="4" width="18" height="14" rx="2"/>
          <path strokeLinecap="round" d="M8 21h8"/>
        </svg>
      );
    default:
      return null;
  }
};

const metaAdTypes: { id: MetaAdType; label: string }[] = [
  { id: 'fb-feed', label: 'FB Feed' },
  { id: 'fb-stories', label: 'FB Stories' },
  { id: 'ig-feed', label: 'IG Feed' },
  { id: 'ig-stories', label: 'IG Stories' },
  { id: 'ig-reels', label: 'Reels' },
];

export default function Home() {
  const [platform, setPlatform] = useState<Platform>('google');
  const [googleCampaignType, setGoogleCampaignType] = useState<GoogleCampaignType>('search');
  const [googleAdType, setGoogleAdType] = useState<GoogleAdType>('search');
  const [metaAdType, setMetaAdType] = useState<MetaAdType>('fb-feed');
  // Ads Manager-style view: 'all' shows every placement in a grid; picking a
  // specific placement shows the single large preview (and drives media specs)
  const [metaView, setMetaView] = useState<'all' | MetaAdType>('all');
  // Feed preview device: mobile truncates text like a phone, desktop shows
  // full text and pillarboxes vertical media — mirroring Meta's View preview
  const [metaDevice, setMetaDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [bingAdType, setBingAdType] = useState<BingAdType>('search');

  // Microsoft Advertising (Bing) state — RSA + Audience Network
  const [bingFinalUrl, setBingFinalUrl] = useState('');
  const [bingPath1, setBingPath1] = useState('');
  const [bingPath2, setBingPath2] = useState('');
  const [bingHeadlines, setBingHeadlines] = useState<string[]>(Array(BING_RSA.headlineCount).fill(''));
  const [bingDescriptions, setBingDescriptions] = useState<string[]>(Array(BING_RSA.descriptionCount).fill(''));
  const [visibleBingHeadlines, setVisibleBingHeadlines] = useState(3);
  const [visibleBingDescriptions, setVisibleBingDescriptions] = useState(2);
  const [bingBusinessName, setBingBusinessName] = useState('');
  const [bingShortHeadline, setBingShortHeadline] = useState('');
  const [bingLongHeadline, setBingLongHeadline] = useState('');
  const [bingText, setBingText] = useState('');
  const [bingImageUrl, setBingImageUrl] = useState('');

  // TikTok state — dedicated media slot (video-first) and CTA
  const [tiktokMediaUrl, setTiktokMediaUrl] = useState('');
  const [tiktokMediaKind, setTiktokMediaKind] = useState<MediaKind>('video');
  const [tiktokCta, setTiktokCta] = useState('Learn More');

  // Switch campaign type; snap the ad format to one the campaign supports
  const selectCampaignType = (id: GoogleCampaignType) => {
    setGoogleCampaignType(id);
    const campaign = googleCampaignTypes.find(c => c.id === id);
    if (campaign && !campaign.formats.includes(googleAdType)) {
      setGoogleAdType(campaign.formats[0]);
    }
  };

  // Sign-in gate (single team password, no sign-up). Enabled only when
  // APP_PASSWORD is configured in the Cloudflare environment; the gate is
  // skipped for shared preview links so recipients can always view them.
  const [authEnabled, setAuthEnabled] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authToken, setAuthToken] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);

  useEffect(() => {
    setAuthToken(localStorage.getItem('adpvAuthToken') || '');
    fetch('/api/login')
      .then(r => r.json())
      .then(d => { setAuthEnabled(!!d.enabled); setAuthChecked(true); })
      .catch(() => { setAuthEnabled(false); setAuthChecked(true); });
  }, []);

  const tokenValid = (t: string) => {
    const expiry = Number((t || '').split('.')[0]);
    return !!t && Number.isFinite(expiry) && expiry > Date.now();
  };

  const doLogin = async () => {
    if (loginBusy || !loginPassword) return;
    setLoginBusy(true);
    setLoginError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password: loginPassword }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('adpvAuthToken', data.token);
        setAuthToken(data.token);
        setLoginPassword('');
      } else {
        setLoginError('Wrong password — try again.');
      }
    } catch {
      setLoginError('Could not reach the server.');
    }
    setLoginBusy(false);
  };

  const signOut = () => {
    localStorage.removeItem('adpvAuthToken');
    setAuthToken('');
  };

  // Shared-preview mode: set when the page is opened via a #s=... share link.
  // The recipient sees a read-only preview; auto-save is paused so their own
  // draft isn't overwritten until they explicitly open the ad in the builder.
  const [sharedView, setSharedView] = useState(false);
  const [shareState, setShareState] = useState<'idle' | 'busy' | 'copied' | 'failed'>('idle');
  // Google campaign-builder data carried by a share link (PMax, Demand Gen, …).
  // Held here until the recipient explicitly opens it in the builder — only
  // then is it written into their localStorage store.
  const [sharedCampaignStore, setSharedCampaignStore] = useState<{ key: string; value: unknown } | null>(null);

  // Dark mode removed — it caused white-on-white text with the light-styled
  // components; ensure no stale class lingers from previous sessions
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  // Google Ads State
  const [businessName, setBusinessName] = useState('');
  const [businessLogoUrl, setBusinessLogoUrl] = useState('');
  const [headlines, setHeadlines] = useState<string[]>(Array(15).fill(''));
  const [descriptions, setDescriptions] = useState<string[]>(Array(4).fill(''));
  const [displayUrl, setDisplayUrl] = useState('');
  const [finalUrl, setFinalUrl] = useState('');
  const [path1, setPath1] = useState('');
  const [path2, setPath2] = useState('');

  // Sitelinks (up to 8, with 25 char title, 35 char descriptions)
  const [sitelinks, setSitelinks] = useState<{ title: string; description1: string; description2: string; url: string }[]>(
    Array(8).fill(null).map(() => ({ title: '', description1: '', description2: '', url: '' }))
  );

  // Callouts (up to 10, 25 chars each)
  const [callouts, setCallouts] = useState<string[]>(Array(10).fill(''));

  // Structured Snippets
  const [snippetHeader, setSnippetHeader] = useState('Types');
  const [snippetValues, setSnippetValues] = useState<string[]>(Array(10).fill(''));

  // Call Asset
  const [phoneNumber, setPhoneNumber] = useState('');

  // Price Assets (min 3, up to 8)
  const [priceAssets, setPriceAssets] = useState<{ header: string; description: string; price: string; unit: string }[]>(
    Array(5).fill(null).map(() => ({ header: '', description: '', price: '', unit: '' }))
  );

  // Promotion Asset
  const [promotion, setPromotion] = useState({
    occasion: 'None',
    promotionType: 'none' as 'monetary' | 'percentage' | 'none',
    promotionValue: '',
    item: '',
  });

  // Image Assets (up to 4)
  const [searchImageUrls, setSearchImageUrls] = useState<string[]>(['', '', '', '']);

  // Shopping Product (Shopping / Performance Max campaigns)
  const [productTitle, setProductTitle] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStore, setProductStore] = useState('');
  const [productImageUrl, setProductImageUrl] = useState('');
  const [productRating, setProductRating] = useState('');
  const [productReviewCount, setProductReviewCount] = useState('');
  const [productShipping, setProductShipping] = useState('');

  // Active editor section (for non-search types)
  const [activeAssetSection, setActiveAssetSection] = useState<string>('headlines');

  // Visible headline/description count (start with 5 headlines, 2 descriptions)
  const [visibleHeadlines, setVisibleHeadlines] = useState(5);
  const [visibleDescriptions, setVisibleDescriptions] = useState(2);
  const [visibleSitelinks, setVisibleSitelinks] = useState(2);
  const [visibleCallouts, setVisibleCallouts] = useState(4);

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    headlines: true,
    descriptions: true,
    images: false,
    sitelinks: false,
    promotions: false,
    prices: false,
    calls: false,
    callouts: false,
    snippets: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const [imageUrl, setImageUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [ctaText, setCtaText] = useState('Learn More');
  const [displaySize, setDisplaySize] = useState<'medium-rectangle' | 'leaderboard' | 'large-rectangle'>('medium-rectangle');

  // Structured snippet header options
  const snippetHeaders = [
    'Amenities', 'Brands', 'Courses', 'Degree programs', 'Destinations',
    'Featured hotels', 'Insurance coverage', 'Models', 'Neighborhoods',
    'Service catalog', 'Shows', 'Styles', 'Types'
  ];

  // Promotion occasions
  const promotionOccasions = [
    'None', 'New Year', 'Valentine\'s Day', 'Easter', 'Mother\'s Day',
    'Father\'s Day', 'Labor Day', 'Back to School', 'Halloween',
    'Black Friday', 'Cyber Monday', 'Christmas', 'Boxing Day',
    'Chinese New Year', 'Carnival', 'Diwali', 'Eid', 'Independence Day',
    'End of Season', 'Winter Sale', 'Summer Sale', 'Fall Sale', 'Spring Sale'
  ];

  // Price units
  const priceUnits = ['', 'hour', 'day', 'week', 'month', 'year', 'night', 'item', 'session'];

  // Meta Ads State
  const [metaAdName, setMetaAdName] = useState('');
  const [partnershipAd, setPartnershipAd] = useState(false);
  const [pageName, setPageName] = useState('');
  const [instagramAccount, setInstagramAccount] = useState('');
  const [pageImageUrl, setPageImageUrl] = useState('');

  // Ad setup (mirrors Ads Manager: creative source + format)
  const [metaCreativeSource, setMetaCreativeSource] = useState<'manual' | 'catalogue'>('manual');
  const [metaFormat, setMetaFormat] = useState<'single' | 'carousel'>('single');
  const [multiAdvertiser, setMultiAdvertiser] = useState(false);

  // Browser add-ons (Destination section)
  const [browserAddon, setBrowserAddon] = useState<'none' | 'call' | 'messenger' | 'whatsapp' | 'instant-form'>('none');

  // Primary Text variations (up to 5)
  const [primaryTexts, setPrimaryTexts] = useState<string[]>(Array(5).fill(''));
  const [visiblePrimaryTexts, setVisiblePrimaryTexts] = useState(2);

  // Headline variations (up to 5)
  const [metaHeadlines, setMetaHeadlines] = useState<string[]>(Array(5).fill(''));
  const [visibleMetaHeadlines, setVisibleMetaHeadlines] = useState(2);

  // Description
  const [metaDescription, setMetaDescription] = useState('');

  // Legacy single fields (for backward compatibility)
  const [username, setUsername] = useState('');
  const [primaryText, setPrimaryText] = useState('');
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [caption, setCaption] = useState('');

  // Media — Ads Manager supports up to 10 media per ad
  const [metaMediaUrls, setMetaMediaUrls] = useState<string[]>(Array(10).fill(''));
  const [metaMediaKinds, setMetaMediaKinds] = useState<MediaKind[]>(Array(10).fill('image'));
  // Probed aspect ratio (w/h) per media slot — lets previews auto-pick the
  // best-fitting media per placement, like Meta's placement customisation
  const [metaMediaRatios, setMetaMediaRatios] = useState<(number | null)[]>(Array(10).fill(null));
  const [metaImageUrl, setMetaImageUrl] = useState('');

  // Probe each media's natural dimensions whenever a slot changes
  useEffect(() => {
    metaMediaUrls.forEach((url, i) => {
      const record = (ratio: number | null) => {
        setMetaMediaRatios(prev => {
          if (prev[i] === ratio || (ratio !== null && prev[i] !== null && Math.abs(prev[i]! - ratio) < 0.001)) return prev;
          return prev.map((r, j) => (j === i ? ratio : r));
        });
      };
      if (!url) {
        record(null);
        return;
      }
      if (metaMediaKinds[i] === 'video' || looksLikeVideoUrl(url)) {
        const v = document.createElement('video');
        v.preload = 'metadata';
        v.onloadedmetadata = () => {
          if (v.videoWidth && v.videoHeight) record(v.videoWidth / v.videoHeight);
        };
        v.src = url;
      } else {
        const img = new Image();
        img.onload = () => {
          if (img.naturalWidth && img.naturalHeight) record(img.naturalWidth / img.naturalHeight);
        };
        img.src = url;
      }
    });
  }, [metaMediaUrls, metaMediaKinds]);

  // CTA and Destination
  const [metaCtaText, setMetaCtaText] = useState('Learn More');
  const [metaDestinationUrl, setMetaDestinationUrl] = useState('');
  const [linkDisplay, setLinkDisplay] = useState('');

  // Advantage+ Creative (2026 update)
  const [advantagePlusCreative, setAdvantagePlusCreative] = useState(true);
  const [textGeneration, setTextGeneration] = useState(false);
  const [optimizeTextPerPerson, setOptimizeTextPerPerson] = useState(true);

  // Customer Lifecycle Strategy (2026 update)
  const [lifecycleStrategy, setLifecycleStrategy] = useState<'all' | 'new-customers'>('all');

  // Expanded sections for Meta (ordered like Ads Manager)
  const [metaExpandedSections, setMetaExpandedSections] = useState<Record<string, boolean>>({
    adName: true,
    identity: true,
    adSetup: true,
    destination: true,
    media: true,
    primaryText: true,
    headlines: true,
    description: false,
    advantagePlus: false,
    specs: false,
  });

  const toggleMetaSection = (section: string) => {
    setMetaExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Remove a text variation (Ads Manager-style ✕ button): splice and keep array length
  const removePrimaryText = (index: number) => {
    setPrimaryTexts(prev => {
      const next = prev.filter((_, i) => i !== index);
      next.push('');
      return next;
    });
    setVisiblePrimaryTexts(v => Math.max(1, v - 1));
  };

  const removeMetaHeadline = (index: number) => {
    setMetaHeadlines(prev => {
      const next = prev.filter((_, i) => i !== index);
      next.push('');
      return next;
    });
    setVisibleMetaHeadlines(v => Math.max(1, v - 1));
  };

  const setMediaAt = (index: number, url: string, kind: MediaKind) => {
    setMetaMediaUrls(prev => {
      const next = [...prev];
      next[index] = url;
      return next;
    });
    setMetaMediaKinds(prev => {
      const next = [...prev];
      next[index] = kind;
      return next;
    });
    if (index === 0) setMetaImageUrl(url);
  };

  // In-app Ad Library search — backed by Cloudflare Pages Functions
  // (/api/meta-ads → Meta ads_archive, /api/google-ads → SerpApi Transparency)
  const [libProvider, setLibProvider] = useState<'meta' | 'google'>('meta');
  const [libQuery, setLibQuery] = useState('');
  const [libCountry, setLibCountry] = useState('NZ');
  const [libStatus, setLibStatus] = useState<'ACTIVE' | 'ALL'>('ACTIVE');
  const [libLoading, setLibLoading] = useState(false);
  const [libError, setLibError] = useState<'' | 'not_configured' | 'backend' | 'api'>('');
  const [libErrorDetail, setLibErrorDetail] = useState('');
  const [libMetaAds, setLibMetaAds] = useState<MetaLibAd[]>([]);
  const [libGoogleAds, setLibGoogleAds] = useState<GoogleLibAd[]>([]);
  const [libSearched, setLibSearched] = useState(false);

  // Competitor discovery state
  const [findQuery, setFindQuery] = useState('');
  const [findLoading, setFindLoading] = useState(false);
  const [findError, setFindError] = useState('');
  const [findResult, setFindResult] = useState<{ keyword_used: string; competitors: FoundCompetitor[]; ads_scanned: number } | null>(null);

  const findCompetitors = async () => {
    if (!findQuery.trim() || findLoading) return;
    setFindLoading(true);
    setFindError('');
    setFindResult(null);
    try {
      const params = new URLSearchParams({ q: findQuery.trim(), country: libCountry });
      const res = await fetch(`/api/find-competitors?${params.toString()}`, {
        headers: authToken ? { 'x-auth': authToken } : undefined,
      });
      const data = await res.json().catch(() => null);
      if (!data) throw new Error('backend');
      if (data.error) {
        setFindError(data.message || (data.error === 'not_configured' ? 'The Meta library key (APIFY_TOKEN) must be configured first.' : data.error));
      } else {
        setFindResult(data);
      }
    } catch {
      setFindError('The discovery API runs on the deployed site — try this on adpreview.insighter.digital.');
    }
    setFindLoading(false);
  };

  const searchAdLibrary = async (overrideQuery?: string, overrideProvider?: 'meta' | 'google') => {
    const query = (overrideQuery ?? libQuery).trim();
    const provider = overrideProvider ?? libProvider;
    if (!query || libLoading) return;
    if (overrideQuery !== undefined) setLibQuery(overrideQuery);
    if (overrideProvider) setLibProvider(overrideProvider);
    setLibLoading(true);
    setLibError('');
    setLibErrorDetail('');
    setLibSearched(true);
    try {
      const params = new URLSearchParams({ q: query, country: libCountry });
      if (provider === 'meta') params.set('status', libStatus);
      const res = await fetch(`/api/${provider === 'meta' ? 'meta-ads' : 'google-ads'}?${params.toString()}`, {
        headers: authToken ? { 'x-auth': authToken } : undefined,
      });
      const data = await res.json().catch(() => null);
      if (!data) throw new Error('backend');
      if (data.error === 'not_configured') {
        setLibError('not_configured');
      } else if (data.error) {
        setLibError('api');
        setLibErrorDetail(data.message || data.error);
      } else if (provider === 'meta') {
        setLibMetaAds(data.ads || []);
      } else {
        setLibGoogleAds(data.ads || []);
      }
    } catch {
      setLibError('backend');
    }
    setLibLoading(false);
  };

  // UTM Builder State
  const [utmBaseUrl, setUtmBaseUrl] = useState('');
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [utmTerm, setUtmTerm] = useState('');
  const [utmContent, setUtmContent] = useState('');
  const [utmHistory, setUtmHistory] = useState<string[]>([]);

  // Generate UTM URL
  const generateUtmUrl = () => {
    if (!utmBaseUrl) return '';

    const params = new URLSearchParams();
    if (utmSource) params.set('utm_source', utmSource);
    if (utmMedium) params.set('utm_medium', utmMedium);
    if (utmCampaign) params.set('utm_campaign', utmCampaign);
    if (utmTerm) params.set('utm_term', utmTerm);
    if (utmContent) params.set('utm_content', utmContent);

    const paramString = params.toString();
    if (!paramString) return utmBaseUrl;

    const separator = utmBaseUrl.includes('?') ? '&' : '?';
    return `${utmBaseUrl}${separator}${paramString}`;
  };

  // Copy UTM URL
  const copyUtmUrl = async () => {
    const url = generateUtmUrl();
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      // Add to history
      setUtmHistory(prev => {
        const newHistory = [url, ...prev.filter(u => u !== url)].slice(0, 10);
        return newHistory;
      });
      alert('URL copied to clipboard!');
    } catch {
      alert('Failed to copy');
    }
  };

  // Clear UTM form
  const clearUtmForm = () => {
    setUtmSource('');
    setUtmMedium('');
    setUtmCampaign('');
    setUtmTerm('');
    setUtmContent('');
  };

  // Meta CTA Options (30+ options based on objective)
  const metaCtaOptions = [
    'Learn More', 'See Details', 'Shop Now', 'Sign Up', 'Download', 'Contact Us',
    'Apply Now', 'Book Now', 'Buy Tickets', 'Call Now', 'Donate Now',
    'Get Offer', 'Get Directions', 'Get Quote', 'Get Showtimes', 'Install Now',
    'Listen Now', 'Order Now', 'Play Game', 'Request Time', 'See Menu',
    'Send Message', 'Send WhatsApp Message', 'Subscribe', 'Watch More', 'Use App',
    'Open Link', 'Save', 'Start Order', 'View Event', 'Vote Now'
  ];

  // File input ref for CSV import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview panel ref for export
  const previewRef = useRef<HTMLDivElement>(null);

  // Export preview as image
  const exportAsImage = async () => {
    if (!previewRef.current) return;

    try {
      const dataUrl = await nodeToPngDataUrl(previewRef.current, { backgroundColor: '#ffffff' });

      const link = document.createElement('a');
      link.download = `ad-preview-${platform}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Failed to export image. Please try again.');
    }
  };

  // Export preview as PDF
  const exportAsPDF = async () => {
    if (!previewRef.current) return;

    try {
      const dataUrl = await nodeToPngDataUrl(previewRef.current, { backgroundColor: '#ffffff' });

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = dataUrl;
      });

      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({
        orientation: img.width > img.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [img.width, img.height],
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height);
      pdf.save(`ad-preview-${platform}-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  // Build a shareable preview link: compress the whole ad into the URL hash
  // and copy it to the clipboard. Uploaded images are shrunk to fit; uploaded
  // videos are stored in R2 and referenced by URL (dropped if R2 is absent).
  const shareAdPreview = async () => {
    if (shareState === 'busy') return;
    setShareState('busy');
    try {
      const data = { ...getAdData() };
      // Blob videos can't travel inside a link — upload each to R2 via
      // /api/upload-media and share the permanent /media/<key> URL instead.
      // If the bucket isn't configured or an upload fails, that video is
      // dropped from the link as before.
      let videosDropped = false;
      const uploadBlobVideo = async (blobUrl: string): Promise<string> => {
        try {
          const blob = await (await fetch(blobUrl)).blob();
          // Content hash lets the server dedupe: re-sharing the same video
          // reuses the stored copy instead of uploading a new one.
          const digest = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
          const hash = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
          const res = await fetch('/api/upload-media', {
            method: 'POST',
            headers: {
              'content-type': blob.type || 'video/mp4',
              'x-media-hash': hash,
              ...(authToken ? { 'x-auth': authToken } : {}),
            },
            body: blob,
          });
          const out = await res.json().catch(() => null);
          if (res.ok && out?.url) return out.url as string;
        } catch { /* fall through to drop */ }
        videosDropped = true;
        return '';
      };
      data.metaMediaUrls = await Promise.all(
        metaMediaUrls.map(u => (u.startsWith('blob:') ? uploadBlobVideo(u) : Promise.resolve(u)))
      );
      if (tiktokMediaUrl.startsWith('blob:')) data.tiktokMediaUrl = await uploadBlobVideo(tiktokMediaUrl);
      data.pageImageUrl = await downscaleImage(data.pageImageUrl, 160, 0.7);
      data.businessLogoUrl = await downscaleImage(data.businessLogoUrl, 160, 0.7);
      data.logoUrl = await downscaleImage(data.logoUrl, 160, 0.7);
      data.metaMediaUrls = await Promise.all(data.metaMediaUrls.map(u => downscaleImage(u)));
      data.searchImageUrls = await Promise.all(data.searchImageUrls.map(u => downscaleImage(u)));
      data.productImageUrl = await downscaleImage(data.productImageUrl);
      data.imageUrl = await downscaleImage(data.imageUrl);
      data.metaImageUrl = await downscaleImage(data.metaImageUrl);
      data.tiktokMediaUrl = data.tiktokMediaKind === 'video' ? data.tiktokMediaUrl : await downscaleImage(data.tiktokMediaUrl);
      data.bingImageUrl = await downscaleImage(data.bingImageUrl);
      const payload: Record<string, unknown> = { ...data };
      // Google campaign builders keep their data in their own stores — carry
      // the selected builder's saved data along so the recipient can open it
      if (platform === 'google') {
        const store = CAMPAIGN_STORES.find(c => c.type === googleCampaignType);
        if (store) {
          try {
            const saved = localStorage.getItem(store.key);
            if (saved) payload.campaignStore = { key: store.key, value: JSON.parse(saved) };
          } catch { /* corrupt store — share without it */ }
        }
      }
      const encoded = await encodeShareData(payload);
      const url = `${window.location.origin}${window.location.pathname}#s=${encoded}`;
      await navigator.clipboard.writeText(url);
      setShareState('copied');
      setTimeout(() => setShareState('idle'), 2500);
      const notes: string[] = [];
      if (videosDropped) notes.push('Some videos could not be uploaded for sharing — the preview will use your other media. (Is the MEDIA R2 bucket configured?)');
      if (url.length > 12000) notes.push('The link embeds your uploaded images, so it is long — paste it directly into a browser, email or doc rather than chat apps. Tip: media added via image URLs keeps links short.');
      if (notes.length) alert(`Share link copied!\n\n${notes.join('\n\n')}`);
    } catch (error) {
      console.error('Share link failed:', error);
      setShareState('failed');
      setTimeout(() => setShareState('idle'), 2500);
    }
  };

  // Get all ad data as object
  const getAdData = () => ({
    // Settings
    platform,
    googleCampaignType,
    googleAdType,
    metaAdType,
    // Google Ads
    businessName,
    businessLogoUrl,
    headlines,
    descriptions,
    displayUrl,
    finalUrl,
    path1,
    path2,
    sitelinks,
    callouts,
    snippetHeader,
    snippetValues,
    phoneNumber,
    priceAssets,
    promotion,
    searchImageUrls,
    // Shopping Product
    productTitle,
    productPrice,
    productStore,
    productImageUrl,
    productRating,
    productReviewCount,
    productShipping,
    // Shared/legacy fields used by Google Display, TikTok and LinkedIn editors
    imageUrl,
    logoUrl,
    ctaText,
    displaySize,
    username,
    caption,
    headline,
    description,
    metaImageUrl: metaImageUrl.startsWith('blob:') ? '' : metaImageUrl,
    // TikTok
    tiktokMediaUrl: tiktokMediaUrl.startsWith('blob:') ? '' : tiktokMediaUrl,
    tiktokMediaKind,
    tiktokCta,
    // Microsoft Advertising (Bing)
    bingAdType,
    bingFinalUrl,
    bingPath1,
    bingPath2,
    bingHeadlines,
    bingDescriptions,
    bingBusinessName,
    bingShortHeadline,
    bingLongHeadline,
    bingText,
    bingImageUrl,
    // Meta Ads
    metaAdName,
    partnershipAd,
    pageName,
    instagramAccount,
    pageImageUrl,
    metaCreativeSource,
    metaFormat,
    multiAdvertiser,
    browserAddon,
    primaryTexts,
    metaHeadlines,
    metaDescription,
    // Blob URLs (videos) don't survive a reload — persist empty slots instead
    metaMediaUrls: metaMediaUrls.map(u => (u.startsWith('blob:') ? '' : u)),
    metaMediaKinds,
    metaCtaText,
    metaDestinationUrl,
    linkDisplay,
    advantagePlusCreative,
    textGeneration,
    optimizeTextPerPerson,
    lifecycleStrategy,
  });

  // Save to localStorage
  const saveToLocalStorage = () => {
    const data = getAdData();
    localStorage.setItem('adPreviewData', JSON.stringify(data));
    alert('Saved to browser storage!');
  };

  // Load from localStorage
  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem('adPreviewData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        loadAdData(data);
        alert('Loaded from browser storage!');
      } catch {
        alert('Error loading saved data');
      }
    } else {
      alert('No saved data found');
    }
  };

  // Load ad data from object
  const loadAdData = (data: Record<string, unknown>) => {
    // LinkedIn was replaced by Microsoft Ads — map old saves to the new tab
    if (data.platform === 'linkedin') data.platform = 'bing';
    if (data.platform) setPlatform(data.platform as Platform);
    if (data.googleCampaignType) {
      setGoogleCampaignType(data.googleCampaignType as GoogleCampaignType);
    } else if (data.googleAdType) {
      // Older saves have no campaign type — derive one that supports the saved format
      const derived = googleCampaignTypes.find(c => c.formats.includes(data.googleAdType as GoogleAdType));
      if (derived) setGoogleCampaignType(derived.id);
    }
    if (data.googleAdType) setGoogleAdType(data.googleAdType as GoogleAdType);
    if (data.metaAdType) setMetaAdType(data.metaAdType as MetaAdType);
    if (data.businessName) setBusinessName(data.businessName as string);
    if (data.businessLogoUrl) setBusinessLogoUrl(data.businessLogoUrl as string);
    if (data.headlines) setHeadlines(data.headlines as string[]);
    if (data.descriptions) setDescriptions(data.descriptions as string[]);
    if (data.displayUrl) setDisplayUrl(data.displayUrl as string);
    if (data.finalUrl) setFinalUrl(data.finalUrl as string);
    if (data.path1) setPath1(data.path1 as string);
    if (data.path2) setPath2(data.path2 as string);
    if (data.sitelinks) setSitelinks(data.sitelinks as typeof sitelinks);
    if (data.callouts) setCallouts(data.callouts as string[]);
    if (data.snippetHeader) setSnippetHeader(data.snippetHeader as string);
    if (data.snippetValues) setSnippetValues(data.snippetValues as string[]);
    if (data.phoneNumber) setPhoneNumber(data.phoneNumber as string);
    if (data.priceAssets) setPriceAssets(data.priceAssets as typeof priceAssets);
    if (data.promotion) setPromotion(data.promotion as typeof promotion);
    if (data.searchImageUrls) setSearchImageUrls(data.searchImageUrls as string[]);
    if (data.productTitle) setProductTitle(data.productTitle as string);
    if (data.productPrice) setProductPrice(data.productPrice as string);
    if (data.productStore) setProductStore(data.productStore as string);
    if (data.productImageUrl) setProductImageUrl(data.productImageUrl as string);
    if (data.productRating) setProductRating(data.productRating as string);
    if (data.productReviewCount) setProductReviewCount(data.productReviewCount as string);
    if (data.productShipping) setProductShipping(data.productShipping as string);
    if (data.imageUrl) setImageUrl(data.imageUrl as string);
    if (data.logoUrl) setLogoUrl(data.logoUrl as string);
    if (data.ctaText) setCtaText(data.ctaText as string);
    if (data.displaySize) setDisplaySize(data.displaySize as typeof displaySize);
    if (data.username) setUsername(data.username as string);
    if (data.caption) setCaption(data.caption as string);
    if (data.headline) setHeadline(data.headline as string);
    if (data.description) setDescription(data.description as string);
    if (data.metaImageUrl) setMetaImageUrl(data.metaImageUrl as string);
    if (data.tiktokMediaUrl) setTiktokMediaUrl(data.tiktokMediaUrl as string);
    if (data.tiktokMediaKind) setTiktokMediaKind(data.tiktokMediaKind as MediaKind);
    if (data.tiktokCta) setTiktokCta(data.tiktokCta as string);
    if (data.bingAdType) setBingAdType(data.bingAdType as BingAdType);
    if (data.bingFinalUrl) setBingFinalUrl(data.bingFinalUrl as string);
    if (data.bingPath1) setBingPath1(data.bingPath1 as string);
    if (data.bingPath2) setBingPath2(data.bingPath2 as string);
    if (data.bingHeadlines) setBingHeadlines(data.bingHeadlines as string[]);
    if (data.bingDescriptions) setBingDescriptions(data.bingDescriptions as string[]);
    if (data.bingBusinessName) setBingBusinessName(data.bingBusinessName as string);
    if (data.bingShortHeadline) setBingShortHeadline(data.bingShortHeadline as string);
    if (data.bingLongHeadline) setBingLongHeadline(data.bingLongHeadline as string);
    if (data.bingText) setBingText(data.bingText as string);
    if (data.bingImageUrl) setBingImageUrl(data.bingImageUrl as string);
    if (data.metaAdName) setMetaAdName(data.metaAdName as string);
    if (data.partnershipAd !== undefined) setPartnershipAd(data.partnershipAd as boolean);
    if (data.pageName) setPageName(data.pageName as string);
    if (data.instagramAccount) setInstagramAccount(data.instagramAccount as string);
    if (data.pageImageUrl) setPageImageUrl(data.pageImageUrl as string);
    if (data.metaCreativeSource) setMetaCreativeSource(data.metaCreativeSource as 'manual' | 'catalogue');
    if (data.metaFormat) setMetaFormat(data.metaFormat as 'single' | 'carousel');
    if (data.multiAdvertiser !== undefined) setMultiAdvertiser(data.multiAdvertiser as boolean);
    if (data.browserAddon) setBrowserAddon(data.browserAddon as typeof browserAddon);
    if (data.primaryTexts) setPrimaryTexts(data.primaryTexts as string[]);
    if (data.metaHeadlines) setMetaHeadlines(data.metaHeadlines as string[]);
    if (data.metaDescription) setMetaDescription(data.metaDescription as string);
    if (data.metaMediaUrls) {
      // Older saves had 4 slots; blob: URLs from past sessions are dead — drop them
      const urls = (data.metaMediaUrls as string[]).map(u => (u.startsWith('blob:') ? '' : u));
      while (urls.length < 10) urls.push('');
      setMetaMediaUrls(urls.slice(0, 10));
    }
    if (data.metaMediaKinds) {
      const kinds = data.metaMediaKinds as MediaKind[];
      setMetaMediaKinds([...kinds, ...Array(10).fill('image')].slice(0, 10) as MediaKind[]);
    }
    if (data.metaCtaText) setMetaCtaText(data.metaCtaText as string);
    if (data.metaDestinationUrl) setMetaDestinationUrl(data.metaDestinationUrl as string);
    if (data.linkDisplay) setLinkDisplay(data.linkDisplay as string);
    if (data.advantagePlusCreative !== undefined) setAdvantagePlusCreative(data.advantagePlusCreative as boolean);
    if (data.textGeneration !== undefined) setTextGeneration(data.textGeneration as boolean);
    if (data.optimizeTextPerPerson !== undefined) setOptimizeTextPerPerson(data.optimizeTextPerPerson as boolean);
    if (data.lifecycleStrategy) setLifecycleStrategy(data.lifecycleStrategy as 'all' | 'new-customers');
  };

  // Export to CSV
  const exportToCSV = () => {
    const data = getAdData();
    const rows: string[][] = [];

    // Header row
    rows.push(['Field', 'Value']);

    // Flatten data for CSV
    rows.push(['Platform', data.platform]);
    rows.push(['Google Campaign Type', data.googleCampaignType]);
    rows.push(['Google Ad Type', data.googleAdType]);

    // Selected campaign builder data (PMax, Demand Gen, Video, Display, Shopping)
    const campaignRows = buildCampaignRows(data.googleCampaignType as GoogleCampaignType);
    if (campaignRows) {
      campaignRows.forEach(r => rows.push([`${r[0]} - ${r[1]}`, r[2]]));
    }
    rows.push(['Meta Ad Type', data.metaAdType]);
    rows.push(['Business Name', data.businessName]);
    rows.push(['Final URL', data.finalUrl]);
    rows.push(['Display URL', data.displayUrl]);
    rows.push(['Path 1', data.path1]);
    rows.push(['Path 2', data.path2]);
    rows.push(['Phone Number', data.phoneNumber]);

    // Headlines
    data.headlines.forEach((h, i) => {
      if (h) rows.push([`Headline ${i + 1}`, h]);
    });

    // Descriptions
    data.descriptions.forEach((d, i) => {
      if (d) rows.push([`Description ${i + 1}`, d]);
    });

    // Callouts
    data.callouts.forEach((c, i) => {
      if (c) rows.push([`Callout ${i + 1}`, c]);
    });

    // Sitelinks
    data.sitelinks.forEach((s, i) => {
      if (s.title) {
        rows.push([`Sitelink ${i + 1} Title`, s.title]);
        if (s.description1) rows.push([`Sitelink ${i + 1} Desc 1`, s.description1]);
        if (s.description2) rows.push([`Sitelink ${i + 1} Desc 2`, s.description2]);
      }
    });

    // Structured Snippets
    rows.push(['Snippet Header', data.snippetHeader]);
    data.snippetValues.forEach((v, i) => {
      if (v) rows.push([`Snippet Value ${i + 1}`, v]);
    });

    // Shopping Product
    if (data.productTitle) {
      rows.push(['Product Title', data.productTitle]);
      rows.push(['Product Price', data.productPrice]);
      rows.push(['Product Store', data.productStore]);
      rows.push(['Product Rating', data.productRating]);
      rows.push(['Product Reviews', data.productReviewCount]);
      rows.push(['Product Shipping', data.productShipping]);
    }

    // Meta Ads
    rows.push(['Page Name', data.pageName]);
    rows.push(['Instagram Account', data.instagramAccount]);
    rows.push(['Meta CTA', data.metaCtaText]);
    rows.push(['Destination URL', data.metaDestinationUrl]);
    rows.push(['Display Link', data.linkDisplay]);

    data.primaryTexts.forEach((t, i) => {
      if (t) rows.push([`Primary Text ${i + 1}`, t]);
    });

    data.metaHeadlines.forEach((h, i) => {
      if (h) rows.push([`Meta Headline ${i + 1}`, h]);
    });

    rows.push(['Meta Description', data.metaDescription]);

    // Convert to CSV string
    const csvContent = rows.map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ad-preview-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export to JSON (full data, including every campaign builder's saved data)
  const exportToJSON = () => {
    const campaigns: Record<string, unknown> = {};
    CAMPAIGN_STORES.forEach(({ key }) => {
      try {
        const saved = localStorage.getItem(key);
        if (saved) campaigns[key] = JSON.parse(saved);
      } catch { /* skip corrupt store */ }
    });
    const data = { ...getAdData(), campaigns };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ad-preview-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Helper to copy and open Google Sheets
  const copyToSheets = async (rows: string[][], sheetName: string) => {
    const tsvContent = rows.map(row =>
      row.map(cell => String(cell).replace(/\t/g, ' ').replace(/\n/g, ' ')).join('\t')
    ).join('\n');

    try {
      await navigator.clipboard.writeText(tsvContent);
      window.open('https://docs.google.com/spreadsheets/create', '_blank');
      alert(`${sheetName} data copied! In Google Sheets, press Ctrl+V (Cmd+V on Mac) to paste.`);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = tsvContent;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      window.open('https://docs.google.com/spreadsheets/create', '_blank');
      alert(`${sheetName} data copied! In Google Sheets, press Ctrl+V (Cmd+V on Mac) to paste.`);
    }
  };

  // Clear all saved data and return to the demo defaults
  const resetAllData = () => {
    if (!confirm('Reset everything back to the demo defaults? This clears all data you have entered.')) return;
    ['adPreviewData', 'pmaxAssetGroupData', 'demandGenCampaignData', 'videoCampaignData', 'displayCampaignData', 'shoppingCampaignData']
      .forEach(key => localStorage.removeItem(key));
    window.location.reload();
  };

  // localStorage stores used by the campaign builder components
  const CAMPAIGN_STORES: { type: GoogleCampaignType; key: string }[] = [
    { type: 'pmax', key: 'pmaxAssetGroupData' },
    { type: 'demand-gen', key: 'demandGenCampaignData' },
    { type: 'video', key: 'videoCampaignData' },
    { type: 'display', key: 'displayCampaignData' },
    { type: 'shopping', key: 'shoppingCampaignData' },
  ];

  // Build sheet rows for the currently selected campaign builder from its saved data.
  // Returns null for 'search' (which uses the classic editor fields).
  const buildCampaignRows = (type: GoogleCampaignType): string[][] | null => {
    const store = CAMPAIGN_STORES.find(c => c.type === type);
    if (!store) return null;
    let d: Record<string, unknown> = {};
    try {
      d = JSON.parse(localStorage.getItem(store.key) || '{}');
    } catch { /* corrupt store — export what we can */ }
    const s = (v: unknown) => (typeof v === 'string' ? v : '');
    const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
    const rows: string[][] = [];
    const push = (cat: string, field: string, value: string, limit = '') => {
      if (value) rows.push([cat, field, value, limit ? String(value.length) : '', limit]);
    };

    switch (type) {
      case 'pmax':
        push('Settings', 'Asset group name', s(d.assetGroupName));
        push('Settings', 'Final URL', s(d.finalUrl));
        push('Settings', 'Business name', s(d.businessName), '25');
        push('Settings', 'Call to action', s(d.ctaText));
        arr(d.headlines).forEach((h, i) => push('Headlines', `Headline ${i + 1}`, s(h), '30'));
        arr(d.longHeadlines).forEach((h, i) => push('Long headlines', `Long headline ${i + 1}`, s(h), '90'));
        arr(d.descriptions).forEach((v, i) => push('Descriptions', `Description ${i + 1}`, s(v), i === 0 ? '60' : '90'));
        arr(d.sitelinks).forEach((sl, i) => {
          const item = sl as Record<string, unknown>;
          push('Sitelinks', `Sitelink ${i + 1}`, s(item?.title), '25');
          push('Sitelinks', `Sitelink ${i + 1} description`, s(item?.description1), '35');
        });
        push('Assets', 'Video URL', s(d.videoUrl));
        push('Assets', 'Images', arr(d.imageUrls).filter(Boolean).length ? `${arr(d.imageUrls).filter(Boolean).length} added` : '');
        push('Signals', 'Search themes', s(d.searchThemes));
        push('Signals', 'Audience signal', s(d.audienceName));
        break;

      case 'demand-gen':
        push('Campaign', 'Campaign name', s(d.campaignName), '256');
        push('Campaign', 'Campaign goal', s(d.goal));
        push('Campaign', 'Conversion goal', s(d.conversionGoal));
        push('Campaign', 'Budget', s(d.budget) ? `$${s(d.budget)} (${s(d.budgetType) || 'daily'})` : '');
        push('Campaign', 'Start date', s(d.startDate));
        push('Campaign', 'End date', s(d.endDate));
        push('Campaign', 'Target CPA', d.useTargetCpa ? `$${s(d.targetCpa)}` : '');
        push('Campaign', 'Main color', s(d.mainColor));
        push('Campaign', 'Accent color', s(d.accentColor));
        push('Campaign', 'Font', s(d.font));
        push('Campaign', 'EU political ads', s(d.euPolitical) ? (d.euPolitical === 'yes' ? 'Yes' : 'No') : '');
        push('Ad', 'Business name', s(d.businessName), '25');
        push('Ad', 'Headline', s(d.headline), '40');
        push('Ad', 'Description', s(d.description), '90');
        push('Ad', 'Call to action', s(d.ctaText));
        break;

      case 'video':
        push('Campaign', 'Campaign name', s(d.campaignName), '256');
        push('Campaign', 'Bidding', s(d.bidding));
        push('Campaign', 'Budget', s(d.budget) ? `$${s(d.budget)} (${s(d.budgetType) || 'daily'})` : '');
        push('Campaign', 'Networks', [d.networkSearch && 'YouTube search', d.networkVideos && 'YouTube videos', d.networkPartners && 'Video partners'].filter(Boolean).join(', '));
        push('Ad', 'Video URL', s(d.videoUrl));
        push('Ad', 'Channel name', s(d.channelName));
        push('Ad', 'Headline', s(d.headline), '90');
        push('Ad', 'Description', s(d.description), '70');
        push('Ad', 'Display URL', s(d.displayUrl));
        push('Ad', 'Call to action', s(d.ctaText));
        break;

      case 'display':
        push('Settings', 'Final URL', s(d.finalUrl));
        push('Settings', 'Business name', s(d.businessName), '25');
        arr(d.headlines).forEach((h, i) => push('Headlines', `Headline ${i + 1}`, s(h), '30'));
        push('Headlines', 'Long headline', s(d.longHeadline), '90');
        arr(d.descriptions).forEach((v, i) => push('Descriptions', `Description ${i + 1}`, s(v), '90'));
        push('Assets', 'Video URL', s(d.videoUrl));
        push('Assets', 'Call to action', s(d.ctaText));
        break;

      case 'shopping':
        push('Campaign', 'Campaign name', s(d.campaignName), '256');
        push('Campaign', 'Merchant Center account', s(d.merchantAccount));
        push('Campaign', 'Country of sale', s(d.feedCountry));
        push('Campaign', 'Campaign priority', s(d.priority));
        push('Campaign', 'Networks', [d.networkSearch && 'Google Search Network', d.networkPartners && 'Search partners'].filter(Boolean).join(', '));
        push('Campaign', 'Budget', s(d.budget) ? `$${s(d.budget)} (${s(d.budgetType) || 'daily'})` : '');
        push('Product', 'Product title', productTitle, '150');
        push('Product', 'Price', productPrice);
        push('Product', 'Store name', productStore);
        push('Product', 'Rating', productRating);
        push('Product', 'Review count', productReviewCount);
        push('Product', 'Shipping', productShipping);
        break;
    }
    return rows;
  };

  // Copy Google Ads data only — exports the currently selected campaign type
  const copyGoogleAdsToSheets = async () => {
    const campaignLabel = googleCampaignTypes.find(c => c.id === googleCampaignType)?.label || googleCampaignType;
    const campaignRows = buildCampaignRows(googleCampaignType);
    if (campaignRows) {
      const rows: string[][] = [
        ['Category', 'Field', 'Value', 'Character Count', 'Limit'],
        ['Settings', 'Campaign Type', campaignLabel, '', ''],
        ...campaignRows,
      ];
      await copyToSheets(rows, `Google Ads (${campaignLabel})`);
      return;
    }

    // Search campaign — classic editor fields
    const data = getAdData();
    const rows: string[][] = [];

    rows.push(['Category', 'Field', 'Value', 'Character Count', 'Limit']);
    rows.push(['Settings', 'Campaign Type', campaignLabel, '', '']);
    rows.push(['Settings', 'Business Name', data.businessName, String(data.businessName.length), '25']);
    rows.push(['Settings', 'Final URL', data.finalUrl, '', '']);
    rows.push(['Settings', 'Display URL', data.displayUrl, '', '']);
    rows.push(['Settings', 'Path 1', data.path1, String(data.path1.length), '15']);
    rows.push(['Settings', 'Path 2', data.path2, String(data.path2.length), '15']);
    rows.push(['Settings', 'Phone Number', data.phoneNumber, '', '']);

    data.headlines.forEach((h, i) => {
      if (h) rows.push(['Headlines', `Headline ${i + 1}`, h, String(h.length), '30']);
    });

    data.descriptions.forEach((d, i) => {
      if (d) rows.push(['Descriptions', `Description ${i + 1}`, d, String(d.length), '90']);
    });

    data.callouts.forEach((c, i) => {
      if (c) rows.push(['Callouts', `Callout ${i + 1}`, c, String(c.length), '25']);
    });

    data.sitelinks.forEach((s, i) => {
      if (s.title) {
        rows.push(['Sitelinks', `Sitelink ${i + 1} Title`, s.title, String(s.title.length), '25']);
        rows.push(['Sitelinks', `Sitelink ${i + 1} Desc 1`, s.description1, String(s.description1.length), '35']);
        rows.push(['Sitelinks', `Sitelink ${i + 1} Desc 2`, s.description2, String(s.description2.length), '35']);
      }
    });

    rows.push(['Snippets', 'Header', data.snippetHeader, '', '']);
    data.snippetValues.forEach((v, i) => {
      if (v) rows.push(['Snippets', `Value ${i + 1}`, v, String(v.length), '25']);
    });

    if (data.productTitle) {
      rows.push(['Shopping', 'Product Title', data.productTitle, String(data.productTitle.length), '150']);
      rows.push(['Shopping', 'Price', data.productPrice, '', '']);
      rows.push(['Shopping', 'Store', data.productStore, '', '']);
      rows.push(['Shopping', 'Rating', data.productRating, '', '']);
      rows.push(['Shopping', 'Reviews', data.productReviewCount, '', '']);
      rows.push(['Shopping', 'Shipping', data.productShipping, '', '']);
    }

    await copyToSheets(rows, 'Google Ads');
  };

  // Copy Meta Ads data only
  const copyMetaAdsToSheets = async () => {
    const data = getAdData();
    const rows: string[][] = [];

    rows.push(['Category', 'Field', 'Value', 'Character Count', 'Limit']);
    rows.push(['Settings', 'Ad Name', data.metaAdName, '', '']);
    rows.push(['Identity', 'Page Name', data.pageName, '', '']);
    rows.push(['Identity', 'Instagram Account', data.instagramAccount, '', '']);
    rows.push(['Ad Setup', 'Format', data.metaFormat === 'carousel' ? 'Carousel' : 'Single image or video', '', '']);
    rows.push(['Ad Setup', 'Media Added', String(data.metaMediaUrls.filter(Boolean).length), '', '10']);
    rows.push(['Settings', 'CTA Button', data.metaCtaText, '', '']);
    rows.push(['Settings', 'Destination URL', data.metaDestinationUrl, '', '']);
    rows.push(['Settings', 'Display Link', data.linkDisplay, '', '']);
    rows.push(['Settings', 'Browser Add-on', data.browserAddon, '', '']);

    data.primaryTexts.forEach((t, i) => {
      if (t) rows.push(['Primary Text', `Primary Text ${i + 1}`, t, String(t.length), '125']);
    });

    data.metaHeadlines.forEach((h, i) => {
      if (h) rows.push(['Headlines', `Headline ${i + 1}`, h, String(h.length), '40']);
    });

    if (data.metaDescription) {
      rows.push(['Description', 'Description', data.metaDescription, String(data.metaDescription.length), '30']);
    }

    await copyToSheets(rows, 'Meta Ads');
  };

  // Copy both Google & Meta Ads data
  const copyAllToSheets = async () => {
    const data = getAdData();
    const rows: string[][] = [];

    // Header
    rows.push(['Platform', 'Category', 'Field', 'Value', 'Character Count', 'Limit']);

    // Google Ads — selected campaign builder data when not on Search
    rows.push(['Google Ads', 'Settings', 'Campaign Type', googleCampaignTypes.find(c => c.id === data.googleCampaignType)?.label || data.googleCampaignType, '', '']);
    const campaignRows = buildCampaignRows(data.googleCampaignType as GoogleCampaignType);
    if (campaignRows) {
      campaignRows.forEach(r => rows.push(['Google Ads', ...r]));
    }
    rows.push(['Google Ads', 'Settings', 'Business Name', data.businessName, String(data.businessName.length), '25']);
    rows.push(['Google Ads', 'Settings', 'Final URL', data.finalUrl, '', '']);
    rows.push(['Google Ads', 'Settings', 'Display URL', data.displayUrl, '', '']);
    rows.push(['Google Ads', 'Settings', 'Path 1', data.path1, String(data.path1.length), '15']);
    rows.push(['Google Ads', 'Settings', 'Path 2', data.path2, String(data.path2.length), '15']);
    rows.push(['Google Ads', 'Settings', 'Phone Number', data.phoneNumber, '', '']);

    data.headlines.forEach((h, i) => {
      if (h) rows.push(['Google Ads', 'Headlines', `Headline ${i + 1}`, h, String(h.length), '30']);
    });

    data.descriptions.forEach((d, i) => {
      if (d) rows.push(['Google Ads', 'Descriptions', `Description ${i + 1}`, d, String(d.length), '90']);
    });

    data.callouts.forEach((c, i) => {
      if (c) rows.push(['Google Ads', 'Callouts', `Callout ${i + 1}`, c, String(c.length), '25']);
    });

    data.sitelinks.forEach((s, i) => {
      if (s.title) {
        rows.push(['Google Ads', 'Sitelinks', `Sitelink ${i + 1} Title`, s.title, String(s.title.length), '25']);
        rows.push(['Google Ads', 'Sitelinks', `Sitelink ${i + 1} Desc 1`, s.description1, String(s.description1.length), '35']);
        rows.push(['Google Ads', 'Sitelinks', `Sitelink ${i + 1} Desc 2`, s.description2, String(s.description2.length), '35']);
      }
    });

    rows.push(['Google Ads', 'Snippets', 'Header', data.snippetHeader, '', '']);
    data.snippetValues.forEach((v, i) => {
      if (v) rows.push(['Google Ads', 'Snippets', `Value ${i + 1}`, v, String(v.length), '25']);
    });

    // Meta Ads
    rows.push(['Meta Ads', 'Identity', 'Page Name', data.pageName, '', '']);
    rows.push(['Meta Ads', 'Identity', 'Instagram Account', data.instagramAccount, '', '']);
    rows.push(['Meta Ads', 'Settings', 'CTA Button', data.metaCtaText, '', '']);
    rows.push(['Meta Ads', 'Settings', 'Destination URL', data.metaDestinationUrl, '', '']);
    rows.push(['Meta Ads', 'Settings', 'Display Link', data.linkDisplay, '', '']);

    data.primaryTexts.forEach((t, i) => {
      if (t) rows.push(['Meta Ads', 'Primary Text', `Primary Text ${i + 1}`, t, String(t.length), '125']);
    });

    data.metaHeadlines.forEach((h, i) => {
      if (h) rows.push(['Meta Ads', 'Headlines', `Headline ${i + 1}`, h, String(h.length), '40']);
    });

    if (data.metaDescription) {
      rows.push(['Meta Ads', 'Description', 'Description', data.metaDescription, String(data.metaDescription.length), '30']);
    }

    await copyToSheets(rows, 'All Ads');
  };

  // Import from JSON
  const importFromJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        loadAdData(data);
        // Restore campaign builder stores, then reload so the builders pick them up
        if (data.campaigns && typeof data.campaigns === 'object') {
          Object.entries(data.campaigns as Record<string, unknown>).forEach(([key, value]) => {
            if (CAMPAIGN_STORES.some(c => c.key === key)) {
              localStorage.setItem(key, JSON.stringify(value));
            }
          });
          alert('Imported successfully! Reloading to apply campaign data.');
          window.location.reload();
          return;
        }
        alert('Imported successfully!');
      } catch {
        alert('Error reading file. Please use a valid JSON file.');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // On mount: a #s=... share link takes priority, otherwise restore localStorage
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#s=')) {
      decodeShareData(hash.slice(3))
        .then((data) => {
          loadAdData(data);
          const store = data.campaignStore as { key: string; value: unknown } | undefined;
          if (store && CAMPAIGN_STORES.some(c => c.key === store.key)) {
            setSharedCampaignStore(store);
          }
          setSharedView(true);
        })
        .catch(() => {
          alert('This share link is invalid or was truncated. Ask the sender to copy the full link.');
        });
      return;
    }
    const saved = localStorage.getItem('adPreviewData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        loadAdData(data);
      } catch {
        // Ignore errors on auto-load
      }
    }
  }, []);

  // Auto-save to localStorage on data change (paused in shared view so a
  // received link never silently overwrites the viewer's own draft).
  // Debounced: serialising the draft includes base64 images and can take
  // tens of milliseconds — doing it on every keystroke made typing laggy.
  useEffect(() => {
    if (sharedView) return;
    const timer = setTimeout(() => {
      localStorage.setItem('adPreviewData', JSON.stringify(getAdData()));
    }, 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedView, businessName, headlines, descriptions, finalUrl, displayUrl, path1, path2,
      sitelinks, callouts, snippetHeader, snippetValues, phoneNumber, priceAssets,
      promotion, searchImageUrls, pageName, instagramAccount, pageImageUrl,
      primaryTexts, metaHeadlines, metaDescription, metaMediaUrls, metaMediaKinds, metaCtaText,
      metaDestinationUrl, linkDisplay, platform, googleCampaignType, googleAdType, metaAdType,
      metaAdName, partnershipAd, metaCreativeSource, metaFormat, multiAdvertiser, browserAddon,
      advantagePlusCreative, textGeneration, optimizeTextPerPerson, lifecycleStrategy,
      productTitle, productPrice, productStore, productImageUrl, productRating,
      productReviewCount, productShipping,
      imageUrl, logoUrl, ctaText, displaySize, username, caption, headline, description, metaImageUrl,
      tiktokMediaUrl, tiktokMediaKind, tiktokCta,
      bingAdType, bingFinalUrl, bingPath1, bingPath2, bingHeadlines, bingDescriptions,
      bingBusinessName, bingShortHeadline, bingLongHeadline, bingText, bingImageUrl]);

  const renderGoogleEditor = () => {
    switch (googleAdType) {
      case 'search':
        return (
          <div className="space-y-0 divide-y divide-gray-200">
            {/* Final URL Section */}
            <div className="pb-4">
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                Final URL
                <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={finalUrl}
                onChange={(e) => setFinalUrl(e.target.value)}
                placeholder="https://example.com/landing-page"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Display path</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{displayUrl || 'example.com'} /</span>
                  <input
                    type="text"
                    value={path1}
                    onChange={(e) => setPath1(e.target.value)}
                    placeholder="path1"
                    maxLength={15}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <span className="text-gray-400">/</span>
                  <input
                    type="text"
                    value={path2}
                    onChange={(e) => setPath2(e.target.value)}
                    placeholder="path2"
                    maxLength={15}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Headlines Section */}
            <div className="py-4">
              <button
                onClick={() => toggleSection('headlines')}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.headlines ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Headlines (30 chars max)</span>
                </div>
                <span className="text-xs text-gray-500">{headlines.filter(h => h.trim()).length}/15 added</span>
              </button>
              {expandedSections.headlines && (
                <div className="mt-4 space-y-3 pl-7">
                  {headlines.slice(0, visibleHeadlines).map((h, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm text-gray-400 w-5">{i + 1}</span>
                      <input
                        type="text"
                        value={h}
                        onChange={(e) => {
                          const newHeadlines = [...headlines];
                          newHeadlines[i] = e.target.value;
                          setHeadlines(newHeadlines);
                        }}
                        placeholder={`Headline ${i + 1}${i < 3 ? ' *' : ''}`}
                        maxLength={30}
                        className={`flex-1 px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                          i < 3 ? 'border-blue-200 bg-blue-50/50' : 'border-gray-300'
                        } ${h.length >= 30 ? 'border-red-300 bg-red-50' : h.length >= 25 ? 'border-yellow-300 bg-yellow-50' : ''}`}
                      />
                      <span className={`text-xs w-10 text-right font-medium ${
                        h.length >= 30 ? 'text-red-500' : h.length >= 25 ? 'text-yellow-500' : h.length >= 20 ? 'text-green-500' : 'text-gray-400'
                      }`}>{h.length}/30</span>
                    </div>
                  ))}
                  {visibleHeadlines < 15 && (
                    <button
                      onClick={() => setVisibleHeadlines(Math.min(visibleHeadlines + 5, 15))}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add more headlines
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Descriptions Section */}
            <div className="py-4">
              <button
                onClick={() => toggleSection('descriptions')}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.descriptions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Descriptions (90 chars max)</span>
                </div>
                <span className="text-xs text-gray-500">{descriptions.filter(d => d.trim()).length}/4 added</span>
              </button>
              {expandedSections.descriptions && (
                <div className="mt-4 space-y-3 pl-7">
                  {descriptions.slice(0, visibleDescriptions).map((d, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-sm text-gray-400 w-5 pt-2.5">{i + 1}</span>
                      <textarea
                        value={d}
                        onChange={(e) => {
                          const newDescriptions = [...descriptions];
                          newDescriptions[i] = e.target.value;
                          setDescriptions(newDescriptions);
                        }}
                        placeholder={`Description ${i + 1}${i < 2 ? ' *' : ''}`}
                        maxLength={90}
                        rows={2}
                        className={`flex-1 px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm resize-none ${
                          i < 2 ? 'border-blue-200 bg-blue-50/50' : 'border-gray-300'
                        } ${d.length >= 90 ? 'border-red-300 bg-red-50' : d.length >= 75 ? 'border-yellow-300 bg-yellow-50' : ''}`}
                      />
                      <span className={`text-xs w-10 text-right pt-2.5 font-medium ${
                        d.length >= 90 ? 'text-red-500' : d.length >= 75 ? 'text-yellow-500' : d.length >= 50 ? 'text-green-500' : 'text-gray-400'
                      }`}>{d.length}/90</span>
                    </div>
                  ))}
                  {visibleDescriptions < 4 && (
                    <button
                      onClick={() => setVisibleDescriptions(Math.min(visibleDescriptions + 2, 4))}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add more descriptions
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Images Section */}
            <div className="py-4">
              <button
                onClick={() => toggleSection('images')}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.images ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Images</span>
                </div>
                <span className="text-xs text-gray-500">{searchImageUrls.filter(u => u).length}/4 added</span>
              </button>
              {expandedSections.images && (
                <div className="mt-4 pl-7">
                  <p className="text-xs text-gray-500 mb-3">Add images to your campaign</p>
                  <div className="grid grid-cols-4 gap-2">
                    {searchImageUrls.map((url, i) => (
                      <div key={i} className="aspect-square">
                        <ImageUpload
                          label=""
                          value={url}
                          onChange={(newUrl) => {
                            const newUrls = [...searchImageUrls];
                            newUrls[i] = newUrl;
                            setSearchImageUrls(newUrls);
                          }}
                          aspectRatio="1:1"
                          className="h-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Business Name */}
            <div className="py-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">Business name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your Business Name"
                maxLength={25}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Business Logo */}
            <div className="py-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">Business logo</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden">
                  {businessLogoUrl ? (
                    <img src={businessLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <ImageUpload
                  label=""
                  value={businessLogoUrl}
                  onChange={setBusinessLogoUrl}
                  aspectRatio="1:1"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Sitelinks Section */}
            <div className="py-4">
              <button
                onClick={() => toggleSection('sitelinks')}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.sitelinks ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Sitelinks</span>
                </div>
                <span className="text-xs text-gray-500">{sitelinks.filter(s => s.title.trim()).length}/8 added</span>
              </button>
              {expandedSections.sitelinks && (
                <div className="mt-4 pl-7 space-y-3">
                  <p className="text-xs text-gray-500">Add links to your ads to take people to specific pages on your website.</p>
                  {sitelinks.slice(0, visibleSitelinks).map((link, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Sitelink {i + 1}</span>
                        <span className="text-xs text-gray-400">{link.title.length}/25</span>
                      </div>
                      <input
                        type="text"
                        value={link.title}
                        onChange={(e) => {
                          const newSitelinks = [...sitelinks];
                          newSitelinks[i] = { ...newSitelinks[i], title: e.target.value };
                          setSitelinks(newSitelinks);
                        }}
                        placeholder="Sitelink text"
                        maxLength={25}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={link.description1}
                          onChange={(e) => {
                            const newSitelinks = [...sitelinks];
                            newSitelinks[i] = { ...newSitelinks[i], description1: e.target.value };
                            setSitelinks(newSitelinks);
                          }}
                          placeholder="Description line 1"
                          maxLength={35}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="text"
                          value={link.description2}
                          onChange={(e) => {
                            const newSitelinks = [...sitelinks];
                            newSitelinks[i] = { ...newSitelinks[i], description2: e.target.value };
                            setSitelinks(newSitelinks);
                          }}
                          placeholder="Description line 2"
                          maxLength={35}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                  {visibleSitelinks < 8 && (
                    <button
                      onClick={() => setVisibleSitelinks(Math.min(visibleSitelinks + 2, 8))}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add more sitelinks
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Promotions Section */}
            <div className="py-4">
              <button
                onClick={() => toggleSection('promotions')}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.promotions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Promotions</span>
                </div>
              </button>
              {expandedSections.promotions && (
                <div className="mt-4 pl-7 space-y-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Occasion</label>
                    <select
                      value={promotion.occasion}
                      onChange={(e) => setPromotion({ ...promotion, occasion: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white"
                    >
                      {promotionOccasions.map((occasion) => (
                        <option key={occasion} value={occasion} className="text-gray-900">{occasion}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Discount type</label>
                      <select
                        value={promotion.promotionType}
                        onChange={(e) => setPromotion({ ...promotion, promotionType: e.target.value as 'monetary' | 'percentage' | 'none' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white"
                      >
                        <option value="none" className="text-gray-900">None</option>
                        <option value="percentage" className="text-gray-900">Percent off</option>
                        <option value="monetary" className="text-gray-900">Money off</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Value</label>
                      <input
                        type="text"
                        value={promotion.promotionValue}
                        onChange={(e) => setPromotion({ ...promotion, promotionValue: e.target.value })}
                        placeholder={promotion.promotionType === 'percentage' ? '20' : '50'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        disabled={promotion.promotionType === 'none'}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Item (20 chars)</label>
                    <input
                      type="text"
                      value={promotion.item}
                      onChange={(e) => setPromotion({ ...promotion, item: e.target.value })}
                      placeholder="all orders"
                      maxLength={20}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Prices Section */}
            <div className="py-4">
              <button
                onClick={() => toggleSection('prices')}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.prices ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Prices</span>
                </div>
              </button>
              {expandedSections.prices && (
                <div className="mt-4 pl-7 space-y-3">
                  {priceAssets.slice(0, 3).map((item, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
                      <span className="text-xs font-medium text-gray-500">Price {i + 1}</span>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={item.header}
                          onChange={(e) => {
                            const newItems = [...priceAssets];
                            newItems[i] = { ...newItems[i], header: e.target.value };
                            setPriceAssets(newItems);
                          }}
                          placeholder="Item name"
                          maxLength={25}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="text"
                          value={item.price}
                          onChange={(e) => {
                            const newItems = [...priceAssets];
                            newItems[i] = { ...newItems[i], price: e.target.value };
                            setPriceAssets(newItems);
                          }}
                          placeholder="$99.99"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Calls Section */}
            <div className="py-4">
              <button
                onClick={() => toggleSection('calls')}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.calls ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Calls</span>
                </div>
              </button>
              {expandedSections.calls && (
                <div className="mt-4 pl-7">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              )}
            </div>

            {/* Callouts Section */}
            <div className="py-4">
              <button
                onClick={() => toggleSection('callouts')}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.callouts ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Callouts</span>
                </div>
                <span className="text-xs text-gray-500">{callouts.filter(c => c.trim()).length}/10 added</span>
              </button>
              {expandedSections.callouts && (
                <div className="mt-4 pl-7 space-y-2">
                  <p className="text-xs text-gray-500 mb-2">Add more business information</p>
                  {callouts.slice(0, visibleCallouts).map((callout, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={callout}
                        onChange={(e) => {
                          const newCallouts = [...callouts];
                          newCallouts[i] = e.target.value;
                          setCallouts(newCallouts);
                        }}
                        placeholder={`Callout ${i + 1}`}
                        maxLength={25}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <span className="text-xs text-gray-400 w-10 text-right">{callout.length}/25</span>
                    </div>
                  ))}
                  {visibleCallouts < 10 && (
                    <button
                      onClick={() => setVisibleCallouts(Math.min(visibleCallouts + 4, 10))}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add more callouts
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Structured Snippets Section */}
            <div className="py-4">
              <button
                onClick={() => toggleSection('snippets')}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.snippets ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Structured snippets</span>
                </div>
              </button>
              {expandedSections.snippets && (
                <div className="mt-4 pl-7 space-y-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Header</label>
                    <select
                      value={snippetHeader}
                      onChange={(e) => setSnippetHeader(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white"
                    >
                      {snippetHeaders.map((header) => (
                        <option key={header} value={header} className="text-gray-900">{header}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    {snippetValues.slice(0, 4).map((value, i) => (
                      <input
                        key={i}
                        type="text"
                        value={value}
                        onChange={(e) => {
                          const newValues = [...snippetValues];
                          newValues[i] = e.target.value;
                          setSnippetValues(newValues);
                        }}
                        placeholder={`Value ${i + 1}`}
                        maxLength={25}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'display':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ad Size</label>
              <select
                value={displaySize}
                onChange={(e) => setDisplaySize(e.target.value as typeof displaySize)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="medium-rectangle" className="text-gray-900">Medium Rectangle (300x250)</option>
                <option value="leaderboard" className="text-gray-900">Leaderboard (728x90)</option>
                <option value="large-rectangle" className="text-gray-900">Large Rectangle (336x280)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your Business"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Your headline"
                maxLength={30}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Your description"
                maxLength={90}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <ImageUpload
              label="Ad Image"
              value={imageUrl}
              onChange={setImageUrl}
              aspectRatio="1.91:1"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button</label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="Learn More"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'youtube-instream':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Your headline"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Your description"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display URL</label>
              <input
                type="text"
                value={displayUrl}
                onChange={(e) => setDisplayUrl(e.target.value)}
                placeholder="example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <ImageUpload
              label="Video Thumbnail"
              value={imageUrl}
              onChange={setImageUrl}
              aspectRatio="16:9"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button</label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="Learn More"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'youtube-shorts':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username/Channel</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourbrand"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Your short description..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <ImageUpload
              label="Short Video/Image (9:16)"
              value={imageUrl}
              onChange={setImageUrl}
              aspectRatio="9:16"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button</label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="Visit"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'gmail':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sender Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your Company"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Your email subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preview Text</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Email preview text..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <ImageUpload
              label="Logo (optional)"
              value={logoUrl}
              onChange={setLogoUrl}
              aspectRatio="1:1"
            />
          </div>
        );

      case 'discover':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your Business"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Catchy headline"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Your description"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <ImageUpload
              label="Card Image (1.91:1)"
              value={imageUrl}
              onChange={setImageUrl}
              aspectRatio="1.91:1"
            />
            <ImageUpload
              label="Logo (optional)"
              value={logoUrl}
              onChange={setLogoUrl}
              aspectRatio="1:1"
            />
          </div>
        );

      case 'shopping':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Title</label>
              <input
                type="text"
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                placeholder="e.g. Nike Air Max 270 Running Shoes"
                maxLength={150}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">{productTitle.length}/150</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <input
                  type="text"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  placeholder="$99.99"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                <input
                  type="text"
                  value={productStore}
                  onChange={(e) => setProductStore(e.target.value)}
                  placeholder="Your Store"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <ImageUpload
              label="Product Image (1:1)"
              value={productImageUrl}
              onChange={setProductImageUrl}
              aspectRatio="1:1"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating (0-5)</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={productRating}
                  onChange={(e) => setProductRating(e.target.value)}
                  placeholder="4.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Review Count</label>
                <input
                  type="text"
                  value={productReviewCount}
                  onChange={(e) => setProductReviewCount(e.target.value)}
                  placeholder="120"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Text</label>
              <input
                type="text"
                value={productShipping}
                onChange={(e) => setProductShipping(e.target.value)}
                placeholder="Free shipping"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );
    }
  };

  const renderMetaEditor = () => {
    // Meta Ads editor mirroring the real Ads Manager ad-level flow:
    // Ad name → Partnership ad → Identity → Ad setup → Destination → Ad creative
    const spec = META_SPECS[metaAdType];
    const mediaCount = metaMediaUrls.filter(u => u).length;
    const mediaSlots = Math.min(10, Math.max(2, mediaCount + 2));

    const chevron = (open: boolean) => (
      <svg className={`w-5 h-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );

    const sectionHeader = (key: string, title: string, right?: React.ReactNode, badge?: React.ReactNode) => (
      <button onClick={() => toggleMetaSection(key)} className="w-full flex items-center justify-between text-left">
        <div className="flex items-center gap-2">
          {chevron(!!metaExpandedSections[key])}
          <span className="text-sm font-medium text-gray-900">{title}</span>
          {badge}
        </div>
        {right}
      </button>
    );

    return (
      <div className="space-y-0 divide-y divide-gray-200">
        {/* Ad name */}
        <div className="pb-4">
          {sectionHeader('adName', 'Ad name')}
          {metaExpandedSections.adName && (
            <div className="mt-3 pl-7">
              <input
                type="text"
                value={metaAdName}
                onChange={(e) => setMetaAdName(e.target.value)}
                placeholder="e.g. Christchurch_thinking_about_selling"
                maxLength={META_TEXT_LIMITS.adNameMax}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">Internal name — not shown to your audience</p>
            </div>
          )}
        </div>

        {/* Partnership ad */}
        <div className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900">Partnership ad</span>
              <p className="text-xs text-gray-500 mt-0.5 max-w-xs">
                Run ads with creators, brands and other businesses. These ads leverage signals from both profiles.
              </p>
            </div>
            <button
              onClick={() => setPartnershipAd(!partnershipAd)}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${partnershipAd ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${partnershipAd ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        </div>

        {/* Identity */}
        <div className="py-4">
          {sectionHeader('identity', 'Identity')}
          {metaExpandedSections.identity && (
            <div className="mt-4 pl-7 space-y-4">
              <p className="text-xs text-gray-500">The profiles that will be used in your ad.</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {pageImageUrl ? (
                    <img src={pageImageUrl} alt="Page" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facebook Page <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={pageName}
                    onChange={(e) => setPageName(e.target.value)}
                    placeholder="Your Page Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram profile</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">@</span>
                  <input
                    type="text"
                    value={instagramAccount}
                    onChange={(e) => setInstagramAccount(e.target.value)}
                    placeholder="instagram_username"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">If empty, your Facebook Page name is used on Instagram placements</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Profile image</label>
                <ImageUpload
                  label=""
                  value={pageImageUrl}
                  onChange={setPageImageUrl}
                  aspectRatio="1:1"
                />
              </div>
            </div>
          )}
        </div>

        {/* Ad setup */}
        <div className="py-4">
          {sectionHeader('adSetup', 'Ad setup')}
          {metaExpandedSections.adSetup && (
            <div className="mt-4 pl-7 space-y-5">
              {/* Creative source */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Creative source</p>
                <div className="space-y-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={metaCreativeSource === 'manual'}
                      onChange={() => setMetaCreativeSource('manual')}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="text-sm text-gray-900">Manual upload</span>
                      <span className="block text-xs text-gray-500">Manually upload images or videos</span>
                    </span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={metaCreativeSource === 'catalogue'}
                      onChange={() => setMetaCreativeSource('catalogue')}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="text-sm text-gray-900">Advantage+ catalogue ads</span>
                      <span className="block text-xs text-gray-500">Automatically show relevant product media from your catalogue</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Format */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Format</p>
                <p className="text-xs text-gray-500 mb-2">Choose an ad creative layout.</p>
                <div className="space-y-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="radio" checked={metaFormat === 'single'} onChange={() => setMetaFormat('single')} className="mt-0.5" />
                    <span>
                      <span className="text-sm text-gray-900">Single image or video</span>
                      <span className="block text-xs text-gray-500">One image or video, or a slideshow with multiple images</span>
                    </span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="radio" checked={metaFormat === 'carousel'} onChange={() => setMetaFormat('carousel')} className="mt-0.5" />
                    <span>
                      <span className="text-sm text-gray-900">Carousel</span>
                      <span className="block text-xs text-gray-500">{CAROUSEL_SPEC.cards} · {CAROUSEL_SPEC.recommendedResolution}</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Multi-advertiser ads */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={multiAdvertiser}
                  onChange={(e) => setMultiAdvertiser(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  <span className="text-sm text-gray-900">Multi-advertiser ads</span>
                  <span className="block text-xs text-gray-500">Your ad can appear with others in the same ad unit to help promote discoverability</span>
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Destination */}
        <div className="py-4">
          {sectionHeader('destination', 'Destination')}
          {metaExpandedSections.destination && (
            <div className="mt-4 pl-7 space-y-4">
              <p className="text-xs text-gray-500">Tell us where to send people immediately after they tap or click your ad.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={metaDestinationUrl}
                  onChange={(e) => setMetaDestinationUrl(e.target.value)}
                  placeholder="https://example.com/landing-page"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display link</label>
                <input
                  type="text"
                  value={linkDisplay}
                  onChange={(e) => setLinkDisplay(e.target.value)}
                  placeholder="example.com"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">Shown instead of the full URL</p>
              </div>

              {/* Browser add-ons */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Browser add-ons</p>
                <div className="space-y-2">
                  {([
                    { id: 'none', label: 'None', hint: "Don't add a button." },
                    { id: 'call', label: 'Call', hint: 'Add a call button on your website.' },
                    { id: 'messenger', label: 'Messenger', hint: 'Add a Messenger button on your website.' },
                    { id: 'whatsapp', label: 'WhatsApp', hint: 'Add a WhatsApp button on your website.' },
                    { id: 'instant-form', label: 'Instant form', hint: "Collect people's contact information." },
                  ] as const).map((addon) => (
                    <label key={addon.id} className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={browserAddon === addon.id}
                        onChange={() => setBrowserAddon(addon.id)}
                        className="mt-0.5"
                      />
                      <span>
                        <span className="text-sm text-gray-900">{addon.label}</span>
                        <span className="block text-xs text-gray-500">{addon.hint}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ad creative — Media */}
        <div className="py-4">
          {sectionHeader(
            'media',
            'Media',
            <span className={`text-xs px-2 py-0.5 rounded ${mediaCount ? 'bg-gray-100 text-gray-600' : 'bg-red-50 text-red-600'}`}>
              {mediaCount} of 10 selected
            </span>,
            <span className="text-xs text-red-500">Required</span>
          )}
          {metaExpandedSections.media && (
            <div className="mt-4 pl-7 space-y-3">
              {/* Placement spec callout — from Meta's current ads guide */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 space-y-1">
                <p className="font-semibold">{spec.label} — recommended media</p>
                <p>Image: {spec.image.recommendedResolution} · {spec.image.ratioLabel} · {spec.image.fileTypes.join('/')} · max {spec.image.maxFileMB} MB</p>
                <p>
                  Video: {spec.video.recommendedResolution} · {spec.video.fileTypes.join(' or ')} · max 4 GB
                  {spec.video.maxDurationSec ? ` · up to ${spec.video.maxDurationSec >= 3600 ? `${Math.round(spec.video.maxDurationSec / 3600 * 10) / 10} h` : spec.video.maxDurationSec >= 90 ? `${Math.round(spec.video.maxDurationSec / 60)} min` : `${spec.video.maxDurationSec} s`}` : ''}
                  {spec.video.sweetSpot ? ` · sweet spot ${spec.video.sweetSpot}` : ''}
                </p>
                {spec.safeZone && <p>Safe zone: {spec.safeZone}</p>}
              </div>
              {metaFormat === 'carousel' && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
                  Carousel: {CAROUSEL_SPEC.cards}. {CAROUSEL_SPEC.ratioLabel}, {CAROUSEL_SPEC.recommendedResolution}. The first {Math.min(10, mediaCount) || 2} uploaded media become your cards.
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                {metaMediaUrls.slice(0, mediaSlots).map((url, i) => (
                  <MetaMediaUpload
                    key={i}
                    label={`Media ${i + 1}`}
                    value={url}
                    kind={metaMediaKinds[i]}
                    placement={metaAdType}
                    onChange={(newUrl, kind) => setMediaAt(i, newUrl, kind)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Primary text */}
        <div className="py-4">
          {sectionHeader('primaryText', 'Primary text', <span className="text-xs text-gray-500">{primaryTexts.filter(t => t.trim()).length}/5 added</span>)}
          {metaExpandedSections.primaryText && (
            <div className="mt-4 pl-7 space-y-3">
              <p className="text-xs text-gray-500">
                {META_TEXT_LIMITS.primaryVisible} characters visible before &ldquo;See more&rdquo; ({META_TEXT_LIMITS.primaryMax.toLocaleString()} max). Reels: 72 visible.
                {textGeneration && <span className="text-blue-600"> AI will generate additional variations.</span>}
              </p>
              {primaryTexts.slice(0, visiblePrimaryTexts).map((text, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-start gap-2">
                    <textarea
                      value={text}
                      onChange={(e) => {
                        const newTexts = [...primaryTexts];
                        newTexts[i] = e.target.value;
                        setPrimaryTexts(newTexts);
                        if (i === 0) setPrimaryText(e.target.value);
                      }}
                      placeholder={`Primary text ${i + 1}${i === 0 ? ' *' : ''}`}
                      rows={3}
                      maxLength={META_TEXT_LIMITS.primaryMax}
                      className={`flex-1 px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm resize-none ${
                        i === 0 ? 'border-blue-200 bg-blue-50/50' : 'border-gray-300'
                      } ${text.length > META_TEXT_LIMITS.primaryVisible ? 'border-yellow-300 bg-yellow-50' : ''}`}
                    />
                    {visiblePrimaryTexts > 1 && (
                      <button
                        onClick={() => removePrimaryText(i)}
                        className="text-gray-400 hover:text-gray-600 mt-2"
                        title="Remove this text option"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className={`text-right text-xs pr-1 font-medium ${
                    text.length > META_TEXT_LIMITS.primaryVisible ? 'text-yellow-600' : text.length > 50 ? 'text-green-500' : 'text-gray-400'
                  }`}>
                    {text.length}/{META_TEXT_LIMITS.primaryVisible} visible
                    {text.length > META_TEXT_LIMITS.primaryVisible && <span> — truncated with &ldquo;See more&rdquo;</span>}
                  </div>
                </div>
              ))}
              {visiblePrimaryTexts < 5 && (
                <button
                  onClick={() => setVisiblePrimaryTexts(Math.min(visiblePrimaryTexts + 1, 5))}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add text option
                </button>
              )}
            </div>
          )}
        </div>

        {/* Headline */}
        <div className="py-4">
          {sectionHeader('headlines', 'Headline', <span className="text-xs text-gray-500">{metaHeadlines.filter(h => h.trim()).length}/5 added</span>)}
          {metaExpandedSections.headlines && (
            <div className="mt-4 pl-7 space-y-3">
              <p className="text-xs text-gray-500">
                ~27 characters visible in Feed, {META_TEXT_LIMITS.headlineRecommended} recommended ({META_TEXT_LIMITS.headlineMax} max).
                {optimizeTextPerPerson && <span className="text-blue-600"> May swap with primary text per person.</span>}
              </p>
              {metaHeadlines.slice(0, visibleMetaHeadlines).map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={h}
                    onChange={(e) => {
                      const newHeadlines = [...metaHeadlines];
                      newHeadlines[i] = e.target.value;
                      setMetaHeadlines(newHeadlines);
                      if (i === 0) setHeadline(e.target.value);
                    }}
                    placeholder={`Headline ${i + 1}${i === 0 ? ' *' : ''}`}
                    maxLength={META_TEXT_LIMITS.headlineMax}
                    className={`flex-1 px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                      i === 0 ? 'border-blue-200 bg-blue-50/50' : 'border-gray-300'
                    } ${h.length > META_TEXT_LIMITS.headlineRecommended ? 'border-yellow-300 bg-yellow-50' : ''}`}
                  />
                  <span className={`text-xs w-12 text-right font-medium ${
                    h.length > META_TEXT_LIMITS.headlineRecommended ? 'text-yellow-600' : h.length >= 20 ? 'text-green-500' : 'text-gray-400'
                  }`}>{h.length}/{META_TEXT_LIMITS.headlineRecommended}</span>
                  {visibleMetaHeadlines > 1 && (
                    <button
                      onClick={() => removeMetaHeadline(i)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Remove this headline"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              {visibleMetaHeadlines < 5 && (
                <button
                  onClick={() => setVisibleMetaHeadlines(Math.min(visibleMetaHeadlines + 1, 5))}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add headline option
                </button>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="py-4">
          {sectionHeader('description', 'Description', undefined, <span className="text-xs text-gray-400">(optional)</span>)}
          {metaExpandedSections.description && (
            <div className="mt-4 pl-7">
              <p className="text-xs text-gray-500 mb-2">~{META_TEXT_LIMITS.descriptionVisible} characters visible. Only shown on some placements (Feed link band, Marketplace, Search).</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={metaDescription}
                  onChange={(e) => {
                    setMetaDescription(e.target.value);
                    setDescription(e.target.value);
                  }}
                  placeholder="Link description"
                  maxLength={META_TEXT_LIMITS.descriptionVisible}
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <span className="text-xs text-gray-400 w-10 text-right">{metaDescription.length}/{META_TEXT_LIMITS.descriptionVisible}</span>
              </div>
            </div>
          )}
        </div>

        {/* Optimise text per person + CTA */}
        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900">Optimise text per person</span>
              <p className="text-xs text-gray-500">Swap primary text, headline and description positions when it&apos;s likely to improve performance</p>
            </div>
            <button
              onClick={() => setOptimizeTextPerPerson(!optimizeTextPerPerson)}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${optimizeTextPerPerson ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${optimizeTextPerPerson ? 'translate-x-5' : ''}`} />
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Call to action</label>
            <select
              value={metaCtaText}
              onChange={(e) => setMetaCtaText(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white"
            >
              {metaCtaOptions.map((cta) => (
                <option key={cta} value={cta} className="text-gray-900">{cta}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Advantage+ creative enhancements */}
        <div className="py-4">
          {sectionHeader(
            'advantagePlus',
            'Advantage+ creative enhancements',
            <span className={`text-xs px-2 py-0.5 rounded ${advantagePlusCreative ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {[advantagePlusCreative, textGeneration, optimizeTextPerPerson].filter(Boolean).length}/3 on
            </span>
          )}
          {metaExpandedSections.advantagePlus && (
            <div className="mt-4 pl-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-700">Advantage+ creative</span>
                  <p className="text-xs text-gray-500">AI-driven optimisations: relevant comments, enhance CTA, visual touch-ups</p>
                </div>
                <button
                  onClick={() => setAdvantagePlusCreative(!advantagePlusCreative)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${advantagePlusCreative ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${advantagePlusCreative ? 'translate-x-5' : ''}`} />
                </button>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <div>
                  <span className="text-sm text-gray-700">Text generation</span>
                  <p className="text-xs text-gray-500">AI creates up to 5 versions of your text</p>
                </div>
                <button
                  onClick={() => setTextGeneration(!textGeneration)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${textGeneration ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${textGeneration ? 'translate-x-5' : ''}`} />
                </button>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <span className="text-sm text-gray-700">Customer lifecycle strategy</span>
                <p className="text-xs text-gray-500 mb-2">Choose who sees your ads</p>
                <select
                  value={lifecycleStrategy}
                  onChange={(e) => setLifecycleStrategy(e.target.value as 'all' | 'new-customers')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white"
                >
                  <option value="all" className="text-gray-900">Get conversions from all audiences</option>
                  <option value="new-customers" className="text-gray-900">Acquire new customers only</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Placement note for the current preview */}
        <div className="py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium">Previewing: {spec.label}</p>
                <p className="text-xs text-blue-600 mt-1">{spec.textNotes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Full media spec sheet (all placements) */}
        <div className="py-4">
          {sectionHeader('specs', 'Meta media specs (2026)', undefined, <span className="text-xs text-gray-400">reference</span>)}
          {metaExpandedSections.specs && (
            <div className="mt-4 pl-7 overflow-x-auto">
              <table className="w-full text-xs border border-gray-200 rounded">
                <thead>
                  <tr className="bg-gray-50 text-gray-600">
                    <th className="text-left px-2 py-1.5 font-medium">Placement</th>
                    <th className="text-left px-2 py-1.5 font-medium">Ratio</th>
                    <th className="text-left px-2 py-1.5 font-medium">Resolution</th>
                    <th className="text-left px-2 py-1.5 font-medium">Video max</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {(Object.keys(META_SPECS) as (keyof typeof META_SPECS)[]).map((key) => {
                    const s = META_SPECS[key];
                    const dur = s.video.maxDurationSec || 0;
                    return (
                      <tr key={key} className={key === metaAdType ? 'bg-blue-50/60' : ''}>
                        <td className="px-2 py-1.5">{s.label}</td>
                        <td className="px-2 py-1.5">{s.video.ratios.length > 1 ? '4:5 / 1:1' : key.includes('feed') ? '4:5' : '9:16'}</td>
                        <td className="px-2 py-1.5">{s.image.recommendedResolution.replace(/ \(.*\)/, '')}</td>
                        <td className="px-2 py-1.5">{dur >= 3600 ? `${Math.round(dur / 3600 * 10) / 10} h` : dur >= 90 ? `${Math.round(dur / 60)} min` : `${dur} s`}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="text-[11px] text-gray-400 mt-2">
                Images: JPG/PNG, max 30 MB. Video: MP4/MOV (H.264, AAC 128 kbps+), max 4 GB. Keep the short edge at 1080 px or above — lower resolution is silently deprioritised. Since March 2026, all Stories/Reels share one 9:16 safe zone (top 14%, bottom 35%, sides 6%).
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // TikTok Editor — mirrors TikTok Ads Manager's ad-level flow (2026 specs)
  const renderTikTokEditor = () => {
    return (
      <div className="space-y-6">
        {/* Identity */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Identity</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Display name</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="yourbrand"
                  maxLength={TIKTOK_TEXT_LIMITS.displayNameMax}
                  className={`flex-1 px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                    username.length > 0 && username.length < TIKTOK_TEXT_LIMITS.displayNameMin ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                <span className="text-xs text-gray-400 w-12 text-right">{username.length}/{TIKTOK_TEXT_LIMITS.displayNameMax}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{TIKTOK_TEXT_LIMITS.displayNameMin}–{TIKTOK_TEXT_LIMITS.displayNameMax} characters</p>
            </div>
            <ImageUpload
              value={pageImageUrl}
              onChange={setPageImageUrl}
              label="Profile picture"
              aspectRatio="1:1"
            />
          </div>
        </div>

        {/* Video / media */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Video</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 space-y-1 mb-3">
            <p className="font-semibold">TikTok In-Feed — recommended media</p>
            <p>Video: {TIKTOK_SPEC.video.recommendedResolution} · {TIKTOK_SPEC.video.ratioLabel}</p>
            <p>{TIKTOK_SPEC.video.fileTypes.join('/')} · max {TIKTOK_SPEC.video.maxFileMB} MB · {TIKTOK_SPEC.video.minDurationSec}–{TIKTOK_SPEC.video.maxDurationSec} s (sweet spot {TIKTOK_SPEC.video.sweetSpot})</p>
            <p>Bitrate: minimum {TIKTOK_MIN_BITRATE}</p>
            {TIKTOK_SPEC.safeZone && <p>Safe zone: {TIKTOK_SPEC.safeZone}</p>}
          </div>
          <MetaMediaUpload
            label="Ad video"
            value={tiktokMediaUrl}
            kind={tiktokMediaKind}
            customSpec={TIKTOK_SPEC}
            onChange={(url, kind) => {
              setTiktokMediaUrl(url);
              setTiktokMediaKind(kind);
            }}
          />
        </div>

        {/* Ad text */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Ad text</h3>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Your ad text (shows as the caption)"
            rows={3}
            maxLength={TIKTOK_TEXT_LIMITS.adTextMax}
            className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm resize-none ${
              caption.length >= TIKTOK_TEXT_LIMITS.adTextMax ? 'border-red-300 bg-red-50' : caption.length > 80 ? 'border-yellow-300 bg-yellow-50' : 'border-gray-300'
            }`}
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-400">Emojis and hashtags count towards the limit</span>
            <span className={`text-xs font-medium ${
              caption.length >= TIKTOK_TEXT_LIMITS.adTextMax ? 'text-red-500' : caption.length > 80 ? 'text-yellow-600' : 'text-gray-400'
            }`}>{caption.length}/{TIKTOK_TEXT_LIMITS.adTextMax}</span>
          </div>
        </div>

        {/* CTA */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Call to action</h3>
          <select
            value={tiktokCta}
            onChange={(e) => setTiktokCta(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white"
          >
            {TIKTOK_CTAS.map((cta) => (
              <option key={cta} value={cta} className="text-gray-900">{cta}</option>
            ))}
          </select>
        </div>

        {/* Placement note */}
        <div className="border-t border-gray-200 pt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium">Previewing: TikTok In-Feed ad</p>
                <p className="text-xs text-blue-600 mt-1">{TIKTOK_SPEC.textNotes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // TikTok Preview
  const renderTikTokPreview = () => {
    return (
      <TikTokFeedAd
        username={username || 'username'}
        caption={caption}
        imageUrl={tiktokMediaUrl || metaImageUrl}
        mediaKind={tiktokMediaKind}
        ctaText={tiktokCta}
        profileImageUrl={pageImageUrl}
      />
    );
  };

  // Microsoft Advertising (Bing) Editor — RSA + Audience Network (2026 specs)
  const renderBingEditor = () => {
    if (bingAdType === 'audience') {
      return (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 space-y-1">
            <p className="font-semibold">Microsoft Audience Network — native ads on MSN, Outlook.com and Edge</p>
            <p>Image: {BING_AUDIENCE_IMAGE.recommendedResolution} · {BING_AUDIENCE_IMAGE.ratioLabel}</p>
            <p>{BING_AUDIENCE_IMAGE.fileTypes.join('/')} · max {BING_AUDIENCE_IMAGE.maxFileMB} MB · minimum {BING_AUDIENCE_IMAGE.minWidth} × {BING_AUDIENCE_IMAGE.minHeight} px</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Image</h3>
            <MetaMediaUpload
              label="Audience ad image"
              value={bingImageUrl}
              kind="image"
              imageOnly
              customSpec={{
                label: 'Microsoft Audience Network',
                image: BING_AUDIENCE_IMAGE,
                video: BING_AUDIENCE_IMAGE,
                textNotes: '',
              }}
              onChange={(url) => setBingImageUrl(url)}
            />
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Ad copy</h3>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Short headline</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={bingShortHeadline}
                  onChange={(e) => setBingShortHeadline(e.target.value)}
                  placeholder="Short headline"
                  maxLength={BING_AUDIENCE.shortHeadlineMax}
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <span className="text-xs text-gray-400 w-12 text-right">{bingShortHeadline.length}/{BING_AUDIENCE.shortHeadlineMax}</span>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Long headline</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={bingLongHeadline}
                  onChange={(e) => setBingLongHeadline(e.target.value)}
                  placeholder="Long headline"
                  maxLength={BING_AUDIENCE.longHeadlineMax}
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <span className="text-xs text-gray-400 w-12 text-right">{bingLongHeadline.length}/{BING_AUDIENCE.longHeadlineMax}</span>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Ad text</label>
              <div className="flex items-start gap-2">
                <textarea
                  value={bingText}
                  onChange={(e) => setBingText(e.target.value)}
                  placeholder="Ad text"
                  rows={2}
                  maxLength={BING_AUDIENCE.adTextMax}
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
                <span className="text-xs text-gray-400 w-12 text-right pt-2">{bingText.length}/{BING_AUDIENCE.adTextMax}</span>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Business name</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={bingBusinessName}
                  onChange={(e) => setBingBusinessName(e.target.value)}
                  placeholder="Your business"
                  maxLength={BING_AUDIENCE.businessNameMax}
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <span className="text-xs text-gray-400 w-12 text-right">{bingBusinessName.length}/{BING_AUDIENCE.businessNameMax}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Responsive search ad on the Bing SERP
    const filledBingHeadlines = bingHeadlines.filter(h => h.trim()).length;
    const filledBingDescriptions = bingDescriptions.filter(d => d.trim()).length;
    return (
      <div className="space-y-6">
        <div>
          <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
            Final URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={bingFinalUrl}
            onChange={(e) => setBingFinalUrl(e.target.value)}
            placeholder="https://example.com/landing-page"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Display path</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{(bingFinalUrl.replace(/^https?:\/\//, '').split('/')[0]) || 'example.com'} /</span>
              <input
                type="text"
                value={bingPath1}
                onChange={(e) => setBingPath1(e.target.value)}
                placeholder="path1"
                maxLength={BING_RSA.pathMax}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <span className="text-gray-400">/</span>
              <input
                type="text"
                value={bingPath2}
                onChange={(e) => setBingPath2(e.target.value)}
                placeholder="path2"
                maxLength={BING_RSA.pathMax}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Headlines */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">Headlines ({BING_RSA.headlineMax} chars max)</h3>
            <span className="text-xs text-gray-500">{filledBingHeadlines}/{BING_RSA.headlineCount} added · min {BING_RSA.headlineMin}</span>
          </div>
          <div className="space-y-3">
            {bingHeadlines.slice(0, visibleBingHeadlines).map((h, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm text-gray-400 w-5">{i + 1}</span>
                <input
                  type="text"
                  value={h}
                  onChange={(e) => {
                    const next = [...bingHeadlines];
                    next[i] = e.target.value;
                    setBingHeadlines(next);
                  }}
                  placeholder={`Headline ${i + 1}${i < BING_RSA.headlineMin ? ' *' : ''}`}
                  maxLength={BING_RSA.headlineMax}
                  className={`flex-1 px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${
                    i < BING_RSA.headlineMin ? 'border-blue-200 bg-blue-50/50' : 'border-gray-300'
                  } ${h.length >= BING_RSA.headlineMax ? 'border-red-300 bg-red-50' : ''}`}
                />
                <span className={`text-xs w-10 text-right font-medium ${
                  h.length >= BING_RSA.headlineMax ? 'text-red-500' : h.length >= 20 ? 'text-green-500' : 'text-gray-400'
                }`}>{h.length}/{BING_RSA.headlineMax}</span>
              </div>
            ))}
            {visibleBingHeadlines < BING_RSA.headlineCount && (
              <button
                onClick={() => setVisibleBingHeadlines(Math.min(visibleBingHeadlines + 3, BING_RSA.headlineCount))}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add more headlines
              </button>
            )}
          </div>
        </div>

        {/* Descriptions */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">Descriptions ({BING_RSA.descriptionMax} chars max)</h3>
            <span className="text-xs text-gray-500">{filledBingDescriptions}/{BING_RSA.descriptionCount} added · min {BING_RSA.descriptionMin}</span>
          </div>
          <div className="space-y-3">
            {bingDescriptions.slice(0, visibleBingDescriptions).map((d, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-sm text-gray-400 w-5 pt-2">{i + 1}</span>
                <textarea
                  value={d}
                  onChange={(e) => {
                    const next = [...bingDescriptions];
                    next[i] = e.target.value;
                    setBingDescriptions(next);
                  }}
                  placeholder={`Description ${i + 1}${i < BING_RSA.descriptionMin ? ' *' : ''}`}
                  rows={2}
                  maxLength={BING_RSA.descriptionMax}
                  className={`flex-1 px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm resize-none ${
                    i < BING_RSA.descriptionMin ? 'border-blue-200 bg-blue-50/50' : 'border-gray-300'
                  }`}
                />
                <span className="text-xs w-10 text-right font-medium text-gray-400 pt-2">{d.length}/{BING_RSA.descriptionMax}</span>
              </div>
            ))}
            {visibleBingDescriptions < BING_RSA.descriptionCount && (
              <button
                onClick={() => setVisibleBingDescriptions(Math.min(visibleBingDescriptions + 1, BING_RSA.descriptionCount))}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add another description
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              Microsoft responsive search ads mix and match your headlines and descriptions, showing up to 3 headlines and 2 descriptions per impression — the same model as Google RSAs. You can import Google Ads campaigns directly in Microsoft Advertising.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Bing Preview
  const renderBingPreview = () => {
    if (bingAdType === 'audience') {
      return (
        <BingAudienceAd
          imageUrl={bingImageUrl}
          shortHeadline={bingShortHeadline}
          longHeadline={bingLongHeadline}
          adText={bingText}
          businessName={bingBusinessName}
        />
      );
    }
    return (
      <BingSearchAd
        headlines={bingHeadlines}
        descriptions={bingDescriptions}
        displayUrl={(bingFinalUrl.replace(/^https?:\/\//, '').split('/')[0]) || ''}
        path1={bingPath1}
        path2={bingPath2}
        businessName={bingBusinessName}
      />
    );
  };

  // UTM Builder Editor
  const renderUtmEditor = () => {
    return (
      <div className="space-y-6">
        {/* Base URL */}
        <div>
          <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
            Website URL
            <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={utmBaseUrl}
            onChange={(e) => setUtmBaseUrl(e.target.value)}
            placeholder="https://example.com/landing-page"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
          />
        </div>

        {/* Required Parameters */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Required Parameters</h3>

          {/* Source */}
          <div className="mb-4">
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-1">
              Campaign Source (utm_source)
              <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={utmSource}
                onChange={(e) => setUtmSource(e.target.value)}
                placeholder="google, facebook, newsletter"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
              />
              <select
                value=""
                onChange={(e) => setUtmSource(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white"
              >
                <option value="">Quick fill</option>
                {utmSourceOptions.map(opt => (
                  <option key={opt} value={opt} className="text-gray-900">{opt}</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-1">Identifies the advertiser, site, or publication</p>
          </div>

          {/* Medium */}
          <div className="mb-4">
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-1">
              Campaign Medium (utm_medium)
              <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={utmMedium}
                onChange={(e) => setUtmMedium(e.target.value)}
                placeholder="cpc, email, social"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
              />
              <select
                value=""
                onChange={(e) => setUtmMedium(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white"
              >
                <option value="">Quick fill</option>
                {utmMediumOptions.map(opt => (
                  <option key={opt} value={opt} className="text-gray-900">{opt}</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-1">Marketing medium: cpc, banner, email</p>
          </div>

          {/* Campaign */}
          <div className="mb-4">
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-1">
              Campaign Name (utm_campaign)
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={utmCampaign}
              onChange={(e) => setUtmCampaign(e.target.value)}
              placeholder="spring_sale, product_launch"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">Product, promo code, or slogan</p>
          </div>
        </div>

        {/* Optional Parameters */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Optional Parameters</h3>

          {/* Term */}
          <div className="mb-4">
            <label className="text-sm text-gray-700 mb-1 block">Campaign Term (utm_term)</label>
            <input
              type="text"
              value={utmTerm}
              onChange={(e) => setUtmTerm(e.target.value)}
              placeholder="running+shoes, best+deals"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">Paid keywords (for search ads)</p>
          </div>

          {/* Content */}
          <div className="mb-4">
            <label className="text-sm text-gray-700 mb-1 block">Campaign Content (utm_content)</label>
            <input
              type="text"
              value={utmContent}
              onChange={(e) => setUtmContent(e.target.value)}
              placeholder="logolink, textlink, banner_v2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">Differentiate ads or links pointing to same URL</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={copyUtmUrl}
            disabled={!utmBaseUrl || !utmSource || !utmMedium || !utmCampaign}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 btn-gradient text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 shine"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Copy URL
          </button>
          <button
            onClick={clearUtmForm}
            className="px-5 py-3 text-gray-700 font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-md transition-all duration-300 card-hover"
          >
            Clear
          </button>
        </div>
      </div>
    );
  };

  // UTM Preview
  const renderUtmPreview = () => {
    const generatedUrl = generateUtmUrl();

    return (
      <div className="space-y-6">
        {/* Generated URL */}
        <div className="glass rounded-xl border border-white/20 p-5 shadow-lg">
          <h3 className="text-sm font-bold gradient-text mb-4">Generated URL</h3>
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 break-all border border-gray-100">
            {generatedUrl ? (
              <code className="text-sm text-indigo-600 font-medium">{generatedUrl}</code>
            ) : (
              <span className="text-sm text-gray-400">Enter a URL and UTM parameters to generate...</span>
            )}
          </div>
          {generatedUrl && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={copyUtmUrl}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy
              </button>
              <a
                href={generatedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Test Link
              </a>
            </div>
          )}

          {/* QR Code */}
          {generatedUrl && (
            <div className="mt-6 flex flex-col items-center">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Scan QR Code</h4>
              <div className="qr-container shadow-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generatedUrl)}`}
                  alt="QR Code"
                  className="w-36 h-36"
                />
              </div>
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(generatedUrl)}&format=png`}
                download="utm-qr-code.png"
                className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download QR
              </a>
            </div>
          )}
        </div>

        {/* URL Breakdown */}
        {generatedUrl && (
          <div className="glass rounded-xl border border-white/20 p-5 shadow-lg">
            <h3 className="text-sm font-bold gradient-text mb-4">Parameter Breakdown</h3>
            <div className="space-y-2">
              {utmSource && (
                <div className="flex items-center text-sm">
                  <span className="w-28 text-gray-500">utm_source:</span>
                  <span className="text-gray-900 font-medium">{utmSource}</span>
                </div>
              )}
              {utmMedium && (
                <div className="flex items-center text-sm">
                  <span className="w-28 text-gray-500">utm_medium:</span>
                  <span className="text-gray-900 font-medium">{utmMedium}</span>
                </div>
              )}
              {utmCampaign && (
                <div className="flex items-center text-sm">
                  <span className="w-28 text-gray-500">utm_campaign:</span>
                  <span className="text-gray-900 font-medium">{utmCampaign}</span>
                </div>
              )}
              {utmTerm && (
                <div className="flex items-center text-sm">
                  <span className="w-28 text-gray-500">utm_term:</span>
                  <span className="text-gray-900 font-medium">{utmTerm}</span>
                </div>
              )}
              {utmContent && (
                <div className="flex items-center text-sm">
                  <span className="w-28 text-gray-500">utm_content:</span>
                  <span className="text-gray-900 font-medium">{utmContent}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History */}
        {utmHistory.length > 0 && (
          <div className="glass rounded-xl border border-white/20 p-5 shadow-lg">
            <h3 className="text-sm font-bold gradient-text mb-4">Recent URLs</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {utmHistory.map((url, i) => (
                <div key={i} className="flex items-center gap-3 text-sm bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-colors">
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(url);
                      alert('Copied!');
                    }}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                  <span className="truncate text-gray-600">{url}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-5 shadow-md">
          <h3 className="text-sm font-bold text-indigo-800 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            UTM Best Practices
          </h3>
          <ul className="text-xs text-indigo-700 space-y-2">
            <li className="flex items-start gap-2"><span className="text-indigo-400">•</span> Use lowercase letters and underscores (no spaces)</li>
            <li className="flex items-start gap-2"><span className="text-indigo-400">•</span> Be consistent with naming conventions</li>
            <li className="flex items-start gap-2"><span className="text-indigo-400">•</span> Keep campaign names short but descriptive</li>
            <li className="flex items-start gap-2"><span className="text-indigo-400">•</span> Document your UTM parameters in a spreadsheet</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderGooglePreview = () => {
    switch (googleAdType) {
      case 'search':
        return (
          <GoogleSearchAd
            headlines={headlines}
            descriptions={descriptions}
            displayUrl={displayUrl}
            path1={path1}
            path2={path2}
            businessName={businessName}
            businessLogoUrl={businessLogoUrl}
            sitelinks={sitelinks}
            callouts={callouts}
            structuredSnippets={{ header: snippetHeader, values: snippetValues }}
            phoneNumber={phoneNumber}
            priceAssets={priceAssets}
            promotion={promotion}
            imageUrls={searchImageUrls}
          />
        );
      case 'display':
        return <GoogleDisplayAd headline={headline} description={description} businessName={businessName} imageUrl={imageUrl} ctaText={ctaText} size={displaySize} />;
      case 'youtube-instream':
        return <YouTubeInStreamAd headline={headline} description={description} displayUrl={displayUrl} ctaText={ctaText} thumbnailUrl={imageUrl} />;
      case 'youtube-shorts':
        return <YouTubeShortsAd username={username} description={description} ctaText={ctaText} imageUrl={imageUrl} />;
      case 'gmail':
        return <GmailAd senderName={businessName} subject={headline} previewText={description} logoUrl={logoUrl} />;
      case 'discover':
        return <DiscoverAd headline={headline} description={description} businessName={businessName} imageUrl={imageUrl} logoUrl={logoUrl} />;
      case 'shopping':
        return (
          <GoogleShoppingAd
            productTitle={productTitle}
            productPrice={productPrice}
            storeName={productStore || businessName}
            imageUrl={productImageUrl}
            rating={productRating}
            reviewCount={productReviewCount}
            shipping={productShipping}
          />
        );
    }
  };

  const renderMetaPreview = () => {
    // Use Instagram account or page name for username
    const displayUsername = instagramAccount || pageName || 'username';
    // Use first primary text as caption for Instagram
    const displayCaption = primaryTexts[0] || primaryText || caption;
    // Use first headline
    const displayHeadline = metaHeadlines[0] || headline;
    // Placement customisation (like Meta's): among the uploaded media, pick the
    // one whose aspect ratio best fits this placement — 9:16 media serves
    // Stories/Reels, 4:5 / 1:1 media serves Feed.
    const filledMedia = metaMediaUrls.map((url, i) => ({ url, i })).filter(m => m.url);
    const pickBest = (targetRatio: number) => {
      let best = filledMedia.length ? filledMedia[0].i : -1;
      let bestScore = Infinity;
      filledMedia.forEach(({ i }) => {
        const r = metaMediaRatios[i];
        // Unknown ratios rank last; otherwise distance in log-space (symmetric for crops)
        const score = r === null ? 999 : Math.abs(Math.log(r / targetRatio));
        if (score < bestScore - 1e-9) {
          bestScore = score;
          best = i;
        }
      });
      return best;
    };
    const mediaAt = (idx: number): { url?: string; kind?: MediaKind } => {
      const url = idx >= 0 ? metaMediaUrls[idx] : metaImageUrl;
      const kind: MediaKind = idx >= 0
        ? metaMediaKinds[idx]
        : looksLikeVideoUrl(url) ? 'video' : 'image';
      return { url: url || undefined, kind };
    };
    // Carousel cards: all filled media, in order
    const carouselCards = metaFormat === 'carousel'
      ? metaMediaUrls
          .map((url, i) => ({ url, kind: metaMediaKinds[i] }))
          .filter(card => card.url)
      : undefined;

    // Ads Manager-style "All placements" grid
    if (metaView === 'all') {
      return (
        <div className="w-full">
          <MetaAllPlacements
            pageName={pageName}
            username={displayUsername}
            pageImageUrl={pageImageUrl}
            primaryText={primaryTexts[0] || primaryText}
            caption={displayCaption}
            headline={displayHeadline}
            description={metaDescription || description}
            ctaText={metaCtaText}
            linkDisplay={linkDisplay}
            feedMedia={mediaAt(pickBest(4 / 5))}
            verticalMedia={mediaAt(pickBest(9 / 16))}
            carouselCards={carouselCards}
          />
          <p className="mt-6 text-[10px] text-gray-400 text-center">
            Ad rendering and interaction may vary based on device, format and other factors.
          </p>
        </div>
      );
    }

    const isVertical = metaAdType === 'fb-stories' || metaAdType === 'ig-stories' || metaAdType === 'ig-reels';
    const bestMediaIndex = pickBest(isVertical ? 9 / 16 : 4 / 5);
    const displayImageUrl = bestMediaIndex >= 0 ? metaMediaUrls[bestMediaIndex] : metaImageUrl;
    const displayMediaKind: MediaKind = bestMediaIndex >= 0
      ? metaMediaKinds[bestMediaIndex]
      : looksLikeVideoUrl(displayImageUrl) ? 'video' : 'image';

    const placement = (() => {
      switch (metaAdType) {
        case 'fb-feed':
          return <MetaFeedAd pageName={pageName} primaryText={primaryTexts[0] || primaryText} headline={displayHeadline} description={metaDescription || description} imageUrl={displayImageUrl} mediaKind={displayMediaKind} carouselCards={carouselCards} ctaText={metaCtaText} linkDisplay={linkDisplay} pageImageUrl={pageImageUrl} device={metaDevice} />;
        case 'fb-stories':
          return <FacebookStoriesAd pageName={pageName} pageImageUrl={pageImageUrl} imageUrl={displayImageUrl} mediaKind={displayMediaKind} headline={displayHeadline} ctaText={metaCtaText} linkDisplay={linkDisplay} />;
        case 'ig-feed':
          return <InstagramFeedAd username={displayUsername} caption={displayCaption} imageUrl={displayImageUrl} mediaKind={displayMediaKind} ctaText={metaCtaText} website={linkDisplay} profileImageUrl={pageImageUrl} />;
        case 'ig-stories':
          return <InstagramStoryAd username={displayUsername} imageUrl={displayImageUrl} mediaKind={displayMediaKind} ctaText={metaCtaText} profileImageUrl={pageImageUrl} />;
        case 'ig-reels':
          return <InstagramReelsAd username={displayUsername} caption={displayCaption} imageUrl={displayImageUrl} mediaKind={displayMediaKind} ctaText={metaCtaText} profileImageUrl={pageImageUrl} />;
      }
    })();

    const spec = META_SPECS[metaAdType];
    const activeSpec = displayMediaKind === 'video' ? spec.video : spec.image;

    // Ads Manager-style preview chrome around the placement mockup
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800">Ad preview</span>
            <span className="text-xs text-gray-500 bg-white border border-gray-200 rounded-full px-2 py-0.5">{spec.label}</span>
          </div>
          <div className="flex items-center gap-2">
            {metaAdType === 'fb-feed' && (
              <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
                {(['mobile', 'desktop'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setMetaDevice(d)}
                    className={`px-2.5 py-1 transition-colors ${
                      metaDevice === d ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {d === 'mobile' ? 'Mobile' : 'Desktop'}
                  </button>
                ))}
              </div>
            )}
            <span className="text-[11px] text-gray-400">{metaFormat === 'carousel' ? 'Carousel' : 'Single image or video'}</span>
          </div>
        </div>
        <div className="flex justify-center">{placement}</div>
        <div className="mt-3 space-y-1 text-center">
          {filledMedia.length > 1 && bestMediaIndex >= 0 && (
            <p className="text-[11px] text-blue-600">
              Showing Media {bestMediaIndex + 1} — best aspect-ratio fit for {spec.label} (placement customisation)
            </p>
          )}
          <p className="text-[11px] text-gray-500">
            Recommended: {activeSpec.recommendedResolution} · {activeSpec.ratioLabel}
          </p>
          <p className="text-[10px] text-gray-400">
            Ad rendering and interaction may vary based on device, format and other factors.
          </p>
        </div>
      </div>
    );
  };

  // Sign-in gate — full-screen, shown only when APP_PASSWORD is configured.
  // Shared preview links bypass it so recipients can always view them.
  if (authChecked && authEnabled && !tokenValid(authToken) && !sharedView) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
        <div className="glass rounded-3xl shadow-2xl p-10 w-full max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl btn-gradient flex items-center justify-center shadow-lg glow">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold gradient-text mb-1">Ad Preview Builder</h1>
          <p className="text-sm text-gray-500 mb-8">Sign in to continue</p>
          <input
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') doLogin(); }}
            placeholder="Password"
            autoFocus
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm text-center tracking-widest bg-white mb-3"
          />
          {loginError && <p className="text-sm text-red-500 mb-3">{loginError}</p>}
          <button
            onClick={doLogin}
            disabled={loginBusy || !loginPassword}
            className="w-full py-3 text-sm font-semibold text-white btn-gradient rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {loginBusy ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      </div>
    );
  }

  // Read-only shared view for recipients of a #s=... link: just the preview,
  // placement tabs and export — no editor, nothing written to their storage.
  if (sharedView) {
    return (
      <div className="min-h-screen gradient-bg">
        <header className="glass shadow-xl border-b border-white/20">
          <div className="max-w-3xl mx-auto px-4 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Ad Preview</h1>
              <p className="text-gray-600 text-sm mt-1">
                {platform === 'meta' ? 'Meta Ads' : platform === 'google' ? 'Google Ads' : platform === 'tiktok' ? 'TikTok' : 'Microsoft Ads'} preview shared with you
                {metaAdName && platform === 'meta' ? ` · ${metaAdName}` : ''}
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('Open this shared ad in the builder? It will replace your currently saved draft.')) {
                  if (sharedCampaignStore) {
                    localStorage.setItem(sharedCampaignStore.key, JSON.stringify(sharedCampaignStore.value));
                  }
                  window.location.hash = '';
                  setSharedView(false);
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white btn-gradient rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Open in builder
            </button>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-10">
          {platform === 'meta' && (
            <nav className="flex gap-2 overflow-x-auto pb-4 items-center justify-center">
              {([{ id: 'all' as const, label: 'All placements' }, ...metaAdTypes]).map((type) => (
                <button
                  key={type.id}
                  onClick={() => { setMetaView(type.id); if (type.id !== 'all') setMetaAdType(type.id); }}
                  className={`px-5 py-2.5 text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-300 ${
                    metaView === type.id
                      ? 'btn-gradient text-white shadow-lg glow'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:shadow-md'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </nav>
          )}
          {platform === 'bing' && (
            <nav className="flex gap-2 pb-4 items-center justify-center">
              {([
                { id: 'search' as BingAdType, label: 'Search (Bing SERP)' },
                { id: 'audience' as BingAdType, label: 'Audience Network' },
              ]).map((type) => (
                <button
                  key={type.id}
                  onClick={() => setBingAdType(type.id)}
                  className={`px-5 py-2.5 text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-300 ${
                    bingAdType === type.id
                      ? 'btn-gradient text-white shadow-lg glow'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:shadow-md'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </nav>
          )}
          <div className="glass rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold gradient-text">Preview</h2>
              <div className="flex gap-2">
                <button
                  onClick={exportAsImage}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Export as PNG"
                >
                  PNG
                </button>
                <button
                  onClick={exportAsPDF}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Export as PDF"
                >
                  PDF
                </button>
              </div>
            </div>
            <div
              ref={previewRef}
              className="flex items-center justify-center min-h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 overflow-auto border border-gray-100"
            >
              {platform === 'google' && googleCampaignType !== 'search' ? (
                <div className="text-center max-w-sm">
                  <p className="text-sm font-semibold text-gray-800 mb-2">
                    Google Ads — {googleCampaignTypes.find(c => c.id === googleCampaignType)?.label} campaign
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    This campaign type has its own builder with multiple placements. Click &ldquo;Open in builder&rdquo; above to view and edit everything that was shared.
                  </p>
                  {!sharedCampaignStore && (
                    <p className="text-xs text-amber-600">Note: the sender&rsquo;s builder had no saved data for this campaign type.</p>
                  )}
                </div>
              ) :
               platform === 'google' ? renderGooglePreview() :
               platform === 'meta' ? renderMetaPreview() :
               platform === 'tiktok' ? renderTikTokPreview() :
               renderBingPreview()}
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">
            Built with <a href={`${typeof window !== 'undefined' ? window.location.origin : ''}`} className="underline">Ad Preview Builder</a>
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={importFromJSON}
        accept=".json"
        className="hidden"
      />

      {/* Header */}
      <header className="glass shadow-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="float">
              <h1 className="text-3xl font-bold gradient-text">Ad Preview Builder</h1>
              <p className="text-gray-600 text-sm mt-1">Preview your ads before publishing to Google Ads & Meta Ads</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Share preview link */}
              {platform !== 'utm' && platform !== 'library' && (
                <button
                  onClick={shareAdPreview}
                  disabled={shareState === 'busy'}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all duration-300 disabled:opacity-60 ${
                    shareState === 'copied'
                      ? 'text-green-700 bg-green-50 border-green-300'
                      : shareState === 'failed'
                      ? 'text-red-600 bg-white border-red-300'
                      : 'text-gray-700 bg-white/80 border-gray-200 hover:bg-white hover:shadow-md card-hover'
                  }`}
                  title="Copy a shareable preview link"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  {shareState === 'busy' ? 'Copying…' : shareState === 'copied' ? 'Copied!' : shareState === 'failed' ? 'Failed' : 'Share'}
                </button>
              )}
              {/* Import */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white/80 border border-gray-200 rounded-xl hover:bg-white hover:shadow-md transition-all duration-300 card-hover"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import
              </button>
              {/* Export Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white/80 border border-gray-200 rounded-xl hover:bg-white hover:shadow-md transition-all duration-300 card-hover">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  {/* Google Sheets Section */}
                  <div className="px-3 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    Google Sheets
                  </div>
                  <button
                    onClick={copyGoogleAdsToSheets}
                    className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-blue-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google Ads ({googleCampaignTypes.find(c => c.id === googleCampaignType)?.label})
                  </button>
                  <button
                    onClick={copyMetaAdsToSheets}
                    className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-blue-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Meta Ads Only
                  </button>
                  <button
                    onClick={copyAllToSheets}
                    className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-green-50 flex items-center gap-2 border-b border-gray-100"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#34A853" d="M19 11V9h-2V7h-2v2h-2v2h2v2h2v-2h2z"/>
                      <path fill="#188038" d="M19 13v6c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h6v4c0 1.1.9 2 2 2h4z"/>
                      <path fill="#34A853" d="M15 3l4 4h-4V3z"/>
                    </svg>
                    Both (All Data)
                  </button>
                  {/* Files Section */}
                  <div className="px-3 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Download Files
                  </div>
                  <button
                    onClick={exportToJSON}
                    className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 2l5 5h-5V4zM8 17h8v-2H8v2zm0-4h8v-2H8v2z"/>
                    </svg>
                    JSON File
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 rounded-b-lg flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 2l5 5h-5V4zM8 17h2v-2H8v2zm0-4h2v-2H8v2zm0-4h2V7H8v2zm4 8h4v-2h-4v2zm0-4h4v-2h-4v2z"/>
                    </svg>
                    CSV File
                  </button>
                </div>
              </div>
              {/* Reset to demo defaults */}
              <button
                onClick={resetAllData}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white/80 border border-gray-200 rounded-xl hover:bg-white hover:shadow-md transition-all duration-300 card-hover"
                title="Clear all data and restore the demo defaults"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
              {/* Sign out (shown when the password gate is active) */}
              {authEnabled && tokenValid(authToken) && (
                <button
                  onClick={signOut}
                  className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all duration-300"
                  title="Sign out"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              )}
              {/* Save to Browser */}
              <button
                onClick={saveToLocalStorage}
                className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white btn-gradient rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 shine glow-hover"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Platform Tabs */}
      <div className="glass-dark border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-2">
            <button
              onClick={() => setPlatform('google')}
              className={`px-6 py-4 text-sm font-semibold transition-all duration-300 flex items-center gap-2 relative tab-indicator ${
                platform === 'google'
                  ? 'text-indigo-600 active'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill={platform === 'google' ? '#4285F4' : '#9CA3AF'} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill={platform === 'google' ? '#34A853' : '#9CA3AF'} d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill={platform === 'google' ? '#FBBC05' : '#9CA3AF'} d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill={platform === 'google' ? '#EA4335' : '#9CA3AF'} d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google Ads
            </button>
            <button
              onClick={() => setPlatform('meta')}
              className={`px-6 py-4 text-sm font-semibold transition-all duration-300 flex items-center gap-2 relative tab-indicator ${
                platform === 'meta'
                  ? 'text-indigo-600 active'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill={platform === 'meta' ? '#1877F2' : '#9CA3AF'}>
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Meta Ads
            </button>
            <button
              onClick={() => setPlatform('tiktok')}
              className={`px-6 py-4 text-sm font-semibold transition-all duration-300 flex items-center gap-2 relative tab-indicator ${
                platform === 'tiktok'
                  ? 'text-indigo-600 active'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill={platform === 'tiktok' ? '#000000' : '#9CA3AF'}>
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
              </svg>
              TikTok
              <span className="badge-new">New</span>
            </button>
            <button
              onClick={() => setPlatform('bing')}
              className={`px-6 py-4 text-sm font-semibold transition-all duration-300 flex items-center gap-2 relative tab-indicator ${
                platform === 'bing'
                  ? 'text-indigo-600 active'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <rect x="1" y="1" width="10.5" height="10.5" fill={platform === 'bing' ? '#F25022' : '#9CA3AF'}/>
                <rect x="12.5" y="1" width="10.5" height="10.5" fill={platform === 'bing' ? '#7FBA00' : '#B3B8C1'}/>
                <rect x="1" y="12.5" width="10.5" height="10.5" fill={platform === 'bing' ? '#00A4EF' : '#B3B8C1'}/>
                <rect x="12.5" y="12.5" width="10.5" height="10.5" fill={platform === 'bing' ? '#FFB900' : '#9CA3AF'}/>
              </svg>
              Microsoft Ads
              <span className="badge-new">New</span>
            </button>
            <button
              onClick={() => setPlatform('utm')}
              className={`px-6 py-4 text-sm font-semibold transition-all duration-300 flex items-center gap-2 relative tab-indicator ${
                platform === 'utm'
                  ? 'text-indigo-600 active'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={platform === 'utm' ? '#2563EB' : '#9CA3AF'} strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              UTM Builder
            </button>
            <button
              onClick={() => setPlatform('library')}
              className={`px-6 py-4 text-sm font-semibold transition-all duration-300 flex items-center gap-2 relative tab-indicator ${
                platform === 'library'
                  ? 'text-indigo-600 active'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={platform === 'library' ? '#2563EB' : '#9CA3AF'} strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Ad Library
            </button>
          </nav>
        </div>
      </div>

      {/* Campaign Type Selector (Google) */}
      {platform === 'google' && (
        <div className="bg-white/50 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Campaign Type</p>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              {googleCampaignTypes.map((campaign) => (
                <button
                  key={campaign.id}
                  onClick={() => selectCampaignType(campaign.id)}
                  className={`text-left p-3 rounded-xl border transition-all duration-300 bg-white ${
                    googleCampaignType === campaign.id
                      ? 'border-blue-600 ring-2 ring-blue-200 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md card-hover'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    {campaign.channels.map((c) => channelIcon(c))}
                  </div>
                  <p className={`text-sm font-semibold ${googleCampaignType === campaign.id ? 'text-blue-700' : 'text-gray-800'}`}>
                    {campaign.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-3">
                    {campaign.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub Tabs (Meta ad formats — Google campaigns handle placements inside their builders) */}
      {platform === 'meta' && (
        <div className="bg-white/50 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex gap-2 overflow-x-auto py-3 items-center">
              {([{ id: 'all' as const, label: 'All placements' }, ...metaAdTypes]).map((type) => (
                <button
                  key={type.id}
                  onClick={() => { setMetaView(type.id); if (type.id !== 'all') setMetaAdType(type.id); }}
                  className={`px-5 py-2.5 text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-300 ${
                    metaView === type.id
                      ? 'btn-gradient text-white shadow-lg glow'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:shadow-md card-hover'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Sub Tabs (Microsoft Ads formats) */}
      {platform === 'bing' && (
        <div className="bg-white/50 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex gap-2 overflow-x-auto py-3 items-center">
              {([
                { id: 'search' as BingAdType, label: 'Search (Bing SERP)' },
                { id: 'audience' as BingAdType, label: 'Audience Network' },
              ]).map((type) => (
                <button
                  key={type.id}
                  onClick={() => setBingAdType(type.id)}
                  className={`px-5 py-2.5 text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-300 ${
                    bingAdType === type.id
                      ? 'btn-gradient text-white shadow-lg glow'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:shadow-md card-hover'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-10">
        {platform === 'library' ? (
          /* Ad Library — in-app search of Meta Ad Library & Google Ads Transparency Center */
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 inline-block">Ad Library</h2>
              <p className="text-sm text-gray-500 mt-2">Search competitors&rsquo; live ads without leaving the app</p>
            </div>

            {/* Automatic competitor discovery */}
            <div className="glass rounded-2xl shadow-xl p-6 border border-white/20 mb-6">
              <h3 className="text-lg font-bold gradient-text mb-1">🔍 Find my competitors</h3>
              <p className="text-xs text-gray-500 mb-4">
                Enter your website (or a keyword that describes your business) — we detect your niche and rank everyone actively running ads in it in your country.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  value={findQuery}
                  onChange={(e) => setFindQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') findCompetitors(); }}
                  placeholder="yourbusiness.co.nz  —or—  real estate agent"
                  className="flex-1 min-w-[240px] px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                />
                <button
                  onClick={findCompetitors}
                  disabled={findLoading || !findQuery.trim()}
                  className="px-6 py-2.5 text-sm font-semibold text-white btn-gradient rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  {findLoading ? 'Scanning the ad market… (~1–2 min)' : 'Find competitors'}
                </button>
              </div>
              {findError && <p className="text-sm text-red-600 mt-3">{findError}</p>}
              {findResult && (
                <div className="mt-5">
                  <p className="text-xs text-gray-500 mb-3">
                    Niche detected: <span className="font-semibold text-gray-700">&ldquo;{findResult.keyword_used}&rdquo;</span> · scanned {findResult.ads_scanned} active ads · {findResult.competitors.length} advertisers found
                  </p>
                  {findResult.competitors.length === 0 ? (
                    <p className="text-sm text-gray-600">No other advertisers found for this niche/country — try a broader keyword.</p>
                  ) : (
                    <div className="space-y-2">
                      {findResult.competitors.map((comp, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white/80 rounded-xl px-4 py-3 border border-gray-100">
                          <span className="text-sm font-bold text-gray-400 w-6">#{i + 1}</span>
                          {comp.image ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={comp.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-200" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{comp.page_name}</p>
                            <p className="text-xs text-gray-500 truncate">{comp.sample_text || `${comp.ad_count} active ad${comp.ad_count > 1 ? 's' : ''} in your niche`}</p>
                          </div>
                          <span className="text-xs font-semibold text-indigo-600 whitespace-nowrap">{comp.ad_count} ad{comp.ad_count > 1 ? 's' : ''}</span>
                          <button
                            onClick={() => searchAdLibrary(comp.page_name, 'meta')}
                            className="px-3 py-1.5 text-xs font-semibold text-white btn-gradient rounded-lg whitespace-nowrap"
                          >
                            See their ads →
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Provider tabs */}
            <div className="flex gap-2 justify-center mb-6">
              <button
                onClick={() => { setLibProvider('meta'); setLibError(''); }}
                className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 ${
                  libProvider === 'meta' ? 'btn-gradient text-white shadow-lg glow' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill={libProvider === 'meta' ? '#fff' : '#1877F2'}>
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Meta Ad Library
              </button>
              <button
                onClick={() => { setLibProvider('google'); setLibError(''); }}
                className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 ${
                  libProvider === 'google' ? 'btn-gradient text-white shadow-lg glow' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill={libProvider === 'google' ? '#fff' : '#4285F4'} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill={libProvider === 'google' ? '#fff' : '#34A853'} d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill={libProvider === 'google' ? '#fff' : '#FBBC05'} d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill={libProvider === 'google' ? '#fff' : '#EA4335'} d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google Ads Transparency
              </button>
            </div>

            {/* Search controls */}
            <div className="glass rounded-2xl shadow-xl p-6 border border-white/20 mb-6">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  value={libQuery}
                  onChange={(e) => setLibQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') searchAdLibrary(); }}
                  placeholder={libProvider === 'meta' ? 'Search brand, competitor or keyword…' : 'Search advertiser or keyword…'}
                  className="flex-1 min-w-[220px] px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                />
                <select
                  value={libCountry}
                  onChange={(e) => setLibCountry(e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white"
                >
                  {(libProvider === 'meta'
                    ? ['GB', 'IE', 'DE', 'FR', 'ES', 'IT', 'NL', 'SE', 'PL', 'US', 'NZ', 'AU', 'CA']
                    : ['NZ', 'AU', 'US', 'GB', 'CA', 'IE']
                  ).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {libProvider === 'meta' && (
                  <select
                    value={libStatus}
                    onChange={(e) => setLibStatus(e.target.value as 'ACTIVE' | 'ALL')}
                    className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white"
                  >
                    <option value="ACTIVE">Active ads</option>
                    <option value="ALL">All ads</option>
                  </select>
                )}
                <button
                  onClick={() => searchAdLibrary()}
                  disabled={libLoading || !libQuery.trim()}
                  className="px-6 py-2.5 text-sm font-semibold text-white btn-gradient rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  {libLoading ? 'Searching…' : 'Search'}
                </button>
              </div>
              {libProvider === 'meta' && (
                <p className="text-xs text-gray-500 mt-3">
                  Searches run against the live Meta Ad Library — all countries &amp; ad types. Results take 30–90 seconds.
                </p>
              )}
            </div>

            {/* Errors & setup */}
            {libError === 'not_configured' && (
              <div className="glass rounded-2xl shadow-xl p-6 border border-white/20 mb-6">
                <h3 className="text-lg font-bold gradient-text mb-3">
                  {libProvider === 'meta' ? 'Connect the Meta Ad Library API' : 'Connect Google Ads Transparency (via SerpApi)'}
                </h3>
                {libProvider === 'meta' ? (
                  <div className="text-sm text-gray-700 space-y-4">
                    <div>
                      <p className="font-semibold mb-1">🆓 Free forever — Apify (~6,600 ads/month, renews monthly)</p>
                      <ol className="space-y-1 list-decimal ml-5">
                        <li>Sign up free at <a href="https://apify.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">apify.com</a> (email only — no card, no ID). The free plan includes $5 credits every month.</li>
                        <li>Copy your token from Apify Console → Settings → API &amp; Integrations.</li>
                        <li>In Cloudflare: Workers &amp; Pages → <strong>ad-preview-builder</strong> → Settings → Environment variables → add <code className="bg-gray-100 px-1 rounded">APIFY_TOKEN</code> → save &amp; redeploy.</li>
                        <li>Coverage: all countries, all ad types, with images. Note: each search runs a live scrape — results take ~30–90 seconds.</li>
                      </ol>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Faster option — SearchAPI.io (100 free searches, one key also powers Google)</p>
                      <p className="ml-1">Add <code className="bg-gray-100 px-1 rounded">SEARCHAPI_KEY</code> from <a href="https://www.searchapi.io" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">searchapi.io</a> — instant results, but paid after the first 100 searches (US$40/mo).</p>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Official Meta API (free, needs the owner)</p>
                      <p className="ml-1">The account owner completes identity verification at <a href="https://www.facebook.com/ads/library/api" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">facebook.com/ads/library/api</a>, then adds a long-lived token as <code className="bg-gray-100 px-1 rounded">META_ACCESS_TOKEN</code>. Coverage: UK/EU ads + political ads only.</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-700 space-y-4">
                    <p className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800">
                      Google provides <strong>no official API</strong> for the Transparency Center — these third-party options power in-app results.
                    </p>
                    <div>
                      <p className="font-semibold mb-1">Easiest — one key powers Google AND Meta (100 free searches)</p>
                      <ol className="space-y-1 list-decimal ml-5">
                        <li>Sign up at <a href="https://www.searchapi.io" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">searchapi.io</a> and copy your API key.</li>
                        <li>Add it as <code className="bg-gray-100 px-1 rounded">SEARCHAPI_KEY</code> in Cloudflare → Workers &amp; Pages → <strong>ad-preview-builder</strong> → Settings → Environment variables → redeploy.</li>
                        <li>Tip: search competitors by their <strong>website domain</strong> (e.g. competitor.co.nz) for exact matches.</li>
                      </ol>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Alternative — SerpApi (free tier: 100 searches/month)</p>
                      <p className="ml-1">Add <code className="bg-gray-100 px-1 rounded">SERPAPI_KEY</code> from <a href="https://serpapi.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">serpapi.com</a> — supports keyword search and renews 100 free searches monthly.</p>
                    </div>
                  </div>
                )}
                {libProvider === 'meta' && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                    Coverage note: Meta&rsquo;s official API returns political/issue ads worldwide plus <strong>all ads delivered to the EU</strong>. NZ/AU-only commercial ads are mostly not included — for full coverage a third-party Meta ads API (e.g. ScrapeCreators, Apify) can be plugged into the same endpoint later.
                  </p>
                )}
              </div>
            )}
            {libError === 'backend' && (
              <div className="glass rounded-2xl shadow-xl p-5 border border-white/20 mb-6">
                <p className="text-sm text-gray-700">
                  The library API isn&rsquo;t reachable here. It runs as a Cloudflare Function on the deployed site — try this search on{' '}
                  <a href="https://adpreview.insighter.digital" className="text-indigo-600 underline">adpreview.insighter.digital</a>. (Local dev servers don&rsquo;t run the functions.)
                </p>
              </div>
            )}
            {libError === 'api' && (
              <div className="glass rounded-2xl shadow-xl p-5 border border-white/20 mb-6">
                <p className="text-sm text-red-600">The provider returned an error: {libErrorDetail}</p>
              </div>
            )}

            {/* Results */}
            {libProvider === 'meta' && !libError && libSearched && !libLoading && (
              libMetaAds.length === 0 ? (
                <p className="text-center text-gray-500 text-sm">No ads found for this search. (The official API covers political/issue ads worldwide and all EU-delivered ads.)</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {libMetaAds.map((ad, i) => (
                    <div key={ad.id || i} className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
                      {ad.image && (
                        <div className="bg-gray-50 border border-gray-100 rounded-lg mb-3 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={ad.image} alt="Ad creative" className="w-full max-h-56 object-contain" />
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-bold text-gray-900">{ad.page_name || 'Unknown page'}</p>
                        {ad.ad_delivery_start_time && (
                          <span className="text-xs text-gray-400">since {new Date(ad.ad_delivery_start_time).toLocaleDateString()}</span>
                        )}
                      </div>
                      {ad.ad_creative_link_titles?.[0] && (
                        <p className="text-sm font-semibold text-gray-800 mb-1">{ad.ad_creative_link_titles[0]}</p>
                      )}
                      {ad.ad_creative_bodies?.[0] && (
                        <p className="text-sm text-gray-600 line-clamp-4 whitespace-pre-wrap mb-3">{ad.ad_creative_bodies[0]}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {(ad.publisher_platforms || []).slice(0, 4).map(p => (
                            <span key={p} className="text-[10px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5 capitalize">{p}</span>
                          ))}
                        </div>
                        {ad.ad_snapshot_url && (
                          <a href={ad.ad_snapshot_url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-indigo-600 hover:underline">
                            View ad ↗
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
            {libProvider === 'google' && !libError && libSearched && !libLoading && (
              libGoogleAds.length === 0 ? (
                <p className="text-center text-gray-500 text-sm">No ads found — tip: search by the competitor&rsquo;s website domain (e.g. competitor.co.nz) for exact advertiser matches.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {libGoogleAds.map((ad, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                      {ad.image && (
                        <div className="bg-gray-50 border-b border-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={ad.image} alt="Ad creative" className="w-full max-h-48 object-contain" />
                        </div>
                      )}
                      <div className="p-4">
                        <p className="text-sm font-bold text-gray-900">{ad.advertiser || ad.target_domain || 'Advertiser'}</p>
                        <p className="text-xs text-gray-500 mt-0.5 capitalize">
                          {ad.format || 'ad'}{ad.last_shown ? ` · last shown ${ad.last_shown}` : ''}
                        </p>
                        {(ad.details_link || ad.link) && (
                          <a href={ad.details_link || ad.link} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-indigo-600 hover:underline mt-2 inline-block">
                            View in Transparency Center ↗
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
            {!libSearched && !libError && (
              <p className="text-center text-gray-500 text-sm">
                Search a competitor to see their live ads here — results come from {libProvider === 'meta' ? "Meta's official Ad Library API" : 'the Google Ads Transparency Center (via SerpApi)'}.
              </p>
            )}
          </div>
        ) : platform === 'google' && googleCampaignType === 'pmax' ? (
          <PMaxAssetGroup />
        ) : platform === 'google' && googleCampaignType === 'demand-gen' ? (
          <DemandGenCampaign />
        ) : platform === 'google' && googleCampaignType === 'video' ? (
          <VideoCampaign />
        ) : platform === 'google' && googleCampaignType === 'display' ? (
          <DisplayCampaign />
        ) : platform === 'google' && googleCampaignType === 'shopping' ? (
          <ShoppingCampaign
            productTitle={productTitle} setProductTitle={setProductTitle}
            productPrice={productPrice} setProductPrice={setProductPrice}
            productStore={productStore} setProductStore={setProductStore}
            productImageUrl={productImageUrl} setProductImageUrl={setProductImageUrl}
            productRating={productRating} setProductRating={setProductRating}
            productReviewCount={productReviewCount} setProductReviewCount={setProductReviewCount}
            productShipping={productShipping} setProductShipping={setProductShipping}
          />
        ) : (
          /* Two Column Layout for Editors */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Editor Panel */}
            <div className="glass rounded-2xl shadow-xl p-6 card-hover border border-white/20">
              <h2 className="text-lg font-bold gradient-text mb-6">
                {platform === 'utm' ? 'UTM Parameters' : 'Ad Content'}
              </h2>
              {platform === 'google' ? renderGoogleEditor() :
               platform === 'meta' ? renderMetaEditor() :
               platform === 'tiktok' ? renderTikTokEditor() :
               platform === 'bing' ? renderBingEditor() :
               renderUtmEditor()}
            </div>

            {/* Preview Panel */}
            <div className="glass rounded-2xl shadow-xl p-6 card-hover border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold gradient-text">
                  {platform === 'utm' ? 'Generated URL' : 'Preview'}
                </h2>
                {platform !== 'utm' && (
                  <div className="flex gap-2">
                    <button
                      onClick={shareAdPreview}
                      disabled={shareState === 'busy'}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors disabled:opacity-60 ${
                        shareState === 'copied'
                          ? 'text-green-700 bg-green-50 border-green-300'
                          : shareState === 'failed'
                          ? 'text-red-600 bg-white border-red-300'
                          : 'text-white btn-gradient border-transparent shadow hover:shadow-md'
                      }`}
                      title="Copy a shareable preview link"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      {shareState === 'busy' ? 'Copying…' : shareState === 'copied' ? 'Link copied!' : shareState === 'failed' ? 'Failed' : 'Share'}
                    </button>
                    <button
                      onClick={exportAsImage}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Export as PNG"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      PNG
                    </button>
                    <button
                      onClick={exportAsPDF}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Export as PDF"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      PDF
                    </button>
                  </div>
                )}
              </div>
              <div
                ref={previewRef}
                className={`${platform === 'utm' ? '' : 'flex items-center justify-center min-h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 overflow-auto border border-gray-100'}`}
              >
                {platform === 'google' ? renderGooglePreview() :
                 platform === 'meta' ? renderMetaPreview() :
                 platform === 'tiktok' ? renderTikTokPreview() :
                 platform === 'bing' ? renderBingPreview() :
                 renderUtmPreview()}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="glass border-t border-white/20 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-600">
            <span className="gradient-text font-semibold">Ad Preview Builder</span> - Preview your Google Ads & Meta ads before publishing
          </p>
        </div>
      </footer>
    </div>
  );
}
