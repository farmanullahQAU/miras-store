import{C as e,E as t,I as n,L as r,T as i,c as a,t as o,w as s,x as c,y as l}from"./index-DDkW-yOK.js";var u={name:`lock`,size:24,node:[[`rect`,{width:`18`,height:`11`,x:`3`,y:`11`,rx:`2`,ry:`2`,key:`1w4ew1`}],[`path`,{d:`M7 11V7a5 5 0 0 1 10 0v4`,key:`fwvmzm`}]]};u.node;var d=s(u),f={name:`user-plus`,size:24,node:[[`path`,{d:`M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2`,key:`1yyitq`}],[`circle`,{cx:`9`,cy:`7`,r:`4`,key:`nufk8`}],[`line`,{x1:`19`,x2:`19`,y1:`8`,y2:`14`,key:`1bvyxn`}],[`line`,{x1:`22`,x2:`16`,y1:`11`,y2:`11`,key:`1shjgl`}]]};f.node;var p=s(f),m=r(n(),1),h=t();function g({className:e=`w-4 h-4`}){return(0,h.jsxs)(`svg`,{className:e,viewBox:`0 0 24 24`,"aria-hidden":`true`,children:[(0,h.jsx)(`path`,{fill:`#4285F4`,d:`M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z`}),(0,h.jsx)(`path`,{fill:`#34A853`,d:`M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z`}),(0,h.jsx)(`path`,{fill:`#FBBC05`,d:`M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z`}),(0,h.jsx)(`path`,{fill:`#EA4335`,d:`M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z`})]})}var _=`miras_google_saved_accounts_v2`;function v(){try{let e=localStorage.getItem(_);if(e){let t=JSON.parse(e);if(Array.isArray(t))return t}}catch{}return[]}function y(e){try{let t=[e,...v().filter(t=>t.email.toLowerCase()!==e.email.toLowerCase())].slice(0,4);return localStorage.setItem(_,JSON.stringify(t)),t}catch{return[e]}}function b(e,t){return`<!DOCTYPE html>
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
      <p class="subtitle">to continue to <strong>${e}</strong></p>

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
          To continue, Google will share your name, email address, and profile picture with ${e}.
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
    const accounts = ${JSON.stringify(t||[])};
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
  <\/script>
</body>
</html>`}function x({label:t=`Continue with Google`,onSuccess:n,onError:r,className:s=``,compact:u=!1}){let{brandConfig:f,loginWithGoogle:_}=i(),[x,S]=(0,m.useState)(!1),[C,w]=(0,m.useState)(!1),[T,E]=(0,m.useState)(()=>v()),[D,O]=(0,m.useState)(()=>v().length>0?`choose`:`enter_email`),[k,A]=(0,m.useState)(``),[j,M]=(0,m.useState)(``),[N,P]=(0,m.useState)(null),[F,I]=(0,m.useState)(``),L=(0,m.useRef)(null),R=f?.googleClientId||``,z=(0,m.useCallback)(async e=>{I(``),S(!0);try{let t={email:e.email.trim().toLowerCase(),firstName:e.firstName||`Customer`,lastName:e.lastName||``,picture:e.picture||``,googleId:e.googleId||`goog-${Date.now()}`},r=await _(t),i=y({email:t.email,firstName:r?.firstName||t.firstName,lastName:r?.lastName||t.lastName,picture:r?.picture||t.picture});E(i),w(!1),n&&n(r)}catch(e){let t=e.message||`Google authentication failed.`;I(t),r&&r(t)}finally{S(!1)}},[_,n,r]);return(0,m.useEffect)(()=>{let e=e=>{e.origin===window.location.origin&&e.data?.type===`MIRAS_GOOGLE_AUTH_SUCCESS`&&e.data?.account&&z(e.data.account)};return window.addEventListener(`message`,e),()=>window.removeEventListener(`message`,e)},[z]),(0,m.useEffect)(()=>{if(!R)return;let e=()=>{window.google?.accounts?.oauth2&&(L.current=window.google.accounts.oauth2.initTokenClient({client_id:R,scope:`openid email profile`,callback:async e=>{if(e?.access_token){S(!0);try{let t=await _({accessToken:e.access_token});t?.email&&y({email:t.email,firstName:t.firstName,lastName:t.lastName,picture:t.picture||``}),n&&n(t)}catch(e){r&&r(e.message||`Google Sign-In failed.`)}finally{S(!1)}}}}))};if(window.google?.accounts?.oauth2){e();return}if(!document.getElementById(`google-gis-sdk`)){let t=document.createElement(`script`);t.id=`google-gis-sdk`,t.src=`https://accounts.google.com/gsi/client`,t.async=!0,t.defer=!0,t.onload=e,document.head.appendChild(t)}},[R,_,n,r]),(0,h.jsxs)(h.Fragment,{children:[(0,h.jsxs)(`button`,{type:`button`,disabled:x,onClick:()=>{if(I(``),R&&L.current){L.current.requestAccessToken({prompt:`select_account`});return}let e=v();E(e);let t=Math.max(0,Math.round(window.screenX+(window.outerWidth-480)/2)),n=Math.max(0,Math.round(window.screenY+(window.outerHeight-600)/2)),r=window.open(``,`miras_google_oauth_popup`,`width=480,height=600,left=${t},top=${n},resizable=yes,scrollbars=yes,status=yes`);if(r&&!r.closed&&r.document){r.document.open(),r.document.write(b(f?.brandName||`MIRAS`,e)),r.document.close(),r.focus();return}O(e.length>0?`choose`:`enter_email`),w(!0)},className:s||`w-full ${u?`py-2.5 px-3.5 text-xs`:`py-3 px-4 text-xs`} bg-white hover:bg-stone-50 text-[#1C1917] border border-stone-300 hover:border-stone-400 rounded-lg font-semibold flex items-center justify-center gap-3 shadow-2xs transition-all cursor-pointer`,children:[(0,h.jsx)(g,{className:`w-4 h-4 shrink-0`}),(0,h.jsx)(`span`,{children:x?`Signing in with Google...`:t})]}),C&&(0,h.jsx)(`div`,{className:`fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4`,onClick:()=>w(!1),children:(0,h.jsxs)(`div`,{className:`bg-white rounded-2xl border border-stone-200 max-w-[420px] w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150`,onClick:e=>e.stopPropagation(),children:[(0,h.jsxs)(`div`,{className:`px-4 py-2.5 bg-stone-100 border-b border-stone-200 flex items-center justify-between text-[11px] text-stone-600`,children:[(0,h.jsxs)(`div`,{className:`flex items-center gap-1.5 truncate`,children:[(0,h.jsx)(d,{className:`w-3 h-3 text-emerald-700 shrink-0`}),(0,h.jsx)(`span`,{className:`font-mono text-stone-700 truncate`,children:`https://accounts.google.com/o/oauth2/v2/auth`})]}),(0,h.jsx)(`button`,{type:`button`,onClick:()=>w(!1),"aria-label":`Close Google Sign-In`,className:`p-1 rounded-full hover:bg-stone-200/70 text-stone-500 cursor-pointer`,children:(0,h.jsx)(o,{className:`w-4 h-4`})})]}),(0,h.jsxs)(`div`,{className:`px-6 py-3 border-b border-stone-200 flex items-center gap-2.5 bg-white`,children:[(0,h.jsx)(g,{className:`w-4 h-4`}),(0,h.jsx)(`span`,{className:`text-xs font-medium text-stone-600`,children:`Sign in with Google`})]}),(0,h.jsxs)(`div`,{className:`p-6 sm:p-8 space-y-6`,children:[(0,h.jsxs)(`div`,{className:`text-center space-y-1.5`,children:[(0,h.jsx)(`div`,{className:`w-11 h-11 rounded-full bg-[#1C1917] text-[#C59B5F] font-serif font-bold text-lg flex items-center justify-center mx-auto mb-2 shadow-xs`,children:(f?.brandName||`M`)[0]}),(0,h.jsx)(`h2`,{className:`text-xl font-semibold text-[#1C1917]`,children:D===`choose`?`Choose an account`:D===`consent`?`Sign in to ${f?.brandName||`MIRAS`}`:`Sign in`}),(0,h.jsxs)(`p`,{className:`text-xs text-stone-500`,children:[`to continue to`,` `,(0,h.jsx)(`span`,{className:`font-semibold text-[#1a73e8]`,children:f?.brandName||`MIRAS`})]})]}),F&&(0,h.jsx)(`div`,{className:`p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs`,children:F}),D===`choose`&&(0,h.jsx)(`div`,{className:`space-y-2`,children:(0,h.jsxs)(`div`,{className:`divide-y divide-stone-200 border border-stone-200 rounded-xl overflow-hidden`,children:[T.map(e=>(0,h.jsxs)(`button`,{type:`button`,disabled:x,onClick:()=>{P(e),O(`consent`)},className:`w-full px-4 py-3.5 hover:bg-stone-50 flex items-center gap-3.5 text-left transition-colors cursor-pointer`,children:[(0,h.jsx)(`div`,{className:`w-9 h-9 rounded-full bg-[#4285F4] text-white font-semibold text-sm flex items-center justify-center shrink-0 uppercase`,children:(e.firstName||e.email)[0]}),(0,h.jsxs)(`div`,{className:`min-w-0 flex-1`,children:[(0,h.jsx)(`p`,{className:`text-xs font-semibold text-[#1C1917] truncate`,children:`${e.firstName||``} ${e.lastName||``}`.trim()||e.email.split(`@`)[0]}),(0,h.jsx)(`p`,{className:`text-[11px] text-stone-500 truncate`,children:e.email})]}),(0,h.jsx)(c,{className:`w-4 h-4 text-stone-400 shrink-0`})]},e.email)),(0,h.jsxs)(`button`,{type:`button`,onClick:()=>{A(``),M(``),O(`enter_email`)},className:`w-full px-4 py-3.5 hover:bg-stone-50 flex items-center gap-3.5 text-left transition-colors cursor-pointer`,children:[(0,h.jsx)(`div`,{className:`w-9 h-9 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center shrink-0`,children:(0,h.jsx)(p,{className:`w-4 h-4`})}),(0,h.jsx)(`span`,{className:`text-xs font-semibold text-[#1C1917]`,children:`Use another Google account`})]})]})}),D===`enter_email`&&(0,h.jsxs)(`form`,{onSubmit:e=>{e.preventDefault(),I(``);let t=k.trim().toLowerCase();if(!t||!t.includes(`@`)){I(`Enter a valid Google email address (e.g. yourname@gmail.com).`);return}let n=(j.trim()||t.split(`@`)[0].replace(/[._-]+/g,` `).replace(/\b\w/g,e=>e.toUpperCase())).split(` `),r={email:t,firstName:n[0]||`Google`,lastName:n.slice(1).join(` `)||``,googleId:`goog-${Date.now()}`};P(r),O(`consent`)},className:`space-y-4`,children:[(0,h.jsxs)(`div`,{children:[(0,h.jsx)(`label`,{htmlFor:`google-oauth-email`,className:`block text-xs font-semibold text-stone-700 mb-1.5`,children:`Google Email or Gmail Address`}),(0,h.jsx)(`input`,{id:`google-oauth-email`,type:`email`,required:!0,autoFocus:!0,value:k,onChange:e=>A(e.target.value),placeholder:`yourname@gmail.com`,className:`w-full border border-stone-300 focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/20 rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all`})]}),(0,h.jsxs)(`div`,{children:[(0,h.jsxs)(`label`,{htmlFor:`google-oauth-name`,className:`block text-xs font-semibold text-stone-700 mb-1.5`,children:[`Your Full Name`,` `,(0,h.jsx)(`span`,{className:`text-stone-400 font-normal`,children:`(for order receipts)`})]}),(0,h.jsx)(`input`,{id:`google-oauth-name`,type:`text`,value:j,onChange:e=>M(e.target.value),placeholder:`e.g. Amina Khalid`,className:`w-full border border-stone-300 focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/20 rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all`})]}),(0,h.jsxs)(`p`,{className:`text-[11px] text-stone-500 leading-relaxed`,children:[`To continue, Google will share your name, email address, and profile picture with`,` `,(0,h.jsx)(`strong`,{children:f?.brandName||`MIRAS`}),`.`]}),(0,h.jsxs)(`div`,{className:`flex items-center justify-between pt-2`,children:[T.length>0?(0,h.jsx)(`button`,{type:`button`,onClick:()=>O(`choose`),className:`text-xs font-semibold text-[#4285F4] hover:underline cursor-pointer`,children:`Back to saved accounts`}):(0,h.jsx)(`button`,{type:`button`,onClick:()=>w(!1),className:`text-xs font-semibold text-stone-500 hover:text-stone-800 cursor-pointer`,children:`Cancel`}),(0,h.jsxs)(`button`,{type:`submit`,className:`px-6 py-2.5 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold tracking-wide transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs`,children:[(0,h.jsx)(`span`,{children:`Next`}),(0,h.jsx)(e,{className:`w-3.5 h-3.5`})]})]})]}),D===`consent`&&N&&(0,h.jsxs)(`div`,{className:`space-y-5`,children:[(0,h.jsxs)(`div`,{className:`p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-3`,children:[(0,h.jsx)(`div`,{className:`w-10 h-10 rounded-full bg-[#1a73e8] text-white font-semibold text-sm flex items-center justify-center shrink-0 uppercase`,children:(N.firstName||N.email)[0]}),(0,h.jsxs)(`div`,{className:`min-w-0 flex-1`,children:[(0,h.jsx)(`p`,{className:`text-xs font-semibold text-[#1C1917] truncate`,children:`${N.firstName||``} ${N.lastName||``}`.trim()}),(0,h.jsx)(`p`,{className:`text-[11px] text-stone-500 truncate`,children:N.email})]}),(0,h.jsx)(l,{className:`w-4 h-4 text-emerald-600 shrink-0`})]}),(0,h.jsxs)(`div`,{className:`text-[11px] text-stone-600 space-y-2 leading-relaxed bg-stone-50/70 p-3.5 rounded-lg border border-stone-200/70`,children:[(0,h.jsxs)(`p`,{className:`font-semibold text-[#1C1917] flex items-center gap-1.5`,children:[(0,h.jsx)(a,{className:`w-3.5 h-3.5 text-[#1a73e8]`}),(0,h.jsx)(`span`,{children:`Verified Google OAuth 2.0 Session`})]}),(0,h.jsxs)(`p`,{children:[`By continuing, you allow `,(0,h.jsx)(`strong`,{children:f?.brandName||`MIRAS`}),` to associate your orders, saved delivery addresses, and wishlist with`,` `,(0,h.jsx)(`strong`,{children:N.email}),`.`]})]}),(0,h.jsxs)(`div`,{className:`grid grid-cols-2 gap-3 pt-1`,children:[(0,h.jsx)(`button`,{type:`button`,disabled:x,onClick:()=>O(`enter_email`),className:`py-2.5 px-4 rounded-lg border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-700 cursor-pointer`,children:`Change Account`}),(0,h.jsx)(`button`,{type:`button`,disabled:x,onClick:()=>z(N),className:`py-2.5 px-4 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold cursor-pointer shadow-xs`,children:x?`Signing in...`:`Continue`})]})]})]})]})})]})}export{d as n,x as t};