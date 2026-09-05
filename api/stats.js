import { cors, json, supaAdmin, requireAuth } from "./_lib.js";
export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
  const user = await requireAuth(req);
  if (!user) return json(res, 401, { error: "Unauthorized" });
  const c = supaAdmin();
  const { data } = await c.from("reports").select("status,type,target,created_at");
  const total = data?.length || 0, baru = data?.filter((r) => r.status === "baru").length || 0;
  return json(res, 200, { total, baru, data });
}
