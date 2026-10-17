import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  MapPin,
  Heart,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import SEOHead from '../components/common/SEOHead.jsx';
import GoogleSignInButton from '../components/common/GoogleSignInButton.jsx';

export default function AccountPage({ defaultTab = 'overview' }) {
  const {
    user,
    logout,
    updateProfile,
    saveAddress,
    deleteAddress,
    orders,
    wishlistProducts,
    formatPrice,
  } = useStore();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingQuery, setTrackingQuery] = useState('');
  const [trackedResult, setTrackedResult] = useState(null);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });

  // New Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: 'Home Residence',
    addressLine1: '',
    city: 'Lahore',
    state: 'Punjab',
    postalCode: '54000',
    country: 'Pakistan',
  });

  const { trackOrderPublic } = useStore();

  const handleTrackLookup = async (e) => {
    e.preventDefault();
    const q = trackingQuery.trim().toUpperCase();
    if (!q) return;

    try {
      const res = await trackOrderPublic(q);
      if (res?.order) {
        setTrackedResult(res.order);
        return;
      }
    } catch {
      // Fallback to local orders list
    }

    const found = orders.find(
      (o) =>
        o.id.toUpperCase() === q ||
        (o.trackingNumber && o.trackingNumber.toUpperCase() === q)
    );
    setTrackedResult(found || 'not_found');
  };

  // If guest visits /account/orders, allow Order Tracking Lookup directly or sign in
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
        <SEOHead title="Order Tracking & Client Portal" canonicalPath="/account" />

        {/* Live Order Tracking Lookup for Guests */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-10 space-y-5">
          <div className="flex items-center gap-2.5 text-[#B85338] text-xs font-semibold uppercase tracking-widest">
            <Truck className="w-4 h-4" />
            <span>Live Order Tracking</span>
          </div>
          <h1 className="font-serif text-3xl font-semibold text-[#1C1917]">
            Track Your Order Status
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-xl">
            Enter your Order Reference (e.g., <code className="font-mono font-semibold">ORD-2026-8491</code>) or Courier Tracking Number to inspect real-time dispatch stages.
          </p>

          <form onSubmit={handleTrackLookup} className="flex flex-col sm:flex-row gap-3 max-w-lg">
            <input
              type="text"
              value={trackingQuery}
              onChange={(e) => setTrackingQuery(e.target.value)}
              placeholder="e.g., ORD-2026-8491 or TCS-PK-99481023"
              className="flex-1 bg-[#FAF7F2] border border-stone-300 rounded px-4 py-3 text-sm"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#1C1917] hover:bg-[#B85338] text-white text-xs font-semibold uppercase tracking-wider rounded inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Track Order</span>
            </button>
          </form>

          {trackedResult === 'not_found' && (
            <p className="text-xs text-red-600 font-medium">
              No matching order found for &ldquo;{trackingQuery}&rdquo;. Try sample order <button type="button" onClick={() => setTrackingQuery('ORD-2026-8491')} className="underline font-mono cursor-pointer">ORD-2026-8491</button>.
            </p>
          )}

          {trackedResult && trackedResult !== 'not_found' && (
            <div className="p-5 rounded-lg bg-[#FAF7F2] border border-stone-200 space-y-4 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-200">
                <div>
                  <p className="font-semibold text-sm text-[#1C1917]">
                    Order {trackedResult.id} · {trackedResult.customer?.firstName}{' '}
                    {trackedResult.customer?.lastName}
                  </p>
                  <p className="text-stone-500">
                    Tracking: {trackedResult.trackingNumber} · Destination:{' '}
                    {trackedResult.shippingAddress?.city}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-semibold">
                  {trackedResult.orderStatus}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center pt-1">
                {['Confirmed', 'Processing', 'Shipped', 'Delivered'].map((stage, i) => {
                  const stages = ['Confirmed', 'Processing', 'Shipped', 'Delivered'];
                  const currentIdx = stages.indexOf(trackedResult.orderStatus);
                  const active = i <= (currentIdx === -1 ? 0 : currentIdx);
                  return (
                    <div
                      key={stage}
                      className={`p-2 rounded border ${
                        active
                          ? 'border-[#4A5D4E] bg-[#4A5D4E]/10 text-[#1C1917] font-semibold'
                          : 'border-stone-200 text-stone-400'
                      }`}
                    >
                      {stage}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sign-in Prompt */}
        <div className="bg-[#F3EDE2] rounded-xl border border-stone-200 p-8 text-center space-y-4">
          <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
            Sign In to Access Your Full Account Portal
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
            Manage saved shipping addresses, view complete order receipts, and synchronize your wishlist across devices.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              to="/login"
              className="px-6 py-3 bg-[#1C1917] text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#B85338]"
            >
              Sign In / Register
            </Link>
            <GoogleSignInButton
              label="Continue with Google"
              className="px-6 py-3 bg-white border border-stone-300 text-[#1C1917] text-xs font-semibold uppercase tracking-wider rounded hover:border-[#B85338] inline-flex items-center gap-2 cursor-pointer"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <SEOHead title="My Collector Account" canonicalPath="/account" />

      {/* Top Account Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#1C1917] text-[#C59B5F] font-serif text-2xl font-semibold flex items-center justify-center">
            {user.firstName?.[0]?.toUpperCase() || 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C1917]">
                {user.firstName} {user.lastName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold uppercase inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {user.emailVerified ? 'Verified Email' : 'Active Session'}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {user.email} · Role: <span className="uppercase font-medium">{user.role}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user.role === 'admin' && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded bg-[#6B2737] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#521C29]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Navigation (3 cols) */}
        <aside className="lg:col-span-3">
          <nav className="bg-white rounded-xl border border-stone-200 p-3 space-y-1 text-xs">
            {[
              { id: 'overview', label: 'Account Overview', icon: User },
              { id: 'orders', label: `Orders & Tracking (${orders.length})`, icon: Package },
              {
                id: 'addresses',
                label: `Saved Addresses (${user.savedAddresses?.length || 0})`,
                icon: MapPin,
              },
              {
                id: 'wishlist',
                label: `Saved Wishlist (${wishlistProducts.length})`,
                icon: Heart,
              },
              { id: 'settings', label: 'Profile & Security Settings', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-[#1C1917] text-white'
                      : 'text-stone-700 hover:bg-[#FAF7F2]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Panel (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-stone-200">
                  <p className="text-xs text-stone-500 uppercase tracking-wider">Total Orders</p>
                  <p className="font-serif text-3xl font-semibold text-[#1C1917] mt-1">
                    {orders.length}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-stone-200">
                  <p className="text-xs text-stone-500 uppercase tracking-wider">Saved Wishlist</p>
                  <p className="font-serif text-3xl font-semibold text-[#1C1917] mt-1">
                    {wishlistProducts.length} Pieces
                  </p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-stone-200">
                  <p className="text-xs text-stone-500 uppercase tracking-wider">Address Book</p>
                  <p className="font-serif text-3xl font-semibold text-[#1C1917] mt-1">
                    {user.savedAddresses?.length || 0} Saved
                  </p>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className="bg-white rounded-xl border border-stone-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
                    Recent Orders
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-[#B85338] hover:underline cursor-pointer"
                  >
                    View All Orders
                  </button>
                </div>

                <div className="space-y-3">
                  {orders.slice(0, 3).map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 rounded-lg bg-[#FAF7F2] border border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-[#1C1917] font-mono">{ord.id}</p>
                        <p className="text-stone-500 mt-0.5">
                          Placed on {new Date(ord.createdAt).toLocaleDateString()} ·{' '}
                          {ord.items?.length || 1} item(s)
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 font-semibold">
                          {ord.orderStatus}
                        </span>
                        <span className="font-semibold text-[#1C1917]">
                          {formatPrice(ord.total)}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrder(ord);
                            setActiveTab('orders');
                          }}
                          className="px-3 py-1.5 rounded bg-white border border-stone-300 hover:border-[#B85338] font-medium cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
                    Order History & Shipment Tracking
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Inspect itemized invoices, payment verification statuses, and courier tracking milestones.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="rounded-lg border border-stone-200 overflow-hidden"
                  >
                    <div className="p-4 bg-[#FAF7F2] border-b border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                      <div className="flex flex-wrap gap-6">
                        <div>
                          <span className="text-stone-500 block">Order Reference</span>
                          <strong className="font-mono text-[#1C1917]">{ord.id}</strong>
                        </div>
                        <div>
                          <span className="text-stone-500 block">Date Placed</span>
                          <strong className="text-[#1C1917]">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </strong>
                        </div>
                        <div>
                          <span className="text-stone-500 block">Total Amount</span>
                          <strong className="text-[#1C1917]">{formatPrice(ord.total)}</strong>
                        </div>
                        <div>
                          <span className="text-stone-500 block">Tracking Code</span>
                          <strong className="font-mono text-[#B85338]">{ord.trackingNumber}</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 font-semibold">
                          {ord.orderStatus}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedOrder(selectedOrder?.id === ord.id ? null : ord)
                          }
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-white border border-stone-300 text-[#1C1917] font-medium hover:border-[#B85338] cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{selectedOrder?.id === ord.id ? 'Hide' : 'Inspect'}</span>
                        </button>
                      </div>
                    </div>

                    {selectedOrder?.id === ord.id && (
                      <div className="p-5 bg-white space-y-4 text-xs">
                        {/* Visual Tracking Bar */}
                        <div className="grid grid-cols-4 gap-2 text-center">
                          {['Confirmed', 'Processing', 'Shipped', 'Delivered'].map((stage, i) => {
                            const stages = ['Confirmed', 'Processing', 'Shipped', 'Delivered'];
                            const currentIdx = stages.indexOf(ord.orderStatus);
                            const active = i <= (currentIdx === -1 ? 0 : currentIdx);
                            return (
                              <div
                                key={stage}
                                className={`py-2 px-2 rounded border ${
                                  active
                                    ? 'border-[#4A5D4E] bg-[#4A5D4E]/10 text-[#1C1917] font-semibold'
                                    : 'border-stone-200 text-stone-400'
                                }`}
                              >
                                {stage}
                              </div>
                            );
                          })}
                        </div>

                        <div className="divide-y divide-stone-100">
                          {ord.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="py-3 flex items-center justify-between gap-4"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-12 h-14 rounded object-cover border border-stone-200"
                                />
                                <div>
                                  <p className="font-semibold text-[#1C1917]">{item.name}</p>
                                  <p className="text-stone-500">
                                    {item.selectedColor} · {item.selectedSize} · Qty:{' '}
                                    {item.quantity}
                                  </p>
                                </div>
                              </div>
                              <span className="font-semibold text-[#1C1917]">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
                  Saved Shipping Addresses
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAddressForm((s) => !s)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1C1917] text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#B85338] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              {showAddressForm && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!addressForm.addressLine1.trim()) return;
                    saveAddress(addressForm);
                    setShowAddressForm(false);
                    setAddressForm({
                      label: 'Secondary Residence',
                      addressLine1: '',
                      city: 'Lahore',
                      state: 'Punjab',
                      postalCode: '54000',
                      country: 'Pakistan',
                    });
                  }}
                  className="p-5 rounded-lg bg-[#FAF7F2] border border-stone-200 space-y-4 text-xs"
                >
                  <h3 className="font-semibold text-sm text-[#1C1917]">New Address Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">Address Label</label>
                      <input
                        type="text"
                        value={addressForm.label}
                        onChange={(e) =>
                          setAddressForm((a) => ({ ...a, label: e.target.value }))
                        }
                        className="w-full bg-white border border-stone-300 rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={addressForm.city}
                        onChange={(e) => setAddressForm((a) => ({ ...a, city: e.target.value }))}
                        className="w-full bg-white border border-stone-300 rounded px-3 py-2"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-medium text-stone-700 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.addressLine1}
                        onChange={(e) =>
                          setAddressForm((a) => ({ ...a, addressLine1: e.target.value }))
                        }
                        placeholder="House / Apartment & Street"
                        className="w-full bg-white border border-stone-300 rounded px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#B85338] text-white font-semibold uppercase tracking-wider rounded cursor-pointer"
                    >
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-4 py-2 border border-stone-300 rounded text-stone-600 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {(user.savedAddresses || []).map((addr) => (
                  <div
                    key={addr.id}
                    className="p-4 rounded-lg bg-[#FAF7F2] border border-stone-200 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <span className="inline-block px-2 py-0.5 rounded bg-stone-200 text-[#1C1917] font-semibold text-[10px] uppercase">
                        {addr.label || 'Saved Address'}
                      </span>
                      <p className="font-medium text-[#1C1917] pt-1">{addr.addressLine1}</p>
                      <p className="text-stone-600">
                        {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                      <p className="text-stone-500">{addr.country}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteAddress(addr.id)}
                      aria-label="Delete address"
                      className="text-stone-400 hover:text-red-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
                  Synchronized Wishlist ({wishlistProducts.length})
                </h2>
                <Link
                  to="/wishlist"
                  className="text-xs font-semibold text-[#B85338] hover:underline"
                >
                  Open Full Wishlist View
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {wishlistProducts.map((p) => (
                  <Link
                    key={p.id}
                    to={`/product/${p.slug}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-[#FAF7F2] border border-stone-200 hover:border-[#B85338]"
                  >
                    <img
                      src={p.images?.[0]}
                      alt={p.name}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div className="text-xs">
                      <p className="font-semibold text-[#1C1917]">{p.name}</p>
                      <p className="text-[#B85338] font-semibold mt-1">{formatPrice(p.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-6">
              <h2 className="font-serif text-2xl font-semibold text-[#1C1917] pb-3 border-b border-stone-200">
                Profile & Account Settings
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateProfile(profileForm);
                }}
                className="max-w-lg space-y-4 text-xs"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={profileForm.firstName}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, firstName: e.target.value }))
                      }
                      className="w-full border border-stone-300 rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={profileForm.lastName}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, lastName: e.target.value }))
                      }
                      className="w-full border border-stone-300 rounded px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full border border-stone-300 rounded px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#1C1917] hover:bg-[#B85338] text-white font-semibold uppercase tracking-wider rounded cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
