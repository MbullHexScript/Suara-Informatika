import multer from 'multer';
import { randomUUID, createHash } from 'node:crypto';
import { cors, json, supaAdmin, MAX_SIZE, ALLOWED_MIME, getIp, logError } from './_lib.js';

export const config = { api: { bodyParser: false } };
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_SIZE, files: 1, fields: 0 } }).single('file');
export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  try {
    const db = supaAdmin();
    const { data: allowed, error } = await db.rpc('consume_request_limit', { p_key: 'upload:' + createHash('sha256').update(getIp(req)).digest('hex'), p_limit: 25, p_seconds: 3600 });
    if (error) throw error;
    if (!allowed) return json(res, 429, { error: 'Terlalu banyak unggahan.' });
    try { await new Promise((resolve, reject) => upload(req, res, e => e ? reject(e) : resolve())); }
    catch { return json(res, 400, { error: 'Unggah satu foto JPG/PNG/WebP, maksimal 4 MB.' }); }
    const f = req.file;
    if (!f || !ALLOWED_MIME.includes(f.mimetype)) return json(res, 400, { error: 'Hanya JPG, PNG, atau WebP.' });
    const bytes = f.buffer;
    const valid = f.mimetype === 'image/jpeg' ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 : f.mimetype === 'image/png' ? bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : bytes.toString('ascii',0,4) === 'RIFF' && bytes.toString('ascii',8,12) === 'WEBP';
    if (!valid) return json(res, 400, { error: 'Isi file bukan gambar yang didukung.' });
    const path = `uploads/${randomUUID()}.${f.mimetype.split('/')[1].replace('jpeg', 'jpg')}`;
    const saved = await db.storage.from('report-attachments').upload(path, bytes, { contentType: f.mimetype });
    if (saved.error) throw saved.error;
    return json(res, 201, { path });
  } catch (e) { logError('upload', e); return json(res, 503, { error: 'Unggahan belum dapat disimpan.' }); }
}
