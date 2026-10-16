/**
 * MIRAS — Central Brand & Store Configuration
 * Edit your store name, announcement bar, shipping fee, and EasyPaisa/Bank account details
 * here or directly inside the Admin Dashboard (/admin -> Store Settings).
 */

export const DEFAULT_BRAND_CONFIG = {
  brandName: 'MIRAS',
  tagline: 'Quality Products With Character.',
  brandTagline: 'Quality Products With Character.',
  subTagline:
    'Curated traditional craft, contemporary fashion, signature accessories, and modern home essentials delivered nationwide.',
  brandDescription:
    'Curated traditional craft, contemporary fashion, signature accessories, and modern home essentials delivered nationwide.',
  supportEmail: 'support@mirasstore.com',
  contactEmail: 'support@mirasstore.com',
  supportPhone: '+92 300 1234567',
  contactPhone: '+92 300 1234567',
  whatsappNumber: '923001234567',
  supportHours: 'Mon–Sat, 9am–9pm PKT',
  cityBase: 'Pakistan — Nationwide Delivery',
  headquarters: 'Lahore, Pakistan — Nationwide Courier Dispatch',

  // Hero Banner
  heroBanner: {
    eyebrow: 'Curated Collection • Direct To Your Doorstep',
    heading: 'Discover Products With Character.',
    subheading:
      'Explore handpicked cultural treasures, contemporary fashion, signature accessories, and thoughtful gifts — with fast nationwide Cash on Delivery.',
    image:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1800&q=85',
    primaryCta: 'Shop the Collection',
    secondaryCta: 'Explore New Arrivals',
  },

  // Top Announcement Bar (Ideal for running ad promos)
  announcementBar: {
    enabled: true,
    message: 'Free Nationwide Delivery on orders above Rs. 5,000 · Use code WELCOME10 for 10% OFF',
    ctaLabel: 'Shop Now',
    ctaLink: '/shop',
  },
  announcement: {
    enabled: true,
    message: 'Free Nationwide Delivery on orders above Rs. 5,000',
    highlightCode: 'WELCOME10',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
  },

  currencySymbol: 'Rs.',
  currency: {
    code: 'PKR',
    symbol: 'Rs.',
    freeShippingThreshold: 5000,
  },

  // Shipping Policy
  shipping: {
    freeShippingThreshold: 5000,
    methods: [
      {
        id: 'standard',
        name: 'Standard Tracked Courier (TCS / Leopards)',
        eta: '2–4 Working Days',
        description: 'Delivered in 2–4 working days across Pakistan',
        estimatedDaysMin: 2,
        estimatedDaysMax: 4,
        price: 250,
        freeAboveThreshold: true,
      },
      {
        id: 'express',
        name: 'Priority Express Delivery',
        eta: 'Next-Day / 48 Hours',
        description: 'Next-day / 48-hour priority dispatch for urgent orders',
        estimatedDaysMin: 1,
        estimatedDaysMax: 2,
        price: 500,
        freeAboveThreshold: false,
      },
    ],
  },
  shippingMethods: [
    {
      id: 'standard',
      name: 'Standard Tracked Courier (TCS / Leopards)',
      eta: '2–4 Working Days',
      description: 'Free on orders over Rs. 5,000',
      price: 250,
    },
    {
      id: 'express',
      name: 'Priority Express Delivery',
      eta: 'Next-Day / 48 Hours',
      description: 'Priority air courier dispatch',
      price: 500,
    },
  ],

  // Tax Policy (0% default for straightforward retail pricing, configurable in Admin)
  tax: {
    enabled: false,
    ratePercentage: 0,
    label: 'Included in price',
    includedInDisplayedPrice: true,
  },

  // Payment Methods for Real Customer Checkout
  paymentProviders: [
    {
      id: 'cod',
      name: 'Cash on Delivery (COD)',
      badge: 'Most Popular',
      shortLabel: 'Pay cash at your doorstep when you receive your parcel',
      description: 'Pay in cash to the courier upon receiving your package.',
      enabled: true,
      instructions:
        'Pay the courier in cash upon receiving your package. Please ensure your phone number is active for delivery coordination.',
    },
    {
      id: 'wallet_transfer',
      name: 'EasyPaisa / JazzCash / Bank Transfer (Raast)',
      badge: 'Instant Transfer',
      shortLabel: 'Instant transfer — enter your Transaction ID (TRX ID) below',
      description: 'Transfer via EasyPaisa, JazzCash, or Bank Raast and enter your TRX ID.',
      enabled: true,
      bankDetails: {
        accountTitle: 'MIRAS RETAIL STORE',
        bankName: 'Meezan Bank / Raast / EasyPaisa',
        accountNumber: '0300-1234567',
        iban: 'PK36MEZN0001020105829104',
      },
      instructions:
        'Send the total amount to EasyPaisa / JazzCash: 0300-1234567 (Title: MIRAS RETAIL STORE) or Meezan Bank IBAN: PK36MEZN0001020105829104 and enter your Transaction ID (TRX ID) below.',
    },
  ],
  paymentMethods: [
    {
      id: 'cod',
      name: 'Cash on Delivery (COD)',
      badge: 'Most Popular',
      description: 'Pay in cash at your doorstep when you receive your parcel.',
      instructions: 'Please keep the exact cash amount ready for the courier.',
    },
    {
      id: 'wallet_transfer',
      name: 'EasyPaisa / JazzCash / Bank Transfer (Raast)',
      badge: 'Fast Verification',
      description: 'Transfer via EasyPaisa, JazzCash, or Bank Raast and enter your TRX ID.',
      instructions:
        'Send total amount to EasyPaisa / JazzCash: 0300-1234567 (MIRAS STORE) or Meezan Bank IBAN: PK36MEZN0001020105829104 and enter your TRX ID below.',
    },
  ],

  // Store Categories
  categories: [
    {
      id: 'cat-traditional',
      name: 'Traditional & Cultural',
      slug: 'traditional-cultural',
      tagline: 'Heritage Craft',
      subtitle: 'Handcrafted shawls, regional artistry & heritage pieces',
      image:
        'https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?auto=format&fit=crop&w=900&q=85',
    },
    {
      id: 'cat-fashion',
      name: 'Fashion & Apparel',
      slug: 'fashion-apparel',
      tagline: 'Seasonal Wear',
      subtitle: 'Seasonal stitched & unstitched apparel and everyday wear',
      image:
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85',
    },
    {
      id: 'cat-accessories',
      name: 'Watches, Jewelry & Bags',
      slug: 'accessories-watches',
      tagline: 'Signature Pieces',
      subtitle: 'Statement jewelry, leather bags & everyday accessories',
      image:
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85',
    },
    {
      id: 'cat-home',
      name: 'Home & Décor',
      slug: 'home-decor',
      tagline: 'Artisan Living',
      subtitle: 'Ceramics, brass accents, rugs & warm interior pieces',
      image:
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85',
    },
    {
      id: 'cat-gifts',
      name: 'Gifts & Fragrances',
      slug: 'gifts-lifestyle',
      tagline: 'Thoughtful Gifting',
      subtitle: 'Oud attars, perfumes, gift boxes & lifestyle essentials',
      image:
        'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85',
    },
  ],

  // Curated Collections for Shop & Navigation
  collections: [
    {
      id: 'col-new',
      name: 'New Arrivals',
      slug: 'new-arrivals',
      subtitle: 'Freshly added pieces and seasonal releases',
    },
    {
      id: 'col-best',
      name: 'Best Sellers',
      slug: 'best-sellers',
      subtitle: 'Our most loved and highest rated customer favorites',
    },
    {
      id: 'col-sale',
      name: 'Special Offers & Sale',
      slug: 'sale',
      subtitle: 'Limited-time savings across selected pieces',
    },
  ],
};

export function formatCurrency(amount, symbol = DEFAULT_BRAND_CONFIG.currencySymbol) {
  const num = Math.round(Number(amount) || 0);
  return `${symbol} ${num.toLocaleString('en-PK')}`;
}
