import { cors, json, tgSecret, isAdminChat, handleCmd } from "../_lib.js";
export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  const secret = tgSecret();
  const got = req.headers["x-telegram-bot-api-secret-token"] || req.headers["X-Telegram-Bot-Api-Secret-Token"] || "";
  if (secret && got !== secret) return json(res, 403, { error: "Forbidden" });
  let body = req.body;
  if (typeof body === "string") try { body = JSON.parse(body); } catch { body = {}; }
  const chatId = String(body?.message?.chat?.id || "");
  const text = String(body?.message?.text || "").trim();
  if (!isAdminChat(chatId)) return json(res, 200, { ok: true });
  const cmd = text.split("@")[0].toLowerCase();
  try { await handleCmd(cmd, chatId); } catch (e) { console.error(e); }
  return json(res, 200, { ok: true });
}
