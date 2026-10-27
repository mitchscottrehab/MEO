/* Comeback Blueprint pop-up + floating tab.
   Scroll/time-triggered name + email form. Sends to MailerLite (ML_URL) and a backup email via Web3Forms. */
(function () {
  window.meoOpenBlueprint = function () { location.href = 'comeback-blueprint-m7k2q.html'; };
  var ML_URL = 'https://assets.mailerlite.com/jsonp/2744689/forms/202425378396964812/subscribe';
  var GUIDE = 'comeback-blueprint-m7k2q.html';
  var KEY = 'meoBlueprint';          // JSON: {n: times auto-shown, t: last shown ms, done: signed up}
  var OLD = 'meoBlueprintSeen';      // earlier version of the key (timestamp)
  var TRIGGER = 0.5, DELAY = 30000;  // 50% scroll or 30 seconds, whichever first
  var MAX_SHOWS = 3, GAP_MS = 3 * 24 * 3600 * 1000; // up to 3 times, at least 3 days apart
  var FORCE = /[?&]popup=1/.test(location.search);

  function load() {
    var s = { n: 0, t: 0, done: false };
    try {
      var j = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (j) s = { n: j.n || 0, t: j.t || 0, done: !!j.done };
      else { var o = localStorage.getItem(OLD); if (o) { s.n = 1; s.t = +o || Date.now(); } }
    } catch (e) {}
    return s;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  var st = load();
  if (st.done && !FORCE) return;

  var css = ''
  + '#cbpOv{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(22,32,26,0);-webkit-backdrop-filter:blur(0);backdrop-filter:blur(0);visibility:hidden;opacity:0;pointer-events:none;transition:opacity .9s cubic-bezier(.22,.8,.24,1),background .9s ease,backdrop-filter .9s ease,-webkit-backdrop-filter .9s ease,visibility 0s linear .9s}'
  + '#cbpOv.on{visibility:visible;opacity:1;pointer-events:auto;background:rgba(22,32,26,.6);-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);transition-delay:0s}'
  + '#cbpBox{position:relative;width:100%;max-width:430px;max-height:calc(100dvh - 40px);overflow:auto;background:var(--stone,#F1EDE3);color:var(--ink,#16201A);padding:30px 28px 24px;border-radius:20px;font-family:Inter,system-ui,sans-serif;box-shadow:0 24px 70px rgba(0,0,0,.35);transform:translateY(28px) scale(.97);opacity:0;transition:transform 1.1s cubic-bezier(.16,1,.3,1),opacity .9s ease}'
  + '#cbpOv.on #cbpBox{transform:none;opacity:1;transition-delay:.12s}'
  + '#cbpBox h2{font-family:Inter,sans-serif;font-weight:900;font-size:clamp(1.05rem,5.4vw,1.5rem);line-height:1.1;letter-spacing:-.03em;margin:0 0 10px;white-space:nowrap}'
  + '#cbpBox p{margin:0 0 14px;font-size:.95rem;line-height:1.45}'
  + '#cbpBox .cbp-sub{font-weight:600}'
  + '#cbpBox label.f{display:block;font-size:.85rem;margin-bottom:11px}'
  + '#cbpBox input[type=text],#cbpBox input[type=email]{display:block;width:100%;box-sizing:border-box;margin-top:5px;padding:11px 12px;font:inherit;font-size:1rem;border:1px solid #8a9a8f;background:#fff;color:inherit;border-radius:10px}'
  + '#cbpBox .cbp-c{display:flex;gap:10px;align-items:flex-start;font-size:.78rem;line-height:1.4;margin:4px 0 11px}'
  + '#cbpBox .cbp-c input{margin-top:3px;flex:none}'
  + '#cbpBox button.go,#cbpBox a.go{display:block;width:100%;box-sizing:border-box;padding:14px;border:0;border-radius:12px;background:#F95132;color:#fff;font:inherit;font-weight:600;font-size:1rem;text-align:center;text-decoration:none;cursor:pointer}'
  + '#cbpBox button.go:disabled{opacity:.6}'
  + '#cbpBox .cbp-fine{font-size:.78rem;margin:15px 0 0}'
  + '#cbpBox .cbp-no{display:block;margin:0 auto;border:0;background:none;font:inherit;font-size:.85rem;text-decoration:underline;cursor:pointer;color:inherit;padding:4px}'
  + '#cbpBox a.ln{display:block;margin-top:14px;font-size:.92rem}'
  + '#cbpMsg{margin:10px 0 0;font-size:.85rem;color:#a02b14;display:none}'
  + '#cbpTab{position:fixed;left:16px;bottom:18px;z-index:9000;display:none;align-items:center;gap:8px;padding:10px 16px;border:0;border-radius:999px;background:var(--ink,#16201A);color:var(--stone,#F1EDE3);font:600 .85rem Inter,system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.28);opacity:0;transform:translateY(10px);transition:opacity .6s ease,transform .6s cubic-bezier(.16,1,.3,1)}'
  + '#cbpTab.vis{display:inline-flex}#cbpTab.in{opacity:1;transform:none}'
  + '#cbpTab i{width:8px;height:8px;border-radius:50%;background:#F95132;display:inline-block}'
  + '@media(max-width:600px){'
  +   '#cbpOv{align-items:flex-end;padding:0 12px calc(12px + env(safe-area-inset-bottom,0px))}'
  +   '#cbpBox{max-width:380px;margin:0 auto;max-height:78dvh;padding:22px 18px 16px;border-radius:18px;transform:translateY(60px);opacity:0}'
  +   '#cbpOv.on #cbpBox{transform:none;opacity:1}'
  +   '#cbpBox p{font-size:.86rem;margin-bottom:10px}#cbpBox h2{margin-bottom:8px}'
  +   '#cbpBox label.f{font-size:.8rem;margin-bottom:8px}#cbpBox input[type=text],#cbpBox input[type=email]{padding:9px 11px;font-size:.95rem}'
  +   '#cbpBox button.go{padding:12px}#cbpBox .cbp-fine,#cbpBox .cbp-c{font-size:.72rem}'
  +   '#cbpTab{display:none!important}'
  + '}'
  + '@media(prefers-reduced-motion:reduce){#cbpOv,#cbpBox,#cbpTab{transition-duration:.01s!important;transition-delay:0s!important}}';
  var sty = document.createElement('style'); sty.textContent = css; document.head.appendChild(sty);

  var ov = document.createElement('div'); ov.id = 'cbpOv';
  ov.innerHTML = '<div id="cbpBox" role="dialog" aria-modal="true" aria-labelledby="cbpT">'
  + '<div id="cbpA"><h2 id="cbpT">Want my Comeback Blueprint?</h2>'
  + '<p class="cbp-sub">For runners, lifters, and athletes who are tired of being told to rest and have no clue where to start.</p>'
  + '<p>A FREE guide, with 5 actionable moves you can make today. It’s a 10 min read and if you have any questions, DM me and we can chat some more.</p>'
  + '<form id="cbpForm" novalidate>'
  + '<input type="hidden" name="access_key" value="9dd1ccda-340e-45ce-a69d-4a8da99e12ce">'
  + '<input type="hidden" name="subject" value="Comeback Blueprint request">'
  + '<input type="hidden" name="from_name" value="MEO Website Blueprint Pop-up">'
  + '<input type="checkbox" name="botcheck" style="display:none" tabindex="-1" autocomplete="off">'
  + '<label class="f">First name<input type="text" name="name" required autocomplete="given-name"></label>'
  + '<label class="f">Email<input type="email" name="email" required autocomplete="email"></label>'
  + '<button class="go" type="submit">Send me the Blueprint</button>'
  + '<p class="cbp-fine">I’ll email you a copy and that’s it. No mailing list unless you say yes below. <a href="privacy-policy.html" target="_blank">Privacy policy</a></p>'
  + '<label class="cbp-c"><input type="checkbox" name="marketing_opt_in" value="yes"><span>Send me the occasional email about training around injury. Unsubscribe any time.</span></label>'
  + '<p id="cbpMsg" role="alert"></p></form>'
  + '<button class="cbp-no" type="button">No thanks</button></div>'
  + '<div id="cbpB" hidden><h2>It’s yours.</h2><p>Open the Blueprint here:</p>'
  + '<a class="go" href="' + GUIDE + '">Open the Blueprint</a>'
  + '<p class="cbp-fine">A copy’s on its way to your inbox too, so check junk if it’s not there in a few minutes.</p>'
  + '<a class="ln" href="the-solution.html">Want to talk it through? Book a Performance Assessment</a></div></div>';
  document.body.appendChild(ov);

  var tab = document.createElement('button'); tab.id = 'cbpTab'; tab.type = 'button';
  tab.setAttribute('aria-label', 'Free guide: The Comeback Blueprint');
  tab.innerHTML = '<i></i>Free Comeback Blueprint';
  document.body.appendChild(tab);

  var shown = false, lastFocus = null;
  function showTab() { if (st.done && !FORCE) return; tab.classList.add('vis'); requestAnimationFrame(function () { requestAnimationFrame(function () { tab.classList.add('in'); }); }); }
  function hideTab() { tab.classList.remove('in'); }
  function open(auto) {
    if (ov.classList.contains('on')) return;
    if (auto) { if (shown) return; shown = true; st.n += 1; st.t = Date.now(); save(); }
    lastFocus = document.activeElement; hideTab(); ov.classList.add('on');
    var i = ov.querySelector('input[name=name]'); if (i && !ov.querySelector('#cbpA').hidden) setTimeout(function () { try { i.focus({ preventScroll: true }); } catch (e) {} }, 400);
  }
  function close() { ov.classList.remove('on'); if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) {} setTimeout(showTab, 700); }
  ov.querySelector('.cbp-no').addEventListener('click', close);
  ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ov.classList.contains('on')) close(); });
  tab.addEventListener('click', function () { open(false); });
  window.meoOpenBlueprint = function () { open(false); };

  // Auto pop-up: allowed if never shown, or shown fewer than MAX_SHOWS times and the last was long enough ago.
  var allowAuto = FORCE || st.n === 0 || (st.n < MAX_SHOWS && Date.now() - st.t > GAP_MS);
  if (allowAuto) {
    var onScroll = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if (h > 0 && window.scrollY / h >= TRIGGER) { window.removeEventListener('scroll', onScroll); open(true); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    setTimeout(function () { window.removeEventListener('scroll', onScroll); open(true); }, DELAY);
  } else {
    setTimeout(showTab, 2500); // already seen it recently: just offer the tab
  }

  function submitLead(fd) {
    var w3 = fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { Accept: 'application/json' }, body: fd }).then(function (r) { return r.json(); });
    if (!ML_URL) return w3;
    var ml = new URLSearchParams();
    ml.set('fields[name]', fd.get('name')); ml.set('fields[email]', fd.get('email'));
    ml.set('fields[marketing_opt_in]', fd.get('marketing_opt_in')); ml.set('ml-submit', '1'); ml.set('anticsrf', 'true');
    var mlp = fetch(ML_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: ml.toString() });
    return Promise.all([w3.catch(function () { return { success: false }; }), mlp.then(function () { return true; })]).then(function () { return { success: true }; });
  }
  var form = ov.querySelector('#cbpForm'), msg = ov.querySelector('#cbpMsg'), btn = form.querySelector('.go');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var n = form.elements.name.value.trim(), em = form.elements.email.value.trim();
    msg.style.display = 'none';
    if (!n || !/^\S+@\S+\.\S+$/.test(em)) { msg.textContent = 'Add your first name and a valid email to continue.'; msg.style.display = 'block'; return; }
    btn.disabled = true; btn.textContent = 'One sec...';
    if (!form.elements.marketing_opt_in.checked) { var h = document.createElement('input'); h.type = 'hidden'; h.name = 'marketing_opt_in'; h.value = 'no'; form.appendChild(h); }
    submitLead(new FormData(form)).then(function (res) {
      if (!res.success) throw new Error(res.message || 'failed');
      if (window.fbq) { fbq('track', 'Lead'); }
      st.done = true; save(); tab.classList.remove('vis', 'in');
      ov.querySelector('#cbpA').hidden = true; ov.querySelector('#cbpB').hidden = false;
    }).catch(function () {
      btn.disabled = false; btn.textContent = 'Send me the Blueprint';
      msg.textContent = 'That did not go through. Try again, or email admin@meorehabperformance.com.'; msg.style.display = 'block';
    });
  });
})();
