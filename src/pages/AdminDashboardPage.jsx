import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Plus,
  Trash2,
  Edit3,
  ShoppingBag,
  Tag,
  Settings,
  TrendingUp,
  Copy,
  Check,
  Upload,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Search,
  Lock,
  Layers,
  Key,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import SEOHead from '../components/common/SEOHead';

const COLOR_MAP = {
  black: '#1C1A17',
  white: '#FBF9F5',
  red: '#991B1B',
  maroon: '#6E2631',
  burgundy: '#6E2631',
  blue: '#1E3A8A',
  navy: '#172554',
  green: '#166534',
  olive: '#4A5D4E',
  emerald: '#065F46',
  gold: '#C59B5F',
  brass: '#B5893E',
  brown: '#78350F',
  tan: '#9A5B25',
  beige: '#D6CFC2',
  terracotta: '#9E4733',
  grey: '#6B7280',
  pink: '#BE185D',
};

function parseColorsInput(str) {
  if (!str || !str.trim()) return [{ name: 'Standard', hex: '#1C1A17' }];
  return str
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      if (item.includes(':')) {
        const [name, hex] = item.split(':').map((s) => s.trim());
        return { name, hex: hex || '#1C1A17' };
      }
      const lower = item.toLowerCase();
      return {
        name: item,
        hex: COLOR_MAP[lower] || '#1C1A17',
      };
    });
}

function formatColorsInput(colors) {
  if (!Array.isArray(colors) || colors.length === 0) return 'Black:#1C1A17';
  return colors.map((c) => `${c.name}:${c.hex}`).join(', ');
}

export default function AdminDashboardPage() {
  const {
    user,
    login,
    products,
    categories,
    orders,
    coupons,
    settings,
    formatPrice,
    saveProductAdmin,
    deleteProductAdmin,
    clearAllProductsAdmin,
    restoreSampleProductsAdmin,
    saveCategoryAdmin,
    changePasswordAdmin,
    updateOrderStatusAdmin,
    createCouponAdmin,
    deleteCouponAdmin,
    updateSettingsAdmin,
    addToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [confirmClearModal, setConfirmClearModal] = useState(false);

  // Admin quick sign-in state if not logged in as admin
  const [adminEmail, setAdminEmail] = useState('admin@miras.store');
  const [adminPassword, setAdminPassword] = useState('admin123');

  // Category Form State
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    tagline: '',
    subtitle: '',
    image: '',
  });

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  // Product Form State
  const emptyForm = {
    name: '',
    category: categories[0]?.slug || 'fashion-apparel',
    price: '',
    compareAtPrice: '',
    stock: '20',
    sku: '',
    shortDescription: '',
    description: '',
    imagesText: '',
    colorsText: 'Black:#1C1A17, Olive:#4A5D4E',
    sizesText: 'Standard',
    materials: 'Premium Handpicked Quality',
    origin: 'Pakistan',
    shippingEstimate: 'Dispatches within 24 hours',
    isNew: true,
    isBestSeller: false,
    isFeatured: true,
  };
  const [productForm, setProductForm] = useState(emptyForm);

  // Coupon Form State
  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'percentage',
    value: '10',
    minSubtotal: '0',
    description: '',
  });

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    brandName: settings.brandName || 'MIRAS',
    brandTagline: settings.brandTagline || '',
    announcementMessage: settings.announcement?.message || '',
    announcementCode: settings.announcement?.highlightCode || '',
    contactPhone: settings.contactPhone || '',
    contactEmail: settings.contactEmail || '',
    freeShippingThreshold: String(settings.currency?.freeShippingThreshold || 5000),
    heroHeading: settings.heroBanner?.heading || 'Discover Products With Character.',
    heroSubheading: settings.heroBanner?.subheading || '',
    heroImage: settings.heroBanner?.image || '',
    walletNumber: settings.paymentProviders?.[1]?.bankDetails?.accountNumber || '0300-1234567',
    bankName: settings.paymentProviders?.[1]?.bankDetails?.bankName || 'Meezan Bank / Raast / EasyPaisa',
    bankTitle: settings.paymentProviders?.[1]?.bankDetails?.accountTitle || 'MIRAS RETAIL STORE',
    bankIban: settings.paymentProviders?.[1]?.bankDetails?.iban || 'PK36MEZN0001020105829104',
  });

  // Require Admin Authentication
  if (!user || user.role !== 'admin') {
    const handleAdminLogin = async (e) => {
      e.preventDefault();
      await login(adminEmail, adminPassword);
    };

    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <SEOHead title="Seller Admin Login" />
        <div className="bg-white rounded-2xl border border-[#E6DFD3] p-8 shadow-sm space-y-6">
          <div className="w-12 h-12 rounded-xl bg-[#1C1A17] text-[#C59B5F] flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-semibold text-[#1C1A17]">
              Seller Admin Portal
            </h1>
            <p className="text-xs text-[#5C564F] mt-1">
              Sign in with your store owner credentials to list products, manage orders, and run marketing promos.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Admin Email</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Admin Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#1C1A17] hover:bg-[#9E4733] text-white text-xs font-semibold uppercase tracking-widest transition-colors cursor-pointer"
            >
              Enter Seller Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  const totalRevenue = orders
    .filter((o) => (o.orderStatus || o.status) !== 'Cancelled')
    .reduce((sum, o) => sum + Number(o.total ?? o.totals?.total ?? 0), 0);

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      setProductForm((prev) => ({
        ...prev,
        imagesText: prev.imagesText ? `${prev.imagesText}\n${result}` : result,
      }));
      addToast('Product image uploaded and added to gallery.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleEditProduct = (product) => {
    setEditingId(product.id);
    setProductForm({
      name: product.name || '',
      category: product.categorySlug || product.category || 'fashion-apparel',
      price: String(product.price || ''),
      compareAtPrice: (product.originalPrice || product.compareAtPrice) ? String(product.originalPrice || product.compareAtPrice) : '',
      stock: String(product.stock ?? 20),
      sku: product.sku || '',
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      imagesText: (product.images || []).join('\n'),
      colorsText: formatColorsInput(product.variants?.colors || product.colors),
      sizesText: (product.variants?.sizes || product.sizes || ['Standard']).join(', '),
      materials: product.variants?.materials?.[0] || product.materials || '',
      origin: product.origin || 'Pakistan',
      shippingEstimate: product.shippingEstimate || 'Dispatches within 24 hours',
      isNew: Boolean(product.isNew),
      isBestSeller: Boolean(product.isBestSeller),
      isFeatured: Boolean(product.featured ?? product.isFeatured),
    });
    setActiveTab('add-product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.price) {
      addToast('Please enter a product title and price.', 'error');
      return;
    }

    const images = productForm.imagesText
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean);

    const selectedCat = categories.find((c) => c.slug === productForm.category);
    const parsedColors = parseColorsInput(productForm.colorsText);
    const parsedSizes = productForm.sizesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      ...(editingId ? { id: editingId } : {}),
      name: productForm.name.trim(),
      category: selectedCat?.name || 'Fashion & Apparel',
      categorySlug: productForm.category,
      brand: settings.brandName || 'MIRAS',
      price: Number(productForm.price),
      originalPrice: productForm.compareAtPrice ? Number(productForm.compareAtPrice) : null,
      stock: Number(productForm.stock || 0),
      sku: productForm.sku.trim() || `MRS-${Date.now().toString().slice(-4)}`,
      shortDescription:
        productForm.shortDescription.trim() || productForm.description.trim().slice(0, 120),
      description: productForm.description.trim() || productForm.shortDescription.trim(),
      images:
        images.length > 0
          ? images
          : ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85'],
      variants: {
        colors: parsedColors,
        sizes: parsedSizes.length > 0 ? parsedSizes : ['Standard'],
        materials: [productForm.materials || 'Premium Quality'],
      },
      specifications: {
        Material: productForm.materials || 'Premium Quality',
        Origin: productForm.origin || 'Pakistan',
        Dispatch: productForm.shippingEstimate || 'Dispatches within 24 hours',
      },
      status: 'published',
      isNew: productForm.isNew,
      isBestSeller: productForm.isBestSeller,
      featured: productForm.isFeatured,
    };

    await saveProductAdmin(payload);
    setEditingId(null);
    setProductForm(emptyForm);
    setActiveTab('products');
  };

  const copyProductAdLink = (product) => {
    const url = `${window.location.origin}/product/${product.slug || product.id}`;
    navigator.clipboard?.writeText(url);
    setCopiedId(product.id);
    addToast('Marketing product link copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <SEOHead title="Seller Admin Portal" />

      {/* Top Seller Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-[#E6DFD3]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9E4733]">
            Cloudflare Worker + Hono Commerce Engine
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1C1A17] mt-1">
            Seller Admin & Marketing Hub
          </h1>
          <p className="text-xs text-[#5C564F] mt-1">
            List your products, copy ad links for Instagram/Facebook/TikTok, manage COD orders, and create promo codes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setProductForm(emptyForm);
              setActiveTab('add-product');
            }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#9E4733] hover:bg-[#823624] text-white text-xs font-semibold uppercase tracking-widest transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl border border-[#E6DFD3] bg-white text-xs font-semibold text-[#1C1A17] hover:border-[#1C1A17]"
          >
            View Live Store <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-8">
        <div className="bg-white p-5 rounded-2xl border border-[#E6DFD3]">
          <div className="flex items-center justify-between text-xs text-[#5C564F]">
            <span>Active Products</span>
            <Package className="w-4 h-4 text-[#9E4733]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C1A17] mt-2">
            {products.length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E6DFD3]">
          <div className="flex items-center justify-between text-xs text-[#5C564F]">
            <span>Customer Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#9E4733]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C1A17] mt-2">
            {orders.length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E6DFD3]">
          <div className="flex items-center justify-between text-xs text-[#5C564F]">
            <span>Total Sales Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C1A17] mt-2">
            {formatPrice(totalRevenue)}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E6DFD3]">
          <div className="flex items-center justify-between text-xs text-[#5C564F]">
            <span>Active Promo Codes</span>
            <Tag className="w-4 h-4 text-[#9E4733]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C1A17] mt-2">
            {coupons.length}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-[#E6DFD3] pb-4">
        {[
          { id: 'products', label: `My Products (${products.length})`, icon: Package },
          { id: 'add-product', label: editingId ? 'Edit Product' : '+ List New Product', icon: Plus },
          { id: 'categories', label: `Categories (${categories.length})`, icon: Layers },
          { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
          { id: 'marketing', label: `Marketing & Promo Codes (${coupons.length})`, icon: Tag },
          { id: 'settings', label: 'Store & Brand Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#1C1A17] text-white'
                  : 'bg-white text-[#5C564F] border border-[#E6DFD3] hover:border-[#1C1A17]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: MY PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E6DFD3]">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#5C564F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your products by name or SKU..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E6DFD3] text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {products.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setConfirmClearModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All Starter Products
                </button>
              ) : (
                <button
                  type="button"
                  onClick={restoreSampleProductsAdmin}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E6DFD3] bg-[#FBF9F5] text-[#1C1A17] text-xs font-semibold hover:bg-[#EFECE6] cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore Starter Products
                </button>
              )}
            </div>
          </div>

          {confirmClearModal && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-950">
                    Ready to start with a blank catalog for your own products?
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    This will remove all current products so only the items you list will appear on the store.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setConfirmClearModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-amber-300 bg-white text-xs font-semibold text-amber-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await clearAllProductsAdmin();
                    setConfirmClearModal(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                >
                  Yes, Clear All Products
                </button>
              </div>
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E6DFD3] p-12 text-center space-y-4">
              <Package className="w-10 h-10 text-[#9E4733] mx-auto" />
              <h3 className="font-serif text-xl font-semibold text-[#1C1A17]">
                Your Product Catalog is Empty
              </h3>
              <p className="text-xs text-[#5C564F] max-w-md mx-auto">
                Click the button below to list your first product with photos, sizes, colors, and pricing.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('add-product')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#9E4733] text-white text-xs font-semibold uppercase tracking-widest"
              >
                <Plus className="w-4 h-4" />
                List Your First Product
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E6DFD3] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E6DFD3] bg-[#FBF9F5] text-[11px] font-semibold uppercase tracking-wider text-[#5C564F]">
                      <th className="py-3.5 px-4">Product</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Price</th>
                      <th className="py-3.5 px-4">Stock</th>
                      <th className="py-3.5 px-4">Ad Link (For Marketing)</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6DFD3] text-xs">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-[#FBF9F5]/60">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.images?.[0]}
                              alt={product.name}
                              className="w-12 h-14 rounded-lg object-cover bg-[#EFECE6] shrink-0"
                            />
                            <div>
                              <p className="font-semibold text-[#1C1A17]">{product.name}</p>
                              <p className="text-[11px] text-[#5C564F]">SKU: {product.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#5C564F]">{product.categoryName || product.category}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-[#1C1A17]">{formatPrice(product.price)}</span>
                          {product.compareAtPrice > product.price && (
                            <span className="block text-[10px] text-[#5C564F] line-through">
                              {formatPrice(product.compareAtPrice)}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              product.stock > 5
                                ? 'bg-emerald-50 text-emerald-700'
                                : product.stock > 0
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {product.stock} in stock
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => copyProductAdLink(product)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E6DFD3] bg-white hover:border-[#1C1A17] text-[11px] font-semibold text-[#1C1A17] cursor-pointer"
                          >
                            {copiedId === product.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied Link
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-[#9E4733]" /> Copy Ad URL
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleEditProduct(product)}
                            className="p-2 rounded-lg border border-[#E6DFD3] hover:border-[#1C1A17] text-[#1C1A17] cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteProductAdmin(product.id)}
                            className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ADD OR EDIT PRODUCT */}
      {activeTab === 'add-product' && (
        <form
          onSubmit={handleSaveProductSubmit}
          className="bg-white rounded-2xl border border-[#E6DFD3] p-6 sm:p-8 max-w-4xl space-y-6"
        >
          <div className="flex items-center justify-between border-b border-[#E6DFD3] pb-4">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#1C1A17]">
                {editingId ? 'Edit Product Listing' : 'Create New Product Listing'}
              </h2>
              <p className="text-xs text-[#5C564F]">
                Fill in the details below. Your product will immediately appear in the store with full filter support.
              </p>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setProductForm(emptyForm);
                }}
                className="text-xs text-[#9E4733] underline"
              >
                Switch to New Product
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                Product Name / Title *
              </label>
              <input
                type="text"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                placeholder="e.g. Hand-Embroidered Pashmina Shawl or Leather Crossbody Bag"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                Category *
              </label>
              <select
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6DFD3] text-sm bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                SKU / Product Code (Optional)
              </label>
              <input
                type="text"
                value={productForm.sku}
                onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                placeholder="Auto-generated if left blank"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                Selling Price ({settings.currency?.code || 'PKR'}) *
              </label>
              <input
                type="number"
                min="1"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                placeholder="e.g. 4500"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                Original Price Before Discount (Optional — Shows "SALE" Badge)
              </label>
              <input
                type="number"
                min="0"
                value={productForm.compareAtPrice}
                onChange={(e) => setProductForm({ ...productForm, compareAtPrice: e.target.value })}
                placeholder="e.g. 5800"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                Available Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                value={productForm.stock}
                onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                Sizes (Comma separated — Powers Shop Size Filter)
              </label>
              <input
                type="text"
                value={productForm.sizesText}
                onChange={(e) => setProductForm({ ...productForm, sizesText: e.target.value })}
                placeholder="S, M, L, XL or Standard"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                Available Colors (Comma separated — e.g. Black, Maroon, Olive, Gold)
              </label>
              <input
                type="text"
                value={productForm.colorsText}
                onChange={(e) => setProductForm({ ...productForm, colorsText: e.target.value })}
                placeholder="Black, Maroon, Olive, Gold"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
              />
            </div>

            {/* Image Upload & URLs */}
            <div className="sm:col-span-2 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="block text-xs font-semibold text-[#1C1A17]">
                  Product Photos (Upload from your computer/phone or paste image URLs, one per line) *
                </label>
                <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#EFECE6] hover:bg-[#1C1A17] hover:text-white text-xs font-semibold text-[#1C1A17] cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  Upload Image File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <textarea
                rows={3}
                value={productForm.imagesText}
                onChange={(e) => setProductForm({ ...productForm, imagesText: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6DFD3] text-xs font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                Short Highlight Summary
              </label>
              <input
                type="text"
                value={productForm.shortDescription}
                onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                placeholder="One-sentence hook shown on product cards and top of product page"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                Full Product Description & Features *
              </label>
              <textarea
                rows={4}
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                placeholder="Describe the fabric/material, quality, dimensions, and why customers will love it..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                Material / Craftsmanship Details
              </label>
              <input
                type="text"
                value={productForm.materials}
                onChange={(e) => setProductForm({ ...productForm, materials: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                Delivery Estimate
              </label>
              <input
                type="text"
                value={productForm.shippingEstimate}
                onChange={(e) => setProductForm({ ...productForm, shippingEstimate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
              />
            </div>

            {/* Badges */}
            <div className="sm:col-span-2 flex flex-wrap items-center gap-6 pt-2">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#1C1A17] cursor-pointer">
                <input
                  type="checkbox"
                  checked={productForm.isNew}
                  onChange={(e) => setProductForm({ ...productForm, isNew: e.target.checked })}
                  className="accent-[#9E4733]"
                />
                Show in "New Arrivals"
              </label>
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#1C1A17] cursor-pointer">
                <input
                  type="checkbox"
                  checked={productForm.isBestSeller}
                  onChange={(e) => setProductForm({ ...productForm, isBestSeller: e.target.checked })}
                  className="accent-[#9E4733]"
                />
                Mark as "Best Seller"
              </label>
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#1C1A17] cursor-pointer">
                <input
                  type="checkbox"
                  checked={productForm.isFeatured}
                  onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                  className="accent-[#9E4733]"
                />
                Feature on Homepage
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E6DFD3] flex items-center gap-4">
            <button
              type="submit"
              className="px-8 py-3.5 rounded-xl bg-[#9E4733] hover:bg-[#823624] text-white text-xs font-semibold uppercase tracking-widest transition-colors cursor-pointer"
            >
              {editingId ? 'Save Product Changes' : 'Publish Product to Store'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className="px-5 py-3.5 rounded-xl border border-[#E6DFD3] text-xs font-semibold text-[#5C564F]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E6DFD3] p-12 text-center">
              <ShoppingBag className="w-10 h-10 text-[#9E4733] mx-auto mb-3" />
              <h3 className="font-serif text-xl font-semibold text-[#1C1A17]">No Orders Yet</h3>
              <p className="text-xs text-[#5C564F] mt-1">
                When customers place orders through your marketing campaigns, they will appear here with full delivery details.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-[#E6DFD3] p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E6DFD3] pb-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-sm font-bold text-[#1C1A17]">
                        #{order.id}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EFECE6] text-[#1C1A17] font-semibold">
                        {order.paymentMethod === 'cod' ? 'Cash on Delivery' : `Prepaid (${order.paymentReference || 'Wallet'})`}
                      </span>
                    </div>
                    <p className="text-xs text-[#5C564F] mt-1">
                      Placed on {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatusAdmin(order.id, e.target.value)}
                      className="px-3.5 py-2 rounded-xl border border-[#E6DFD3] text-xs font-semibold bg-[#FBF9F5]"
                    >
                      <option value="Pending Confirmation">Pending Confirmation</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Processing">Processing</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <span className="text-base font-bold text-[#9E4733]">
                      {formatPrice(order.totals?.total || 0)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <p className="font-semibold text-[#1C1A17]">
                      Customer: {order.customer?.firstName} {order.customer?.lastName}
                    </p>
                    <p className="text-[#5C564F]">Phone / WhatsApp: {order.customer?.phone}</p>
                    <p className="text-[#5C564F]">
                      Address: {order.shippingAddress?.addressLine1}, {order.shippingAddress?.city}, {order.shippingAddress?.state}
                    </p>
                    {order.orderNotes && (
                      <p className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded mt-1">
                        Note: {order.orderNotes}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <p className="font-semibold text-[#1C1A17]">Items Ordered:</p>
                    {(order.items || []).map((item, i) => (
                      <div key={i} className="flex justify-between text-[#5C564F]">
                        <span>
                          {item.name} ({[item.selectedColor, item.selectedSize].filter(Boolean).join('/')}) × {item.quantity}
                        </span>
                        <span className="font-medium text-[#1C1A17]">
                          {formatPrice(item.lineTotal || item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: MARKETING & PROMO CODES */}
      {activeTab === 'marketing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E6DFD3] space-y-4 h-fit">
            <h3 className="font-serif text-xl font-semibold text-[#1C1A17]">
              Create Marketing Promo Code
            </h3>
            <p className="text-xs text-[#5C564F]">
              Create discount codes for your Instagram, TikTok, or Facebook ad campaigns.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!couponForm.code.trim()) return;
                await createCouponAdmin({
                  code: couponForm.code.trim().toUpperCase(),
                  type: couponForm.type,
                  value: Number(couponForm.value),
                  minSubtotal: Number(couponForm.minSubtotal || 0),
                  description: couponForm.description || 'Special campaign discount',
                });
                setCouponForm({ code: '', type: 'percentage', value: '10', minSubtotal: '0', description: '' });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Promo Code *</label>
                <input
                  type="text"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. INSTA15 or EID20"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm uppercase font-mono"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Discount Type</label>
                  <select
                    value={couponForm.type}
                    onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E6DFD3] text-xs bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Discount Value</label>
                  <input
                    type="number"
                    min="0"
                    value={couponForm.value}
                    onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Minimum Order Amount</label>
                <input
                  type="number"
                  min="0"
                  value={couponForm.minSubtotal}
                  onChange={(e) => setCouponForm({ ...couponForm, minSubtotal: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#1C1A17] hover:bg-[#9E4733] text-white text-xs font-semibold uppercase tracking-widest cursor-pointer"
              >
                Create Promo Code
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-3">
            {coupons.map((c) => (
              <div
                key={c.code}
                className="bg-white p-4 rounded-2xl border border-[#E6DFD3] flex items-center justify-between"
              >
                <div>
                  <span className="font-mono text-sm font-bold text-[#9E4733] bg-[#FBF9F5] px-3 py-1 rounded-lg border border-[#E6DFD3]">
                    {c.code}
                  </span>
                  <p className="text-xs text-[#1C1A17] font-medium mt-2">
                    {c.type === 'percentage'
                      ? `${c.value}% OFF`
                      : c.type === 'free_shipping'
                      ? 'Free Standard Delivery'
                      : `${formatPrice(c.value)} OFF`}{' '}
                    • Min order: {formatPrice(c.minSubtotal || 0)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteCouponAdmin(c.code)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: STORE CATEGORIES (DYNAMIC) */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E6DFD3] space-y-4 h-fit">
            <h3 className="font-serif text-xl font-semibold text-[#1C1A17]">
              Create New Store Category
            </h3>
            <p className="text-xs text-[#5C564F]">
              Add a new product category. It will immediately appear in the store menu, filters, and homepage.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!categoryForm.name.trim()) return;
                await saveCategoryAdmin({
                  name: categoryForm.name.trim(),
                  tagline: categoryForm.tagline.trim(),
                  subtitle: categoryForm.subtitle.trim(),
                  image: categoryForm.image.trim() || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85',
                });
                setCategoryForm({ name: '', tagline: '', subtitle: '', image: '' });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Category Name *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Leather Goods or Silk Scarves"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Tagline (Shown on Card)</label>
                <input
                  type="text"
                  value={categoryForm.tagline}
                  onChange={(e) => setCategoryForm({ ...categoryForm, tagline: e.target.value })}
                  placeholder="e.g. Handcrafted Leather"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Subtitle / Description</label>
                <input
                  type="text"
                  value={categoryForm.subtitle}
                  onChange={(e) => setCategoryForm({ ...categoryForm, subtitle: e.target.value })}
                  placeholder="e.g. Wallets, belts and crafted bags"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={categoryForm.image}
                  onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#1C1A17] hover:bg-[#9E4733] text-white text-xs font-semibold uppercase tracking-widest cursor-pointer"
              >
                Save Category
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <h3 className="font-serif text-lg font-semibold text-[#1C1A17] mb-2">
              Active Store Categories ({categories.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((c) => (
                <div key={c.id || c.slug} className="bg-white p-4 rounded-2xl border border-[#E6DFD3] flex items-center gap-3">
                  {c.image && (
                    <img src={c.image} alt={c.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  )}
                  <div>
                    <h4 className="font-semibold text-xs text-[#1C1A17]">{c.name}</h4>
                    <p className="text-[11px] text-[#5C564F]">{c.tagline || c.subtitle || `/${c.slug}`}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STORE SETTINGS & SECURITY */}
      {activeTab === 'settings' && (
        <div className="max-w-3xl space-y-8">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await updateSettingsAdmin({
                brandName: settingsForm.brandName,
                brandTagline: settingsForm.brandTagline,
                contactPhone: settingsForm.contactPhone,
                contactEmail: settingsForm.contactEmail,
                heroBanner: {
                  ...settings.heroBanner,
                  heading: settingsForm.heroHeading,
                  subheading: settingsForm.heroSubheading,
                  image: settingsForm.heroImage || settings.heroBanner?.image,
                },
                announcement: {
                  enabled: true,
                  message: settingsForm.announcementMessage,
                  highlightCode: settingsForm.announcementCode,
                  ctaText: 'Shop Now',
                  ctaLink: '/shop',
                },
                paymentProviders: [
                  settings.paymentProviders?.[0] || { id: 'cod', name: 'Cash on Delivery (COD)' },
                  {
                    ...(settings.paymentProviders?.[1] || {}),
                    id: 'wallet_transfer',
                    name: 'EasyPaisa / JazzCash / Bank Transfer (Raast)',
                    bankDetails: {
                      accountNumber: settingsForm.walletNumber,
                      bankName: settingsForm.bankName,
                      accountTitle: settingsForm.bankTitle,
                      iban: settingsForm.bankIban,
                    },
                    instructions: `Send payment to EasyPaisa/JazzCash: ${settingsForm.walletNumber} (${settingsForm.bankTitle}) or ${settingsForm.bankName} IBAN: ${settingsForm.bankIban} and enter your Transaction ID (TRX ID).`,
                  },
                ],
                currency: {
                  ...settings.currency,
                  freeShippingThreshold: Number(settingsForm.freeShippingThreshold || 5000),
                },
              });
            }}
            className="bg-white rounded-2xl border border-[#E6DFD3] p-6 sm:p-8 space-y-6"
          >
            <h3 className="font-serif text-2xl font-semibold text-[#1C1A17]">
              Store Branding & Contact Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Store Brand Name</label>
                <input
                  type="text"
                  value={settingsForm.brandName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, brandName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Tagline</label>
                <input
                  type="text"
                  value={settingsForm.brandTagline}
                  onChange={(e) => setSettingsForm({ ...settingsForm, brandTagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Support / WhatsApp Phone</label>
                <input
                  type="text"
                  value={settingsForm.contactPhone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Support Email</label>
                <input
                  type="email"
                  value={settingsForm.contactEmail}
                  onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Top Announcement Banner Message</label>
                <input
                  type="text"
                  value={settingsForm.announcementMessage}
                  onChange={(e) => setSettingsForm({ ...settingsForm, announcementMessage: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Banner Promo Code Highlight</label>
                <input
                  type="text"
                  value={settingsForm.announcementCode}
                  onChange={(e) => setSettingsForm({ ...settingsForm, announcementCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Free Shipping Threshold (PKR)</label>
                <input
                  type="number"
                  value={settingsForm.freeShippingThreshold}
                  onChange={(e) => setSettingsForm({ ...settingsForm, freeShippingThreshold: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                />
              </div>

              {/* Hero Banner Section */}
              <div className="sm:col-span-2 pt-4 border-t border-[#E6DFD3]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9E4733] mb-3">Homepage Hero Banner</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Hero Main Heading</label>
                    <input
                      type="text"
                      value={settingsForm.heroHeading}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroHeading: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Hero Subheading</label>
                    <input
                      type="text"
                      value={settingsForm.heroSubheading}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroSubheading: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Hero Image URL</label>
                    <input
                      type="url"
                      value={settingsForm.heroImage}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroImage: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* EasyPaisa & Bank Transfer Settings */}
              <div className="sm:col-span-2 pt-4 border-t border-[#E6DFD3]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9E4733] mb-3">
                  Customer Payment Accounts (Shown at Checkout)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1A17] mb-1">EasyPaisa / JazzCash Number</label>
                    <input
                      type="text"
                      value={settingsForm.walletNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, walletNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Account Title</label>
                    <input
                      type="text"
                      value={settingsForm.bankTitle}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bankTitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Bank Name / Raast</label>
                    <input
                      type="text"
                      value={settingsForm.bankName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bankName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Bank IBAN</label>
                    <input
                      type="text"
                      value={settingsForm.bankIban}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bankIban: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#1C1A17] hover:bg-[#9E4733] text-white text-xs font-semibold uppercase tracking-widest cursor-pointer transition-colors"
            >
              Save Store Settings
            </button>
          </form>

          {/* Admin Password Change Card */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                addToast('New passwords do not match.', 'error');
                return;
              }
              if (passwordForm.newPassword.length < 6) {
                addToast('Password must be at least 6 characters.', 'error');
                return;
              }
              await changePasswordAdmin({
                email: user?.email || 'admin@miras.store',
                newPassword: passwordForm.newPassword,
              });
              setPasswordForm({ newPassword: '', confirmPassword: '' });
            }}
            className="bg-white rounded-2xl border border-[#E6DFD3] p-6 sm:p-8 space-y-4"
          >
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-[#9E4733]" />
              <h3 className="font-serif text-xl font-semibold text-[#1C1A17]">
                Update Admin Password (PBKDF2 Secured)
              </h3>
            </div>
            <p className="text-xs text-[#5C564F]">
              Change the password used to access this Seller Admin Portal. Your password is encrypted with 100,000 PBKDF2-SHA256 iterations in Cloudflare D1.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#1C1A17] hover:bg-[#9E4733] text-white text-xs font-semibold uppercase tracking-widest cursor-pointer transition-colors"
            >
              Update Password
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
