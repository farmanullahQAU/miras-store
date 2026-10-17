import React, { useState, useMemo, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  X,
  Search,
  LayoutGrid,
  Grid3X3,
  ChevronRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import { filterAndSortProducts } from '../utils/commerceEngine.js';
import ProductCard from '../components/product/ProductCard.jsx';
import SEOHead from '../components/common/SEOHead.jsx';

export default function CatalogPage({ mode = 'shop' }) {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    products,
    categories = [],
    collections = [],
    formatPrice,
    isLoadingCatalog,
  } = useStore();

  // Derive URL parameters
  const filterParam = searchParams.get('filter') || '';
  const qParam = searchParams.get('q') || '';
  const categoryParam = mode === 'category' ? slug : searchParams.get('category') || 'all';
  const collectionParam =
    mode === 'collection'
      ? slug
      : filterParam === 'new'
      ? 'new-arrivals'
      : filterParam === 'bestsellers'
      ? 'best-sellers'
      : searchParams.get('collection') || 'all';
  const sortParam = searchParams.get('sort') || 'featured';
  const brandParam = searchParams.get('brand') || 'all';
  const regionParam = searchParams.get('region') || '';
  const colorParam = searchParams.get('color') || '';
  const sizeParam = searchParams.get('size') || '';
  const materialParam = searchParams.get('material') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const inStockParam = searchParams.get('inStock') === 'true';
  const onSaleParam =
    (mode === 'collection' && slug === 'sale') ||
    filterParam === 'sale' ||
    searchParams.get('onSale') === 'true';

  const [gridCols, setGridCols] = useState(3); // 2, 3, or 4
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [localSearchInput, setLocalSearchInput] = useState(qParam);

  useEffect(() => {
    setLocalSearchInput(qParam);
    setVisibleCount(12);
  }, [qParam, slug, mode]);

  // Active Category or Collection Metadata
  const activeCategoryObj = useMemo(
    () => (categories || []).find((c) => c.slug === categoryParam),
    [categories, categoryParam]
  );

  const activeCollectionObj = useMemo(
    () => (collections || []).find((c) => c.slug === collectionParam),
    [collections, collectionParam]
  );

  // Extract unique filter facets from published products
  const facets = useMemo(() => {
    const published = products.filter((p) => p.status === 'published');
    const brands = [...new Set(published.map((p) => p.brand).filter(Boolean))].sort();
    const colorsMap = new Map();
    const sizesSet = new Set();
    const materialsSet = new Set();
    const regionsSet = new Set();

    published.forEach((p) => {
      const orig = p.culturalOrigin || p.origin || p.specifications?.Origin || '';
      if (orig) {
        const lower = orig.toLowerCase();
        if (lower.includes('kashmir') || lower.includes('swat')) regionsSet.add('Kashmir & Swat');
        if (lower.includes('lahore') || lower.includes('multan') || lower.includes('bahawalpur') || lower.includes('punjab')) {
          regionsSet.add('Punjab');
        }
        if (lower.includes('sindh') || lower.includes('hala') || lower.includes('bhitshah') || lower.includes('karachi')) {
          regionsSet.add('Sindh');
        }
        if (lower.includes('baloch') || lower.includes('quetta') || lower.includes('kalat')) {
          regionsSet.add('Balochistan');
        }
        if (lower.includes('peshawar') || lower.includes('khyber') || lower.includes('kpk')) {
          regionsSet.add('Khyber Pakhtunkhwa');
        }
        if (lower.includes('hunza') || lower.includes('chitral') || lower.includes('gilgit')) {
          regionsSet.add('Gilgit-Baltistan & Chitral');
        }
        if (
          !lower.includes('kashmir') &&
          !lower.includes('punjab') &&
          !lower.includes('lahore') &&
          !lower.includes('multan') &&
          !lower.includes('bahawalpur') &&
          !lower.includes('sindh') &&
          !lower.includes('baloch') &&
          !lower.includes('peshawar') &&
          !lower.includes('hunza') &&
          orig.trim().length <= 28
        ) {
          regionsSet.add(orig.trim());
        }
      }

      (p.variants?.colors || []).forEach((c) => {
        const key = c.name.split(' ')[0];
        if (!colorsMap.has(key)) colorsMap.set(key, c.hex);
      });
      (p.variants?.sizes || []).forEach((s) => {
        if (s.length <= 12) sizesSet.add(s);
      });
      (p.variants?.materials || []).forEach((m) => {
        if (!m) return;
        if (m.includes('Wool')) materialsSet.add('Wool');
        else if (m.includes('Silk')) materialsSet.add('Silk');
        else if (m.includes('Cotton')) materialsSet.add('Cotton');
        else if (m.includes('Copper') || m.includes('Brass')) materialsSet.add('Brass & Copper');
        else if (m.includes('Leather')) materialsSet.add('Leather');
        else if (m.includes('Stoneware') || m.includes('Terracotta') || m.includes('Ceramic'))
          materialsSet.add('Ceramics');
        else if (m.includes('Walnut') || m.includes('Rosewood') || m.includes('Wood'))
          materialsSet.add('Wood');
        else if (m.trim().length > 0 && m.trim().length <= 28) {
          materialsSet.add(m.trim());
        }
      });
    });

    return {
      brands,
      regions: Array.from(regionsSet),
      colors: Array.from(colorsMap.entries()).map(([name, hex]) => ({ name, hex })),
      sizes: Array.from(sizesSet),
      materials: Array.from(materialsSet),
    };
  }, [products]);

  // Filter & Sort Products
  const filteredProducts = useMemo(
    () =>
      filterAndSortProducts(products, {
        searchQuery: qParam,
        category: categoryParam,
        collection: collectionParam,
        brand: brandParam,
        region: regionParam,
        color: colorParam,
        size: sizeParam,
        material: materialParam,
        minPrice: minPriceParam,
        maxPrice: maxPriceParam,
        inStockOnly: inStockParam,
        onSaleOnly: onSaleParam,
        sortBy: sortParam,
      }),
    [
      products,
      qParam,
      categoryParam,
      collectionParam,
      brandParam,
      regionParam,
      colorParam,
      sizeParam,
      materialParam,
      minPriceParam,
      maxPriceParam,
      inStockParam,
      onSaleParam,
      sortParam,
    ]
  );

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );

  // Helper to update URL search params
  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all' || value === 'false') {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setLocalSearchInput('');
  };

  // Active Filter Chips
  const activeChips = [];
  if (qParam) activeChips.push({ key: 'q', label: `Search: "${qParam}"` });
  if (mode !== 'category' && categoryParam !== 'all') {
    activeChips.push({
      key: 'category',
      label: `Category: ${activeCategoryObj?.name || categoryParam}`,
    });
  }
  if (mode !== 'collection' && collectionParam !== 'all') {
    activeChips.push({
      key: 'collection',
      label: `Collection: ${activeCollectionObj?.name || collectionParam}`,
    });
  }
  if (regionParam) activeChips.push({ key: 'region', label: `Region: ${regionParam}` });
  if (brandParam !== 'all') activeChips.push({ key: 'brand', label: `Brand: ${brandParam}` });
  if (colorParam) activeChips.push({ key: 'color', label: `Color: ${colorParam}` });
  if (sizeParam) activeChips.push({ key: 'size', label: `Size: ${sizeParam}` });
  if (materialParam) activeChips.push({ key: 'material', label: `Material: ${materialParam}` });
  if (minPriceParam) activeChips.push({ key: 'minPrice', label: `Min: ${formatPrice(minPriceParam)}` });
  if (maxPriceParam) activeChips.push({ key: 'maxPrice', label: `Max: ${formatPrice(maxPriceParam)}` });
  if (inStockParam) activeChips.push({ key: 'inStock', label: 'In Stock Only' });
  if (onSaleParam && !(mode === 'collection' && slug === 'sale')) {
    activeChips.push({ key: 'onSale', label: 'On Sale' });
  }

  // Page Heading & Description
  let pageTitle = 'The Complete Collection';
  let pageEyebrow = 'Curated Catalog';
  let pageDesc =
    'Explore every piece in our archive—from hand-loomed heritage textiles and ceramic vessels to modern apparel, leather goods, and botanical gifts.';
  let bannerImage = null;

  if (mode === 'category' && activeCategoryObj) {
    pageTitle = activeCategoryObj.name;
    pageEyebrow = activeCategoryObj.badge || 'Category Department';
    pageDesc = activeCategoryObj.description;
    bannerImage = activeCategoryObj.image;
  } else if (mode === 'collection' && activeCollectionObj) {
    pageTitle = activeCollectionObj.name;
    pageEyebrow = activeCollectionObj.eyebrow || 'Curated Edit';
    pageDesc = activeCollectionObj.description;
    bannerImage = activeCollectionObj.heroImage;
  } else if (mode === 'search') {
    pageTitle = qParam ? `Search Results for “${qParam}”` : 'Search the Catalog';
    pageEyebrow = 'Catalog Discovery';
    pageDesc = `Found ${filteredProducts.length} curated piece(s) matching your criteria.`;
  }

  const filterSidebarContent = (
    <div className="space-y-6 text-xs">
      {/* Search within results */}
      <div>
        <label
          htmlFor="catalog-search-input"
          className="block font-semibold uppercase tracking-wider text-stone-700 mb-2"
        >
          Keyword Filter
        </label>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateFilter('q', localSearchInput.trim());
          }}
          className="relative"
        >
          <input
            id="catalog-search-input"
            type="search"
            value={localSearchInput}
            onChange={(e) => setLocalSearchInput(e.target.value)}
            placeholder="Filter by keyword or SKU..."
            className="w-full bg-white border border-stone-300 rounded pl-3 pr-8 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#B85338]"
          />
          <button
            type="submit"
            aria-label="Apply keyword filter"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#B85338] cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Category Filter */}
      {mode !== 'category' && (
        <div className="pt-5 border-t border-stone-200">
          <h3 className="font-semibold uppercase tracking-wider text-stone-700 mb-2.5">
            Categories
          </h3>
          <ul className="space-y-1.5">
            <li>
              <button
                type="button"
                onClick={() => updateFilter('category', 'all')}
                className={`w-full text-left py-1 transition-colors cursor-pointer ${
                  categoryParam === 'all'
                    ? 'font-semibold text-[#B85338]'
                    : 'text-stone-600 hover:text-[#1C1917]'
                }`}
              >
                All Categories
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => updateFilter('category', cat.slug)}
                  className={`w-full text-left py-1 transition-colors cursor-pointer ${
                    categoryParam === cat.slug
                      ? 'font-semibold text-[#B85338]'
                      : 'text-stone-600 hover:text-[#1C1917]'
                  }`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Regional Provenance / Cultural Origin Filter */}
      {facets.regions.length > 0 && (
        <div className="pt-5 border-t border-stone-200">
          <h3 className="font-semibold uppercase tracking-wider text-stone-700 mb-2.5">
            Region & Heritage Origin
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {facets.regions.map((reg) => {
              const keyword = reg.split(' ')[0];
              const isSelected =
                regionParam.toLowerCase() === reg.toLowerCase() ||
                regionParam.toLowerCase() === keyword.toLowerCase();
              return (
                <button
                  key={reg}
                  type="button"
                  onClick={() => updateFilter('region', isSelected ? '' : keyword)}
                  className={`px-2.5 py-1 rounded border text-[11px] cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#B85338] text-white border-[#B85338] font-semibold'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-[#B85338]'
                  }`}
                >
                  {reg}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Range Filter */}
      <div className="pt-5 border-t border-stone-200">
        <h3 className="font-semibold uppercase tracking-wider text-stone-700 mb-2.5">
          Price Range (PKR Base)
        </h3>
        <div className="grid grid-cols-2 gap-2 mb-2.5">
          <div>
            <label htmlFor="min-price-input" className="sr-only">
              Minimum Price
            </label>
            <input
              id="min-price-input"
              type="number"
              min="0"
              placeholder="Min"
              value={minPriceParam}
              onChange={(e) => updateFilter('minPrice', e.target.value)}
              className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 text-xs text-[#1C1917]"
            />
          </div>
          <div>
            <label htmlFor="max-price-input" className="sr-only">
              Maximum Price
            </label>
            <input
              id="max-price-input"
              type="number"
              min="0"
              placeholder="Max"
              value={maxPriceParam}
              onChange={(e) => updateFilter('maxPrice', e.target.value)}
              className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 text-xs text-[#1C1917]"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: 'Under 10k', min: '', max: '10000' },
            { label: '10k – 25k', min: '10000', max: '25000' },
            { label: '25k+', min: '25000', max: '' },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                if (preset.min) next.set('minPrice', preset.min);
                else next.delete('minPrice');
                if (preset.max) next.set('maxPrice', preset.max);
                else next.delete('maxPrice');
                setSearchParams(next);
              }}
              className="px-2 py-1 rounded bg-white border border-stone-200 hover:border-[#B85338] text-[11px] text-stone-600 cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Availability & Sale Toggles */}
      <div className="pt-5 border-t border-stone-200 space-y-2.5">
        <h3 className="font-semibold uppercase tracking-wider text-stone-700 mb-2">
          Availability & Offers
        </h3>
        <label className="flex items-center gap-2.5 cursor-pointer text-stone-700">
          <input
            type="checkbox"
            checked={inStockParam}
            onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : '')}
            className="rounded border-stone-300 text-[#B85338] focus:ring-[#B85338]"
          />
          <span>In Stock Only</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer text-stone-700">
          <input
            type="checkbox"
            checked={onSaleParam}
            onChange={(e) => updateFilter('onSale', e.target.checked ? 'true' : '')}
            className="rounded border-stone-300 text-[#B85338] focus:ring-[#B85338]"
          />
          <span>Discounted / Archive Sale</span>
        </label>
      </div>

      {/* Material Filter */}
      <div className="pt-5 border-t border-stone-200">
        <h3 className="font-semibold uppercase tracking-wider text-stone-700 mb-2.5">
          Material & Craft Medium
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {facets.materials.map((mat) => (
            <button
              key={mat}
              type="button"
              onClick={() => updateFilter('material', materialParam === mat ? '' : mat)}
              className={`px-2.5 py-1 rounded border text-[11px] cursor-pointer transition-colors ${
                materialParam === mat
                  ? 'bg-[#1C1917] text-white border-[#1C1917]'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
              }`}
            >
              {mat}
            </button>
          ))}
        </div>
      </div>

      {/* Color Filter */}
      <div className="pt-5 border-t border-stone-200">
        <h3 className="font-semibold uppercase tracking-wider text-stone-700 mb-2.5">
          Color Palette
        </h3>
        <div className="flex flex-wrap gap-2">
          {facets.colors.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => updateFilter('color', colorParam === c.name ? '' : c.name)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] cursor-pointer ${
                colorParam === c.name
                  ? 'border-[#B85338] bg-[#B85338]/10 font-semibold text-[#1C1917]'
                  : 'border-stone-200 bg-white text-stone-600'
              }`}
            >
              <span
                className="w-3 h-3 rounded-full border border-stone-300"
                style={{ backgroundColor: c.hex }}
              />
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brand / Artisan Studio Filter */}
      <div className="pt-5 border-t border-stone-200">
        <h3 className="font-semibold uppercase tracking-wider text-stone-700 mb-2.5">
          Artisan Studio / Brand
        </h3>
        <select
          value={brandParam}
          onChange={(e) => updateFilter('brand', e.target.value)}
          aria-label="Filter by brand"
          className="w-full bg-white border border-stone-300 rounded px-2.5 py-2 text-xs text-[#1C1917]"
        >
          <option value="all">All Studios & Guilds</option>
          {facets.brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className="pb-20">
      <SEOHead
        title={pageTitle}
        description={pageDesc}
        canonicalPath={
          mode === 'category'
            ? `/category/${slug}`
            : mode === 'collection'
            ? `/collections/${slug}`
            : '/shop'
        }
      />

      {/* Page Header / Hero Banner */}
      <div className="relative bg-[#F3EDE2] border-b border-stone-200 overflow-hidden">
        {bannerImage && (
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <img src={bannerImage} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-stone-500 mb-4">
            <Link to="/" className="hover:text-[#1C1917]">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/shop" className="hover:text-[#1C1917]">
              Shop
            </Link>
            {mode !== 'shop' && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-[#1C1917] font-medium truncate">{pageTitle}</span>
              </>
            )}
          </nav>

          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#B85338]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{pageEyebrow}</span>
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1C1917] mt-1.5">
            {pageTitle}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl mt-2.5 leading-relaxed">
            {pageDesc}
          </p>
        </div>
      </div>

      {/* Main Catalog Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Toolbar: Mobile Filter Trigger, Product Count, Sort & Column Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-stone-300 rounded text-xs font-semibold text-[#1C1917] hover:border-[#B85338] cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#B85338]" />
              <span>Filters</span>
              {activeChips.length > 0 && (
                <span className="px-1.5 py-0.2 bg-[#B85338] text-white rounded-full text-[10px]">
                  {activeChips.length}
                </span>
              )}
            </button>

            <p className="text-xs sm:text-sm text-stone-600">
              Showing <strong className="text-[#1C1917]">{visibleProducts.length}</strong> of{' '}
              <strong className="text-[#1C1917]">{filteredProducts.length}</strong> curated pieces
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <label htmlFor="catalog-sort-select" className="text-stone-500 hidden sm:inline">
                Sort by:
              </label>
              <select
                id="catalog-sort-select"
                value={sortParam}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="bg-white border border-stone-300 rounded px-3 py-2 text-xs font-medium text-[#1C1917] focus:outline-none focus:border-[#B85338] cursor-pointer"
              >
                <option value="featured">Featured Curation</option>
                <option value="newest">Newest Arrivals</option>
                <option value="popular">Highest Rated & Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            {/* Desktop Grid Layout Switcher */}
            <div className="hidden xl:flex items-center border border-stone-300 rounded bg-white p-0.5">
              <button
                type="button"
                onClick={() => setGridCols(2)}
                aria-label="2 column grid"
                className={`p-1.5 rounded cursor-pointer ${
                  gridCols === 2 ? 'bg-[#1C1917] text-white' : 'text-stone-500 hover:text-[#1C1917]'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setGridCols(3)}
                aria-label="3 column grid"
                className={`p-1.5 rounded cursor-pointer ${
                  gridCols === 3 ? 'bg-[#1C1917] text-white' : 'text-stone-500 hover:text-[#1C1917]'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 py-4 border-b border-stone-200/70">
            <span className="text-xs font-medium text-stone-500 mr-1">Active Filters:</span>
            {activeChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-300 text-xs text-[#1C1917]"
              >
                <span>{chip.label}</span>
                <button
                  type="button"
                  onClick={() => updateFilter(chip.key, '')}
                  aria-label={`Remove ${chip.label} filter`}
                  className="text-stone-400 hover:text-red-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-semibold text-[#B85338] hover:underline ml-2 inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          </div>
        )}

        {/* Sidebar + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-28 bg-white p-5 rounded-lg border border-stone-200/90">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200">
                <h2 className="font-serif text-lg font-semibold text-[#1C1917] flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#B85338]" />
                  <span>Refine Selection</span>
                </h2>
                {activeChips.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-[11px] font-semibold text-[#B85338] hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              {filterSidebarContent}
            </div>
          </aside>

          {/* Product Grid Column */}
          <div className="lg:col-span-9">
            {isLoadingCatalog ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg border border-stone-200 p-4 space-y-3 animate-pulse"
                  >
                    <div className="aspect-4/5 bg-stone-200 rounded" />
                    <div className="h-3 bg-stone-200 rounded w-1/3" />
                    <div className="h-5 bg-stone-200 rounded w-3/4" />
                    <div className="h-4 bg-stone-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg border border-stone-200 p-12 text-center max-w-lg mx-auto my-6">
                <h3 className="font-serif text-2xl font-semibold text-[#1C1917]">
                  No Matching Pieces Found
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-2 mb-6 leading-relaxed">
                  We could not find any items matching your current combination of filters. Try removing a filter or resetting to browse our full catalog.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1C1917] text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#B85338] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              <>
                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${
                    gridCols === 2 ? 'xl:grid-cols-2' : 'xl:grid-cols-3'
                  }`}
                >
                  {visibleProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Accessible Load More Pagination */}
                {visibleCount < filteredProducts.length && (
                  <div className="mt-12 text-center">
                    <p className="text-xs text-stone-500 mb-3">
                      Showing {visibleProducts.length} of {filteredProducts.length} products
                    </p>
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + 6)}
                      className="px-8 py-3.5 bg-white border border-[#1C1917] text-[#1C1917] hover:bg-[#1C1917] hover:text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer"
                    >
                      Load More Pieces
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filter products"
          className="fixed inset-0 z-50 lg:hidden flex"
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative z-10 w-full max-w-xs bg-[#FAF7F2] h-full overflow-y-auto p-5 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200">
                <h2 className="font-serif text-xl font-semibold text-[#1C1917]">
                  Refine Selection
                </h2>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  aria-label="Close filter drawer"
                  className="p-1.5 text-stone-500 hover:text-[#1C1917] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {filterSidebarContent}
            </div>

            <div className="pt-6 mt-6 border-t border-stone-200 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={clearAllFilters}
                className="py-2.5 px-3 border border-stone-300 rounded text-xs font-semibold text-stone-700 bg-white cursor-pointer"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="py-2.5 px-3 bg-[#B85338] text-white rounded text-xs font-semibold cursor-pointer"
              >
                Show ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
