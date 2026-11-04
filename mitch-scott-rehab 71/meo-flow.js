/* MEO "next step" flow: a short tap-through (where, goal, where training's at) that ends in
   (a) a booking link, or (b) a call-back request. Opens from any element with [data-meo-flow]
   or window.meoOpenFlow(). Call-back requests go to Mitch's inbox via Web3Forms with a subject
   starting "Callback:" so a Gmail filter can label them. */
(function () {
  var KEY = '9dd1ccda-340e-45ce-a69d-4a8da99e12ce';
  var BASE = 'https://meo-rehab-performance.au5.cliniko.com/bookings?business_id=1970647816577494027&practitioner_id=1969447206637284849&appointment_type_id=';
  var URL_IN = BASE + '2021488754300039109';
  var URL_ON = BASE + '2021497536367308744';

  var A = {};            // answers
  var hist = [];         // screen history for the back arrow
  var cur = 'where';
  var lastFocus = null;

  var css = ''
  + '#mfOv{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(22,32,26,0);-webkit-backdrop-filter:blur(0);backdrop-filter:blur(0);visibility:hidden;opacity:0;pointer-events:none;transition:opacity .25s,background .25s,visibility 0s .25s}'
  + '#mfOv.on{visibility:visible;opacity:1;pointer-events:auto;background:rgba(22,32,26,.66);-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);transition-delay:0s}'
  + '#mfBox{position:relative;width:100%;max-width:480px;max-height:calc(100dvh - 40px);overflow:auto;background:#16201A;color:#F1EDE3;border-radius:20px;border-top:3px solid #F95132;padding:22px 26px 26px;font-family:Inter,"Work Sans",sans-serif;box-shadow:0 30px 80px -20px rgba(0,0,0,.6);transform:translateY(14px);opacity:0;transition:transform .3s,opacity .3s}'
  + '#mfOv.on #mfBox{transform:none;opacity:1}'
  + '#mfBox .mf-top{display:flex;align-items:center;gap:12px;margin-bottom:24px}'
  + '#mfBox .mf-bk,#mfBox .mf-x{flex:none;width:32px;height:32px;border:0;background:none;color:#B9B3A8;font-size:22px;line-height:1;cursor:pointer;border-radius:50%;padding:0}'
  + '#mfBox .mf-bk:hover,#mfBox .mf-x:hover{color:#F1EDE3}'
  + '#mfBox .mf-bk[hidden]{display:block;visibility:hidden}'
  + '#mfBox .mf-bar{flex:1;height:4px;background:#2c3830;border-radius:4px;overflow:hidden}'
  + '#mfBox .mf-bar i{display:block;height:100%;width:0;background:#F95132;transition:width .35s}'
  + '#mfBox h2{font-family:Inter,sans-serif;font-weight:900;font-size:clamp(1.5rem,6vw,1.85rem);line-height:1.08;letter-spacing:-.03em;margin:0 0 8px;color:#F1EDE3;outline:0}'
  + '#mfBox p.mf-s{margin:0 0 20px;color:#B9B3A8;font-size:.95rem;line-height:1.45}'
  + '#mfBox .mf-opts{display:flex;flex-direction:column;gap:10px}'
  + '#mfBox button.mf-o{display:flex;justify-content:space-between;align-items:center;gap:12px;width:100%;box-sizing:border-box;padding:16px 18px;border:1.5px solid #3a4a40;border-radius:14px;background:transparent;color:#F1EDE3;font:inherit;font-weight:700;font-size:1.02rem;text-align:left;cursor:pointer;transition:border-color .15s,background .15s}'
  + '#mfBox button.mf-o:hover,#mfBox button.mf-o:focus-visible{border-color:#F95132;background:rgba(249,81,50,.10);outline:0}'
  + '#mfBox button.mf-o.sel{border-color:#F95132;background:rgba(249,81,50,.14)}'
  + '#mfBox button.mf-o span{color:#F95132;font-weight:900}'
  + '#mfBox .mf-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}'
  + '#mfBox .mf-grid button.mf-o{padding:12px 14px;font-size:.95rem;border-radius:12px}'
  + '#mfBox .mf-go,#mfBox a.mf-go{display:block;width:100%;box-sizing:border-box;padding:15px 18px;border:0;border-radius:999px;background:#F95132;color:#16201A;font:inherit;font-weight:800;font-size:1rem;text-align:center;text-decoration:none;cursor:pointer;letter-spacing:-.01em}'
  + '#mfBox .mf-go:hover{background:#fdb9ad}'
  + '#mfBox .mf-go:disabled{opacity:.55;cursor:default}'
  + '#mfBox .mf-go.ghost{background:transparent;color:#F1EDE3;box-shadow:inset 0 0 0 2px #F1EDE3}'
  + '#mfBox .mf-go.ghost:hover{background:#F1EDE3;color:#16201A}'
  + '#mfBox .mf-stack{display:flex;flex-direction:column;gap:10px}'
  + '#mfBox .mf-or{text-align:center;color:#B9B3A8;font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;margin:16px 0}'
  + '#mfBox .mf-tag{display:block;font-size:.75rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#F95132;margin:0 0 10px}'
  + '#mfBox label.mf-f{display:block;font-weight:800;font-size:.8rem;color:#B9B3A8;margin:0 0 16px}'
  + '#mfBox label.mf-f input{display:block;width:100%;box-sizing:border-box;margin-top:6px;padding:12px 2px 10px;font:inherit;font-weight:700;font-size:1.15rem;color:#F1EDE3;background:transparent;border:0;border-bottom:2px solid #3a4a40;border-radius:0;outline:0}'
  + '#mfBox label.mf-f input:focus{border-bottom-color:#F95132}'
  + '#mfBox .mf-c{display:flex;gap:10px;align-items:flex-start;font-size:.8rem;line-height:1.4;color:#B9B3A8;margin:4px 0 16px}'
  + '#mfBox .mf-c input{flex:none;margin-top:3px;accent-color:#F95132}'
  + '#mfBox .mf-c a,#mfBox .mf-fine a{color:#F1EDE3}'
  + '#mfBox .mf-fine{font-size:.8rem;line-height:1.4;color:#B9B3A8;margin:14px 0 0}'
  + '#mfBox .mf-msg{margin:12px 0 0;font-size:.85rem;color:#ff9b87;display:none}'
  + '#mfBox .mf-done{text-align:center;padding:10px 0 2px}'
  + '#mfBox .mf-tick{width:64px;height:64px;border-radius:50%;background:#F95132;margin:0 auto 18px;display:flex;align-items:center;justify-content:center;color:#16201A;font-size:32px;font-weight:900}'
  + '@media(max-width:600px){'
  +   '#mfOv{align-items:flex-end;padding:0 10px calc(10px + env(safe-area-inset-bottom,0px))}'
  +   '#mfBox{max-width:none;max-height:88dvh;padding:16px 18px 20px;border-radius:18px;transform:translateY(60px)}'
  +   '#mfBox .mf-top{margin-bottom:18px}'
  +   '#mfBox button.mf-o{padding:14px 16px}'
  + '}'
  + '@media(prefers-reduced-motion:reduce){#mfOv,#mfBox,#mfBox .mf-bar i{transition-duration:.01s!important;transition-delay:0s!important}}';

  var sty = document.createElement('style'); sty.textContent = css; document.head.appendChild(sty);

  var ov = document.createElement('div'); ov.id = 'mfOv';
  ov.innerHTML = '<div id="mfBox" role="dialog" aria-modal="true" aria-labelledby="mfT">'
  + '<div class="mf-top"><button type="button" class="mf-bk" aria-label="Back">&larr;</button>'
  + '<div class="mf-bar" aria-hidden="true"><i></i></div>'
  + '<button type="button" class="mf-x" aria-label="Close">&times;</button></div>'
  + '<div id="mfBody"></div></div>';
  document.body.appendChild(ov);

  var box = ov.querySelector('#mfBox'), body = ov.querySelector('#mfBody');
  var bk = ov.querySelector('.mf-bk'), bar = ov.querySelector('.mf-bar i');

  var PROG = { where: 12, goal: 28, status: 44, choose: 58, tried: 70, start: 82, contact: 94, done: 100 };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function opts(list, key) {
    return '<div class="mf-opts">' + list.map(function (t) {
      return '<button type="button" class="mf-o' + (A[key] === t ? ' sel' : '') + '" data-k="' + key + '" data-v="' + esc(t) + '">' + esc(t) + '<span>&rarr;</span></button>';
    }).join('') + '</div>';
  }

  var SCREENS = {
    where: function () {
      return '<h2 id="mfT" tabindex="-1">Where do you train?</h2>'
        + '<p class="mf-s">I work in person in Albion, Brisbane, and online. You&rsquo;ll see both.</p>'
        + opts(['Brisbane', 'Somewhere else'], 'where');
    },
    goal: function () {
      return '<h2 id="mfT" tabindex="-1">What are you trying to get back to?</h2><p class="mf-s">Pick the closest one.</p>'
        + opts(['Running', 'Lifting', 'Sport', 'Something else'], 'goal');
    },
    status: function () {
      return '<h2 id="mfT" tabindex="-1">Where&rsquo;s training at right now?</h2><p class="mf-s">No wrong answer. It tells me where to start.</p>'
        + opts(['I love training, currently working around an injury', 'Trying to train, but my injury keeps flaring up', 'I\u2019ve had to stop, not doing much at the moment'], 'status');
    },
    choose: function () {
      var inP = A.where === 'Brisbane';
      var bIn = '<a class="mf-go' + (inP ? '' : ' ghost') + '" href="' + URL_IN + '" data-book="In person">In-person at Pinnacle Fitness &rarr;</a>';
      var bOn = '<a class="mf-go' + (inP ? ' ghost' : '') + '" href="' + URL_ON + '" data-book="Online">Online &rarr;</a>';
      return '<h2 id="mfT" tabindex="-1">Two ways to take the next step.</h2>'
        + '<p class="mf-s">Book a 60-minute Performance Assessment, $220. Choose how you&rsquo;d like to do it:</p>'
        + '<div class="mf-stack">' + (inP ? bIn + bOn : bOn + bIn) + '</div>'
        + '<div class="mf-or">or</div>'
        + '<button type="button" class="mf-go ghost" data-go="tried">Have Mitch get back to you</button>';
    },
    tried: function () {
      var list = ['Physio', 'Rest', 'Massage', 'Injections', 'Scans', 'Surgery', 'Rehab or a program', 'Nothing yet'];
      var sel = A.tried || [];
      return '<h2 id="mfT" tabindex="-1">What have you tried so far?</h2><p class="mf-s">Pick as many as you like.</p>'
        + '<div class="mf-opts mf-grid">' + list.map(function (t) {
          return '<button type="button" class="mf-o' + (sel.indexOf(t) > -1 ? ' sel' : '') + '" data-m="' + esc(t) + '" aria-pressed="' + (sel.indexOf(t) > -1) + '">' + esc(t) + '<span>' + (sel.indexOf(t) > -1 ? '&#10003;' : '') + '</span></button>';
        }).join('') + '</div>'
        + '<div style="margin-top:18px"><button type="button" class="mf-go" data-go="start">Continue</button></div>';
    },
    start: function () {
      return '<h2 id="mfT" tabindex="-1">When do you want to get started?</h2><p class="mf-s">Just so I know how quickly to get back to you.</p>'
        + opts(['This week', 'This month', 'In the next 1 to 3 months', 'Just looking for now'], 'start');
    },
    contact: function () {
      return '<h2 id="mfT" tabindex="-1">Where should I contact you?</h2><p class="mf-s">I&rsquo;ll get back to you about booking. Nothing else.</p>'
        + '<form id="mfForm" novalidate>'
        + '<input type="checkbox" name="botcheck" style="display:none" tabindex="-1" autocomplete="off">'
        + '<label class="mf-f">First name<input type="text" name="name" autocomplete="given-name" value="' + esc(A.name || '') + '"></label>'
        + '<label class="mf-f">Email<input type="email" name="email" autocomplete="email" placeholder="you@example.com" value="' + esc(A.email || '') + '"></label>'
        + '<label class="mf-f">Phone number<input type="tel" name="phone" inputmode="tel" autocomplete="tel" placeholder="04__ ___ ___" value="' + esc(A.phone || '') + '"></label>'
        + '<label class="mf-c"><input type="checkbox" name="consent"><span>I agree to be contacted about this enquiry by phone, text message or email. <a href="privacy-policy.html" target="_blank" rel="noopener">Privacy policy</a></span></label>'
        + '<button type="submit" class="mf-go">Send it &rarr;</button>'
        + '<p class="mf-msg" role="alert"></p></form>'
        + '<p class="mf-fine">Your details are only used to contact you about this enquiry. You won&rsquo;t be added to a mailing list.</p>';
    },
    done: function () {
      return '<div class="mf-done"><div class="mf-tick" aria-hidden="true">&#10003;</div>'
        + '<h2 id="mfT" tabindex="-1">Got it.</h2><p class="mf-s">I&rsquo;ll be in touch, usually the same day.</p>'
        + '<button type="button" class="mf-go ghost" data-close="1">Back to the site</button></div>';
    }
  };

  function render(name, back) {
    if (!back && cur && cur !== name) hist.push(cur);
    cur = name;
    body.innerHTML = SCREENS[name]();
    bar.style.width = PROG[name] + '%';
    bk.hidden = (name === 'where' || name === 'done');
    var h = body.querySelector('h2'); if (h) try { h.focus({ preventScroll: true }); } catch (e) {}
    box.scrollTop = 0;
  }

  function next(from) {
    if (from === 'where') return 'goal';
    if (from === 'goal') return 'status';
    if (from === 'status') return 'choose';
    if (from === 'start') return 'contact';
    return null;
  }

  body.addEventListener('click', function (e) {
    var t = e.target.closest('button,a'); if (!t || !body.contains(t)) return;
    if (t.dataset.k) {                       // single-select answer, auto-advance
      A[t.dataset.k] = t.dataset.v;
      var n = next(cur);
      body.querySelectorAll('.mf-o').forEach(function (b) { b.classList.toggle('sel', b === t); });
      setTimeout(function () { if (n) render(n); }, 140);
    } else if (t.dataset.m) {                // multi-select toggle
      var v = t.dataset.m; A.tried = A.tried || [];
      var i = A.tried.indexOf(v);
      if (i > -1) A.tried.splice(i, 1);
      else {
        if (v === 'Nothing yet') A.tried = [];
        else { var z = A.tried.indexOf('Nothing yet'); if (z > -1) A.tried.splice(z, 1); }
        A.tried.push(v);
      }
      render('tried', true);
    } else if (t.dataset.go) {
      render(t.dataset.go);
    } else if (t.dataset.close) {
      close();
    } else if (t.dataset.book) {             // booking link: hand over to the Cliniko pop-up
      e.preventDefault();
      var url = t.getAttribute('href');
      close();
      if (window.openClinikoBooking) window.openClinikoBooking(url); else window.open(url, '_blank', 'noopener');
    }
  });

  body.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, msg = f.querySelector('.mf-msg'), btn = f.querySelector('.mf-go');
    var name = f.elements.name.value.trim(), phone = f.elements.phone.value.trim(), email = f.elements.email.value.trim();
    A.name = name; A.phone = phone; A.email = email;
    msg.style.display = 'none';
    var digits = phone.replace(/\D/g, ''), okPhone = digits.length >= 8, okEmail = /^\S+@\S+\.\S+$/.test(email);
    if (!name) { msg.textContent = 'Add your first name.'; msg.style.display = 'block'; return; }
    if (!okEmail) { msg.textContent = email ? 'That email doesn\u2019t look right. Check it and try again.' : 'Add your email so I can get back to you.'; msg.style.display = 'block'; return; }
    if (!okPhone) { msg.textContent = phone ? 'That phone number looks short. Check it and try again.' : 'Add your phone number so I can get back to you.'; msg.style.display = 'block'; return; }
    if (!f.elements.consent.checked) { msg.textContent = 'Tick the box so I know it&rsquo;s OK to contact you.'.replace('&rsquo;', '’'); msg.style.display = 'block'; return; }
    btn.disabled = true; btn.textContent = 'One sec...';
    var fd = new FormData();
    fd.append('access_key', KEY);
    var SHORT = { 'I love training, currently working around an injury': 'training around it', 'Trying to train, but my injury keeps flaring up': 'flaring', 'I\u2019ve had to stop, not doing much at the moment': 'stopped' };
    fd.append('subject', 'Callback: ' + name + ', ' + (A.goal || '?') + ', ' + (SHORT[A.status] || '?'));
    fd.append('from_name', 'MEO Website Callback');
    fd.append('botcheck', f.elements.botcheck.checked ? 'on' : '');
    fd.append('name', name);
    fd.append('phone', phone);
    fd.append('email', email);
    fd.append('where_they_train', A.where || '');
    fd.append('trying_to_get_back_to', A.goal || '');
    fd.append('training_right_now', A.status || '');
    fd.append('tried_so_far', (A.tried || []).join(', ') || 'No answer');
    fd.append('wants_to_start', A.start || '');
    fd.append('consent_to_contact', 'Yes (phone, text or email)');
    fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { Accept: 'application/json' }, body: fd })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.success) throw new Error('failed');
        if (window.fbq) { fbq('track', 'Lead'); }
        render('done');
      })
      .catch(function () {
        btn.disabled = false; btn.textContent = 'Send it →';
        msg.textContent = 'That didn’t go through. Try again, or email admin@meorehabperformance.com.'; msg.style.display = 'block';
      });
  });

  function open() {
    if (ov.classList.contains('on')) return;
    A = {}; hist = []; cur = null;
    window.meoFlowOpen = true;
    lastFocus = document.activeElement;
    render('where');
    ov.classList.add('on');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    ov.classList.remove('on'); window.meoFlowOpen = false;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
  }
  window.meoOpenFlow = open;

  bk.addEventListener('click', function () { var p = hist.pop(); if (p) render(p, true); });
  ov.querySelector('.mf-x').addEventListener('click', close);
  ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ov.classList.contains('on')) close(); });
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-meo-flow]');
    if (t) { e.preventDefault(); open(); }
  });
})();
