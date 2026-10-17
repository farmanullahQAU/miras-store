-- =============================================================================
-- MIRAS Commerce Engine — Production Normalized 3NF Cloudflare D1 (SQLite) Schema
-- Engineered for high-concurrency edge reads, atomic stock deductions,
-- normalized relational integrity, RBAC security, and sub-millisecond indexed queries.
-- =============================================================================

PRAGMA foreign_keys = ON;

-- 1. Store Settings & Dynamic Brand Configuration
CREATE TABLE IF NOT EXISTS store_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  config_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Dynamic Product Categories
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tagline TEXT DEFAULT '',
  subtitle TEXT DEFAULT '',
  image TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active_sort ON categories(is_active, sort_order ASC);

-- 3. Users (Customers & Store Admins with PBKDF2-SHA256 & OAuth 2.0 Identity)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT DEFAULT '',
  email TEXT NOT NULL UNIQUE,
  phone TEXT DEFAULT '',
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  auth_provider TEXT NOT NULL DEFAULT 'email',
  google_sub TEXT DEFAULT NULL,
  avatar_url TEXT DEFAULT '',
  email_verified INTEGER NOT NULL DEFAULT 0,
  addresses_json TEXT NOT NULL DEFAULT '[]',
  wishlist_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_google_sub ON users(google_sub);

-- 4. Normalized User Shipping Addresses (3NF Relational Table)
CREATE TABLE IF NOT EXISTS user_addresses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT 'Home Residence',
  recipient_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  address_line1 TEXT NOT NULL,
  address_line2 TEXT DEFAULT '',
  city TEXT NOT NULL,
  state TEXT DEFAULT 'Punjab',
  postal_code TEXT DEFAULT '',
  country TEXT NOT NULL DEFAULT 'Pakistan',
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id, is_default DESC);

-- 5. Products Catalog (Core Entity with Indexed Regional Provenance)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  short_description TEXT DEFAULT '',
  description TEXT DEFAULT '',
  category_id TEXT DEFAULT NULL,
  category TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  cultural_origin TEXT NOT NULL DEFAULT 'Pakistan',
  brand TEXT NOT NULL DEFAULT 'MIRAS',
  price INTEGER NOT NULL CHECK (price >= 0),
  original_price INTEGER DEFAULT NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  stock_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock')),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
  featured INTEGER NOT NULL DEFAULT 0,
  is_new INTEGER NOT NULL DEFAULT 1,
  is_best_seller INTEGER NOT NULL DEFAULT 0,
  rating REAL NOT NULL DEFAULT 5.0,
  review_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  images_json TEXT NOT NULL DEFAULT '[]',
  variants_json TEXT NOT NULL DEFAULT '{"colors":[],"sizes":["Standard"],"materials":[]}',
  specifications_json TEXT NOT NULL DEFAULT '{}',
  tags_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status_category_price ON products(status, category_slug, price);
CREATE INDEX IF NOT EXISTS idx_products_status_origin ON products(status, cultural_origin);
CREATE INDEX IF NOT EXISTS idx_products_status_featured ON products(status, featured DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_status_new ON products(status, is_new DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_status_bestseller ON products(status, is_best_seller DESC, rating DESC);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- 6. Normalized Product Media Gallery (3NF Table Linked to Cloudflare R2 Object Keys)
CREATE TABLE IF NOT EXISTS product_images (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  url TEXT NOT NULL,
  r2_key TEXT DEFAULT NULL,
  alt_text TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_sort ON product_images(product_id, sort_order ASC);

-- 7. Normalized Product Variants (3NF Table for Color, Size, Material & Variant SKU/Stock)
CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  variant_type TEXT NOT NULL CHECK (variant_type IN ('color', 'size', 'material')),
  name TEXT NOT NULL,
  hex_code TEXT DEFAULT '',
  sku_suffix TEXT DEFAULT '',
  stock INTEGER NOT NULL DEFAULT 20,
  price_delta INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_type ON product_variants(product_id, variant_type, sort_order ASC);

-- 8. Product Reviews (Normalized for High-Volume Customer Reviews)
CREATE TABLE IF NOT EXISTS product_reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  user_id TEXT DEFAULT NULL,
  author TEXT NOT NULL,
  location TEXT DEFAULT '',
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT DEFAULT '',
  comment TEXT NOT NULL,
  verified_purchase INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_created ON product_reviews(product_id, created_at DESC);

-- 9. Marketing Promo Codes & Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'percentage' CHECK (type IN ('percentage', 'fixed', 'free_shipping')),
  value INTEGER NOT NULL DEFAULT 0,
  min_order_amount INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT DEFAULT NULL,
  description TEXT DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(active, code);

-- 10. Customer Orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT UNIQUE,
  user_id TEXT DEFAULT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_json TEXT NOT NULL,
  shipping_address_json TEXT NOT NULL,
  delivery_method_json TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_method_name TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  payment_reference TEXT DEFAULT NULL,
  order_status TEXT NOT NULL DEFAULT 'Confirmed',
  tracking_number TEXT NOT NULL DEFAULT 'Pending Dispatch',
  courier_name TEXT NOT NULL DEFAULT 'TCS / Leopards',
  subtotal INTEGER NOT NULL DEFAULT 0,
  discount_amount INTEGER NOT NULL DEFAULT 0,
  coupon_code TEXT DEFAULT NULL,
  shipping_cost INTEGER NOT NULL DEFAULT 0,
  tax_amount INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status, created_at DESC);

-- 11. Normalized Order Line Items (For Fast Sales Analytics & Auditing)
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  sku TEXT DEFAULT '',
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  selected_color TEXT DEFAULT '',
  selected_size TEXT DEFAULT '',
  image TEXT DEFAULT '',
  line_total INTEGER NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- 12. Media Assets Registry (Tracks Cloudflare R2 Object Keys & Provides D1 Edge Fallback)
CREATE TABLE IF NOT EXISTS media_assets (
  key TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'image/jpeg',
  size_bytes INTEGER NOT NULL DEFAULT 0,
  storage_driver TEXT NOT NULL DEFAULT 'r2',
  base64_data TEXT DEFAULT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_media_assets_created_at ON media_assets(created_at DESC);
