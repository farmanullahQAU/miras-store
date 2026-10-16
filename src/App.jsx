import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import AnnouncementBar from './components/layout/AnnouncementBar';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CartDrawer from './components/common/CartDrawer';
import SearchOverlay from './components/common/SearchOverlay';
import QuickViewModal from './components/product/QuickViewModal';
import ToastContainer from './components/common/ToastContainer';

// Code-split pages for lightning-fast performance and minimal initial bundle size
const HomePage = lazy(() => import('./pages/HomePage'));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#1C1A17]/20 border-t-[#9E4733] rounded-full animate-spin" />
    </div>
  );
}

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname, search]);
  return null;
}

function NotFoundPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#9E4733]">
        404 — Page Not Found
      </span>
      <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1C1A17]">
        We Could Not Find That Page
      </h1>
      <p className="text-sm text-[#5C564F]">
        Explore our active product catalog or return to the homepage.
      </p>
      <div className="pt-2">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1C1A17] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#9E4733]"
        >
          Browse All Products
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1A17]">
      <ScrollToTop />
      <AnnouncementBar />
      <Header />

      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<CatalogPage mode="shop" />} />
            <Route path="/category/:slug" element={<CatalogPage mode="category" />} />
            <Route path="/collections/:slug" element={<CatalogPage mode="collection" />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            <Route path="/forgot-password" element={<AuthPage mode="forgot-password" />} />
            <Route path="/account" element={<AccountPage defaultTab="overview" />} />
            <Route path="/account/orders" element={<AccountPage defaultTab="orders" />} />
            <Route path="/track-order" element={<AccountPage defaultTab="track" />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
      <CartDrawer />
      <SearchOverlay />
      <QuickViewModal />
      <ToastContainer />
    </div>
  );
}
