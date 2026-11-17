/* Eventos de conversão para a dataLayer (GA4/Google Ads no futuro). O painel próprio usa o tracker.js. */
window.amTrack = function (name, data) { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: name }, data || {})); };

/* Conversão: identifica de qual botão/seção veio cada clique no WhatsApp (na própria mensagem)
   e registra cada clique como evento no painel. */
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
    var botao = (a.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 60) || 'ícone do WhatsApp';
    a.addEventListener('click', function () { amTrack('Clique WhatsApp', { origem: o, pagina: pagina, botao: botao }); });
  });
  document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
    a.addEventListener('click', function () { amTrack('Clique telefone', { origem: origem(a), pagina: pagina }); });
  });
  document.querySelectorAll('.cn-link').forEach(function (a) {
    a.addEventListener('click', function () { amTrack('Como chegar', { consultorio: a.closest('.cn-card').querySelector('h3').textContent.trim(), pagina: pagina }); });
  });
  document.querySelectorAll('a[href*="instagram.com"]').forEach(function (a) {
    a.addEventListener('click', function () { amTrack('Clique Instagram', { origem: origem(a), pagina: pagina }); });
  });
  document.querySelectorAll('.sv-more').forEach(function (a) {
    a.addEventListener('click', function () { amTrack('Saiba mais (serviço)', { destino: a.getAttribute('href').replace(/\.\.\//g, '').replace(/\//g, '') || 'home', pagina: pagina }); });
  });
  document.querySelectorAll('a.bl-card').forEach(function (a) {
    a.addEventListener('click', function () { var t = a.querySelector('h2,h3'); amTrack('Abriu artigo', { artigo: t ? t.textContent.trim().slice(0, 80) : a.href, pagina: pagina }); });
  });
  document.querySelectorAll('details').forEach(function (d) {
    d.addEventListener('toggle', function () { if (d.open) { var s = d.querySelector('summary'); amTrack('Abriu pergunta do FAQ', { pergunta: s ? s.textContent.trim().slice(0, 90) : '', pagina: pagina }); } });
  });
  /* quanto da página a pessoa leu */
  var marcas = [50, 90], feitas = {};
  window.addEventListener('scroll', function () {
    var h = document.documentElement, p = (window.scrollY + window.innerHeight) / h.scrollHeight * 100;
    marcas.forEach(function (m) { if (p >= m && !feitas[m]) { feitas[m] = 1; amTrack('Leu ' + m + '% da página', { pagina: pagina }); } });
  }, { passive: true });
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
