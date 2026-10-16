import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';

export default function Header() {
  const {
    brandConfig,
    categories,
    cartTotals,
    wishlist,
    user,
    setIsCartDrawerOpen,
    setIsSearchOpen,
  } = useStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinkClass = ({ isActive }) =>
    `text-[13px] font-medium tracking-wide transition-colors py-2 ${
      isActive ? 'text-[#B85338] font-semibold' : 'text-[#1C1917] hover:text-[#B85338]'
    }`;

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 ${
        isScrolled
          ? 'bg-[#FAF7F2]/95 backdrop-blur-md shadow-xs border-b border-stone-200'
          : 'bg-[#FAF7F2] border-b border-stone-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Left: Mobile Trigger & Track Order Link */}
          <div className="flex items-center gap-3">
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
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-[#B85338] transition-colors"
            >
              <Package className="w-3.5 h-3.5 text-[#B85338]" />
              <span>Track Order</span>
            </Link>

            <Link
              to="/admin"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded bg-[#6B2737] text-white hover:bg-[#521C29] transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Seller Admin</span>
            </Link>
          </div>

          {/* Center: Brand Logo */}
          <div className="flex-1 lg:flex-initial text-center">
            <Link to="/" className="inline-flex flex-col items-center group">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="w-7 h-7 rounded bg-[#1C1917] flex items-center justify-center border border-[#C59B5F]/50 group-hover:bg-[#B85338] transition-colors"
                >
                  <span className="w-2.5 h-2.5 rotate-45 border border-[#C59B5F] bg-[#B85338] group-hover:bg-white transition-colors" />
                </span>
                <span className="font-serif text-2xl sm:text-3xl font-semibold tracking-[0.16em] uppercase text-[#1C1917]">
                  {brandConfig.brandName}
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Search, Profile, Wishlist, Cart */}
          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search products"
              className="p-2.5 text-[#1C1917] hover:text-[#B85338] rounded-full hover:bg-stone-200/50 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Search className="w-5 h-5" />
              <span className="hidden xl:inline text-xs font-medium text-stone-600">Search</span>
            </button>

            <Link
              to={user ? '/account' : '/login'}
              aria-label={user ? 'My Profile' : 'Sign in'}
              className="p-2.5 text-[#1C1917] hover:text-[#B85338] rounded-full hover:bg-stone-200/50 transition-colors flex items-center gap-1.5"
            >
              <User className="w-5 h-5" />
              <span className="hidden xl:inline text-xs font-medium text-[#1C1917] max-w-[90px] truncate">
                {user ? user.firstName : 'Sign In'}
              </span>
            </Link>

            <Link
              to="/wishlist"
              aria-label={`Wishlist (${wishlist.length} items)`}
              className="relative p-2.5 text-[#1C1917] hover:text-[#B85338] rounded-full hover:bg-stone-200/50 transition-colors"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#6B2737] text-white text-[10px] font-semibold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setIsCartDrawerOpen(true)}
              aria-label={`Shopping bag (${cartTotals.itemCount} items)`}
              className="relative p-2.5 text-[#1C1917] hover:text-[#B85338] rounded-full hover:bg-stone-200/50 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#B85338] text-white text-[11px] font-semibold flex items-center justify-center">
                {cartTotals.itemCount}
              </span>
            </button>
          </div>
        </div>

        {/* Desktop Primary Navigation */}
        <nav
          aria-label="Store navigation"
          className="hidden lg:flex items-center justify-center gap-8 border-t border-stone-200/70 py-2.5"
        >
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>

          <NavLink to="/shop" className={navLinkClass}>
            Shop All
          </NavLink>

          {/* Categories Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              aria-expanded={isDropdownOpen}
              className="inline-flex items-center gap-1 text-[13px] font-medium tracking-wide text-[#1C1917] hover:text-[#B85338] py-2 cursor-pointer"
            >
              <span>Categories</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  isDropdownOpen ? 'rotate-180 text-[#B85338]' : ''
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 top-full pt-2 w-64 z-50">
                <div className="bg-white border border-stone-200 rounded-lg shadow-xl py-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.slug}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#FAF7F2] text-xs font-medium text-[#1C1917] hover:text-[#B85338] transition-colors"
                    >
                      <img
                        src={cat.image}
                        alt=""
                        className="w-8 h-8 rounded object-cover border border-stone-200"
                      />
                      <span>{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <NavLink to="/collections/new-arrivals" className={navLinkClass}>
            New Arrivals
          </NavLink>

          <NavLink to="/collections/best-sellers" className={navLinkClass}>
            Best Sellers
          </NavLink>

          {categories.slice(0, 2).map((cat) => (
            <NavLink key={cat.id} to={`/category/${cat.slug}`} className={navLinkClass}>
              {cat.name}
            </NavLink>
          ))}

          <NavLink
            to="/collections/sale"
            className="text-[13px] font-semibold tracking-wide text-[#B85338] hover:text-[#6B2737] py-2"
          >
            Special Offers
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
          <div className="relative w-full max-w-xs bg-[#FAF7F2] h-full overflow-y-auto shadow-2xl p-5 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                <span className="font-serif text-xl font-semibold tracking-widest uppercase text-[#1C1917]">
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

              <div className="py-4 space-y-1 border-b border-stone-200">
                <Link
                  to="/"
                  className="block px-3 py-2.5 rounded-md text-sm font-medium text-[#1C1917] hover:bg-stone-200/60"
                >
                  Home
                </Link>
                <Link
                  to="/shop"
                  className="block px-3 py-2.5 rounded-md text-sm font-semibold text-[#1C1917] hover:bg-stone-200/60"
                >
                  Shop All Products
                </Link>
                <Link
                  to="/shop?onSale=true"
                  className="block px-3 py-2.5 rounded-md text-sm font-semibold text-[#B85338] hover:bg-stone-200/60"
                >
                  Special Offers & Discounts
                </Link>
              </div>

              <div className="py-4 border-b border-stone-200">
                <p className="px-3 text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-2">
                  Departments
                </p>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.slug}`}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-stone-700 hover:bg-stone-200/60"
                    >
                      <img
                        src={cat.image}
                        alt=""
                        className="w-7 h-7 rounded object-cover border border-stone-300"
                      />
                      <span>{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="py-4 space-y-2 text-sm">
                <Link to={user ? '/account' : '/login'} className="block px-3 py-2 font-medium">
                  {user ? `My Profile (${user.firstName})` : 'Sign In / Create Account'}
                </Link>
                <Link to="/account/orders" className="block px-3 py-2 font-medium">
                  Track My Order
                </Link>
                <Link to="/wishlist" className="block px-3 py-2 font-medium">
                  Saved Wishlist ({wishlist.length})
                </Link>
                <Link to="/admin" className="block px-3 py-2 font-semibold text-[#6B2737]">
                  Seller Admin Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
