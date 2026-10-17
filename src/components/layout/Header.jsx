import React, { useState, useEffect, useMemo } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Package,
  MapPin,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';

export default function Header() {
  const {
    brandConfig,
    categories,
    products,
    cartTotals,
    wishlist,
    user,
    setIsCartDrawerOpen,
    setIsSearchOpen,
  } = useStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsRegionDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Derive distinct cultural regions dynamically from live products
  const regionsList = useMemo(() => {
    const map = new Map();
    for (const p of products || []) {
      const origin = p.culturalOrigin || p.origin || p.specifications?.Origin || '';
      if (origin && !map.has(origin)) {
        map.set(origin, {
          name: origin,
          category: p.category || 'Regional Specialty',
        });
      }
    }
    return Array.from(map.values()).slice(0, 8);
  }, [products]);

  const navLinkClass = ({ isActive }) =>
    `text-[12px] uppercase tracking-[0.14em] transition-colors py-2.5 whitespace-nowrap ${
      isActive
        ? 'text-[#B85338] font-semibold border-b-2 border-[#B85338]'
        : 'text-[#1C1917] hover:text-[#B85338] font-medium'
    }`;

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-stone-200/80'
          : 'bg-[#FAF7F2] border-b border-stone-200/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Left: Mobile Trigger & Track Order Link */}
          <div className="flex items-center gap-4 min-w-[110px]">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
              className="lg:hidden p-2 -ml-2 text-[#1C1917] hover:text-[#B85338] rounded-md cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link
              to="/track-order"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-[#1C1917] transition-colors"
            >
              <Package className="w-3.5 h-3.5 text-[#B85338]" />
              <span>Track Order</span>
            </Link>

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded bg-[#1C1917] text-white hover:bg-[#B85338] transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C59B5F]" />
                <span>Admin</span>
              </Link>
            )}
          </div>

          {/* Center: Clean Editorial Brand Logo */}
          <div className="flex-1 lg:flex-initial text-center">
            <Link to="/" className="inline-flex flex-col items-center">
              <span className="font-serif text-2xl sm:text-3xl font-semibold tracking-[0.22em] uppercase text-[#1C1917]">
                {brandConfig.brandName}
              </span>
            </Link>
          </div>

          {/* Right: Search, Profile, Wishlist, Cart */}
          <div className="flex items-center justify-end gap-1 sm:gap-2 min-w-[110px]">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search products"
              className="p-2.5 text-[#1C1917] hover:text-[#B85338] rounded-full hover:bg-stone-200/40 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              to={user ? '/account' : '/login'}
              aria-label={user ? 'My Profile' : 'Sign in'}
              className="p-2.5 text-[#1C1917] hover:text-[#B85338] rounded-full hover:bg-stone-200/40 transition-colors flex items-center gap-1.5"
            >
              <User className="w-5 h-5" />
              {user && (
                <span className="hidden xl:inline text-xs font-medium text-[#1C1917] max-w-[85px] truncate">
                  {user.firstName}
                </span>
              )}
            </Link>

            <Link
              to="/wishlist"
              aria-label={`Wishlist (${wishlist.length} items)`}
              className="relative p-2.5 text-[#1C1917] hover:text-[#B85338] rounded-full hover:bg-stone-200/40 transition-colors"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#1C1917] text-white text-[10px] font-semibold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setIsCartDrawerOpen(true)}
              aria-label={`Shopping bag (${cartTotals.itemCount} items)`}
              className="relative p-2.5 text-[#1C1917] hover:text-[#B85338] rounded-full hover:bg-stone-200/40 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartTotals.itemCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#B85338] text-white text-[10px] font-semibold flex items-center justify-center">
                  {cartTotals.itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop Direct Department & Regional Navigation (Khaadi / Sapphire Standard) */}
        <nav
          aria-label="Store navigation"
          className="hidden lg:flex items-center justify-center gap-7 border-t border-stone-200/60"
        >
          <NavLink to="/collections/new-arrivals" className={navLinkClass}>
            New In
          </NavLink>

          <NavLink to="/shop" end className={navLinkClass}>
            Shop All
          </NavLink>

          {categories.slice(0, 5).map((cat) => (
            <NavLink key={cat.id || cat.slug} to={`/category/${cat.slug}`} className={navLinkClass}>
              {cat.name}
            </NavLink>
          ))}

          {/* Shop by Region Dropdown */}
          {regionsList.length > 0 && (
            <div
              className="relative"
              onMouseEnter={() => setIsRegionDropdownOpen(true)}
              onMouseLeave={() => setIsRegionDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsRegionDropdownOpen((prev) => !prev)}
                aria-expanded={isRegionDropdownOpen}
                className="inline-flex items-center gap-1 text-[12px] uppercase tracking-[0.14em] font-medium text-[#1C1917] hover:text-[#B85338] py-2.5 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-[#B85338]" />
                <span>Regions</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    isRegionDropdownOpen ? 'rotate-180 text-[#B85338]' : ''
                  }`}
                />
              </button>

              {isRegionDropdownOpen && (
                <div className="absolute left-0 top-full pt-1 w-64 z-50">
                  <div className="bg-white border border-stone-200 rounded-xl shadow-xl py-2">
                    <div className="px-4 py-1.5 border-b border-stone-100">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                        Explore by Region
                      </p>
                    </div>
                    {regionsList.map((reg) => (
                      <Link
                        key={reg.name}
                        to={`/shop?region=${encodeURIComponent(reg.name)}`}
                        className="flex items-center justify-between px-4 py-2.5 hover:bg-[#FAF7F2] text-xs text-[#1C1917] hover:text-[#B85338] transition-colors"
                      >
                        <span className="font-medium truncate">{reg.name}</span>
                        <span className="text-[10px] text-stone-400 ml-2 shrink-0">
                          {reg.category}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <NavLink
            to="/collections/sale"
            className="text-[12px] uppercase tracking-[0.14em] font-semibold text-[#B85338] hover:text-[#6B2737] py-2.5"
          >
            Sale
          </NavLink>
        </nav>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile menu"
          className="fixed inset-0 z-50 lg:hidden flex"
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-full max-w-xs bg-white h-full overflow-y-auto shadow-2xl p-5 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                <span className="font-serif text-xl font-semibold tracking-[0.2em] uppercase text-[#1C1917]">
                  {brandConfig.brandName}
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-2 text-stone-500 hover:text-[#1C1917] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-1 border-b border-stone-100">
                <Link
                  to="/collections/new-arrivals"
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#1C1917] hover:bg-stone-100"
                >
                  New In
                </Link>
                <Link
                  to="/shop"
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#1C1917] hover:bg-stone-100"
                >
                  Shop All
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id || cat.slug}
                    to={`/category/${cat.slug}`}
                    className="block px-3 py-2.5 rounded-lg text-sm text-stone-700 hover:bg-stone-100"
                  >
                    {cat.name}
                  </Link>
                ))}
                <Link
                  to="/collections/sale"
                  className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-[#B85338] hover:bg-stone-100"
                >
                  Sale
                </Link>
              </div>

              {regionsList.length > 0 && (
                <div className="py-4 border-b border-stone-100">
                  <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-2">
                    Explore by Region
                  </p>
                  <div className="flex flex-wrap gap-1.5 px-3">
                    {regionsList.map((reg) => (
                      <Link
                        key={reg.name}
                        to={`/shop?region=${encodeURIComponent(reg.name)}`}
                        className="px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-stone-200 text-xs font-medium text-[#1C1917]"
                      >
                        {reg.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="py-4 space-y-1 text-sm">
                <Link
                  to={user ? '/account' : '/login'}
                  className="block px-3 py-2 rounded-lg text-stone-700 hover:bg-stone-100"
                >
                  {user ? `Account (${user.firstName})` : 'Sign In / Register'}
                </Link>
                <Link
                  to="/track-order"
                  className="block px-3 py-2 rounded-lg text-stone-700 hover:bg-stone-100"
                >
                  Track Order
                </Link>
                <Link
                  to="/wishlist"
                  className="block px-3 py-2 rounded-lg text-stone-700 hover:bg-stone-100"
                >
                  Wishlist ({wishlist.length})
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2 rounded-lg font-semibold text-[#B85338]"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
