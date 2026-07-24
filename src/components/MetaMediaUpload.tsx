'use client';

import { useEffect, useRef, useState } from 'react';
import {
  MetaPlacement,
  MediaKind,
  MediaVerdict,
  META_SPECS,
  validateMedia,
  formatRatio,
  formatDuration,
  looksLikeVideoUrl,
} from '@/lib/metaSpecs';

interface MetaMediaUploadProps {
  value: string;
  kind: MediaKind;
  onChange: (url: string, kind: MediaKind) => void;
  placement: MetaPlacement;
  label: string;
}

interface Probe {
  width: number;
  height: number;
  durationSec?: number;
  bytes?: number;
}

// Single media slot mirroring Ads Manager's "Uploaded media" tiles: accepts
// images and videos, probes real dimensions/duration and grades the file
// against the selected placement's spec ("Optimised" / "Not optimised").
export default function MetaMediaUpload({ value, kind, onChange, placement, label }: MetaMediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [probe, setProbe] = useState<Probe | null>(null);
  const [verdict, setVerdict] = useState<MediaVerdict | null>(null);
  const [showIssues, setShowIssues] = useState(false);
  const bytesRef = useRef<number | undefined>(undefined);

  const isVideo = kind === 'video' || looksLikeVideoUrl(value);

  // Probe dimensions/duration whenever the media changes
  useEffect(() => {
    setProbe(null);
    setVerdict(null);
    if (!value) return;
    let cancelled = false;

    if (isVideo) {
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.onloadedmetadata = () => {
        if (cancelled) return;
        const info = { width: v.videoWidth, height: v.videoHeight, durationSec: v.duration, bytes: bytesRef.current };
        setProbe(info);
        setVerdict(validateMedia(placement, 'video', info));
      };
      v.src = value;
    } else {
      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        const info = { width: img.naturalWidth, height: img.naturalHeight, bytes: bytesRef.current };
        setProbe(info);
        setVerdict(validateMedia(placement, 'image', info));
      };
      img.src = value;
    }
    return () => { cancelled = true; };
  }, [value, isVideo, placement]);

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    bytesRef.current = file.size;
    if (file.type.startsWith('video/')) {
      // Videos stay as object URLs — data URLs of large videos would blow the
      // localStorage quota. They preview fine but aren't restored next session.
      onChange(URL.createObjectURL(file), 'video');
    } else if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) onChange(e.target.result as string, 'image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
  };

  const spec = META_SPECS[placement][isVideo ? 'video' : 'image'];

  return (
    <div>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !value && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg text-center transition-colors overflow-hidden ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        } ${value ? 'h-36' : 'h-28 cursor-pointer'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          className="hidden"
        />

        {value ? (
          <div className="relative w-full h-full bg-gray-900">
            {isVideo ? (
              <video src={value} className="w-full h-full object-contain" muted loop autoPlay playsInline />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={value} alt={label} className="w-full h-full object-contain" />
            )}
            {/* Verdict badge — same language Ads Manager uses */}
            {verdict && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowIssues(!showIssues); }}
                className={`absolute top-1.5 left-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  verdict.ok ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {verdict.ok ? 'Optimised' : `Not optimised${verdict.issues.length > 1 ? ` (${verdict.issues.length})` : ''}`}
              </button>
            )}
            {probe && (
              <span className="absolute bottom-1.5 left-1.5 text-[10px] text-white bg-black/60 px-1.5 py-0.5 rounded">
                {probe.width} × {probe.height} · {formatRatio(probe.width, probe.height)}
                {probe.durationSec !== undefined && ` · ${formatDuration(probe.durationSec)}`}
              </span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); bytesRef.current = undefined; onChange('', 'image'); }}
              className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
              title="Remove media"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 px-2">
            <svg className="w-7 h-7 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span className="text-xs font-medium">{label}</span>
            <span className="text-[10px] text-gray-400 mt-0.5">Image or video · {spec.recommendedResolution}</span>
          </div>
        )}
      </div>

      {/* Issue details, expanded from the "Not optimised" badge */}
      {verdict && !verdict.ok && showIssues && (
        <ul className="mt-1.5 space-y-1 bg-amber-50 border border-amber-200 rounded-md p-2">
          {verdict.issues.map((issue, i) => (
            <li key={i} className="text-[11px] text-amber-800 leading-snug">• {issue}</li>
          ))}
        </ul>
      )}
      {value && isVideo && (
        <p className="mt-1 text-[10px] text-gray-400">Videos preview only — they aren&apos;t saved between sessions.</p>
      )}
    </div>
  );
}
