import { createClient } from "@supabase/supabase-js";

export function env(k, fb = "") { return process.env[k] ?? process.env["VITE_" + k] ?? fb; }
export function supaAdmin() {
  const url = env("SUPABASE_URL") || env("SUPABASE_URL", "");
  const key = env("SUPABASE_SERVICE_ROLE_KEY") || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "";
  const u = env("VITE_SUPABASE_URL") || url;
  if (!u || !key) console.warn("[api] supabase env missing");
  return createClient(u || url, key);
}
export function supaAnon() {
  const url = env("VITE_SUPABASE_URL") || env("SUPABASE_URL") || "";
  const anon = env("VITE_SUPABASE_ANON_KEY") || env("SUPABASE_ANON_KEY") || process.env.VITE_SUPABASE_ANON_KEY || "";
  return { url, anon };
}
export async function requireAuth(req) {
  const auth = req.headers.authorization || req.headers.Authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  const { url, anon } = supaAnon();
  const tmp = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: { user }, error } = await tmp.auth.getUser();
  if (error || !user) return null;
  return user;
}
export function getIp(req) {
  const f = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "";
  if (f) return String(f).split(",")[0].trim();
  return req.headers["x-vercel-forwarded-for"] || req.socket?.remoteAddress || "unknown";
}
export function esc(s) { return String(s).replace(/[_*[\]`~>#+\-=|{}.!\\]/g, (m) => "\\" + m).replace(/\[/g, "\\[").replace(/\]/g, "\\]").replace(/\(/g, "\\(").replace(/\)/g, "\\)"); }
export function sanitize(s) { return String(s).replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;"); }

export const ALLOWED_TYPES = ["keluhan", "kritik", "saran"];
export const ALLOWED_TARGETS = ["jurusan", "himpunan"];
export const ALLOWED_CATS = ["Akademik", "Fasilitas", "Dosen/Pengajaran", "Administrasi", "Kegiatan Kemahasiswaan", "Himpunan", "Lainnya"];
export const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
export const MAX_SIZE = 5 * 1024 * 1024;

export function tgToken() { return env("TELEGRAM_BOT_TOKEN") || env("VITE_TELEGRAM_BOT_TOKEN") || ""; }
export function tgAdmin() { return env("TELEGRAM_ADMIN_CHAT_ID") || env("VITE_TELEGRAM_ADMIN_CHAT_ID") || ""; }
export function tgSecret() { return env("TELEGRAM_WEBHOOK_SECRET") || ""; }
export function tgApi() { return `https://api.telegram.org/bot${tgToken()}`; }
export function appUrl() { return env("VITE_APP_URL") || env("APP_URL") || "https://suara-informatika.vercel.app"; }
export const TG_KB = { keyboard: [[{ text: "📊 Statistik" }, { text: "📅 Laporan Hari Ini" }], [{ text: "🗓 Laporan Minggu Ini" }, { text: "📆 Laporan Bulan Ini" }], [{ text: "❓ Help" }]], resize_keyboard: true, is_persistent: true };
export function isAdminChat(id) { return String(tgAdmin()).split(",").map((s) => s.trim()).includes(String(id)); }
export function json(res, code, body) { res.status(code).setHeader("Content-Type", "application/json"); res.end(JSON.stringify(body)); }
export function cors(res) { res.setHeader("Access-Control-Allow-Origin", "*"); res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS"); res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,x-telegram-bot-api-secret-token"); }

export function genCSV(reports) {
  const header = ["id", "jenis", "target", "kategori", "judul", "deskripsi", "jumlah_lampiran", "status", "catatan_admin", "dibuat_pada"].join(",");
  const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = reports.map((r) => [r.id, r.type, r.target, r.category, r.title, r.description, Array.isArray(r.attachments) ? r.attachments.length : 0, r.status, r.admin_notes ?? "", new Date(r.created_at).toLocaleString("id-ID", { timeZone: "Asia/Makassar" })].map(q).join(","));
  return [header, ...rows].join("\n");
}
export function genSummary(reports) {
  const total = reports.length;
  const byType = reports.reduce((a, r) => { a[r.type] = (a[r.type] || 0) + 1; return a; }, {});
  const byTarget = reports.reduce((a, r) => { a[r.target] = (a[r.target] || 0) + 1; return a; }, {});
  const baru = reports.filter((r) => r.status === "baru").length;
  return `Ringkasan Laporan\nTotal: ${total}\nKeluhan: ${byType.keluhan || 0} | Kritik: ${byType.kritik || 0} | Saran: ${byType.saran || 0}\nJurusan: ${byTarget.jurusan || 0} | Himpunan: ${byTarget.himpunan || 0}\nBelum diproses (Baru): ${baru}`;
}
export async function queryRange(from, to) {
  const c = supaAdmin();
  const { data } = await c.from("reports").select("*").gte("created_at", from).lte("created_at", to).order("created_at", { ascending: false });
  return data || [];
}
export async function allReports() {
  const c = supaAdmin();
  const { data } = await c.from("reports").select("*").order("created_at", { ascending: false });
  return data || [];
}
export async function sendMessage(chatId, text, markup) {
  const body = { chat_id: chatId, text, parse_mode: "MarkdownV2", disable_web_page_preview: true, reply_markup: markup || TG_KB };
  const r = await fetch(`${tgApi()}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) console.error("[tg sendMessage]", await r.text());
}
export async function sendDocument(chatId, content, filename, caption) {
  const fd = new FormData();
  fd.append("chat_id", chatId); fd.append("caption", caption); fd.append("parse_mode", "MarkdownV2"); fd.append("reply_markup", JSON.stringify(TG_KB));
  fd.append("document", new Blob([content], { type: "text/csv" }), filename);
  const r = await fetch(`${tgApi()}/sendDocument`, { method: "POST", body: fd });
  if (!r.ok) console.error("[tg doc]", await r.text());
}
export function fmtReport(report, unread) {
  const te = { keluhan: "😤", kritik: "📢", saran: "💡" }[report.type] || "📝";
  const ta = { jurusan: "🏫", himpunan: "🎓" }[report.target] || "📌";
  const title = esc(report.title), cat = esc(report.category);
  const desc = esc(report.description.length > 500 ? report.description.slice(0, 497) + "..." : report.description);
  const line = unread > 1 ? `\n🔔 *${unread} laporan belum dibaca — buka dashboard*` : unread === 1 ? `\n🔔 *1 laporan belum dibaca*` : "";
  return `${te} *Laporan Baru Masuk\\!*${line}\n\n${ta} *Target:* ${esc(report.target[0].toUpperCase() + report.target.slice(1))}\n📂 *Kategori:* ${cat}\n📋 *Jenis:* ${esc(report.type[0].toUpperCase() + report.type.slice(1))}\n📌 *Judul:* ${title}\n\n📝 *Deskripsi:*\n${desc}\n\n🕐 *Waktu:* ${esc(new Date(report.created_at).toLocaleString("id-ID", { timeZone: "Asia/Makassar" }))}\n📎 *Lampiran:* ${report.attachments?.length || 0} foto`;
}
export async function getUnread() {
  try {
    const c = supaAdmin();
    const { count } = await c.from("reports").select("*", { count: "exact", head: true }).eq("status", "baru");
    return count || 0;
  } catch { return 0; }
}
export async function notifyReport(report) {
  try {
    const unread = await getUnread();
    const msg = fmtReport(report, unread);
    const inline = { inline_keyboard: [[{ text: "🔍 Lihat di Dashboard", url: `${appUrl()}/admin/laporan/${report.id}` }]] };
    const admin = tgAdmin(), api = tgApi();
    if (!report.attachments?.length) await sendMessage(admin, msg, inline);
    else if (report.attachments.length === 1) await fetch(`${api}/sendPhoto`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: admin, photo: report.attachments[0], caption: msg, parse_mode: "MarkdownV2", reply_markup: inline }) });
    else {
      const media = report.attachments.map((u, i) => ({ type: "photo", media: u, ...(i === 0 ? { caption: `📎 ${report.attachments.length} foto lampiran`, parse_mode: "MarkdownV2" } : {}) }));
      await fetch(`${api}/sendMediaGroup`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: admin, media }) });
      await sendMessage(admin, msg, inline);
    }
  } catch (e) { console.error("[notify]", e); }
}
export function dateRange(period) {
  const now = new Date(), to = now.toISOString();
  let from, label;
  if (period === "day") { from = new Date(now.getFullYear(), now.getMonth(), now.getDate()); label = `hari ini (${now.toLocaleDateString("id-ID", { timeZone: "Asia/Makassar" })})`; }
  else if (period === "week") { const d = now.getDay(), diff = now.getDate() - d + (d === 0 ? -6 : 1); from = new Date(now); from.setDate(diff); from.setHours(0, 0, 0, 0); label = "minggu ini"; }
  else { from = new Date(now.getFullYear(), now.getMonth(), 1); label = `bulan ${now.toLocaleDateString("id-ID", { month: "long", year: "numeric", timeZone: "Asia/Makassar" })}`; }
  return { from: from.toISOString(), to, label };
}
export async function handleCmd(cmd, chatId) {
  if (cmd === "/help" || cmd === "/start" || cmd === "❓ help") { await sendMessage(chatId, `🤖 *Bot Aspirasi Informatika*\n\nCommand:\n📅 Laporan Hari Ini — /laporan\\_hari\\_ini\n🗓 Minggu Ini — /laporan\\_minggu\\_ini\n📆 Bulan Ini — /laporan\\_bulan\\_ini\n📊 Statistik — /statistik\n❓ Help — /help`); return; }
  if (cmd === "/statistik" || cmd === "📊 statistik") { const r = await allReports(); await sendMessage(chatId, esc(genSummary(r))); return; }
  let period = null;
  if (cmd === "/laporan_hari_ini" || cmd === "📅 laporan hari ini") period = "day";
  else if (cmd === "/laporan_minggu_ini" || cmd === "🗓 laporan minggu ini") period = "week";
  else if (cmd === "/laporan_bulan_ini" || cmd === "📆 laporan bulan ini") period = "month";
  if (!period) { await sendMessage(chatId, esc("Command tidak dikenal. Ketik /help")); return; }
  const { from, to, label } = dateRange(period);
  const reports = await queryRange(from, to);
  if (!reports.length) { await sendMessage(chatId, esc(`Tidak ada laporan ${label}.`)); return; }
  await sendMessage(chatId, esc(`Laporan ${label}\n`) + esc(genSummary(reports)));
  const csv = genCSV(reports), name = `laporan_${period}_${new Date().toISOString().slice(0, 10)}.csv`;
  await sendDocument(chatId, csv, name, esc(`File CSV: ${reports.length} laporan ${label}`));
}
