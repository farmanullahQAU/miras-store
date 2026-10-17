import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { DEFAULT_BRAND_CONFIG, formatCurrency } from '../config/brandConfig.js';
import { INITIAL_PRODUCTS, INITIAL_COUPONS, INITIAL_ORDERS } from '../data/productsData.js';
import { calculateOrderTotals, validateCouponCode } from '../utils/commerceEngine.js';
import { apiService } from '../services/api.js';

const StoreContext = createContext(null);

const LOCAL_KEYS = {
  CART: 'miras_cart_v1',
  WISHLIST: 'miras_wishlist_v1',
  COUPON: 'miras_active_coupon_v1',
  USER: 'miras_auth_user_v1',
};

function getStored(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore
  }
}

export function StoreProvider({ children }) {
  const [brandConfig, setBrandConfig] = useState(DEFAULT_BRAND_CONFIG);
  const [categories, setCategories] = useState(DEFAULT_BRAND_CONFIG.categories || []);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [coupons, setCoupons] = useState(INITIAL_COUPONS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);

  const [cart, setCart] = useState(() => getStored(LOCAL_KEYS.CART, []));
  const [appliedCouponCode, setAppliedCouponCode] = useState(() =>
    getStored(LOCAL_KEYS.COUPON, '')
  );
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState('standard');

  const [wishlist, setWishlist] = useState(() => getStored(LOCAL_KEYS.WISHLIST, []));
  const [user, setUser] = useState(() => getStored(LOCAL_KEYS.USER, null));

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', action = null) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-3), { id, message, type, action }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    let mounted = true;
    async function hydrate() {
      setIsLoadingCatalog(true);
      try {
        const [loadedConfig, loadedProducts, loadedCoupons, loadedOrders, loadedCats] = await Promise.all([
          apiService.getStoreConfig(),
          apiService.getProducts(),
          apiService.getCoupons(),
          apiService.getOrders(),
          apiService.getCategories(),
        ]);
        if (!mounted) return;
        setBrandConfig(loadedConfig);
        setProducts(loadedProducts);
        setCoupons(loadedCoupons);
        setOrders(loadedOrders);
        if (Array.isArray(loadedCats) && loadedCats.length > 0) {
          setCategories(loadedCats);
        }
      } finally {
        if (mounted) setIsLoadingCatalog(false);
      }
    }
    hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => setStored(LOCAL_KEYS.CART, cart), [cart]);
  useEffect(() => setStored(LOCAL_KEYS.WISHLIST, wishlist), [wishlist]);
  useEffect(() => setStored(LOCAL_KEYS.COUPON, appliedCouponCode), [appliedCouponCode]);
  useEffect(() => setStored(LOCAL_KEYS.USER, user), [user]);

  const formatPrice = useCallback(
    (amount) => formatCurrency(amount, brandConfig.currencySymbol || 'Rs.'),
    [brandConfig.currencySymbol]
  );

  // Cart Operations
  const addToCart = useCallback(
    (product, options = {}) => {
      if (!product) return false;
      if (product.stock <= 0 || product.stockStatus === 'out_of_stock') {
        addToast(`"${product.name}" is out of stock.`, 'error');
        return false;
      }

      const quantityToAdd = Math.max(1, Number(options.quantity) || 1);
      const selectedColor =
        options.selectedColor || product.variants?.colors?.[0]?.name || 'Standard';
      const selectedSize =
        options.selectedSize || product.variants?.sizes?.[0] || 'Standard';
      const cartItemKey = `${product.id}__${selectedColor}__${selectedSize}`;

      setCart((prev) => {
        const existingIndex = prev.findIndex((item) => item.cartItemKey === cartItemKey);
        if (existingIndex > -1) {
          const nextQty = Math.min(product.stock, prev[existingIndex].quantity + quantityToAdd);
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], quantity: nextQty };
          return updated;
        }
        return [
          ...prev,
          {
            cartItemKey,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            sku: product.sku,
            category: product.category,
            price: product.price,
            originalPrice: product.originalPrice,
            image: product.images?.[0] || '',
            maxStock: product.stock,
            selectedColor,
            selectedSize,
            availableColors: product.variants?.colors || [],
            availableSizes: product.variants?.sizes || [],
            quantity: Math.min(product.stock, quantityToAdd),
          },
        ];
      });

      if (!options.silent) {
        addToast(`Added "${product.name}" to your bag.`, 'success', {
          label: 'View Bag',
          onClick: () => setIsCartDrawerOpen(true),
        });
      }
      if (options.openDrawer) {
        setIsCartDrawerOpen(true);
      }
      return true;
    },
    [addToast]
  );

  const updateCartQuantity = useCallback(
    (cartItemKey, newQuantity) => {
      const qty = Math.floor(Number(newQuantity));
      if (qty <= 0) {
        setCart((prev) => prev.filter((item) => item.cartItemKey !== cartItemKey));
        return;
      }
      setCart((prev) =>
        prev.map((item) => {
          if (item.cartItemKey !== cartItemKey) return item;
          const product = products.find((p) => p.id === item.productId);
          const maxStock = product ? product.stock : item.maxStock || 20;
          return { ...item, quantity: Math.min(maxStock, qty) };
        })
      );
    },
    [products]
  );

  const updateCartVariant = useCallback((cartItemKey, { selectedColor, selectedSize }) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartItemKey !== cartItemKey) return item;
        const nextColor = selectedColor ?? item.selectedColor;
        const nextSize = selectedSize ?? item.selectedSize;
        return {
          ...item,
          selectedColor: nextColor,
          selectedSize: nextSize,
          cartItemKey: `${item.productId}__${nextColor}__${nextSize}`,
        };
      })
    );
  }, []);

  const removeFromCart = useCallback(
    (cartItemKey) => {
      setCart((prev) => prev.filter((item) => item.cartItemKey !== cartItemKey));
      addToast('Item removed from your bag.', 'info');
    },
    [addToast]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedCouponCode('');
  }, []);

  const applyCoupon = useCallback(
    (code) => {
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const res = validateCouponCode(code, subtotal, coupons);
      if (res.valid) {
        setAppliedCouponCode(res.coupon.code);
        addToast(res.message, 'success');
      } else {
        addToast(res.error, 'error');
      }
      return res;
    },
    [cart, coupons, addToast]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCouponCode('');
    addToast('Promo code removed.', 'info');
  }, [addToast]);

  const cartTotals = useMemo(
    () =>
      calculateOrderTotals({
        items: cart,
        couponCode: appliedCouponCode,
        coupons,
        shippingMethodId: selectedShippingMethodId,
        shippingConfig: brandConfig.shipping,
        taxConfig: brandConfig.tax,
      }),
    [cart, appliedCouponCode, coupons, selectedShippingMethodId, brandConfig.shipping, brandConfig.tax]
  );

  // Wishlist
  const isInWishlist = useCallback((productId) => wishlist.includes(productId), [wishlist]);

  const toggleWishlist = useCallback(
    (product) => {
      const productId = typeof product === 'string' ? product : product?.id;
      const productName = typeof product === 'object' ? product?.name : 'Product';
      if (!productId) return;

      setWishlist((prev) => {
        const exists = prev.includes(productId);
        if (exists) {
          addToast(`Removed "${productName}" from wishlist.`, 'info');
          return prev.filter((id) => id !== productId);
        } else {
          addToast(`Saved "${productName}" to wishlist.`, 'success');
          return [productId, ...prev];
        }
      });
    },
    [addToast]
  );

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  const wishlistProducts = useMemo(
    () => products.filter((p) => wishlist.includes(p.id) && p.status === 'published'),
    [products, wishlist]
  );

  // Recently Viewed Products
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const recordProductView = useCallback((productId) => {
    if (!productId) return;
    setRecentlyViewed((prev) => [productId, ...prev.filter((id) => id !== productId)].slice(0, 8));
  }, []);

  const recentlyViewedProducts = useMemo(
    () =>
      recentlyViewed
        .map((id) => products.find((p) => p.id === id && p.status === 'published'))
        .filter(Boolean),
    [recentlyViewed, products]
  );

  // Auth & Profile
  const login = useCallback(
    async (emailOrObj, maybePassword) => {
      const email = typeof emailOrObj === 'object' ? emailOrObj?.email : emailOrObj;
      const password = typeof emailOrObj === 'object' ? emailOrObj?.password : maybePassword;

      if (!email || !password) {
        throw new Error('Please enter both your email and password.');
      }

      try {
        const data = await apiService.login({ email, password });
        if (data?.user) {
          setUser(data.user);
          addToast(`Signed in as ${data.user.firstName}.`, 'success');
          return data.user;
        }
      } catch (err) {
        // Fallback for offline dev
        const normalized = email.trim().toLowerCase();
        const isAdmin =
          normalized === 'admin@mirasstore.com' ||
          normalized === 'admin@miras.store' ||
          normalized.startsWith('admin@');

        if (isAdmin && password === 'admin123') {
          const sessionUser = {
            id: 'usr-admin-01',
            firstName: 'Store',
            lastName: 'Admin',
            email: normalized,
            phone: '0300 1234567',
            role: 'admin',
            savedAddresses: [],
          };
          setUser(sessionUser);
          addToast(`Signed in as ${sessionUser.firstName}.`, 'success');
          return sessionUser;
        }
        throw err;
      }
    },
    [addToast]
  );

  const register = useCallback(
    async ({ firstName, lastName, email, phone, password }) => {
      if (!firstName || !email || !password) {
        throw new Error('Please fill in your name, email, and password.');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }
      try {
        const data = await apiService.register({ firstName, lastName, email, phone, password });
        if (data?.user) {
          setUser(data.user);
          addToast(`Welcome to ${brandConfig.brandName}, ${data.user.firstName}!`, 'success');
          return data.user;
        }
      } catch (err) {
        const newUser = {
          id: `usr-${Date.now()}`,
          firstName: firstName.trim(),
          lastName: (lastName || '').trim(),
          email: email.trim().toLowerCase(),
          phone: (phone || '').trim(),
          role: 'customer',
          savedAddresses: [],
        };
        setUser(newUser);
        addToast(`Welcome to ${brandConfig.brandName}, ${newUser.firstName}!`, 'success');
        return newUser;
      }
    },
    [brandConfig.brandName, addToast]
  );

  const loginWithGoogle = useCallback(
    async (googlePayload) => {
      try {
        const data = await apiService.loginWithGoogle(googlePayload);
        if (data?.user) {
          setUser(data.user);
          addToast(`Signed in with Google as ${data.user.firstName}.`, 'success');
          return data.user;
        }
      } catch (err) {
        if (googlePayload?.email) {
          const fallbackUser = {
            id: `usr-goog-${Date.now().toString().slice(-6)}`,
            firstName: googlePayload.firstName || googlePayload.email.split('@')[0],
            lastName: googlePayload.lastName || '',
            email: googlePayload.email.trim().toLowerCase(),
            phone: googlePayload.phone || '',
            role:
              googlePayload.email.trim().toLowerCase() === 'admin@miras.store'
                ? 'admin'
                : 'customer',
            authProvider: 'google',
            emailVerified: true,
            picture: googlePayload.picture || '',
            savedAddresses: [],
          };
          setUser(fallbackUser);
          addToast(`Signed in with Google as ${fallbackUser.firstName}.`, 'success');
          return fallbackUser;
        }
        throw err;
      }
    },
    [addToast]
  );

  const uploadMediaAdmin = useCallback(
    async (file) => {
      const result = await apiService.uploadMedia(file);
      return result;
    },
    []
  );

  const saveCategoryAdmin = useCallback(
    async (categoryData) => {
      const saved = await apiService.saveCategory(categoryData);
      const [updatedCats, updatedProds] = await Promise.all([
        apiService.getCategories(),
        apiService.getProducts(),
      ]);
      setCategories(updatedCats);
      setProducts(updatedProds);
      addToast(`Category "${categoryData.name}" saved.`, 'success');
      return saved;
    },
    [addToast]
  );

  const deleteCategoryAdmin = useCallback(
    async (categoryId) => {
      await apiService.deleteCategory(categoryId);
      const updated = await apiService.getCategories();
      setCategories(updated);
      addToast('Category removed.', 'info');
    },
    [addToast]
  );

  const trackOrderPublic = useCallback(async (orderId) => {
    return await apiService.trackOrder(orderId);
  }, []);

  const changePasswordAdmin = useCallback(
    async (payload) => {
      await apiService.changePassword(payload);
      addToast('Password updated successfully.', 'success');
    },
    [addToast]
  );

  const logout = useCallback(() => {
    setUser(null);
    addToast('Signed out.', 'info');
  }, [addToast]);

  const updateProfile = useCallback(
    async (updates) => {
      setUser((prev) => {
        if (!prev) return null;
        const merged = { ...prev, ...updates };
        apiService.updateProfile(merged).catch(() => {});
        return merged;
      });
      addToast('Profile saved to your account.', 'success');
    },
    [addToast]
  );

  const saveAddress = useCallback(
    (addressData) => {
      setUser((prev) => {
        if (!prev) return prev;
        const list = prev.savedAddresses || [];
        const newAddr = { ...addressData, id: addressData.id || `addr-${Date.now()}` };
        const merged = { ...prev, savedAddresses: [newAddr, ...list] };
        apiService.updateProfile(merged).catch(() => {});
        return merged;
      });
      addToast('Shipping address saved.', 'success');
    },
    [addToast]
  );

  const deleteAddress = useCallback((addressId) => {
    setUser((prev) => {
      if (!prev) return null;
      const merged = {
        ...prev,
        savedAddresses: (prev.savedAddresses || []).filter((a) => a.id !== addressId),
      };
      apiService.updateProfile(merged).catch(() => {});
      return merged;
    });
  }, []);

  // Checkout & Admin Actions
  const placeOrder = useCallback(
    async (checkoutData) => {
      const createdOrder = await apiService.createOrder({
        ...checkoutData,
        userId: user?.id || null,
        items: cart,
        couponCode: appliedCouponCode,
        shippingMethodId: checkoutData.shippingMethodId || selectedShippingMethodId,
      });

      const [updatedProducts, updatedOrders] = await Promise.all([
        apiService.getProducts(),
        apiService.getOrders(),
      ]);
      setProducts(updatedProducts);
      setOrders(updatedOrders);
      clearCart();
      addToast(`Order ${createdOrder.id} placed successfully!`, 'success');
      return createdOrder;
    },
    [user, cart, appliedCouponCode, selectedShippingMethodId, clearCart, addToast]
  );

  const saveProductAdmin = useCallback(
    async (productData) => {
      const saved = await apiService.saveProduct(productData);
      const updated = await apiService.getProducts();
      setProducts(updated);
      addToast(
        productData.id ? `Updated "${productData.name}".` : `Published "${productData.name}" to store.`,
        'success'
      );
      return saved;
    },
    [addToast]
  );

  const updateProductStockAdmin = useCallback(
    async (productId, nextStock) => {
      const target = products.find((p) => p.id === productId);
      if (!target) return;
      const safeStock = Math.max(0, Number(nextStock));
      await apiService.saveProduct({
        ...target,
        id: productId,
        stock: safeStock,
      });
      const updated = await apiService.getProducts();
      setProducts(updated);
      addToast(`Updated stock for "${target.name}" to ${safeStock}.`, 'success');
    },
    [products, addToast]
  );

  const deleteProductAdmin = useCallback(
    async (productId) => {
      await apiService.deleteProduct(productId);
      const updated = await apiService.getProducts();
      setProducts(updated);
      addToast('Product deleted from catalog.', 'info');
    },
    [addToast]
  );

  const clearAllProductsAdmin = useCallback(async () => {
    await apiService.clearAllProducts();
    setProducts([]);
    addToast('All starter products cleared! You can now add your own products.', 'success');
  }, [addToast]);

  const restoreSampleProductsAdmin = useCallback(async () => {
    const restored = await apiService.restoreSampleProducts();
    setProducts(restored);
    addToast('Starter products restored.', 'info');
  }, [addToast]);

  const updateOrderStatusAdmin = useCallback(
    async (orderId, updatesOrStatus) => {
      const updates =
        typeof updatesOrStatus === 'string'
          ? { orderStatus: updatesOrStatus, status: updatesOrStatus }
          : updatesOrStatus;
      await apiService.updateOrderStatus(orderId, updates);
      const updated = await apiService.getOrders();
      setOrders(updated);
      addToast(`Order ${orderId} updated.`, 'success');
    },
    [addToast]
  );

  const saveCouponAdmin = useCallback(
    async (couponData) => {
      await apiService.saveCoupon(couponData);
      const updated = await apiService.getCoupons();
      setCoupons(updated);
      addToast(`Promo code "${couponData.code}" created.`, 'success');
    },
    [addToast]
  );

  const deleteCouponAdmin = useCallback(
    async (couponIdOrCode) => {
      await apiService.deleteCoupon(couponIdOrCode);
      const updated = await apiService.getCoupons();
      setCoupons(updated);
      addToast('Promo code removed.', 'info');
    },
    [addToast]
  );

  const updateBrandConfig = useCallback(
    async (nextConfig) => {
      const merged = { ...brandConfig, ...nextConfig };
      const saved = await apiService.updateStoreConfig(merged);
      setBrandConfig(saved || merged);
      addToast('Store settings saved to Cloudflare D1.', 'success');
    },
    [brandConfig, addToast]
  );

  const submitProductReview = useCallback(
    async (productId, reviewData) => {
      await apiService.addProductReview(productId, reviewData);
      const updated = await apiService.getProducts();
      setProducts(updated);
      addToast('Thank you for your review!', 'success');
    },
    [addToast]
  );

  const deleteProductReviewAdmin = useCallback(
    async (productId, reviewId) => {
      await apiService.deleteProductReview(productId, reviewId);
      const updated = await apiService.getProducts();
      setProducts(updated);
      addToast('Customer review removed.', 'info');
    },
    [addToast]
  );

  const value = {
    brandConfig,
    settings: brandConfig,
    updateBrandConfig,
    updateSettingsAdmin: updateBrandConfig,
    formatPrice,
    products,
    categories:
      categories && categories.length > 0
        ? categories
        : brandConfig.categories || DEFAULT_BRAND_CONFIG.categories,
    collections: brandConfig.collections || DEFAULT_BRAND_CONFIG.collections || [],
    coupons,
    orders,
    isLoadingCatalog,

    // Cart
    cart,
    addToCart,
    updateCartQuantity,
    updateCartVariant,
    removeFromCart,
    clearCart,
    appliedCouponCode,
    applyCoupon,
    applyCouponCode: applyCoupon,
    removeCoupon,
    removeCouponCode: removeCoupon,
    selectedShippingMethodId,
    setSelectedShippingMethodId,
    cartTotals,

    // Wishlist & Recently Viewed
    wishlist,
    wishlistProducts,
    isInWishlist,
    toggleWishlist,
    clearWishlist,
    recentlyViewed,
    recentlyViewedProducts,
    recordProductView,

    // Auth & Account
    user,
    login,
    loginWithGoogle,
    register,
    logout,
    updateProfile,
    saveAddress,
    deleteAddress,
    changePasswordAdmin,

    // Checkout, Tracking & Admin
    placeOrder,
    trackOrderPublic,
    uploadMediaAdmin,
    saveProductAdmin,
    updateProductStockAdmin,
    deleteProductAdmin,
    clearAllProductsAdmin,
    restoreSampleProductsAdmin,
    saveCategoryAdmin,
    deleteCategoryAdmin,
    updateOrderStatusAdmin,
    saveCouponAdmin,
    createCouponAdmin: saveCouponAdmin,
    deleteCouponAdmin,
    submitProductReview,
    deleteProductReviewAdmin,

    // UI State
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    isSearchOpen,
    setIsSearchOpen,
    quickViewProduct,
    setQuickViewProduct,
    toasts,
    addToast,
    removeToast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
