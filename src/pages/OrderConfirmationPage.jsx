import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  MapPin,
  CreditCard,
  ArrowRight,
  ShoppingBag,
  MessageCircle,
  Printer,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import SEOHead from '../components/common/SEOHead';

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const { orders, formatPrice, settings } = useStore();

  const order =
    location.state?.order ||
    orders.find((o) => o.id === orderId) ||
    orders[0];

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <SEOHead title="Order Confirmed" />
        <h1 className="font-serif text-3xl font-semibold text-[#1C1A17] mb-3">
          Order Received
        </h1>
        <p className="text-sm text-[#5C564F] mb-6">
          Reference ID: <span className="font-mono font-semibold">{orderId}</span>
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1C1A17] text-white text-xs font-semibold uppercase tracking-widest rounded-xl"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const totalAmount = order.total ?? order.totals?.total ?? 0;
  const cleanStorePhone = (
    settings.whatsappNumber ||
    settings.contactPhone ||
    '923001234567'
  ).replace(/[^0-9]/g, '');

  const customerName = `${order.customer?.firstName || ''} ${
    order.customer?.lastName || ''
  }`.trim();
  const city = order.shippingAddress?.city || 'Pakistan';
  const whatsappText = encodeURIComponent(
    `Hello ${settings.brandName || 'MIRAS'}! I have placed Order #${
      order.id
    } (${formatPrice(totalAmount)}) for delivery to ${city}. Customer Name: ${customerName}. Please confirm my order for dispatch.`
  );
  const whatsappUrl = `https://wa.me/${cleanStorePhone}?text=${whatsappText}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <SEOHead title={`Order Confirmed #${order.id}`} />

      <div className="bg-white rounded-2xl border border-[#E6DFD3] p-6 sm:p-10 shadow-sm space-y-8">
        <div className="text-center space-y-3 border-b border-[#E6DFD3] pb-8">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Thank You For Your Order
          </span>
          <h1 className="font-serif text-3xl font-semibold text-[#1C1A17]">
            Order #{order.id} Confirmed
          </h1>
          <p className="text-sm text-[#5C564F] max-w-md mx-auto">
            We have received your order and our fulfillment team is preparing your items for dispatch.
          </p>

          {/* Fast WhatsApp Order Confirmation CTA */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold uppercase tracking-widest transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              Confirm Order on WhatsApp for Priority Dispatch
            </a>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl border border-[#E6DFD3] hover:border-[#1C1A17] text-xs font-semibold text-[#1C1A17] cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </button>
          </div>
        </div>

        {/* Customer & Shipping Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E6DFD3] space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-[#1C1A17] mb-1">
              <MapPin className="w-4 h-4 text-[#9E4733]" />
              Delivery Address
            </div>
            <p className="font-semibold text-[#1C1A17]">{customerName}</p>
            <p className="text-[#5C564F]">{order.shippingAddress?.addressLine1}</p>
            <p className="text-[#5C564F]">
              {order.shippingAddress?.city}
              {order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ''}{' '}
              {order.shippingAddress?.postalCode || ''}
            </p>
            <p className="text-[#5C564F]">Phone: {order.customer?.phone}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E6DFD3] space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-[#1C1A17] mb-1">
              <CreditCard className="w-4 h-4 text-[#9E4733]" />
              Payment & Status
            </div>
            <p className="text-[#5C564F]">
              Method:{' '}
              <strong className="text-[#1C1A17] uppercase">
                {order.paymentMethod === 'cod'
                  ? 'Cash on Delivery (COD)'
                  : 'EasyPaisa / JazzCash / Bank Transfer'}
              </strong>
            </p>
            {order.paymentReference && (
              <p className="text-[#5C564F]">
                TRX Reference: <strong className="text-[#1C1A17]">{order.paymentReference}</strong>
              </p>
            )}
            <p className="text-[#5C564F]">
              Order Status:{' '}
              <strong className="text-emerald-700">
                {order.orderStatus || order.status || 'Confirmed'}
              </strong>
            </p>
            <p className="text-[#5C564F]">
              Support WhatsApp: <strong className="text-[#1C1A17]">{settings.contactPhone}</strong>
            </p>
          </div>
        </div>

        {/* Ordered Items */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5C564F] flex items-center gap-2">
            <Package className="w-4 h-4 text-[#9E4733]" />
            Items Ordered
          </h3>
          <div className="divide-y divide-[#E6DFD3] border border-[#E6DFD3] rounded-xl overflow-hidden">
            {(order.items || []).map((item, idx) => (
              <div key={idx} className="p-3.5 flex items-center justify-between gap-4 bg-white">
                <div className="flex items-center gap-3">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-14 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <p className="text-xs font-semibold text-[#1C1A17]">{item.name}</p>
                    <p className="text-[11px] text-[#5C564F]">
                      {[item.selectedColor, item.selectedSize].filter(Boolean).join(' / ')} ×{' '}
                      {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#1C1A17]">
                  {formatPrice(item.lineTotal || item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="bg-[#FBF9F5] p-5 rounded-xl border border-[#E6DFD3] space-y-2 text-sm">
          <div className="flex justify-between text-xs text-[#5C564F]">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal ?? order.totals?.subtotal ?? 0)}</span>
          </div>
          {(order.discountAmount ?? order.totals?.discountAmount ?? 0) > 0 && (
            <div className="flex justify-between text-xs text-emerald-700">
              <span>Promo Discount</span>
              <span>-{formatPrice(order.discountAmount ?? order.totals?.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-xs text-[#5C564F]">
            <span>Shipping</span>
            <span>
              {(order.shippingCost ?? order.totals?.shippingCost ?? 0) === 0
                ? 'FREE'
                : formatPrice(order.shippingCost ?? order.totals?.shippingCost ?? 0)}
            </span>
          </div>
          <div className="flex justify-between font-bold text-base text-[#1C1A17] pt-2 border-t border-[#E6DFD3]">
            <span>Total</span>
            <span className="text-[#9E4733]">{formatPrice(totalAmount)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/track-order"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#1C1A17] text-xs font-semibold uppercase tracking-widest text-[#1C1A17] hover:bg-[#1C1A17] hover:text-white transition-colors"
          >
            Track Order Status
          </Link>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#9E4733] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#823624] transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
