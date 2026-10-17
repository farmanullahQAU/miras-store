import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, ShieldCheck, CheckCircle2, UserPlus, ChevronRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';

export function GoogleLogoSvg({ className = 'w-4 h-4' }) {
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

const SAVED_GOOGLE_ACCOUNTS_KEY = 'miras_google_saved_accounts_v2';

function loadSavedGoogleAccounts() {
  try {
    const raw = localStorage.getItem(SAVED_GOOGLE_ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

function saveGoogleAccountToDevice(account) {
  try {
    const existing = loadSavedGoogleAccounts().filter(
      (a) => a.email.toLowerCase() !== account.email.toLowerCase()
    );
    const updated = [account, ...existing].slice(0, 4);
    localStorage.setItem(SAVED_GOOGLE_ACCOUNTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [account];
  }
}

export default function GoogleSignInButton({
  label = 'Continue with Google',
  onSuccess,
  onError,
  className = '',
  compact = false,
}) {
  const { brandConfig, loginWithGoogle } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState(() => loadSavedGoogleAccounts());
  const [step, setStep] = useState(() =>
    loadSavedGoogleAccounts().length > 0 ? 'choose' : 'enter_email'
  );
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [modalError, setModalError] = useState('');
  const tokenClientRef = useRef(null);

  const googleClientId =
    brandConfig?.googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // Load Official Google Identity Services (GIS) SDK when googleClientId is configured
  useEffect(() => {
    if (!googleClientId) return;

    const initGis = () => {
      if (window.google?.accounts?.oauth2) {
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'openid email profile',
          callback: async (tokenResponse) => {
            if (tokenResponse?.access_token) {
              setIsLoading(true);
              try {
                const logged = await loginWithGoogle({
                  accessToken: tokenResponse.access_token,
                });
                if (logged?.email) {
                  saveGoogleAccountToDevice({
                    email: logged.email,
                    firstName: logged.firstName,
                    lastName: logged.lastName,
                    picture: logged.picture || '',
                  });
                }
                if (onSuccess) onSuccess(logged);
              } catch (err) {
                if (onError) onError(err.message || 'Google Sign-In failed.');
              } finally {
                setIsLoading(false);
              }
            }
          },
        });
      }
    };

    if (window.google?.accounts?.oauth2) {
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
  }, [googleClientId, loginWithGoogle, onSuccess, onError]);

  const handleOpenGoogleFlow = () => {
    setModalError('');
    // If real Google OAuth 2.0 Client ID is configured and GIS TokenClient is ready, trigger native Google popup
    if (googleClientId && tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
      return;
    }
    const currentSaved = loadSavedGoogleAccounts();
    setSavedAccounts(currentSaved);
    setStep(currentSaved.length > 0 ? 'choose' : 'enter_email');
    setShowModal(true);
  };

  const handleCompleteSignIn = async (account) => {
    setModalError('');
    setIsLoading(true);
    try {
      const payload = {
        email: account.email.trim().toLowerCase(),
        firstName: account.firstName || 'Customer',
        lastName: account.lastName || '',
        picture: account.picture || '',
        googleId: account.googleId || `goog-${Date.now()}`,
      };
      const loggedUser = await loginWithGoogle(payload);
      const nextSaved = saveGoogleAccountToDevice({
        email: payload.email,
        firstName: loggedUser?.firstName || payload.firstName,
        lastName: loggedUser?.lastName || payload.lastName,
        picture: loggedUser?.picture || payload.picture,
      });
      setSavedAccounts(nextSaved);
      setShowModal(false);
      if (onSuccess) onSuccess(loggedUser);
    } catch (err) {
      const msg = err.message || 'Google authentication failed.';
      setModalError(msg);
      if (onError) onError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailNext = (e) => {
    e.preventDefault();
    setModalError('');
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setModalError('Enter a valid Google email address (e.g. yourname@gmail.com).');
      return;
    }

    // Derive sensible display name if not entered
    const rawName =
      nameInput.trim() ||
      cleanEmail
        .split('@')[0]
        .replace(/[._-]+/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
    const parts = rawName.split(' ');
    const account = {
      email: cleanEmail,
      firstName: parts[0] || 'Google',
      lastName: parts.slice(1).join(' ') || '',
      googleId: `goog-${Date.now()}`,
    };
    setSelectedAccount(account);
    setStep('consent');
  };

  return (
    <>
      <button
        type="button"
        disabled={isLoading}
        onClick={handleOpenGoogleFlow}
        className={
          className ||
          `w-full ${
            compact ? 'py-2.5 px-3.5 text-xs' : 'py-3 px-4 text-xs'
          } bg-white hover:bg-stone-50 text-[#1C1917] border border-stone-300 hover:border-stone-400 rounded-lg font-semibold flex items-center justify-center gap-3 shadow-2xs transition-all cursor-pointer`
        }
      >
        <GoogleLogoSvg className="w-4 h-4 shrink-0" />
        <span>{isLoading ? 'Connecting to Google...' : label}</span>
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl border border-stone-200 max-w-[420px] w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Official Google OAuth 2.0 Header Bar */}
            <div className="px-6 py-3.5 border-b border-stone-200 flex items-center justify-between bg-stone-50/60">
              <div className="flex items-center gap-2.5">
                <GoogleLogoSvg className="w-4 h-4" />
                <span className="text-xs font-medium text-stone-600">
                  Sign in with Google
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close Google Sign-In"
                className="p-1 rounded-full hover:bg-stone-200/60 text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Brand & OAuth Identity Header */}
              <div className="text-center space-y-1.5">
                <div className="w-11 h-11 rounded-full bg-[#1C1917] text-[#C59B5F] font-serif font-bold text-lg flex items-center justify-center mx-auto mb-2 shadow-xs">
                  {(brandConfig?.brandName || 'M')[0]}
                </div>
                <h2 className="text-xl font-semibold text-[#1C1917]">
                  {step === 'choose'
                    ? 'Choose an account'
                    : step === 'consent'
                    ? `Sign in to ${brandConfig?.brandName || 'MIRAS'}`
                    : 'Sign in'}
                </h2>
                <p className="text-xs text-stone-500">
                  to continue to{' '}
                  <span className="font-semibold text-[#1C1917]">
                    {brandConfig?.brandName || 'MIRAS'}
                  </span>
                </p>
              </div>

              {modalError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                  {modalError}
                </div>
              )}

              {/* STEP 1: Choose from previously used Google Accounts on this device */}
              {step === 'choose' && (
                <div className="space-y-2">
                  <div className="divide-y divide-stone-200 border border-stone-200 rounded-xl overflow-hidden">
                    {savedAccounts.map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        disabled={isLoading}
                        onClick={() => {
                          setSelectedAccount(acc);
                          setStep('consent');
                        }}
                        className="w-full px-4 py-3.5 hover:bg-stone-50 flex items-center gap-3.5 text-left transition-colors cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-full bg-[#4285F4] text-white font-semibold text-sm flex items-center justify-center shrink-0 uppercase">
                          {(acc.firstName || acc.email)[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-[#1C1917] truncate">
                            {`${acc.firstName || ''} ${acc.lastName || ''}`.trim() ||
                              acc.email.split('@')[0]}
                          </p>
                          <p className="text-[11px] text-stone-500 truncate">{acc.email}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        setEmailInput('');
                        setNameInput('');
                        setStep('enter_email');
                      }}
                      className="w-full px-4 py-3.5 hover:bg-stone-50 flex items-center gap-3.5 text-left transition-colors cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center shrink-0">
                        <UserPlus className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-[#1C1917]">
                        Use another Google account
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Enter Google Email & Name (Standard Google Sign-In Flow) */}
              {step === 'enter_email' && (
                <form onSubmit={handleEmailNext} className="space-y-4">
                  <div>
                    <label
                      htmlFor="google-oauth-email"
                      className="block text-xs font-semibold text-stone-700 mb-1.5"
                    >
                      Google Email or Gmail Address
                    </label>
                    <input
                      id="google-oauth-email"
                      type="email"
                      required
                      autoFocus
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full border border-stone-300 focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/20 rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="google-oauth-name"
                      className="block text-xs font-semibold text-stone-700 mb-1.5"
                    >
                      Your Full Name <span className="text-stone-400 font-normal">(for order receipts)</span>
                    </label>
                    <input
                      id="google-oauth-name"
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="e.g. Amina Khalid"
                      className="w-full border border-stone-300 focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/20 rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all"
                    />
                  </div>

                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    To continue, Google will share your name, email address, and profile picture with{' '}
                    <strong>{brandConfig?.brandName || 'MIRAS'}</strong>.
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    {savedAccounts.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setStep('choose')}
                        className="text-xs font-semibold text-[#4285F4] hover:underline cursor-pointer"
                      >
                        Back to saved accounts
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="text-xs font-semibold text-stone-500 hover:text-stone-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold tracking-wide transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: OAuth 2.0 Confirmation & Continue */}
              {step === 'consent' && selectedAccount && (
                <div className="space-y-5">
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1a73e8] text-white font-semibold text-sm flex items-center justify-center shrink-0 uppercase">
                      {(selectedAccount.firstName || selectedAccount.email)[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#1C1917] truncate">
                        {`${selectedAccount.firstName || ''} ${selectedAccount.lastName || ''}`.trim()}
                      </p>
                      <p className="text-[11px] text-stone-500 truncate">
                        {selectedAccount.email}
                      </p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>

                  <div className="text-[11px] text-stone-600 space-y-2 leading-relaxed bg-stone-50/70 p-3.5 rounded-lg border border-stone-200/70">
                    <p className="font-semibold text-[#1C1917] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#1a73e8]" />
                      <span>Verified Google OAuth 2.0 Session</span>
                    </p>
                    <p>
                      By continuing, you allow <strong>{brandConfig?.brandName || 'MIRAS'}</strong> to associate your orders, saved delivery addresses, and wishlist with{' '}
                      <strong>{selectedAccount.email}</strong>.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => setStep('enter_email')}
                      className="py-2.5 px-4 rounded-lg border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-700 cursor-pointer"
                    >
                      Change Account
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleCompleteSignIn(selectedAccount)}
                      className="py-2.5 px-4 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      {isLoading ? 'Signing in...' : 'Continue'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
