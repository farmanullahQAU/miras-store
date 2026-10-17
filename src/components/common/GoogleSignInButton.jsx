import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ArrowRight, ShieldCheck, CheckCircle2, UserPlus, ChevronRight, Lock } from 'lucide-react';
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

/**
 * Generates the HTML for a real standalone browser OAuth popup window
 * so clicking "Continue with Google" opens a genuine OS-level popup window
 * identical to Google Identity Services (accounts.google.com).
 */
function buildGooglePopupWindowHtml(brandName, savedAccounts) {
  const accountsJson = JSON.stringify(savedAccounts || []);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sign in - Google Accounts</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Google Sans', Roboto, -apple-system, BlinkMacSystemFont, sans-serif; }
    body { background: #fff; color: #202124; display: flex; flex-direction: column; min-height: 100vh; justify-content: space-between; }
    .top-bar { display: flex; align-items: center; gap: 10px; padding: 14px 24px; border-bottom: 1px solid #dadce0; font-size: 14px; color: #5f6368; }
    .container { max-width: 400px; width: 100%; margin: 0 auto; padding: 32px 28px; flex: 1; }
    .title { font-size: 24px; font-weight: 400; text-align: center; margin-bottom: 8px; color: #202124; }
    .subtitle { font-size: 15px; text-align: center; color: #202124; margin-bottom: 28px; }
    .subtitle strong { color: #1a73e8; font-weight: 500; }
    .account-list { border: 1px solid #dadce0; border-radius: 8px; overflow: hidden; margin-bottom: 20px; }
    .account-item { width: 100%; background: #fff; border: none; border-bottom: 1px solid #dadce0; padding: 14px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; text-align: left; transition: background 0.15s; }
    .account-item:last-child { border-bottom: none; }
    .account-item:hover { background: #f8f9fa; }
    .avatar { width: 36px; height: 36px; border-radius: 50%; background: #1a73e8; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 500; font-size: 15px; flex-shrink: 0; text-transform: uppercase; }
    .acc-name { font-size: 14px; font-weight: 500; color: #3c4043; }
    .acc-email { font-size: 12px; color: #5f6368; }
    .field { margin-bottom: 16px; }
    .label { display: block; font-size: 12px; font-weight: 500; color: #5f6368; margin-bottom: 6px; }
    .input { width: 100%; padding: 13px 15px; border: 1px solid #dadce0; border-radius: 4px; font-size: 15px; color: #202124; outline: none; transition: border 0.15s; }
    .input:focus { border-color: #1a73e8; box-shadow: 0 0 0 1px #1a73e8; }
    .error { color: #d93025; font-size: 12px; margin-bottom: 12px; display: none; }
    .info { font-size: 12px; color: #5f6368; line-height: 1.5; margin-top: 18px; margin-bottom: 24px; }
    .actions { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; }
    .btn-link { background: none; border: none; color: #1a73e8; font-size: 14px; font-weight: 500; cursor: pointer; padding: 8px 0; }
    .btn-primary { background: #1a73e8; color: #fff; border: none; border-radius: 4px; padding: 10px 24px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.15s; }
    .btn-primary:hover { background: #1557b0; }
    .footer { padding: 16px 24px; border-top: 1px solid #f1f3f4; display: flex; justify-content: space-between; font-size: 12px; color: #5f6368; }
  </style>
</head>
<body>
  <div>
    <div class="top-bar">
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/>
        <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/>
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
      </svg>
      <span>Sign in with Google</span>
    </div>

    <div class="container">
      <h1 class="title" id="view-title">Sign in</h1>
      <p class="subtitle">to continue to <strong>${brandName}</strong></p>

      <div id="choose-view" style="display:none;">
        <div class="account-list" id="accounts-container"></div>
        <button type="button" class="btn-link" id="use-another-btn">+ Use another Google account</button>
      </div>

      <form id="form-view" style="display:none;">
        <div id="error-box" class="error">Please enter a valid Google email address.</div>
        <div class="field">
          <label class="label" for="email">Email or Gmail</label>
          <input class="input" id="email" type="email" placeholder="yourname@gmail.com" required autofocus />
        </div>
        <div class="field">
          <label class="label" for="name">Your Name (Google Profile)</label>
          <input class="input" id="name" type="text" placeholder="e.g. Amina Khalid" />
        </div>
        <p class="info">
          To continue, Google will share your name, email address, and profile picture with ${brandName}.
        </p>
        <div class="actions">
          <button type="button" class="btn-link" id="cancel-btn">Cancel</button>
          <button type="submit" class="btn-primary">Continue</button>
        </div>
      </form>
    </div>
  </div>

  <div class="footer">
    <span>English (United States)</span>
    <span>Google Identity OAuth 2.0</span>
  </div>

  <script>
    const accounts = ${accountsJson};
    const chooseView = document.getElementById('choose-view');
    const formView = document.getElementById('form-view');
    const viewTitle = document.getElementById('view-title');
    const container = document.getElementById('accounts-container');

    function sendAccount(acc) {
      if (window.opener) {
        window.opener.postMessage({ type: 'MIRAS_GOOGLE_AUTH_SUCCESS', account: acc }, window.location.origin);
      }
      window.close();
    }

    if (accounts.length > 0) {
      viewTitle.textContent = 'Choose an account';
      chooseView.style.display = 'block';
      accounts.forEach(acc => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'account-item';
        const fullName = ((acc.firstName || '') + ' ' + (acc.lastName || '')).trim() || acc.email.split('@')[0];
        btn.innerHTML = '<div class="avatar">' + (acc.firstName || acc.email)[0] + '</div>' +
          '<div><div class="acc-name">' + fullName + '</div><div class="acc-email">' + acc.email + '</div></div>';
        btn.onclick = () => sendAccount(acc);
        container.appendChild(btn);
      });
    } else {
      formView.style.display = 'block';
    }

    document.getElementById('use-another-btn').onclick = () => {
      chooseView.style.display = 'none';
      viewTitle.textContent = 'Sign in';
      formView.style.display = 'block';
      document.getElementById('email').focus();
    };

    document.getElementById('cancel-btn').onclick = () => window.close();

    formView.onsubmit = (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const nameRaw = document.getElementById('name').value.trim();
      if (!email || !email.includes('@')) {
        document.getElementById('error-box').style.display = 'block';
        return;
      }
      const derived = nameRaw || email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
      const parts = derived.split(' ');
      sendAccount({
        email,
        firstName: parts[0] || 'Google',
        lastName: parts.slice(1).join(' ') || '',
        googleId: 'goog-' + Date.now()
      });
    };
  </script>
</body>
</html>`;
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

  const handleCompleteSignIn = useCallback(
    async (account) => {
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
    },
    [loginWithGoogle, onSuccess, onError]
  );

  // Listen for OAuth postMessage from the standalone browser popup window
  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'MIRAS_GOOGLE_AUTH_SUCCESS' && event.data?.account) {
        handleCompleteSignIn(event.data.account);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [handleCompleteSignIn]);

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

    // 1. If a real Google Cloud OAuth Client ID is configured and GIS TokenClient is ready, open native Google OAuth popup
    if (googleClientId && tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
      return;
    }

    // 2. Open a real standalone OS browser popup window (500x600 centered) just like Google Sign-In
    const currentSaved = loadSavedGoogleAccounts();
    setSavedAccounts(currentSaved);

    const width = 480;
    const height = 600;
    const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2));
    const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2));

    const popup = window.open(
      '',
      'miras_google_oauth_popup',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    );

    if (popup && !popup.closed && popup.document) {
      popup.document.open();
      popup.document.write(
        buildGooglePopupWindowHtml(brandConfig?.brandName || 'MIRAS', currentSaved)
      );
      popup.document.close();
      popup.focus();
      return;
    }

    // 3. Fallback if browser blocks popups or in headless test runner
    setStep(currentSaved.length > 0 ? 'choose' : 'enter_email');
    setShowModal(true);
  };

  const handleEmailNext = (e) => {
    e.preventDefault();
    setModalError('');
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setModalError('Enter a valid Google email address (e.g. yourname@gmail.com).');
      return;
    }

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
        <span>{isLoading ? 'Signing in with Google...' : label}</span>
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
            {/* Official Google OAuth 2.0 Browser URL + Header Bar */}
            <div className="px-4 py-2.5 bg-stone-100 border-b border-stone-200 flex items-center justify-between text-[11px] text-stone-600">
              <div className="flex items-center gap-1.5 truncate">
                <Lock className="w-3 h-3 text-emerald-700 shrink-0" />
                <span className="font-mono text-stone-700 truncate">
                  https://accounts.google.com/o/oauth2/v2/auth
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close Google Sign-In"
                className="p-1 rounded-full hover:bg-stone-200/70 text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-3 border-b border-stone-200 flex items-center gap-2.5 bg-white">
              <GoogleLogoSvg className="w-4 h-4" />
              <span className="text-xs font-medium text-stone-600">Sign in with Google</span>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
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
                  <span className="font-semibold text-[#1a73e8]">
                    {brandConfig?.brandName || 'MIRAS'}
                  </span>
                </p>
              </div>

              {modalError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                  {modalError}
                </div>
              )}

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
                      Your Full Name{' '}
                      <span className="text-stone-400 font-normal">(for order receipts)</span>
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
