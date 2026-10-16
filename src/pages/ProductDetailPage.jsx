import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingBag,
  Zap,
  Share2,
  Truck,
  RotateCcw,
  ShieldCheck,
  ZoomIn,
  X,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import { getEstimatedDeliveryRange } from '../utils/commerceEngine.js';
import ProductCard from '../components/product/ProductCard.jsx';
import SEOHead from '../components/common/SEOHead.jsx';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const {
    products,
    brandConfig,
    formatPrice,
    addToCart,
    isInWishlist,
    toggleWishlist,
    recordProductView,
    recentlyViewedProducts,
    submitProductReview,
    addToast,
  } = useStore();

  const product = useMemo(
    () => products.find((p) => p.slug === slug || p.id === slug),
    [products, slug]
  );

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [validationError, setValidationError] = useState('');
  const [activeTab, setActiveTab] = useState('description'); // description | specs | shipping | reviews

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    author: '',
    location: '',
    rating: 5,
    title: '',
    comment: '',
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (product) {
      setActiveImageIdx(0);
      setSelectedColor(product.variants?.colors?.[0]?.name || '');
      setSelectedSize(product.variants?.sizes?.[0] || '');
      setQuantity(1);
      setValidationError('');
      recordProductView(product.id);
    }
  }, [product, recordProductView]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(
        (p) =>
          p.id !== product.id &&
          p.status === 'published' &&
          (p.categorySlug === product.categorySlug ||
            (p.collections || []).some((c) => (product.collections || []).includes(c)))
      )
      .slice(0, 4);
  }, [products, product]);

  const otherRecentlyViewed = useMemo(() => {
    if (!product) return [];
    return recentlyViewedProducts.filter((p) => p.id !== product.id).slice(0, 4);
  }, [recentlyViewedProducts, product]);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <SEOHead title="Product Not Found" />
        <h1 className="font-serif text-3xl font-semibold text-[#1C1917]">
          Product Unavailable or Moved
        </h1>
        <p className="text-sm text-stone-600 mt-2 mb-6">
          We could not locate the requested product in our active catalog.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1C1917] text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#B85338] transition-colors"
        >
          Browse Active Catalog
        </Link>
      </div>
    );
  }

  const wished = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0 || product.stockStatus === 'out_of_stock';
  const hasDiscount =
    product.originalPrice && Number(product.originalPrice) > Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round(
        ((Number(product.originalPrice) - Number(product.price)) /
          Number(product.originalPrice)) *
          100
      )
    : 0;

  const validateVariantSelection = () => {
    if (product.variants?.colors?.length > 0 && !selectedColor) {
      setValidationError('Please select a color / finish option before adding to your bag.');
      return false;
    }
    if (product.variants?.sizes?.length > 0 && !selectedSize) {
      setValidationError('Please select a size / edition option before adding to your bag.');
      return false;
    }
    if (quantity < 1 || quantity > product.stock) {
      setValidationError(`Please choose a valid quantity between 1 and ${product.stock}.`);
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleAddToCart = () => {
    if (!validateVariantSelection()) return;
    addToCart(product, {
      quantity,
      selectedColor,
      selectedSize,
      openDrawer: true,
    });
  };

  const handleBuyNow = () => {
    if (!validateVariantSelection()) return;
    const ok = addToCart(product, {
      quantity,
      selectedColor,
      selectedSize,
      silent: true,
    });
    if (ok) {
      navigate('/checkout');
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.shortDescription,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard?.writeText(shareUrl);
    addToast('Product link copied to your clipboard!', 'info');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.author.trim() || !reviewForm.title.trim() || !reviewForm.comment.trim()) {
      addToast('Please fill in your name, review headline, and comment.', 'error');
      return;
    }
    setIsSubmittingReview(true);
    try {
      await submitProductReview(product.id, reviewForm);
      setReviewForm({ author: '', location: '', rating: 5, title: '', comment: '' });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const standardShipping = brandConfig.shipping.methods[0];
  const estimatedWindow = getEstimatedDeliveryRange(
    standardShipping?.estimatedDaysMin || 3,
    standardShipping?.estimatedDaysMax || 5
  );

  return (
    <div className="pb-20">
      <SEOHead
        title={product.name}
        description={product.shortDescription}
        canonicalPath={`/product/${product.slug}`}
        productSchema={product}
      />

      {/* Breadcrumbs */}
      <div className="bg-[#F3EDE2] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-1.5 text-xs text-stone-500 overflow-x-auto">
          <Link to="/" className="hover:text-[#1C1917] shrink-0">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <Link to="/shop" className="hover:text-[#1C1917] shrink-0">
            Shop
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <Link
            to={`/category/${product.categorySlug}`}
            className="hover:text-[#1C1917] shrink-0"
          >
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[#1C1917] font-medium truncate">{product.name}</span>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Left Column: Image Gallery (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-4/5 sm:aspect-square bg-[#F3EDE2] rounded-lg overflow-hidden border border-stone-200 group">
              <img
                src={product.images?.[activeImageIdx] || product.images?.[0]}
                alt={`${product.name} — view ${activeImageIdx + 1}`}
                className="w-full h-full object-cover"
              />

              {hasDiscount && (
                <span className="absolute top-4 left-4 px-3 py-1 rounded bg-[#6B2737] text-white text-xs font-semibold uppercase tracking-wider">
                  Save {discountPercent}%
                </span>
              )}

              <button
                type="button"
                onClick={() => setIsZoomOpen(true)}
                aria-label="Enlarge product image"
                className="absolute bottom-4 right-4 px-3.5 py-2 rounded-md bg-white/90 hover:bg-[#1C1917] text-[#1C1917] hover:text-white text-xs font-medium inline-flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
                <span>Enlarge View</span>
              </button>
            </div>

            {/* Thumbnail Strip */}
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((imgUrl, idx) => (
                  <button
                    key={imgUrl}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    aria-label={`View image ${idx + 1}`}
                    className={`w-20 h-24 rounded-md overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      activeImageIdx === idx
                        ? 'border-[#B85338] shadow-xs'
                        : 'border-stone-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Purchase & Details Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span className="font-semibold uppercase tracking-[0.18em] text-[#B85338]">
                  {product.brand || brandConfig.brandName}
                </span>
                <span>SKU: {product.sku}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1C1917] leading-tight">
                {product.name}
              </h1>

              {/* Rating & Provenance */}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                <div className="flex items-center gap-1 text-[#1C1917]">
                  <Star className="w-4 h-4 fill-[#C59B5F] text-[#C59B5F]" />
                  <span className="font-semibold">{product.rating?.toFixed(1)}</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('reviews')}
                    className="text-stone-500 hover:text-[#B85338] underline ml-1 cursor-pointer"
                  >
                    ({product.reviewCount} reviews)
                  </button>
                </div>

                {product.culturalOrigin && (
                  <span className="text-stone-400">·</span>
                )}
                {product.culturalOrigin && (
                  <span className="inline-flex items-center gap-1 text-[#4A5D4E] font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    {product.culturalOrigin}
                  </span>
                )}
              </div>

              {/* Price Display */}
              <div className="mt-5 pb-5 border-b border-stone-200 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-semibold text-[#1C1917]">
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-base text-stone-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="text-xs font-semibold text-[#6B2737] bg-[#6B2737]/10 px-2 py-0.5 rounded">
                      You save {formatPrice(product.originalPrice - product.price)}
                    </span>
                  </>
                )}
              </div>

              <p className="text-sm text-stone-600 leading-relaxed mt-4">
                {product.shortDescription}
              </p>
            </div>

            {/* Variant Selectors */}
            <div className="space-y-4">
              {product.variants?.colors?.length > 0 && (
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-semibold uppercase tracking-wider text-stone-700">
                      Color / Finish
                    </span>
                    <span className="text-stone-500">{selectedColor || 'Select an option'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {product.variants.colors.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => {
                          setSelectedColor(c.name);
                          setValidationError('');
                        }}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-md border text-xs font-medium cursor-pointer transition-all ${
                          selectedColor === c.name
                            ? 'border-[#B85338] bg-[#B85338]/10 text-[#1C1917] shadow-2xs'
                            : 'border-stone-300 bg-white text-stone-700 hover:border-stone-400'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-stone-300"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.variants?.sizes?.length > 0 && (
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-semibold uppercase tracking-wider text-stone-700">
                      Size / Dimensions
                    </span>
                    <span className="text-stone-500">{selectedSize || 'Select size'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.sizes.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          setSelectedSize(sz);
                          setValidationError('');
                        }}
                        className={`px-4 py-2 rounded-md border text-xs font-medium cursor-pointer transition-all ${
                          selectedSize === sz
                            ? 'border-[#1C1917] bg-[#1C1917] text-white'
                            : 'border-stone-300 bg-white text-stone-700 hover:border-stone-400'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Validation Error Banner */}
              {validationError && (
                <div
                  role="alert"
                  className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Stock Status Indicator */}
              <div className="flex items-center justify-between text-xs py-2 px-3 rounded bg-white border border-stone-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-4 h-4 ${isOutOfStock ? 'text-red-500' : 'text-[#4A5D4E]'}`}
                  />
                  <span className="font-medium text-[#1C1917]">
                    {isOutOfStock
                      ? 'Currently Out of Stock'
                      : product.stock <= 6
                      ? `Low Stock — Only ${product.stock} left in studio inventory`
                      : `In Stock (${product.stock} units ready to ship)`}
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity & Primary Call to Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center border border-stone-300 rounded-md bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={isOutOfStock}
                    aria-label="Decrease quantity"
                    className="p-3 text-stone-600 hover:text-[#1C1917] disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-semibold text-[#1C1917]">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock || 1, q + 1))}
                    disabled={isOutOfStock}
                    aria-label="Increase quantity"
                    className="p-3 text-stone-600 hover:text-[#1C1917] disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 py-3.5 px-6 bg-[#1C1917] hover:bg-[#B85338] disabled:bg-stone-300 text-white text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-md transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOutOfStock ? 'Out of Stock' : 'Add to Bag'}</span>
                </button>
              </div>

              <div className="grid grid-cols-12 gap-3">
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="col-span-8 py-3 px-5 bg-[#B85338] hover:bg-[#983F27] disabled:bg-stone-200 text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>Buy Now — Express Checkout</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  aria-label="Save to Wishlist"
                  className={`col-span-2 py-3 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                    wished
                      ? 'bg-[#6B2737] border-[#6B2737] text-white'
                      : 'bg-white border-stone-300 text-[#1C1917] hover:border-[#1C1917]'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${wished ? 'fill-current' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share product"
                  className="col-span-2 py-3 rounded-md border border-stone-300 bg-white text-[#1C1917] hover:border-[#1C1917] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Estimated Delivery & Trust Box */}
            <div className="bg-[#F3EDE2] rounded-lg p-4 border border-stone-200/90 space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <Truck className="w-4 h-4 text-[#B85338] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1C1917]">
                    Estimated Delivery: {estimatedWindow}
                  </p>
                  <p className="text-stone-600 mt-0.5">
                    Complimentary standard shipping on orders over{' '}
                    {formatPrice(brandConfig.shipping.freeShippingThreshold)}. Cash on Delivery & Bank Transfer supported.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 pt-2 border-t border-stone-200/70">
                <RotateCcw className="w-4 h-4 text-[#4A5D4E] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1C1917]">14-Day Return & Exchange Guarantee</p>
                  <p className="text-stone-600 mt-0.5">
                    Easy returns on unworn and unused pieces in original packaging.
                  </p>
                </div>
              </div>
              {product.craftsmanshipNote && (
                <div className="flex items-start gap-3 pt-2 border-t border-stone-200/70">
                  <ShieldCheck className="w-4 h-4 text-[#6B2737] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#1C1917]">Artisan Craftsmanship Guarantee</p>
                    <p className="text-stone-600 mt-0.5">{product.craftsmanshipNote}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs: Description, Specifications, Shipping, Reviews */}
        <div className="mt-16 bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div
            role="tablist"
            className="flex border-b border-stone-200 bg-[#F3EDE2]/60 overflow-x-auto"
          >
            {[
              { id: 'description', label: 'Story & Craftsmanship' },
              { id: 'specs', label: 'Specifications & Care' },
              { id: 'shipping', label: 'Shipping & Returns' },
              { id: 'reviews', label: `Customer Reviews (${product.reviews?.length || 0})` },
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-[#B85338] text-[#1C1917] bg-white'
                    : 'border-transparent text-stone-600 hover:text-[#1C1917]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-10">
            {activeTab === 'description' && (
              <div className="max-w-3xl space-y-4">
                <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
                  About This Piece
                </h2>
                <p className="text-sm sm:text-base text-stone-700 leading-relaxed">
                  {product.description}
                </p>
                {product.tags?.length > 0 && (
                  <div className="pt-4 flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <Link
                        key={tag}
                        to={`/search?q=${encodeURIComponent(tag)}`}
                        className="px-3 py-1 rounded-full bg-[#FAF7F2] border border-stone-200 text-xs text-stone-600 hover:border-[#B85338]"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="max-w-2xl">
                <h2 className="font-serif text-2xl font-semibold text-[#1C1917] mb-4">
                  Technical Specifications & Materials
                </h2>
                <dl className="divide-y divide-stone-200 border-y border-stone-200 text-sm">
                  {Object.entries(product.specifications || {}).map(([key, val]) => (
                    <div key={key} className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <dt className="font-semibold text-stone-700">{key}</dt>
                      <dd className="sm:col-span-2 text-stone-600">{val}</dd>
                    </div>
                  ))}
                  <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <dt className="font-semibold text-stone-700">Materials</dt>
                    <dd className="sm:col-span-2 text-stone-600">
                      {(product.variants?.materials || []).join(', ') || 'Artisan Grade'}
                    </dd>
                  </div>
                  <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <dt className="font-semibold text-stone-700">Catalog SKU</dt>
                    <dd className="sm:col-span-2 text-stone-600">{product.sku}</dd>
                  </div>
                </dl>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="max-w-3xl space-y-4 text-sm text-stone-700 leading-relaxed">
                <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
                  Dispatch, Packaging & Returns Policy
                </h2>
                <p>
                  Every order is inspected by our quality control team before being packed in protective, climate-appropriate materials. Fragile ceramics and glass vessels are double-boxed with custom cushioning.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  {brandConfig.shipping.methods.map((m) => (
                    <li key={m.id}>
                      <strong>{m.name}</strong> ({formatPrice(m.price)}): {m.description}.
                    </li>
                  ))}
                </ul>
                <p>
                  <strong>Returns & Exchanges:</strong> You may request a return or exchange within 14 days of delivery for unused items in original condition with all tags and provenance cards intact.
                </p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Existing Reviews */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
                      Customer Reviews ({product.reviews?.length || 0})
                    </h2>
                    <span className="px-2.5 py-1 rounded bg-stone-100 text-stone-600 text-[11px] font-medium">
                      Verified & Demo Reviews Marked
                    </span>
                  </div>

                  {!product.reviews || product.reviews.length === 0 ? (
                    <p className="text-sm text-stone-500 py-4">
                      No written reviews yet for this piece. Be the first collector to share your impressions.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {product.reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-4 rounded-lg bg-[#FAF7F2] border border-stone-200 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex text-[#C59B5F]">
                                {Array.from({ length: rev.rating }).map((_, idx) => (
                                  <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                                ))}
                              </div>
                              <span className="text-xs font-semibold text-[#1C1917]">
                                {rev.title}
                              </span>
                            </div>
                            <span className="text-[11px] text-stone-400">{rev.date}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                            {rev.comment}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-stone-500">
                            <span className="font-medium text-stone-700">{rev.author}</span>
                            {rev.location && <span>· {rev.location}</span>}
                            {rev.isDemoContent ? (
                              <span className="px-1.5 py-0.5 rounded bg-stone-200 text-stone-600 text-[10px]">
                                Demo Sample Review
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px]">
                                Submitted Review
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Review Form */}
                <div className="lg:col-span-5 bg-[#FAF7F2] p-6 rounded-lg border border-stone-200">
                  <h3 className="font-serif text-xl font-semibold text-[#1C1917] mb-3">
                    Write a Review
                  </h3>
                  <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-stone-700 mb-1">Your Name *</label>
                        <input
                          type="text"
                          required
                          value={reviewForm.author}
                          onChange={(e) =>
                            setReviewForm((s) => ({ ...s, author: e.target.value }))
                          }
                          placeholder="e.g., Nadia S."
                          className="w-full bg-white border border-stone-300 rounded px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-stone-700 mb-1">City</label>
                        <input
                          type="text"
                          value={reviewForm.location}
                          onChange={(e) =>
                            setReviewForm((s) => ({ ...s, location: e.target.value }))
                          }
                          placeholder="e.g., Lahore"
                          className="w-full bg-white border border-stone-300 rounded px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-stone-700 mb-1">Rating</label>
                      <select
                        value={reviewForm.rating}
                        onChange={(e) =>
                          setReviewForm((s) => ({ ...s, rating: Number(e.target.value) }))
                        }
                        className="w-full bg-white border border-stone-300 rounded px-3 py-2 text-xs"
                      >
                        <option value={5}>5 Stars — Exceptional</option>
                        <option value={4}>4 Stars — Very Good</option>
                        <option value={3}>3 Stars — Satisfactory</option>
                        <option value={2}>2 Stars — Below Expectations</option>
                        <option value={1}>1 Star — Poor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-stone-700 mb-1">
                        Review Headline *
                      </label>
                      <input
                        type="text"
                        required
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm((s) => ({ ...s, title: e.target.value }))}
                        placeholder="Summarize your experience"
                        className="w-full bg-white border border-stone-300 rounded px-3 py-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-stone-700 mb-1">
                        Your Review *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={reviewForm.comment}
                        onChange={(e) =>
                          setReviewForm((s) => ({ ...s, comment: e.target.value }))
                        }
                        placeholder="Share details on quality, material finish, and fit..."
                        className="w-full bg-white border border-stone-300 rounded px-3 py-2 text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="w-full py-2.5 bg-[#1C1917] hover:bg-[#B85338] text-white font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer"
                    >
                      {isSubmittingReview ? 'Publishing...' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C1917] mb-6">
              Complementary Curations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}

        {/* Recently Viewed Products */}
        {otherRecentlyViewed.length > 0 && (
          <section className="mt-16 pt-12 border-t border-stone-200">
            <h2 className="font-serif text-2xl font-semibold text-[#1C1917] mb-6">
              Recently Viewed
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {otherRecentlyViewed.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Image Zoom Lightbox Modal */}
      {isZoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged product image"
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setIsZoomOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            aria-label="Close enlarged view"
            className="fixed top-5 right-5 w-10 h-10 rounded-full bg-white text-[#1C1917] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={product.images?.[activeImageIdx] || product.images?.[0]}
            alt={product.name}
            className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
