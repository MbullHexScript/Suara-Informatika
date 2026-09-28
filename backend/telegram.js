import { createHash, randomBytes } from 'node:crypto';
import { appUrl, env, UUID, logError } from './core.js';
import { normalizePhone } from './reports.js';

export const hashToken = token => createHash('sha256').update(token).digest('hex');
export const typeLabel = { keluhan: 'Keluhan', aspirasi: 'Aspirasi', mental_health: 'Mental Health', kritik: 'Kritik', saran: 'Saran' };
const statusLabel = { baru: '🟡 Baru', diproses: '🔵 Diproses', selesai: '🟢 Selesai', ditolak: '🔴 Ditolak' };
export function formatReport(r, detail = false) {
  const mental = r.type === 'mental_health';
  const lines = [mental ? '💚 Konsultasi Mental Health' : '📬 ' + (typeLabel[r.type] || 'Laporan'), statusLabel[r.status] || r.status, ''];
  if (mental) lines.push('Nama: ' + (r.name || 'Tidak dicantumkan'), 'WhatsApp: ' + (r.contact || 'Tidak dicantumkan'));
  else lines.push('Tujuan: ' + (r.target || '—'), 'Kategori: ' + r.category, 'Judul: ' + r.title);
  lines.push('', (mental ? 'Cerita: ' : 'Isi laporan: ') + String(r.description || '').slice(0, detail ? 2000 : 500));
  if (detail && r.admin_notes) lines.push('', 'Catatan tim: ' + r.admin_notes.slice(0, 600));
  lines.push('', 'Tiket: ' + r.id, 'Lampiran: ' + (r.attachments?.length || 0), 'Diterima: ' + new Date(r.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Makassar' }));
  return lines.join('\n').slice(0, 3900);
}
export function reportKeyboard(r) {
  const rows = [
    [{ text: 'Lihat detail', callback_data: `view_${r.id}` }],
    [{ text: '🔵 Diproses', callback_data: `status_${r.id}_diproses` }, { text: '🟢 Selesai', callback_data: `status_${r.id}_selesai` }],
    [{ text: '🟡 Baru', callback_data: `status_${r.id}_baru` }, { text: '🔴 Ditolak', callback_data: `status_${r.id}_ditolak` }],
    [{ text: 'Tambah catatan', callback_data: `notes_${r.id}` }],
    [{ text: 'Dashboard & lampiran', url: `${appUrl()}/admin/laporan/${r.id}` }]
  ];
  const phone = normalizePhone(r.contact);
  if (r.type === 'mental_health' && phone) rows.push([{ text: 'Hubungi WhatsApp', url: 'https://wa.me/' + phone }]);
  return { inline_keyboard: rows };
}
export async function telegramCall(method, body = {}) {
  const token = env('TELEGRAM_BOT_TOKEN');
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN belum tersedia');
  let response;
  try {
    response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(8000)
    });
  } catch { throw new Error('Koneksi Telegram gagal atau timeout'); }
  const data = await response.json();
  if (!response.ok || !data.ok) {
    const e = new Error('Telegram menolak permintaan: ' + (data.description || response.status));
    e.code = data.error_code || response.status;
    e.retryAfter = data.parameters?.retry_after;
    throw e;
  }
  return data.result;
}
const menu = owner => ({ keyboard: [
  [{ text: '📋 Laporan Terbaru' }, { text: '📊 Statistik' }],
  [{ text: '📅 Laporan Hari Ini' }, { text: '🗓 Minggu Ini' }, { text: '📆 Bulan Ini' }],
  ...(owner ? [[{ text: '🎟 Buat Undangan' }, { text: '👥 Kelola Anggota' }], [{ text: '🎟 Daftar Undangan' }, { text: '🔄 Ulang Notifikasi' }]] : []),
  [{ text: '❓ Bantuan' }]
], resize_keyboard: true, is_persistent: true });
function must(result) { if (result.error) throw result.error; return result.data; }
export function periodStart(period, now = new Date()) {
  // UTC+8 boundaries, independent of the server's local timezone.
  const d = new Date(now.getTime() + 8 * 3600000);
  d.setUTCHours(0, 0, 0, 0);
  if (period === 'week') d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7);
  if (period === 'month') d.setUTCDate(1);
  return new Date(d.getTime() - 8 * 3600000).toISOString();
}

export function createBot({ db, call = telegramCall }) {
  const send = (chat, text, markup) => call('sendMessage', { chat_id: chat, text, reply_markup: markup, link_preview_options: { is_disabled: true } });
  const getMember = async id => must(await db.from('bot_members').select('*').eq('telegram_id', id).eq('active', true).maybeSingle());
  const getReport = async id => must(await db.from('reports').select('*').eq('id', id).maybeSingle());

  async function receive(update) {
    const cb = update.callback_query;
    const message = cb?.message || update.message;
    const from = cb?.from || message?.from;
    if (!message?.chat || !from?.id || from.is_bot) return;
    const user = String(from.id), chat = String(message.chat.id);
    const privateChat = message.chat.type === 'private' && chat === user;
    const text = String(message.text || '').trim();
    const member = await getMember(user);
    if (!member) {
      if (cb) await call('answerCallbackQuery', { callback_query_id: cb.id, text: 'Akses belum aktif. Buka chat pribadi bot dan masukkan token.', show_alert: true });
      if (!privateChat || cb) return;
      const token = text.replace(/^\/akses(?:@\w+)?\s+/i, '');
      if (/^SI-[A-Za-z0-9_-]{43}$/.test(token)) {
        const accepted = must(await db.rpc('redeem_bot_invite', { p_hash: hashToken(token), p_user: user, p_chat: chat, p_name: String(from.first_name || '').slice(0,100) }));
        if (accepted) {
          await send(chat, 'Akses aktif. Kamu dapat mengelola Aspirasi dan Mental Health serta menerima notifikasi laporan baru.', menu(false));
          return;
        }
        await send(chat, 'Token tidak valid, kedaluwarsa, sudah digunakan, atau batas percobaan tercapai. Minta token baru dari pemilik.');
        return;
      }
      const allowed = must(await db.rpc('consume_request_limit', { p_key: 'bot-prompt:' + user, p_limit: 5, p_seconds: 900 }));
      if (allowed) await send(chat, 'Bot ini khusus tim pengelola. Masukkan token SI-… dari pemilik untuk mengaktifkan akses. Satu token hanya untuk satu akun Telegram.');
      return;
    }

    if (cb) {
      const match = /^(view|status|notes)_([0-9a-f-]{36})(?:_(baru|diproses|selesai|ditolak))?$/.exec(String(cb.data));
      if (!match || !UUID.test(match[2])) {
        await call('answerCallbackQuery', { callback_query_id: cb.id, text: 'Tombol tidak valid.' });
        return;
      }
      await call('answerCallbackQuery', { callback_query_id: cb.id });
      const [, action, id, status] = match;
      let r = await getReport(id);
      if (!r) { await send(chat, 'Laporan tidak ditemukan.'); return; }
      if (action === 'notes') {
        if (!privateChat) { await send(chat, 'Tambahkan catatan di chat pribadi bot dengan /catatan ' + id + ' isi catatan'); return; }
        await send(chat, 'Balas pesan ini dengan catatan tim (maksimal 2000 karakter).\nTiket: ' + id, { force_reply: true, selective: true });
        return;
      }
      if (action === 'status') {
        if (!status) { await send(chat, 'Status tidak valid.'); return; }
        r = must(await db.rpc('bot_action', { p_actor: user, p_action: 'status', p_target: id, p_value: status }));
      }
      // Text is sent separately from photos; compatible with old photo notifications too.
      if (message.photo) await send(chat, formatReport(r, true), reportKeyboard(r));
      else {
        try { await call('editMessageText', { chat_id: chat, message_id: message.message_id, text: formatReport(r, true), reply_markup: reportKeyboard(r) }); }
        catch (e) { if (!e.message.includes('message is not modified')) throw e; }
      }
      return;
    }
    if (!privateChat) return;
    const command = text.split(/\s/)[0].split('@')[0].toLowerCase();
    const lower = text.toLowerCase();
    const owner = member.role === 'owner';
    const args = text.slice(text.indexOf(' ') + 1).trim();
    const reply = message.reply_to_message;
    const noteId = reply?.from?.id === Number(env('TELEGRAM_BOT_TOKEN').split(':')[0]) && reply?.text?.startsWith('Balas pesan ini') ? reply.text.match(/Tiket: ([0-9a-f-]{36})/)?.[1] : null;
    if (command === '/catatan' || noteId) {
      const id = noteId || args.split(/\s/)[0];
      const note = noteId ? text : args.slice(id.length).trim();
      if (!UUID.test(id) || !note || note.length > 2000) { await send(chat, 'Gunakan /catatan NOMOR_TIKET isi catatan (maksimal 2000 karakter).'); return; }
      must(await db.rpc('bot_action', { p_actor: user, p_action: 'notes', p_target: id, p_value: note }));
      await send(chat, 'Catatan tim tersimpan.'); return;
    }
    if (command === '/undang' || lower === '🎟 buat undangan') {
      if (!owner) { await send(chat, 'Hanya pemilik yang dapat membuat undangan.'); return; }
      const token = 'SI-' + randomBytes(32).toString('base64url');
      const invite = must(await db.from('bot_invites').insert({ token_hash: hashToken(token), created_by: user }).select('id').single());
      await send(chat, `Token undangan (berlaku 7 hari, satu akun):\n\n${token}\n\nKirim secara pribadi kepada anggota.\nBatalkan: /batal ${invite.id}`); return;
    }
    if (command === '/cabut' || command === '/batal') {
      if (!owner) { await send(chat, 'Hanya pemilik yang dapat mencabut akses.'); return; }
      if (command === '/cabut' ? !/^\d+$/.test(args) : !UUID.test(args)) { await send(chat, 'Gunakan /cabut TELEGRAM_USER_ID atau /batal ID_UNDANGAN.'); return; }
      must(await db.rpc('bot_action', { p_actor: user, p_action: command === '/cabut' ? 'revoke_member' : 'revoke_invite', p_target: args }));
      await send(chat, 'Akses/undangan berhasil dicabut.'); return;
    }
    if (command === '/anggota' || lower === '👥 kelola anggota') {
      if (!owner) { await send(chat, 'Daftar anggota hanya tersedia untuk pemilik.'); return; }
      const members = must(await db.from('bot_members').select('telegram_id,display_name,role,active').order('created_at').limit(100));
      await send(chat, ('Anggota tim\n\n' + members.map(m => `${m.active ? '✅' : '⛔'} ${m.display_name} — ${m.telegram_id} (${m.role})`).join('\n') + '\n\nCabut: /cabut TELEGRAM_USER_ID').slice(0,3900)); return;
    }
    if (command === '/undangan' || lower === '🎟 daftar undangan') {
      if (!owner) { await send(chat, 'Daftar undangan hanya tersedia untuk pemilik.'); return; }
      const invites = must(await db.from('bot_invites').select('id,expires_at,revoked,redeemed_by').order('created_at',{ ascending:false }).limit(15));
      await send(chat, 'Undangan terbaru\n\n' + invites.map(i => `${i.id}\n${i.revoked ? 'Dibatalkan' : i.redeemed_by ? 'Dipakai: '+i.redeemed_by : 'Berlaku sampai '+i.expires_at}`).join('\n\n')); return;
    }
    if (command === '/ulang_notifikasi' || lower === '🔄 ulang notifikasi') {
      if (!owner) { await send(chat, 'Hanya pemilik yang dapat menjalankan pengiriman ulang.'); return; }
      await drainNotifications(db, null, call);
      await send(chat, 'Antrean yang sudah jatuh tempo telah diproses. Kegagalan permanen tersedia pada notification_jobs.'); return;
    }
    if (command === '/statistik' || lower === '📊 statistik') {
      const counts = await Promise.all(Object.keys(typeLabel).map(async type => {
        const result = await db.from('reports').select('id',{ count:'exact',head:true }).eq('type',type);
        if (result.error) throw result.error;
        return typeLabel[type] + ': ' + result.count;
      }));
      await send(chat, '📊 Statistik laporan\n\n' + counts.join('\n'), menu(owner)); return;
    }
    const periods = {
      '/laporan_hari_ini':'day', '📅 laporan hari ini':'day',
      '/laporan_minggu_ini':'week', '🗓 minggu ini':'week', '🗓 laporan minggu ini':'week',
      '/laporan_bulan_ini':'month', '📆 bulan ini':'month', '📆 laporan bulan ini':'month'
    };
    const period = periods[command] || periods[lower];
    if (period || command === '/laporan' || lower === '📋 laporan terbaru') {
      let q = db.from('reports').select('*').order('created_at',{ascending:false}).limit(5);
      if (period) q = q.gte('created_at',periodStart(period));
      const reports = must(await q);
      if (!reports.length) await send(chat, 'Belum ada laporan untuk periode ini.');
      for (const r of reports) await send(chat, formatReport(r),reportKeyboard(r));
      if (reports.length === 5) await send(chat, 'Ditampilkan 5 laporan terbaru. Laporan lainnya tersedia di dashboard.');
      return;
    }
    await send(chat, 'Suara Informatika · Ruang pengelola\n\n/laporan — laporan terbaru\n/statistik — ringkasan laporan\n/catatan TIKET isi catatan — catatan internal\n\nGunakan tombol pada laporan untuk memperbarui status. Semua anggota aktif menerima notifikasi Aspirasi dan Mental Health.' + (owner ? '\n\nPemilik:\n/undang — buat token\n/undangan — daftar token\n/anggota — daftar anggota\n/cabut USER_ID — cabut akses\n/batal ID_UNDANGAN — batalkan token\n/ulang_notifikasi — proses antrean tertunda' : ''), menu(owner));
  }
  return { receive };
}

export async function drainNotifications(db, reportId = null, call = telegramCall) {
  const jobs = must(await db.rpc('claim_notification_jobs', { p_report: reportId, p_limit: 12 }));
  // Four concurrent calls, at most three 8-second waves per invocation.
  for (let offset = 0; offset < jobs.length; offset += 4) {
    await Promise.all(jobs.slice(offset,offset+4).map(async job => {
      const finish = async values => must(await db.from('notification_jobs').update(values).eq('id',job.id).eq('lock_token',job.lock_token).eq('state','sending'));
      try {
        const member = must(await db.from('bot_members').select('active').eq('chat_id',job.chat_id).maybeSingle());
        const destination = must(await db.from('bot_destinations').select('active').eq('chat_id',job.chat_id).maybeSingle());
        if (member ? !member.active : !destination?.active) { await finish({state:'cancelled'}); return; }
        const r = must(await db.from('reports').select('*').eq('id',job.report_id).single());
        const sent = await call('sendMessage', { chat_id: job.chat_id, text: 'Laporan baru diterima\n\n' + formatReport(r), reply_markup: reportKeyboard(r), link_preview_options:{is_disabled:true} });
        await finish({ state:'sent', message_id:sent.message_id, last_error:null });
      } catch (e) {
        const permanent = e.code === 403 || e.code === 400 || job.attempts >= 8;
        const delay = Math.max(e.retryAfter || 0, Math.min(3600,30 * 2 ** job.attempts));
        await finish({ state: permanent ? 'failed' : 'pending', last_error: 'Delivery failed: ' + (e.code || 'NETWORK'), next_attempt_at:new Date(Date.now()+delay*1000).toISOString() });
        logError('telegram delivery', e);
      }
    }));
  }
  return jobs.length;
}
