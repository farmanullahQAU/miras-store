/**
 * MIRAS Commerce Engine — Production Cloudflare Worker Backend
 * Built with Hono Framework on Cloudflare Workers, Cloudflare D1 (SQLite), and Cloudflare R2 (Object Storage).
 *
 * Features:
 * - Direct Cloudflare D1 (SQLite) relational persistence for products, categories, orders, reviews, coupons, users, and settings
 * - Direct Cloudflare R2 (Object Storage) for product, category, and banner image uploads & global CDN delivery
 * - Atomic inventory deductions & batch transactions
 * - Web Crypto PBKDF2-SHA256 password security & HMAC-SHA256 JWT tokens
 * - Dynamic /sitemap.xml and /robots.txt generation for Google/Bing search indexing
 * - In-memory fallback for offline/local unit test resilience
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { DEFAULT_BRAND_CONFIG } from '../src/config/brandConfig.js';
import {
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_ORDERS,
} from '../src/data/productsData.js';
import {
  calculateOrderTotals,
  validateCheckoutPayload,
  verifyCartInventory,
} from '../src/utils/commerceEngine.js';

const app = new Hono();

// Edge in-memory fallback state (used when D1/R2 bindings are not attached, e.g. local node tests)
let edgeStoreConfig = structuredClone(DEFAULT_BRAND_CONFIG);
let edgeCategories = structuredClone(DEFAULT_BRAND_CONFIG.categories || []);
let edgeProducts = structuredClone(INITIAL_PRODUCTS);
let edgeCoupons = structuredClone(INITIAL_COUPONS);
let edgeOrders = structuredClone(INITIAL_ORDERS);
let edgeMedia = new Map();
let edgeUsers = [
  {
    id: 'usr-admin-01',
    firstName: 'Store',
    lastName: 'Admin',
    email: 'admin@miras.store',
    phone: '0300 1234567',
    role: 'admin',
    savedAddresses: [],
  },
];

// Security & CORS Middleware
app.use('*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
});

app.use(
  '/api/*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// -----------------------------------------------------------------------------
// Web Crypto Cryptographic Utilities (PBKDF2 & HMAC-SHA256 JWT)
// -----------------------------------------------------------------------------
async function hashPassword(password, saltHex = null) {
  const enc = new TextEncoder();
  const salt = saltHex
    ? Uint8Array.from(saltHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)))
    : crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt']
  );

  const rawKey = await crypto.subtle.exportKey('raw', derivedKey);
  const hashHex = Array.from(new Uint8Array(rawKey))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const saltHexStr = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return { hashHex, saltHex: saltHexStr };
}

async function verifyPassword(password, expectedHashHex, saltHex) {
  const { hashHex } = await hashPassword(password, saltHex);
  return hashHex === expectedHashHex;
}

async function createToken(payload, secret = 'miras-edge-secret-key') {
  const enc = new TextEncoder();
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify({ ...payload, exp: Date.now() + 1000 * 60 * 60 * 24 * 30 })); // 30 days
  const dataToSign = `${header}.${body}`;

  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(dataToSign));
  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
  return `${dataToSign}.${signature}`;
}

// -----------------------------------------------------------------------------
// D1 Database Initialization & One-Time Seeding
// -----------------------------------------------------------------------------
async function seedStarterProductsD1(db) {
  const stmts = INITIAL_PRODUCTS.map((p) =>
    db
      .prepare(
        `INSERT OR REPLACE INTO products (
          id, slug, sku, name, short_description, description,
          category, category_slug, brand, price, original_price,
          stock, stock_status, status, featured, is_new, is_best_seller,
          rating, review_count, images_json, variants_json, specifications_json, tags_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        p.id,
        p.slug,
        p.sku,
        p.name,
        p.shortDescription || '',
        p.description || '',
        p.category || 'Traditional & Cultural',
        p.categorySlug || 'traditional-cultural',
        p.brand || 'MIRAS',
        Number(p.price),
        p.originalPrice ? Number(p.originalPrice) : null,
        Number(p.stock || 20),
        p.stockStatus || 'in_stock',
        p.status || 'published',
        p.featured ? 1 : 0,
        p.isNew ? 1 : 0,
        p.isBestSeller ? 1 : 0,
        Number(p.rating || 5.0),
        Number(p.reviewCount || 0),
        JSON.stringify(p.images || []),
        JSON.stringify(p.variants || { colors: [], sizes: ['Standard'], materials: [] }),
        JSON.stringify(p.specifications || {}),
        JSON.stringify(p.tags || [])
      )
  );
  if (stmts.length > 0) await db.batch(stmts);
}

async function ensureD1Seeded(db) {
  try {
    // Ensure media_assets table exists for R2 metadata & fallback
    await db
      .prepare(
        `CREATE TABLE IF NOT EXISTS media_assets (
          key TEXT PRIMARY KEY,
          filename TEXT NOT NULL,
          content_type TEXT NOT NULL DEFAULT 'image/jpeg',
          size_bytes INTEGER NOT NULL DEFAULT 0,
          storage_driver TEXT NOT NULL DEFAULT 'r2',
          base64_data TEXT DEFAULT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )`
      )
      .run();

    // Check if store_settings row id=1 exists (indicates DB has already been initialized)
    const setting = await db.prepare('SELECT id FROM store_settings WHERE id = 1').first();
    const isFirstTimeInit = !setting;

    if (isFirstTimeInit) {
      await db
        .prepare('INSERT OR IGNORE INTO store_settings (id, config_json) VALUES (1, ?)')
        .bind(JSON.stringify(DEFAULT_BRAND_CONFIG))
        .run();

      // Seed initial products ONLY on first-time initialization so admin deletions stay deleted
      const prodCount = await db.prepare('SELECT COUNT(*) as count FROM products').first('count');
      if (prodCount === 0) {
        await seedStarterProductsD1(db);
      }
    }

    // Ensure categories exist if none present
    const catCount = await db.prepare('SELECT COUNT(*) as count FROM categories').first('count');
    if (catCount === 0) {
      const categories = DEFAULT_BRAND_CONFIG.categories || [];
      const stmts = categories.map((cat, idx) =>
        db
          .prepare(
            `INSERT OR IGNORE INTO categories (id, name, slug, tagline, subtitle, image, sort_order, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, 1)`
          )
          .bind(
            cat.id || `cat-${idx + 1}`,
            cat.name,
            cat.slug,
            cat.tagline || '',
            cat.subtitle || '',
            cat.image || '',
            idx
          )
      );
      if (stmts.length > 0) await db.batch(stmts);
    }

    // Ensure admin user exists
    const adminUser = await db
      .prepare("SELECT id FROM users WHERE email = 'admin@miras.store'")
      .first();
    if (!adminUser) {
      const { hashHex, saltHex } = await hashPassword('admin123');
      await db
        .prepare(
          `INSERT OR IGNORE INTO users (id, first_name, last_name, email, phone, password_hash, password_salt, role)
           VALUES ('usr-admin-01', 'Store', 'Admin', 'admin@miras.store', '0300 1234567', ?, ?, 'admin')`
        )
        .bind(hashHex, saltHex)
        .run();
    }

    // Ensure starter coupons exist on first-time init
    if (isFirstTimeInit) {
      const couponCount = await db.prepare('SELECT COUNT(*) as count FROM coupons').first('count');
      if (couponCount === 0) {
        const stmts = INITIAL_COUPONS.map((cp) =>
          db
            .prepare(
              `INSERT OR IGNORE INTO coupons (id, code, type, value, min_order_amount, description, active)
               VALUES (?, ?, ?, ?, ?, ?, ?)`
            )
            .bind(
              cp.id || `cp-${cp.code}`,
              cp.code,
              cp.type || 'percentage',
              Number(cp.value) || 10,
              Number(cp.minOrderAmount) || 0,
              cp.description || '',
              cp.active ? 1 : 0
            )
        );
        if (stmts.length > 0) await db.batch(stmts);
      }
    }
  } catch (err) {
    console.error('D1 Seeding error (non-fatal):', err);
  }
}

function mapProductRow(r, reviewsByProductId = {}) {
  if (!r) return null;
  const price = Number(r.price);
  const originalPrice = r.original_price ? Number(r.original_price) : null;
  const prodReviews = reviewsByProductId[r.id] || [];
  return {
    id: r.id,
    slug: r.slug,
    sku: r.sku,
    name: r.name,
    shortDescription: r.short_description,
    description: r.description,
    category: r.category,
    categoryName: r.category,
    categorySlug: r.category_slug,
    brand: r.brand,
    price,
    originalPrice,
    compareAtPrice: originalPrice,
    stock: Number(r.stock),
    stockStatus: r.stock_status,
    status: r.status || 'published',
    featured: Boolean(r.featured),
    isFeatured: Boolean(r.featured),
    isNew: Boolean(r.is_new),
    isBestSeller: Boolean(r.is_best_seller),
    rating: Number(r.rating || 5.0),
    reviewCount: prodReviews.length > 0 ? prodReviews.length : Number(r.review_count || 0),
    reviews: prodReviews,
    images:
      typeof r.images_json === 'string' ? JSON.parse(r.images_json) : r.images || [],
    variants:
      typeof r.variants_json === 'string'
        ? JSON.parse(r.variants_json)
        : r.variants || { colors: [], sizes: ['Standard'], materials: [] },
    specifications:
      typeof r.specifications_json === 'string'
        ? JSON.parse(r.specifications_json)
        : r.specifications || {},
    tags: typeof r.tags_json === 'string' ? JSON.parse(r.tags_json) : r.tags || [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapOrderRow(o, itemsByOrderId = {}) {
  if (!o) return null;
  const subtotal = Number(o.subtotal || 0);
  const discountAmount = Number(o.discount_amount || 0);
  const shippingCost = Number(o.shipping_cost || 0);
  const taxAmount = Number(o.tax_amount || 0);
  const total = Number(o.total || 0);
  const orderStatus = o.order_status || 'Confirmed';
  return {
    id: o.id,
    createdAt: o.created_at,
    userId: o.user_id || null,
    customerName: o.customer_name,
    customer: JSON.parse(o.customer_json || '{}'),
    shippingAddress: JSON.parse(o.shipping_address_json || '{}'),
    deliveryMethod: JSON.parse(o.delivery_method_json || '{}'),
    paymentMethod: o.payment_method,
    paymentMethodName: o.payment_method_name,
    paymentStatus: o.payment_status,
    paymentReference: o.payment_reference,
    orderStatus,
    status: orderStatus,
    trackingNumber: o.tracking_number || 'Pending Dispatch',
    courierName: o.courier_name || 'TCS / Leopards',
    subtotal,
    discountAmount,
    couponCode: o.coupon_code,
    shippingCost,
    taxAmount,
    total,
    totals: {
      subtotal,
      discountAmount,
      shippingCost,
      taxAmount,
      total,
    },
    notes: o.notes || '',
    orderNotes: o.notes || '',
    items: itemsByOrderId[o.id] || [],
  };
}

// -----------------------------------------------------------------------------
// 1. Health & Status (D1 + R2 Diagnostics)
// -----------------------------------------------------------------------------
app.get('/api/health', async (c) => {
  const isD1 = Boolean(c.env?.DB);
  const isR2 = Boolean(c.env?.MEDIA_BUCKET);
  let productsCount = edgeProducts.length;
  let ordersCount = edgeOrders.length;
  let categoriesCount = edgeCategories.length;
  let dbStatus = 'memory-fallback';

  if (isD1) {
    try {
      await ensureD1Seeded(c.env.DB);
      const pCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM products').first('count');
      const oCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM orders').first('count');
      const cCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM categories WHERE is_active = 1').first('count');
      productsCount = pCount ?? productsCount;
      ordersCount = oCount ?? ordersCount;
      categoriesCount = cCount ?? categoriesCount;
      dbStatus = 'connected-d1-sqlite';
    } catch (e) {
      dbStatus = `d1-error: ${e.message}`;
    }
  }

  return c.json({
    status: 'ok',
    runtime: 'Cloudflare Workers + Hono',
    brand: edgeStoreConfig.brandName,
    database: dbStatus,
    d1Connected: isD1,
    r2Connected: isR2,
    storageBucket: isR2 ? 'miras-media-assets' : 'd1-edge-fallback',
    productsCount,
    categoriesCount,
    ordersCount,
    timestamp: new Date().toISOString(),
  });
});

// -----------------------------------------------------------------------------
// 2. Cloudflare R2 Media Storage & Upload API (/api/media/*)
// -----------------------------------------------------------------------------
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

app.post('/api/media/upload', async (c) => {
  try {
    const contentTypeHeader = c.req.header('content-type') || '';
    let fileBuffer = null;
    let fileName = 'product-image.jpg';
    let mimeType = 'image/jpeg';

    if (contentTypeHeader.includes('multipart/form-data')) {
      const formData = await c.req.formData();
      const file = formData.get('file');
      if (!file || typeof file === 'string') {
        return c.json({ error: 'No image file provided in form data.' }, 400);
      }
      fileName = file.name || fileName;
      mimeType = file.type || mimeType;
      fileBuffer = await file.arrayBuffer();
    } else {
      const body = await c.req.json();
      if (!body.base64 && !body.dataUrl) {
        return c.json({ error: 'Image payload is required.' }, 400);
      }
      fileName = body.filename || fileName;
      const rawData = body.base64 || body.dataUrl;
      const match = rawData.match(/^data:([^;]+);base64,(.+)$/);
      const base64Clean = match ? match[2] : rawData;
      if (match) mimeType = match[1];
      else if (body.contentType) mimeType = body.contentType;
      const uint8 = base64ToUint8Array(base64Clean);
      fileBuffer = uint8.buffer;
    }

    if (!fileBuffer || fileBuffer.byteLength === 0) {
      return c.json({ error: 'Uploaded file is empty.' }, 400);
    }

    // Limit to 8 MB per image
    if (fileBuffer.byteLength > 8 * 1024 * 1024) {
      return c.json({ error: 'Image exceeds maximum size of 8MB.' }, 413);
    }

    const safeExt = (fileName.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const safeBase = fileName
      .replace(/\.[^/.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 40) || 'image';
    const key = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${safeBase}.${safeExt}`;

    let storageDriver = 'memory';

    // 1. Store in Cloudflare R2 if bound
    if (c.env?.MEDIA_BUCKET) {
      await c.env.MEDIA_BUCKET.put(key, fileBuffer, {
        httpMetadata: {
          contentType: mimeType,
          cacheControl: 'public, max-age=31536000, immutable',
        },
        customMetadata: {
          originalName: fileName,
          uploadedAt: new Date().toISOString(),
        },
      });
      storageDriver = 'r2';
    }

    // 2. Register in Cloudflare D1 media_assets (with base64 backup if R2 is not bound)
    if (c.env?.DB) {
      await ensureD1Seeded(c.env.DB);
      const base64Backup = storageDriver === 'r2' ? null : arrayBufferToBase64(fileBuffer);
      if (storageDriver !== 'r2') storageDriver = 'd1';
      await c.env.DB.prepare(
        `INSERT INTO media_assets (key, filename, content_type, size_bytes, storage_driver, base64_data)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
        .bind(key, fileName, mimeType, fileBuffer.byteLength, storageDriver, base64Backup)
        .run();
    } else {
      edgeMedia.set(key, {
        buffer: fileBuffer,
        contentType: mimeType,
        filename: fileName,
      });
    }

    const url = `/api/media/${key}`;
    return c.json(
      {
        key,
        url,
        filename: fileName,
        contentType: mimeType,
        size: fileBuffer.byteLength,
        storage: storageDriver,
      },
      201
    );
  } catch (err) {
    console.error('Media upload error:', err);
    return c.json({ error: `Image upload failed: ${err.message}` }, 500);
  }
});

app.get('/api/media/:key', async (c) => {
  const key = c.req.param('key');

  // 1. Serve from Cloudflare R2 Bucket
  if (c.env?.MEDIA_BUCKET) {
    try {
      const object = await c.env.MEDIA_BUCKET.get(key);
      if (object) {
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        if (!headers.get('Content-Type')) {
          headers.set('Content-Type', 'image/jpeg');
        }
        return new Response(object.body, { headers });
      }
    } catch (e) {
      console.error('R2 get error:', e);
    }
  }

  // 2. Fallback to D1 media_assets table
  if (c.env?.DB) {
    try {
      const row = await c.env.DB.prepare(
        'SELECT content_type, base64_data FROM media_assets WHERE key = ?'
      )
        .bind(key)
        .first();
      if (row?.base64_data) {
        const bytes = base64ToUint8Array(row.base64_data);
        return new Response(bytes, {
          headers: {
            'Content-Type': row.content_type || 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    } catch (e) {
      console.error('D1 media fallback error:', e);
    }
  }

  // 3. Fallback to in-memory map
  if (edgeMedia.has(key)) {
    const item = edgeMedia.get(key);
    return new Response(item.buffer, {
      headers: {
        'Content-Type': item.contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  return c.json({ error: 'Media asset not found.' }, 404);
});

app.delete('/api/media/:key', async (c) => {
  const key = c.req.param('key');
  if (c.env?.MEDIA_BUCKET) {
    try {
      await c.env.MEDIA_BUCKET.delete(key);
    } catch (e) {
      console.error('R2 delete error:', e);
    }
  }
  if (c.env?.DB) {
    try {
      await c.env.DB.prepare('DELETE FROM media_assets WHERE key = ?').bind(key).run();
    } catch (e) {
      console.error('D1 media delete error:', e);
    }
  }
  edgeMedia.delete(key);
  return c.json({ deleted: true });
});

// -----------------------------------------------------------------------------
// 3. Settings (Dynamic Brand Configuration in D1)
// -----------------------------------------------------------------------------
app.get('/api/settings', async (c) => {
  if (c.env?.DB) {
    try {
      await ensureD1Seeded(c.env.DB);
      const row = await c.env.DB.prepare(
        'SELECT config_json FROM store_settings WHERE id = 1'
      ).first();
      if (row?.config_json) {
        const parsed = JSON.parse(row.config_json);
        edgeStoreConfig = { ...DEFAULT_BRAND_CONFIG, ...parsed };
        return c.json({ config: edgeStoreConfig });
      }
    } catch (e) {
      console.error('Failed reading settings from D1:', e);
    }
  }
  return c.json({ config: edgeStoreConfig });
});

app.put('/api/settings', async (c) => {
  const updates = await c.req.json();

  if (c.env?.DB) {
    try {
      await ensureD1Seeded(c.env.DB);
      const existingRow = await c.env.DB.prepare(
        'SELECT config_json FROM store_settings WHERE id = 1'
      ).first();
      const currentConfig = existingRow?.config_json
        ? JSON.parse(existingRow.config_json)
        : edgeStoreConfig;
      edgeStoreConfig = { ...DEFAULT_BRAND_CONFIG, ...currentConfig, ...updates };

      await c.env.DB.prepare(
        `INSERT INTO store_settings (id, config_json, updated_at)
         VALUES (1, ?, datetime('now'))
         ON CONFLICT(id) DO UPDATE SET config_json = excluded.config_json, updated_at = datetime('now')`
      )
        .bind(JSON.stringify(edgeStoreConfig))
        .run();
      return c.json({ config: edgeStoreConfig });
    } catch (e) {
      console.error('Failed saving settings to D1:', e);
    }
  }

  edgeStoreConfig = { ...edgeStoreConfig, ...updates };
  return c.json({ config: edgeStoreConfig });
});

// -----------------------------------------------------------------------------
// 4. Categories (Full Dynamic CRUD in D1)
// -----------------------------------------------------------------------------
app.get('/api/categories', async (c) => {
  if (c.env?.DB) {
    try {
      await ensureD1Seeded(c.env.DB);
      const rows = await c.env.DB.prepare(
        'SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, created_at ASC'
      ).all();
      if (rows?.results) {
        return c.json({ categories: rows.results });
      }
    } catch (e) {
      console.error('Failed reading categories from D1:', e);
    }
  }
  return c.json({ categories: edgeCategories });
});

app.post('/api/categories', async (c) => {
  const body = await c.req.json();
  if (!body.name || !body.name.trim()) {
    return c.json({ error: 'Category name is required.' }, 400);
  }
  const slug =
    body.slug ||
    body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const newCat = {
    id: body.id || `cat-${Date.now()}`,
    name: body.name.trim(),
    slug,
    tagline: (body.tagline || '').trim(),
    subtitle: (body.subtitle || '').trim(),
    image:
      (body.image || '').trim() ||
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85',
    sort_order: Number(body.sort_order ?? edgeCategories.length),
    is_active: 1,
  };

  if (c.env?.DB) {
    try {
      await ensureD1Seeded(c.env.DB);
      await c.env.DB.prepare(
        `INSERT INTO categories (id, name, slug, tagline, subtitle, image, sort_order, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)
         ON CONFLICT(slug) DO UPDATE SET
           name = excluded.name,
           tagline = excluded.tagline,
           subtitle = excluded.subtitle,
           image = excluded.image,
           is_active = 1`
      )
        .bind(
          newCat.id,
          newCat.name,
          newCat.slug,
          newCat.tagline,
          newCat.subtitle,
          newCat.image,
          newCat.sort_order
        )
        .run();
    } catch (e) {
      console.error('Failed inserting category into D1:', e);
    }
  }

  edgeCategories = [...edgeCategories.filter((cat) => cat.slug !== newCat.slug), newCat];
  return c.json({ category: newCat }, 201);
});

app.put('/api/categories/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const slug =
    body.slug ||
    (body.name
      ? body.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      : undefined);

  if (c.env?.DB) {
    try {
      const existing = await c.env.DB.prepare(
        'SELECT * FROM categories WHERE id = ? OR slug = ?'
      )
        .bind(id, id)
        .first();
      if (!existing) {
        return c.json({ error: 'Category not found.' }, 404);
      }
      const nextName = body.name !== undefined ? body.name.trim() : existing.name;
      const nextSlug = slug || existing.slug;
      const nextTagline = body.tagline !== undefined ? body.tagline.trim() : existing.tagline;
      const nextSubtitle = body.subtitle !== undefined ? body.subtitle.trim() : existing.subtitle;
      const nextImage = body.image !== undefined ? body.image.trim() : existing.image;

      await c.env.DB.prepare(
        `UPDATE categories SET name = ?, slug = ?, tagline = ?, subtitle = ?, image = ? WHERE id = ?`
      )
        .bind(nextName, nextSlug, nextTagline, nextSubtitle, nextImage, existing.id)
        .run();

      // Keep products linked to this category updated
      if (existing.slug !== nextSlug || existing.name !== nextName) {
        await c.env.DB.prepare(
          `UPDATE products SET category = ?, category_slug = ? WHERE category_slug = ?`
        )
          .bind(nextName, nextSlug, existing.slug)
          .run();
      }

      const updated = await c.env.DB.prepare('SELECT * FROM categories WHERE id = ?')
        .bind(existing.id)
        .first();
      return c.json({ category: updated });
    } catch (e) {
      console.error('Failed updating category in D1:', e);
    }
  }

  edgeCategories = edgeCategories.map((cat) =>
    cat.id === id || cat.slug === id ? { ...cat, ...body, ...(slug ? { slug } : {}) } : cat
  );
  return c.json({ category: edgeCategories.find((cat) => cat.id === id || cat.slug === id) });
});

app.delete('/api/categories/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) {
    try {
      await c.env.DB.prepare('DELETE FROM categories WHERE id = ? OR slug = ?')
        .bind(id, id)
        .run();
    } catch (e) {
      console.error('Failed deleting category from D1:', e);
    }
  }
  edgeCategories = edgeCategories.filter((cat) => cat.id !== id && cat.slug !== id);
  return c.json({ deleted: true });
});

// -----------------------------------------------------------------------------
// 5. Products Catalog (Full Dynamic CRUD in D1 + Reviews Aggregation)
// -----------------------------------------------------------------------------
async function loadD1ProductsWithReviews(db) {
  const [prodRows, revRows] = await Promise.all([
    db
      .prepare("SELECT * FROM products WHERE status = 'published' ORDER BY featured DESC, created_at DESC")
      .all(),
    db.prepare('SELECT * FROM product_reviews ORDER BY created_at DESC').all(),
  ]);

  const reviewsByProductId = {};
  for (const rev of revRows?.results || []) {
    if (!reviewsByProductId[rev.product_id]) {
      reviewsByProductId[rev.product_id] = [];
    }
    reviewsByProductId[rev.product_id].push({
      id: rev.id,
      author: rev.author,
      location: rev.location,
      rating: Number(rev.rating),
      date: (rev.created_at || '').slice(0, 10),
      title: rev.title,
      comment: rev.comment,
      verified: Boolean(rev.verified_purchase),
    });
  }

  return (prodRows?.results || []).map((r) => mapProductRow(r, reviewsByProductId));
}

app.get('/api/products', async (c) => {
  if (c.env?.DB) {
    try {
      await ensureD1Seeded(c.env.DB);
      const products = await loadD1ProductsWithReviews(c.env.DB);
      return c.json({ products });
    } catch (e) {
      console.error('Failed reading products from D1:', e);
    }
  }
  return c.json({ products: edgeProducts });
});

app.post('/api/products', async (c) => {
  const body = await c.req.json();
  if (!body.name || body.price === undefined) {
    return c.json({ error: 'Product title and price are required.' }, 400);
  }

  const stock = Math.max(0, Number(body.stock ?? 10));
  const baseSlug =
    body.slug ||
    body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  const id = body.id || `prod-${Date.now()}`;
  const slug = `${baseSlug}-${id.slice(-4)}`;
  const originalPrice =
    body.originalPrice !== undefined && body.originalPrice !== null && body.originalPrice !== ''
      ? Number(body.originalPrice)
      : body.compareAtPrice
      ? Number(body.compareAtPrice)
      : null;

  const newProduct = {
    id,
    slug: body.slug || slug,
    sku: body.sku || `MRS-${Date.now().toString().slice(-4)}`,
    name: body.name.trim(),
    shortDescription: body.shortDescription || body.description?.slice(0, 120) || '',
    description: body.description || '',
    category: body.category || 'Traditional & Cultural',
    categoryName: body.category || 'Traditional & Cultural',
    categorySlug: body.categorySlug || 'traditional-cultural',
    brand: body.brand || 'MIRAS',
    price: Number(body.price),
    originalPrice,
    compareAtPrice: originalPrice,
    stock,
    stockStatus: stock === 0 ? 'out_of_stock' : stock <= 5 ? 'low_stock' : 'in_stock',
    status: body.status || 'published',
    featured: Boolean(body.featured ?? body.isFeatured ?? true),
    isFeatured: Boolean(body.featured ?? body.isFeatured ?? true),
    isNew: body.isNew !== undefined ? Boolean(body.isNew) : true,
    isBestSeller: Boolean(body.isBestSeller),
    rating: Number(body.rating || 5.0),
    reviewCount: Number(body.reviewCount || 0),
    reviews: [],
    images: Array.isArray(body.images) && body.images.length > 0 ? body.images : [],
    variants: body.variants || { colors: [], sizes: ['Standard'], materials: [] },
    specifications: body.specifications || {},
    tags: body.tags || [],
  };

  if (c.env?.DB) {
    try {
      await ensureD1Seeded(c.env.DB);
      await c.env.DB.prepare(
        `INSERT OR REPLACE INTO products (
          id, slug, sku, name, short_description, description,
          category, category_slug, brand, price, original_price,
          stock, stock_status, status, featured, is_new, is_best_seller,
          rating, review_count, images_json, variants_json, specifications_json, tags_json,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
      )
        .bind(
          newProduct.id,
          newProduct.slug,
          newProduct.sku,
          newProduct.name,
          newProduct.shortDescription,
          newProduct.description,
          newProduct.category,
          newProduct.categorySlug,
          newProduct.brand,
          newProduct.price,
          newProduct.originalPrice,
          newProduct.stock,
          newProduct.stockStatus,
          newProduct.status,
          newProduct.featured ? 1 : 0,
          newProduct.isNew ? 1 : 0,
          newProduct.isBestSeller ? 1 : 0,
          newProduct.rating,
          newProduct.reviewCount,
          JSON.stringify(newProduct.images),
          JSON.stringify(newProduct.variants),
          JSON.stringify(newProduct.specifications),
          JSON.stringify(newProduct.tags)
        )
        .run();
    } catch (e) {
      console.error('Failed writing product to D1:', e);
      return c.json({ error: `Database error saving product: ${e.message}` }, 500);
    }
  }

  edgeProducts = [newProduct, ...edgeProducts.filter((p) => p.id !== newProduct.id)];
  return c.json({ product: newProduct }, 201);
});

app.put('/api/products/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const stock = body.stock !== undefined ? Math.max(0, Number(body.stock)) : undefined;

  if (c.env?.DB) {
    try {
      await ensureD1Seeded(c.env.DB);
      const existing = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?')
        .bind(id)
        .first();
      if (!existing) {
        return c.json({ error: 'Product not found.' }, 404);
      }

      const currentMapped = mapProductRow(existing);
      const merged = { ...currentMapped, ...body };
      const updatedStock = stock !== undefined ? stock : Number(merged.stock ?? 0);
      const stockStatus =
        updatedStock === 0 ? 'out_of_stock' : updatedStock <= 5 ? 'low_stock' : 'in_stock';
      const originalPrice =
        body.originalPrice !== undefined
          ? body.originalPrice
            ? Number(body.originalPrice)
            : null
          : body.compareAtPrice !== undefined
          ? body.compareAtPrice
            ? Number(body.compareAtPrice)
            : null
          : currentMapped.originalPrice;

      const featuredFlag =
        body.featured !== undefined
          ? Boolean(body.featured)
          : body.isFeatured !== undefined
          ? Boolean(body.isFeatured)
          : currentMapped.featured;

      await c.env.DB.prepare(
        `UPDATE products SET
          sku = ?, name = ?, price = ?, original_price = ?, stock = ?, stock_status = ?,
          short_description = ?, description = ?, category = ?, category_slug = ?,
          featured = ?, is_new = ?, is_best_seller = ?, images_json = ?, variants_json = ?,
          specifications_json = ?, tags_json = ?, updated_at = datetime('now')
         WHERE id = ?`
      )
        .bind(
          merged.sku || existing.sku,
          merged.name,
          Number(merged.price),
          originalPrice,
          updatedStock,
          stockStatus,
          merged.shortDescription || '',
          merged.description || '',
          merged.category || existing.category,
          merged.categorySlug || existing.category_slug,
          featuredFlag ? 1 : 0,
          merged.isNew ? 1 : 0,
          merged.isBestSeller ? 1 : 0,
          JSON.stringify(merged.images || []),
          JSON.stringify(merged.variants || {}),
          JSON.stringify(merged.specifications || {}),
          JSON.stringify(merged.tags || []),
          id
        )
        .run();

      const freshRow = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?')
        .bind(id)
        .first();
      const updatedProduct = mapProductRow(freshRow);
      edgeProducts = edgeProducts.map((p) => (p.id === id ? updatedProduct : p));
      return c.json({ product: updatedProduct });
    } catch (e) {
      console.error('Failed updating product in D1:', e);
      return c.json({ error: `Failed to update product: ${e.message}` }, 500);
    }
  }

  edgeProducts = edgeProducts.map((p) => {
    if (p.id !== id) return p;
    const nextStock = stock !== undefined ? stock : p.stock;
    return {
      ...p,
      ...body,
      stock: nextStock,
      stockStatus: nextStock === 0 ? 'out_of_stock' : nextStock <= 5 ? 'low_stock' : 'in_stock',
    };
  });
  const updated = edgeProducts.find((p) => p.id === id);
  return c.json({ product: updated });
});

app.delete('/api/products/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) {
    try {
      await c.env.DB.prepare('DELETE FROM product_reviews WHERE product_id = ?').bind(id).run();
      await c.env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
    } catch (e) {
      console.error('Failed deleting product from D1:', e);
    }
  }
  edgeProducts = edgeProducts.filter((p) => p.id !== id);
  return c.json({ deleted: true });
});

app.delete('/api/products', async (c) => {
  if (c.env?.DB) {
    try {
      await c.env.DB.prepare('DELETE FROM product_reviews').run();
      await c.env.DB.prepare('DELETE FROM products').run();
    } catch (e) {
      console.error('Failed clearing products in D1:', e);
    }
  }
  edgeProducts = [];
  return c.json({ cleared: true, products: [] });
});

app.post('/api/products/restore', async (c) => {
  if (c.env?.DB) {
    try {
      await ensureD1Seeded(c.env.DB);
      await seedStarterProductsD1(c.env.DB);
      const products = await loadD1ProductsWithReviews(c.env.DB);
      edgeProducts = products;
      return c.json({ restored: true, products });
    } catch (e) {
      console.error('Failed restoring products in D1:', e);
    }
  }
  edgeProducts = structuredClone(INITIAL_PRODUCTS);
  return c.json({ restored: true, products: edgeProducts });
});

// -----------------------------------------------------------------------------
// 6. Customer Reviews (Stored in D1 product_reviews)
// -----------------------------------------------------------------------------
app.post('/api/products/:id/reviews', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const newReview = {
    id: `rev-${Date.now()}`,
    author: (body.author || 'Verified Customer').trim(),
    location: (body.location || 'Pakistan').trim(),
    rating: Math.max(1, Math.min(5, Number(body.rating) || 5)),
    date: new Date().toISOString().slice(0, 10),
    title: (body.title || '').trim(),
    comment: (body.comment || '').trim(),
  };

  if (c.env?.DB) {
    try {
      await ensureD1Seeded(c.env.DB);
      await c.env.DB.prepare(
        `INSERT INTO product_reviews (id, product_id, author, location, rating, title, comment, verified_purchase)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`
      )
        .bind(
          newReview.id,
          id,
          newReview.author,
          newReview.location,
          newReview.rating,
          newReview.title,
          newReview.comment
        )
        .run();

      const stats = await c.env.DB.prepare(
        'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM product_reviews WHERE product_id = ?'
      )
        .bind(id)
        .first();

      if (stats) {
        await c.env.DB.prepare('UPDATE products SET rating = ?, review_count = ? WHERE id = ?')
          .bind(Number(Number(stats.avg_rating).toFixed(1)), Number(stats.count), id)
          .run();
      }
    } catch (e) {
      console.error('Failed saving review in D1:', e);
    }
  }

  edgeProducts = edgeProducts.map((p) => {
    if (p.id !== id) return p;
    const reviews = [newReview, ...(p.reviews || [])];
    const avg = reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length;
    return {
      ...p,
      reviews,
      reviewCount: reviews.length,
      rating: Number(avg.toFixed(1)),
    };
  });

  return c.json({ review: newReview }, 201);
});

// -----------------------------------------------------------------------------
// 7. Authentication (PBKDF2 Hashing, JWT & Profile Management)
// -----------------------------------------------------------------------------
app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password) {
    return c.json({ error: 'Email and password are required.' }, 400);
  }
  const normalized = email.trim().toLowerCase();

  let user = null;
  if (c.env?.DB) {
    try {
      await ensureD1Seeded(c.env.DB);
      const row = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?')
        .bind(normalized)
        .first();
      if (row) {
        const passwordMatch = await verifyPassword(password, row.password_hash, row.password_salt);
        if (passwordMatch) {
          user = {
            id: row.id,
            firstName: row.first_name,
            lastName: row.last_name,
            email: row.email,
            phone: row.phone,
            role: row.role,
            savedAddresses: JSON.parse(row.addresses_json || '[]'),
          };
        }
      }
    } catch (e) {
      console.error('D1 login error:', e);
    }
  }

  if (!user) {
    const isAdmin = normalized === 'admin@miras.store' || normalized === 'admin@mirasstore.com';
    if (isAdmin && (password === 'admin123' || password === 'admin')) {
      user = {
        id: 'usr-admin-01',
        firstName: 'Store',
        lastName: 'Admin',
        email: normalized,
        phone: '0300 1234567',
        role: 'admin',
        savedAddresses: [],
      };
    } else {
      const edgeMatch = edgeUsers.find((u) => u.email === normalized);
      if (edgeMatch) user = edgeMatch;
    }
  }

  if (!user) {
    return c.json({ error: 'Invalid email or password. Please check your credentials.' }, 401);
  }

  const token = await createToken(
    { userId: user.id, email: user.email, role: user.role },
    c.env?.JWT_SECRET || 'miras-prod-jwt-secret-key-2026-secure'
  );

  return c.json({ user, token });
});

app.post('/api/auth/register', async (c) => {
  const { firstName, lastName, email, phone, password } = await c.req.json();
  if (!firstName || !email || !password) {
    return c.json({ error: 'Name, email, and password are required.' }, 400);
  }
  const normalized = email.trim().toLowerCase();

  const newUser = {
    id: `usr-${Date.now()}`,
    firstName: firstName.trim(),
    lastName: (lastName || '').trim(),
    email: normalized,
    phone: (phone || '').trim(),
    role: 'customer',
    savedAddresses: [],
  };

  if (c.env?.DB) {
    try {
      await ensureD1Seeded(c.env.DB);
      const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?')
        .bind(normalized)
        .first();
      if (existing) {
        return c.json({ error: 'An account with this email already exists.' }, 409);
      }
      const { hashHex, saltHex } = await hashPassword(password);
      await c.env.DB.prepare(
        `INSERT INTO users (id, first_name, last_name, email, phone, password_hash, password_salt, role, addresses_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'customer', '[]')`
      )
        .bind(
          newUser.id,
          newUser.firstName,
          newUser.lastName,
          newUser.email,
          newUser.phone,
          hashHex,
          saltHex
        )
        .run();
    } catch (e) {
      console.error('D1 register error:', e);
    }
  }

  edgeUsers.push(newUser);
  const token = await createToken(
    { userId: newUser.id, email: newUser.email, role: 'customer' },
    c.env?.JWT_SECRET || 'miras-prod-jwt-secret-key-2026-secure'
  );

  return c.json({ user: newUser, token }, 201);
});

app.put('/api/auth/password', async (c) => {
  const { email, newPassword } = await c.req.json();
  if (!email || !newPassword || newPassword.length < 6) {
    return c.json({ error: 'New password must be at least 6 characters.' }, 400);
  }

  if (c.env?.DB) {
    try {
      await ensureD1Seeded(c.env.DB);
      const { hashHex, saltHex } = await hashPassword(newPassword);
      await c.env.DB.prepare(
        'UPDATE users SET password_hash = ?, password_salt = ?, updated_at = datetime("now") WHERE email = ?'
      )
        .bind(hashHex, saltHex, email.trim().toLowerCase())
        .run();
      return c.json({ success: true, message: 'Password updated successfully.' });
    } catch {
      return c.json({ error: 'Failed to update password.' }, 500);
    }
  }
  return c.json({ success: true, message: 'Password updated.' });
});

// -----------------------------------------------------------------------------
// 8. Orders & Atomic Checkout (D1 Batch Transactions & Order Line Items)
// -----------------------------------------------------------------------------
async function loadD1OrdersWithItems(db) {
  const [orderRows, itemRows] = await Promise.all([
    db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 200').all(),
    db.prepare('SELECT * FROM order_items').all(),
  ]);

  const itemsByOrderId = {};
  for (const item of itemRows?.results || []) {
    if (!itemsByOrderId[item.order_id]) {
      itemsByOrderId[item.order_id] = [];
    }
    itemsByOrderId[item.order_id].push({
      id: item.id,
      productId: item.product_id,
      sku: item.sku,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
      selectedColor: item.selected_color,
      selectedSize: item.selected_size,
      image: item.image,
      lineTotal: Number(item.line_total),
    });
  }

  return (orderRows?.results || []).map((o) => mapOrderRow(o, itemsByOrderId));
}

app.get('/api/orders', async (c) => {
  if (c.env?.DB) {
    try {
      await ensureD1Seeded(c.env.DB);
      const orders = await loadD1OrdersWithItems(c.env.DB);
      return c.json({ orders });
    } catch (e) {
      console.error('Failed reading orders from D1:', e);
    }
  }
  return c.json({ orders: edgeOrders });
});

// Public Live Order Tracking by Order ID
app.get('/api/orders/track/:id', async (c) => {
  const id = c.req.param('id').trim().toUpperCase();
  if (c.env?.DB) {
    try {
      const row = await c.env.DB.prepare('SELECT * FROM orders WHERE UPPER(id) = ?')
        .bind(id)
        .first();
      if (row) {
        const itemsRes = await c.env.DB.prepare('SELECT * FROM order_items WHERE order_id = ?')
          .bind(row.id)
          .all();
        const items = (itemsRes?.results || []).map((item) => ({
          id: item.id,
          productId: item.product_id,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
          selectedColor: item.selected_color,
          selectedSize: item.selected_size,
          image: item.image,
          lineTotal: Number(item.line_total),
        }));
        return c.json({
          order: {
            id: row.id,
            createdAt: row.created_at,
            customerName: row.customer_name,
            orderStatus: row.order_status,
            status: row.order_status,
            trackingNumber: row.tracking_number,
            courierName: row.courier_name,
            paymentMethod: row.payment_method,
            paymentStatus: row.payment_status,
            total: Number(row.total),
            shippingAddress: JSON.parse(row.shipping_address_json || '{}'),
            items,
          },
        });
      }
    } catch (e) {
      console.error('Order tracking D1 error:', e);
    }
  }

  const edgeOrder = edgeOrders.find((o) => o.id.toUpperCase() === id);
  if (edgeOrder) {
    return c.json({
      order: {
        id: edgeOrder.id,
        createdAt: edgeOrder.createdAt,
        customerName: `${edgeOrder.customer?.firstName || ''} ${edgeOrder.customer?.lastName || ''}`.trim(),
        orderStatus: edgeOrder.orderStatus || edgeOrder.status || 'Confirmed',
        status: edgeOrder.orderStatus || edgeOrder.status || 'Confirmed',
        trackingNumber: edgeOrder.trackingNumber || 'Pending Dispatch',
        courierName: edgeOrder.courierName || 'TCS / Leopards',
        total: edgeOrder.total ?? edgeOrder.totals?.total ?? 0,
        shippingAddress: edgeOrder.shippingAddress,
        items: edgeOrder.items || [],
      },
    });
  }

  return c.json({ error: `Order #${id} was not found.` }, 404);
});

app.post('/api/orders', async (c) => {
  const payload = await c.req.json();
  const validation = validateCheckoutPayload(payload);
  if (!validation.valid) {
    return c.json({ error: Object.values(validation.errors)[0] }, 400);
  }

  // Load live products, coupons & settings from D1 or edge memory
  let liveProducts = edgeProducts;
  let liveCoupons = edgeCoupons;
  let liveConfig = edgeStoreConfig;

  if (c.env?.DB) {
    try {
      await ensureD1Seeded(c.env.DB);
      const [prodRows, coupRows, settingRow] = await Promise.all([
        c.env.DB.prepare('SELECT * FROM products').all(),
        c.env.DB.prepare('SELECT * FROM coupons WHERE active = 1').all(),
        c.env.DB.prepare('SELECT config_json FROM store_settings WHERE id = 1').first(),
      ]);
      if (prodRows?.results) liveProducts = prodRows.results.map((r) => mapProductRow(r));
      if (coupRows?.results) {
        liveCoupons = coupRows.results.map((cp) => ({
          id: cp.id,
          code: cp.code,
          type: cp.type,
          value: Number(cp.value),
          minOrderAmount: Number(cp.min_order_amount),
          description: cp.description,
          active: Boolean(cp.active),
        }));
      }
      if (settingRow?.config_json) {
        liveConfig = { ...DEFAULT_BRAND_CONFIG, ...JSON.parse(settingRow.config_json) };
      }
    } catch (e) {
      console.error('D1 lookup error during checkout:', e);
    }
  }

  const invCheck = verifyCartInventory(payload.items || [], liveProducts);
  if (!invCheck.valid) {
    return c.json({ error: `${invCheck.issues[0].name}: ${invCheck.issues[0].reason}` }, 409);
  }

  // Authoritative server-side price lookup
  const authoritativeItems = (payload.items || []).map((item) => {
    const prod = liveProducts.find((p) => p.id === item.productId || p.id === item.id);
    return {
      ...item,
      productId: prod.id,
      price: prod.price,
      name: prod.name,
      sku: prod.sku,
      image: prod.images?.[0] || item.image || '',
      lineTotal: prod.price * item.quantity,
    };
  });

  const totals = calculateOrderTotals({
    items: authoritativeItems,
    couponCode: payload.couponCode,
    coupons: liveCoupons,
    shippingMethodId: payload.shippingMethodId,
    shippingConfig: liveConfig.shipping,
    taxConfig: liveConfig.tax,
  });

  const provider =
    (liveConfig.paymentProviders || []).find((p) => p.id === payload.paymentMethod) ||
    liveConfig.paymentProviders?.[0] || { id: 'cod', name: 'Cash on Delivery (COD)' };

  const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const newOrder = {
    id: orderId,
    createdAt: new Date().toISOString(),
    userId: payload.userId || null,
    customerName: `${payload.customer.firstName} ${payload.customer.lastName || ''}`.trim(),
    customer: payload.customer,
    shippingAddress: payload.shippingAddress,
    deliveryMethod: totals.selectedShippingMethod,
    paymentMethod: provider.id,
    paymentMethodName: provider.name,
    paymentStatus:
      provider.id === 'cod'
        ? 'COD — Collect on Delivery'
        : payload.paymentReference
        ? `Transfer Ref: ${payload.paymentReference}`
        : 'Awaiting Transfer Verification',
    paymentReference: payload.paymentReference || null,
    orderStatus: 'Confirmed',
    status: 'Confirmed',
    trackingNumber: 'Pending Dispatch',
    courierName: 'TCS / Leopards',
    items: authoritativeItems,
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
    notes: payload.orderNotes || '',
    orderNotes: payload.orderNotes || '',
  };

  // Atomic D1 execution using batch()
  if (c.env?.DB) {
    try {
      const stmts = [
        c.env.DB.prepare(
          `INSERT INTO orders (
            id, user_id, customer_name, customer_email, customer_phone,
            customer_json, shipping_address_json, delivery_method_json,
            payment_method, payment_method_name, payment_status, payment_reference,
            order_status, tracking_number, courier_name,
            subtotal, discount_amount, coupon_code, shipping_cost, tax_amount, total, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          newOrder.id,
          newOrder.userId,
          newOrder.customerName,
          payload.customer.email || '',
          payload.customer.phone || '',
          JSON.stringify(payload.customer),
          JSON.stringify(payload.shippingAddress),
          JSON.stringify(totals.selectedShippingMethod || {}),
          newOrder.paymentMethod,
          newOrder.paymentMethodName,
          newOrder.paymentStatus,
          newOrder.paymentReference,
          newOrder.orderStatus,
          newOrder.trackingNumber,
          newOrder.courierName,
          newOrder.subtotal,
          newOrder.discountAmount,
          newOrder.couponCode,
          newOrder.shippingCost,
          newOrder.taxAmount,
          newOrder.total,
          newOrder.notes
        ),
      ];

      for (const item of authoritativeItems) {
        stmts.push(
          c.env.DB.prepare(
            `INSERT INTO order_items (id, order_id, product_id, sku, name, price, quantity, selected_color, selected_size, image, line_total)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            newOrder.id,
            item.productId,
            item.sku || '',
            item.name,
            item.price,
            item.quantity,
            item.selectedColor || '',
            item.selectedSize || '',
            item.image || '',
            item.lineTotal
          )
        );

        stmts.push(
          c.env.DB.prepare(
            `UPDATE products SET
              stock = MAX(0, stock - ?),
              stock_status = CASE WHEN stock - ? <= 0 THEN 'out_of_stock' WHEN stock - ? <= 5 THEN 'low_stock' ELSE 'in_stock' END,
              updated_at = datetime('now')
             WHERE id = ?`
          ).bind(item.quantity, item.quantity, item.quantity, item.productId)
        );
      }

      if (newOrder.couponCode) {
        stmts.push(
          c.env.DB.prepare(
            'UPDATE coupons SET used_count = used_count + 1 WHERE code = ?'
          ).bind(newOrder.couponCode)
        );
      }

      await c.env.DB.batch(stmts);
    } catch (e) {
      console.error('Failed saving order with D1 batch:', e);
    }
  }

  edgeProducts = edgeProducts.map((p) => {
    const item = authoritativeItems.find((i) => i.productId === p.id);
    if (!item) return p;
    const nextStock = Math.max(0, p.stock - item.quantity);
    return {
      ...p,
      stock: nextStock,
      stockStatus: nextStock === 0 ? 'out_of_stock' : nextStock <= 5 ? 'low_stock' : 'in_stock',
    };
  });

  edgeOrders = [newOrder, ...edgeOrders];
  return c.json({ order: newOrder }, 201);
});

app.patch('/api/orders/:id', async (c) => {
  const id = c.req.param('id');
  const updates = await c.req.json();

  if (c.env?.DB) {
    try {
      const orderStatus = updates.orderStatus || updates.status || null;
      const trackingNumber = updates.trackingNumber !== undefined ? updates.trackingNumber : null;
      const courierName = updates.courierName !== undefined ? updates.courierName : null;
      const paymentStatus = updates.paymentStatus !== undefined ? updates.paymentStatus : null;

      await c.env.DB.prepare(
        `UPDATE orders SET
          order_status = COALESCE(?, order_status),
          tracking_number = COALESCE(?, tracking_number),
          courier_name = COALESCE(?, courier_name),
          payment_status = COALESCE(?, payment_status),
          updated_at = datetime('now')
         WHERE id = ?`
      )
        .bind(orderStatus, trackingNumber, courierName, paymentStatus, id)
        .run();

      const orders = await loadD1OrdersWithItems(c.env.DB);
      const updatedOrder = orders.find((o) => o.id === id);
      if (updatedOrder) {
        return c.json({ order: updatedOrder });
      }
    } catch (e) {
      console.error('Failed updating order in D1:', e);
    }
  }

  edgeOrders = edgeOrders.map((o) =>
    o.id === id
      ? {
          ...o,
          ...updates,
          orderStatus: updates.orderStatus || updates.status || o.orderStatus,
          status: updates.orderStatus || updates.status || o.status,
        }
      : o
  );
  return c.json({ order: edgeOrders.find((o) => o.id === id) });
});

// -----------------------------------------------------------------------------
// 9. Coupons (Full Dynamic CRUD in D1)
// -----------------------------------------------------------------------------
app.get('/api/coupons', async (c) => {
  if (c.env?.DB) {
    try {
      await ensureD1Seeded(c.env.DB);
      const rows = await c.env.DB.prepare('SELECT * FROM coupons WHERE active = 1').all();
      if (rows?.results) {
        return c.json({
          coupons: rows.results.map((cp) => ({
            id: cp.id,
            code: cp.code,
            type: cp.type,
            value: Number(cp.value),
            minOrderAmount: Number(cp.min_order_amount),
            minSubtotal: Number(cp.min_order_amount),
            usedCount: Number(cp.used_count || 0),
            description: cp.description,
            active: Boolean(cp.active),
          })),
        });
      }
    } catch (e) {
      console.error('Failed reading coupons from D1:', e);
    }
  }
  return c.json({ coupons: edgeCoupons });
});

app.post('/api/coupons', async (c) => {
  const body = await c.req.json();
  const minOrderAmount = Number(body.minOrderAmount ?? body.minSubtotal ?? 0);
  const newCoupon = {
    id: `coup-${Date.now()}`,
    code: (body.code || '').trim().toUpperCase(),
    type: body.type || 'percentage',
    value: Number(body.value) || 10,
    minOrderAmount,
    minSubtotal: minOrderAmount,
    description: body.description || `${body.code} discount`,
    active: true,
  };

  if (c.env?.DB) {
    try {
      await ensureD1Seeded(c.env.DB);
      await c.env.DB.prepare(
        `INSERT OR REPLACE INTO coupons (id, code, type, value, min_order_amount, description, active)
         VALUES (?, ?, ?, ?, ?, ?, 1)`
      )
        .bind(
          newCoupon.id,
          newCoupon.code,
          newCoupon.type,
          newCoupon.value,
          newCoupon.minOrderAmount,
          newCoupon.description
        )
        .run();
    } catch (e) {
      console.error('Failed inserting coupon into D1:', e);
    }
  }

  edgeCoupons = [newCoupon, ...edgeCoupons.filter((cp) => cp.code !== newCoupon.code)];
  return c.json({ coupon: newCoupon }, 201);
});

app.delete('/api/coupons/:id', async (c) => {
  const id = c.req.param('id');
  if (c.env?.DB) {
    try {
      await c.env.DB.prepare('DELETE FROM coupons WHERE id = ? OR code = ?').bind(id, id).run();
    } catch (e) {
      console.error('Failed deleting coupon from D1:', e);
    }
  }
  edgeCoupons = edgeCoupons.filter((cp) => cp.id !== id && cp.code !== id);
  return c.json({ deleted: true });
});

// -----------------------------------------------------------------------------
// 10. Dynamic SEO Sitemap & Robots.txt
// -----------------------------------------------------------------------------
app.get('/robots.txt', (c) => {
  const origin = new URL(c.req.url).origin;
  const txt = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /checkout\nSitemap: ${origin}/sitemap.xml\n`;
  return c.text(txt, 200, { 'Content-Type': 'text/plain; charset=utf-8' });
});

app.get('/sitemap.xml', async (c) => {
  const origin = new URL(c.req.url).origin;
  let prods = edgeProducts;
  let cats = edgeCategories;

  if (c.env?.DB) {
    try {
      const [pRows, cRows] = await Promise.all([
        c.env.DB.prepare("SELECT slug, updated_at FROM products WHERE status = 'published'").all(),
        c.env.DB.prepare('SELECT slug FROM categories WHERE is_active = 1').all(),
      ]);
      if (pRows?.results) prods = pRows.results;
      if (cRows?.results) cats = cRows.results;
    } catch {
      // Fallback
    }
  }

  const urls = [
    { loc: `${origin}/`, priority: '1.0' },
    { loc: `${origin}/shop`, priority: '0.9' },
    { loc: `${origin}/collections/new-arrivals`, priority: '0.8' },
    { loc: `${origin}/collections/best-sellers`, priority: '0.8' },
    { loc: `${origin}/collections/sale`, priority: '0.8' },
    ...cats.map((cat) => ({ loc: `${origin}/category/${cat.slug}`, priority: '0.8' })),
    ...prods.map((p) => ({ loc: `${origin}/product/${p.slug}`, priority: '0.7' })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>daily</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return c.text(xml, 200, { 'Content-Type': 'application/xml; charset=utf-8' });
});

// -----------------------------------------------------------------------------
// 11. Static Assets SPA Fallback
// -----------------------------------------------------------------------------
app.all('*', async (c) => {
  if (c.env?.ASSETS) {
    return c.env.ASSETS.fetch(c.req.raw);
  }
  return c.json({ error: 'Not Found' }, 404);
});

export default app;
