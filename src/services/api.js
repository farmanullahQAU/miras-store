/**
 * MIRAS — Frontend Service Layer connecting to the Hono Cloudflare Worker (/api/*)
 * Persists data to Cloudflare D1 (SQLite) and Cloudflare R2 (Object Storage),
 * with local cache fallback for offline resilience.
 */

import { DEFAULT_BRAND_CONFIG } from '../config/brandConfig.js';
import { INITIAL_PRODUCTS, INITIAL_COUPONS, INITIAL_ORDERS } from '../data/productsData.js';
import {
  calculateOrderTotals,
  validateCheckoutPayload,
  verifyCartInventory,
} from '../utils/commerceEngine.js';

const STORAGE_KEYS = {
  PRODUCTS: 'miras_products_v1',
  CATEGORIES: 'miras_categories_v1',
  ORDERS: 'miras_orders_v1',
  COUPONS: 'miras_coupons_v1',
  CONFIG: 'miras_config_v1',
  AUTH_TOKEN: 'miras_auth_token_v1',
};

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota errors
  }
}

async function requestWorker(endpoint, options = {}) {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `Worker API Error (${response.status})`);
    }
    return await response.json();
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

export const apiService = {
  async uploadMedia(file) {
    if (!file) throw new Error('No file selected.');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const data = await requestWorker('/media/upload', {
        method: 'POST',
        body: formData,
      });
      if (data?.url) {
        return data;
      }
    } catch (err) {
      console.warn('Worker R2 upload fallback to DataURL:', err.message);
    }

    // Offline fallback using FileReader DataURL
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        resolve({
          url: String(reader.result),
          filename: file.name,
          storage: 'local-dataurl',
        });
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });
  },

  async getStoreConfig() {
    try {
      const data = await requestWorker('/settings');
      if (data?.config) {
        writeStorage(STORAGE_KEYS.CONFIG, data.config);
        return data.config;
      }
    } catch {
      // Fallback
    }
    const stored = readStorage(STORAGE_KEYS.CONFIG, null);
    return stored ? { ...DEFAULT_BRAND_CONFIG, ...stored } : DEFAULT_BRAND_CONFIG;
  },

  async updateStoreConfig(updatedConfig) {
    try {
      const data = await requestWorker('/settings', {
        method: 'PUT',
        body: JSON.stringify(updatedConfig),
      });
      if (data?.config) {
        writeStorage(STORAGE_KEYS.CONFIG, data.config);
        return data.config;
      }
    } catch {
      // Fallback
    }
    writeStorage(STORAGE_KEYS.CONFIG, updatedConfig);
    return updatedConfig;
  },

  async getProducts() {
    try {
      const data = await requestWorker('/products');
      if (Array.isArray(data?.products)) {
        writeStorage(STORAGE_KEYS.PRODUCTS, data.products);
        return data.products;
      }
    } catch {
      // Fallback
    }
    const local = readStorage(STORAGE_KEYS.PRODUCTS, null);
    if (local === null) {
      writeStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    return local;
  },

  async saveProduct(productData) {
    try {
      const isUpdating = Boolean(productData.id);
      const method = isUpdating ? 'PUT' : 'POST';
      const endpoint = isUpdating ? `/products/${productData.id}` : '/products';
      const data = await requestWorker(endpoint, {
        method,
        body: JSON.stringify(productData),
      });
      if (data?.product) {
        const current = readStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
        const exists = current.some((p) => p.id === data.product.id);
        const next = exists
          ? current.map((p) => (p.id === data.product.id ? data.product : p))
          : [data.product, ...current];
        writeStorage(STORAGE_KEYS.PRODUCTS, next);
        return data.product;
      }
    } catch {
      // Fallback to local storage when offline
    }

    const products = await this.getProducts();
    const slug =
      productData.slug ||
      productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    const stockNum = Math.max(0, Number(productData.stock ?? 10));
    const stockStatus =
      stockNum === 0 ? 'out_of_stock' : stockNum <= 5 ? 'low_stock' : 'in_stock';

    if (productData.id && products.some((p) => p.id === productData.id)) {
      const updated = products.map((p) =>
        p.id === productData.id ? { ...p, ...productData, slug, stock: stockNum, stockStatus } : p
      );
      writeStorage(STORAGE_KEYS.PRODUCTS, updated);
      return updated.find((p) => p.id === productData.id);
    } else {
      const newProduct = {
        ...productData,
        id: `prod-${Date.now()}`,
        slug,
        stock: stockNum,
        stockStatus,
        rating: 5.0,
        reviewCount: 0,
        reviews: [],
        status: productData.status || 'published',
      };
      const updated = [newProduct, ...products];
      writeStorage(STORAGE_KEYS.PRODUCTS, updated);
      return newProduct;
    }
  },

  async deleteProduct(productId) {
    try {
      await requestWorker(`/products/${productId}`, { method: 'DELETE' });
    } catch {
      // Fallback
    }
    const products = readStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    writeStorage(
      STORAGE_KEYS.PRODUCTS,
      products.filter((p) => p.id !== productId)
    );
    return true;
  },

  async clearAllProducts() {
    try {
      await requestWorker('/products', { method: 'DELETE' });
    } catch {
      // Fallback
    }
    writeStorage(STORAGE_KEYS.PRODUCTS, []);
    return [];
  },

  async restoreSampleProducts() {
    try {
      const data = await requestWorker('/products/restore', { method: 'POST' });
      if (Array.isArray(data?.products)) {
        writeStorage(STORAGE_KEYS.PRODUCTS, data.products);
        return data.products;
      }
    } catch {
      // Fallback
    }
    writeStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  },

  async addProductReview(productId, reviewPayload) {
    try {
      const data = await requestWorker(`/products/${productId}/reviews`, {
        method: 'POST',
        body: JSON.stringify(reviewPayload),
      });
      if (data?.review) {
        return data.review;
      }
    } catch {
      // Fallback
    }

    const products = await this.getProducts();
    const newReview = {
      id: `rev-${Date.now()}`,
      author: reviewPayload.author.trim(),
      location: reviewPayload.location?.trim() || '',
      rating: Number(reviewPayload.rating) || 5,
      date: new Date().toISOString().slice(0, 10),
      title: reviewPayload.title.trim(),
      comment: reviewPayload.comment.trim(),
    };

    const updated = products.map((p) => {
      if (p.id !== productId) return p;
      const reviews = [newReview, ...(p.reviews || [])];
      const avg =
        reviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / Math.max(1, reviews.length);
      return {
        ...p,
        reviews,
        reviewCount: reviews.length,
        rating: Number(avg.toFixed(1)),
      };
    });

    writeStorage(STORAGE_KEYS.PRODUCTS, updated);
    return newReview;
  },

  async getOrders() {
    try {
      const data = await requestWorker('/orders');
      if (Array.isArray(data?.orders)) {
        writeStorage(STORAGE_KEYS.ORDERS, data.orders);
        return data.orders;
      }
    } catch {
      // Fallback
    }
    return readStorage(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  },

  async createOrder(checkoutPayload) {
    const validation = validateCheckoutPayload(checkoutPayload);
    if (!validation.valid) {
      throw new Error(
        Object.values(validation.errors)[0] || 'Please fill in all required fields.'
      );
    }

    try {
      const serverRes = await requestWorker('/orders', {
        method: 'POST',
        body: JSON.stringify(checkoutPayload),
      });
      if (serverRes?.order) {
        return serverRes.order;
      }
    } catch (err) {
      if (err.message && (err.message.includes('stock') || err.message.includes('available'))) {
        throw err;
      }
    }

    const products = await this.getProducts();
    const coupons = await this.getCoupons();
    const config = await this.getStoreConfig();

    const inventoryCheck = verifyCartInventory(checkoutPayload.items, products);
    if (!inventoryCheck.valid) {
      throw new Error(`${inventoryCheck.issues[0].name}: ${inventoryCheck.issues[0].reason}`);
    }

    const totals = calculateOrderTotals({
      items: checkoutPayload.items,
      couponCode: checkoutPayload.couponCode,
      coupons,
      shippingMethodId: checkoutPayload.shippingMethodId,
      shippingConfig: config.shipping,
      taxConfig: config.tax,
    });

    const provider =
      config.paymentProviders.find((p) => p.id === checkoutPayload.paymentMethod) ||
      config.paymentProviders[0];

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: orderId,
      createdAt: new Date().toISOString(),
      userId: checkoutPayload.userId || null,
      customer: checkoutPayload.customer,
      shippingAddress: checkoutPayload.shippingAddress,
      deliveryMethod: totals.selectedShippingMethod,
      paymentMethod: provider.id,
      paymentMethodName: provider.name,
      paymentStatus:
        provider.id === 'cod'
          ? 'COD — Collect on Delivery'
          : checkoutPayload.paymentReference
          ? `Transfer Ref: ${checkoutPayload.paymentReference}`
          : 'Awaiting Transfer Screenshot',
      paymentReference: checkoutPayload.paymentReference || null,
      orderStatus: 'Confirmed',
      status: 'Confirmed',
      trackingNumber: 'Pending Dispatch',
      courierName: 'TCS / Leopards',
      items: checkoutPayload.items,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      couponCode: totals.couponResult?.valid ? totals.couponResult.coupon.code : null,
      shippingCost: totals.shippingCost,
      taxAmount: totals.taxAmount,
      total: totals.total,
      totals: {
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        shippingCost: totals.shippingCost,
        taxAmount: totals.taxAmount,
        total: totals.total,
      },
      notes: checkoutPayload.orderNotes || '',
      orderNotes: checkoutPayload.orderNotes || '',
    };

    const updatedProducts = products.map((p) => {
      const cartItem = checkoutPayload.items.find((i) => i.productId === p.id);
      if (!cartItem) return p;
      const newStock = Math.max(0, p.stock - cartItem.quantity);
      return {
        ...p,
        stock: newStock,
        stockStatus: newStock === 0 ? 'out_of_stock' : newStock <= 5 ? 'low_stock' : 'in_stock',
      };
    });
    writeStorage(STORAGE_KEYS.PRODUCTS, updatedProducts);

    const existingOrders = await this.getOrders();
    writeStorage(STORAGE_KEYS.ORDERS, [newOrder, ...existingOrders]);
    return newOrder;
  },

  async updateOrderStatus(orderId, updates) {
    try {
      const res = await requestWorker(`/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      if (res?.order) {
        return res.order;
      }
    } catch {
      // Fallback
    }
    const orders = await this.getOrders();
    const updated = orders.map((o) => (o.id === orderId ? { ...o, ...updates } : o));
    writeStorage(STORAGE_KEYS.ORDERS, updated);
    return updated.find((o) => o.id === orderId);
  },

  async getCoupons() {
    try {
      const data = await requestWorker('/coupons');
      if (Array.isArray(data?.coupons)) {
        writeStorage(STORAGE_KEYS.COUPONS, data.coupons);
        return data.coupons;
      }
    } catch {
      // Fallback
    }
    return readStorage(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
  },

  async saveCoupon(couponData) {
    const code = couponData.code.trim().toUpperCase();
    try {
      const data = await requestWorker('/coupons', {
        method: 'POST',
        body: JSON.stringify({
          ...couponData,
          code,
          minOrderAmount: Number(couponData.minOrderAmount ?? couponData.minSubtotal ?? 0),
        }),
      });
      if (data?.coupon) {
        const coupons = await this.getCoupons();
        writeStorage(STORAGE_KEYS.COUPONS, [
          data.coupon,
          ...coupons.filter((c) => c.code !== code),
        ]);
        return data.coupon;
      }
    } catch {
      // Fallback to local storage
    }

    const coupons = await this.getCoupons();
    if (couponData.id && coupons.some((c) => c.id === couponData.id)) {
      const updated = coupons.map((c) =>
        c.id === couponData.id ? { ...c, ...couponData, code } : c
      );
      writeStorage(STORAGE_KEYS.COUPONS, updated);
      return updated.find((c) => c.id === couponData.id);
    }
    const newCoupon = {
      id: `coup-${Date.now()}`,
      code,
      type: couponData.type || 'percentage',
      value: Number(couponData.value) || 10,
      minOrderAmount: Number(couponData.minOrderAmount ?? couponData.minSubtotal ?? 0),
      description: couponData.description || `${code} discount`,
      active: true,
    };
    writeStorage(STORAGE_KEYS.COUPONS, [newCoupon, ...coupons]);
    return newCoupon;
  },

  async deleteCoupon(couponIdOrCode) {
    try {
      await requestWorker(`/coupons/${couponIdOrCode}`, { method: 'DELETE' });
    } catch {
      // Fallback
    }
    const coupons = await this.getCoupons();
    writeStorage(
      STORAGE_KEYS.COUPONS,
      coupons.filter((c) => c.id !== couponIdOrCode && c.code !== couponIdOrCode)
    );
    return true;
  },

  async getCategories() {
    try {
      const data = await requestWorker('/categories');
      if (Array.isArray(data?.categories)) {
        writeStorage(STORAGE_KEYS.CATEGORIES, data.categories);
        return data.categories;
      }
    } catch {
      // Fallback
    }
    return readStorage(STORAGE_KEYS.CATEGORIES, DEFAULT_BRAND_CONFIG.categories || []);
  },

  async saveCategory(categoryData) {
    try {
      const isEditing = Boolean(categoryData.id);
      const data = await requestWorker(
        isEditing ? `/categories/${categoryData.id}` : '/categories',
        {
          method: isEditing ? 'PUT' : 'POST',
          body: JSON.stringify(categoryData),
        }
      );
      if (data?.category) return data.category;
    } catch {
      // Fallback
    }
    return categoryData;
  },

  async deleteCategory(categoryIdOrSlug) {
    try {
      await requestWorker(`/categories/${categoryIdOrSlug}`, { method: 'DELETE' });
    } catch {
      // Fallback
    }
    const current = readStorage(STORAGE_KEYS.CATEGORIES, DEFAULT_BRAND_CONFIG.categories || []);
    writeStorage(
      STORAGE_KEYS.CATEGORIES,
      current.filter((c) => c.id !== categoryIdOrSlug && c.slug !== categoryIdOrSlug)
    );
    return true;
  },

  async login(credentials) {
    const data = await requestWorker('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (data?.token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
    }
    return data;
  },

  async register(userData) {
    const data = await requestWorker('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data?.token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
    }
    return data;
  },

  async trackOrder(orderId) {
    return await requestWorker(`/orders/track/${encodeURIComponent(orderId)}`);
  },

  async changePassword(payload) {
    return await requestWorker('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};
