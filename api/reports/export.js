import { cors, json, supaAdmin, requireAuth, genCSV } from "../_lib.js";
export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
  const user = await requireAuth(req);
  if (!user) return json(res, 401, { error: "Unauthorized" });
  const c = supaAdmin();
  let q = c.from("reports").select("*").order("created_at", { ascending: false });
  if (req.query.type) q = q.eq("type", req.query.type);
  if (req.query.target) q = q.eq("target", req.query.target);
  if (req.query.category) q = q.eq("category", req.query.category);
  if (req.query.status) q = q.eq("status", req.query.status);
  if (req.query.date_from) q = q.gte("created_at", req.query.date_from);
  if (req.query.date_to) q = q.lte("created_at", String(req.query.date_to) + "T23:59:59Z");
  if (req.query.search) { const s = String(req.query.search); q = q.or(`title.ilike.%${s}%,description.ilike.%${s}%`); }
  const { data } = await q;
  const csv = genCSV(data || []);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="laporan_${new Date().toISOString().slice(0, 10)}.csv"`);
  res.status(200).send(csv);
}
