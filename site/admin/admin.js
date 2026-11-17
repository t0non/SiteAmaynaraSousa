/* Painel do site — Dra. Amaynara Sousa. Busca os dados em /api/admin/data e monta tudo na tela. */
(function () {
  var app = document.getElementById('app');
  var WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  var MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var TARGETS = { whatsapp: 'WhatsApp', phone: 'Telefone', maps: 'Como chegar (mapa)', instagram: 'Instagram', email: 'E-mail', internal: 'Link interno', external: 'Link externo', button: 'Botão', download: 'Download' };
  var DEVICES = { mobile: 'Celular', desktop: 'Computador', tablet: 'Tablet' };
  var PRESETS = { hoje: 'Hoje', ontem: 'Ontem', '7d': '7 dias', '30d': '30 dias', mes: 'Este mês', '90d': '90 dias' };
  var PAGES = {
    '/': 'Início (página principal)', '/medica-de-familia-belo-horizonte': 'Consulta com médica de família', '/doencas-cronicas-belo-horizonte': 'Doenças crônicas',
    '/tratamento-dor-cronica-belo-horizonte': 'Dor crônica', '/saude-mental-ansiedade-depressao-belo-horizonte': 'Saúde mental',
    '/acupuntura-auriculoacupuntura-belo-horizonte': 'Acupuntura', '/teleconsulta-medica-de-familia': 'Teleconsulta',
    '/onde-atendemos': 'Onde atendemos', '/contato': 'Contato', '/blog': 'Blog (lista de artigos)'
  };

  // ícones de linha (mesmo traço dos ícones do site)
  var P = {
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    chat: '<path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.7A8.4 8.4 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5z"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    pointer: '<path d="M9 9l5 12 1.8-5.2L21 14z"/><path d="M7.2 2.2 8 5.1M5.1 8 2.2 7.2M14 4.1 12 6.2M6.2 12 4.1 14"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    compass: '<circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.1 6.4-6.4 2.1 2.1-6.4z"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    bot: '<rect x="3" y="8" width="18" height="12" rx="3"/><path d="M12 4v4M8 14h.01M16 14h.01"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    back: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>'
  };
  var ico = function (k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[k] || '') + '</svg>'; };

  // ---------- utilidades ----------
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var n = function (v) { return Number(v || 0).toLocaleString('pt-BR'); };
  var pad = function (x) { return String(x).padStart(2, '0'); };
  var pct = function (a, b) { return b ? Math.round(a / b * 1000) / 10 : 0; };
  function fmtTime(s) { s = Math.round(Number(s) || 0); if (s < 60) return s + 's'; var m = Math.floor(s / 60), r = s % 60; return m < 60 ? m + 'min ' + pad(r) + 's' : Math.floor(m / 60) + 'h ' + (m % 60) + 'min'; }
  function fmtDate(x) { return new Date(x).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }); }
  function pageName(path) {
    var p = String(path || '/').replace(/\/+$/, '') || '/';
    if (PAGES[p]) return PAGES[p];
    if (p.indexOf('/blog/') === 0) return 'Artigo: ' + decodeURIComponent(p.slice(6)).replace(/-/g, ' ');
    return p;
  }

  // períodos (Brasília = UTC-3)
  function spDate(y, m, d) { return new Date(y + '-' + pad(m) + '-' + pad(d) + 'T00:00:00-03:00'); }
  function todaySP() { var p = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()).split('-').map(Number); return { y: p[0], m: p[1], d: p[2] }; }
  var addDays = function (dt, k) { return new Date(dt.getTime() + k * 864e5); };
  function resolvePeriod(p, mParam) {
    var t = todaySP(), today = spDate(t.y, t.m, t.d), tomorrow = addDays(today, 1);
    if (mParam && /^\d{4}-\d{2}$/.test(mParam)) {
      var y = +mParam.slice(0, 4), m = +mParam.slice(5, 7), to = m === 12 ? spDate(y + 1, 1, 1) : spDate(y, m + 1, 1);
      return { key: 'm:' + mParam, label: MONTHS[m - 1] + ' de ' + y, from: spDate(y, m, 1), to: to > tomorrow ? tomorrow : to };
    }
    switch (p) {
      case 'hoje': return { key: 'hoje', label: 'Hoje', from: today, to: tomorrow };
      case 'ontem': return { key: 'ontem', label: 'Ontem', from: addDays(today, -1), to: today };
      case '30d': return { key: '30d', label: 'Últimos 30 dias', from: addDays(today, -29), to: tomorrow };
      case '90d': return { key: '90d', label: 'Últimos 90 dias', from: addDays(today, -89), to: tomorrow };
      case 'mes': return { key: 'mes', label: MONTHS[t.m - 1] + ' (até hoje)', from: spDate(t.y, t.m, 1), to: tomorrow };
      default: return { key: '7d', label: 'Últimos 7 dias', from: addDays(today, -6), to: tomorrow };
    }
  }
  function lastMonths() { var t = todaySP(), y = t.y, m = t.m, out = []; for (var i = 0; i < 12; i++) { out.push({ value: y + '-' + pad(m), label: MONTHS[m - 1] + ' ' + y }); m--; if (!m) { m = 12; y--; } } return out; }

  function delta(now, prev, invert, suffix) {
    if (prev == null) return '';
    suffix = suffix || '%';
    if (!prev && !now) return '<em class="adm-delta">—</em>';
    if (!prev) return '<em class="adm-delta up">novo</em>';
    var diff = suffix === 'pp' ? now - prev : (now - prev) / prev * 100;
    var good = invert ? diff < 0 : diff > 0, cls = Math.abs(diff) < 0.5 ? '' : good ? 'up' : 'down';
    return '<em class="adm-delta ' + cls + '">' + (diff > 0 ? '▲' : diff < 0 ? '▼' : '') + ' ' + Math.abs(diff).toFixed(suffix === 'pp' ? 1 : 0) + (suffix === 'pp' ? ' p.p.' : '%') + '</em>';
  }
  function bars(rows, label, value, fmt, green) {
    if (!rows || !rows.length) return '<p class="adm-empty">Sem dados no período.</p>';
    fmt = fmt || n; var top = Math.max.apply(null, [1].concat(rows.map(value)));
    return '<ul class="adm-bars' + (green ? ' green' : '') + '">' + rows.map(function (r) {
      var l = label(r);
      return '<li><div class="adm-bar-label" title="' + esc(l) + '">' + esc(l) + '</div><div class="adm-bar-track"><div class="adm-bar-fill" style="width:' + (value(r) / top * 100) + '%"></div></div><div class="adm-bar-value">' + fmt(value(r)) + '</div></li>';
    }).join('') + '</ul>';
  }
  function table(head, rows, empty) {
    return '<div class="adm-scroll"><table class="adm-table"><thead><tr>' + head.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' +
      (rows.length ? rows.join('') : '<tr><td colspan="' + head.length + '" class="adm-empty">' + (empty || 'Sem dados no período.') + '</td></tr>') + '</tbody></table></div>';
  }

  // ---------- estado ----------
  var qs = new URLSearchParams(location.search);
  var state = { p: qs.get('p') || '7d', m: qs.get('m') || '', t: qs.get('t') === '1', demo: qs.get('demo') === '1' };
  function setState(patch) {
    Object.assign(state, patch);
    var q = new URLSearchParams();
    if (state.m) q.set('m', state.m); else if (state.p !== '7d') q.set('p', state.p);
    if (state.t) q.set('t', '1'); if (state.demo) q.set('demo', '1');
    history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : ''));
    load();
  }

  // ---------- telas ----------
  function loginScreen(msg) {
    app.innerHTML = '<main class="adm-login"><form method="post" action="/api/admin/login" class="adm-login-card">' +
      '<img src="/wp-content/uploads/amaynara/logo_amaynara.png" alt="Dra. Amaynara Sousa">' +
      '<p class="adm-kicker" style="text-align:center">Painel do site</p>' +
      '<label><span>Senha</span><input type="password" name="password" required autofocus autocomplete="current-password"></label>' +
      (msg ? '<p class="adm-error">' + msg + '</p>' : '') + '<button type="submit">Entrar</button></form></main>';
  }
  function setupScreen(missing, localNoApi) {
    app.innerHTML = '<main class="adm-wrap"><div class="adm-card"><p class="adm-kicker">Painel do site</p><h1>Falta conectar o painel</h1>' +
      (localNoApi ? '<p>Este servidor local não está rodando as funções do painel (/api). Rode <code>npm run dev</code> com o arquivo <code>.env.local</code> preenchido, ou veja na Vercel.</p>'
        : '<p>Configure na Vercel (Settings → Environment Variables): <b>' + esc((missing || []).join(', ')) + '</b>. Depois faça um novo deploy.</p>') +
      '<p>E rode o arquivo <code>supabase/painel.sql</code> no SQL Editor do Supabase.</p>' +
      '<p><a href="?demo=1"><b>Ver o painel com dados de exemplo →</b></a></p></div></main>';
  }

  function load() {
    var period = resolvePeriod(state.p, state.m);
    app.innerHTML = '<main class="adm-wrap"><div class="adm-card adm-loading">Carregando ' + esc(period.label.toLowerCase()) + '…</div></main>';
    if (state.demo) return render(demoData(period), period);
    var url = '/api/admin/data?from=' + encodeURIComponent(period.from.toISOString()) + '&to=' + encodeURIComponent(period.to.toISOString()) + (state.t ? '&test=1' : '');
    fetch(url, { credentials: 'same-origin', cache: 'no-store' }).then(function (r) {
      if (r.status === 401) return loginScreen(qs.get('erro') === '1' ? 'Senha incorreta.' : '');
      if (r.status === 404) return setupScreen(null, true);
      return r.json().then(function (j) {
        if (j.setup) return setupScreen(j.missing);
        if (j.error) { app.innerHTML = '<main class="adm-wrap"><div class="adm-card"><h1>Erro ao carregar</h1><p>' + esc(j.error) + '</p>' + (j.sql ? '<p>Rode o arquivo <code>supabase/painel.sql</code> no SQL Editor do Supabase.</p>' : '') + '</div></main>'; return; }
        render(j, period);
      });
    }).catch(function () { setupScreen(null, true); });
  }

  function render(data, period) {
    var d = data.dash, prev = data.prev, t = d.totals, pt = prev && prev.totals, visitors = data.visitors, keywords = data.keywords;
    var hasData = t.sessions > 0;
    var maxDay = Math.max.apply(null, [1].concat(d.by_day.map(function (x) { return x.sessions; })));
    var maxHour = Math.max.apply(null, [1].concat(d.by_hour.map(function (x) { return x.sessions; })));
    var best = function (arr, k) { return arr.reduce(function (a, b) { return b[k] > a[k] ? b : a; }, arr[0] || {}); };
    var bestHour = best(d.by_hour, 'sessions'), bestWaHour = best(d.by_hour, 'whatsapp'), bestDow = best(d.by_weekday, 'sessions');
    var stickiest = d.sections.filter(function (s) { return s.sessions >= 3; }).sort(function (a, b) { return b.avg_seconds - a.avg_seconds; })[0];
    var topClick = d.clicks[0], topWa = d.whatsapp_by_section[0], topCity = d.cities.filter(function (c) { return c.city !== 'Não identificada'; })[0];

    // agrupamento por tipo de origem
    var kinds = {}; d.sources.forEach(function (s) { var k = s.kind || 'Outros'; kinds[k] = kinds[k] || { sessions: 0, whatsapp: 0 }; kinds[k].sessions += s.sessions; kinds[k].whatsapp += s.whatsapp; });
    var KIND_ORDER = ['Busca orgânica', 'Inteligência artificial', 'Redes sociais', 'Anúncio', 'Direto', 'Campanha (UTM)', 'Outros sites'];
    var KIND_ICO = { 'Busca orgânica': ico('search'), 'Inteligência artificial': ico('bot'), 'Redes sociais': ico('share'), 'Anúncio': ico('megaphone'), 'Direto': ico('back'), 'Campanha (UTM)': ico('tag'), 'Outros sites': ico('link') };

    var insights = [];
    if (hasData) {
      insights.push([ico('clock'), 'Horário mais movimentado', bestHour.hour + 'h às ' + (bestHour.hour + 1) + 'h', 'mais visitas na ' + WEEKDAYS[bestDow.dow]]);
      if (topWa) insights.push([ico('chat'), 'De onde mais saem cliques no WhatsApp', topWa.section, n(topWa.clicks) + ' cliques' + (bestWaHour.whatsapp > 0 ? ' · pico às ' + bestWaHour.hour + 'h' : '')]);
      if (topClick) insights.push([ico('pointer'), 'Botão mais clicado', topClick.label, n(topClick.clicks) + ' cliques' + (topClick.section ? ' · ' + topClick.section : '')]);
      if (stickiest) insights.push([ico('eye'), 'Seção onde mais param', stickiest.section, fmtTime(stickiest.avg_seconds) + ' em média']);
      if (d.sources[0]) insights.push([ico('compass'), 'Principal origem', d.sources[0].source, n(d.sources[0].sessions) + ' visitas · ' + pct(d.sources[0].whatsapp, d.sources[0].sessions) + '% clicaram no WhatsApp']);
      if (topCity) insights.push([ico('pin'), 'Cidade que mais acessa', topCity.city, n(topCity.sessions) + ' visitas']);
    }

    var months = lastMonths();
    var h = '';
    h += '<main class="adm-wrap">';
    if (state.demo) h += '<div class="adm-card adm-demo"><b>Dados de exemplo.</b> Isto é só uma demonstração de como o painel fica. Os números reais aparecem quando o Supabase e as senhas estiverem configurados.</div>';
    h += '<header class="adm-top"><div><p class="adm-kicker">Dra. Amaynara Sousa</p><h1>Painel do <span>site</span></h1><p class="adm-period"><span class="adm-live"><i></i>' + n(d.online_now) + ' no site agora</span> · ' + esc(period.label) + '</p></div>';
    h += '<div class="adm-filters"><nav class="adm-range">' + Object.keys(PRESETS).map(function (k) { return '<button data-p="' + k + '" class="' + (period.key === k ? 'on' : '') + '">' + PRESETS[k] + '</button>'; }).join('') + '</nav>';
    h += '<label class="adm-month"><select id="adm-m" aria-label="Escolher mês"><option value="">Escolher mês…</option>' + months.map(function (m) { return '<option value="' + m.value + '"' + (state.m === m.value ? ' selected' : '') + '>' + m.label + '</option>'; }).join('') + '</select></label>';
    h += '<button class="adm-test ' + (state.t ? 'on' : '') + '" id="adm-t">' + (state.t ? '✓ Incluindo testes' : 'Incluir testes') + '</button>';
    if (!state.demo) h += '<form method="post" action="/api/admin/logout"><button class="adm-ghost">Sair</button></form>';
    h += '</div></header>';
    h += '<nav class="adm-nav"><a href="#resultado">Resultado</a><a href="#comportamento">O que fazem no site</a><a href="#quando">Quando e como acessam</a><a href="#origem">De onde vêm</a><a href="#pessoas">Visitantes</a></nav>';
    if (!hasData) h += '<div class="adm-card adm-note-card">Nenhuma visita real no período. Visitas no seu computador (localhost) e enquanto você está logado no painel são marcadas como <b>teste</b> e ficam fora dos números. Clique em <b>Incluir testes</b> para vê-las.</div>';

    // RESULTADO
    h += '<h2 class="adm-group" id="resultado"><span>Resultado</span> <small>comparado com o período anterior</small></h2>';
    h += '<section class="adm-kpis">';
    h += '<div class="adm-kpi"><div class="adm-kpi-head"><span class="adm-ico">' + ico('users') + '</span>Visitas</div><strong>' + n(t.sessions) + '</strong><small>' + n(t.visitors) + ' pessoas · ' + n(t.returning) + ' voltaram</small>' + delta(t.sessions, pt && pt.sessions) + '</div>';
    h += '<div class="adm-kpi hl"><div class="adm-kpi-head"><span class="adm-ico g">' + ico('chat') + '</span>Clicaram no WhatsApp</div><strong>' + n(t.whatsapp_sessions) + '</strong><small>' + t.whatsapp_rate + '% das visitas · ' + n(t.whatsapp_clicks) + ' cliques</small>' + delta(t.whatsapp_sessions, pt && pt.whatsapp_sessions) + '</div>';
    h += '<div class="adm-kpi hl"><div class="adm-kpi-head"><span class="adm-ico g">' + ico('phone') + '</span>Entraram em contato</div><strong>' + n(t.contact_sessions) + '</strong><small>' + t.contact_rate + '% das visitas (WhatsApp ou telefone)</small>' + delta(t.contact_sessions, pt && pt.contact_sessions) + '</div>';
    h += '<div class="adm-kpi"><div class="adm-kpi-head"><span class="adm-ico">' + ico('clock') + '</span>Tempo médio no site</div><strong>' + fmtTime(t.avg_seconds) + '</strong><small>metade fica mais de ' + fmtTime(t.median_seconds) + '</small>' + delta(t.avg_seconds, pt && pt.avg_seconds) + '</div>';
    h += '</section>';
    h += '<section class="adm-strip">';
    h += '<div><span>Saíram em menos de 10s</span><b>' + t.bounce_rate + '%</b>' + delta(t.bounce_rate, pt && pt.bounce_rate, true, 'pp') + '</div>';
    h += '<div><span>Cliques em “Ligar”</span><b>' + n(t.phone_clicks) + '</b>' + delta(t.phone_clicks, pt && pt.phone_clicks) + '</div>';
    h += '<div><span>Cliques em “Como chegar”</span><b>' + n(t.maps_clicks) + '</b>' + delta(t.maps_clicks, pt && pt.maps_clicks) + '</div>';
    h += '<div><span>Páginas vistas</span><b>' + n(t.pageviews) + '</b>' + delta(t.pageviews, pt && pt.pageviews) + '</div>';
    h += '<div><span>Rolagem média da página</span><b>' + t.avg_scroll + '%</b></div>';
    h += '</section>';
    if (insights.length) h += '<section class="adm-insights">' + insights.map(function (it) { return '<div class="adm-insight"><span class="adm-ico">' + it[0] + '</span><div><small>' + it[1] + '</small><b title="' + esc(it[2]) + '">' + esc(it[2]) + '</b><em>' + esc(it[3]) + '</em></div></div>'; }).join('') + '</section>';
    h += '<section class="adm-card"><div class="adm-card-head"><h3>Visitas por dia</h3><p class="adm-legend"><span><i class="lg-a"></i>visitas</span><span><i class="lg-b"></i>clicaram no WhatsApp</span></p></div>';
    h += '<div class="adm-cols" style="grid-template-columns:repeat(' + Math.max(d.by_day.length, 1) + ',minmax(0,1fr))">' + d.by_day.map(function (x) {
      var dd = x.day.slice(8, 10) + '/' + x.day.slice(5, 7);
      return '<div class="adm-col" title="' + dd + ': ' + x.sessions + ' visitas · ' + x.whatsapp + ' WhatsApp"><b class="adm-col-n">' + (x.sessions || '') + '</b><div class="adm-col-bar" style="height:' + (x.sessions / maxDay * 100) + '%">' + (x.whatsapp ? '<div class="adm-col-wa" style="height:' + (x.whatsapp / Math.max(x.sessions, 1) * 100) + '%"></div>' : '') + '</div><span>' + dd + '</span></div>';
    }).join('') + '</div></section>';

    // COMPORTAMENTO
    h += '<h2 class="adm-group" id="comportamento">O que fazem <span>no site</span></h2>';
    h += '<section class="adm-card"><div class="adm-card-head"><h3>Páginas mais acessadas</h3></div>' + table(['Página', 'Aberturas', 'Visitas', 'Entraram por ela', 'Tempo médio', 'WhatsApp'], d.pages.map(function (p) {
      return '<tr><td><b>' + esc(pageName(p.page)) + '</b><small class="adm-sub">' + esc(p.page) + '</small></td><td>' + n(p.views) + '</td><td><div class="adm-mini"><div style="width:' + Math.min(p.reach, 100) + '%"></div></div>' + n(p.sessions) + ' <small class="adm-muted">(' + p.reach + '%)</small></td><td>' + n(p.entrances) + '</td><td>' + fmtTime(p.avg_seconds) + '</td><td>' + n(p.whatsapp_sessions) + ' <small class="adm-muted">(' + pct(p.whatsapp_sessions, p.sessions) + '%)</small></td></tr>';
    })) + '<p class="adm-note">Aberturas = vezes que a página abriu. Visitas = visitas diferentes que abriram a página. “Entraram por ela” = foi a primeira página da visita.</p></section>';
    h += '<section class="adm-card"><div class="adm-card-head"><h3>Seções: até onde chegam e onde param</h3></div>' + table(['Seção', 'Chegaram até ela', 'Tempo médio na tela', 'Tempo total'], d.sections.filter(function (s) { return s.sessions > 0; }).map(function (s) {
      return '<tr><td><b>' + esc(s.section) + '</b></td><td><div class="adm-mini wide"><div style="width:' + Math.min(s.reach, 100) + '%"></div></div>' + s.reach + '% <small class="adm-muted">(' + n(s.sessions) + ')</small></td><td>' + fmtTime(s.avg_seconds) + '</td><td>' + fmtTime(s.total_seconds) + '</td></tr>';
    })) + '</section>';
    h += '<div class="adm-grid2 wide-left"><section class="adm-card"><div class="adm-card-head"><h3>Botões mais clicados</h3></div>' + table(['Botão', 'Tipo', 'Onde', 'Cliques'], d.clicks.slice(0, 30).map(function (c) {
      return '<tr><td><b>' + esc(c.label) + '</b></td><td><span class="adm-tag t-' + esc(c.target) + '">' + esc(TARGETS[c.target] || c.target) + '</span></td><td>' + esc(c.section || '—') + '</td><td><b>' + n(c.clicks) + '</b></td></tr>';
    }), 'Sem cliques no período.') + '</section>';
    h += '<div class="adm-stack"><section class="adm-card"><div class="adm-card-head"><h3>Cliques no WhatsApp por seção</h3></div>' + bars(d.whatsapp_by_section, function (r) { return r.section; }, function (r) { return r.clicks; }, n, true) + '</section>';
    h += '<section class="adm-card"><div class="adm-card-head"><h3>Cliques por tipo</h3></div>' + bars(d.click_targets, function (r) { return TARGETS[r.target] || r.target; }, function (r) { return r.clicks; }) + '</section></div></div>';

    // QUANDO
    h += '<h2 class="adm-group" id="quando">Quando e como <span>acessam</span></h2>';
    h += '<div class="adm-grid2"><section class="adm-card"><div class="adm-card-head"><h3>Horário das visitas</h3></div><div class="adm-hours">' + d.by_hour.map(function (x) {
      var lvl = x.sessions / maxHour; return '<div class="' + (lvl >= 0.5 ? 'hot' : '') + '" style="--lvl:' + lvl + '" title="' + x.hour + 'h: ' + x.sessions + ' visitas · ' + x.whatsapp + ' WhatsApp"><b>' + x.hour + 'h</b><span>' + x.sessions + '</span></div>';
    }).join('') + '</div><h4>Dia da semana</h4>' + bars(d.by_weekday, function (r) { return WEEKDAYS[r.dow]; }, function (r) { return r.sessions; }) + '</section>';
    h += '<section class="adm-card"><div class="adm-card-head"><h3>Quanto tempo ficam</h3></div>' + bars(d.durations, function (r) { return r.bucket; }, function (r) { return r.sessions; }) + '<h4>Até onde rolam a página</h4>' + bars(d.scroll, function (r) { return r.bucket >= 100 ? 'até o fim' : r.bucket + '–' + (r.bucket + 24) + '%'; }, function (r) { return r.sessions; }) + '</section></div>';
    h += '<div class="adm-grid2"><section class="adm-card"><div class="adm-card-head"><h3>Aparelho</h3></div>' + table(['Aparelho', 'Visitas', 'Tempo médio', 'WhatsApp'], d.devices.map(function (x) {
      return '<tr><td><b>' + esc(DEVICES[x.device] || (x.device === '?' ? 'Não identificado' : x.device)) + '</b></td><td>' + n(x.sessions) + ' <small class="adm-muted">(' + pct(x.sessions, t.sessions) + '%)</small></td><td>' + fmtTime(x.avg_seconds) + '</td><td>' + n(x.whatsapp) + '</td></tr>';
    })) + '</section><section class="adm-card"><div class="adm-card-head"><h3>Navegador</h3></div>' + bars(d.browsers, function (r) { return r.name === '?' ? 'Não identificado' : r.name; }, function (r) { return r.sessions; }) + '<h4>Sistema</h4>' + bars(d.os, function (r) { return r.name === '?' ? 'Não identificado' : r.name; }, function (r) { return r.sessions; }) + '</section></div>';

    // ORIGEM
    h += '<h2 class="adm-group" id="origem">De onde <span>vêm</span> <small>Google, inteligência artificial (ChatGPT, Gemini…), Instagram, anúncios</small></h2>';
    h += '<section class="adm-card"><div class="adm-card-head"><h3>Tipo de origem</h3></div><div class="adm-kinds">' + KIND_ORDER.filter(function (k) { return kinds[k]; }).map(function (k) {
      return '<div class="adm-kind"><small><span class="adm-kind-ico">' + (KIND_ICO[k] || '') + '</span>' + k + '</small><b>' + n(kinds[k].sessions) + '</b><em>' + pct(kinds[k].sessions, t.sessions) + '% das visitas · ' + n(kinds[k].whatsapp) + ' WhatsApp</em></div>';
    }).join('') + (Object.keys(kinds).length ? '' : '<p class="adm-empty">Sem dados no período.</p>') + '</div></section>';
    h += '<div class="adm-grid2"><section class="adm-card"><div class="adm-card-head"><h3>Origem das visitas</h3></div>' + table(['Origem', 'Visitas', 'Tempo', 'WhatsApp'], d.sources.map(function (s) {
      return '<tr><td><b>' + esc(s.source) + '</b><small class="adm-sub">' + esc(s.kind || '') + '</small></td><td>' + n(s.sessions) + '</td><td>' + fmtTime(s.avg_seconds) + '</td><td>' + n(s.whatsapp) + ' <small class="adm-muted">(' + pct(s.whatsapp, s.sessions) + '%)</small></td></tr>';
    }));
    if (d.campaigns.length) h += '<h4>Campanhas (UTM)</h4>' + table(['Campanha', 'Fonte / meio', 'Visitas', 'WhatsApp'], d.campaigns.map(function (c) { return '<tr><td><b>' + esc(c.campaign) + '</b></td><td>' + esc(c.source) + ' / ' + esc(c.medium) + '</td><td>' + n(c.sessions) + '</td><td>' + n(c.whatsapp) + '</td></tr>'; }));
    h += '</section><div class="adm-stack"><section class="adm-card"><div class="adm-card-head"><h3>Cidades</h3></div>' + table(['Cidade', 'Estado', 'Visitas', 'WhatsApp'], d.cities.slice(0, 15).map(function (c) {
      return '<tr><td><b>' + esc(c.city) + '</b></td><td>' + esc(c.region || '—') + '</td><td>' + n(c.sessions) + '</td><td>' + n(c.whatsapp) + '</td></tr>';
    })) + '<p class="adm-note">A localização vem da rede de internet do visitante (cidade e estado). O bairro não é identificado com precisão por nenhuma ferramenta.</p></section>';
    h += '<section class="adm-card"><div class="adm-card-head"><h3>Página de entrada</h3></div>' + bars(d.landing_pages, function (r) { return pageName(r.page); }, function (r) { return r.sessions; }) + '</section></div></div>';
    h += '<section class="adm-card"><div class="adm-card-head"><h3>Palavras-chave dos anúncios</h3></div>' + (!keywords || !keywords.length ? '<p class="adm-empty">Nenhuma visita de anúncio com palavra-chave no período. Elas aparecem depois que o “Sufixo do URL final” for configurado no Google Ads (utm_term={keyword}).</p>' :
      table(['Palavra-chave', 'Campanha', 'Visitas', 'Tempo médio', 'WhatsApp'], keywords.map(function (k) { return '<tr><td><b>' + esc(k.keyword) + '</b></td><td>' + esc(k.campaign || '—') + '</td><td>' + n(k.sessions) + '</td><td>' + fmtTime(k.avg_seconds) + '</td><td>' + n(k.whatsapp) + ' <small class="adm-muted">(' + pct(k.whatsapp, k.sessions) + '%)</small></td></tr>'; }))) + '</section>';

    // PESSOAS
    h += '<h2 class="adm-group" id="pessoas"><span>Visitantes</span></h2>';
    h += '<section class="adm-card"><div class="adm-card-head"><h3>Visitantes ' + (visitors ? '<span class="adm-count">' + n(visitors.length) + '</span>' : '') + '</h3></div>';
    h += !visitors ? '<p class="adm-empty">Rode o arquivo <code>supabase/painel.sql</code> no Supabase para ver esta lista.</p>' : !visitors.length ? '<p class="adm-empty">Nenhum visitante no período.</p>' :
      '<div class="adm-scroll tall">' + table(['Código', 'Visitas', 'Primeira vez', 'Última vez', 'Tempo total', 'WhatsApp', 'Ligou', 'Cidade', 'Veio de', 'Entrou por'], visitors.map(function (v) {
        return '<tr><td><code>' + esc(v.code) + '</code></td><td><b>' + n(v.visits) + '</b>' + (v.visits > 1 ? ' <span class="adm-tag t-whatsapp">voltou</span>' : '') + (v.visits !== v.visits_period ? '<small class="adm-sub">' + n(v.visits_period) + ' no período</small>' : '') + '</td><td>' + fmtDate(v.first_seen) + '</td><td>' + fmtDate(v.last_seen) + '</td><td>' + fmtTime(v.total_seconds) + '</td><td>' + (v.whatsapp_visits ? n(v.whatsapp_visits) + '×' : '—') + '</td><td>' + (v.phone_visits ? n(v.phone_visits) + '×' : '—') + '</td><td>' + esc(v.city || '—') + '</td><td>' + esc(v.first_source || '—') + '</td><td>' + esc(pageName(v.first_page)) + '</td></tr>';
      })).replace('<div class="adm-scroll">', '').replace(/<\/div>$/, '') + '</div>';
    h += '<p class="adm-note">Cada aparelho recebe um código aleatório na primeira visita (nenhum dado pessoal é guardado). Se a pessoa trocar de aparelho ou limpar o navegador, conta como visitante novo.</p></section>';
    h += '<p class="adm-foot">Horário de Brasília. Visitas de teste (localhost e admin logado) ficam fora dos números. Robôs são filtrados.</p></main>';
    app.innerHTML = h;

    app.querySelectorAll('[data-p]').forEach(function (b) { b.onclick = function () { setState({ p: b.getAttribute('data-p'), m: '' }); }; });
    var sel = document.getElementById('adm-m'); if (sel) sel.onchange = function () { if (sel.value) setState({ m: sel.value }); };
    var tb = document.getElementById('adm-t'); if (tb) tb.onclick = function () { setState({ t: !state.t }); };
  }

  // ---------- dados de exemplo (só para visualizar o painel antes de conectar) ----------
  function demoData(period) {
    var seed = 7; function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    var ri = function (a, b) { return Math.round(a + rnd() * (b - a)); };
    var days = Math.max(1, Math.round((period.to - period.from) / 864e5));
    var by_day = []; for (var i = 0; i < days; i++) { var dt = new Date(period.from.getTime() + i * 864e5 + 3 * 36e5), s = ri(18, 60); by_day.push({ day: dt.toISOString().slice(0, 10), sessions: s, whatsapp: ri(1, Math.round(s * 0.12)) }); }
    var sessions = by_day.reduce(function (a, b) { return a + b.sessions; }, 0), wa = by_day.reduce(function (a, b) { return a + b.whatsapp; }, 0);
    var hours = []; for (var hh = 0; hh < 24; hh++) { var base = hh < 7 ? 0.2 : hh < 12 ? 1 : hh < 14 ? 0.8 : hh < 19 ? 1.1 : hh < 23 ? 1.4 : 0.5; hours.push({ hour: hh, sessions: Math.round(base * sessions / 24 * (0.7 + rnd() * 0.6)), whatsapp: Math.round(base * wa / 24) }); }
    var mk = function (arr) { return arr.map(function (x) { return x; }); };
    var dash = {
      totals: { sessions: sessions, visitors: Math.round(sessions * 0.82), new_visitors: Math.round(sessions * 0.74), returning: Math.round(sessions * 0.26), avg_seconds: 96, median_seconds: 48, engaged: Math.round(sessions * 0.71), bounce_rate: 29.4, avg_scroll: 61, pageviews: Math.round(sessions * 1.9), whatsapp_sessions: wa, whatsapp_rate: pct(wa, sessions), whatsapp_clicks: Math.round(wa * 1.2), phone_clicks: Math.round(wa * 0.25), maps_clicks: Math.round(wa * 0.4), instagram_clicks: Math.round(wa * 0.3), contact_sessions: Math.round(wa * 1.15), contact_rate: pct(wa * 1.15, sessions) },
      online_now: 3, by_day: by_day, by_hour: hours,
      by_weekday: WEEKDAYS.map(function (_, k) { return { dow: k, sessions: Math.round(sessions / 7 * (k === 0 ? 0.6 : k === 6 ? 0.8 : 1.1)), whatsapp: Math.round(wa / 7) }; }),
      sections: mk([['Topo (headline)', 100, 14], ['Faixa dourada', 88, 3], ['Médica de família em BH / Como eu cuido', 72, 21], ['Depoimentos', 63, 18], ['Sinais (cards de serviços)', 58, 34], ['Por que ser acompanhado', 44, 16], ['Como funciona o atendimento', 39, 11], ['Conheça a Dra.', 36, 19], ['Por quem cuidar da sua saúde', 28, 22], ['Perguntas frequentes', 24, 27], ['Consultórios', 21, 15], ['Rodapé', 16, 4]].map(function (r) { var ss = Math.round(sessions * r[1] / 100); return { section: r[0], sessions: ss, reach: r[1], avg_seconds: r[2], total_seconds: ss * r[2] }; })),
      clicks: mk([['QUERO COMEÇAR A ME CUIDAR', 'whatsapp', 'Topo (headline)', .35], ['Ícone do WhatsApp', 'whatsapp', 'Botão flutuante do WhatsApp', .3], ['MARCAR MEU CHECK-UP', 'whatsapp', 'Sinais (cards de serviços)', .12], ['CUIDAR DA MINHA DOR', 'whatsapp', 'Sinais (cards de serviços)', .1], ['Como chegar', 'maps', 'Consultórios', .4], ['(31) 97255-8308', 'phone', 'Consultórios', .25], ['SAIBA MAIS →', 'internal', 'Sinais (cards de serviços)', .5], ['Instagram', 'instagram', 'Rodapé', .2]].map(function (r) { return { label: r[0], target: r[1], section: r[2], clicks: Math.round(wa * r[3] * 2), sessions: Math.round(wa * r[3] * 1.6) }; })),
      click_targets: [{ target: 'whatsapp', clicks: Math.round(wa * 1.2) }, { target: 'internal', clicks: Math.round(wa * 1.4) }, { target: 'maps', clicks: Math.round(wa * 0.4) }, { target: 'phone', clicks: Math.round(wa * 0.25) }, { target: 'instagram', clicks: Math.round(wa * 0.3) }],
      whatsapp_by_section: [{ section: 'Topo (headline)', clicks: Math.round(wa * .4) }, { section: 'Botão flutuante do WhatsApp', clicks: Math.round(wa * .3) }, { section: 'Sinais (cards de serviços)', clicks: Math.round(wa * .25) }, { section: 'Chamada final', clicks: Math.round(wa * .1) }],
      pages: [['/', 1, 100, 58, 84], ['/blog/dor-lombar-cronica', .22, 22, 19, 151], ['/tratamento-dor-cronica-belo-horizonte', .18, 18, 6, 102], ['/medica-de-familia-belo-horizonte', .15, 15, 4, 77], ['/blog/medico-de-familia-perto-de-mim-bh', .12, 12, 10, 120], ['/saude-mental-ansiedade-depressao-belo-horizonte', .11, 11, 3, 95], ['/contato', .09, 9, 1, 41], ['/onde-atendemos', .07, 7, 2, 58]].map(function (r) { var ss = Math.round(sessions * r[1] * 0.6); return { page: r[0], views: Math.round(ss * 1.2), sessions: ss, reach: Math.round(r[2] * 0.6), entrances: Math.round(sessions * r[3] / 100), avg_seconds: r[4], whatsapp: Math.round(ss * 0.1), whatsapp_sessions: Math.round(ss * 0.09) }; }),
      landing_pages: [{ page: '/', sessions: Math.round(sessions * .58) }, { page: '/blog/dor-lombar-cronica', sessions: Math.round(sessions * .19) }, { page: '/blog/medico-de-familia-perto-de-mim-bh', sessions: Math.round(sessions * .1) }],
      sources: [['Google (orgânico)', 'Busca orgânica', .41, .1], ['Instagram', 'Redes sociais', .2, .07], ['Direto (digitou ou link salvo)', 'Direto', .17, .12], ['ChatGPT', 'Inteligência artificial', .07, .16], ['Anúncio Google', 'Anúncio', .1, .14], ['Gemini', 'Inteligência artificial', .02, .1], ['WhatsApp', 'Outros sites', .03, .08]].map(function (r) { var ss = Math.round(sessions * r[2]); return { source: r[0], kind: r[1], sessions: ss, whatsapp: Math.round(ss * r[3]), avg_seconds: ri(50, 140) }; }),
      campaigns: [{ campaign: 'consulta-particular-bh', source: 'google', medium: 'cpc', sessions: Math.round(sessions * .1), whatsapp: Math.round(wa * .2) }],
      devices: [{ device: 'mobile', sessions: Math.round(sessions * .78), avg_seconds: 88, whatsapp: Math.round(wa * .85) }, { device: 'desktop', sessions: Math.round(sessions * .2), avg_seconds: 131, whatsapp: Math.round(wa * .14) }, { device: 'tablet', sessions: Math.round(sessions * .02), avg_seconds: 70, whatsapp: 0 }],
      browsers: [{ name: 'Chrome', sessions: Math.round(sessions * .55) }, { name: 'Safari', sessions: Math.round(sessions * .25) }, { name: 'Instagram (app)', sessions: Math.round(sessions * .12) }, { name: 'Samsung', sessions: Math.round(sessions * .08) }],
      os: [{ name: 'Android', sessions: Math.round(sessions * .52) }, { name: 'iOS', sessions: Math.round(sessions * .3) }, { name: 'Windows', sessions: Math.round(sessions * .16) }],
      cities: [['Belo Horizonte', .71], ['Contagem', .09], ['Santa Luzia', .05], ['Vespasiano', .03], ['Betim', .03], ['Não identificada', .04]].map(function (r) { return { city: r[0], region: r[0] === 'Não identificada' ? null : 'MG', sessions: Math.round(sessions * r[1]), whatsapp: Math.round(wa * r[1]) }; }),
      scroll: [{ bucket: 0, sessions: Math.round(sessions * .18) }, { bucket: 25, sessions: Math.round(sessions * .22) }, { bucket: 50, sessions: Math.round(sessions * .25) }, { bucket: 75, sessions: Math.round(sessions * .2) }, { bucket: 100, sessions: Math.round(sessions * .15) }],
      durations: [['0–10s', .29], ['10–30s', .2], ['30s–1min', .17], ['1–3min', .2], ['3–10min', .11], ['10min+', .03]].map(function (r) { return { bucket: r[0], sessions: Math.round(sessions * r[1]) }; })
    };
    var prevT = Object.assign({}, dash.totals); Object.keys(prevT).forEach(function (k) { prevT[k] = Math.round(prevT[k] * 0.82 * 10) / 10; });
    var visitors = []; for (var v = 0; v < 12; v++) visitors.push({ code: Math.random().toString(16).slice(2, 8).toUpperCase(), visits: ri(1, 4), visits_period: 1, first_seen: new Date(Date.now() - ri(1, 20) * 864e5).toISOString(), last_seen: new Date(Date.now() - ri(0, 5) * 36e5).toISOString(), total_seconds: ri(20, 900), whatsapp_visits: ri(0, 1), phone_visits: 0, city: ['Belo Horizonte', 'Contagem', 'Belo Horizonte'][v % 3], first_source: ['Google (orgânico)', 'Instagram', 'ChatGPT', 'Direto'][v % 4], first_page: ['/', '/blog/dor-lombar-cronica', '/contato'][v % 3] });
    return { dash: dash, prev: { totals: prevT }, visitors: visitors, keywords: [{ keyword: 'clinico geral particular bh', campaign: 'consulta-particular-bh', sessions: 14, avg_seconds: 92, whatsapp: 3 }] };
  }

  if (qs.get('erro') === '1') { loginScreen('Senha incorreta.'); history.replaceState(null, '', location.pathname); return; }
  load();
})();
