import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';

export default function AnnouncementBar() {
  const { brandConfig } = useStore();
  const bar = brandConfig?.announcementBar;

  if (!bar?.enabled || !bar?.message) return null;

  return (
    <div
      role="region"
      aria-label="Store offer announcement"
      className="bg-[#1C1917] text-[#FAF7F2] border-b border-stone-800 text-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-center gap-2 text-center">
        <Sparkles className="w-3.5 h-3.5 text-[#C59B5F] shrink-0 hidden sm:inline" />
        <span className="tracking-wide font-medium truncate">{bar.message}</span>
        {bar.ctaLabel && bar.ctaLink && (
          <Link
            to={bar.ctaLink}
            className="hidden sm:inline-block ml-1.5 text-[#C59B5F] hover:text-white underline underline-offset-4 font-semibold tracking-wider uppercase text-[11px] shrink-0"
          >
            {bar.ctaLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
