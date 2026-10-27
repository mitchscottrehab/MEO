/* Comeback Blueprint page: inline sign-up. Same destinations as the pop-up (MailerLite + Web3Forms backup). */
(function () {
  var ML_URL = 'https://assets.mailerlite.com/jsonp/2744689/forms/202425378396964812/subscribe';
  var KEY = 'meoBlueprint';
  var form = document.getElementById('bpForm'); if (!form) return;
  var A = document.getElementById('bpA'), B = document.getElementById('bpB'), msg = document.getElementById('bpMsg'), btn = form.querySelector('.bp-go');
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function markDone() { try { var s = load(); s.n = s.n || 0; s.t = s.t || Date.now(); s.done = true; localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  function submitLead(fd) {
    var w3 = fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { Accept: 'application/json' }, body: fd }).then(function (r) { return r.json(); });
    var ml = new URLSearchParams();
    ml.set('fields[name]', fd.get('name')); ml.set('fields[email]', fd.get('email'));
    ml.set('fields[marketing_opt_in]', fd.get('marketing_opt_in')); ml.set('ml-submit', '1'); ml.set('anticsrf', 'true');
    var mlp = fetch(ML_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: ml.toString() });
    return Promise.all([w3.catch(function () { return { success: false }; }), mlp.then(function () { return true; })]).then(function () { return { success: true }; });
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var n = form.elements.name.value.trim(), em = form.elements.email.value.trim();
    msg.style.display = 'none';
    if (!n || !/^\S+@\S+\.\S+$/.test(em)) { msg.textContent = 'Add your first name and a valid email to continue.'; msg.style.display = 'block'; return; }
    btn.disabled = true; btn.textContent = 'One sec...';
    if (!form.elements.marketing_opt_in.checked) { var h = document.createElement('input'); h.type = 'hidden'; h.name = 'marketing_opt_in'; h.value = 'no'; form.appendChild(h); }
    submitLead(new FormData(form)).then(function (res) {
      if (!res.success) throw new Error('failed');
      if (window.fbq) { fbq('track', 'Lead'); }
      markDone(); A.hidden = true; B.hidden = false;
    }).catch(function () {
      btn.disabled = false; btn.textContent = 'Send me the Blueprint';
      msg.textContent = 'That did not go through. Try again, or email admin@meorehabperformance.com.'; msg.style.display = 'block';
    });
  });
})();
