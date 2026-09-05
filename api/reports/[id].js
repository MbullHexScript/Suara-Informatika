import { cors, json, supaAdmin, requireAuth } from "../_lib.js";
import { createClient } from "@supabase/supabase-js";

function getId(req) {
  if (req.query.id) return String(req.query.id);
  const url = new URL(req.url, "http://localhost");
  const m = url.pathname.match(/\/api\/reports\/([^/]+)/);
  return m ? m[1] : null;
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  const id = getId(req);
  if (!id) return json(res, 400, { error: "Missing id" });

  if (req.method === "GET") {
    const auth = req.headers.authorization || req.headers.Authorization || "";
    const c = supaAdmin();
    if (auth?.startsWith("Bearer ")) {
      const token = auth.slice(7);
      const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
      const anon = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
      const tmp = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } } });
      const { data: { user } } = await tmp.auth.getUser();
      if (user) {
        const { data } = await c.from("reports").select("*").eq("id", id).single();
        if (!data) return json(res, 404, { error: "Not found" });
        return json(res, 200, data);
      }
    }
    const { data } = await c.from("reports").select("id,type,target,category,title,description,attachments,status,created_at,updated_at").eq("id", id).single();
    if (!data) return json(res, 404, { error: "Not found" });
    return json(res, 200, data);
  }

  if (req.method === "PATCH") {
    const user = await requireAuth(req);
    if (!user) return json(res, 401, { error: "Unauthorized" });
    let body = req.body;
    if (typeof body === "string") try { body = JSON.parse(body); } catch {}
    const { status, admin_notes } = body || {};
    const upd = {};
    if (status) { if (!["baru", "diproses", "selesai", "ditolak"].includes(status)) return json(res, 400, { error: "Status invalid" }); upd.status = status; }
    if (admin_notes !== undefined) upd.admin_notes = admin_notes;
    if (!Object.keys(upd).length) return json(res, 400, { error: "Nothing to update" });
    const c = supaAdmin();
    const { data, error } = await c.from("reports").update(upd).eq("id", id).select().single();
    if (error) return json(res, 500, { error: "Gagal update" });
    return json(res, 200, data);
  }

  return json(res, 405, { error: "Method not allowed" });
}
