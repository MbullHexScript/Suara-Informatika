import { cors, json } from "./_lib.js";
export default function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  return json(res, 200, { ok: true });
}
