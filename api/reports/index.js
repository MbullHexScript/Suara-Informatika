import { cors, json, sanitize, supaAdmin, requireAuth, ALLOWED_TYPES, ALLOWED_TARGETS, ALLOWED_CATS, notifyReport } from "../_lib.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "POST") {
    let body = req.body;
    if (typeof body === "string") try { body = JSON.parse(body); } catch {}
    const b = body || {};
    if (b.honeypot) return json(res, 200, { success: true });
    if (!ALLOWED_TYPES.includes(b.type)) return json(res, 400, { error: "Jenis tidak valid" });
    if (!ALLOWED_TARGETS.includes(b.target)) return json(res, 400, { error: "Target tidak valid" });
    if (!ALLOWED_CATS.includes(b.category)) return json(res, 400, { error: "Kategori tidak valid" });
    if (!b.title?.trim() || b.title.length > 100) return json(res, 400, { error: "Judul tidak valid (max 100)" });
    if (!b.description?.trim() || b.description.length > 2000) return json(res, 400, { error: "Deskripsi tidak valid (max 2000)" });
    if (b.attachments && b.attachments.length > 5) return json(res, 400, { error: "Maksimal 5 lampiran" });
    const c = supaAdmin();
    const { data, error } = await c.from("reports").insert({ type: b.type, target: b.target, category: b.category, title: sanitize(b.title.trim()), description: sanitize(b.description.trim()), attachments: b.attachments || [], status: "baru" }).select().single();
    if (error) { console.error(error); return json(res, 500, { error: "Gagal menyimpan" }); }
    notifyReport(data).catch(() => {});
    return json(res, 201, { success: true, id: data.id });
  }

  if (req.method === "GET") {
    const user = await requireAuth(req);
    if (!user) return json(res, 401, { error: "Unauthorized" });
    const page = parseInt(String(req.query.page || "1"), 10), perPage = parseInt(String(req.query.per_page || "10"), 10);
    const c = supaAdmin();
    let q = c.from("reports").select("*", { count: "exact" }).order("created_at", { ascending: false });
    if (req.query.type) q = q.eq("type", req.query.type);
    if (req.query.target) q = q.eq("target", req.query.target);
    if (req.query.category) q = q.eq("category", req.query.category);
    if (req.query.status) q = q.eq("status", req.query.status);
    if (req.query.date_from) q = q.gte("created_at", req.query.date_from);
    if (req.query.date_to) q = q.lte("created_at", String(req.query.date_to) + "T23:59:59Z");
    if (req.query.search) { const s = String(req.query.search); q = q.or(`title.ilike.%${s}%,description.ilike.%${s}%`); }
    const from = (page - 1) * perPage, to = from + perPage - 1;
    q = q.range(from, to);
    const { data, error, count } = await q;
    if (error) return json(res, 500, { error: "Gagal fetch" });
    return json(res, 200, { data, total: count || 0, page, per_page: perPage, total_pages: Math.ceil((count || 0) / perPage) });
  }

  return json(res, 405, { error: "Method not allowed" });
}
