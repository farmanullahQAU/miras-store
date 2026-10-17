import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, MessageCircle, ArrowUpRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function Footer() {
  const { settings, categories = [], user } = useStore();
  const cleanPhone = (settings.whatsappNumber || settings.contactPhone || '923001234567').replace(
    /[^0-9]/g,
    ''
  );

  return (
    <footer className="bg-[#1C1A17] text-[#FBF9F5] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Column 1: Brand Identity (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-block">
              <span className="font-serif text-2xl font-bold tracking-[0.2em] text-white block">
                {settings.brandName || 'MIRAS'}
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C59B5F] block mt-0.5">
                {settings.brandTagline || settings.tagline}
              </span>
            </Link>
            <p className="text-xs text-white/65 leading-relaxed max-w-sm">
              {settings.brandDescription || settings.subTagline}
            </p>
            <div className="pt-1">
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-[#9E4733] text-xs font-medium text-white transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#C59B5F]" />
                <span>Chat on WhatsApp</span>
                <ArrowUpRight className="w-3 h-3 opacity-70" />
              </a>
            </div>
          </div>

          {/* Column 2: Dynamic Categories (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C59B5F] mb-4">
              Departments
            </h4>
            <ul className="space-y-2.5 text-xs text-white/75">
              <li>
                <Link to="/shop" className="hover:text-white transition-colors font-medium">
                  All Products
                </Link>
              </li>
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id || cat.slug}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/collections/sale"
                  className="text-[#E89980] hover:text-white transition-colors font-medium"
                >
                  Special Offers & Sale
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Navigation (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C59B5F] mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs text-white/75">
              <li>
                <Link to="/track-order" className="hover:text-white transition-colors">
                  Track Order Status
                </Link>
              </li>
              <li>
                <Link
                  to={user ? '/account' : '/login'}
                  className="hover:text-white transition-colors"
                >
                  {user ? 'My Account' : 'Customer Sign In'}
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Shopping Bag
                </Link>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="text-[#C59B5F] hover:text-white transition-colors font-medium"
                >
                  Seller Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Direct Contact (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C59B5F] mb-4">
              Contact & Dispatch
            </h4>
            <ul className="space-y-3 text-xs text-white/75">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#C59B5F] shrink-0 mt-0.5" />
                <div>
                  <a
                    href={`tel:${settings.contactPhone || settings.supportPhone}`}
                    className="hover:text-white transition-colors block font-medium text-white"
                  >
                    {settings.contactPhone || settings.supportPhone}
                  </a>
                  <span className="text-[11px] text-white/50">
                    {settings.supportHours || 'Mon–Sat, 9am–9pm PKT'}
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#C59B5F] shrink-0 mt-0.5" />
                <a
                  href={`mailto:${settings.contactEmail || settings.supportEmail}`}
                  className="hover:text-white transition-colors break-all"
                >
                  {settings.contactEmail || settings.supportEmail}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C59B5F] shrink-0 mt-0.5" />
                <span className="text-white/65">
                  {settings.headquarters || settings.cityBase}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>
            © {new Date().getFullYear()} {settings.brandName || 'MIRAS'}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[11px] text-white/70">
              Cash on Delivery (COD)
            </span>
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[11px] text-white/70">
              EasyPaisa / JazzCash
            </span>
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[11px] text-white/70">
              Bank Transfer (Raast)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
