'use client';

import { useState, useEffect, useRef } from 'react';
import GoogleSearchAd from '@/components/previews/GoogleSearchAd';
import GoogleDisplayAd from '@/components/previews/GoogleDisplayAd';
import YouTubeInStreamAd from '@/components/previews/YouTubeInStreamAd';
import YouTubeShortsAd from '@/components/previews/YouTubeShortsAd';
import GmailAd from '@/components/previews/GmailAd';
import DiscoverAd from '@/components/previews/DiscoverAd';
import MetaFeedAd from '@/components/previews/MetaFeedAd';
import InstagramFeedAd from '@/components/previews/InstagramFeedAd';
import InstagramStoryAd from '@/components/previews/InstagramStoryAd';
import InstagramReelsAd from '@/components/previews/InstagramReelsAd';
import FacebookStoriesAd from '@/components/previews/FacebookStoriesAd';
import ImageUpload from '@/components/ImageUpload';

type Platform = 'google' | 'meta' | 'utm' | 'library';
type GoogleAdType = 'search' | 'display' | 'youtube-instream' | 'youtube-shorts' | 'gmail' | 'discover';
type MetaAdType = 'fb-feed' | 'fb-stories' | 'ig-feed' | 'ig-stories' | 'ig-reels';

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
];

const metaAdTypes: { id: MetaAdType; label: string }[] = [
  { id: 'fb-feed', label: 'FB Feed' },
  { id: 'fb-stories', label: 'FB Stories' },
  { id: 'ig-feed', label: 'IG Feed' },
  { id: 'ig-stories', label: 'IG Stories' },
  { id: 'ig-reels', label: 'Reels' },
];

export default function Home() {
  const [platform, setPlatform] = useState<Platform>('google');
  const [googleAdType, setGoogleAdType] = useState<GoogleAdType>('search');
  const [metaAdType, setMetaAdType] = useState<MetaAdType>('fb-feed');

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
  const [pageName, setPageName] = useState('');
  const [instagramAccount, setInstagramAccount] = useState('');
  const [pageImageUrl, setPageImageUrl] = useState('');

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

  // Media
  const [metaMediaUrls, setMetaMediaUrls] = useState<string[]>(['', '', '', '']);
  const [metaImageUrl, setMetaImageUrl] = useState('');

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

  // Expanded sections for Meta
  const [metaExpandedSections, setMetaExpandedSections] = useState<Record<string, boolean>>({
    advantagePlus: true,
    identity: true,
    media: true,
    primaryText: true,
    headlines: false,
    description: false,
    destination: false,
    tracking: false,
  });

  const toggleMetaSection = (section: string) => {
    setMetaExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
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
    'Learn More', 'Shop Now', 'Sign Up', 'Download', 'Contact Us',
    'Apply Now', 'Book Now', 'Buy Tickets', 'Call Now', 'Donate Now',
    'Get Offer', 'Get Directions', 'Get Quote', 'Get Showtimes', 'Install Now',
    'Listen Now', 'Order Now', 'Play Game', 'Request Time', 'See Menu',
    'Send Message', 'Send WhatsApp Message', 'Subscribe', 'Watch More', 'Use App',
    'Open Link', 'Save', 'Start Order', 'View Event', 'Vote Now'
  ];

  // File input ref for CSV import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get all ad data as object
  const getAdData = () => ({
    // Settings
    platform,
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
    // Meta Ads
    pageName,
    instagramAccount,
    pageImageUrl,
    primaryTexts,
    metaHeadlines,
    metaDescription,
    metaMediaUrls,
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
    if (data.platform) setPlatform(data.platform as Platform);
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
    if (data.pageName) setPageName(data.pageName as string);
    if (data.instagramAccount) setInstagramAccount(data.instagramAccount as string);
    if (data.pageImageUrl) setPageImageUrl(data.pageImageUrl as string);
    if (data.primaryTexts) setPrimaryTexts(data.primaryTexts as string[]);
    if (data.metaHeadlines) setMetaHeadlines(data.metaHeadlines as string[]);
    if (data.metaDescription) setMetaDescription(data.metaDescription as string);
    if (data.metaMediaUrls) setMetaMediaUrls(data.metaMediaUrls as string[]);
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
    rows.push(['Google Ad Type', data.googleAdType]);
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

  // Export to JSON (full data)
  const exportToJSON = () => {
    const data = getAdData();
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

  // Copy Google Ads data only
  const copyGoogleAdsToSheets = async () => {
    const data = getAdData();
    const rows: string[][] = [];

    rows.push(['Category', 'Field', 'Value', 'Character Count', 'Limit']);
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

    await copyToSheets(rows, 'Google Ads');
  };

  // Copy Meta Ads data only
  const copyMetaAdsToSheets = async () => {
    const data = getAdData();
    const rows: string[][] = [];

    rows.push(['Category', 'Field', 'Value', 'Character Count', 'Limit']);
    rows.push(['Identity', 'Page Name', data.pageName, '', '']);
    rows.push(['Identity', 'Instagram Account', data.instagramAccount, '', '']);
    rows.push(['Settings', 'CTA Button', data.metaCtaText, '', '']);
    rows.push(['Settings', 'Destination URL', data.metaDestinationUrl, '', '']);
    rows.push(['Settings', 'Display Link', data.linkDisplay, '', '']);

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

    // Google Ads
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
        alert('Imported successfully!');
      } catch {
        alert('Error reading file. Please use a valid JSON file.');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Auto-load from localStorage on mount
  useEffect(() => {
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

  // Auto-save to localStorage on data change
  useEffect(() => {
    const data = getAdData();
    localStorage.setItem('adPreviewData', JSON.stringify(data));
  }, [businessName, headlines, descriptions, finalUrl, displayUrl, path1, path2,
      sitelinks, callouts, snippetHeader, snippetValues, phoneNumber, priceAssets,
      promotion, searchImageUrls, pageName, instagramAccount, pageImageUrl,
      primaryTexts, metaHeadlines, metaDescription, metaMediaUrls, metaCtaText,
      metaDestinationUrl, linkDisplay, platform, googleAdType, metaAdType]);

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
                        }`}
                      />
                      <span className="text-xs text-gray-400 w-10 text-right">{h.length}/30</span>
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
                        }`}
                      />
                      <span className="text-xs text-gray-400 w-10 text-right pt-2.5">{d.length}/90</span>
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
    }
  };

  const renderMetaEditor = () => {
    // Unified Meta Ads editor matching real Ads Manager interface (2026 update)
    return (
      <div className="space-y-0 divide-y divide-gray-200">
        {/* Advantage+ Creative Section (2026) */}
        <div className="py-4">
          <button
            onClick={() => toggleMetaSection('advantagePlus')}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <svg className={`w-5 h-5 text-gray-400 transition-transform ${metaExpandedSections.advantagePlus ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Advantage+ creative</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">2026</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded ${advantagePlusCreative ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {advantagePlusCreative ? 'On' : 'Off'}
            </span>
          </button>
          {metaExpandedSections.advantagePlus && (
            <div className="mt-4 pl-7 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <p className="text-xs text-blue-800">
                  Advantage+ creative uses AI to automatically optimize your ad creative for each person. Meta now defaults to Advantage+ setup for all new campaigns.
                </p>
              </div>

              {/* Main Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900">Enable Advantage+ creative</span>
                  <p className="text-xs text-gray-500">AI-driven creative optimizations</p>
                </div>
                <button
                  onClick={() => setAdvantagePlusCreative(!advantagePlusCreative)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${advantagePlusCreative ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${advantagePlusCreative ? 'translate-x-5' : ''}`} />
                </button>
              </div>

              {advantagePlusCreative && (
                <>
                  {/* Text Generation */}
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

                  {/* Optimize Text Per Person */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <div>
                      <span className="text-sm text-gray-700">Optimize text per person</span>
                      <p className="text-xs text-gray-500">Swap headline & primary text positions</p>
                    </div>
                    <button
                      onClick={() => setOptimizeTextPerPerson(!optimizeTextPerPerson)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${optimizeTextPerPerson ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${optimizeTextPerPerson ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>

                  {/* Customer Lifecycle Strategy */}
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
                </>
              )}
            </div>
          )}
        </div>

        {/* Ad Identity Section */}
        <div className="py-4">
          <button
            onClick={() => toggleMetaSection('identity')}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <svg className={`w-5 h-5 text-gray-400 transition-transform ${metaExpandedSections.identity ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Identity</span>
            </div>
          </button>
          {metaExpandedSections.identity && (
            <div className="mt-4 pl-7 space-y-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Facebook Page</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Account (optional)</label>
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
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Profile Image</label>
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

        {/* Media Section */}
        <div className="py-4">
          <button
            onClick={() => toggleMetaSection('media')}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <svg className={`w-5 h-5 text-gray-400 transition-transform ${metaExpandedSections.media ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Media</span>
            </div>
            <span className="text-xs text-gray-500">{metaMediaUrls.filter(u => u).length}/4 added</span>
          </button>
          {metaExpandedSections.media && (
            <div className="mt-4 pl-7">
              <p className="text-xs text-gray-500 mb-3">
                Add images or videos. Recommended: 1:1 for Feed, 9:16 for Stories/Reels
              </p>
              <div className="grid grid-cols-2 gap-3">
                {metaMediaUrls.map((url, i) => (
                  <ImageUpload
                    key={i}
                    label={`Media ${i + 1}`}
                    value={url}
                    onChange={(newUrl) => {
                      const newUrls = [...metaMediaUrls];
                      newUrls[i] = newUrl;
                      setMetaMediaUrls(newUrls);
                      if (i === 0) setMetaImageUrl(newUrl);
                    }}
                    aspectRatio={metaAdType.includes('stories') || metaAdType.includes('reels') ? '9:16' : '1:1'}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Primary Text Section */}
        <div className="py-4">
          <button
            onClick={() => toggleMetaSection('primaryText')}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <svg className={`w-5 h-5 text-gray-400 transition-transform ${metaExpandedSections.primaryText ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Primary text</span>
            </div>
            <span className="text-xs text-gray-500">{primaryTexts.filter(t => t.trim()).length}/5 added</span>
          </button>
          {metaExpandedSections.primaryText && (
            <div className="mt-4 pl-7 space-y-3">
              <div className="text-xs text-gray-500 space-y-1">
                <p>125 characters visible before "See more" (2,200 max). Reels: 40-72 chars.</p>
                {textGeneration && (
                  <p className="text-blue-600">AI will generate up to 5 additional text variations.</p>
                )}
              </div>
              {primaryTexts.slice(0, visiblePrimaryTexts).map((text, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-gray-400 w-5 pt-2">{i + 1}</span>
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
                      className={`flex-1 px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm resize-none ${
                        i === 0 ? 'border-blue-200 bg-blue-50/50' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <div className="text-right text-xs text-gray-400 pr-1">
                    {text.length} characters {text.length > 125 && <span className="text-orange-500">(truncated after 125)</span>}
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
                  Add another primary text option
                </button>
              )}
            </div>
          )}
        </div>

        {/* Headlines Section */}
        <div className="py-4">
          <button
            onClick={() => toggleMetaSection('headlines')}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <svg className={`w-5 h-5 text-gray-400 transition-transform ${metaExpandedSections.headlines ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Headlines</span>
            </div>
            <span className="text-xs text-gray-500">{metaHeadlines.filter(h => h.trim()).length}/5 added</span>
          </button>
          {metaExpandedSections.headlines && (
            <div className="mt-4 pl-7 space-y-3">
              <div className="text-xs text-gray-500 space-y-1">
                <p>40 characters recommended (255 max). Reels overlay: 10 chars visible.</p>
                {optimizeTextPerPerson && (
                  <p className="text-blue-600">Headlines may swap with primary text based on user.</p>
                )}
              </div>
              {metaHeadlines.slice(0, visibleMetaHeadlines).map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 w-5">{i + 1}</span>
                  <input
                    type="text"
                    value={h}
                    onChange={(e) => {
                      const newHeadlines = [...metaHeadlines];
                      newHeadlines[i] = e.target.value;
                      setMetaHeadlines(newHeadlines);
                      if (i === 0) setHeadline(e.target.value);
                    }}
                    placeholder={`Headline ${i + 1}`}
                    className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <span className="text-xs text-gray-400 w-10 text-right">{h.length}/40</span>
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
                  Add another headline option
                </button>
              )}
            </div>
          )}
        </div>

        {/* Description Section */}
        <div className="py-4">
          <button
            onClick={() => toggleMetaSection('description')}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <svg className={`w-5 h-5 text-gray-400 transition-transform ${metaExpandedSections.description ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Description</span>
              <span className="text-xs text-gray-400">(optional)</span>
            </div>
          </button>
          {metaExpandedSections.description && (
            <div className="mt-4 pl-7">
              <p className="text-xs text-gray-500 mb-2">25-30 characters. Only shown on some placements (Marketplace, Search).</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={metaDescription}
                  onChange={(e) => {
                    setMetaDescription(e.target.value);
                    setDescription(e.target.value);
                  }}
                  placeholder="Link description"
                  maxLength={30}
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <span className="text-xs text-gray-400 w-10 text-right">{metaDescription.length}/30</span>
              </div>
            </div>
          )}
        </div>

        {/* Destination Section */}
        <div className="py-4">
          <button
            onClick={() => toggleMetaSection('destination')}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <svg className={`w-5 h-5 text-gray-400 transition-transform ${metaExpandedSections.destination ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Destination</span>
            </div>
          </button>
          {metaExpandedSections.destination && (
            <div className="mt-4 pl-7 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                <input
                  type="url"
                  value={metaDestinationUrl}
                  onChange={(e) => setMetaDestinationUrl(e.target.value)}
                  placeholder="https://example.com/landing-page"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display link (optional)</label>
                <input
                  type="text"
                  value={linkDisplay}
                  onChange={(e) => setLinkDisplay(e.target.value)}
                  placeholder="example.com"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">Shown instead of the full URL</p>
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="py-4">
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

        {/* Placement-specific note */}
        <div className="py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium">Previewing: {metaAdType === 'fb-feed' ? 'Facebook Feed' : metaAdType === 'fb-stories' ? 'Facebook Stories' : metaAdType === 'ig-feed' ? 'Instagram Feed' : metaAdType === 'ig-stories' ? 'Instagram Stories' : 'Instagram Reels'}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {metaAdType.includes('feed') ? 'Primary text above image (125 chars visible). Headline & description below.' : metaAdType.includes('reels') ? 'Reels: Primary text 40-72 chars, overlay headline 10 chars visible.' : 'Stories: Only headline visible. Primary text not displayed.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2026 Platform Updates Note */}
        <div className="py-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-600">
              <span className="font-medium">2026 Updates:</span> Threads ads now available globally • Reels post-view ads after 60s videos • New "Interactions" metric replaces "Engagement" • Click attribution excludes likes/shares
            </p>
          </div>
        </div>
      </div>
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
        <div className="flex gap-2 pt-2">
          <button
            onClick={copyUtmUrl}
            disabled={!utmBaseUrl || !utmSource || !utmMedium || !utmCampaign}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Copy URL
          </button>
          <button
            onClick={clearUtmForm}
            className="px-4 py-2.5 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Generated URL</h3>
          <div className="bg-gray-50 rounded-lg p-3 break-all">
            {generatedUrl ? (
              <code className="text-sm text-blue-600">{generatedUrl}</code>
            ) : (
              <span className="text-sm text-gray-400">Enter a URL and UTM parameters to generate...</span>
            )}
          </div>
          {generatedUrl && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={copyUtmUrl}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Test Link
              </a>
            </div>
          )}
        </div>

        {/* URL Breakdown */}
        {generatedUrl && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Parameter Breakdown</h3>
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
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Recent URLs</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {utmHistory.map((url, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(url);
                      alert('Copied!');
                    }}
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-blue-600"
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">UTM Best Practices</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Use lowercase letters and underscores (no spaces)</li>
            <li>• Be consistent with naming conventions</li>
            <li>• Keep campaign names short but descriptive</li>
            <li>• Document your UTM parameters in a spreadsheet</li>
          </ul>
        </div>
      </div>
    );
  };

  // Ad Library Links
  const adLibraryLinks = [
    {
      category: 'Meta (Facebook & Instagram)',
      links: [
        { name: 'Meta Ad Library', url: 'https://www.facebook.com/ads/library/', description: 'Search all active ads on Facebook, Instagram, Messenger & Audience Network' },
        { name: 'Meta Ad Library Report', url: 'https://www.facebook.com/ads/library/report/', description: 'View spending reports for ads about social issues, elections or politics' },
        { name: 'Meta Business Help', url: 'https://www.facebook.com/business/help', description: 'Official Meta advertising help center' },
      ]
    },
    {
      category: 'Google',
      links: [
        { name: 'Google Ads Transparency Center', url: 'https://adstransparency.google.com/', description: 'Search ads across Google services including Search, YouTube & Display' },
        { name: 'Google Ads Help', url: 'https://support.google.com/google-ads', description: 'Official Google Ads support documentation' },
        { name: 'Think with Google', url: 'https://www.thinkwithgoogle.com/', description: 'Marketing insights and trends from Google' },
      ]
    },
    {
      category: 'TikTok',
      links: [
        { name: 'TikTok Creative Center', url: 'https://ads.tiktok.com/business/creativecenter/pc/en', description: 'Discover top ads, trends, and creative insights on TikTok' },
        { name: 'TikTok Ad Library', url: 'https://library.tiktok.com/', description: 'Search ads running on TikTok' },
        { name: 'TikTok Business Help', url: 'https://ads.tiktok.com/help/', description: 'Official TikTok advertising help center' },
      ]
    },
    {
      category: 'LinkedIn',
      links: [
        { name: 'LinkedIn Ad Library', url: 'https://www.linkedin.com/ad-library/', description: 'Search ads running on LinkedIn' },
        { name: 'LinkedIn Marketing Solutions', url: 'https://business.linkedin.com/marketing-solutions', description: 'LinkedIn advertising platform' },
      ]
    },
    {
      category: 'Twitter / X',
      links: [
        { name: 'X Ads Transparency Center', url: 'https://ads.x.com/transparency', description: 'Search ads running on X (Twitter)' },
        { name: 'X Business', url: 'https://business.x.com/', description: 'X advertising platform' },
      ]
    },
    {
      category: 'Other Platforms',
      links: [
        { name: 'Snapchat Political Ads Library', url: 'https://www.snap.com/en-US/political-ads', description: 'Political and advocacy ads on Snapchat' },
        { name: 'Pinterest Ads Manager', url: 'https://ads.pinterest.com/', description: 'Pinterest advertising platform' },
        { name: 'Amazon Advertising', url: 'https://advertising.amazon.com/', description: 'Amazon advertising platform' },
        { name: 'Microsoft Ad Library', url: 'https://adlibrary.ads.microsoft.com/', description: 'Search ads running on Bing, MSN & Microsoft network' },
        { name: 'Microsoft Advertising', url: 'https://ads.microsoft.com/', description: 'Bing & Microsoft advertising platform' },
      ]
    },
    {
      category: 'Ad Spy & Research Tools',
      links: [
        { name: 'AdSpy', url: 'https://adspy.com/', description: 'Largest searchable database of Facebook & Instagram ads' },
        { name: 'BigSpy', url: 'https://bigspy.com/', description: 'Free ad spy tool for multiple platforms' },
        { name: 'Minea', url: 'https://minea.com/', description: 'Ad spy for e-commerce and dropshipping' },
        { name: 'PowerAdSpy', url: 'https://poweradspy.com/', description: 'Social media ad intelligence tool' },
        { name: 'Foreplay', url: 'https://www.foreplay.co/', description: 'Save & organize ads for creative inspiration' },
      ]
    },
  ];

  const renderAdLibrary = () => {
    return (
      <div className="space-y-6">
        {adLibraryLinks.map((category, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">{category.category}</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {category.links.map((link, linkIdx) => (
                <a
                  key={linkIdx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 px-4 py-3 hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">{link.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{link.description}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        ))}
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
    }
  };

  const renderMetaPreview = () => {
    // Use Instagram account or page name for username
    const displayUsername = instagramAccount || pageName || 'username';
    // Use first primary text as caption for Instagram
    const displayCaption = primaryTexts[0] || primaryText || caption;
    // Use first headline
    const displayHeadline = metaHeadlines[0] || headline;
    // Use first media URL
    const displayImageUrl = metaMediaUrls[0] || metaImageUrl;

    switch (metaAdType) {
      case 'fb-feed':
        return <MetaFeedAd pageName={pageName} primaryText={primaryTexts[0] || primaryText} headline={displayHeadline} description={metaDescription || description} imageUrl={displayImageUrl} ctaText={metaCtaText} linkDisplay={linkDisplay} pageImageUrl={pageImageUrl} />;
      case 'fb-stories':
        return <FacebookStoriesAd pageName={pageName} pageImageUrl={pageImageUrl} imageUrl={displayImageUrl} headline={displayHeadline} ctaText={metaCtaText} linkDisplay={linkDisplay} />;
      case 'ig-feed':
        return <InstagramFeedAd username={displayUsername} caption={displayCaption} imageUrl={displayImageUrl} ctaText={metaCtaText} website={linkDisplay} profileImageUrl={pageImageUrl} />;
      case 'ig-stories':
        return <InstagramStoryAd username={displayUsername} imageUrl={displayImageUrl} ctaText={metaCtaText} profileImageUrl={pageImageUrl} />;
      case 'ig-reels':
        return <InstagramReelsAd username={displayUsername} caption={displayCaption} imageUrl={displayImageUrl} ctaText={metaCtaText} profileImageUrl={pageImageUrl} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={importFromJSON}
        accept=".json"
        className="hidden"
      />

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ad Preview Builder</h1>
              <p className="text-gray-600 text-sm">Preview your ads before publishing to Google Ads & Meta Ads</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Import */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import
              </button>
              {/* Export Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
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
                    Google Ads Only
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
              {/* Save to Browser */}
              <button
                onClick={saveToLocalStorage}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-4">
            <button
              onClick={() => setPlatform('google')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                platform === 'google'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
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
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                platform === 'meta'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill={platform === 'meta' ? '#1877F2' : '#9CA3AF'}>
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Meta Ads
            </button>
            <button
              onClick={() => setPlatform('utm')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                platform === 'utm'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={platform === 'utm' ? '#2563EB' : '#9CA3AF'} strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              UTM Builder
            </button>
            <button
              onClick={() => setPlatform('library')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                platform === 'library'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
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

      {/* Sub Tabs */}
      {platform !== 'utm' && platform !== 'library' && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex gap-1 overflow-x-auto py-2">
              {platform === 'google' ? (
                googleAdTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setGoogleAdType(type.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                      googleAdType === type.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))
              ) : (
                metaAdTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setMetaAdType(type.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                      metaAdType === type.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {platform === 'library' ? (
          /* Ad Library - Full Width */
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Ad Library Resources</h2>
              <p className="text-sm text-gray-600 mt-1">Browse competitor ads and find creative inspiration across all major platforms</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderAdLibrary()}
            </div>
          </div>
        ) : (
          /* Two Column Layout for Editors */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Editor Panel */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {platform === 'utm' ? 'UTM Parameters' : 'Ad Content'}
              </h2>
              {platform === 'google' ? renderGoogleEditor() : platform === 'meta' ? renderMetaEditor() : renderUtmEditor()}
            </div>

            {/* Preview Panel */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {platform === 'utm' ? 'Generated URL' : 'Preview'}
              </h2>
              <div className={`${platform === 'utm' ? '' : 'flex items-center justify-center min-h-[500px] bg-gray-50 rounded-lg p-4 overflow-auto'}`}>
                {platform === 'google' ? renderGooglePreview() : platform === 'meta' ? renderMetaPreview() : renderUtmPreview()}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
          Ad Preview Builder - Preview your Google Ads & Meta ads before publishing
        </div>
      </footer>
    </div>
  );
}
