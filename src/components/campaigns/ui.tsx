'use client';

import { useState } from 'react';

// Google Ads-style white section card with a title row and optional collapse
export function SectionCard({
  title,
  badge,
  children,
  defaultOpen = true,
  subtitle,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  subtitle?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-base font-medium text-gray-900">{title}</h3>
          {badge && (
            <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 rounded px-1.5 py-0.5 tracking-wide">
              {badge}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${open ? '' : 'rotate-180'}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5">
          {subtitle && <p className="text-sm text-gray-600 mb-4">{subtitle}</p>}
          {children}
        </div>
      )}
    </div>
  );
}

// Collapsed summary row (like "Location and language — Set at ad group...")
export function SummaryRow({ title, summary }: { title: string; summary: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex items-center justify-between px-5 py-4">
      <span className="text-sm font-medium text-gray-900">{title}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">{summary}</span>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

// Material-style outlined text input with floating-ish label and counter
export function GField({
  label,
  value,
  onChange,
  maxLength,
  placeholder,
  required,
  multiline,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  type?: string;
}) {
  const empty = required && !value;
  const cls = `w-full px-3 py-2.5 border rounded text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 ${
    empty ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-600 focus:ring-blue-600'
  }`;
  return (
    <div>
      {label && <label className="block text-xs text-gray-600 mb-1">{label}{required && ' *'}</label>}
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} maxLength={maxLength} placeholder={placeholder} rows={2} className={cls} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} maxLength={maxLength} placeholder={placeholder} className={cls} />
      )}
      <div className="flex justify-between mt-0.5">
        {empty ? <p className="text-xs text-red-600">Required</p> : <span />}
        {maxLength && <p className="text-xs text-gray-400 text-right">{value.length} / {maxLength}</p>}
      </div>
    </div>
  );
}

// Toggle switch (Google style)
export function GToggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`} />
      </button>
      <span className="text-sm text-gray-800">{label}</span>
    </label>
  );
}

// Blue info banner
export function InfoBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mt-3">
      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
      </svg>
      <p className="text-sm text-gray-700">{children}</p>
    </div>
  );
}

// Yellow warning banner
export function WarnBanner({ children, action }: { children: React.ReactNode; action?: string }) {
  return (
    <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 items-start">
      <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
      </svg>
      <p className="text-sm text-gray-700 flex-1">{children}</p>
      {action && <button type="button" className="text-sm font-medium text-amber-700 hover:underline">{action}</button>}
    </div>
  );
}

// Ad strength meter (Poor → Excellent) with asset checklist chips
export function AdStrength({
  checks,
}: {
  checks: { label: string; done: boolean }[];
}) {
  const doneCount = checks.filter(c => c.done).length;
  const ratio = doneCount / checks.length;
  const label = doneCount === 0 ? 'Incomplete' : ratio < 0.4 ? 'Poor' : ratio < 0.7 ? 'Average' : ratio < 1 ? 'Good' : 'Excellent';
  const color = doneCount === 0 ? 'text-gray-500' : ratio < 0.4 ? 'text-red-600' : ratio < 0.7 ? 'text-amber-600' : ratio < 1 ? 'text-blue-600' : 'text-green-600';
  const bar = doneCount === 0 ? 'bg-gray-300' : ratio < 0.4 ? 'bg-red-500' : ratio < 0.7 ? 'bg-amber-500' : ratio < 1 ? 'bg-blue-500' : 'bg-green-500';
  return (
    <div className="bg-blue-50/60 border border-blue-100 rounded-lg px-4 py-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14.5h-2V15h2v1.5zm1.6-5.6l-.9.9c-.5.5-.7 1-.7 1.7h-2v-.5c0-.7.3-1.4.8-1.9l1.2-1.2a1.6 1.6 0 10-2.7-1.1H8.3a3.7 3.7 0 117.4 0c0 .8-.4 1.6-1.1 2.1z"/>
          </svg>
          <span className="text-sm text-gray-700">Ad strength</span>
          <span className={`text-sm font-semibold ${color}`}>{label}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {checks.map((c) => (
            <span
              key={c.label}
              className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${
                c.done ? 'text-green-700 border-green-300 bg-green-50' : 'text-gray-500 border-gray-300 bg-white'
              }`}
            >
              {c.done ? (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/></svg>
              )}
              {c.label}
            </span>
          ))}
        </div>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${bar}`} style={{ width: `${Math.max(6, ratio * 100)}%` }} />
      </div>
    </div>
  );
}

// Phone frame wrapper around ad previews (like Google's device mockup).
// contentWidth is the preview's natural pixel width; content is zoomed to fit the frame.
export function PhoneFrame({ children, contentWidth = 302 }: { children: React.ReactNode; contentWidth?: number }) {
  const zoom = Math.min(1, 302 / contentWidth);
  return (
    <div className="mx-auto w-fit">
      <div className="rounded-[2.2rem] border-[10px] border-gray-900 bg-gray-900 shadow-2xl overflow-hidden">
        <div className="bg-white relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-900 rounded-b-2xl z-10" />
          <div className="max-h-[560px] w-[330px] overflow-y-auto overflow-x-hidden pt-7 pb-3 px-[14px]">
            <div style={{ zoom }}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Preview placement tab row (Search / Display / YouTube / ...)
export function PlacementTabs<T extends string>({
  tabs,
  active,
  onSelect,
}: {
  tabs: { id: T; label: string; icon?: React.ReactNode }[];
  active: T;
  onSelect: (id: T) => void;
}) {
  return (
    <div className="flex gap-1 justify-center flex-wrap mb-4">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onSelect(t.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
            active === t.id ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-600 hover:bg-gray-100 border border-transparent'
          }`}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}

// Sidebar readiness checklist item
export function ReadyItem({ ok, label, warn }: { ok: boolean; label: string; warn?: boolean }) {
  return (
    <div className="flex items-center gap-2 py-1">
      {ok ? (
        <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-2 15l-5-5 1.4-1.4L10 14.2l7.6-7.6L19 8l-9 9z"/>
        </svg>
      ) : warn ? (
        <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
        </svg>
      ) : (
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9"/>
        </svg>
      )}
      <span className={`text-sm ${ok ? 'text-gray-800' : warn ? 'text-amber-700 underline decoration-dotted' : 'text-gray-500'}`}>{label}</span>
    </div>
  );
}
