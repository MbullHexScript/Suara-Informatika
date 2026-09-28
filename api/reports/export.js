import { cors, json, supaAdmin, requireAuth, genCSV, applyFilters } from "../_lib.js";
export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
  const user = await requireAuth(req);
  if (!user) return json(res, 401, { error: "Unauthorized" });
  const c = supaAdmin();
  const reports = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await applyFilters(c.from("reports").select("*"), req.query).order("created_at", { ascending: false }).order('id').range(offset, offset + 499);
    if (error) return json(res, 503, { error: 'Ekspor gagal.' });
    reports.push(...data);
    if (data.length < 500) break;
  }
  const csv = genCSV(reports);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="laporan_${new Date().toISOString().slice(0, 10)}.csv"`);
  res.status(200).send(csv);
}
