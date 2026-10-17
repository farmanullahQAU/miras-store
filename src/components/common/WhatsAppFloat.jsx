import React from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';

export default function WhatsAppFloat() {
  const { settings } = useStore();
  const { pathname } = useLocation();

  // Hide on admin dashboard so it doesn't overlap admin table actions
  if (pathname.startsWith('/admin')) return null;

  const rawPhone = (
    settings?.whatsappNumber ||
    settings?.contactPhone ||
    settings?.supportPhone ||
    '923001234567'
  ).replace(/[^0-9]/g, '');

  const whatsappUrl = `https://wa.me/${rawPhone}?text=${encodeURIComponent(
    `Assalam-o-Alaikum ${settings?.brandName || 'MIRAS'}! I need assistance with my order / product inquiry.`
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[#1C1A17] hover:bg-emerald-700 text-white text-xs font-semibold shadow-xl border border-white/15 transition-all duration-200 hover:scale-105"
    >
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <MessageCircle className="w-4 h-4 text-emerald-400" />
      <span className="hidden sm:inline">WhatsApp Help</span>
    </a>
  );
}
