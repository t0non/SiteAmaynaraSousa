// Recebe os lotes de eventos do rastreador (site/wp-content/uploads/amaynara/tracker.js) e grava no Supabase.
import { sbRpc, supabaseOk, readBody, send, geoFrom, isBot, isTest } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, null);
  if (!supabaseOk() || isBot(req.headers['user-agent'])) return send(res, 204, null);
  try {
    const raw = await readBody(req);
    if (raw.length > 64000) return send(res, 413, null);
    const body = JSON.parse(raw);
    if (!body?.session?.id) return send(res, 400, null);
    body.session.is_test = isTest(req, body.session.hostname);
    if (body.first && !body.session.is_test) body.session = { ...body.session, ...geoFrom(req) };
    await sbRpc('track_batch', { p: body });
  } catch (err) {
    console.error('[track]', err);
  }
  return send(res, 204, null);
}
