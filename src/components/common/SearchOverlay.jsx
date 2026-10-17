import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, MapPin, Star, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';
import { filterAndSortProducts } from '../../utils/commerceEngine.js';

export default function SearchOverlay() {
  const {
    isSearchOpen,
    setIsSearchOpen,
    products,
    categories,
    formatPrice,
  } = useStore();

  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  // Distinct cultural regions for 1-click trending discovery
  const regionalSuggestions = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const p of products || []) {
      const origin = p.culturalOrigin || p.origin || p.specifications?.Origin || '';
      if (origin && !seen.has(origin)) {
        seen.add(origin);
        list.push(origin);
      }
    }
    return list.slice(0, 6);
  }, [products]);

  const matchingProducts = useMemo(() => {
    if (!query.trim()) return products.filter((p) => p.status === 'published').slice(0, 4);
    return filterAndSortProducts(products, { searchQuery: query }).slice(0, 6);
  }, [products, query]);

  if (!isSearchOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsSearchOpen(false);
    navigate(`/shop?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search store"
      className="fixed inset-0 z-50 flex flex-col bg-black/55 backdrop-blur-xs"
    >
      <div className="bg-[#FAF7F2] border-b border-stone-200 shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <Search className="w-5 h-5 text-stone-400 absolute left-4 pointer-events-none" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by craft, region (e.g., Sindh, Kashmir, Multan), product name, or SKU..."
              aria-label="Search products"
              className="w-full bg-white border border-stone-300 focus:border-[#B85338] rounded-xl pl-12 pr-24 py-3.5 text-sm sm:text-base text-[#1C1917] placeholder:text-stone-400 focus:outline-none shadow-2xs"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-16 text-xs text-stone-500 hover:text-[#1C1917] px-2 py-1 cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              aria-label="Close search"
              className="ml-3 p-2.5 text-stone-500 hover:text-[#1C1917] rounded-lg hover:bg-stone-200/60 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </form>

          {/* Quick Category & Regional Heritage Discovery Pills */}
          <div className="mt-4 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mr-1">
                Departments:
              </span>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  onClick={() => setIsSearchOpen(false)}
                  className="px-3 py-1 rounded-full bg-white border border-stone-200 text-xs text-[#1C1917] hover:border-[#B85338] hover:text-[#B85338] transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {regionalSuggestions.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#B85338] inline-flex items-center gap-1 mr-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Regions:</span>
                </span>
                {regionalSuggestions.map((region) => (
                  <button
                    key={region}
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      navigate(`/shop?region=${encodeURIComponent(region)}`);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#4A5D4E]/10 hover:bg-[#4A5D4E] text-[#4A5D4E] hover:text-white text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>{region}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Live Results */}
          <div className="mt-5 pb-2 max-h-[58vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">
                {query.trim()
                  ? `Instant Matches (${matchingProducts.length})`
                  : 'Featured Regional Curations'}
              </span>
              {query.trim() && matchingProducts.length > 0 && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="text-xs font-semibold text-[#B85338] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Results</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {matchingProducts.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-xl p-6 text-center space-y-2">
                <p className="text-sm font-medium text-[#1C1917]">
                  No products found for &ldquo;{query}&rdquo;
                </p>
                <p className="text-xs text-stone-500">
                  Try searching for a craft or region like &ldquo;Ajrak&rdquo;, &ldquo;Kashmir&rdquo;, &ldquo;Multan&rdquo;, or &ldquo;Peshawar&rdquo;.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matchingProducts.map((product) => {
                  const origin =
                    product.culturalOrigin || product.origin || product.specifications?.Origin || '';
                  const revCount = Array.isArray(product.reviews) ? product.reviews.length : 0;
                  return (
                    <Link
                      key={product.id}
                      to={`/product/${product.slug}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-3.5 p-3 rounded-xl bg-white border border-stone-200 hover:border-[#B85338] transition-all group shadow-2xs"
                    >
                      <img
                        src={product.images?.[0]}
                        alt={product.name}
                        className="w-14 h-16 rounded-lg object-cover shrink-0 bg-stone-100 border border-stone-200"
                      />
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-2 text-[10px]">
                          <span className="text-stone-500 uppercase tracking-wider truncate">
                            {product.category}
                          </span>
                          {origin && (
                            <span className="text-[#4A5D4E] font-semibold truncate">
                              {origin}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-[#1C1917] group-hover:text-[#B85338] truncate">
                          {product.name}
                        </h4>
                        <div className="flex items-center justify-between pt-0.5">
                          <span className="text-xs font-bold text-[#1C1917]">
                            {formatPrice(product.price)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-stone-500">
                            <Star className="w-3 h-3 fill-[#C59B5F] text-[#C59B5F]" />
                            <span>{Number(product.rating || 5).toFixed(1)}</span>
                            <span>({revCount})</span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1" onClick={() => setIsSearchOpen(false)} />
    </div>
  );
}
