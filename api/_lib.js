// Funções comuns do servidor (Vercel). Arquivos que começam com "_" não viram rota.
// Supabase via API REST (sem pacotes). A chave secreta nunca vai para o navegador.
import crypto from 'node:crypto';

const env = (k) => (process.env[k] || '').trim();
const sbUrl = () => env('SUPABASE_URL').replace(/\/+$/, '').replace(/\/rest\/v1$/, '');
const sbKey = () => env('SUPABASE_SERVICE_ROLE_KEY');
export const supabaseOk = () => Boolean(sbUrl() && sbKey());

export async function sbRpc(fn, args) {
  if (!supabaseOk()) throw new Error('Supabase não configurado (SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY)');
  const res = await fetch(`${sbUrl()}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: sbKey(), Authorization: `Bearer ${sbKey()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(`Supabase ${fn}: ${res.status} ${await res.text()}`);
  const t = await res.text();
  return t ? JSON.parse(t) : null;
}

// ---------- login do painel: senha única + cookie assinado ----------
export const ADMIN_COOKIE = 'am_admin';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 dias
const hmac = (data) => crypto.createHmac('sha256', env('ADMIN_SESSION_SECRET')).update(data).digest('hex');
export const adminConfigured = () => env('ADMIN_PASSWORD').length >= 8 && env('ADMIN_SESSION_SECRET').length >= 16;
export function createToken() { const exp = Math.floor(Date.now() / 1000) + MAX_AGE; return `${exp}.${hmac(String(exp))}`; }
export function verifyToken(token) {
  if (!token || !adminConfigured()) return false;
  const [exp, sig] = String(token).split('.');
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false;
  const a = Buffer.from(hmac(exp)), b = Buffer.from(sig);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
export function checkPassword(input) {
  if (!adminConfigured()) return false;
  const a = Buffer.from(hmac(`pw:${input}`)), b = Buffer.from(hmac(`pw:${env('ADMIN_PASSWORD')}`));
  return crypto.timingSafeEqual(a, b);
}
export function getCookie(req, name) {
  const m = (req.headers.cookie || '').match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}
export const isAdmin = (req) => verifyToken(getCookie(req, ADMIN_COOKIE));
export function setAdminCookie(res, value, maxAge = MAX_AGE) {
  const secure = process.env.VERCEL ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${ADMIN_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`);
}

// ---------- utilidades de requisição ----------
export async function readBody(req, limit = 64000) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') return req.body;
    if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
    return JSON.stringify(req.body);
  }
  return await new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > limit) { reject(new Error('grande demais')); req.destroy(); } });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}
export function send(res, status, body, headers = {}) {
  res.statusCode = status;
  Object.entries({ 'Cache-Control': 'no-store', ...headers }).forEach(([k, v]) => res.setHeader(k, v));
  if (body === undefined || body === null) return res.end();
  if (typeof body === 'object') { res.setHeader('Content-Type', 'application/json; charset=utf-8'); return res.end(JSON.stringify(body)); }
  return res.end(String(body));
}
export function redirect(res, to) { res.statusCode = 303; res.setHeader('Location', to); res.end(); }

// Região do visitante a partir dos cabeçalhos da Vercel (o IP não é guardado)
export function geoFrom(req) {
  const h = req.headers, dec = (v) => (v ? decodeURIComponent(String(v)) : undefined);
  return { country: dec(h['x-vercel-ip-country']), region: dec(h['x-vercel-ip-country-region']), city: dec(h['x-vercel-ip-city']) };
}
export const isBot = (ua) => !ua || /bot|crawl|spider|slurp|preview|lighthouse|headless|facebookexternalhit|whatsapp|bingpreview|pingdom|uptime/i.test(ua);
export function isTest(req, hostname) {
  const host = String(hostname || '').toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')) return true;
  return isAdmin(req); // o próprio admin navegando no site
}
