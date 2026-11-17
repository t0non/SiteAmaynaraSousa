/* Conversão: identifica de qual botão/seção veio cada clique no WhatsApp (na própria mensagem)
   e registra eventos na dataLayer (prontos para GA4/Google Ads/Meta via Tag Manager, após consentimento). */
(function () {
  var NUM = '5531972558308';
  var h1 = document.querySelector('h1');
  var isHome = /^\/?(index\.html)?$/.test(location.pathname.replace(/\/$/, '')) || location.pathname === '/';
  var pagina = isHome ? 'página inicial' : (h1 ? h1.textContent.trim() : document.title.split('|')[0].trim());
  var ORIGENS = [
    ['.am-sticky', 'barra de agendamento'], ['.elementor-element-f726a6a', 'botão flutuante'], ['.am-menu-cta', 'menu'],
    ['.elementor-element-fd848fb', 'topo da página'], ['.sv-sec', 'serviços'], ['.pq-sec', 'por que ser acompanhado'],
    ['.elementor-element-5cf9efa', 'como funciona'], ['.elementor-element-97f8234', 'conheça a Dra.'], ['.pw-sec', 'por quem cuidar'],
    ['.fq-sec', 'perguntas frequentes'], ['.cn-sec', 'consultórios'], ['.elementor-element-ff882f0', 'final da página'],
    ['#depoimentos', 'depoimentos'], ['#servico', 'conteúdo do serviço'], ['.bl-body', 'artigo do blog'], ['.bh-sec', 'blog']
  ];
  function origem(a) { for (var i = 0; i < ORIGENS.length; i++) if (a.closest(ORIGENS[i][0])) return ORIGENS[i][1]; return 'site'; }
  window.dataLayer = window.dataLayer || [];
  document.querySelectorAll('a[href*="wa.me/"]').forEach(function (a) {
    var o = origem(a);
    var q = a.getAttribute('data-queixa'); if (q) o = o + ' – ' + q;
    var msg = 'Olá! Vim pelo site (' + pagina + ' – ' + o + ') ' + (a.getAttribute('data-wa-msg') || 'e gostaria de agendar uma consulta com a Dra. Amaynara.');
    a.href = 'https://wa.me/' + NUM + '?text=' + encodeURIComponent(msg);
    a.addEventListener('click', function () { window.dataLayer.push({ event: 'whatsapp_click', origem: o, pagina: pagina }); });
  });
  document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
    a.addEventListener('click', function () { window.dataLayer.push({ event: 'phone_click', origem: origem(a), pagina: pagina }); });
  });
  document.querySelectorAll('.cn-link').forEach(function (a) {
    a.addEventListener('click', function () { window.dataLayer.push({ event: 'directions_click', consultorio: a.closest('.cn-card').querySelector('h3').textContent }); });
  });
})();

/* WhatsApp flutuante: escondido enquanto o topo (hero) estiver na tela */
(function () {
  var hero = document.querySelector('.elementor-element-fd848fb, .bl-hero');
  if (!hero) return;
  var ticking = false;
  function upd() { ticking = false; document.body.classList.toggle('am-wa-hide', hero.getBoundingClientRect().bottom > window.innerHeight * 0.15); }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }
  upd();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
})();
