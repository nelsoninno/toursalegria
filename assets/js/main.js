/* Tours Alegría: small interactions (menu, reveal, trip finder, WhatsApp booking form). No libraries. */
(function () {
  var doc = document.documentElement;
  doc.classList.remove('no-js');

  /* Mobile menu */
  var btn = document.querySelector('.menu-btn');
  var menu = document.getElementById('menu');
  if (btn && menu) {
    btn.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* Gentle scroll reveal */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* Find your trip: filter tour cards by traveler type */
  var personas = document.querySelectorAll('.persona');
  var cards = document.querySelectorAll('#tours .tour-card');
  var status = document.querySelector('.filter-status');
  function filter(key, label) {
    personas.forEach(function (p) { p.setAttribute('aria-pressed', p.dataset.persona === key ? 'true' : 'false'); });
    cards.forEach(function (c) {
      var show = !key || (' ' + c.dataset.personas + ' ').indexOf(' ' + key + ' ') > -1;
      c.classList.toggle('is-hidden', !show);
      if (show) c.classList.add('in');
    });
    if (status) {
      status.hidden = !key;
      var n = status.querySelector('[data-filter-name]');
      if (n) n.textContent = label || '';
    }
  }
  personas.forEach(function (p) {
    p.addEventListener('click', function () {
      var on = p.getAttribute('aria-pressed') === 'true';
      if (on) { filter(null); return; }
      filter(p.dataset.persona, p.querySelector('.p-title').textContent);
      var t = document.getElementById('tours');
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  var clear = document.querySelector('[data-clear]');
  if (clear) clear.addEventListener('click', function () { filter(null); });

  /* WhatsApp booking form */
  var form = document.getElementById('book-form');
  if (!form) return;
  var number = document.body.getAttribute('data-wa') || '';
  var M = {};
  try { M = JSON.parse(form.getAttribute('data-msg')); } catch (e) { M = {}; }

  // Prefill from a tour page link: index.html?tour=slug#book
  try {
    var q = new URLSearchParams(window.location.search).get('tour');
    if (q) {
      var box = form.querySelector('input[name="trip"][value="' + q.replace(/[^a-z0-9-]/g, '') + '"]');
      if (box) box.checked = true;
    }
  } catch (e) { /* older browsers: ignore */ }

  var people = form.querySelector('input[name="people"]');
  form.querySelectorAll('[data-step]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = parseInt(people.value || '2', 10) + parseInt(b.dataset.step, 10);
      people.value = Math.max(1, Math.min(30, v));
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var trips = Array.prototype.map.call(form.querySelectorAll('input[name="trip"]:checked'), function (i) { return i.dataset.label; });
    var F = form.elements;
    var date = F['date'].value;
    var lines = [M.msg_hello || '', ''];
    lines.push((M.msg_trips || 'Trips') + ': ' + (trips.length ? trips.join(', ') : (M.msg_none || '')));
    if (date || F['flex'].checked) lines.push((M.msg_date || 'Date') + ': ' + (date || '') + (F['flex'].checked ? ' ' + (M.msg_flex || '') : ''));
    lines.push((M.msg_people || 'People') + ': ' + (people.value || '2'));
    if (F['name'].value.trim()) lines.push((M.msg_name || 'Name') + ': ' + F['name'].value.trim());
    if (F['stay'].value.trim()) lines.push((M.msg_stay || 'Staying at') + ': ' + F['stay'].value.trim());
    if (F['notes'].value.trim()) lines.push((M.msg_notes || 'Notes') + ': ' + F['notes'].value.trim());
    var url = 'https://wa.me/' + number + '?text=' + encodeURIComponent(lines.join('\n'));
    window.open(url, '_blank', 'noopener');
  });
})();
