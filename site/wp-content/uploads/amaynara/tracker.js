/* Rastreador próprio e leve (sem bibliotecas, sem cookies de terceiros) — mesmo padrão do Instituto do Sono.
   Mede: visitas, tempo ativo, páginas, seções vistas e tempo em cada uma, cliques (WhatsApp, telefone, mapa, Instagram…),
   rolagem, origem (UTM / Google / Instagram / ChatGPT…), aparelho e horário. Envia em lotes para /api/track (Supabase).
   Regras: 1 visita = 1 aba; nova visita após 30 min parado. Tempo ativo = aba visível + interação nos últimos 2 min. */
(function () {
  if (/^\/admin/.test(location.pathname) || navigator.webdriver || window.__amTrack) return;
  var ENDPOINT = '/api/track';
  var SESSION_TIMEOUT = 30 * 60 * 1000, FLUSH_MS = 15000, IDLE_MS = 120000;

  // Nome amigável de cada parte do site (o primeiro seletor que bater vale)
  var SECTIONS = [
    ['.elementor-element-f726a6a', 'Botão flutuante do WhatsApp'],
    ['.elementor-element-c9b6368, header.elementor-location-header', 'Menu do topo'],
    ['.elementor-element-fd848fb', 'Topo (headline)'],
    ['.elementor-element-90c3364', 'Faixa dourada'],
    ['#o-que-faz', 'O que faz uma médica de família'],
    ['#sobre-o-servico', 'Texto do serviço'],
    ['#outros-servicos', 'Outros serviços'],
    ['.dv-sec', 'Médica de família em BH / Como eu cuido'],
    ['.elementor-element-b6331c1, #depoimentos', 'Depoimentos'],
    ['.sv-sec', 'Sinais (cards de serviços)'],
    ['.pq-sec', 'Por que ser acompanhado'],
    ['.elementor-element-5cf9efa', 'Como funciona o atendimento'],
    ['.elementor-element-97f8234', 'Conheça a Dra.'],
    ['.pw-sec', 'Por quem cuidar da sua saúde'],
    ['.bh-sec', 'Conteúdos do blog'],
    ['.fq-sec', 'Perguntas frequentes'],
    ['.cn-sec', 'Consultórios'],
    ['.ct-sec', 'Canais de contato'],
    ['.od-sec', 'Onde atendemos'],
    ['.bl-hero', 'Topo do artigo/página'],
    ['.bl-faq', 'Perguntas do artigo'],
    ['.bl-body', 'Texto do artigo'],
    ['.bl-list, .bl-grid', 'Lista de artigos'],
    ['.sp-section', 'Conteúdo do serviço'],
    ['.elementor-element-ff882f0', 'Chamada final'],
    ['.elementor-element-8177d76, footer', 'Rodapé']
  ];
  var ALL_SEL = SECTIONS.map(function (s) { return s[0]; }).join(', ');
  function sectionOf(el) {
    if (!el || !el.closest) return undefined;
    for (var i = 0; i < SECTIONS.length; i++) if (el.closest(SECTIONS[i][0])) return SECTIONS[i][1];
    return undefined;
  }

  function rid() { return ((window.crypto && crypto.randomUUID && crypto.randomUUID()) || (Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10))).slice(0, 40); }
  function get(st, k) { try { return st.getItem(k); } catch (e) { return null; } }
  function set(st, k, v) { try { st.setItem(k, v); } catch (e) { /* modo privado */ } }

  // ---------- visita ----------
  var now = Date.now();
  var vid = get(localStorage, 'am_vid'); var returning = !!vid;
  if (!vid) { vid = rid(); set(localStorage, 'am_vid', vid); }
  var sess = null;
  try { var raw = get(sessionStorage, 'am_sess'); if (raw) { var s0 = JSON.parse(raw); if (now - s0.last < SESSION_TIMEOUT) sess = s0; } } catch (e) { /* */ }
  if (!sess) {
    var q = new URLSearchParams(location.search), utm = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'].forEach(function (k) { var v = q.get(k); if (v) utm[k] = v.slice(0, 200); });
    if (!utm.utm_source && utm.gclid) { utm.utm_source = 'google'; utm.utm_medium = 'cpc'; }
    if (!utm.utm_source && utm.fbclid) { utm.utm_source = 'facebook'; utm.utm_medium = 'paid_social'; }
    delete utm.fbclid;
    var refHost = '';
    try { refHost = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''; } catch (e) { /* */ }
    if (refHost === location.hostname.replace(/^www\./, '')) refHost = '';
    sess = { id: rid(), visitor_id: vid, started: now, last: now, is_returning: returning, utm: utm,
             landing_page: location.pathname, referrer: refHost ? document.referrer.slice(0, 300) : '', referrer_host: refHost };
    set(sessionStorage, 'am_first', '1');
    set(sessionStorage, 'am_active', '0');
  }
  sess.last = now; set(sessionStorage, 'am_sess', JSON.stringify(sess));

  var ua = navigator.userAgent, w = Math.min(screen.width, screen.height);
  var info = {
    device: /iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)) ? 'tablet' : /Mobi|iPhone|Android/i.test(ua) || w < 600 ? 'mobile' : 'desktop',
    os: /Windows/i.test(ua) ? 'Windows' : /iPhone|iPad|iOS/i.test(ua) ? 'iOS' : /Android/i.test(ua) ? 'Android' : /Mac OS/i.test(ua) ? 'macOS' : /Linux/i.test(ua) ? 'Linux' : 'Outro',
    browser: /Instagram/i.test(ua) ? 'Instagram (app)' : /FBAN|FBAV/i.test(ua) ? 'Facebook (app)' : /Edg\//.test(ua) ? 'Edge' : /SamsungBrowser/.test(ua) ? 'Samsung' : /OPR\//.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Outro',
    screen: screen.width + 'x' + screen.height, language: navigator.language,
    timezone: (Intl.DateTimeFormat().resolvedOptions().timeZone || '')
  };

  // ---------- fila e envio ----------
  var queue = [], activeSeconds = Number(get(sessionStorage, 'am_active') || 0), sentActive = -1, maxScroll = 0, sentScroll = -1, lastAct = Date.now();
  function push(e) { e.page = e.page || location.pathname; e.ts = new Date().toISOString(); queue.push(e); if (queue.length >= 40) flush(); }
  function flush(beacon) {
    var first = get(sessionStorage, 'am_first') === '1';
    var changed = activeSeconds !== sentActive || maxScroll !== sentScroll;
    if (!queue.length && !first && !changed) return;
    sess.last = Date.now(); set(sessionStorage, 'am_sess', JSON.stringify(sess)); set(sessionStorage, 'am_active', String(activeSeconds));
    var session = { id: sess.id, visitor_id: sess.visitor_id, is_returning: sess.is_returning, landing_page: sess.landing_page, page: location.pathname,
                    referrer: sess.referrer, referrer_host: sess.referrer_host, active_seconds: activeSeconds, max_scroll: maxScroll, hostname: location.hostname };
    Object.keys(sess.utm || {}).forEach(function (k) { session[k] = sess.utm[k]; });
    Object.keys(info).forEach(function (k) { session[k] = info[k]; });
    var payload = JSON.stringify({ first: first, session: session, events: queue.splice(0, queue.length) });
    sentActive = activeSeconds; sentScroll = maxScroll;
    if (first) set(sessionStorage, 'am_first', '0');
    try {
      if (beacon && navigator.sendBeacon) navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: 'application/json' }));
      else fetch(ENDPOINT, { method: 'POST', body: payload, keepalive: true, headers: { 'Content-Type': 'application/json' } }).catch(function () {});
    } catch (e) { /* sem rede */ }
  }
  window.__amTrack = push;

  // tempo ativo
  setInterval(function () { if (document.visibilityState === 'visible' && Date.now() - lastAct < IDLE_MS) activeSeconds += 1; }, 1000);
  ['pointerdown', 'keydown', 'scroll', 'touchstart', 'mousemove', 'wheel'].forEach(function (ev) { window.addEventListener(ev, function () { lastAct = Date.now(); }, { passive: true }); });

  // rolagem
  function onScroll() { var h = document.documentElement; var p = Math.round((h.scrollTop + innerHeight) / Math.max(h.scrollHeight, 1) * 100); if (p > maxScroll) maxScroll = Math.min(p, 100); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // cliques
  function classify(a) {
    if (!a) return { target: 'button' };
    var href = a.getAttribute('href') || '';
    if (/wa\.me|whatsapp/i.test(href)) return { target: 'whatsapp', href: href.split('?')[0] };
    if (/^tel:/.test(href)) return { target: 'phone', href: href };
    if (/^mailto:/.test(href)) return { target: 'email', href: 'mailto' };
    if (/google\.[^/]+\/maps|maps\.app|goo\.gl\/maps/i.test(href)) return { target: 'maps', href: 'google maps' };
    if (/instagram\.com/i.test(href)) return { target: 'instagram', href: href.split('?')[0] };
    if (/^#|^\//.test(href) || href.indexOf(location.hostname) > -1 || !/^https?:/i.test(href)) return { target: 'internal', href: href.slice(0, 200) };
    return { target: 'external', href: href.split('?')[0].slice(0, 200) };
  }
  document.addEventListener('click', function (ev) {
    var el = ev.target && ev.target.closest ? ev.target.closest('a, button, summary, [data-track]') : null;
    if (!el) return;
    var a = el.tagName === 'A' ? el : null;
    var text = (el.getAttribute('data-track') || el.innerText || el.textContent || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim();
    var c = classify(a);
    if (!text && c.target === 'whatsapp') text = 'Ícone do WhatsApp';
    push({ type: 'click', label: text.slice(0, 80) || el.getAttribute('aria-label') || '(ícone)', target: c.target, href: c.href, section: sectionOf(el) });
    if (c.target !== 'internal' && c.target !== 'button') flush(true);
  }, { capture: true });

  // página + tempo de cada seção na tela
  push({ type: 'pageview' });
  var pageStart = activeSeconds;
  function pushPageTime() { var secs = activeSeconds - pageStart; if (secs > 0) queue.push({ type: 'page_time', page: location.pathname, value: secs, ts: new Date().toISOString() }); pageStart = activeSeconds; }
  var seen = {}, inView = {}, since = {};
  function start(n) { if (!(n in since) && document.visibilityState === 'visible') since[n] = Date.now(); }
  function stop(n) { if (!(n in since)) return; var secs = Math.round((Date.now() - since[n]) / 100) / 10; delete since[n]; if (secs >= 1) push({ type: 'section_time', section: n, value: Math.min(secs, 1800) }); }
  function stopAll() { Object.keys(since).forEach(stop); }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var n = sectionOf(en.target); if (!n) return;
        var vis = en.isIntersecting && (en.intersectionRatio >= 0.4 || en.intersectionRect.height >= innerHeight * 0.5);
        if (vis) { inView[n] = 1; if (!seen[n]) { seen[n] = 1; push({ type: 'section_view', section: n }); } start(n); }
        else { delete inView[n]; stop(n); }
      });
    }, { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] });
    var els = [];
    document.querySelectorAll(ALL_SEL).forEach(function (el) {
      // só o bloco mais externo de cada seção (evita contar a mesma seção duas vezes)
      var n = sectionOf(el); if (!n) return;
      var p = el.parentElement && el.parentElement.closest ? el.parentElement.closest(ALL_SEL) : null;
      if (p && sectionOf(p) === n) return;
      els.push(el);
    });
    els.forEach(function (el) { io.observe(el); });
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') { stopAll(); pushPageTime(); flush(true); }
    else Object.keys(inView).forEach(start);
  });
  window.addEventListener('pagehide', function () { stopAll(); pushPageTime(); flush(true); });

  setTimeout(function () { flush(); }, 1500);
  setInterval(function () { flush(); }, FLUSH_MS);
})();
