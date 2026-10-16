import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import ProductCard from '../components/product/ProductCard.jsx';
import SEOHead from '../components/common/SEOHead.jsx';

export default function WishlistPage() {
  const {
    wishlistProducts,
    clearWishlist,
    addToCart,
    recentlyViewedProducts,
    categories,
  } = useStore();

  const handleMoveAllToBag = () => {
    wishlistProducts.forEach((product) => {
      if (product.stock > 0) {
        addToCart(product, { quantity: 1, silent: true });
      }
    });
    if (wishlistProducts.length > 0) {
      addToCart(wishlistProducts[0], { quantity: 0, openDrawer: true, silent: true });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-16">
      <SEOHead
        title={`Saved Wishlist (${wishlistProducts.length})`}
        canonicalPath="/wishlist"
      />

      <div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6B2737]">
              Personal Archive
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1C1917] mt-1">
              Saved Wishlist ({wishlistProducts.length})
            </h1>
          </div>

          {wishlistProducts.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleMoveAllToBag}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1C1917] hover:bg-[#B85338] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add Available to Bag</span>
              </button>
              <button
                type="button"
                onClick={clearWishlist}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-stone-500 hover:text-red-600 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>
          )}
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center max-w-lg mx-auto my-8">
            <div className="w-14 h-14 rounded-full bg-[#6B2737]/10 text-[#6B2737] flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
              Your Wishlist is Currently Empty
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 mb-6 leading-relaxed">
              Tap the heart icon on any piece across our catalog to save it here for future consideration or gifting.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1C1917] text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#B85338] transition-colors"
            >
              <span>Explore Curated Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {wishlistProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Recently Viewed Products */}
      {recentlyViewedProducts.length > 0 && (
        <section className="pt-10 border-t border-stone-200">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C1917] mb-6">
            Recently Viewed Pieces
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentlyViewedProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Category Recommendations */}
      <section className="pt-10 border-t border-stone-200">
        <h2 className="font-serif text-2xl font-semibold text-[#1C1917] mb-5">
          Explore Curated Departments
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.slice(0, 4).map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="p-4 rounded-lg bg-white border border-stone-200 hover:border-[#B85338] transition-colors group"
            >
              <h3 className="font-serif text-lg font-semibold text-[#1C1917] group-hover:text-[#B85338]">
                {cat.name}
              </h3>
              <p className="text-xs text-stone-500 mt-1 line-clamp-1">{cat.subtitle}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
