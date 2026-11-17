import { readBody, redirect, send, checkPassword, createToken, setAdminCookie, adminConfigured } from '../_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, null);
  if (!adminConfigured()) return redirect(res, '/admin/?erro=config');
  // na Vercel o corpo do formulário já chega pronto (req.body); no servidor local, lemos o texto
  const password = (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body))
    ? String(req.body.password || '')
    : new URLSearchParams(await readBody(req, 4000).catch(() => '')).get('password') || '';
  await new Promise((r) => setTimeout(r, 400)); // dificulta tentativa e erro
  if (!checkPassword(password)) return redirect(res, '/admin/?erro=1');
  setAdminCookie(res, createToken());
  return redirect(res, '/admin/');
}
