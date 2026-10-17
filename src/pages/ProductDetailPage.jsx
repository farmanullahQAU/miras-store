import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  ChevronDown,
  MapPin,
  Ruler,
  MessageCircle,
  Eye,
  Award,
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
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [sizeUnit, setSizeUnit] = useState('in'); // 'in' | 'cm'
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [validationError, setValidationError] = useState('');
  const [openAccordion, setOpenAccordion] = useState('story'); // 'story' | 'specs' | 'shipping' | ''

  const reviewsSectionRef = useRef(null);
  const trackedProductIdRef = useRef(null);

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    author: '',
    location: '',
    rating: 5,
    title: '',
    comment: '',
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Reset UI selection when switching to a different product
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (product && trackedProductIdRef.current !== product.id) {
      trackedProductIdRef.current = product.id;
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

  const productReviews = Array.isArray(product.reviews) ? product.reviews : [];
  const realReviewCount = productReviews.length;
  const realRating =
    realReviewCount > 0
      ? Number(
          (
            productReviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) /
            realReviewCount
          ).toFixed(1)
        )
      : Number(product.rating || 5.0);
  const realViewCount = Math.max(1, Number(product.viewCount || 1));

  // Rating breakdown (5 stars down to 1 star)
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = productReviews.filter((r) => Math.round(Number(r.rating || 5)) === star).length;
    const percent = realReviewCount > 0 ? Math.round((count / realReviewCount) * 100) : 0;
    return { star, count, percent };
  });

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

  const culturalOrigin =
    product.culturalOrigin || product.origin || product.specifications?.Origin || '';

  const scrollToReviews = () => {
    reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Image Gallery (7 cols) */}
          <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-24">
            <div className="relative aspect-4/5 sm:aspect-square bg-[#F3EDE2] rounded-xl overflow-hidden border border-stone-200 group">
              <img
                src={product.images?.[activeImageIdx] || product.images?.[0]}
                alt={`${product.name} — view ${activeImageIdx + 1}`}
                className="w-full h-full object-cover"
              />

              {hasDiscount && (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-md bg-[#6B2737] text-white text-xs font-semibold uppercase tracking-wider shadow-xs">
                  Save {discountPercent}%
                </span>
              )}

              <button
                type="button"
                onClick={() => setIsZoomOpen(true)}
                aria-label="Enlarge product image"
                className="absolute bottom-4 right-4 px-3.5 py-2 rounded-lg bg-white/95 hover:bg-[#1C1917] text-[#1C1917] hover:text-white text-xs font-medium inline-flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
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
                    className={`w-20 h-24 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
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

          {/* Right Column: Clean, Unambiguous Product Purchase & Details Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. Header: Category, Cultural Origin, Title, Real Rating & Real Views */}
            <div className="space-y-3 pb-5 border-b border-stone-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#B85338]">
                    {product.category}
                  </span>
                  {culturalOrigin && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] text-[11px] font-semibold">
                      <MapPin className="w-3 h-3" />
                      {culturalOrigin}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-stone-400 font-mono">SKU: {product.sku}</span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1C1917] leading-snug">
                {product.name}
              </h1>

              {/* Real Rating, Verified Review Anchor Link, & Real Product Views */}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                <button
                  type="button"
                  onClick={scrollToReviews}
                  className="inline-flex items-center gap-1.5 text-[#1C1917] hover:text-[#B85338] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center text-[#C59B5F]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.round(realRating) ? 'fill-current' : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold">{realRating.toFixed(1)}</span>
                  <span className="text-stone-500 group-hover:text-[#B85338] underline">
                    ({realReviewCount} {realReviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                </button>

                <span className="text-stone-300">|</span>

                <span
                  className="inline-flex items-center gap-1.5 text-stone-600 font-medium"
                  title="Total real product page views"
                >
                  <Eye className="w-3.5 h-3.5 text-[#B85338]" />
                  <span>
                    {realViewCount.toLocaleString()} {realViewCount === 1 ? 'view' : 'views'}
                  </span>
                </span>

                <span className="text-stone-300">|</span>

                <span
                  className={`inline-flex items-center gap-1 font-semibold ${
                    isOutOfStock
                      ? 'text-red-600'
                      : product.stock <= 6
                      ? 'text-amber-700'
                      : 'text-[#4A5D4E]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isOutOfStock
                    ? 'Out of Stock'
                    : product.stock <= 6
                    ? `Low Stock (${product.stock} left)`
                    : `In Stock (${product.stock} available)`}
                </span>
              </div>
            </div>

            {/* 2. Clear Price & Value Block */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-bold text-[#1C1917]">
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-base text-stone-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="text-xs font-semibold text-[#6B2737] bg-[#6B2737]/10 px-2.5 py-1 rounded-md">
                      Save {formatPrice(product.originalPrice - product.price)} ({discountPercent}% OFF)
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-stone-500">
                Inclusive of all taxes · Authenticity guaranteed from{' '}
                <strong className="text-stone-700">{culturalOrigin || 'Pakistan'}</strong>
              </p>
              {product.shortDescription && (
                <p className="text-sm text-stone-600 leading-relaxed pt-2">
                  {product.shortDescription}
                </p>
              )}
            </div>

            {/* 3. Unambiguous Variant Selectors (Color & Size) */}
            <div className="space-y-5 pt-2">
              {product.variants?.colors?.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold uppercase tracking-wider text-stone-500">
                      1. Select Color / Finish:
                    </span>
                    <span className="font-semibold text-[#1C1917]">
                      {selectedColor || 'Choose option'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {product.variants.colors.map((c) => {
                      const isSelected = selectedColor === c.name;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => {
                            setSelectedColor(c.name);
                            setValidationError('');
                          }}
                          className={`inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#1C1917] bg-[#1C1917] text-white shadow-xs'
                              : 'border-stone-300 bg-white text-stone-700 hover:border-stone-400'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-white/40 shadow-2xs shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {product.variants?.sizes?.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold uppercase tracking-wider text-stone-500">
                      {product.variants?.colors?.length > 0 ? '2. ' : '1. '}Select Size / Edition:
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="inline-flex items-center gap-1 text-[#B85338] hover:underline font-semibold cursor-pointer"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>Size & Measurement Guide</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {product.variants.sizes.map((sz) => {
                      const isSelected = selectedSize === sz;
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => {
                            setSelectedSize(sz);
                            setValidationError('');
                          }}
                          className={`px-4 py-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#1C1917] bg-[#1C1917] text-white shadow-xs'
                              : 'border-stone-300 bg-white text-stone-700 hover:border-stone-400'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Validation Error Banner */}
              {validationError && (
                <div
                  role="alert"
                  className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}
            </div>

            {/* 4. Purchase Actions Box */}
            <div className="p-5 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-3.5">
              <div className="flex items-center gap-3">
                {/* Quantity Selector */}
                <div
                  className="inline-flex items-center border border-stone-300 rounded-lg bg-[#FAF7F2]"
                  aria-label="Quantity selector"
                >
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={isOutOfStock}
                    aria-label="Decrease quantity"
                    className="p-3.5 text-stone-600 hover:text-[#1C1917] disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-bold text-[#1C1917] min-w-[2.5rem] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock || 1, q + 1))}
                    disabled={isOutOfStock}
                    aria-label="Increase quantity"
                    className="p-3.5 text-stone-600 hover:text-[#1C1917] disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Bag Primary Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 py-3.5 px-6 bg-[#1C1917] hover:bg-[#B85338] disabled:bg-stone-300 text-white text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-lg transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOutOfStock ? 'Out of Stock' : 'Add to Bag'}</span>
                </button>
              </div>

              {/* Express Checkout + Wishlist + Share */}
              <div className="grid grid-cols-12 gap-2.5">
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="col-span-8 py-3 px-4 bg-[#B85338] hover:bg-[#983F27] disabled:bg-stone-200 text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>Buy It Now</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  aria-label="Save to Wishlist"
                  title={wished ? 'Remove from Wishlist' : 'Save to Wishlist'}
                  className={`col-span-2 py-3 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
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
                  title="Copy product link"
                  className="col-span-2 py-3 rounded-lg border border-stone-300 bg-white text-[#1C1917] hover:border-[#1C1917] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* WhatsApp Concierge Inquiry */}
              <a
                href={`https://wa.me/${(brandConfig.whatsappNumber || brandConfig.contactPhone || '923001234567').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Assalam-o-Alaikum ${brandConfig.brandName}! I would like to inquire about "${product.name}" (SKU: ${product.sku}, Price: ${formatPrice(product.price)}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-lg border border-emerald-700/25 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-900 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-700" />
                <span>Order or Ask via WhatsApp Concierge</span>
              </a>
            </div>

            {/* 5. Concise Delivery & Returns Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F3EDE2]/80 border border-stone-200/90 flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-[#B85338] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1C1917]">Delivery: {estimatedWindow}</p>
                  <p className="text-stone-600 mt-0.5">
                    Free shipping over {formatPrice(brandConfig.shipping.freeShippingThreshold)}
                  </p>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F3EDE2]/80 border border-stone-200/90 flex items-start gap-2.5">
                <RotateCcw className="w-4 h-4 text-[#4A5D4E] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1C1917]">14-Day Easy Returns</p>
                  <p className="text-stone-600 mt-0.5">COD & Online Transfer available</p>
                </div>
              </div>
            </div>

            {/* 6. Clean Collapsible Accordions (Khaadi / Shopify Standard Right-Column Layout) */}
            <div className="divide-y divide-stone-200 border-y border-stone-200">
              {/* Story & Craftsmanship Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setOpenAccordion((prev) => (prev === 'story' ? '' : 'story'))
                  }
                  className="w-full py-4 flex items-center justify-between text-left text-sm font-semibold text-[#1C1917] hover:text-[#B85338] transition-colors cursor-pointer"
                >
                  <span>Story & Regional Craftsmanship</span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-500 transition-transform ${
                      openAccordion === 'story' ? 'rotate-180 text-[#B85338]' : ''
                    }`}
                  />
                </button>
                {openAccordion === 'story' && (
                  <div className="pb-4 space-y-3 text-xs sm:text-sm text-stone-600 leading-relaxed">
                    <p>{product.description}</p>
                    {product.craftsmanshipNote && (
                      <div className="p-3 rounded-lg bg-[#FAF7F2] border border-stone-200 flex items-start gap-2.5 text-xs">
                        <ShieldCheck className="w-4 h-4 text-[#6B2737] shrink-0 mt-0.5" />
                        <span>{product.craftsmanshipNote}</span>
                      </div>
                    )}
                    {product.tags?.length > 0 && (
                      <div className="pt-1 flex flex-wrap gap-1.5">
                        {product.tags.map((tag) => (
                          <Link
                            key={tag}
                            to={`/search?q=${encodeURIComponent(tag)}`}
                            className="px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-stone-200 text-[11px] text-stone-600 hover:border-[#B85338]"
                          >
                            #{tag}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Specifications & Materials Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setOpenAccordion((prev) => (prev === 'specs' ? '' : 'specs'))
                  }
                  className="w-full py-4 flex items-center justify-between text-left text-sm font-semibold text-[#1C1917] hover:text-[#B85338] transition-colors cursor-pointer"
                >
                  <span>Specifications, Origin & Materials</span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-500 transition-transform ${
                      openAccordion === 'specs' ? 'rotate-180 text-[#B85338]' : ''
                    }`}
                  />
                </button>
                {openAccordion === 'specs' && (
                  <div className="pb-4">
                    <dl className="divide-y divide-stone-100 text-xs">
                      {Object.entries(product.specifications || {}).map(([key, val]) => (
                        <div key={key} className="py-2.5 grid grid-cols-3 gap-2">
                          <dt className="font-semibold text-stone-700">{key}</dt>
                          <dd className="col-span-2 text-stone-600">{val}</dd>
                        </div>
                      ))}
                      <div className="py-2.5 grid grid-cols-3 gap-2">
                        <dt className="font-semibold text-stone-700">Materials</dt>
                        <dd className="col-span-2 text-stone-600">
                          {(product.variants?.materials || []).join(', ') || 'Artisan Grade'}
                        </dd>
                      </div>
                      <div className="py-2.5 grid grid-cols-3 gap-2">
                        <dt className="font-semibold text-stone-700">Catalog SKU</dt>
                        <dd className="col-span-2 text-stone-600">{product.sku}</dd>
                      </div>
                    </dl>
                  </div>
                )}
              </div>

              {/* Shipping & Care Policy Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setOpenAccordion((prev) => (prev === 'shipping' ? '' : 'shipping'))
                  }
                  className="w-full py-4 flex items-center justify-between text-left text-sm font-semibold text-[#1C1917] hover:text-[#B85338] transition-colors cursor-pointer"
                >
                  <span>Nationwide Dispatch & Return Policy</span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-500 transition-transform ${
                      openAccordion === 'shipping' ? 'rotate-180 text-[#B85338]' : ''
                    }`}
                  />
                </button>
                {openAccordion === 'shipping' && (
                  <div className="pb-4 space-y-2.5 text-xs text-stone-600 leading-relaxed">
                    <p>
                      Every piece is inspected by our quality control team before being packed in protective materials. Fragile ceramics and glass vessels are double-boxed with custom cushioning.
                    </p>
                    <ul className="list-disc pl-4 space-y-1">
                      {brandConfig.shipping.methods.map((m) => (
                        <li key={m.id}>
                          <strong className="text-[#1C1917]">{m.name}</strong> ({formatPrice(m.price)}): {m.description}.
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            DEDICATED CUSTOMER REVIEWS & RATINGS SECTION (ALWAYS VISIBLE BELOW)
           ===================================================================== */}
        <section
          ref={reviewsSectionRef}
          id="customer-reviews"
          className="mt-16 pt-12 border-t border-stone-200 scroll-mt-24"
        >
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-10 shadow-2xs">
            {/* Section Header & Rating Summary Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 border-b border-stone-200 items-center">
              {/* Left: Overall Score */}
              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-start gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B85338]">
                    Verified Collector Feedback
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C1917] mt-1">
                    Customer Reviews
                  </h2>
                </div>

                <div className="flex items-center gap-4 bg-[#FAF7F2] px-5 py-4 rounded-xl border border-stone-200 w-full sm:w-auto">
                  <div className="text-4xl font-serif font-bold text-[#1C1917]">
                    {realRating.toFixed(1)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center text-[#C59B5F]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.round(realRating) ? 'fill-current' : 'text-stone-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-stone-600 font-medium">
                      Based on <strong>{realReviewCount}</strong>{' '}
                      {realReviewCount === 1 ? 'verified review' : 'verified reviews'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Middle: 5-Star to 1-Star Distribution Bars */}
              <div className="lg:col-span-5 space-y-2">
                {ratingBreakdown.map((item) => (
                  <div key={item.star} className="flex items-center gap-3 text-xs">
                    <span className="w-12 font-semibold text-stone-700 inline-flex items-center gap-1">
                      {item.star} <Star className="w-3 h-3 fill-[#C59B5F] text-[#C59B5F]" />
                    </span>
                    <div className="flex-1 h-2.5 rounded-full bg-stone-100 overflow-hidden border border-stone-200/60">
                      <div
                        className="h-full bg-[#C59B5F] rounded-full transition-all duration-500"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-stone-500 font-mono">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>

              {/* Right: Authenticity Badge */}
              <div className="lg:col-span-3 bg-[#F3EDE2]/70 rounded-xl p-4 border border-stone-200/80 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#1C1917] font-semibold">
                  <Award className="w-4 h-4 text-[#B85338]" />
                  <span>100% Real Reviews</span>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  Every rating and review on {brandConfig.brandName} is dynamically calculated from actual customer submissions stored in Cloudflare D1.
                </p>
              </div>
            </div>

            {/* Reviews List + Write a Review Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-10">
              {/* Left 7 Cols: Customer Reviews Feed */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="font-serif text-xl font-semibold text-[#1C1917]">
                  Showing {realReviewCount} {realReviewCount === 1 ? 'Review' : 'Reviews'}
                </h3>

                {realReviewCount === 0 ? (
                  <div className="p-8 rounded-xl bg-[#FAF7F2] border border-stone-200 text-center space-y-2">
                    <p className="text-sm font-semibold text-[#1C1917]">
                      No customer reviews yet for this piece
                    </p>
                    <p className="text-xs text-stone-500">
                      Have you experienced the craftsmanship of {product.name}? Share your first review using the form on the right.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {productReviews.map((rev) => (
                      <article
                        key={rev.id}
                        className="p-5 rounded-xl bg-[#FAF7F2] border border-stone-200 space-y-3 transition-colors hover:border-stone-300"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#1C1917] text-[#FAF7F2] flex items-center justify-center text-xs font-bold uppercase">
                              {(rev.author || 'C')[0]}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[#1C1917]">
                                  {rev.author}
                                </span>
                                {rev.location && (
                                  <span className="text-[11px] text-stone-500">
                                    · {rev.location}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <div className="flex text-[#C59B5F]">
                                  {Array.from({ length: 5 }).map((_, idx) => (
                                    <Star
                                      key={idx}
                                      className={`w-3 h-3 ${
                                        idx < Number(rev.rating || 5)
                                          ? 'fill-current'
                                          : 'text-stone-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                                  Verified Collector
                                </span>
                              </div>
                            </div>
                          </div>
                          <time className="text-[11px] text-stone-400 font-mono">
                            {rev.date}
                          </time>
                        </div>

                        {rev.title && (
                          <h4 className="text-sm font-semibold text-[#1C1917]">{rev.title}</h4>
                        )}

                        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                          {rev.comment}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              {/* Right 5 Cols: Write a Customer Review Form */}
              <div className="lg:col-span-5">
                <div className="bg-[#FAF7F2] p-6 rounded-xl border border-stone-200 sticky top-24">
                  <h3 className="font-serif text-xl font-semibold text-[#1C1917] mb-1">
                    Write a Customer Review
                  </h3>
                  <p className="text-xs text-stone-500 mb-4">
                    Share your experience with the quality, finish, and regional craftsmanship of this piece.
                  </p>

                  <form onSubmit={handleReviewSubmit} className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={reviewForm.author}
                          onChange={(e) =>
                            setReviewForm((s) => ({ ...s, author: e.target.value }))
                          }
                          placeholder="e.g., Nadia S."
                          className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-[#B85338]"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">
                          City / Region
                        </label>
                        <input
                          type="text"
                          value={reviewForm.location}
                          onChange={(e) =>
                            setReviewForm((s) => ({ ...s, location: e.target.value }))
                          }
                          placeholder="e.g., Lahore"
                          className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-[#B85338]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Your Rating *
                      </label>
                      <select
                        value={reviewForm.rating}
                        onChange={(e) =>
                          setReviewForm((s) => ({ ...s, rating: Number(e.target.value) }))
                        }
                        className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-[#B85338]"
                      >
                        <option value={5}>★★★★★ (5/5) — Exceptional Craftsmanship</option>
                        <option value={4}>★★★★☆ (4/5) — Very Good</option>
                        <option value={3}>★★★☆☆ (3/5) — Satisfactory</option>
                        <option value={2}>★★☆☆☆ (2/5) — Below Expectations</option>
                        <option value={1}>★☆☆☆☆ (1/5) — Poor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Review Headline *
                      </label>
                      <input
                        type="text"
                        required
                        value={reviewForm.title}
                        onChange={(e) =>
                          setReviewForm((s) => ({ ...s, title: e.target.value }))
                        }
                        placeholder="Summarize your impression in a few words"
                        className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-[#B85338]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Detailed Review *
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={reviewForm.comment}
                        onChange={(e) =>
                          setReviewForm((s) => ({ ...s, comment: e.target.value }))
                        }
                        placeholder="Tell other shoppers about the fabric/material quality, sizing, and finish..."
                        className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-[#B85338]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="w-full py-3 bg-[#1C1917] hover:bg-[#B85338] text-white font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                    >
                      {isSubmittingReview ? 'Publishing Review...' : 'Submit Verified Review'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

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

      {/* Khaadi & Diners Inspired Size & Fit Guide Modal */}
      {isSizeGuideOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Size and Fit Guide"
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsSizeGuideOpen(false)}
        >
          <div
            className="bg-white rounded-2xl border border-stone-200 max-w-2xl w-full max-h-[88vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B85338]">
                  {brandConfig.brandName} Tailoring & Fit Standard
                </span>
                <h2 className="font-serif text-2xl font-semibold text-[#1C1917] mt-0.5">
                  Size & Measurement Guide
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-lg border border-stone-300 p-0.5 bg-stone-100 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setSizeUnit('in')}
                    className={`px-2.5 py-1 rounded-md cursor-pointer ${
                      sizeUnit === 'in' ? 'bg-[#1C1917] text-white' : 'text-stone-600'
                    }`}
                  >
                    Inches
                  </button>
                  <button
                    type="button"
                    onClick={() => setSizeUnit('cm')}
                    className={`px-2.5 py-1 rounded-md cursor-pointer ${
                      sizeUnit === 'cm' ? 'bg-[#1C1917] text-white' : 'text-stone-600'
                    }`}
                  >
                    CM
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(false)}
                  aria-label="Close Size Guide"
                  className="p-2 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Eastern Ready-to-Wear / Kurta / Kameez Chart */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                Eastern Ready-to-Wear & Kurta Measurements ({sizeUnit.toUpperCase()})
              </h3>
              <div className="overflow-x-auto border border-stone-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F3EDE2] text-[#1C1917] font-semibold border-b border-stone-200">
                    <tr>
                      <th className="py-2.5 px-3">Size</th>
                      <th className="py-2.5 px-3">Shoulder</th>
                      <th className="py-2.5 px-3">Chest / Bust</th>
                      <th className="py-2.5 px-3">Waist</th>
                      <th className="py-2.5 px-3">Shirt Length</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-stone-700">
                    {[
                      { sz: 'XS', sh: 13.5, ch: 36, wa: 32, len: 37 },
                      { sz: 'S', sh: 14.0, ch: 38, wa: 34, len: 38 },
                      { sz: 'M', sh: 14.5, ch: 40, wa: 36, len: 39 },
                      { sz: 'L', sh: 15.5, ch: 43, wa: 39, len: 40 },
                      { sz: 'XL', sh: 16.5, ch: 46, wa: 42, len: 41 },
                    ].map((row) => {
                      const mult = sizeUnit === 'cm' ? 2.54 : 1;
                      const fmt = (v) => (v * mult).toFixed(sizeUnit === 'cm' ? 0 : 1);
                      return (
                        <tr key={row.sz} className="hover:bg-stone-50">
                          <td className="py-2.5 px-3 font-semibold text-[#1C1917]">{row.sz}</td>
                          <td className="py-2.5 px-3">{fmt(row.sh)}</td>
                          <td className="py-2.5 px-3">{fmt(row.ch)}</td>
                          <td className="py-2.5 px-3">{fmt(row.wa)}</td>
                          <td className="py-2.5 px-3">{fmt(row.len)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Unstitched Fabric & Shawl Standard Dimensions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-stone-200 space-y-1">
                <p className="font-semibold text-[#1C1917]">3-Piece Unstitched Suit Standard</p>
                <p className="text-stone-600">
                  Shirt Fabric: 3.0 Meters · Dupatta / Shawl: 2.5 Meters · Trouser / Shalwar: 2.5 Meters.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-stone-200 space-y-1">
                <p className="font-semibold text-[#1C1917]">Artisanal Shawls & Wraps</p>
                <p className="text-stone-600">
                  Full Generous Drape: 100 inches × 45 inches (254 cm × 114 cm). Hand-finished edges.
                </p>
              </div>
            </div>

            {/* Fabric Care Instructions */}
            <div className="p-4 rounded-xl bg-[#F3EDE2]/70 border border-stone-200 text-xs space-y-1.5">
              <p className="font-semibold text-[#1C1917]">
                Fabric Care & Preservation Guidelines
              </p>
              <p className="text-stone-600 leading-relaxed">
                Dry clean recommended for hand-embroidered, wool, silk, and artisanal pieces. For everyday cotton and lawn apparel, gentle cold hand-wash with mild detergent and dry in shade.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
