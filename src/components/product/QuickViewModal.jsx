import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Star, Heart, ShoppingBag, ArrowRight, CheckCircle2, Plus, Minus } from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';

export default function QuickViewModal() {
  const {
    quickViewProduct,
    setQuickViewProduct,
    formatPrice,
    addToCart,
    isInWishlist,
    toggleWishlist,
  } = useStore();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (quickViewProduct) {
      setActiveImageIdx(0);
      setSelectedColor(quickViewProduct.variants?.colors?.[0]?.name || 'Standard');
      setSelectedSize(quickViewProduct.variants?.sizes?.[0] || 'Standard');
      setQuantity(1);
    }
  }, [quickViewProduct]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && quickViewProduct) {
        setQuickViewProduct(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [quickViewProduct, setQuickViewProduct]);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const wished = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0 || product.stockStatus === 'out_of_stock';

  const handleAdd = () => {
    const ok = addToCart(product, {
      quantity,
      selectedColor,
      selectedSize,
      openDrawer: true,
    });
    if (ok) {
      setQuickViewProduct(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view: ${product.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        onClick={() => setQuickViewProduct(null)}
      />

      <div className="relative z-10 w-full max-w-4xl bg-[#FAF7F2] rounded-lg shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={() => setQuickViewProduct(null)}
          aria-label="Close quick view"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 text-[#1C1917] hover:bg-[#1C1917] hover:text-white flex items-center justify-center shadow-sm cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left: Gallery */}
          <div className="md:col-span-6 bg-[#F3EDE2] p-5 flex flex-col gap-3">
            <div className="aspect-4/5 rounded-md overflow-hidden bg-white border border-stone-200">
              <img
                src={product.images?.[activeImageIdx] || product.images?.[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {product.images?.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {product.images.map((imgUrl, idx) => (
                  <button
                    key={imgUrl}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-16 h-16 rounded overflow-hidden border-2 shrink-0 cursor-pointer ${
                      activeImageIdx === idx ? 'border-[#B85338]' : 'border-transparent opacity-70'
                    }`}
                  >
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Summary & Variant Controls */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between bg-white">
            <div>
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span className="uppercase tracking-widest font-semibold text-[#B85338]">
                  {product.category}
                </span>
                <span>SKU: {product.sku}</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C1917] leading-tight">
                {product.name}
              </h2>

              <div className="flex flex-wrap items-center gap-3 mt-2.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-semibold text-[#1C1917]">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-stone-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>

                {(() => {
                  const revList = Array.isArray(product.reviews) ? product.reviews : [];
                  const revCount = revList.length;
                  const avgRating =
                    revCount > 0
                      ? revList.reduce((s, r) => s + Number(r.rating || 5), 0) / revCount
                      : Number(product.rating || 5.0);
                  const views = Math.max(1, Number(product.viewCount || 1));
                  return (
                    <div className="flex items-center gap-2 text-xs text-stone-600 border-l border-stone-200 pl-3">
                      <Star className="w-3.5 h-3.5 fill-[#C59B5F] text-[#C59B5F]" />
                      <span className="font-semibold text-[#1C1917]">{avgRating.toFixed(1)}</span>
                      <span>
                        ({revCount} {revCount === 1 ? 'review' : 'reviews'})
                      </span>
                      <span className="text-stone-300">·</span>
                      <span>{views} views</span>
                    </div>
                  );
                })()}
              </div>

              <p className="text-xs sm:text-sm text-stone-600 mt-4 leading-relaxed">
                {product.shortDescription}
              </p>

              {/* Color Selection */}
              {product.variants?.colors?.length > 0 && (
                <div className="mt-5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                    Color / Finish: <span className="font-normal text-stone-500">{selectedColor}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.colors.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c.name)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-medium cursor-pointer transition-all ${
                          selectedColor === c.name
                            ? 'border-[#B85338] bg-[#B85338]/5 text-[#1C1917]'
                            : 'border-stone-200 text-stone-600 hover:border-stone-300'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-stone-300"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.variants?.sizes?.length > 0 && (
                <div className="mt-4">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                    Size / Edition: <span className="font-normal text-stone-500">{selectedSize}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.sizes.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`px-3 py-1.5 rounded border text-xs font-medium cursor-pointer transition-all ${
                          selectedSize === sz
                            ? 'border-[#1C1917] bg-[#1C1917] text-white'
                            : 'border-stone-200 text-stone-700 hover:border-stone-400'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Status */}
              <div className="mt-4 flex items-center gap-2 text-xs">
                <CheckCircle2
                  className={`w-4 h-4 ${isOutOfStock ? 'text-red-600' : 'text-[#4A5D4E]'}`}
                />
                <span className="text-stone-600">
                  {isOutOfStock
                    ? 'Currently Out of Stock'
                    : `In Stock (${product.stock} available for immediate dispatch)`}
                </span>
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="mt-6 pt-5 border-t border-stone-200 space-y-3">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center border border-stone-300 rounded bg-[#FAF7F2]">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="p-2.5 text-stone-600 hover:text-[#1C1917] cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-sm font-semibold text-[#1C1917]">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock || 10, q + 1))}
                    aria-label="Increase quantity"
                    className="p-2.5 text-stone-600 hover:text-[#1C1917] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={isOutOfStock}
                  className="flex-1 py-3 px-5 bg-[#B85338] hover:bg-[#983F27] disabled:bg-stone-300 text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOutOfStock ? 'Sold Out' : 'Add to Shopping Bag'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  aria-label="Toggle wishlist"
                  className={`p-3 rounded border transition-colors cursor-pointer ${
                    wished
                      ? 'border-[#6B2737] bg-[#6B2737] text-white'
                      : 'border-stone-300 text-[#1C1917] hover:border-[#1C1917]'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${wished ? 'fill-current' : ''}`} />
                </button>
              </div>

              <Link
                to={`/product/${product.slug}`}
                onClick={() => setQuickViewProduct(null)}
                className="w-full py-2 text-center text-xs font-semibold text-[#1C1917] hover:text-[#B85338] inline-flex items-center justify-center gap-1.5"
              >
                <span>View Full Product Details & Specifications</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
