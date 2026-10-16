import { useEffect } from 'react';
import { useStore } from '../../context/StoreContext.jsx';

/**
 * Dynamically updates document title, meta description, canonical URL,
 * Open Graph tags, and optional JSON-LD Product Schema for SEO.
 */
export default function SEOHead({
  title,
  description,
  canonicalPath = '/',
  productSchema = null,
}) {
  const { brandConfig } = useStore();
  const siteName = brandConfig.brandName || 'YOUR BRAND NAME';
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} — ${brandConfig.tagline}`;
  const metaDesc = description || brandConfig.subTagline;

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (selector, attr, value) => {
      let el = document.querySelector(selector);
      if (el && value) {
        el.setAttribute(attr, value);
      }
    };

    setMeta('meta[name="description"]', 'content', metaDesc);
    setMeta('meta[property="og:title"]', 'content', fullTitle);
    setMeta('meta[property="og:description"]', 'content', metaDesc);
    setMeta('meta[property="og:site_name"]', 'content', siteName);
    setMeta('link[rel="canonical"]', 'href', `https://yourbrandname.example.com${canonicalPath}`);

    // Manage JSON-LD Product Structured Data
    const existingScript = document.getElementById('ybn-jsonld-product');
    if (existingScript) {
      existingScript.remove();
    }

    if (productSchema) {
      const script = document.createElement('script');
      script.id = 'ybn-jsonld-product';
      script.type = 'application/ld+json';
      script.text = JSON.stringify({
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: productSchema.name,
        image: productSchema.images || [],
        description: productSchema.shortDescription || productSchema.description,
        sku: productSchema.sku,
        brand: {
          '@type': 'Brand',
          name: productSchema.brand || siteName,
        },
        offers: {
          '@type': 'Offer',
          url: `https://yourbrandname.example.com/product/${productSchema.slug}`,
          priceCurrency: 'PKR',
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
      const s = document.getElementById('ybn-jsonld-product');
      if (s) s.remove();
    };
  }, [fullTitle, metaDesc, canonicalPath, siteName, productSchema]);

  return null;
}
