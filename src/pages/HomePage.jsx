import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Headphones, MapPin } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/product/ProductCard';
import SEOHead from '../components/common/SEOHead';

const DEFAULT_REGIONS = [
  { region: 'All', label: 'All Regions' },
  { region: 'Kashmir', label: 'Kashmir & Swat' },
  { region: 'Sindh', label: 'Sindh' },
  { region: 'Multan', label: 'Multan & Punjab' },
  { region: 'Peshawar', label: 'Peshawar & KPK' },
  { region: 'Balochistan', label: 'Balochistan' },
  { region: 'Hunza', label: 'Gilgit & Hunza' },
];

export default function HomePage() {
  const { products, categories, settings } = useStore();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('All');

  // Derive regions dynamically from products + defaults so any regional specialty added by Admin appears automatically
  const regionPills = useMemo(() => {
    const customRegions = (settings.regionalHighlights || [])
      .map((r) => ({
        region: r.region || r.title,
        label: r.title || r.region,
      }))
      .filter((r) => r.region);

    if (customRegions.length > 0) {
      return [{ region: 'All', label: 'All Regions' }, ...customRegions];
    }
    return DEFAULT_REGIONS;
  }, [settings.regionalHighlights]);

  const filteredSpotlight = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedRegion !== 'All') {
          const orig = `${p.culturalOrigin || ''} ${p.origin || ''} ${p.specifications?.Origin || ''} ${p.name || ''} ${p.description || ''}`.toLowerCase();
          if (!orig.includes(selectedRegion.toLowerCase())) return false;
        }
        if (activeTab === 'new') return p.isNew;
        if (activeTab === 'bestsellers') return p.isBestSeller;
        if (activeTab === 'sale') return (p.originalPrice || p.compareAtPrice) > p.price;
        return true;
      })
      .slice(0, 8);
  }, [products, activeTab, selectedRegion]);

  return (
    <div className="bg-[#FAF7F2]">
      <SEOHead
        title={`${settings.brandName} — ${settings.brandTagline}`}
        description={settings.brandDescription}
      />

      {/* 1. Clean Full-Bleed Editorial Hero Banner */}
      <section className="relative bg-[#1C1A17] text-[#FBF9F5] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={settings.heroBanner?.image}
            alt={settings.brandName}
            className="w-full h-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1C1A17]/90 via-[#1C1A17]/55 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-xl space-y-5">
            <span className="inline-block text-[11px] uppercase tracking-[0.24em] text-[#C59B5F] font-semibold">
              {settings.heroBanner?.eyebrow || 'Regional Specialties of Pakistan'}
            </span>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.08] text-white">
              {settings.heroBanner?.heading || 'Authentic Finds From Every Region.'}
            </h1>

            {settings.heroBanner?.subheading && (
              <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-lg">
                {settings.heroBanner.subheading}
              </p>
            )}

            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2.5 bg-white text-[#1C1A17] hover:bg-[#B85338] hover:text-white px-7 py-3.5 rounded-lg text-xs font-semibold uppercase tracking-[0.16em] transition-colors"
              >
                <span>{settings.heroBanner?.primaryCta || 'Explore Collection'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/collections/new-arrivals"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 px-6 py-3.5 rounded-lg text-xs font-semibold uppercase tracking-[0.16em] transition-colors backdrop-blur-xs"
              >
                <span>{settings.heroBanner?.secondaryCta || 'New Arrivals'}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Regional Discovery Bar (Supports Any Regional Specialty Across Pakistan) */}
      <section className="bg-white border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
            <MapPin className="w-3.5 h-3.5 text-[#B85338]" />
            <span>Shop by Origin:</span>
          </div>

          <div className="flex items-center gap-2">
            {regionPills.map((pill) => {
              const isActive = selectedRegion === pill.region;
              return (
                <button
                  key={pill.region}
                  type="button"
                  onClick={() => setSelectedRegion(pill.region)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#1C1A17] text-white font-semibold'
                      : 'bg-[#FAF7F2] text-stone-700 hover:bg-stone-200/70 border border-stone-200/80'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          <Link
            to={selectedRegion === 'All' ? '/shop' : `/shop?region=${encodeURIComponent(selectedRegion)}`}
            className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-[#B85338] hover:text-[#1C1A17] shrink-0"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 3. Featured Product Grid (4-Column Luxury Brand Layout) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#B85338] font-semibold">
              {selectedRegion === 'All' ? 'Curated Selection' : `Specialties from ${selectedRegion}`}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C1A17] mt-1">
              Signature Pieces
            </h2>
          </div>

          {/* Minimal Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All' },
              { id: 'new', label: 'New In' },
              { id: 'bestsellers', label: 'Best Sellers' },
              { id: 'sale', label: 'Sale' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#1C1A17] text-white font-semibold'
                    : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredSpotlight.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-10 text-center max-w-md mx-auto">
            <p className="text-sm text-stone-600 mb-4">
              No items match this filter yet.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedRegion('All');
                setActiveTab('all');
              }}
              className="px-5 py-2.5 rounded-lg bg-[#1C1A17] text-white text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              Show All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-9">
            {filteredSpotlight.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-white hover:bg-[#1C1A17] text-[#1C1A17] hover:text-white border border-[#1C1A17] px-8 py-3.5 rounded-lg text-xs font-semibold uppercase tracking-[0.16em] transition-colors"
          >
            <span>Shop All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 4. Clean Department Tiles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#B85338] font-semibold">
              Departments
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C1A17] mt-1">
              Shop by Category
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group relative rounded-xl overflow-hidden aspect-4/5 bg-[#EFECE6] border border-stone-200/80"
            >
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                <h3 className="font-serif text-lg sm:text-xl font-semibold">
                  {cat.name}
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-widest text-white/85 mt-1 group-hover:translate-x-1 transition-transform">
                  <span>Shop Now</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Single Clean Editorial Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="relative rounded-2xl overflow-hidden bg-[#1C1A17] text-white min-h-[300px] flex items-center p-8 sm:p-12">
          <img
            src={
              settings.lookbookBanner?.image ||
              'https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?auto=format&fit=crop&w=1400&q=85'
            }
            alt={settings.lookbookBanner?.heading || 'Regional Specialties'}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
          <div className="relative max-w-xl space-y-3">
            <span className="inline-block text-[10px] uppercase tracking-[0.25em] text-[#C59B5F] font-semibold">
              {settings.lookbookBanner?.eyebrow || 'Direct From Master Makers & Growers'}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-semibold leading-tight">
              {settings.lookbookBanner?.heading ||
                'Famous Regional Specialties From Across Pakistan'}
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              {settings.lookbookBanner?.description ||
                'Whether it is Kashmiri Pashmina, Multani Blue Pottery, Peshawari Chappals, Sindhi Ajrak, or regional delicacies and gifts — every item is sourced directly from its place of origin.'}
            </p>
            <div className="pt-2">
              <Link
                to={settings.lookbookBanner?.primaryCtaLink || '/shop'}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-[#1C1A17] hover:bg-[#B85338] hover:text-white text-xs font-semibold uppercase tracking-[0.16em] transition-colors"
              >
                <span>{settings.lookbookBanner?.primaryCtaText || 'Discover All Regions'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Minimal Service Guarantees Strip */}
      <section className="bg-white border-t border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <Truck className="w-4 h-4 text-[#B85338] shrink-0" />
            <div>
              <p className="text-xs font-semibold text-[#1C1A17]">Nationwide Delivery</p>
              <p className="text-[11px] text-stone-500">Tracked dispatch across Pakistan</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-[#B85338] shrink-0" />
            <div>
              <p className="text-xs font-semibold text-[#1C1A17]">Cash on Delivery</p>
              <p className="text-[11px] text-stone-500">Pay at your doorstep</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RotateCcw className="w-4 h-4 text-[#B85338] shrink-0" />
            <div>
              <p className="text-xs font-semibold text-[#1C1A17]">14-Day Easy Exchange</p>
              <p className="text-[11px] text-stone-500">Hassle-free return policy</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Headphones className="w-4 h-4 text-[#B85338] shrink-0" />
            <div>
              <p className="text-xs font-semibold text-[#1C1A17]">WhatsApp Support</p>
              <p className="text-[11px] text-stone-500">{settings.contactPhone}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
