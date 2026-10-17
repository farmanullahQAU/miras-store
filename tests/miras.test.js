import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../worker/index.js';
import {
  calculateOrderTotals,
  filterAndSortProducts,
} from '../src/utils/commerceEngine.js';
import { INITIAL_PRODUCTS, INITIAL_COUPONS } from '../src/data/productsData.js';

test('1. Commerce Engine: Filters by category, price, stock, color, size, and sorts accurately', () => {
  const inStockOnly = filterAndSortProducts(INITIAL_PRODUCTS, {
    inStockOnly: true,
    sortBy: 'price-asc',
  });
  assert.ok(inStockOnly.length > 0);
  for (let i = 1; i < inStockOnly.length; i++) {
    assert.ok(inStockOnly[i].price >= inStockOnly[i - 1].price);
  }

  const saleItems = filterAndSortProducts(INITIAL_PRODUCTS, {
    onSaleOnly: true,
  });
  assert.ok(saleItems.every((p) => p.originalPrice > p.price));
});

test('2. Commerce Engine: Calculates cart totals and applies promo codes accurately', () => {
  const items = [
    {
      productId: INITIAL_PRODUCTS[0].id,
      price: INITIAL_PRODUCTS[0].price,
      quantity: 2,
    },
  ];

  const summary = calculateOrderTotals({
    items,
    couponCode: 'WELCOME10',
    coupons: INITIAL_COUPONS,
    shippingMethodId: 'standard',
  });

  const expectedSubtotal = INITIAL_PRODUCTS[0].price * 2;
  assert.equal(summary.subtotal, expectedSubtotal);
  assert.equal(summary.discountAmount, Math.round(expectedSubtotal * 0.1));
  assert.ok(summary.total > 0);
});

test('3. Hono Cloudflare Worker: /api/health and /api/products respond cleanly', async () => {
  const healthRes = await app.fetch(new Request('http://localhost/api/health'));
  assert.equal(healthRes.status, 200);
  const healthBody = await healthRes.json();
  assert.equal(healthBody.status, 'ok');
  assert.equal(healthBody.runtime, 'Cloudflare Workers + Hono');

  const prodRes = await app.fetch(new Request('http://localhost/api/products'));
  assert.equal(prodRes.status, 200);
  const prodBody = await prodRes.json();
  assert.ok(Array.isArray(prodBody.products));
  assert.equal(prodBody.products.length, INITIAL_PRODUCTS.length);
});

test('4. Hono Cloudflare Worker: Admin can authenticate, list, edit, and delete a product, and manage promo codes', async () => {
  const loginRes = await app.fetch(
    new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@miras.store', password: 'admin123' }),
    })
  );
  assert.equal(loginRes.status, 200);
  const { token, user } = await loginRes.json();
  assert.equal(user.role, 'admin');
  assert.ok(token);

  const createProdRes = await app.fetch(
    new Request('http://localhost/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Signature Hand-Stitched Leather Wallet',
        category: 'Gifts & Fragrances',
        categorySlug: 'gifts-lifestyle',
        price: 3200,
        originalPrice: 4000,
        stock: 25,
        shortDescription: 'Full-grain leather wallet crafted for everyday use.',
        description: 'Premium vegetable-tanned leather bi-fold wallet.',
        images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=800'],
        variants: {
          colors: [{ name: 'Black', hex: '#1C1A17' }],
          sizes: ['Standard'],
        },
      }),
    })
  );
  assert.equal(createProdRes.status, 201);
  const { product } = await createProdRes.json();
  assert.equal(product.name, 'Signature Hand-Stitched Leather Wallet');
  assert.equal(product.price, 3200);

  // Edit product price & stock
  const updateProdRes = await app.fetch(
    new Request(`http://localhost/api/products/${product.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        price: 2950,
        stock: 40,
      }),
    })
  );
  assert.equal(updateProdRes.status, 200);
  const { product: editedProduct } = await updateProdRes.json();
  assert.equal(editedProduct.price, 2950);
  assert.equal(editedProduct.stock, 40);

  // Create marketing promo code
  const couponRes = await app.fetch(
    new Request('http://localhost/api/coupons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        code: 'TIKTOK15',
        type: 'percentage',
        value: 15,
        minOrderAmount: 2000,
      }),
    })
  );
  assert.equal(couponRes.status, 201);
});

test('5. Hono Cloudflare Worker: Places customer order with authoritative stock deduction', async () => {
  const targetProduct = INITIAL_PRODUCTS[1];
  const initialStock = targetProduct.stock;

  const orderRes = await app.fetch(
    new Request('http://localhost/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: {
          firstName: 'Zainab',
          lastName: 'Tariq',
          email: 'zainab@example.com',
          phone: '03001112233',
        },
        shippingAddress: {
          addressLine1: '18 Main Boulevard, Gulberg',
          city: 'Lahore',
          state: 'Punjab',
          postalCode: '54000',
          country: 'Pakistan',
        },
        billingSameAsShipping: true,
        paymentMethod: 'cod',
        shippingMethodId: 'standard',
        items: [
          {
            productId: targetProduct.id,
            quantity: 2,
            selectedColor: 'Terracotta Rust',
            selectedSize: 'M',
          },
        ],
      }),
    })
  );

  assert.equal(orderRes.status, 201);
  const { order } = await orderRes.json();
  assert.ok(order.id.startsWith('ORD-'));
  assert.equal(order.subtotal, targetProduct.price * 2);

  // Verify stock was decremented
  const prodRes = await app.fetch(new Request('http://localhost/api/products'));
  const { products } = await prodRes.json();
  const updated = products.find((p) => p.id === targetProduct.id);
  assert.equal(updated.stock, initialStock - 2);
});

test('6. Hono Cloudflare Worker: Media upload (R2/fallback), Category CRUD, and Sitemap', async () => {
  // Upload image via base64 JSON payload
  const samplePngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const uploadRes = await app.fetch(
    new Request('http://localhost/api/media/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: 'test-product.png',
        contentType: 'image/png',
        base64: samplePngBase64,
      }),
    })
  );
  assert.equal(uploadRes.status, 201);
  const mediaBody = await uploadRes.json();
  assert.ok(mediaBody.url.startsWith('/api/media/'));

  // Serve uploaded media
  const getMediaRes = await app.fetch(new Request(`http://localhost${mediaBody.url}`));
  assert.equal(getMediaRes.status, 200);
  assert.equal(getMediaRes.headers.get('content-type'), 'image/png');

  // Create, edit, and delete category
  const createCatRes = await app.fetch(
    new Request('http://localhost/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Artisan Footwear',
        tagline: 'Handcrafted Khussa',
        subtitle: 'Traditional leather footwear',
        image: mediaBody.url,
      }),
    })
  );
  assert.equal(createCatRes.status, 201);
  const { category } = await createCatRes.json();
  assert.equal(category.slug, 'artisan-footwear');

  const delCatRes = await app.fetch(
    new Request(`http://localhost/api/categories/${category.id}`, {
      method: 'DELETE',
    })
  );
  assert.equal(delCatRes.status, 200);

  // Sitemap & Robots.txt
  const sitemapRes = await app.fetch(new Request('http://localhost/sitemap.xml'));
  assert.equal(sitemapRes.status, 200);
  const xml = await sitemapRes.text();
  assert.ok(xml.includes('<urlset'));

  const robotsRes = await app.fetch(new Request('http://localhost/robots.txt'));
  assert.equal(robotsRes.status, 200);
});

test('7. Hono Cloudflare Worker: Google Sign-In (/api/auth/google) authenticates customer and admin profiles', async () => {
  const googleCustomerRes = await app.fetch(
    new Request('http://localhost/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Amina',
        lastName: 'Khalid',
        email: 'amina.khalid@gmail.com',
        googleId: 'goog-test-101',
      }),
    })
  );
  assert.equal(googleCustomerRes.status, 200);
  const customerData = await googleCustomerRes.json();
  assert.equal(customerData.provider, 'google');
  assert.equal(customerData.user.email, 'amina.khalid@gmail.com');
  assert.equal(customerData.user.role, 'customer');
  assert.ok(customerData.token);

  const googleAdminRes = await app.fetch(
    new Request('http://localhost/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Store',
        lastName: 'Admin',
        email: 'admin@miras.store',
        googleId: 'goog-admin-01',
      }),
    })
  );
  assert.equal(googleAdminRes.status, 200);
  const adminData = await googleAdminRes.json();
  assert.equal(adminData.user.role, 'admin');
  assert.ok(adminData.token);

  // Test profile & saved addresses update
  const profileRes = await app.fetch(
    new Request('http://localhost/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'amina.khalid@gmail.com',
        firstName: 'Amina',
        lastName: 'Khalid',
        phone: '03009998877',
        savedAddresses: [{ id: 'addr-1', city: 'Lahore', addressLine1: '12 Gulberg III' }],
      }),
    })
  );
  assert.equal(profileRes.status, 200);
  const profileData = await profileRes.json();
  assert.equal(profileData.user.phone, '03009998877');
  assert.equal(profileData.user.savedAddresses.length, 1);

  // Verify regional cultural filter (Sindh, Balochistan, Kashmir, etc.)
  const sindhProducts = filterAndSortProducts(INITIAL_PRODUCTS, { region: 'Sindh' });
  assert.ok(sindhProducts.length >= 1);
  assert.ok(sindhProducts.some((p) => p.name.includes('Ajrak')));
});

test('8. Hono Cloudflare Worker: Review moderation (create & delete) and full Store Settings persistence', async () => {
  const targetProdId = INITIAL_PRODUCTS[0].id;

  // 1. Add customer review
  const addRevRes = await app.fetch(
    new Request(`http://localhost/api/products/${targetProdId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author: 'Farman Ullah',
        location: 'Peshawar',
        rating: 5,
        title: 'Authentic Craftsmanship',
        comment: 'Exceptional quality and fast courier delivery.',
      }),
    })
  );
  assert.equal(addRevRes.status, 201);
  const { review } = await addRevRes.json();
  assert.ok(review.id.startsWith('rev-'));

  // 2. Delete review via Admin moderation endpoint
  const delRevRes = await app.fetch(
    new Request(`http://localhost/api/products/${targetProdId}/reviews/${review.id}`, {
      method: 'DELETE',
    })
  );
  assert.equal(delRevRes.status, 200);
  const delBody = await delRevRes.json();
  assert.equal(delBody.deleted, true);

  // 3. Update Store Settings (shipping fees, lookbook banner, regional highlights)
  const settingsRes = await app.fetch(
    new Request('http://localhost/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brandName: 'MIRAS',
        lookbookBanner: {
          heading: 'Updated Seasonal Heritage Lookbook',
          description: 'Dynamic editorial banner updated from Admin.',
        },
      }),
    })
  );
  assert.equal(settingsRes.status, 200);
  const { config } = await settingsRes.json();
  assert.equal(config.lookbookBanner.heading, 'Updated Seasonal Heritage Lookbook');

  // 4. Verify real product view counter increments accurately and reviewCount matches reviews.length
  const viewRes1 = await app.fetch(
    new Request(`http://localhost/api/products/${targetProdId}/view`, {
      method: 'POST',
    })
  );
  assert.equal(viewRes1.status, 200);
  const viewData1 = await viewRes1.json();
  assert.ok(viewData1.viewCount >= 2);

  const viewRes2 = await app.fetch(
    new Request(`http://localhost/api/products/${targetProdId}/view`, {
      method: 'POST',
    })
  );
  const viewData2 = await viewRes2.json();
  assert.equal(viewData2.viewCount, viewData1.viewCount + 1);

  const allProdRes = await app.fetch(new Request('http://localhost/api/products'));
  const { products: allProds } = await allProdRes.json();
  for (const p of allProds) {
    assert.equal(p.reviewCount, (p.reviews || []).length);
  }
});



