import { redirect, setAdminCookie } from '../_lib.js';

export default function handler(req, res) {
  setAdminCookie(res, '', 0);
  return redirect(res, '/admin/');
}
