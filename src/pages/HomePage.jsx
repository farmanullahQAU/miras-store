import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Truck, ShieldCheck, RotateCcw, Headphones, PlusCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/product/ProductCard';
import SEOHead from '../components/common/SEOHead';

export default function HomePage() {
  const { products, categories, settings } = useStore();
  const [activeTab, setActiveTab] = useState('all');

  const filteredSpotlight = products.filter((p) => {
    if (activeTab === 'new') return p.isNew;
    if (activeTab === 'bestsellers') return p.isBestSeller;
    if (activeTab === 'sale') return (p.originalPrice || p.compareAtPrice) > p.price;
    return true;
  }).slice(0, 8);

  return (
    <div>
      <SEOHead
        title={`${settings.brandName} — ${settings.brandTagline}`}
        description={settings.brandDescription}
      />

      {/* Hero Campaign Banner */}
      <section className="relative bg-[#1C1A17] text-[#FBF9F5] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={settings.heroBanner?.image}
            alt={settings.brandName}
            className="w-full h-full object-cover opacity-45 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1C1A17] via-[#1C1A17]/80 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
          <div className="max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs uppercase tracking-[0.2em] text-[#C59B5F] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              {settings.heroBanner?.eyebrow || 'Curated Collection'}
            </span>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] text-white">
              {settings.heroBanner?.heading || 'Discover Products With Character.'}
            </h1>

            <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-xl">
              {settings.heroBanner?.subheading}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2.5 bg-[#9E4733] hover:bg-[#823624] text-white px-7 py-4 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all shadow-lg"
              >
                {settings.heroBanner?.primaryCta || 'Shop Collection'}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/shop?filter=new"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 px-6 py-4 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all backdrop-blur-sm"
              >
                {settings.heroBanner?.secondaryCta || 'New Arrivals'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Conversion Strip */}
      <section className="bg-white border-b border-[#E6DFD3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-[#9E4733] shrink-0" />
            <div>
              <p className="text-xs font-semibold text-[#1C1A17]">Fast Nationwide Delivery</p>
              <p className="text-[11px] text-[#5C564F]">Free shipping on qualifying orders</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#9E4733] shrink-0" />
            <div>
              <p className="text-xs font-semibold text-[#1C1A17]">Cash on Delivery Available</p>
              <p className="text-[11px] text-[#5C564F]">Pay safely at your doorstep</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RotateCcw className="w-5 h-5 text-[#9E4733] shrink-0" />
            <div>
              <p className="text-xs font-semibold text-[#1C1A17]">Easy 14-Day Returns</p>
              <p className="text-[11px] text-[#5C564F]">Quick size or item exchange</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Headphones className="w-5 h-5 text-[#9E4733] shrink-0" />
            <div>
              <p className="text-xs font-semibold text-[#1C1A17]">Direct WhatsApp Support</p>
              <p className="text-[11px] text-[#5C564F]">{settings.contactPhone}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#9E4733] font-semibold">
              Browse by Department
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C1A17] mt-1">
              Shop Our Collections
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-semibold uppercase tracking-widest text-[#1C1A17] hover:text-[#9E4733] flex items-center gap-1.5"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-[#EFECE6] border border-[#E6DFD3]"
            >
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#C59B5F] font-semibold block">
                  {cat.tagline}
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-semibold mt-0.5 group-hover:text-[#FBF9F5]">
                  {cat.name}
                </h3>
                <span className="inline-flex items-center gap-1 text-xs text-white/80 mt-2 group-hover:translate-x-1 transition-transform">
                  Explore <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Showcase with Filter Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#9E4733] font-semibold">
              Featured Inventory
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C1A17] mt-1">
              Trending & Handpicked
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Featured' },
              { id: 'new', label: 'New Arrivals' },
              { id: 'bestsellers', label: 'Best Sellers' },
              { id: 'sale', label: 'On Sale' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#1C1A17] text-white shadow-sm'
                    : 'bg-white text-[#5C564F] border border-[#E6DFD3] hover:border-[#1C1A17]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredSpotlight.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E6DFD3] p-12 text-center max-w-lg mx-auto">
            <h3 className="font-serif text-xl font-semibold text-[#1C1A17] mb-2">
              Ready for Your Products
            </h3>
            <p className="text-sm text-[#5C564F] mb-6">
              No products match this tab yet. Open your Seller Admin Dashboard to list your own products and start selling.
            </p>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 bg-[#1C1A17] text-white px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-widest hover:bg-[#9E4733] transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Add Products in Admin
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpotlight.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-white hover:bg-[#1C1A17] text-[#1C1A17] hover:text-white border border-[#1C1A17] px-8 py-3.5 rounded-xl text-xs font-semibold uppercase tracking-widest transition-colors"
          >
            View Complete Catalog ({products.length} Items)
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
