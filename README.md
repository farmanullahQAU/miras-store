# MIRAS — Modern E-Commerce Storefront & Seller Platform

**MIRAS** ("Heritage & Craft") is a streamlined, production-ready e-commerce platform built with **React 19 + Vite + Tailwind CSS v4** on the frontend and **Cloudflare Workers + Hono + Cloudflare D1 (SQLite)** on the backend.

It is specifically designed so you can list your own products in the Seller Admin Portal, copy direct product links for your Facebook/Instagram/TikTok marketing campaigns, and fulfill customer orders (Cash on Delivery & EasyPaisa/JazzCash/Bank Transfer).

---

## Key Features Included

1. **Streamlined High-Converting Storefront**
   - Clean Hero Campaign Banner, Trust Badges, Featured Categories, and Trending Product Tabs.
   - Instant Search Overlay, Wishlist (`localStorage` + Account sync), and Quick View Modal.
2. **Advanced Shop & Category Filtering (`/shop` & `/category/:slug`)**
   - Filter by **Keyword**, **Category**, **Price Range**, **In-Stock Only**, **On Sale**, **Color Swatches**, and **Sizes**.
   - Sort by Featured, Newest, Best Selling, Price Low-to-High, Price High-to-Low, and Highest Rated.
   - Active filter chips, URL query sync, and responsive mobile filter drawer.
3. **Cart Drawer, Full Cart Page & Express Checkout (`/cart` & `/checkout`)**
   - Real-time Free Shipping progress bar and Promo Code support (`WELCOME10`, `FREESHIP`, plus custom codes you create).
   - **Cash on Delivery (COD)** and **EasyPaisa / JazzCash / Bank Transfer** with Transaction Reference (`TRX ID`) verification.
4. **Customer Profile & Authentication (`/login`, `/register`, `/account`)**
   - Customer sign-in, registration, saved delivery addresses, and order history tracking.
5. **Seller Admin & Marketing Hub (`/admin`)**
   - **List Your Own Products**: Upload product photos directly from your computer/phone or paste image URLs, set prices, sale prices, SKU, stock, sizes, and colors.
   - **1-Click "Clear All Starter Products"**: Wipe the 6 starter showcase products in one click so only your own products are listed.
   - **1-Click "Copy Ad URL"**: Copy the direct product link to paste into your Instagram, Facebook, or TikTok ads.
   - **Order Management**: View customer delivery details, phone/WhatsApp number, ordered items, and update order status (`Pending Confirmation`, `Confirmed`, `Dispatched`, `Delivered`, `Cancelled`).
   - **Marketing Promo Codes & Store Settings**: Create custom discount codes and update your store name, announcement bar, and WhatsApp phone number.
6. **Cloudflare Worker + Hono Backend (`worker/index.js` & `wrangler.jsonc`)**
   - Built with **Hono** (`hono`) for Cloudflare Workers edge deployment.
   - Supports **Cloudflare D1** serverless SQLite database (`worker/schema.sql`) with automatic fallback to edge memory/local state during zero-config local development.

---

## Quick Start (Local Development)

```bash
# 1. Start the Frontend + Hono Backend Dev Server
npm run dev

# Or run the Hono Worker API server alongside Vite:
npm run dev:full
```

### Default Seller Admin Credentials
- **Admin URL**: `/admin` (or `/login`)
- **Email**: `admin@miras.store`
- **Password**: `admin123`

---

## Deploying to Cloudflare Workers + D1

1. **Create a Cloudflare D1 Database (Optional — for persistent SQL storage at the edge)**:
   ```bash
   npx wrangler d1 create miras-store-db
   ```
2. **Uncomment the `d1_databases` section in `wrangler.jsonc`** and paste your `database_id`, then initialize the schema:
   ```bash
   npm run cf:d1:init:remote
   ```
3. **Build and Deploy to Cloudflare Workers**:
   ```bash
   npm run cf:deploy
   ```
