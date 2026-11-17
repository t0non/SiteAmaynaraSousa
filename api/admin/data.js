// Dados do painel. Só responde com o login do admin.
// GET /api/admin/data?from=ISO&to=ISO&test=1
import { sbRpc, supabaseOk, send, isAdmin, adminConfigured } from '../_lib.js';

export default async function handler(req, res) {
  const missing = [
    !process.env.SUPABASE_URL && 'SUPABASE_URL',
    !process.env.SUPABASE_SERVICE_ROLE_KEY && 'SUPABASE_SERVICE_ROLE_KEY',
    (process.env.ADMIN_PASSWORD || '').length < 8 && 'ADMIN_PASSWORD (mín. 8 caracteres)',
    (process.env.ADMIN_SESSION_SECRET || '').length < 16 && 'ADMIN_SESSION_SECRET (mín. 16 caracteres)',
  ].filter(Boolean);
  if (!adminConfigured()) return send(res, 200, { setup: true, missing });
  if (!isAdmin(req)) return send(res, 401, { login: true });
  if (!supabaseOk()) return send(res, 200, { setup: true, missing });

  const u = new URL(req.url, 'http://x');
  const from = new Date(u.searchParams.get('from') || Date.now() - 7 * 864e5);
  const to = new Date(u.searchParams.get('to') || Date.now());
  if (isNaN(from) || isNaN(to) || to <= from) return send(res, 400, { error: 'Período inválido' });
  const test = u.searchParams.get('test') === '1';
  const prevFrom = new Date(from.getTime() - (to - from));
  const args = (a, b) => ({ p_from: a.toISOString(), p_to: b.toISOString(), p_include_test: test });
  try {
    const [dash, prev, visitors, keywords] = await Promise.all([
      sbRpc('admin_dashboard', args(from, to)),
      sbRpc('admin_dashboard', args(prevFrom, from)),
      sbRpc('admin_visitors', args(from, to)).catch(() => null),
      sbRpc('admin_keywords', args(from, to)).catch(() => null),
    ]);
    return send(res, 200, { dash, prev, visitors, keywords });
  } catch (err) {
    return send(res, 500, { error: String(err.message || err), sql: /function|does not exist|relation/i.test(String(err)) });
  }
}
