import { createHash, randomUUID } from 'node:crypto';
import { cors, json, supaAdmin, requireAuth, applyFilters, getIp, logError } from '../_lib.js';
import { validateReport } from '../../backend/reports.js';
import { drainNotifications } from '../../backend/telegram.js';

export const maxDuration = 60;
export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    if (req.method === 'POST') {
      let body;
      try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; } catch { return json(res, 400, { error: 'JSON tidak valid.' }); }
      if (body?.honeypot) return json(res, 200, { success: true });
      const result = validateReport(body);
      if (result.error) return json(res, 400, { error: result.error });
      const db = supaAdmin();
      const ipHash = createHash('sha256').update(getIp(req)).digest('hex');
      const { data: allowed, error: limitError } = await db.rpc('consume_request_limit', { p_key: 'report:' + ipHash, p_limit: 5, p_seconds: 3600 });
      if (limitError) throw limitError;
      if (!allowed) return json(res, 429, { error: 'Batas pengiriman tercapai. Coba lagi dalam satu jam.' });
      const { data, error } = await db.from('reports').insert(result.data).select('id').single();
      if (error) throw error;
      // The database trigger persists all recipients atomically with the report.
      // Telegram failures must never make the student submit a second report.
      try { await drainNotifications(db, data.id); } catch (e) { logError('notification deferred', e); }
      return json(res, 201, { success: true, id: data.id });
    }
    if (req.method === 'GET') {
      if (!await requireAuth(req)) return json(res, 401, { error: 'Unauthorized' });
      const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
      const per_page = Math.min(50, Math.max(1, Number.parseInt(req.query.per_page, 10) || 10));
      const query = applyFilters(supaAdmin().from('reports').select('*', { count: 'exact' }), req.query);
      const { data, error, count } = await query.order('created_at', { ascending: false }).range((page - 1) * per_page, page * per_page - 1);
      if (error) throw error;
      return json(res, 200, { data, total: count, page, per_page, total_pages: Math.ceil(count / per_page) });
    }
    return json(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    const reference = randomUUID();
    logError('reports:' + reference, e);
    return json(res, 503, { error: 'Layanan laporan belum dapat diakses. Coba lagi sebentar.', reference });
  }
}
