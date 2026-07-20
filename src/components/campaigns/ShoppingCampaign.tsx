'use client';

import { useEffect, useState } from 'react';
import ImageUpload from '@/components/ImageUpload';
import GoogleShoppingAd from '@/components/previews/GoogleShoppingAd';
import { SectionCard, SummaryRow, GField, InfoBanner, PhoneFrame, ReadyItem, AdStrength } from './ui';

const STORAGE_KEY = 'shoppingCampaignData';

interface ShoppingCampaignProps {
  productTitle: string; setProductTitle: (v: string) => void;
  productPrice: string; setProductPrice: (v: string) => void;
  productStore: string; setProductStore: (v: string) => void;
  productImageUrl: string; setProductImageUrl: (v: string) => void;
  productRating: string; setProductRating: (v: string) => void;
  productReviewCount: string; setProductReviewCount: (v: string) => void;
  productShipping: string; setProductShipping: (v: string) => void;
}

export default function ShoppingCampaign({
  productTitle, setProductTitle,
  productPrice, setProductPrice,
  productStore, setProductStore,
  productImageUrl, setProductImageUrl,
  productRating, setProductRating,
  productReviewCount, setProductReviewCount,
  productShipping, setProductShipping,
}: ShoppingCampaignProps) {
  const [campaignName, setCampaignName] = useState('Shopping Campaign');
  const [merchantAccount, setMerchantAccount] = useState('Demo Store (123-456-7890)');
  const [feedCountry, setFeedCountry] = useState('United States');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low');
  const [networkSearch, setNetworkSearch] = useState(true);
  const [networkPartners, setNetworkPartners] = useState(false);
  const [budgetType, setBudgetType] = useState<'daily' | 'total'>('daily');
  const [budget, setBudget] = useState('50');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.campaignName) setCampaignName(d.campaignName);
        if (d.merchantAccount) setMerchantAccount(d.merchantAccount);
        if (d.feedCountry) setFeedCountry(d.feedCountry);
        if (d.priority) setPriority(d.priority);
        if (d.networkSearch !== undefined) setNetworkSearch(d.networkSearch);
        if (d.networkPartners !== undefined) setNetworkPartners(d.networkPartners);
        if (d.budgetType) setBudgetType(d.budgetType);
        if (d.budget) setBudget(d.budget);
      }
    } catch { /* ignore corrupt saves */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      campaignName, merchantAccount, feedCountry, priority, networkSearch, networkPartners, budgetType, budget,
    }));
  }, [loaded, campaignName, merchantAccount, feedCountry, priority, networkSearch, networkPartners, budgetType, budget]);

  const strengthChecks = [
    { label: 'Product title', done: !!productTitle },
    { label: 'Price', done: !!productPrice },
    { label: 'Store', done: !!productStore },
    { label: 'Image', done: !!productImageUrl },
    { label: 'Rating', done: !!productRating },
  ];
  const productOk = strengthChecks.filter(c => c.done).length >= 4;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 items-start">
      {/* ==== Center: campaign settings ==== */}
      <div className="space-y-4">
        <SectionCard title="Campaign name">
          <GField label="Campaign name" value={campaignName} onChange={setCampaignName} maxLength={256} required />
        </SectionCard>

        <SectionCard title="Merchant Center" subtitle="Select the Merchant Center account with the products you want to advertise">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            <GField label="Merchant Center account" value={merchantAccount} onChange={setMerchantAccount} placeholder="e.g. My Store (123-456-7890)" required />
            <div>
              <label className="block text-xs text-gray-600 mb-1">Country of sale</label>
              <select
                value={feedCountry}
                onChange={(e) => setFeedCountry(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-600"
              >
                {['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Bangladesh', 'India'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <InfoBanner>
            Your product data comes from Merchant Center. Shopping ads use your feed&apos;s titles, images, and prices —
            you don&apos;t write ad copy for Shopping campaigns.
          </InfoBanner>
        </SectionCard>

        <SectionCard title="Campaign priority" subtitle="If you advertise the same products in multiple campaigns, the highest priority campaign bids first">
          <div className="space-y-2">
            {([
              { id: 'low' as const, label: 'Low (recommended)', note: 'Default for all campaigns' },
              { id: 'medium' as const, label: 'Medium', note: '' },
              { id: 'high' as const, label: 'High', note: '' },
            ]).map((p) => (
              <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="priority" checked={priority === p.id} onChange={() => setPriority(p.id)} className="accent-blue-600" />
                <span className="text-sm text-gray-800">{p.label}</span>
                {p.note && <span className="text-xs text-gray-500">— {p.note}</span>}
              </label>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Networks" subtitle="Where your Shopping ads can appear">
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={networkSearch} onChange={(e) => setNetworkSearch(e.target.checked)} className="accent-blue-600" />
              <span className="text-sm text-gray-800">Google Search Network</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={networkPartners} onChange={(e) => setNetworkPartners(e.target.checked)} className="accent-blue-600" />
              <span className="text-sm text-gray-800">Google search partners</span>
            </label>
          </div>
        </SectionCard>

        <SectionCard title="Budget and dates" subtitle="Enter budget type and amount">
          <div className="flex gap-3 items-start">
            <select
              value={budgetType}
              onChange={(e) => setBudgetType(e.target.value as 'daily' | 'total')}
              className="px-3 py-2.5 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="daily">Daily</option>
              <option value="total">Campaign total</option>
            </select>
            <div className="flex-1 max-w-[220px]">
              <GField label="Amount" value={budget} onChange={setBudget} placeholder="$" required />
            </div>
          </div>
        </SectionCard>

        <div className="space-y-2">
          <SummaryRow title="Location and language" summary={feedCountry} />
          <SummaryRow title="Devices" summary="All eligible devices" />
          <SummaryRow title="Ad schedule" summary="All day" />
          <SummaryRow title="Inventory filter" summary="All products" />
        </div>

        {/* Product (simulates the Merchant Center feed item) */}
        <SectionCard title="Product" subtitle="This simulates the product from your Merchant Center feed that will show in the ad">
          <div className="space-y-4">
            <AdStrength checks={strengthChecks} />
            <GField label="Product title" value={productTitle} onChange={setProductTitle} maxLength={150} required placeholder="e.g. Nike Air Max 270 Running Shoes" />
            <div className="grid grid-cols-2 gap-4">
              <GField label="Price" value={productPrice} onChange={setProductPrice} placeholder="$99.99" required />
              <GField label="Store name" value={productStore} onChange={setProductStore} placeholder="Your Store" required />
            </div>
            <ImageUpload label="Product image (1:1)" value={productImageUrl} onChange={setProductImageUrl} aspectRatio="1:1" />
            <div className="grid grid-cols-3 gap-4">
              <GField label="Rating (0–5)" value={productRating} onChange={setProductRating} placeholder="4.5" type="number" />
              <GField label="Review count" value={productReviewCount} onChange={setProductReviewCount} placeholder="120" />
              <GField label="Shipping text" value={productShipping} onChange={setProductShipping} placeholder="Free shipping" />
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ==== Right: sticky preview + readiness ==== */}
      <div className="xl:sticky xl:top-24 space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <h3 className="text-base font-medium text-gray-900 mb-3">Preview</h3>
          <PhoneFrame contentWidth={380}>
            <GoogleShoppingAd
              productTitle={productTitle}
              productPrice={productPrice}
              storeName={productStore}
              imageUrl={productImageUrl}
              rating={productRating}
              reviewCount={productReviewCount}
              shipping={productShipping}
            />
          </PhoneFrame>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
          <h3 className="text-lg font-normal text-gray-900 mb-2">
            {budget && merchantAccount && productOk ? 'Your campaign is ready' : 'Your campaign is not ready to run yet'}
          </h3>
          <div className="space-y-1">
            <p className="text-xs text-gray-500 mt-2">Merchant Center</p>
            <ReadyItem ok={!!merchantAccount} warn={!merchantAccount} label={merchantAccount || 'Link a Merchant Center account'} />
            <p className="text-xs text-gray-500 mt-2">Budget</p>
            <ReadyItem ok={!!budget} warn={!budget} label={budget ? `${budgetType === 'daily' ? 'Daily' : 'Total'} budget: $${budget}` : 'Set budget'} />
            <p className="text-xs text-gray-500 mt-2">Products</p>
            <ReadyItem ok={productOk} warn={!productOk} label={productOk ? 'Product feed ready' : 'Complete product details'} />
            <p className="text-xs text-gray-500 mt-2">Networks</p>
            <ReadyItem ok={networkSearch} warn={!networkSearch} label={networkSearch ? 'Google Search Network' : 'Select a network'} />
          </div>
        </div>
      </div>
    </div>
  );
}
