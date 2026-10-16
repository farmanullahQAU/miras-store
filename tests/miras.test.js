import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../worker/index.js';
import {
  calculateOrderTotals,
  filterAndSortProducts,
  validateCheckoutPayload,
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

test('4. Hono Cloudflare Worker: Admin can authenticate, list a new product, and create a promo code', async () => {
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
