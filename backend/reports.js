import { ALLOWED_TYPES, ALLOWED_TARGETS, ALLOWED_CATS } from './core.js';

export function normalizePhone(value) {
  if (typeof value !== 'string' || /[^\d+\s()-]/.test(value)) return null;
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = '62' + digits.slice(1);
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : null;
}
export function validateReport(b) {
  const fail = message => ({ error: message });
  if (!b || typeof b !== 'object' || !ALLOWED_TYPES.includes(b.type)) return fail('Pilih jenis laporan yang valid.');
  const mental = b.type === 'mental_health';
  if (typeof b.description !== 'string' || !b.description.trim() || b.description.length > 2000) return fail('Cerita wajib diisi, maksimal 2000 karakter.');
  if (!mental && (!ALLOWED_TARGETS.includes(b.target) || !ALLOWED_CATS.includes(b.category))) return fail('Pilih tujuan dan kategori yang valid.');
  if (!mental && (typeof b.title !== 'string' || !b.title.trim() || b.title.length > 100)) return fail('Judul wajib diisi, maksimal 100 karakter.');
  const contact = mental ? normalizePhone(b.contact) : null;
  if (mental && !contact) return fail('Isi nomor WhatsApp yang valid, misalnya 081234567890.');
  if (mental && b.name != null && (typeof b.name !== 'string' || b.name.length > 100)) return fail('Nama maksimal 100 karakter.');
  const attachments = b.attachments ?? [];
  if (!Array.isArray(attachments) || attachments.length > 5 || attachments.some(p => typeof p !== 'string' || !/^uploads\/[0-9a-f-]+\.(jpg|png|webp)$/i.test(p))) return fail('Lampiran tidak valid. Unggah ulang foto melalui formulir.');
  return { data: {
    type: b.type, target: mental ? null : b.target,
    category: mental ? 'Mental Health' : b.category,
    title: mental ? 'Konsultasi Mental Health' : b.title.trim(),
    name: mental ? b.name?.trim() || null : null, contact,
    description: b.description.trim(), attachments, status: 'baru'
  } };
}
export async function signAttachments(db, report) {
  const paths = (report.attachments || []).map(p => {
    if (p.startsWith('uploads/')) return p;
    // Support attachments saved by the previous version, only from this bucket.
    try { const u = new URL(p); return u.pathname.split('/report-attachments/')[1] || null; } catch { return null; }
  });
  const attachments = await Promise.all(paths.filter(Boolean).map(async path => {
    const { data, error } = await db.storage.from('report-attachments').createSignedUrl(path, 900);
    if (error) throw error;
    return data.signedUrl;
  }));
  return { ...report, attachments };
}
