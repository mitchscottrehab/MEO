/* Comeback Blueprint pop-up. Scroll-triggered name + email form, then redirect to the hidden guide.
   TO SWAP TO MAILERLITE: change SUBMIT_URL/handler in submitLead() once the embed code exists. */
(function () {
  // Paste the MailerLite form action URL here, e.g. https://assets.mailerlite.com/jsonp/123456/forms/7890123456/subscribe
  var ML_URL = 'https://assets.mailerlite.com/jsonp/2744689/forms/202425378396964812/subscribe';
  var GUIDE = 'comeback-blueprint-m7k2q.html';
  var KEY = 'meoBlueprintSeen';
  var TRIGGER = 0.5, DELAY = 30000; // 50% scroll or 30 seconds, whichever first
  var FORCE = /[?&]popup=1/.test(location.search);
  try { if (!FORCE && localStorage.getItem(KEY)) return; } catch (e) {}

  var css = '#cbpOv{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(22,32,26,0);-webkit-backdrop-filter:blur(0);backdrop-filter:blur(0);visibility:hidden;opacity:0;pointer-events:none;transition:opacity .5s cubic-bezier(.22,.8,.24,1),background .5s ease,backdrop-filter .5s ease,-webkit-backdrop-filter .5s ease,visibility 0s linear .5s}'
  + '#cbpOv.on{visibility:visible;opacity:1;pointer-events:auto;background:rgba(22,32,26,.68);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);transition-delay:0s}'
  + '#cbpBox{transform:translateY(28px) scale(.97);opacity:0;transition:transform .6s cubic-bezier(.16,1,.3,1),opacity .45s ease}'
  + '#cbpOv.on #cbpBox{transform:none;opacity:1;transition-delay:.06s}'
  + '@media(prefers-reduced-motion:reduce){#cbpOv,#cbpBox{transition-duration:.01s!important;transition-delay:0s!important}}'
  + '#cbpBox{position:relative;width:100%;max-width:440px;max-height:calc(100dvh - 40px);overflow:auto;background:var(--stone,#F1EDE3);color:var(--ink,#16201A);padding:34px 28px 28px;font-family:"Work Sans",system-ui,sans-serif;box-shadow:0 20px 60px rgba(0,0,0,.35)}'
  + '#cbpBox h2{font-family:Inter,sans-serif;font-weight:900;font-size:1.7rem;line-height:1.05;letter-spacing:-.03em;margin:0 0 10px}'
  + '#cbpBox p{margin:0 0 16px;font-size:.98rem;line-height:1.5}'
  + '#cbpBox .cbp-eye{font-family:"IBM Plex Mono",monospace;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:#F95132;margin-bottom:10px}'
  + '#cbpBox label.f{display:block;font-size:.85rem;margin-bottom:12px}'
  + '#cbpBox input[type=text],#cbpBox input[type=email]{display:block;width:100%;box-sizing:border-box;margin-top:5px;padding:12px;font:inherit;font-size:1rem;border:1px solid #8a9a8f;background:#fff;color:inherit;border-radius:0}'
  + '#cbpBox .cbp-c{display:flex;gap:10px;align-items:flex-start;font-size:.78rem;line-height:1.4;margin:4px 0 11px}'
  + '#cbpBox .cbp-c input{margin-top:3px;flex:none}'
  + '#cbpBox button.go{width:100%;padding:14px;border:0;background:#F95132;color:#fff;font:inherit;font-weight:600;font-size:1rem;cursor:pointer}'
  + '#cbpBox button.go:disabled{opacity:.6}'
  + '#cbpBox button.x{position:absolute;top:8px;right:10px;border:0;background:none;font-size:1.6rem;line-height:1;cursor:pointer;color:inherit;padding:6px}'
  + '@media(max-width:600px){#cbpOv{align-items:flex-end;padding:0}#cbpBox{transform:translateY(100%);opacity:1;max-width:none;max-height:88dvh;padding:28px 20px calc(22px + env(safe-area-inset-bottom,0px))}}'
  + '@media(max-width:600px){#cbpOv.on #cbpBox{transform:none}}'
  + '#cbpBox .cbp-sub{font-weight:600}#cbpBox .cbp-fine{font-size:.78rem;margin:15px 0 0}#cbpBox .cbp-no{display:block;margin:0 auto;border:0;background:none;font:inherit;font-size:.85rem;text-decoration:underline;cursor:pointer;color:inherit}#cbpBox a.go{display:block;text-align:center;text-decoration:none;padding:14px;background:#F95132;color:#fff;font-weight:600}#cbpBox a.ln{display:block;margin-top:14px;font-size:.92rem}'
  + '#cbpMsg{margin:10px 0 0;font-size:.85rem;color:#a02b14;display:none}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var ov = document.createElement('div'); ov.id = 'cbpOv';
  ov.innerHTML = '<div id="cbpBox" role="dialog" aria-modal="true" aria-labelledby="cbpT">'
  + '<div id="cbpA"><h2 id="cbpT">Want my Comeback Blueprint?</h2>'
  + '<p class="cbp-sub">For runners, lifters, and athletes who are tired of being told to rest and have no clue where to start.</p>'
  + '<p>A FREE guide, with 5 actionable moves you can make today. It\u2019s a 10 min read and if you have any questions, DM me and we can chat some more.</p>'
  + '<form id="cbpForm" novalidate>'
  + '<input type="hidden" name="access_key" value="9dd1ccda-340e-45ce-a69d-4a8da99e12ce">'
  + '<input type="hidden" name="subject" value="Comeback Blueprint request">'
  + '<input type="hidden" name="from_name" value="MEO Website Blueprint Pop-up">'
  + '<input type="checkbox" name="botcheck" style="display:none" tabindex="-1" autocomplete="off">'
  + '<label class="f">First name<input type="text" name="name" required autocomplete="given-name"></label>'
  + '<label class="f">Email<input type="email" name="email" required autocomplete="email"></label>'
  + '<button class="go" type="submit">Send me the Blueprint</button>'
  + '<p class="cbp-fine">I\u2019ll email you a copy and that\u2019s it. No mailing list unless you say yes below. <a href="privacy-policy.html" target="_blank">Privacy policy</a></p>'
  + '<label class="cbp-c"><input type="checkbox" name="marketing_opt_in" value="yes"><span>Send me the occasional email about training around injury. Unsubscribe any time.</span></label>'
  + '<p id="cbpMsg" role="alert"></p></form>'
  + '<button class="cbp-no" type="button">No thanks</button></div>'
  + '<div id="cbpB" hidden><h2>It\u2019s yours.</h2><p>Open the Blueprint here:</p>'
  + '<a class="go" href="'+GUIDE+'">Open the Blueprint</a>'
  + '<p class="cbp-fine">A copy\u2019s on its way to your inbox too, so check junk if it\u2019s not there in a few minutes.</p>'
  + '<a class="ln" href="the-solution.html">Want to talk it through? Book a Performance Assessment</a></div></div>';
  document.body.appendChild(ov);

  var shown = false, lastFocus = null;
  function remember() { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} }
  function open() { if (shown) return; shown = true; remember(); lastFocus = document.activeElement; ov.classList.add('on'); var i = ov.querySelector('input[name=name]'); if (i) i.focus(); }
  function close() { ov.classList.remove('on'); remember(); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  ov.querySelector('.cbp-no').addEventListener('click', close);
  ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ov.classList.contains('on')) close(); });

  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (h > 0 && window.scrollY / h >= TRIGGER) { window.removeEventListener('scroll', onScroll); open(); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  setTimeout(function () { window.removeEventListener('scroll', onScroll); open(); }, DELAY);

  function submitLead(fd) {
    var w3 = fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { Accept: 'application/json' }, body: fd }).then(function (r) { return r.json(); });
    if (!ML_URL) return w3;
    var ml = new URLSearchParams();
    ml.set('fields[name]', fd.get('name')); ml.set('fields[email]', fd.get('email'));
    ml.set('fields[marketing_opt_in]', fd.get('marketing_opt_in')); ml.set('ml-submit', '1'); ml.set('anticsrf', 'true');
    var mlp = fetch(ML_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: ml.toString() });
    return Promise.all([w3.catch(function () { return { success: false }; }), mlp.then(function () { return true; })]).then(function (r) { return { success: true }; });
  }
  var form = ov.querySelector('#cbpForm'), msg = ov.querySelector('#cbpMsg'), btn = form.querySelector('.go');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var n = form.elements.name.value.trim(), em = form.elements.email.value.trim();
    msg.style.display = 'none';
    if (!n || !/^\S+@\S+\.\S+$/.test(em)) {
      msg.textContent = 'Add your first name and a valid email to continue.'; msg.style.display = 'block'; return;
    }
    btn.disabled = true; btn.textContent = 'One sec...';
    if (!form.elements.marketing_opt_in.checked) { var h = document.createElement('input'); h.type='hidden'; h.name='marketing_opt_in'; h.value='no'; form.appendChild(h); }
    submitLead(new FormData(form)).then(function (res) {
      if (!res.success) throw new Error(res.message || 'failed');
      if (window.fbq) { fbq('track', 'Lead'); }
      ov.querySelector('#cbpA').hidden = true; ov.querySelector('#cbpB').hidden = false;
    }).catch(function () {
      btn.disabled = false; btn.textContent = 'Send me the Blueprint';
      msg.textContent = 'That did not go through. Try again, or email admin@meorehabperformance.com.'; msg.style.display = 'block';
    });
  });
})();
