/* =====================================================================
   K9 HONOR SOCIETY — site behaviour
   Vanilla JavaScript, no dependencies. Each feature is its own small
   function, initialised at the bottom inside try/catch so one failure
   can never take the rest of the page down.
   ===================================================================== */
(function () {
  'use strict';

  /* ===================================================================
     CONFIG — the only values you normally need to edit in this file
     =================================================================== */
  var CONFIG = {
    // TODO(FORM): paste your Web3Forms access key here (free plan: 250 messages a month).
    // How to get it: go to https://web3forms.com, enter help@k9honorsociety.com, and the key is emailed
    // to that address. It looks like 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'.
    // The key is public by design: it only lets a page SEND a message to that one address.
    // While it is '' (and formEndpoint below is '' too), the form falls back to opening the visitor's
    // email app with the message already addressed to help@k9honorsociety.com.
    web3formsAccessKey: '',

    // Optional alternative: the endpoint of another form service (for example Formspree,
    // 'https://formspree.io/f/abcdwxyz'). Ignored while web3formsAccessKey is set.
    formEndpoint: '',

    contactEmail: 'help@k9honorsociety.com',
    contactPhone: '(818) 532-8282',

    // TODO(DONATE): Optional external links for the Support Us buttons. Leave '' to send visitors
    // to the contact form with the topic pre-filled instead.
    donateUrl: '',      // e.g. 'https://www.paypal.com/donate/?hosted_button_id=XXXX'
    sponsorUrl: '',
    volunteerUrl: ''
  };

  var WEB3FORMS_URL = 'https://api.web3forms.com/submit';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ===================================================================
     1. Scroll-triggered fade-in  (.reveal  ->  .is-visible)
     =================================================================== */
  function initReveal() {
    var items = $$('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ===================================================================
     2. Mobile / tablet menu
     =================================================================== */
  function initMenu() {
    var toggle = $('#menu-toggle');
    var menu = $('#mobile-menu');
    var header = $('#site-header');
    if (!toggle || !menu || !header) return;

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
    }
    function isOpen() { return toggle.getAttribute('aria-expanded') === 'true'; }

    toggle.addEventListener('click', function () { setOpen(!isOpen()); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('click', function (e) { if (isOpen() && !header.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) { setOpen(false); toggle.focus(); }
    });
    // Close automatically if the window grows to desktop width
    var mq = window.matchMedia('(min-width: 1280px)');
    var onChange = function (e) { if (e.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange); else mq.addListener(onChange);
  }

  /* ===================================================================
     3. One rAF-throttled scroll handler:
        header shadow, back-to-top, hero parallax, active nav link
     =================================================================== */
  function initScrollEffects() {
    var header = $('#site-header');
    var toTop = $('#to-top');
    var hero = $('#home');
    var heroImg = $('[data-parallax]');
    var sections = $$('main > section[id]');
    var navLinks = $$('.nav-link, .mobile-link');
    var currentId = '';
    var ticking = false;

    function updateActiveLink() {
      if (!sections.length || !navLinks.length) return;
      var line = window.innerHeight * 0.35;
      var active = sections[0];
      sections.forEach(function (s) { if (s.getBoundingClientRect().top <= line) active = s; });
      // At the very bottom of the page, the final section is always "current"
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        active = sections[sections.length - 1];
      }
      var id = active.getAttribute('data-nav') || active.id;
      if (id === currentId) return;
      currentId = id;
      navLinks.forEach(function (a) {
        if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }

    function update() {
      ticking = false;
      var y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle('is-scrolled', y > 8);
      if (toTop) toTop.classList.toggle('is-visible', y > 900);

      if (heroImg && hero && !reduceMotion) {
        var h = hero.offsetHeight;
        if (y < h) {
          var shift = Math.min(y * 0.3, h * 0.08);   // stays inside the image's 8% overscan
          heroImg.style.transform = 'translate3d(0,' + shift.toFixed(1) + 'px,0)';
        }
      }
      updateActiveLink();
    }

    function onScroll() {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    if (toTop) {
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }
  }

  /* ===================================================================
     4. Testimonial carousel (accessible: buttons, dots, arrow keys, swipe)
     =================================================================== */
  function initCarousel() {
    var root = $('[data-carousel]');
    if (!root) return;
    var viewport = $('.carousel-viewport', root);
    var track = $('.carousel-track', root);
    var slides = $$('.carousel-slide', track);
    var prev = $('[data-carousel-prev]', root);
    var next = $('[data-carousel-next]', root);
    var dotsWrap = $('[data-carousel-dots]', root);
    if (!viewport || !track || slides.length < 2) return;
    var index = 0;

    var dots = slides.map(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'carousel-dot';
      b.setAttribute('aria-label', 'Show story ' + (i + 1) + ' of ' + slides.length);
      b.addEventListener('click', function () { go(i); });
      dotsWrap.appendChild(b);
      return b;
    });

    function go(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      slides.forEach(function (s, k) {
        var on = k === index;
        s.setAttribute('aria-hidden', String(!on));
        if ('inert' in s) s.inert = !on;
      });
      dots.forEach(function (d, k) {
        if (k === index) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      });
    }

    prev.addEventListener('click', function () { go(index - 1); });
    next.addEventListener('click', function () { go(index + 1); });
    viewport.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    });

    // Swipe (pointer events; CSS touch-action:pan-y keeps vertical scrolling native)
    var startX = null;
    viewport.addEventListener('pointerdown', function (e) { startX = e.clientX; });
    viewport.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
    });
    viewport.addEventListener('pointercancel', function () { startX = null; });

    go(0);
  }

  /* ===================================================================
     5. Contact / apply form
     =================================================================== */
  var INTENTS = {
    'donate':        { role: 'Supporter', message: "I'd like to make a donation to K9 Honor Society. Please send me information on how to give." },
    'sponsor':       { role: 'Supporter', message: "I'm interested in sponsoring a dog. Please send me more information." },
    'volunteer':     { role: 'Supporter', message: "I'd like to volunteer with K9 Honor Society. Please let me know how I can help." },
    'serve-veteran': { role: 'Veteran',   message: "I'd like to learn more about the program for military veterans." },
    'serve-leo':     { role: 'Law Enforcement Officer', message: "I'd like to learn more about the program for law enforcement officers." }
  };

  /* Buttons/links that carry data-intent pre-select the form; data-link swaps in an external URL when configured. */
  function initCtaLinks() {
    $$('[data-link]').forEach(function (a) {
      var url = CONFIG[a.getAttribute('data-link')];
      if (url) {
        a.setAttribute('href', url);
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
        a.removeAttribute('data-intent');
      }
    });

    var role = $('#f-role');
    var message = $('#f-message');
    $$('[data-intent]').forEach(function (a) {
      a.addEventListener('click', function () {
        var intent = INTENTS[a.getAttribute('data-intent')];
        if (!intent || !role || !message) return;
        role.value = intent.role;
        // Only replace the message if the visitor hasn't typed their own
        if (!message.value.trim() || message.getAttribute('data-autofill') === 'true') {
          message.value = intent.message;
          message.setAttribute('data-autofill', 'true');
        }
      });
    });
    if (message) message.addEventListener('input', function () { message.removeAttribute('data-autofill'); });
  }

  function initForm() {
    var form = $('#contact-form');
    if (!form) return;

    var fieldsWrap = $('#form-fields');
    var success = $('#form-success');
    var successText = $('#form-success-text');
    var errorBox = $('#form-error');
    var submitBtn = $('#form-submit');
    var resetBtn = $('#form-reset');

    var rules = {
      'f-name': function (v) { return v.trim().length >= 2 ? '' : 'Please enter your full name.'; },
      'f-email': function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please enter a valid email address.'; },
      'f-phone': function (v) {
        v = v.trim();
        if (!v) return '';                                   // optional
        var digits = v.replace(/\D/g, '');
        return (/^[\d\s().+\-]+$/.test(v) && digits.length >= 10 && digits.length <= 15)
          ? '' : 'Please enter a valid phone number, or leave this field blank.';
      },
      'f-role': function (v) { return v ? '' : 'Please select the option that best describes you.'; },
      'f-message': function (v) { return v.trim().length >= 10 ? '' : 'Please include a short message (at least 10 characters).'; }
    };

    function check(input) {
      var rule = rules[input.id];
      if (!rule) return true;
      var msg = rule(input.value);
      var err = document.getElementById(input.id + '-err');
      if (msg) {
        input.setAttribute('aria-invalid', 'true');
        if (err) { err.textContent = msg; err.classList.add('is-visible'); }
      } else {
        input.removeAttribute('aria-invalid');
        if (err) { err.textContent = ''; err.classList.remove('is-visible'); }
      }
      return !msg;
    }

    Object.keys(rules).forEach(function (id) {
      var input = document.getElementById(id);
      if (!input) return;
      input.addEventListener('blur', function () { if (input.value || input.getAttribute('aria-invalid')) check(input); });
      input.addEventListener('input', function () { if (input.getAttribute('aria-invalid')) check(input); });
      input.addEventListener('change', function () { if (input.getAttribute('aria-invalid')) check(input); });
    });

    function validateAll() {
      var firstInvalid = null;
      Object.keys(rules).forEach(function (id) {
        var input = document.getElementById(id);
        if (input && !check(input) && !firstInvalid) firstInvalid = input;
      });
      return firstInvalid;
    }

    function showError(text) { errorBox.textContent = text; errorBox.hidden = false; }
    function hideError() { errorBox.hidden = true; errorBox.textContent = ''; }

    function showSuccess(mode, firstName) {
      var who = firstName ? ', ' + firstName : '';
      successText.textContent = mode === 'mailto'
        ? 'Thank you' + who + '. Your message has been prepared in your email app. Please press Send to deliver it to ' + CONFIG.contactEmail +
          '. If nothing opened, email us directly at ' + CONFIG.contactEmail + ' or call ' + CONFIG.contactPhone + '.'
        : 'Thank you' + who + '. Your message has been received, and a member of our team will be in touch.';
      fieldsWrap.hidden = true;
      success.hidden = false;
      success.focus();
    }

    // No backend configured: open the visitor's email app with everything filled in
    function openMailto(data) {
      var lines = [
        'Name: ' + data.get('name'),
        'Email: ' + data.get('email'),
        'Phone: ' + (data.get('phone') || '—'),
        'I am a: ' + data.get('role'),
        'Branch / Department: ' + (data.get('branch') || '—'),
        '',
        'Message:',
        data.get('message')
      ];
      var url = 'mailto:' + CONFIG.contactEmail +
        '?subject=' + encodeURIComponent('Website inquiry from ' + data.get('name') + ' (' + data.get('role') + ')') +
        '&body=' + encodeURIComponent(lines.join('\r\n'));
      window.location.href = url;
    }

    // Decide where the message goes. Returns { url, body }, or null when no service is configured.
    function buildRequest(data) {
      if (CONFIG.web3formsAccessKey) {
        // Web3Forms emails every field it receives, so send a clean, readable set (no internal fields)
        var name = String(data.get('name') || '').trim();
        var body = new FormData();
        body.append('access_key', CONFIG.web3formsAccessKey);
        body.append('subject', 'Website inquiry from ' + name + ' (' + data.get('role') + ')');
        body.append('from_name', 'K9 Honor Society website');
        body.append('name', name);
        body.append('email', String(data.get('email') || '').trim());   // also used as the Reply-To address
        body.append('phone', String(data.get('phone') || '').trim() || 'Not provided');
        body.append('role', data.get('role'));
        body.append('branch_or_department', String(data.get('branch') || '').trim() || 'Not provided');
        body.append('message', data.get('message'));
        return { url: WEB3FORMS_URL, body: body };
      }
      if (CONFIG.formEndpoint) return { url: CONFIG.formEndpoint, body: data };
      return null;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      hideError();

      var bad = validateAll();
      if (bad) { bad.focus(); return; }

      var data = new FormData(form);
      var firstName = String(data.get('name') || '').trim().split(/\s+/)[0];

      // Honeypot tripped: pretend success, send nothing
      if (data.get('_gotcha')) { showSuccess('sent', firstName); return; }

      var request = buildRequest(data);
      if (!request) {                       // no service configured yet: use the visitor's email app
        openMailto(data);
        showSuccess('mailto', firstName);
        return;
      }

      submitBtn.disabled = true;
      var originalLabel = submitBtn.textContent;
      submitBtn.textContent = 'Sending…';

      fetch(request.url, { method: 'POST', body: request.body, headers: { 'Accept': 'application/json' } })
        .then(function (res) {
          // Web3Forms answers with JSON { success: true|false, message }; other services only need a 2xx status
          return res.json().catch(function () { return {}; }).then(function (json) {
            if (!res.ok || json.success === false) throw new Error(json.message || ('HTTP ' + res.status));
            showSuccess('sent', firstName);
          });
        })
        .catch(function () {
          showError('Sorry, your message could not be sent right now. Please email ' + CONFIG.contactEmail + ' or call ' + CONFIG.contactPhone + '.');
        })
        .then(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        });
    });

    resetBtn.addEventListener('click', function () {
      form.reset();
      // Clear any lingering error state (don't re-validate: the fields are now empty on purpose)
      Object.keys(rules).forEach(function (id) {
        var i = document.getElementById(id);
        var err = document.getElementById(id + '-err');
        if (i) i.removeAttribute('aria-invalid');
        if (err) { err.textContent = ''; err.classList.remove('is-visible'); }
      });
      hideError();
      success.hidden = true;
      fieldsWrap.hidden = false;
      var first = document.getElementById('f-name');
      if (first) first.focus();
    });
  }

  /* ===================================================================
     Friends-for-life photo rows: pause button, and idle while off-screen
     =================================================================== */
  function initMarquee() {
    var sec = $('[data-marquee]');
    var btn = $('[data-marquee-toggle]');
    if (!sec || !btn) return;
    var label = $('.label', btn);

    btn.addEventListener('click', function () {
      var paused = sec.classList.toggle('is-paused');
      btn.setAttribute('aria-pressed', String(paused));
      if (label) label.textContent = paused ? 'Play motion' : 'Pause motion';
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        sec.classList.toggle('is-offscreen', !entries[0].isIntersecting);
      }, { rootMargin: '120px 0px' }).observe(sec);
    }
  }

  /* ===================================================================
     Boot
     =================================================================== */
  function boot() {
    [initReveal, initMenu, initScrollEffects, initCarousel, initMarquee, initCtaLinks, initForm].forEach(function (fn) {
      try { fn(); } catch (err) { if (window.console) console.error('[init] ' + fn.name + ' failed:', err); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
