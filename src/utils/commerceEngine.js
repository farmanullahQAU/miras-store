/**
 * MIRAS — Core Commerce Engine
 * Shared across React UI, Cloudflare Worker (Hono), and Automated Tests.
 */

import { DEFAULT_BRAND_CONFIG } from '../config/brandConfig.js';

export function validateCouponCode(code, subtotal, coupons = []) {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: 'Please enter a valid promo code.' };
  }
  const normalized = code.trim().toUpperCase();
  const coupon = coupons.find((c) => c.code.toUpperCase() === normalized);

  if (!coupon) {
    return { valid: false, error: `Promo code "${normalized}" is invalid.` };
  }
  if (!coupon.active) {
    return { valid: false, error: `Promo code "${normalized}" is no longer active.` };
  }
  if (subtotal < (coupon.minOrderAmount || 0)) {
    return {
      valid: false,
      error: `Code "${normalized}" requires a minimum order of Rs. ${Number(coupon.minOrderAmount).toLocaleString()}.`,
    };
  }

  let discountAmount = 0;
  if (coupon.type === 'percentage') {
    discountAmount = Math.round((subtotal * Number(coupon.value)) / 100);
  } else if (coupon.type === 'fixed') {
    discountAmount = Math.min(subtotal, Number(coupon.value));
  }

  return {
    valid: true,
    coupon,
    discountAmount,
    freeShipping: coupon.type === 'free_shipping',
    message: coupon.description || `Promo code ${coupon.code} applied.`,
  };
}

export function calculateOrderTotals({
  items = [],
  couponCode = '',
  coupons = [],
  shippingMethodId = 'standard',
  shippingConfig = DEFAULT_BRAND_CONFIG.shipping,
  taxConfig = DEFAULT_BRAND_CONFIG.tax,
}) {
  const subtotal = items.reduce((sum, item) => {
    const price = Math.max(0, Number(item.price) || 0);
    const qty = Math.max(0, Math.floor(Number(item.quantity) || 0));
    return sum + price * qty;
  }, 0);

  const itemCount = items.reduce(
    (sum, item) => sum + Math.max(0, Math.floor(Number(item.quantity) || 0)),
    0
  );

  if (subtotal === 0 || itemCount === 0) {
    return {
      itemCount: 0,
      subtotal: 0,
      discountAmount: 0,
      discountedSubtotal: 0,
      shippingCost: 0,
      taxAmount: 0,
      total: 0,
      freeShippingThreshold: shippingConfig.freeShippingThreshold,
      amountUntilFreeShipping: shippingConfig.freeShippingThreshold,
      qualifiesForFreeShipping: false,
      couponResult: null,
    };
  }

  let discountAmount = 0;
  let couponFreeShipping = false;
  let couponResult = null;

  if (couponCode && couponCode.trim()) {
    couponResult = validateCouponCode(couponCode, subtotal, coupons);
    if (couponResult.valid) {
      discountAmount = couponResult.discountAmount;
      couponFreeShipping = couponResult.freeShipping;
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const methods = shippingConfig?.methods || DEFAULT_BRAND_CONFIG.shipping.methods;
  const selectedMethod = methods.find((m) => m.id === shippingMethodId) || methods[0];
  const threshold = Number(shippingConfig?.freeShippingThreshold ?? 5000);
  const qualifiesByThreshold = discountedSubtotal >= threshold;

  let shippingCost = Number(selectedMethod?.price || 0);
  if (
    (qualifiesByThreshold && selectedMethod?.freeAboveThreshold) ||
    (couponFreeShipping && selectedMethod?.id === 'standard')
  ) {
    shippingCost = 0;
  }

  const taxRate = taxConfig?.enabled ? Number(taxConfig.ratePercentage || 0) : 0;
  const taxAmount = taxConfig?.includedInDisplayedPrice
    ? 0
    : Math.round((discountedSubtotal * taxRate) / 100);

  const total = Math.max(0, discountedSubtotal + shippingCost + taxAmount);

  return {
    itemCount,
    subtotal,
    discountAmount,
    discountedSubtotal,
    shippingCost,
    selectedShippingMethod: selectedMethod,
    taxAmount,
    total,
    freeShippingThreshold: threshold,
    amountUntilFreeShipping: Math.max(0, threshold - discountedSubtotal),
    qualifiesForFreeShipping: qualifiesByThreshold || couponFreeShipping,
    couponResult,
  };
}

export function filterAndSortProducts(products = [], filters = {}) {
  const {
    searchQuery = '',
    category = '',
    collection = '',
    brand = '',
    color = '',
    size = '',
    material = '',
    minPrice = null,
    maxPrice = null,
    inStockOnly = false,
    onSaleOnly = false,
    newArrivalsOnly = false,
    includeUnpublished = false,
    sortBy = 'featured',
  } = filters;

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filtered = products.filter((product) => {
    if (!includeUnpublished && product.status && product.status !== 'published') return false;

    if (category && category !== 'all') {
      if (
        product.categorySlug !== category &&
        (product.category || '').toLowerCase() !== category.toLowerCase()
      ) {
        return false;
      }
    }

    if (collection && collection !== 'all') {
      if (collection === 'sale') {
        const orig = product.originalPrice || product.compareAtPrice;
        if (!orig || orig <= product.price) return false;
      } else if (collection === 'new-arrivals') {
        if (!product.isNew && !(product.collections || []).includes('new-arrivals')) return false;
      } else if (collection === 'best-sellers') {
        if (!product.isBestSeller && !(product.collections || []).includes('best-sellers')) return false;
      } else if (collection === 'trending') {
        if (!product.isTrending && !product.featured && !(product.collections || []).includes('trending')) return false;
      } else if (!(product.collections || []).includes(collection)) {
        return false;
      }
    }

    if (brand && brand !== 'all') {
      if ((product.brand || '').toLowerCase() !== brand.toLowerCase()) {
        return false;
      }
    }

    if (color) {
      const colors = product.variants?.colors || product.colors || [];
      if (!colors.some((c) => (c.name || '').toLowerCase().includes(color.toLowerCase()))) {
        return false;
      }
    }

    if (size) {
      const sizes = product.variants?.sizes || product.sizes || [];
      if (!sizes.some((s) => s.toLowerCase() === size.toLowerCase() || s.toLowerCase().includes(size.toLowerCase()))) {
        return false;
      }
    }

    if (material) {
      const materials = product.variants?.materials || (product.materials ? [product.materials] : []);
      if (!materials.some((m) => m.toLowerCase().includes(material.toLowerCase()))) {
        return false;
      }
    }

    if (minPrice !== null && minPrice !== '' && !Number.isNaN(Number(minPrice))) {
      if (product.price < Number(minPrice)) return false;
    }

    if (maxPrice !== null && maxPrice !== '' && !Number.isNaN(Number(maxPrice))) {
      if (product.price > Number(maxPrice)) return false;
    }

    if (inStockOnly && ((product.stock || 0) <= 0 || product.stockStatus === 'out_of_stock')) {
      return false;
    }

    if (onSaleOnly) {
      const orig = product.originalPrice || product.compareAtPrice;
      if (!orig || orig <= product.price) return false;
    }

    if (newArrivalsOnly && !product.isNew) {
      return false;
    }

    if (normalizedQuery) {
      const searchable = [
        product.name,
        product.shortDescription,
        product.description,
        product.category,
        product.brand,
        product.sku,
        ...(product.tags || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const terms = normalizedQuery.split(/\s+/);
      if (!terms.every((t) => searchable.includes(t))) return false;
    }

    return true;
  });

  const sorted = [...filtered];
  switch (sortBy) {
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'newest':
      sorted.sort((a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)));
      break;
    case 'popular':
    case 'rating':
      sorted.sort(
        (a, b) =>
          (b.rating || 0) * 100 + (b.reviewCount || 0) - ((a.rating || 0) * 100 + (a.reviewCount || 0))
      );
      break;
    case 'featured':
    default:
      sorted.sort(
        (a, b) =>
          Number(Boolean(b.featured ?? b.isFeatured)) - Number(Boolean(a.featured ?? a.isFeatured))
      );
      break;
  }

  return sorted;
}

export function validateCheckoutPayload(payload = {}) {
  const errors = {};
  const { customer = {}, shippingAddress = {}, paymentMethod = '' } = payload;

  if (!customer.firstName || customer.firstName.trim().length < 2) {
    errors.firstName = 'Please enter your name.';
  }
  const phoneClean = (customer.phone || '').replace(/[\s()-]/g, '');
  if (!phoneClean || phoneClean.length < 9) {
    errors.phone = 'Please enter an active mobile / WhatsApp number for delivery.';
  }
  if (!shippingAddress.addressLine1 || shippingAddress.addressLine1.trim().length < 5) {
    errors.addressLine1 = 'Complete house / flat and street address is required.';
  }
  if (!shippingAddress.city || shippingAddress.city.trim().length < 2) {
    errors.city = 'City name is required.';
  }
  if (!paymentMethod) {
    errors.paymentMethod = 'Please choose a payment method.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function verifyCartInventory(cartItems = [], catalogProducts = []) {
  const issues = [];
  for (const item of cartItems) {
    const product = catalogProducts.find((p) => p.id === item.productId || p.id === item.id);
    if (!product || product.status !== 'published') {
      issues.push({
        itemId: item.productId || item.id,
        name: item.name,
        reason: 'This item is no longer available.',
      });
      continue;
    }
    if (product.stock <= 0 || product.stockStatus === 'out_of_stock') {
      issues.push({
        itemId: product.id,
        name: product.name,
        reason: 'Currently out of stock.',
      });
      continue;
    }
    if (item.quantity > product.stock) {
      issues.push({
        itemId: product.id,
        name: product.name,
        reason: `Only ${product.stock} unit(s) available in stock.`,
        availableStock: product.stock,
      });
    }
  }
  return {
    valid: issues.length === 0,
    issues,
  };
}

export function getEstimatedDeliveryRange(minDays = 2, maxDays = 4) {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  start.setDate(now.getDate() + minDays);
  end.setDate(now.getDate() + maxDays);

  const fmt = (d) =>
    d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

  return `${fmt(start)} – ${fmt(end)}`;
}

