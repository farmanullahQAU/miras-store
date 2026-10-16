import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  Banknote,
  Smartphone,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { validateCheckoutPayload } from '../utils/commerceEngine';
import SEOHead from '../components/common/SEOHead';

export default function CheckoutPage() {
  const {
    cart,
    user,
    settings,
    cartTotals,
    selectedShippingMethodId,
    setSelectedShippingMethodId,
    appliedCouponCode,
    applyCouponCode,
    removeCouponCode,
    formatPrice,
    placeOrder,
  } = useStore();

  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoInput, setPromoInput] = useState('');

  const defaultAddr = user?.savedAddresses?.find((a) => a.isDefault) || user?.savedAddresses?.[0];

  const [customer, setCustomer] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [shippingAddress, setShippingAddress] = useState({
    addressLine1: defaultAddr?.addressLine1 || '',
    addressLine2: defaultAddr?.addressLine2 || '',
    city: defaultAddr?.city || 'Lahore',
    state: defaultAddr?.state || 'Punjab',
    postalCode: defaultAddr?.postalCode || '54000',
    country: defaultAddr?.country || 'Pakistan',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [paymentReference, setPaymentReference] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <SEOHead title="Checkout" />
        <div className="bg-white p-10 rounded-2xl border border-[#E6DFD3]">
          <h1 className="font-serif text-3xl font-semibold text-[#1C1A17]">
            Your Shopping Bag is Empty
          </h1>
          <p className="text-sm text-[#5C564F] mt-2 mb-6">
            Add products to your shopping bag before proceeding to checkout.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1C1A17] text-white text-xs font-semibold uppercase tracking-widest rounded-xl hover:bg-[#9E4733]"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const validation = validateCheckoutPayload({
      customer,
      shippingAddress,
      billingSameAsShipping: true,
      paymentMethod,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (paymentMethod === 'wallet_transfer' && !paymentReference.trim()) {
      setErrors({ paymentReference: 'Please enter your EasyPaisa / JazzCash / Bank Transaction ID (TRX ID).' });
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const created = await placeOrder({
        customer,
        shippingAddress,
        billingSameAsShipping: true,
        shippingMethodId: selectedShippingMethodId,
        paymentMethod,
        paymentReference: paymentReference.trim(),
        orderNotes: orderNotes.trim(),
      });
      navigate(`/order-confirmation/${created.id}`, { state: { order: created } });
    } catch (err) {
      setSubmitError(err.message || 'Unable to place order. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <SEOHead title="Checkout" />

      <div className="mb-8">
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5C564F] hover:text-[#1C1A17] mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Shopping Bag
        </Link>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1C1A17]">
          Express Checkout
        </h1>
      </div>

      {submitError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Customer, Delivery & Payment */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Customer Contact */}
          <div className="bg-white p-6 rounded-2xl border border-[#E6DFD3] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-semibold text-[#1C1A17]">
                1. Contact Details
              </h2>
              {!user && (
                <Link to="/login" className="text-xs font-semibold text-[#9E4733] hover:underline">
                  Have an account? Sign In
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">First Name *</label>
                <input
                  type="text"
                  value={customer.firstName}
                  onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })}
                  placeholder="Ali"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm focus:outline-none focus:border-[#9E4733]"
                />
                {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Last Name *</label>
                <input
                  type="text"
                  value={customer.lastName}
                  onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })}
                  placeholder="Khan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm focus:outline-none focus:border-[#9E4733]"
                />
                {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Mobile / WhatsApp Number *</label>
                <input
                  type="tel"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  placeholder="0300 1234567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm focus:outline-none focus:border-[#9E4733]"
                />
                {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Email Address *</label>
                <input
                  type="email"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm focus:outline-none focus:border-[#9E4733]"
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* 2. Delivery Address */}
          <div className="bg-white p-6 rounded-2xl border border-[#E6DFD3] space-y-4">
            <h2 className="font-serif text-xl font-semibold text-[#1C1A17]">
              2. Shipping Address
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">House / Street / Sector Address *</label>
                <input
                  type="text"
                  value={shippingAddress.addressLine1}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                  placeholder="House 14, Street 5, DHA Phase 5"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm focus:outline-none focus:border-[#9E4733]"
                />
                {errors.addressLine1 && <p className="text-xs text-red-600 mt-1">{errors.addressLine1}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Landmark / Apartment (Optional)</label>
                <input
                  type="text"
                  value={shippingAddress.addressLine2}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })}
                  placeholder="Near Central Park"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm focus:outline-none focus:border-[#9E4733]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1A17] mb-1">City *</label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm focus:outline-none focus:border-[#9E4733]"
                  />
                  {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Province / State *</label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm focus:outline-none focus:border-[#9E4733]"
                  />
                  {errors.state && <p className="text-xs text-red-600 mt-1">{errors.state}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Postal Code *</label>
                  <input
                    type="text"
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm focus:outline-none focus:border-[#9E4733]"
                  />
                  {errors.postalCode && <p className="text-xs text-red-600 mt-1">{errors.postalCode}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Shipping Speed */}
          <div className="bg-white p-6 rounded-2xl border border-[#E6DFD3] space-y-4">
            <h2 className="font-serif text-xl font-semibold text-[#1C1A17]">
              3. Delivery Speed
            </h2>
            <div className="space-y-3">
              {(settings.shippingMethods || []).map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedShippingMethodId === method.id
                      ? 'border-[#1C1A17] bg-[#FBF9F5]'
                      : 'border-[#E6DFD3] hover:border-[#1C1A17]/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={selectedShippingMethodId === method.id}
                      onChange={() => setSelectedShippingMethodId(method.id)}
                      className="accent-[#9E4733]"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[#1C1A17]">{method.name}</p>
                      <p className="text-xs text-[#5C564F]">{method.eta} — {method.description}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-[#1C1A17]">
                    {cartTotals.qualifiesForFreeShipping && method.id === 'standard'
                      ? 'FREE'
                      : formatPrice(method.price)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 4. Payment Method */}
          <div className="bg-white p-6 rounded-2xl border border-[#E6DFD3] space-y-4">
            <h2 className="font-serif text-xl font-semibold text-[#1C1A17]">
              4. Payment Method
            </h2>

            <div className="space-y-3">
              {(settings.paymentMethods || []).map((pm) => {
                const isSelected = paymentMethod === pm.id;
                return (
                  <div
                    key={pm.id}
                    className={`rounded-xl border p-4 transition-all ${
                      isSelected ? 'border-[#1C1A17] bg-[#FBF9F5]' : 'border-[#E6DFD3]'
                    }`}
                  >
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={isSelected}
                        onChange={() => setPaymentMethod(pm.id)}
                        className="mt-1 accent-[#9E4733]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-[#1C1A17] flex items-center gap-2">
                            {pm.id === 'cod' ? <Banknote className="w-4 h-4 text-[#9E4733]" /> : <Smartphone className="w-4 h-4 text-[#9E4733]" />}
                            {pm.name}
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#EFECE6] text-[#1C1A17]">
                            {pm.badge}
                          </span>
                        </div>
                        <p className="text-xs text-[#5C564F] mt-1">{pm.description}</p>
                      </div>
                    </label>

                    {isSelected && pm.id === 'wallet_transfer' && (
                      <div className="mt-4 pt-3 border-t border-[#E6DFD3] space-y-3">
                        <p className="text-xs text-[#1C1A17] bg-white p-3 rounded-lg border border-[#E6DFD3]">
                          {pm.instructions}
                        </p>
                        <div>
                          <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                            Transaction Reference / TRX ID *
                          </label>
                          <input
                            type="text"
                            value={paymentReference}
                            onChange={(e) => setPaymentReference(e.target.value)}
                            placeholder="e.g. TRX-884920194"
                            className="w-full px-3.5 py-2 rounded-lg border border-[#E6DFD3] bg-white text-sm"
                          />
                          {errors.paymentReference && (
                            <p className="text-xs text-red-600 mt-1">{errors.paymentReference}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                Delivery Instructions / Order Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Call before delivery, gift wrap note, etc."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm focus:outline-none focus:border-[#9E4733]"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-2xl border border-[#E6DFD3] sticky top-24 space-y-6">
            <h2 className="font-serif text-xl font-semibold text-[#1C1A17]">
              Order Summary ({cartTotals.itemCount} items)
            </h2>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 divide-y divide-[#E6DFD3]">
              {cart.map((item) => (
                <div key={item.cartItemId || item.id} className="pt-3 first:pt-0 flex gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-16 rounded-lg object-cover bg-[#EFECE6] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1C1A17] truncate">{item.name}</p>
                    <p className="text-[11px] text-[#5C564F]">
                      {[item.selectedColor, item.selectedSize].filter(Boolean).join(' / ')} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#1C1A17]">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo Code */}
            <div className="pt-4 border-t border-[#E6DFD3]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Promo code (e.g. WELCOME10)"
                  className="flex-1 px-3 py-2 rounded-xl border border-[#E6DFD3] text-xs uppercase"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (promoInput.trim()) {
                      applyCouponCode(promoInput.trim());
                      setPromoInput('');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-[#1C1A17] text-white text-xs font-semibold hover:bg-[#9E4733]"
                >
                  Apply
                </button>
              </div>
              {appliedCouponCode && (
                <div className="mt-2 flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Tag className="w-3.5 h-3.5" /> Code {appliedCouponCode} applied
                  </span>
                  <button
                    type="button"
                    onClick={removeCouponCode}
                    className="text-xs underline hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2.5 pt-4 border-t border-[#E6DFD3] text-sm">
              <div className="flex justify-between text-[#5C564F]">
                <span>Subtotal</span>
                <span className="font-medium text-[#1C1A17]">{formatPrice(cartTotals.subtotal)}</span>
              </div>
              {cartTotals.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount ({cartTotals.coupon?.code})</span>
                  <span>-{formatPrice(cartTotals.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#5C564F]">
                <span>Delivery</span>
                <span className="font-medium text-[#1C1A17]">
                  {cartTotals.shippingCost === 0 ? 'FREE' : formatPrice(cartTotals.shippingCost)}
                </span>
              </div>
              {cartTotals.taxAmount > 0 && (
                <div className="flex justify-between text-[#5C564F]">
                  <span>Tax</span>
                  <span>{formatPrice(cartTotals.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-[#1C1A17] pt-3 border-t border-[#E6DFD3]">
                <span>Total Payable</span>
                <span className="text-[#9E4733]">{formatPrice(cartTotals.total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-[#9E4733] hover:bg-[#823624] text-white text-xs font-semibold uppercase tracking-widest transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Placing Your Order...' : `Complete Order • ${formatPrice(cartTotals.total)}`}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-[#5C564F]">
              <ShieldCheck className="w-4 h-4 text-[#2E6F40]" />
              <span>Instant order confirmation & tracking number</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
