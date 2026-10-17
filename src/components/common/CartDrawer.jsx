import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Truck } from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';

export default function CartDrawer() {
  const {
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    cart,
    products,
    addToCart,
    cartTotals,
    updateCartQuantity,
    removeFromCart,
    formatPrice,
  } = useStore();

  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && isCartDrawerOpen) {
        setIsCartDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCartDrawerOpen, setIsCartDrawerOpen]);

  if (!isCartDrawerOpen) return null;

  const progressPercentage = Math.min(
    100,
    Math.round(
      (cartTotals.discountedSubtotal / Math.max(1, cartTotals.freeShippingThreshold)) * 100
    )
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping bag drawer"
      className="fixed inset-0 z-50 flex justify-end"
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="relative z-10 w-full max-w-md bg-[#FAF7F2] h-full shadow-2xl flex flex-col justify-between border-l border-stone-200">
        {/* Drawer Header */}
        <div className="p-5 bg-white border-b border-stone-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#B85338]" />
              <h2 className="font-serif text-xl font-semibold text-[#1C1917]">
                Your Shopping Bag ({cartTotals.itemCount})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsCartDrawerOpen(false)}
              aria-label="Close shopping bag"
              className="p-2 text-stone-400 hover:text-[#1C1917] rounded-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          {cart.length > 0 && (
            <div className="mt-4 pt-3 border-t border-stone-100">
              <div className="flex items-center gap-2 text-xs text-stone-700 mb-1.5">
                <Truck className="w-4 h-4 text-[#4A5D4E] shrink-0" />
                {cartTotals.qualifiesForFreeShipping ? (
                  <span className="font-medium text-[#4A5D4E]">
                    You have unlocked Complimentary Standard Shipping!
                  </span>
                ) : (
                  <span>
                    Add{' '}
                    <strong className="text-[#1C1917]">
                      {formatPrice(cartTotals.amountUntilFreeShipping)}
                    </strong>{' '}
                    more for complimentary shipping.
                  </span>
                )}
              </div>
              <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#4A5D4E] transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-stone-200/70 flex items-center justify-center text-stone-500 mb-4">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#1C1917]">
                Your Shopping Bag is Empty
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mt-1.5 mb-6 leading-relaxed">
                Explore our curated collection of hand-loomed textiles, artisanal home décor, and heritage gifts.
              </p>
              <Link
                to="/shop"
                onClick={() => setIsCartDrawerOpen(false)}
                className="px-6 py-3 bg-[#1C1917] text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#B85338] transition-colors"
              >
                Explore the Collection
              </Link>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.cartItemKey}
                className="flex gap-4 bg-white p-3.5 rounded-lg border border-stone-200/90 shadow-2xs"
              >
                <Link
                  to={`/product/${item.slug}`}
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="shrink-0"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-24 rounded object-cover bg-stone-100 border border-stone-200"
                  />
                </Link>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/product/${item.slug}`}
                        onClick={() => setIsCartDrawerOpen(false)}
                        className="text-sm font-medium text-[#1C1917] hover:text-[#B85338] line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.cartItemKey)}
                        aria-label={`Remove ${item.name}`}
                        className="text-stone-400 hover:text-red-600 p-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {item.selectedColor} · {item.selectedSize}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="inline-flex items-center border border-stone-300 rounded bg-[#FAF7F2]">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.cartItemKey, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="p-1.5 text-stone-600 hover:text-[#1C1917] cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 text-xs font-semibold text-[#1C1917]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.cartItemKey, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="p-1.5 text-stone-600 hover:text-[#1C1917] cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-sm font-semibold text-[#1C1917]">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* One-Click Recommended Upsell to Unlock Free Shipping */}
          {cart.length > 0 &&
            !cartTotals.qualifiesForFreeShipping &&
            (() => {
              const inCartIds = new Set(cart.map((c) => c.id));
              const candidates = (products || []).filter(
                (p) => !inCartIds.has(p.id) && Number(p.stock) > 0
              );
              const bestMatch =
                candidates
                  .sort((a, b) => Number(a.price) - Number(b.price))
                  .find((p) => Number(p.price) >= cartTotals.amountUntilFreeShipping) ||
                candidates[0];

              if (!bestMatch) return null;

              return (
                <div className="mt-4 pt-4 border-t border-stone-200/80">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#9E4733] mb-2">
                    Complete Your Order · Unlock Free Delivery
                  </p>
                  <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-[#E6DFD3] shadow-2xs">
                    <Link
                      to={`/product/${bestMatch.slug}`}
                      onClick={() => setIsCartDrawerOpen(false)}
                      className="shrink-0"
                    >
                      <img
                        src={bestMatch.images?.[0]}
                        alt={bestMatch.name}
                        className="w-12 h-14 rounded object-cover bg-stone-100 border border-stone-200"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${bestMatch.slug}`}
                        onClick={() => setIsCartDrawerOpen(false)}
                        className="text-xs font-semibold text-[#1C1917] hover:text-[#B85338] line-clamp-1 block"
                      >
                        {bestMatch.name}
                      </Link>
                      <span className="text-xs font-medium text-stone-600">
                        {formatPrice(bestMatch.price)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        addToCart(
                          bestMatch,
                          1,
                          bestMatch.colors?.[0]?.name || 'Standard',
                          bestMatch.sizes?.[0] || 'One Size'
                        )
                      }
                      className="px-3 py-1.5 rounded bg-[#1C1917] text-white text-[11px] font-semibold hover:bg-[#B85338] transition-colors shrink-0 cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              );
            })()}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div className="p-5 bg-white border-t border-stone-200 space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-stone-600 text-xs">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotals.subtotal)}</span>
              </div>
              {cartTotals.discountAmount > 0 && (
                <div className="flex justify-between text-[#4A5D4E] text-xs font-medium">
                  <span>Promotional Discount</span>
                  <span>-{formatPrice(cartTotals.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-serif font-semibold text-[#1C1917] pt-1 border-t border-stone-100">
                <span>Estimated Total</span>
                <span>{formatPrice(cartTotals.discountedSubtotal)}</span>
              </div>
              <p className="text-[11px] text-stone-500">
                Shipping and applicable taxes calculated at checkout.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/cart"
                onClick={() => setIsCartDrawerOpen(false)}
                className="py-3 px-4 border border-[#1C1917] text-[#1C1917] text-center text-xs font-semibold uppercase tracking-wider rounded hover:bg-stone-100 transition-colors"
              >
                View Full Bag
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  navigate('/checkout');
                }}
                className="py-3 px-4 bg-[#B85338] text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#983F27] transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
