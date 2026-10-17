import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Plus,
  Minus,
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
  Printer,
  MessageCircle,
  Truck,
  X,
  Database,
  Star,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import SEOHead from '../components/common/SEOHead';
import GoogleSignInButton from '../components/common/GoogleSignInButton';

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
    uploadMediaAdmin,
    saveProductAdmin,
    updateProductStockAdmin,
    deleteProductAdmin,
    clearAllProductsAdmin,
    restoreSampleProductsAdmin,
    saveCategoryAdmin,
    deleteCategoryAdmin,
    changePasswordAdmin,
    updateOrderStatusAdmin,
    createCouponAdmin,
    deleteCouponAdmin,
    updateSettingsAdmin,
    deleteProductReviewAdmin,
    addToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [confirmClearModal, setConfirmClearModal] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Admin quick sign-in state if not logged in as admin
  const [adminEmail, setAdminEmail] = useState('admin@miras.store');
  const [adminPassword, setAdminPassword] = useState('admin123');

  // Category Form State (Supports Create + Edit)
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    tagline: '',
    subtitle: '',
    image: '',
  });

  // Order Tracking Drafts
  const [trackingDrafts, setTrackingDrafts] = useState({});

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  // Product Form State
  const emptyForm = {
    name: '',
    category: categories[0]?.slug || 'traditional-cultural',
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
    standardShippingFee: String(settings.shipping?.methods?.[0]?.price ?? 250),
    expressShippingFee: String(settings.shipping?.methods?.[1]?.price ?? 500),
    heroHeading: settings.heroBanner?.heading || 'Discover Products With Character.',
    heroSubheading: settings.heroBanner?.subheading || '',
    heroImage: settings.heroBanner?.image || '',
    lookbookHeading:
      settings.lookbookBanner?.heading ||
      'Timeless Eastern Craft & Contemporary Silhouettes',
    lookbookDescription:
      settings.lookbookBanner?.description ||
      'From hand-loomed Kashmiri & Swati shawls to tailored seasonal apparel and artisan brassware — crafted for everyday elegance and festive occasions.',
    lookbookImage:
      settings.lookbookBanner?.image ||
      'https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?auto=format&fit=crop&w=1400&q=85',
    walletNumber: settings.paymentProviders?.[1]?.bankDetails?.accountNumber || '0300-1234567',
    bankName:
      settings.paymentProviders?.[1]?.bankDetails?.bankName ||
      'Meezan Bank / Raast / EasyPaisa',
    bankTitle: settings.paymentProviders?.[1]?.bankDetails?.accountTitle || 'MIRAS RETAIL STORE',
    bankIban: settings.paymentProviders?.[1]?.bankDetails?.iban || 'PK36MEZN0001020105829104',
    googleClientId: settings.googleClientId || '',
  });

  // Require Admin Authentication
  if (!user || user.role !== 'admin') {
    const handleAdminLogin = async (e) => {
      e.preventDefault();
      try {
        await login(adminEmail, adminPassword);
      } catch (err) {
        addToast(err.message || 'Invalid credentials', 'error');
      }
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
              Sign in with your store owner credentials to manage D1 products, R2 media images, orders, and promo codes.
            </p>
          </div>

          <GoogleSignInButton
            label="Sign in with Google (Store Owner)"
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-stone-50 text-[#1C1A17] border border-[#E6DFD3] hover:border-[#1C1A17] text-xs font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          />

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
              <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                Admin Password
              </label>
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

  // Upload Product Images to Cloudflare R2
  const handleImageFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploadingImage(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const res = await uploadMediaAdmin(file);
        if (res?.url) {
          uploadedUrls.push(res.url);
        }
      }
      if (uploadedUrls.length > 0) {
        setProductForm((prev) => {
          const existing = prev.imagesText
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean);
          return {
            ...prev,
            imagesText: [...existing, ...uploadedUrls].join('\n'),
          };
        });
        addToast(
          `Uploaded ${uploadedUrls.length} image(s) to Cloudflare R2 storage.`,
          'success'
        );
      }
    } catch (err) {
      addToast(err.message || 'Failed uploading image.', 'error');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  // Upload Category Cover Image to Cloudflare R2
  const handleCategoryImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const res = await uploadMediaAdmin(file);
      if (res?.url) {
        setCategoryForm((prev) => ({ ...prev, image: res.url }));
        addToast('Category image uploaded to Cloudflare R2.', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Upload failed.', 'error');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  // Upload Hero Banner Image to Cloudflare R2
  const handleHeroImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const res = await uploadMediaAdmin(file);
      if (res?.url) {
        setSettingsForm((prev) => ({ ...prev, heroImage: res.url }));
        addToast('Hero banner image uploaded to Cloudflare R2.', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Upload failed.', 'error');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const removeProductImageAt = (indexToRemove) => {
    const list = productForm.imagesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const next = list.filter((_, idx) => idx !== indexToRemove);
    setProductForm((prev) => ({ ...prev, imagesText: next.join('\n') }));
  };

  const handleEditProduct = (product) => {
    setEditingId(product.id);
    setProductForm({
      name: product.name || '',
      category: product.categorySlug || product.category || categories[0]?.slug || 'fashion-apparel',
      price: String(product.price || ''),
      compareAtPrice:
        product.originalPrice || product.compareAtPrice
          ? String(product.originalPrice || product.compareAtPrice)
          : '',
      stock: String(product.stock ?? 20),
      sku: product.sku || '',
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      imagesText: (product.images || []).join('\n'),
      colorsText: formatColorsInput(product.variants?.colors || product.colors),
      sizesText: (product.variants?.sizes || product.sizes || ['Standard']).join(', '),
      materials:
        product.variants?.materials?.[0] ||
        product.specifications?.Material ||
        product.materials ||
        'Premium Handpicked Quality',
      origin:
        product.culturalOrigin ||
        product.specifications?.Origin ||
        product.origin ||
        'Lahore, Punjab',
      shippingEstimate:
        product.specifications?.Dispatch ||
        product.shippingEstimate ||
        'Dispatches within 24 hours',
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
      category: selectedCat?.name || 'Traditional & Cultural',
      categorySlug: productForm.category || selectedCat?.slug || 'traditional-cultural',
      culturalOrigin: (productForm.origin || 'Pakistan').trim(),
      origin: (productForm.origin || 'Pakistan').trim(),
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
          : [
              'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85',
            ],
      variants: {
        colors: parsedColors,
        sizes: parsedSizes.length > 0 ? parsedSizes : ['Standard'],
        materials: [productForm.materials || 'Premium Quality'],
      },
      specifications: {
        Material: productForm.materials || 'Premium Quality',
        Origin: (productForm.origin || 'Pakistan').trim(),
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

  // Printable Courier Packing Slip Generator
  const printOrderPackingSlip = (order) => {
    const totalAmount = order.total ?? order.totals?.total ?? 0;
    const customerName =
      order.customerName ||
      `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim();
    const isCOD = order.paymentMethod === 'cod';
    const itemsHtml = (order.items || [])
      .map(
        (item) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #ddd;">${item.name} ${
          item.selectedColor || item.selectedSize
            ? `(${[item.selectedColor, item.selectedSize].filter(Boolean).join('/')})`
            : ''
        }</td>
          <td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;">${
            item.quantity
          }</td>
          <td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">${formatPrice(
            item.lineTotal || item.price * item.quantity
          )}</td>
        </tr>`
      )
      .join('');

    const win = window.open('', '_blank', 'width=800,height=700');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Dispatch Slip - ${order.id}</title>
          <style>
            body { font-family: sans-serif; color: #1C1A17; padding: 24px; max-width: 700px; margin: 0 auto; }
            .box { border: 2px solid #1C1A17; padding: 20px; border-radius: 8px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #1C1A17; padding-bottom: 12px; margin-bottom: 16px; }
            .cod-banner { background: #1C1A17; color: #fff; padding: 12px 16px; border-radius: 6px; font-size: 18px; font-weight: bold; display: flex; justify-content: space-between; margin: 16px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
            th { text-align: left; background: #f4f1ea; padding: 8px; border-bottom: 1px solid #1C1A17; }
          </style>
        </head>
        <body>
          <div class="box">
            <div class="header">
              <div>
                <h1 style="margin:0;letter-spacing:3px;">${settings.brandName || 'MIRAS'}</h1>
                <p style="margin:4px 0 0;font-size:12px;">${settings.contactPhone || ''}</p>
              </div>
              <div style="text-align:right;">
                <h2 style="margin:0;">ORDER #${order.id}</h2>
                <p style="margin:4px 0 0;font-size:12px;">Courier: ${
                  order.courierName || 'TCS / Leopards'
                } | Tracking: ${order.trackingNumber || 'Pending'}</p>
                <p style="margin:2px 0 0;font-size:11px;">Date: ${new Date(
                  order.createdAt
                ).toLocaleDateString()}</p>
              </div>
            </div>
            <div class="cod-banner">
              <span>${isCOD ? 'CASH ON DELIVERY (COLLECT CASH)' : 'PREPAID ORDER'}</span>
              <span>${isCOD ? formatPrice(totalAmount) : 'PAID (' + formatPrice(totalAmount) + ')'}</span>
            </div>
            <div style="font-size:14px;line-height:1.5;margin-bottom:16px;">
              <strong>DELIVER TO:</strong><br/>
              <strong>${customerName}</strong><br/>
              Phone: <strong>${order.customer?.phone || ''}</strong><br/>
              Address: ${order.shippingAddress?.addressLine1 || ''}, ${
      order.shippingAddress?.city || ''
    } ${order.shippingAddress?.state || ''} ${order.shippingAddress?.postalCode || ''}
            </div>
            <table>
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th style="text-align:center;">Qty</th>
                  <th style="text-align:right;">Total</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            <div style="text-align:right;margin-top:16px;font-size:15px;">
              <strong>Grand Total: ${formatPrice(totalAmount)}</strong>
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const previewImages = productForm.imagesText
    .split('\n')
    .map((u) => u.trim())
    .filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <SEOHead title="Seller Admin Portal" />

      {/* Top Seller Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-[#E6DFD3]">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#9E4733]">
            <Database className="w-3.5 h-3.5" />
            Cloudflare D1 Database + R2 Media Storage Active
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1C1A17] mt-1">
            Seller Admin & Marketing Hub
          </h1>
          <p className="text-xs text-[#5C564F] mt-1">
            Dynamically manage products, upload photos to Cloudflare R2, process COD orders, and print courier slips.
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
          {
            id: 'add-product',
            label: editingId ? 'Edit Product' : '+ List New Product',
            icon: Plus,
          },
          { id: 'categories', label: `Categories (${categories.length})`, icon: Layers },
          { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
          {
            id: 'marketing',
            label: `Marketing & Promo Codes (${coupons.length})`,
            icon: Tag,
          },
          {
            id: 'reviews',
            label: `Customer Reviews (${products.reduce((s, p) => s + (p.reviews?.length || 0), 0)})`,
            icon: Star,
          },
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
                    This will permanently remove all current products from Cloudflare D1 so only the items you list will appear on the store.
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
                Click the button below to list your first product with photos uploaded directly to Cloudflare R2.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('add-product')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#9E4733] text-white text-xs font-semibold uppercase tracking-widest cursor-pointer"
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
                      <th className="py-3.5 px-4">Quick Stock Control</th>
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
                              <Link
                                to={`/product/${product.slug}`}
                                className="font-semibold text-[#1C1A17] hover:text-[#9E4733] transition-colors"
                              >
                                {product.name}
                              </Link>
                              <p className="text-[11px] text-[#5C564F]">SKU: {product.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#5C564F]">
                          {product.categoryName || product.category}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-[#1C1A17]">
                            {formatPrice(product.price)}
                          </span>
                          {(product.originalPrice || product.compareAtPrice) > product.price && (
                            <span className="block text-[10px] text-[#5C564F] line-through">
                              {formatPrice(product.originalPrice || product.compareAtPrice)}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                updateProductStockAdmin(product.id, Math.max(0, product.stock - 1))
                              }
                              className="w-6 h-6 rounded border border-[#E6DFD3] bg-white hover:bg-[#EFECE6] flex items-center justify-center cursor-pointer"
                              title="Decrease stock"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
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
                            <button
                              type="button"
                              onClick={() =>
                                updateProductStockAdmin(product.id, Number(product.stock || 0) + 1)
                              }
                              className="w-6 h-6 rounded border border-[#E6DFD3] bg-white hover:bg-[#EFECE6] flex items-center justify-center cursor-pointer"
                              title="Increase stock"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
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
                Saved directly to Cloudflare D1 database with images hosted on Cloudflare R2.
              </p>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setProductForm(emptyForm);
                }}
                className="text-xs text-[#9E4733] underline cursor-pointer"
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
              <label className="block text-xs font-semibold text-[#1C1A17] mb-1">Category *</label>
              <select
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6DFD3] text-sm bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat.id || cat.slug} value={cat.slug}>
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

            {/* Cloudflare R2 Image Upload & Gallery Preview */}
            <div className="sm:col-span-2 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="block text-xs font-semibold text-[#1C1A17]">
                  Product Photos (Upload directly to Cloudflare R2 or paste URLs) *
                </label>
                <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1C1A17] hover:bg-[#9E4733] text-white text-xs font-semibold cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  {isUploadingImage ? 'Uploading to R2...' : 'Upload Photos to Cloudflare R2'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isUploadingImage}
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {previewImages.length > 0 && (
                <div className="flex flex-wrap gap-3 p-3 rounded-xl bg-[#FBF9F5] border border-[#E6DFD3]">
                  {previewImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="relative group w-20 h-24 rounded-lg overflow-hidden border border-[#E6DFD3] bg-white"
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeProductImageAt(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/75 text-white flex items-center justify-center opacity-90 hover:bg-red-600 cursor-pointer"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                rows={3}
                value={productForm.imagesText}
                onChange={(e) => setProductForm({ ...productForm, imagesText: e.target.value })}
                placeholder="Uploaded R2 URLs or external image URLs (one per line)..."
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
                onChange={(e) =>
                  setProductForm({ ...productForm, shortDescription: e.target.value })
                }
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
                Regional Origin / Province of Pakistan *
              </label>
              <input
                type="text"
                value={productForm.origin}
                onChange={(e) => setProductForm({ ...productForm, origin: e.target.value })}
                placeholder="e.g. Kashmir & Swat, Multan (Punjab), Hala (Sindh), Quetta"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {[
                  'Kashmir & Swat',
                  'Lahore, Punjab',
                  'Multan, South Punjab',
                  'Bhitshah & Hala, Sindh',
                  'Quetta, Balochistan',
                  'Peshawar, KPK',
                  'Hunza & Chitral, Gilgit',
                ].map((regPreset) => (
                  <button
                    key={regPreset}
                    type="button"
                    onClick={() => setProductForm({ ...productForm, origin: regPreset })}
                    className="px-2 py-0.5 rounded bg-[#F3EDE2] hover:bg-[#1C1A17] hover:text-white text-[10px] font-medium text-[#1C1A17] transition-colors cursor-pointer"
                  >
                    {regPreset}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                Delivery Estimate
              </label>
              <input
                type="text"
                value={productForm.shippingEstimate}
                onChange={(e) =>
                  setProductForm({ ...productForm, shippingEstimate: e.target.value })
                }
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
                  onChange={(e) =>
                    setProductForm({ ...productForm, isBestSeller: e.target.checked })
                  }
                  className="accent-[#9E4733]"
                />
                Mark as "Best Seller"
              </label>
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#1C1A17] cursor-pointer">
                <input
                  type="checkbox"
                  checked={productForm.isFeatured}
                  onChange={(e) =>
                    setProductForm({ ...productForm, isFeatured: e.target.checked })
                  }
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
              className="px-5 py-3.5 rounded-xl border border-[#E6DFD3] text-xs font-semibold text-[#5C564F] cursor-pointer"
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
            orders.map((order) => {
              const orderTotal = order.total ?? order.totals?.total ?? 0;
              const currentStatus = order.orderStatus || order.status || 'Confirmed';
              const customerName =
                order.customerName ||
                `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim();
              const cleanCustomerPhone = (order.customer?.phone || '')
                .replace(/[^0-9]/g, '')
                .replace(/^0/, '92');
              const draft = trackingDrafts[order.id] || {
                courierName: order.courierName || 'TCS / Leopards',
                trackingNumber: order.trackingNumber || 'Pending Dispatch',
              };

              const customerWhatsappText = encodeURIComponent(
                `Assalam-o-Alaikum ${customerName}! Your ${
                  settings.brandName || 'MIRAS'
                } Order #${order.id} (${formatPrice(
                  orderTotal
                )}) is currently *${currentStatus}*. Courier: ${
                  draft.courierName
                } | Tracking: ${draft.trackingNumber}. Thank you for shopping with us!`
              );

              return (
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
                          {order.paymentMethod === 'cod'
                            ? 'Cash on Delivery (COD)'
                            : `Prepaid (${order.paymentReference || 'Transfer'})`}
                        </span>
                      </div>
                      <p className="text-xs text-[#5C564F] mt-1">
                        Placed on {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <select
                        value={currentStatus}
                        onChange={(e) =>
                          updateOrderStatusAdmin(order.id, {
                            orderStatus: e.target.value,
                            status: e.target.value,
                          })
                        }
                        className="px-3.5 py-2 rounded-xl border border-[#E6DFD3] text-xs font-semibold bg-[#FBF9F5]"
                      >
                        <option value="Pending Confirmation">Pending Confirmation</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                      {cleanCustomerPhone && (
                        <a
                          href={`https://wa.me/${cleanCustomerPhone}?text=${customerWhatsappText}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          WhatsApp Buyer
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => printOrderPackingSlip(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E6DFD3] hover:border-[#1C1A17] text-xs font-semibold text-[#1C1A17] cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print Slip
                      </button>

                      <span className="text-base font-bold text-[#9E4733] ml-1">
                        {formatPrice(orderTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Courier & Tracking Assignment Bar */}
                  <div className="flex flex-wrap items-center gap-2 bg-[#FBF9F5] p-3 rounded-xl border border-[#E6DFD3] text-xs">
                    <Truck className="w-4 h-4 text-[#9E4733]" />
                    <span className="font-semibold text-[#1C1A17]">Courier Dispatch:</span>
                    <input
                      type="text"
                      value={draft.courierName}
                      onChange={(e) =>
                        setTrackingDrafts((prev) => ({
                          ...prev,
                          [order.id]: { ...draft, courierName: e.target.value },
                        }))
                      }
                      placeholder="TCS / Leopards / PostEx"
                      className="px-2.5 py-1.5 rounded-lg border border-[#E6DFD3] bg-white text-xs w-40"
                    />
                    <input
                      type="text"
                      value={draft.trackingNumber}
                      onChange={(e) =>
                        setTrackingDrafts((prev) => ({
                          ...prev,
                          [order.id]: { ...draft, trackingNumber: e.target.value },
                        }))
                      }
                      placeholder="Tracking Number"
                      className="px-2.5 py-1.5 rounded-lg border border-[#E6DFD3] bg-white text-xs font-mono w-44"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateOrderStatusAdmin(order.id, {
                          courierName: draft.courierName,
                          trackingNumber: draft.trackingNumber,
                        })
                      }
                      className="px-3 py-1.5 rounded-lg bg-[#1C1A17] hover:bg-[#9E4733] text-white font-semibold cursor-pointer"
                    >
                      Save Tracking
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <p className="font-semibold text-[#1C1A17]">Customer: {customerName}</p>
                      <p className="text-[#5C564F]">Phone / WhatsApp: {order.customer?.phone}</p>
                      <p className="text-[#5C564F]">
                        Address: {order.shippingAddress?.addressLine1},{' '}
                        {order.shippingAddress?.city}
                        {order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ''}
                      </p>
                      {(order.orderNotes || order.notes) && (
                        <p className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded mt-1">
                          Note: {order.orderNotes || order.notes}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <p className="font-semibold text-[#1C1A17]">Items Ordered:</p>
                      {(order.items || []).map((item, i) => (
                        <div key={i} className="flex justify-between text-[#5C564F]">
                          <span>
                            {item.name}{' '}
                            {[item.selectedColor, item.selectedSize].filter(Boolean).length > 0
                              ? `(${[item.selectedColor, item.selectedSize]
                                  .filter(Boolean)
                                  .join('/')})`
                              : ''}{' '}
                            × {item.quantity}
                          </span>
                          <span className="font-medium text-[#1C1A17]">
                            {formatPrice(item.lineTotal || item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
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
                setCouponForm({
                  code: '',
                  type: 'percentage',
                  value: '10',
                  minSubtotal: '0',
                  description: '',
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                  Promo Code *
                </label>
                <input
                  type="text"
                  value={couponForm.code}
                  onChange={(e) =>
                    setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g. INSTA15 or EID20"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm uppercase font-mono"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                    Discount Type
                  </label>
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
                  <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                    Discount Value
                  </label>
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
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                  Minimum Order Amount
                </label>
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
                    • Min order: {formatPrice(c.minOrderAmount ?? c.minSubtotal ?? 0)}
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

      {/* TAB: STORE CATEGORIES (DYNAMIC CRUD + R2 IMAGE UPLOAD) */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E6DFD3] space-y-4 h-fit">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-semibold text-[#1C1A17]">
                {editingCategoryId ? 'Edit Category' : 'Create New Store Category'}
              </h3>
              {editingCategoryId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategoryId(null);
                    setCategoryForm({ name: '', tagline: '', subtitle: '', image: '' });
                  }}
                  className="text-xs text-[#9E4733] underline cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            <p className="text-xs text-[#5C564F]">
              Add or update a product category. Changes immediately update the header menu, shop filters, footer, and homepage.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!categoryForm.name.trim()) return;
                await saveCategoryAdmin({
                  ...(editingCategoryId ? { id: editingCategoryId } : {}),
                  name: categoryForm.name.trim(),
                  tagline: categoryForm.tagline.trim(),
                  subtitle: categoryForm.subtitle.trim(),
                  image:
                    categoryForm.image.trim() ||
                    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85',
                });
                setEditingCategoryId(null);
                setCategoryForm({ name: '', tagline: '', subtitle: '', image: '' });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                  Category Name *
                </label>
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
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                  Tagline (Shown on Card)
                </label>
                <input
                  type="text"
                  value={categoryForm.tagline}
                  onChange={(e) => setCategoryForm({ ...categoryForm, tagline: e.target.value })}
                  placeholder="e.g. Handcrafted Leather"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                  Subtitle / Description
                </label>
                <input
                  type="text"
                  value={categoryForm.subtitle}
                  onChange={(e) => setCategoryForm({ ...categoryForm, subtitle: e.target.value })}
                  placeholder="e.g. Wallets, belts and crafted bags"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#1C1A17]">
                    Cover Image (Upload to R2 or URL)
                  </label>
                  <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EFECE6] hover:bg-[#1C1A17] hover:text-white text-[11px] font-semibold cursor-pointer transition-colors">
                    <Upload className="w-3 h-3" />
                    {isUploadingImage ? 'Uploading...' : 'Upload to R2'}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingImage}
                      onChange={handleCategoryImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={categoryForm.image}
                  onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                  placeholder="/api/media/... or https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-xs font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#1C1A17] hover:bg-[#9E4733] text-white text-xs font-semibold uppercase tracking-widest cursor-pointer"
              >
                {editingCategoryId ? 'Update Category' : 'Save Category'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <h3 className="font-serif text-lg font-semibold text-[#1C1A17] mb-2">
              Active Store Categories ({categories.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((c) => (
                <div
                  key={c.id || c.slug}
                  className="bg-white p-4 rounded-2xl border border-[#E6DFD3] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {c.image && (
                      <img
                        src={c.image}
                        alt={c.name}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 bg-[#EFECE6]"
                      />
                    )}
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs text-[#1C1A17] truncate">{c.name}</h4>
                      <p className="text-[11px] text-[#5C564F] truncate">
                        {c.tagline || c.subtitle || `/${c.slug}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategoryId(c.id || c.slug);
                        setCategoryForm({
                          name: c.name || '',
                          tagline: c.tagline || '',
                          subtitle: c.subtitle || '',
                          image: c.image || '',
                        });
                      }}
                      className="p-2 rounded-lg border border-[#E6DFD3] hover:border-[#1C1A17] text-[#1C1A17] cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCategoryAdmin(c.id || c.slug)}
                      className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4.5: CUSTOMER REVIEWS MODERATION */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E6DFD3] p-6">
            <h2 className="font-serif text-2xl font-semibold text-[#1C1A17]">
              Customer Reviews Moderation
            </h2>
            <p className="text-xs text-[#5C564F] mt-1">
              Inspect verified customer reviews stored in Cloudflare D1 (<code className="font-mono">product_reviews</code> table) and remove inappropriate or spam entries.
            </p>
          </div>

          {products.every((p) => !p.reviews || p.reviews.length === 0) ? (
            <div className="bg-white rounded-2xl border border-[#E6DFD3] p-12 text-center">
              <Star className="w-8 h-8 text-[#C59B5F] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#1C1A17]">No customer reviews submitted yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.flatMap((prod) =>
                (prod.reviews || []).map((rev) => (
                  <div
                    key={`${prod.id}-${rev.id}`}
                    className="bg-white rounded-2xl border border-[#E6DFD3] p-5 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            to={`/product/${prod.slug}`}
                            className="text-xs font-semibold text-[#9E4733] hover:underline"
                          >
                            {prod.name}
                          </Link>
                          <p className="text-sm font-semibold text-[#1C1A17] mt-0.5">
                            {rev.title || 'Customer Review'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteProductReviewAdmin(prod.id, rev.id)}
                          className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer shrink-0"
                          title="Delete Review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 text-xs">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-3.5 h-3.5 ${
                              idx < Number(rev.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                            }`}
                          />
                        ))}
                        <span className="text-[11px] text-[#5C564F] ml-1.5">
                          by <strong>{rev.author}</strong> ({rev.location || 'Pakistan'}) · {rev.date}
                        </span>
                      </div>
                      <p className="text-xs text-[#5C564F] leading-relaxed">{rev.comment}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: STORE SETTINGS & SECURITY */}
      {activeTab === 'settings' && (
        <div className="max-w-3xl space-y-8">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const freeThreshold = Number(settingsForm.freeShippingThreshold || 5000);
              const standardFee = Number(settingsForm.standardShippingFee ?? 250);
              const expressFee = Number(settingsForm.expressShippingFee ?? 500);

              await updateSettingsAdmin({
                brandName: settingsForm.brandName,
                brandTagline: settingsForm.brandTagline,
                tagline: settingsForm.brandTagline,
                contactPhone: settingsForm.contactPhone,
                supportPhone: settingsForm.contactPhone,
                contactEmail: settingsForm.contactEmail,
                supportEmail: settingsForm.contactEmail,
                heroBanner: {
                  ...settings.heroBanner,
                  heading: settingsForm.heroHeading,
                  subheading: settingsForm.heroSubheading,
                  image: settingsForm.heroImage || settings.heroBanner?.image,
                },
                lookbookBanner: {
                  ...(settings.lookbookBanner || {}),
                  heading: settingsForm.lookbookHeading,
                  description: settingsForm.lookbookDescription,
                  image: settingsForm.lookbookImage,
                },
                announcement: {
                  enabled: true,
                  message: settingsForm.announcementMessage,
                  highlightCode: settingsForm.announcementCode,
                  ctaText: 'Shop Now',
                  ctaLink: '/shop',
                },
                announcementBar: {
                  enabled: true,
                  message: settingsForm.announcementMessage,
                  ctaLabel: 'Shop Now',
                  ctaLink: '/shop',
                },
                paymentProviders: [
                  settings.paymentProviders?.[0] || {
                    id: 'cod',
                    name: 'Cash on Delivery (COD)',
                  },
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
                  freeShippingThreshold: freeThreshold,
                },
                shipping: {
                  ...settings.shipping,
                  freeShippingThreshold: freeThreshold,
                  methods: [
                    {
                      ...(settings.shipping?.methods?.[0] || {
                        id: 'standard',
                        name: 'Standard Tracked Courier (TCS / Leopards)',
                        eta: '2–4 Working Days',
                        freeAboveThreshold: true,
                      }),
                      price: standardFee,
                    },
                    {
                      ...(settings.shipping?.methods?.[1] || {
                        id: 'express',
                        name: 'Priority Express Delivery',
                        eta: 'Next-Day / 48 Hours',
                        freeAboveThreshold: false,
                      }),
                      price: expressFee,
                    },
                  ],
                },
                googleClientId: (settingsForm.googleClientId || '').trim(),
              });
            }}
            className="bg-white rounded-2xl border border-[#E6DFD3] p-6 sm:p-8 space-y-6"
          >
            <h3 className="font-serif text-2xl font-semibold text-[#1C1A17]">
              Store Branding, Shipping & Homepage Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                  Store Brand Name
                </label>
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
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, brandTagline: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                  Support / WhatsApp Phone
                </label>
                <input
                  type="text"
                  value={settingsForm.contactPhone}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, contactPhone: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  value={settingsForm.contactEmail}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, contactEmail: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                  Top Announcement Banner Message
                </label>
                <input
                  type="text"
                  value={settingsForm.announcementMessage}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, announcementMessage: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                  Banner Promo Code Highlight
                </label>
                <input
                  type="text"
                  value={settingsForm.announcementCode}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, announcementCode: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                  Free Shipping Threshold (PKR)
                </label>
                <input
                  type="number"
                  value={settingsForm.freeShippingThreshold}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, freeShippingThreshold: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                  Standard Courier Rate (PKR)
                </label>
                <input
                  type="number"
                  value={settingsForm.standardShippingFee}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, standardShippingFee: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                  Express Delivery Rate (PKR)
                </label>
                <input
                  type="number"
                  value={settingsForm.expressShippingFee}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, expressShippingFee: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                />
              </div>

              {/* Hero Banner Section */}
              <div className="sm:col-span-2 pt-4 border-t border-[#E6DFD3]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9E4733] mb-3">
                  Homepage Hero Banner
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                      Hero Main Heading
                    </label>
                    <input
                      type="text"
                      value={settingsForm.heroHeading}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, heroHeading: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                      Hero Subheading
                    </label>
                    <input
                      type="text"
                      value={settingsForm.heroSubheading}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, heroSubheading: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-[#1C1A17]">
                        Hero Image (Upload to R2 or URL)
                      </label>
                      <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EFECE6] hover:bg-[#1C1A17] hover:text-white text-[11px] font-semibold cursor-pointer transition-colors">
                        <Upload className="w-3 h-3" />
                        {isUploadingImage ? 'Uploading...' : 'Upload Hero Photo to R2'}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingImage}
                          onChange={handleHeroImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={settingsForm.heroImage}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, heroImage: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Editorial Lookbook Banner Section */}
              <div className="sm:col-span-2 pt-4 border-t border-[#E6DFD3]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9E4733] mb-3">
                  Homepage Editorial Lookbook Banner
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                      Lookbook Heading
                    </label>
                    <input
                      type="text"
                      value={settingsForm.lookbookHeading}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, lookbookHeading: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                      Lookbook Description
                    </label>
                    <input
                      type="text"
                      value={settingsForm.lookbookDescription}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, lookbookDescription: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                      Lookbook Image URL
                    </label>
                    <input
                      type="text"
                      value={settingsForm.lookbookImage}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, lookbookImage: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-xs font-mono"
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
                    <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                      EasyPaisa / JazzCash Number
                    </label>
                    <input
                      type="text"
                      value={settingsForm.walletNumber}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, walletNumber: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                      Account Title
                    </label>
                    <input
                      type="text"
                      value={settingsForm.bankTitle}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, bankTitle: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                      Bank Name / Raast
                    </label>
                    <input
                      type="text"
                      value={settingsForm.bankName}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, bankName: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                      Bank IBAN
                    </label>
                    <input
                      type="text"
                      value={settingsForm.bankIban}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, bankIban: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Google OAuth Sign-In Configuration */}
              <div className="sm:col-span-2 pt-4 border-t border-[#E6DFD3]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9E4733] mb-2">
                  Google OAuth Sign-In (Google Identity Services)
                </h4>
                <p className="text-[11px] text-[#5C564F] mb-2">
                  Optional: Enter your Google Cloud Console OAuth 2.0 Web Client ID (<code className="font-mono">*.apps.googleusercontent.com</code>) to enable Google One-Tap alongside the built-in Google account sign-in selector.
                </p>
                <input
                  type="text"
                  value={settingsForm.googleClientId || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, googleClientId: e.target.value })
                  }
                  placeholder="e.g. 1234567890-abcdefg.apps.googleusercontent.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-xs font-mono"
                />
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
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD3] text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1C1A17] mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
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
