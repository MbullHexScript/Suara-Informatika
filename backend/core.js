import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'node:crypto';

export function env(name, fallback = '') { return process.env[name]?.trim() || fallback; }
export function appUrl() { return env('APP_URL', env('VITE_APP_URL', 'https://suarainformatika.vercel.app')).replace(/\/$/, ''); }
export function supaAdmin() {
  const url = env('SUPABASE_URL', env('VITE_SUPABASE_URL'));
  const key = env('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('Konfigurasi SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum tersedia');
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: init?.signal ? AbortSignal.any([init.signal, AbortSignal.timeout(12000)]) : AbortSignal.timeout(12000) }) }
  });
}
export async function requireAuth(req) {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return null;
  const db = supaAdmin();
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) return null;
  const { data: admin } = await db.from('web_admins').select('user_id').eq('user_id', data.user.id).maybeSingle();
  return admin ? data.user : null;
}
export function secretMatches(actual, expected) {
  if (!actual || !expected || typeof actual !== 'string') return false;
  const a = Buffer.from(actual), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
export function json(res, code, body) { res.status(code).setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body)); }
export function cors(res) { res.setHeader('Cache-Control', 'no-store'); }
export function getIp(req) { return String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim(); }
export function logError(scope, error) { console.error(scope, { code: error?.code || 'INTERNAL', message: error?.message?.replace(/https?:\/\/\S+/g, '[URL]') || 'Operation failed' }); }
export const ALLOWED_TYPES = ['keluhan', 'aspirasi', 'mental_health', 'kritik', 'saran'];
export const ALLOWED_TARGETS = ['jurusan', 'himpunan'];
export const ALLOWED_CATS = ['Akademik', 'Fasilitas', 'Dosen/Pengajaran', 'Administrasi', 'Kegiatan Kemahasiswaan', 'Himpunan', 'UKT (Uang Kuliah Tunggal)', 'Lainnya'];
export const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
// Leave room for multipart overhead below Vercel's request body limit.
export const MAX_SIZE = 4 * 1024 * 1024;
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function genCSV(reports) {
  const quote = value => '"' + String(value ?? '').replace(/^[=+@\-\t\r]/, "'$&").replace(/"/g, '""') + '"';
  const fields = ['id', 'type', 'target', 'category', 'title', 'description', 'status', 'admin_notes', 'created_at'];
  return '\uFEFF' + [fields.join(','), ...reports.map(r => fields.map(k => quote(r[k])).join(','))].join('\r\n');
}
export function applyFilters(q, params = {}) {
  for (const k of ['type', 'target', 'category', 'status']) if (params[k]) q = q.eq(k, params[k]);
  if (params.date_from) q = q.gte('created_at', params.date_from);
  if (params.date_to) q = q.lte('created_at', params.date_to + 'T23:59:59+08:00');
  if (params.search) q = q.ilike('title', '%' + String(params.search).replace(/[%_]/g, '').slice(0, 100) + '%');
  return q;
}
