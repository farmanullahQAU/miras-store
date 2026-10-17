import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import SEOHead from '../components/common/SEOHead.jsx';
import GoogleSignInButton from '../components/common/GoogleSignInButton.jsx';

export default function AuthPage({ mode = 'login' }) {
  const { brandConfig, login, register, addToast } = useStore();
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
            <GoogleSignInButton
              label={mode === 'register' ? 'Sign up with Google' : 'Continue with Google'}
              onSuccess={(loggedUser) => {
                navigate(loggedUser?.role === 'admin' ? '/admin' : '/account');
              }}
              onError={(msg) => setError(msg)}
            />

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
      </div>
    </div>
  );
}
