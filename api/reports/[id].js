import { cors, json, supaAdmin, requireAuth, UUID, logError } from '../_lib.js';
import { signAttachments } from '../../backend/reports.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const user = await requireAuth(req);
    if (!user) return json(res, 401, { error: 'Unauthorized' });
    const id = req.query.id || new URL(req.url, 'http://localhost').pathname.split('/').pop();
    if (!UUID.test(id)) return json(res, 400, { error: 'Tiket tidak valid.' });
    const db = supaAdmin();
    if (req.method === 'GET') {
      const { data, error } = await db.from('reports').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      if (!data) return json(res, 404, { error: 'Tidak ditemukan.' });
      return json(res, 200, await signAttachments(db, data));
    }
    if (req.method === 'PATCH') {
      const b = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!['baru', 'diproses', 'selesai', 'ditolak'].includes(b?.status) || typeof b.admin_notes !== 'string' || b.admin_notes.length > 2000) return json(res, 400, { error: 'Status/catatan tidak valid.' });
      const { data, error } = await db.from('reports').update({ status: b.status, admin_notes: b.admin_notes }).eq('id', id).select().single();
      if (error) throw error;
      return json(res, 200, await signAttachments(db, data));
    }
    return json(res, 405, { error: 'Method not allowed' });
  } catch (e) { logError('report detail', e); return json(res, 503, { error: 'Layanan belum dapat diakses.' }); }
}
