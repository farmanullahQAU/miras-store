import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingBag, Star, Check } from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';

export default function ProductCard({ product }) {
  const {
    formatPrice,
    addToCart,
    isInWishlist,
    toggleWishlist,
    setQuickViewProduct,
  } = useStore();

  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const wished = isInWishlist(product.id);
  const colors = product.variants?.colors || [];
  const sizes = product.variants?.sizes || [];
  const activeColor = colors[selectedColorIdx]?.name || colors[0]?.name || 'Standard';
  const activeSize = sizes[selectedSizeIdx] || sizes[0] || 'Standard';

  const hasDiscount =
    product.originalPrice && Number(product.originalPrice) > Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round(
        ((Number(product.originalPrice) - Number(product.price)) /
          Number(product.originalPrice)) *
          100
      )
    : 0;

  const isOutOfStock = product.stock <= 0 || product.stockStatus === 'out_of_stock';
  const primaryImage = product.images?.[0] || '';
  const secondaryImage = product.images?.[1] || primaryImage;

  const revList = Array.isArray(product.reviews) ? product.reviews : [];
  const revCount = revList.length;
  const avgRating =
    revCount > 0
      ? revList.reduce((s, r) => s + Number(r.rating || 5), 0) / revCount
      : 0;

  const culturalOrigin =
    product.culturalOrigin || product.origin || product.specifications?.Origin || '';
  const shortOrigin = culturalOrigin ? culturalOrigin.split('(')[0].trim() : '';

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    const added = addToCart(product, {
      quantity: 1,
      selectedColor: activeColor,
      selectedSize: activeSize,
    });
    if (added) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1400);
    }
  };

  return (
    <article
      className="group flex flex-col justify-between transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image & Badges Container */}
      <div className="relative aspect-3/4 bg-[#F3EDE2] rounded-xl overflow-hidden border border-stone-200/70">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={isHovered && secondaryImage ? secondaryImage : primaryImage}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Single Clean Top-Left Badge */}
        <div className="absolute top-3 left-3 pointer-events-none">
          {isOutOfStock ? (
            <span className="px-2.5 py-1 rounded bg-stone-900/90 text-white text-[10px] font-semibold uppercase tracking-widest">
              Sold Out
            </span>
          ) : hasDiscount ? (
            <span className="px-2.5 py-1 rounded bg-[#6B2737] text-white text-[10px] font-semibold tracking-widest uppercase">
              -{discountPercent}%
            </span>
          ) : product.isNew ? (
            <span className="px-2.5 py-1 rounded bg-white/95 text-[#1C1917] text-[10px] font-semibold tracking-widest uppercase shadow-2xs">
              New
            </span>
          ) : null}
        </div>

        {/* Top-Right Wishlist & Quick View Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-xs transition-colors cursor-pointer ${
              wished
                ? 'bg-[#6B2737] text-white'
                : 'bg-white/90 text-[#1C1917] hover:bg-[#1C1917] hover:text-white'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${wished ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            aria-label={`Quick view ${product.name}`}
            className="w-8 h-8 rounded-full bg-white/90 text-[#1C1917] hover:bg-[#1C1917] hover:text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Clean Quick Add Bar */}
        {!isOutOfStock && (
          <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 space-y-1.5">
            {sizes.length > 1 && (
              <div className="hidden sm:flex items-center justify-center gap-1 bg-white/95 backdrop-blur-xs p-1 rounded-lg shadow-xs">
                {sizes.slice(0, 5).map((sz, idx) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedSizeIdx(idx);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase transition-colors cursor-pointer ${
                      selectedSizeIdx === idx
                        ? 'bg-[#1C1917] text-white'
                        : 'text-stone-700 hover:bg-stone-200/70'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleQuickAdd}
              className={`w-full py-2.5 px-3 rounded-lg text-[11px] font-semibold uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer ${
                justAdded
                  ? 'bg-[#4A5D4E] text-white'
                  : 'bg-[#1C1917]/95 hover:bg-[#B85338] text-white'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Bag</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Minimal Editorial Product Details */}
      <div className="pt-3 px-0.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.14em] text-stone-500 mb-1">
            <span className="truncate font-medium">
              {shortOrigin || product.category}
            </span>
            {revCount > 0 && (
              <span className="inline-flex items-center gap-0.5 text-stone-700 font-semibold shrink-0">
                <Star className="w-3 h-3 fill-[#C59B5F] text-[#C59B5F]" />
                <span>{avgRating.toFixed(1)}</span>
                <span className="text-stone-400">({revCount})</span>
              </span>
            )}
          </div>

          <Link
            to={`/product/${product.slug}`}
            className="text-sm font-medium text-[#1C1917] hover:text-[#B85338] transition-colors line-clamp-1"
          >
            {product.name}
          </Link>
        </div>

        {/* Price & Optional Color Swatches */}
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-[#1C1917]">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-stone-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {colors.length > 1 && (
            <div className="flex items-center gap-1" aria-label="Available color variants">
              {colors.slice(0, 4).map((color, idx) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setSelectedColorIdx(idx)}
                  title={color.name}
                  aria-label={`Select color ${color.name}`}
                  className={`w-3.5 h-3.5 rounded-full border transition-transform cursor-pointer ${
                    selectedColorIdx === idx
                      ? 'ring-1 ring-[#1C1917] ring-offset-1 scale-110'
                      : 'border-stone-300'
                  }`}
                  style={{ backgroundColor: color.hex || '#D6CBB9' }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
