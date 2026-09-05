import { cors, json, supaAdmin, ALLOWED_MIME, MAX_SIZE } from "./_lib.js";
import { createClient } from "@supabase/supabase-js";

export const config = { api: { bodyParser: false } };

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function getBoundary(ct) {
  const m = String(ct || "").match(/boundary=([^;]+)/);
  return m ? m[1].replace(/"/g, "") : null;
}

function extractFile(buf, boundary) {
  const str = buf.toString("binary");
  const bnd = "--" + boundary;
  const parts = str.split(bnd);
  for (const part of parts) {
    if (!part.includes("Content-Disposition")) continue;
    const nameMatch = part.match(/name="file"/);
    if (!nameMatch) continue;
    const ctMatch = part.match(/Content-Type:\s*([^\r\n]+)/i);
    const fnMatch = part.match(/filename="([^"]+)"/);
    const headerEnd = part.indexOf("\r\n\r\n");
    if (headerEnd === -1) continue;
    let body = part.slice(headerEnd + 4);
    if (body.endsWith("\r\n")) body = body.slice(0, -2);
    if (body.endsWith("--")) body = body.slice(0, -2);
    const mime = (ctMatch ? ctMatch[1].trim() : "application/octet-stream").toLowerCase();
    const filename = fnMatch ? fnMatch[1] : "upload";
    const bin = Buffer.from(body, "binary");
    return { buffer: bin, mimetype: mime, originalname: filename, size: bin.length };
  }
  return null;
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const ct = req.headers["content-type"] || req.headers["Content-Type"] || "";
  const boundary = getBoundary(ct);
  if (!boundary) return json(res, 400, { error: "Invalid content-type" });

  const buf = await parseMultipart(req);
  const file = extractFile(buf, boundary);
  if (!file) return json(res, 400, { error: "File tidak ditemukan" });
  if (!ALLOWED_MIME.includes(file.mimetype)) return json(res, 400, { error: "Hanya JPG, PNG, WebP" });
  if (file.size > MAX_SIZE) return json(res, 400, { error: "File >5MB" });

  const ext = file.mimetype.split("/")[1].replace("jpeg", "jpg");
  const { randomUUID } = await import("crypto");
  const path = `uploads/${randomUUID()}.${ext}`;

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const c = createClient(url, key);

  const { error } = await c.storage.from("report-attachments").upload(path, file.buffer, { contentType: file.mimetype, upsert: false });
  if (error) { console.error(error); return json(res, 500, { error: "Gagal upload" }); }
  const { data } = c.storage.from("report-attachments").getPublicUrl(path);
  return json(res, 201, { url: data.publicUrl });
}
