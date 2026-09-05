import { cors, json, supaAdmin } from "../_lib.js";
export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
  const id = req.query.id || new URL(req.url, "http://localhost").pathname.split("/").pop();
  const c = supaAdmin();
  const { data } = await c.from("reports").select("id,title,status,category,target,created_at,updated_at").eq("id", id).single();
  if (!data) return json(res, 404, { error: "Tiket tidak ditemukan" });
  return json(res, 200, data);
}
