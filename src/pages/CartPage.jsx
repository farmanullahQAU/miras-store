import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  ArrowLeft,
  Truck,
  ShieldCheck,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import { verifyCartInventory } from '../utils/commerceEngine.js';
import SEOHead from '../components/common/SEOHead.jsx';

export default function CartPage() {
  const {
    cart,
    products,
    coupons,
    brandConfig,
    cartTotals,
    updateCartQuantity,
    updateCartVariant,
    removeFromCart,
    clearCart,
    appliedCouponCode,
    applyCoupon,
    removeCoupon,
    selectedShippingMethodId,
    setSelectedShippingMethodId,
    formatPrice,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const navigate = useNavigate();

  const inventoryStatus = verifyCartInventory(cart, products);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput.trim());
    if (res.valid) {
      setCouponInput('');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <SEOHead title="Shopping Bag" canonicalPath="/cart" />
        <div className="bg-white rounded-xl border border-stone-200 p-12 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#F3EDE2] text-[#B85338] flex items-center justify-center mx-auto mb-5">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl font-semibold text-[#1C1917]">
            Your Shopping Bag is Empty
          </h1>
          <p className="text-sm text-stone-600 mt-2 mb-8 leading-relaxed">
            Discover hand-loomed textiles, kiln-fired ceramics, fine leather companions, and thoughtful gifts across our curated departments.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/shop"
              className="px-7 py-3.5 bg-[#1C1917] text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#B85338] transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              to="/wishlist"
              className="px-7 py-3.5 border border-stone-300 text-[#1C1917] text-xs font-semibold uppercase tracking-wider rounded hover:bg-stone-100 transition-colors"
            >
              View Saved Wishlist
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <SEOHead title={`Shopping Bag (${cartTotals.itemCount})`} canonicalPath="/cart" />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B85338]">
            Your Selection
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1C1917] mt-1">
            Shopping Bag ({cartTotals.itemCount} {cartTotals.itemCount === 1 ? 'Item' : 'Items'})
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-[#1C1917]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-medium text-stone-400 hover:text-red-600 cursor-pointer"
          >
            Clear Bag
          </button>
        </div>
      </div>

      {/* Inventory Issue Alert */}
      {!inventoryStatus.valid && (
        <div
          role="alert"
          className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 text-xs"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Inventory Adjustment Required Before Checkout:</p>
            <ul className="list-disc pl-4 mt-1 space-y-0.5">
              {inventoryStatus.issues.map((iss) => (
                <li key={iss.itemId}>
                  <strong>{iss.name}:</strong> {iss.reason}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-8">
        {/* Left: Cart Items Table / Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free Shipping Banner */}
          <div className="bg-[#F3EDE2] p-4 rounded-lg border border-stone-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              <Truck className="w-5 h-5 text-[#4A5D4E] shrink-0" />
              {cartTotals.qualifiesForFreeShipping ? (
                <span className="font-medium text-[#4A5D4E]">
                  Your order qualifies for Complimentary Standard Tracked Shipping!
                </span>
              ) : (
                <span>
                  Add{' '}
                  <strong className="text-[#1C1917]">
                    {formatPrice(cartTotals.amountUntilFreeShipping)}
                  </strong>{' '}
                  more to unlock complimentary standard shipping.
                </span>
              )}
            </div>
          </div>

          {/* Item Cards */}
          {cart.map((item) => (
            <div
              key={item.cartItemKey}
              className="bg-white rounded-lg border border-stone-200 p-4 sm:p-5 flex flex-col sm:flex-row gap-5"
            >
              <Link to={`/product/${item.slug}`} className="shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-28 sm:w-28 sm:h-32 rounded object-cover bg-stone-100 border border-stone-200"
                />
              </Link>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-stone-500">
                        {item.category} · SKU: {item.sku}
                      </p>
                      <Link
                        to={`/product/${item.slug}`}
                        className="font-serif text-xl font-semibold text-[#1C1917] hover:text-[#B85338] transition-colors"
                      >
                        {item.name}
                      </Link>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.cartItemKey)}
                      aria-label={`Remove ${item.name}`}
                      className="text-stone-400 hover:text-red-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Variant Selectors */}
                  <div className="flex flex-wrap gap-3 mt-3 text-xs">
                    {item.availableColors?.length > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-stone-500">Color:</span>
                        <select
                          value={item.selectedColor}
                          onChange={(e) =>
                            updateCartVariant(item.cartItemKey, { selectedColor: e.target.value })
                          }
                          aria-label="Change item color"
                          className="bg-[#FAF7F2] border border-stone-300 rounded px-2 py-1 text-xs font-medium text-[#1C1917]"
                        >
                          {item.availableColors.map((c) => (
                            <option key={c.name} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <span className="text-stone-500">Color: {item.selectedColor}</span>
                    )}

                    {item.availableSizes?.length > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-stone-500">Size:</span>
                        <select
                          value={item.selectedSize}
                          onChange={(e) =>
                            updateCartVariant(item.cartItemKey, { selectedSize: e.target.value })
                          }
                          aria-label="Change item size"
                          className="bg-[#FAF7F2] border border-stone-300 rounded px-2 py-1 text-xs font-medium text-[#1C1917]"
                        >
                          {item.availableSizes.map((sz) => (
                            <option key={sz} value={sz}>
                              {sz}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <span className="text-stone-500">Size: {item.selectedSize}</span>
                    )}
                  </div>
                </div>

                {/* Quantity & Subtotal */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-stone-100">
                  <div className="inline-flex items-center border border-stone-300 rounded bg-[#FAF7F2]">
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.cartItemKey, item.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="p-2 text-stone-600 hover:text-[#1C1917] cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3.5 text-xs font-semibold text-[#1C1917]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.cartItemKey, item.quantity + 1)}
                      aria-label="Increase quantity"
                      className="p-2 text-stone-600 hover:text-[#1C1917] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-base font-semibold text-[#1C1917]">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-[11px] text-stone-500">
                        {formatPrice(item.price)} each
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Order Summary, Coupon & Shipping Calculator (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl border border-stone-200 p-6 sticky top-28 space-y-6">
            <h2 className="font-serif text-2xl font-semibold text-[#1C1917] pb-3 border-b border-stone-200">
              Order Summary
            </h2>

            {/* Promo Code Input */}
            <div>
              <label
                htmlFor="cart-coupon-input"
                className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2"
              >
                Promotional Code
              </label>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="cart-coupon-input"
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="e.g., WELCOME10"
                    className="w-full bg-[#FAF7F2] border border-stone-300 rounded pl-8 pr-3 py-2 text-xs font-medium uppercase text-[#1C1917] focus:outline-none focus:border-[#B85338]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1C1917] hover:bg-[#B85338] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </form>

              {/* Active Coupon Pill */}
              {appliedCouponCode && cartTotals.couponResult?.valid && (
                <div className="mt-2.5 flex items-center justify-between px-3 py-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                  <div>
                    <span className="font-semibold">{appliedCouponCode}</span>:{' '}
                    <span>{cartTotals.couponResult.message}</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    aria-label="Remove coupon"
                    className="text-emerald-700 hover:text-red-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Available Demo Promo Codes */}
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {coupons
                  .filter((c) => c.active)
                  .map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => applyCoupon(c.code)}
                      className="text-[10px] px-2 py-0.5 rounded bg-[#F3EDE2] hover:bg-[#B85338] hover:text-white text-stone-700 font-medium transition-colors cursor-pointer"
                      title={c.description}
                    >
                      Try {c.code}
                    </button>
                  ))}
              </div>
            </div>

            {/* Shipping Method Estimate */}
            <div className="pt-4 border-t border-stone-200">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                Delivery Method
              </label>
              <div className="space-y-2">
                {brandConfig.shipping.methods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center justify-between p-2.5 rounded border text-xs cursor-pointer transition-colors ${
                      selectedShippingMethodId === method.id
                        ? 'border-[#B85338] bg-[#B85338]/5'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="cartShippingMethod"
                        checked={selectedShippingMethodId === method.id}
                        onChange={() => setSelectedShippingMethodId(method.id)}
                        className="text-[#B85338]"
                      />
                      <span className="font-medium text-[#1C1917]">{method.name}</span>
                    </div>
                    <span className="font-semibold text-[#1C1917]">
                      {method.freeAboveThreshold && cartTotals.qualifiesForFreeShipping
                        ? 'FREE'
                        : formatPrice(method.price)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="pt-4 border-t border-stone-200 space-y-2.5 text-sm">
              <div className="flex justify-between text-stone-600 text-xs">
                <span>Subtotal ({cartTotals.itemCount} items)</span>
                <span>{formatPrice(cartTotals.subtotal)}</span>
              </div>
              {cartTotals.discountAmount > 0 && (
                <div className="flex justify-between text-[#4A5D4E] text-xs font-medium">
                  <span>Discount ({appliedCouponCode})</span>
                  <span>-{formatPrice(cartTotals.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600 text-xs">
                <span>Shipping ({cartTotals.selectedShippingMethod?.name})</span>
                <span>
                  {cartTotals.shippingCost === 0
                    ? 'Complimentary'
                    : formatPrice(cartTotals.shippingCost)}
                </span>
              </div>
              {brandConfig.tax.enabled && (
                <div className="flex justify-between text-stone-600 text-xs">
                  <span>{brandConfig.tax.label}</span>
                  <span>{formatPrice(cartTotals.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-serif font-semibold text-[#1C1917] pt-3 border-t border-stone-200">
                <span>Order Total</span>
                <span>{formatPrice(cartTotals.total)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              disabled={!inventoryStatus.valid}
              className="w-full py-4 px-6 bg-[#B85338] hover:bg-[#983F27] disabled:bg-stone-300 text-white text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-md transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-[#4A5D4E]" />
              <span>Transparent Checkout · COD, Bank Transfer & Verified Gateways</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
