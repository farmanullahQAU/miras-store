import { useEffect } from 'react';
import { useStore } from '../../context/StoreContext.jsx';

/**
 * Dynamically updates document title, meta description, canonical URL,
 * Open Graph tags, and optional JSON-LD Product Schema for SEO & Social Ads.
 */
export default function SEOHead({
  title,
  description,
  canonicalPath = '/',
  productSchema = null,
}) {
  const { brandConfig } = useStore();
  const siteName = brandConfig.brandName || 'MIRAS';
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} — ${brandConfig.tagline}`;
  const metaDesc = description || brandConfig.subTagline;
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://miras-store.pages.dev';

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (selector, attrName, attrValue, contentValue) => {
      if (!contentValue) return;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', contentValue);
    };

    setMeta('meta[name="description"]', 'name', 'description', metaDesc);
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', metaDesc);
    setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', siteName);
    setMeta('meta[property="og:url"]', 'property', 'og:url', `${origin}${canonicalPath}`);

    const ogImage =
      productSchema?.images?.[0] || brandConfig.heroBanner?.image || '';
    if (ogImage) {
      const fullImgUrl = ogImage.startsWith('/') ? `${origin}${ogImage}` : ogImage;
      setMeta('meta[property="og:image"]', 'property', 'og:image', fullImgUrl);
      setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    }

    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (canonicalEl) {
      canonicalEl.setAttribute('href', `${origin}${canonicalPath}`);
    }

    // Manage JSON-LD Product Structured Data
    const existingScript = document.getElementById('miras-jsonld-product');
    if (existingScript) {
      existingScript.remove();
    }

    if (productSchema) {
      const script = document.createElement('script');
      script.id = 'miras-jsonld-product';
      script.type = 'application/ld+json';
      script.text = JSON.stringify({
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: productSchema.name,
        image: (productSchema.images || []).map((img) =>
          img.startsWith('/') ? `${origin}${img}` : img
        ),
        description: productSchema.shortDescription || productSchema.description,
        sku: productSchema.sku,
        brand: {
          '@type': 'Brand',
          name: productSchema.brand || siteName,
        },
        offers: {
          '@type': 'Offer',
          url: `${origin}/product/${productSchema.slug}`,
          priceCurrency: brandConfig.currency?.code || 'PKR',
          price: productSchema.price,
          availability:
            productSchema.stock > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
        },
        ...(productSchema.reviewCount > 0
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: productSchema.rating,
                reviewCount: productSchema.reviewCount,
              },
            }
          : {}),
      });
      document.head.appendChild(script);
    }

    return () => {
      const s = document.getElementById('miras-jsonld-product');
      if (s) s.remove();
    };
  }, [fullTitle, metaDesc, canonicalPath, siteName, origin, productSchema, brandConfig]);

  return null;
}
