/* Animações sutis ao rolar — só em títulos de seção, grupos de cards e imagens de destaque.
   Usa translate/opacity (não conflita com transform de hover). Sem JS, nada fica escondido. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('am-js');

  // áreas que já têm animação própria ou não devem animar
  var SKIP = '.elementor-element-c9b6368, .elementor-element-fd848fb, .elementor-element-90c3364, .sp-header, header, .sp-float, .elementor-nav-menu--dropdown, .dp-track, .motion-reveal, .elementor-invisible';

  // [seletor, tipo]  tipo: 'h' = título, 'g' = item de grupo (cascata), 'i' = imagem
  var RULES = [
    // containers/grupos primeiro (assim os títulos internos não animam duas vezes)
    ['.sv-card', 'g'], ['.pq-col', 'g'], ['.sp-steps li', 'g'], ['.sp-others a', 'g'], ['.sp-cols > .sp-card', 'g'],
    ['.dp-summary', 'h'],
    ['.elementor-element-6977ee9 img', 'i'],
    // títulos de seção
    ['.dv-title', 'h'], ['.sv-title', 'h'], ['.pq-title', 'h'], ['.pw-title', 'h'],
    ['.e-parent > .e-con-inner > .e-con > .elementor-widget-heading h2.elementor-heading-title', 'h'],
    ['.e-parent .elementor-widget-heading h2.elementor-heading-title', 'h'],
    ['.sp-section > .sp-wrap > h2', 'h'], ['.sp-section .sp-cols > div:not(.sp-card) > h2', 'h'], ['.sp-cta h2', 'h'],
    // destaques da seção "Por quem"
    ['.pw-hl', 'h'], ['.pw-cta', 'h']
  ];

  var seen = new Set(), items = [];
  RULES.forEach(function (r) {
    document.querySelectorAll(r[0]).forEach(function (el) {
      if (seen.has(el) || el.closest(SKIP)) return;
      for (var p = el.parentElement; p; p = p.parentElement) if (seen.has(p)) return;   // já anima pelo pai
      // títulos dentro de cards escuros pequenos (ex.: "Doenças crônicas:") não precisam animar
      if (r[1] === 'h' && el.closest('.elementor-element-10a8b60')) return;
      seen.add(el); items.push({ el: el, t: r[1] });
    });
  });

  var groups = new Map();
  items.forEach(function (it) {
    var el = it.el;
    if (it.t === 'g') {
      var k = el.parentElement, n = groups.get(k) || 0; groups.set(k, n + 1);
      el.style.setProperty('--am-d', Math.min(n * 60, 240) + 'ms');
    }
    el.classList.add(it.t === 'i' ? 'am-reveal-img' : 'am-reveal');
  });

  function show(el) { el.classList.add('am-in'); io.unobserve(el); }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) show(e.target); });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0 });
  items.forEach(function (it) { io.observe(it.el); });

  // segurança: revela o que já está na tela (fim da página, aba em segundo plano)
  var ticking = false;
  function sweep() {
    ticking = false;
    var atEnd = innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
    items.forEach(function (it) {
      var el = it.el; if (el.classList.contains('am-in')) return;
      var r = el.getBoundingClientRect();
      if (r.top < innerHeight * (atEnd ? 1 : 0.88) && r.bottom > 0) show(el);
    });
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; setTimeout(sweep, 200); } }, { passive: true });
  setTimeout(sweep, 1000);
})();
