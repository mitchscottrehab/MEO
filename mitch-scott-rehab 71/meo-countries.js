/* Shared by the Comeback Blueprint pop-up and page: country-code dropdown + form check. */
(function () {
  var CC = [['Australia', '61'], ['New Zealand', '64'], ['United Kingdom', '44'], ['United States', '1'], ['Canada', '1'], ['Ireland', '353'], ['Singapore', '65'], ['South Africa', '27'], ['United Arab Emirates', '971'],
    ['Argentina', '54'], ['Austria', '43'], ['Belgium', '32'], ['Brazil', '55'], ['Chile', '56'], ['China', '86'], ['Colombia', '57'], ['Denmark', '45'], ['Fiji', '679'], ['Finland', '358'], ['France', '33'], ['Germany', '49'],
    ['Greece', '30'], ['Hong Kong', '852'], ['India', '91'], ['Indonesia', '62'], ['Israel', '972'], ['Italy', '39'], ['Japan', '81'], ['Kenya', '254'], ['Malaysia', '60'], ['Mexico', '52'], ['Netherlands', '31'],
    ['Nigeria', '234'], ['Norway', '47'], ['Papua New Guinea', '675'], ['Philippines', '63'], ['Poland', '48'], ['Portugal', '351'], ['Qatar', '974'], ['Samoa', '685'], ['Saudi Arabia', '966'], ['South Korea', '82'],
    ['Spain', '34'], ['Sri Lanka', '94'], ['Sweden', '46'], ['Switzerland', '41'], ['Taiwan', '886'], ['Thailand', '66'], ['Tonga', '676'], ['Turkey', '90'], ['Vietnam', '84'], ['Zimbabwe', '263']];
  window.meoCountryOptions = function () {
    return CC.map(function (c, i) { return '<option value="' + c[1] + '"' + (i === 0 ? ' selected' : '') + '>' + c[0] + ' +' + c[1] + '</option>'; }).join('');
  };
  window.MEO_CONSENT = 'Yes, send me the free Comeback Blueprint. I’m happy for Mitch to contact me by phone, text or email about my injury and how MEO might help.';
  /* Returns an error message, or '' when the form is OK (and fills the hidden full phone number). */
  window.meoBpCheck = function (f) {
    var n = f.elements.name.value.trim(), em = f.elements.email.value.trim();
    var cc = f.elements.cc.value, local = f.elements.phone_local.value.replace(/[^\d]/g, '').replace(/^0+/, '');
    if (!n) return 'Add your full name.';
    if (!/^\S+@\S+\.\S+$/.test(em)) return em ? 'That email doesn’t look right. Check it and try again.' : 'Add your email.';
    if (local.length < 6) return f.elements.phone_local.value.trim() ? 'That phone number looks short. Check it and try again.' : 'Add your phone number.';
    if (!f.elements.contact_consent.checked) return 'Tick the first box to get the Blueprint.';
    f.elements.phone.value = '+' + cc + ' ' + local;
    return '';
  };
  /* MailerLite + Web3Forms get the combined number only. */
  window.meoBpData = function (f) {
    var fd = new FormData(f); fd.delete('cc'); fd.delete('phone_local'); fd.delete('contact_consent');
    fd.append('contact_consent', 'Yes: ' + window.MEO_CONSENT);
    return fd;
  };
})();
