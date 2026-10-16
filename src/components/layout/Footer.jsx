import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function Footer() {
  const { settings } = useStore();

  return (
    <footer className="bg-[#1C1A17] text-[#FBF9F5] border-t border-white/10">
      {/* Value Strip */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#C59B5F] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Nationwide Fast Dispatch</h4>
              <p className="text-xs text-white/60">Tracked courier delivery with Cash on Delivery support</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#C59B5F] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Quality Inspected</h4>
              <p className="text-xs text-white/60">Every item is verified before protective packaging</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#C59B5F] shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">14-Day Easy Exchange</h4>
              <p className="text-xs text-white/60">Hassle-free size or product exchange guarantee</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand Info */}
        <div className="space-y-4">
          <Link to="/" className="inline-block">
            <span className="font-serif text-2xl font-bold tracking-[0.2em] text-white block">
              {settings.brandName}
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C59B5F] block mt-0.5">
              {settings.brandTagline}
            </span>
          </Link>
          <p className="text-xs text-white/65 leading-relaxed">
            {settings.brandDescription}
          </p>
        </div>

        {/* Shop Collections */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C59B5F] mb-4">
            Collections
          </h4>
          <ul className="space-y-2.5 text-sm text-white/75">
            <li><Link to="/shop" className="hover:text-white transition-colors">Shop All Products</Link></li>
            <li><Link to="/collections/new-arrivals" className="hover:text-white transition-colors">New Arrivals</Link></li>
            <li><Link to="/collections/best-sellers" className="hover:text-white transition-colors">Best Sellers</Link></li>
            <li><Link to="/category/traditional-cultural" className="hover:text-white transition-colors">Traditional & Cultural</Link></li>
            <li><Link to="/category/fashion-apparel" className="hover:text-white transition-colors">Fashion & Apparel</Link></li>
            <li><Link to="/category/accessories-watches" className="hover:text-white transition-colors">Watches, Jewelry & Bags</Link></li>
            <li><Link to="/category/gifts-lifestyle" className="hover:text-white transition-colors">Gifts & Fragrances</Link></li>
            <li><Link to="/shop?onSale=true" className="hover:text-[#E89980] transition-colors">Special Offers</Link></li>
          </ul>
        </div>

        {/* Customer Account */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C59B5F] mb-4">
            Customer Account
          </h4>
          <ul className="space-y-2.5 text-sm text-white/75">
            <li><Link to="/account" className="hover:text-white transition-colors">My Profile</Link></li>
            <li><Link to="/account/orders" className="hover:text-white transition-colors">Order History & Tracking</Link></li>
            <li><Link to="/wishlist" className="hover:text-white transition-colors">Saved Wishlist</Link></li>
            <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Bag</Link></li>
            <li><Link to="/admin" className="hover:text-[#C59B5F] transition-colors">Seller Admin Portal</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C59B5F] mb-4">
            Customer Support
          </h4>
          <ul className="space-y-3 text-xs text-white/75">
            <li className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-[#C59B5F] shrink-0 mt-0.5" />
              <span>{settings.contactPhone} ({settings.supportHours})</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-[#C59B5F] shrink-0 mt-0.5" />
              <span>{settings.contactEmail}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#C59B5F] shrink-0 mt-0.5" />
              <span>{settings.headquarters}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} {settings.brandName}. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[11px] text-white/70">Cash on Delivery</span>
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[11px] text-white/70">EasyPaisa / JazzCash</span>
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[11px] text-white/70">Bank Transfer</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
