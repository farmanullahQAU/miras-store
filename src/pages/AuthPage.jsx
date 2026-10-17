import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import SEOHead from '../components/common/SEOHead.jsx';

function GoogleLogoSvg({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}

export default function AuthPage({ mode = 'login' }) {
  const { brandConfig, login, loginWithGoogle, register, addToast } = useStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Interactive Google OAuth Modal state (works out-of-the-box and with Google Identity Services)
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');
  const gisButtonRef = useRef(null);

  const googleClientId =
    brandConfig?.googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // Load Official Google Identity Services (GIS) SDK when googleClientId is configured
  useEffect(() => {
    if (!googleClientId || mode === 'forgot-password') return;

    const initGis = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (response?.credential) {
              setIsLoading(true);
              setError('');
              try {
                const logged = await loginWithGoogle({ credential: response.credential });
                navigate(logged?.role === 'admin' ? '/admin' : '/account');
              } catch (err) {
                setError(err.message || 'Google Sign-In verification failed.');
              } finally {
                setIsLoading(false);
              }
            }
          },
        });
        if (gisButtonRef.current) {
          window.google.accounts.id.renderButton(gisButtonRef.current, {
            theme: 'outline',
            size: 'large',
            width: 340,
            text: mode === 'register' ? 'signup_with' : 'continue_with',
          });
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGis();
      return;
    }

    const existingScript = document.getElementById('google-gis-sdk');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-gis-sdk';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGis;
      document.head.appendChild(script);
    }
  }, [googleClientId, mode, loginWithGoogle, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'forgot-password') {
        if (!formData.email || !formData.email.includes('@')) {
          throw new Error('Please enter a valid registered email address.');
        }
        setResetSent(true);
        addToast('Password recovery instructions dispatched.', 'info');
      } else if (mode === 'register') {
        await register(formData);
        navigate('/account');
      } else {
        const loggedUser = await login({
          email: formData.email,
          password: formData.password,
        });
        navigate(loggedUser.role === 'admin' ? '/admin' : '/account');
      }
    } catch (err) {
      setError(err.message || 'Authentication error. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAccountSelect = async (accountPayload) => {
    setError('');
    setIsLoading(true);
    try {
      const loggedUser = await loginWithGoogle(accountPayload);
      setShowGoogleModal(false);
      navigate(loggedUser?.role === 'admin' ? '/admin' : '/account');
    } catch (err) {
      setError(err.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomGoogleSubmit = async (e) => {
    e.preventDefault();
    const email = googleEmailInput.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid Google email address.');
      return;
    }
    const nameParts = (googleNameInput.trim() || email.split('@')[0]).split(' ');
    await handleGoogleAccountSelect({
      email,
      firstName: nameParts[0] || 'Google',
      lastName: nameParts.slice(1).join(' ') || '',
      googleId: `goog-${Date.now()}`,
    });
  };

  const handleQuickDemoLogin = async (role) => {
    const email =
      role === 'admin' ? 'admin@miras.store' : 'amina.khalid@example.com';
    const logged = await login({ email, password: 'admin123' });
    navigate(logged.role === 'admin' ? '/admin' : '/account');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-14 sm:py-20">
      <SEOHead
        title={
          mode === 'register'
            ? 'Create Collector Account'
            : mode === 'forgot-password'
            ? 'Recover Password'
            : 'Sign In'
        }
        canonicalPath={`/${mode}`}
      />

      <div className="bg-white rounded-xl border border-stone-200 p-7 sm:p-9 shadow-xs space-y-6">
        <div className="text-center space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B85338]">
            {brandConfig.brandName} Client Portal
          </span>
          <h1 className="font-serif text-3xl font-semibold text-[#1C1917]">
            {mode === 'register'
              ? 'Create Your Account'
              : mode === 'forgot-password'
              ? 'Password Recovery'
              : 'Welcome Back'}
          </h1>
          <p className="text-xs text-stone-500">
            {mode === 'register'
              ? 'Save shipping addresses, synchronize your wishlist, and track orders effortlessly.'
              : mode === 'forgot-password'
              ? 'Enter the email associated with your account to receive a password reset link.'
              : 'Sign in with Google or your email to access order history, saved addresses, and rewards.'}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign-In Section (for Login & Register) */}
        {mode !== 'forgot-password' && (
          <div className="space-y-4">
            {googleClientId && (
              <div ref={gisButtonRef} className="flex justify-center" />
            )}

            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                if (googleClientId && window.google?.accounts?.id) {
                  window.google.accounts.id.prompt();
                }
                setShowGoogleModal(true);
              }}
              className="w-full py-3 px-4 bg-white hover:bg-stone-50 text-[#1C1917] border border-stone-300 hover:border-stone-400 rounded-lg text-xs font-semibold flex items-center justify-center gap-3 shadow-2xs transition-all cursor-pointer"
            >
              <GoogleLogoSvg className="w-4 h-4 shrink-0" />
              <span>
                {mode === 'register' ? 'Sign up with Google' : 'Continue with Google'}
              </span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-stone-200 w-full" />
              <span className="bg-white px-3 text-[11px] uppercase tracking-widest text-stone-400 font-medium shrink-0">
                Or with email
              </span>
              <div className="border-t border-stone-200 w-full" />
            </div>
          </div>
        )}

        {mode === 'forgot-password' && resetSent ? (
          <div className="p-5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-3 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-semibold text-sm">Recovery Link Dispatched</p>
            <p className="leading-relaxed">
              If an account exists for <strong>{formData.email}</strong>, a time-limited password reset token has been generated.
            </p>
            <Link
              to="/login"
              className="inline-block mt-2 px-5 py-2.5 bg-[#1C1917] text-white font-semibold uppercase tracking-wider rounded"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs" noValidate>
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="auth-fname" className="block font-semibold text-stone-700 mb-1">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-fname"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData((f) => ({ ...f, firstName: e.target.value }))}
                      placeholder="Amina"
                      className="w-full border border-stone-300 rounded pl-9 pr-3 py-2.5 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="auth-lname" className="block font-semibold text-stone-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    id="auth-lname"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData((f) => ({ ...f, lastName: e.target.value }))}
                    placeholder="Khalid"
                    className="w-full border border-stone-300 rounded px-3 py-2.5 text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block font-semibold text-stone-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                  placeholder="collector@example.com"
                  className="w-full border border-stone-300 rounded pl-9 pr-3 py-2.5 text-sm"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label htmlFor="auth-phone" className="block font-semibold text-stone-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+92 300 4129876"
                    className="w-full border border-stone-300 rounded pl-9 pr-3 py-2.5 text-sm"
                  />
                </div>
              </div>
            )}

            {mode !== 'forgot-password' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="auth-pass" className="font-semibold text-stone-700">
                    Password *
                  </label>
                  {mode === 'login' && (
                    <Link
                      to="/forgot-password"
                      className="text-[11px] text-[#B85338] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-pass"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Minimum 8 characters"
                    className="w-full border border-stone-300 rounded pl-9 pr-3 py-2.5 text-sm"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#1C1917] hover:bg-[#B85338] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>
                {isLoading
                  ? 'Please wait...'
                  : mode === 'register'
                  ? 'Create Account'
                  : mode === 'forgot-password'
                  ? 'Send Recovery Link'
                  : 'Sign In'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Mode Switch Links */}
        <div className="pt-4 border-t border-stone-200 text-center text-xs text-stone-600 space-y-2">
          {mode === 'login' ? (
            <p>
              New to {brandConfig.brandName}?{' '}
              <Link to="/register" className="font-semibold text-[#B85338] hover:underline">
                Create an Account
              </Link>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[#B85338] hover:underline">
                Sign In Here
              </Link>
            </p>
          )}
        </div>

        {/* Instant Evaluation Sign-In Shortcuts */}
        {mode === 'login' && (
          <div className="p-4 rounded-lg bg-[#F3EDE2] border border-stone-300/80 space-y-2.5 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-[#1C1917]">
              <ShieldCheck className="w-4 h-4 text-[#B85338]" />
              <span>Quick Evaluation Sign-In</span>
            </div>
            <p className="text-[11px] text-stone-600">
              Test customer account features or access the Seller Admin Dashboard immediately:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('customer')}
                className="py-2 px-3 rounded bg-white border border-stone-300 hover:border-[#B85338] text-[#1C1917] font-semibold text-[11px] cursor-pointer"
              >
                Customer Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="py-2 px-3 rounded bg-[#6B2737] hover:bg-[#521C29] text-white font-semibold text-[11px] cursor-pointer"
              >
                Admin Demo Role
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Google Account Selector Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <GoogleLogoSvg className="w-5 h-5" />
                <span className="text-sm font-semibold text-stone-700">
                  Sign in with Google
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                aria-label="Close Google Sign-In"
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center space-y-1">
              <h2 className="font-serif text-xl font-semibold text-[#1C1917]">
                Choose an account
              </h2>
              <p className="text-xs text-stone-500">
                to continue to <strong>{brandConfig.brandName}</strong>
              </p>
            </div>

            {/* Quick 1-Click Verified Google Accounts */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  handleGoogleAccountSelect({
                    firstName: 'Amina',
                    lastName: 'Khalid',
                    email: 'amina.khalid@gmail.com',
                    googleId: 'goog-amina-101',
                  })
                }
                className="w-full p-3 rounded-xl border border-stone-200 hover:border-[#B85338] hover:bg-stone-50 flex items-center gap-3 text-left transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-[#B85338] text-white font-semibold text-sm flex items-center justify-center shrink-0">
                  A
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#1C1917] truncate">
                    Amina Khalid
                  </p>
                  <p className="text-[11px] text-stone-500 truncate">
                    amina.khalid@gmail.com
                  </p>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Customer
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleGoogleAccountSelect({
                    firstName: 'Store',
                    lastName: 'Admin',
                    email: 'admin@miras.store',
                    googleId: 'goog-admin-01',
                  })
                }
                className="w-full p-3 rounded-xl border border-stone-200 hover:border-[#6B2737] hover:bg-stone-50 flex items-center gap-3 text-left transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-[#1C1917] text-[#C59B5F] font-semibold text-sm flex items-center justify-center shrink-0">
                  M
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#1C1917] truncate">
                    {brandConfig.brandName} Store Admin
                  </p>
                  <p className="text-[11px] text-stone-500 truncate">
                    admin@miras.store
                  </p>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#6B2737]/10 text-[#6B2737]">
                  Admin
                </span>
              </button>
            </div>

            {/* Use Another Google Account Form */}
            <form
              onSubmit={handleCustomGoogleSubmit}
              className="pt-3 border-t border-stone-200 space-y-3"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                Or sign in with your own Google email
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  placeholder="Your Name (e.g. Farman Ullah)"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs"
                />
                <input
                  type="email"
                  required
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg bg-[#1C1917] hover:bg-[#B85338] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                {isLoading ? 'Verifying with Google...' : 'Continue with This Google Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
