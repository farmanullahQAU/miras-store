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
  const isLowStock = !isOutOfStock && product.stock <= 6;

  const primaryImage = product.images?.[0] || '';
  const secondaryImage = product.images?.[1] || primaryImage;

  const handleQuickAdd = (e, explicitSize = null) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    const chosenSize = explicitSize || activeSize;
    const added = addToCart(product, {
      quantity: 1,
      selectedColor: activeColor,
      selectedSize: chosenSize,
    });
    if (added) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1400);
    }
  };

  return (
    <article
      className="group bg-white rounded-lg border border-stone-200/90 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-stone-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image & Badges Container */}
      <div className="relative aspect-4/5 bg-[#F3EDE2] overflow-hidden">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={isHovered && secondaryImage ? secondaryImage : primaryImage}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Top-Left Status Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {hasDiscount && (
            <span className="px-2.5 py-1 rounded bg-[#6B2737] text-white text-[11px] font-semibold tracking-wider uppercase shadow-xs">
              -{discountPercent}% Off
            </span>
          )}
          {product.isNew && !hasDiscount && (
            <span className="px-2.5 py-1 rounded bg-[#1C1917] text-[#FAF7F2] text-[11px] font-semibold tracking-wider uppercase shadow-xs">
              New Release
            </span>
          )}
          {isLowStock && (
            <span className="px-2.5 py-0.5 rounded bg-amber-900/90 text-amber-100 text-[10px] font-medium tracking-wide">
              Only {product.stock} left
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2.5 py-1 rounded bg-stone-800 text-stone-200 text-[11px] font-semibold uppercase tracking-wider">
              Out of Stock
            </span>
          )}
        </div>

        {/* Top-Right Wishlist & Quick View Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-all cursor-pointer ${
              wished
                ? 'bg-[#6B2737] text-white'
                : 'bg-white/90 text-[#1C1917] hover:bg-[#1C1917] hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${wished ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            aria-label={`Quick view ${product.name}`}
            className="w-9 h-9 rounded-full bg-white/90 text-[#1C1917] hover:bg-[#1C1917] hover:text-white flex items-center justify-center shadow-sm transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Add-to-Cart Overlay Bar with Khaadi/Diners Size Selector */}
        <div className="absolute inset-x-3 bottom-3 opacity-100 sm:opacity-0 sm:translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 space-y-1.5">
          {!isOutOfStock && sizes.length > 1 && (
            <div className="hidden sm:flex items-center justify-center gap-1 bg-white/95 backdrop-blur-xs p-1.5 rounded shadow-sm">
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
            onClick={(e) => handleQuickAdd(e)}
            disabled={isOutOfStock}
            className={`w-full py-2.5 px-3 rounded text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer ${
              isOutOfStock
                ? 'bg-stone-300 text-stone-600 cursor-not-allowed'
                : justAdded
                ? 'bg-[#4A5D4E] text-white'
                : 'bg-[#1C1917]/95 hover:bg-[#B85338] text-white'
            }`}
          >
            {isOutOfStock ? (
              <span>Sold Out</span>
            ) : justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added ({activeSize})</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Bag {sizes.length > 1 ? `· ${activeSize}` : ''}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Details Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 text-[11px] text-stone-500 mb-1">
            <span className="truncate uppercase tracking-wider font-medium">
              {product.category}
            </span>
            {product.rating > 0 && (
              <span className="inline-flex items-center gap-1 text-stone-700 font-medium shrink-0">
                <Star className="w-3 h-3 fill-[#C59B5F] text-[#C59B5F]" />
                <span>{product.rating.toFixed(1)}</span>
                {product.reviewCount > 0 && (
                  <span className="text-stone-400">({product.reviewCount})</span>
                )}
              </span>
            )}
          </div>

          <Link
            to={`/product/${product.slug}`}
            className="font-serif text-lg font-semibold text-[#1C1917] hover:text-[#B85338] transition-colors line-clamp-2 leading-snug"
          >
            {product.name}
          </Link>

          {product.culturalOrigin && (
            <p className="text-[11px] text-stone-500 mt-1 truncate">
              {product.culturalOrigin}
            </p>
          )}
        </div>

        {/* Bottom Price & Color Variant Swatches */}
        <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-sm sm:text-base font-semibold text-[#1C1917]">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-stone-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Color Swatches */}
          {colors.length > 0 && (
            <div className="flex items-center gap-1.5" aria-label="Available color variants">
              {colors.slice(0, 4).map((color, idx) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setSelectedColorIdx(idx)}
                  title={color.name}
                  aria-label={`Select color ${color.name}`}
                  className={`w-4 h-4 rounded-full border transition-transform cursor-pointer ${
                    selectedColorIdx === idx
                      ? 'ring-2 ring-[#B85338] ring-offset-1 scale-110'
                      : 'border-stone-300 hover:scale-105'
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
