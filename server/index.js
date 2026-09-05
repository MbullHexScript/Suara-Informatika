import "dotenv/config"
import express from "express"
import cors from "cors"
import multer from "multer"
import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

const app = express()
const PORT = process.env.PORT || 3001
const SUPA_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPA_ANON = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPA_SERVICE = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.VITE_TELEGRAM_BOT_TOKEN
const TG_ADMIN = process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.VITE_TELEGRAM_ADMIN_CHAT_ID || ""
const TG_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || ""
const APP_URL = process.env.VITE_APP_URL || "http://localhost:5173"

if (!SUPA_URL || !SUPA_SERVICE) console.warn("[server] Supabase env missing")
const supaAdmin = createClient(SUPA_URL, SUPA_SERVICE)
const TG_API = `https://api.telegram.org/bot${TG_TOKEN}`
const KB = { keyboard: [[{ text: "📊 Statistik" }, { text: "📅 Laporan Hari Ini" }], [{ text: "🗓 Laporan Minggu Ini" }, { text: "📆 Laporan Bulan Ini" }], [{ text: "❓ Help" }]], resize_keyboard: true, is_persistent: true }

function esc(s) { return String(s).replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&") }
function sanitize(s){ return String(s).replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;") }

const ALLOWED_TYPES = ["keluhan","kritik","saran"]
const ALLOWED_TARGETS = ["jurusan","himpunan"]
const ALLOWED_CATS = ["Akademik","Fasilitas","Dosen/Pengajaran","Administrasi","Kegiatan Kemahasiswaan","Himpunan","Lainnya"]
const ALLOWED_MIME = ["image/jpeg","image/png","image/webp"]
const MAX_SIZE = 5*1024*1024

const rlStore = new Map()
setInterval(()=>{ const now=Date.now(); for(const [k,v] of rlStore) if(now>v.resetAt) rlStore.delete(k) }, 5*60*1000)
function rateLimit(ip, limit=5, windowMs=60*60*1000){
  const now=Date.now(), key=`rl:${ip}`, e=rlStore.get(key)
  if(!e||now>e.resetAt){ const resetAt=now+windowMs; rlStore.set(key,{count:1,resetAt}); return {success:true}}
  if(e.count>=limit) return {success:false, resetAt:e.resetAt}
  e.count+=1; return {success:true}
}
function getIp(req){ const f=req.headers["x-forwarded-for"], r=req.headers["x-real-ip"]; if(f) return String(f).split(",")[0].trim(); if(r) return String(r); return req.ip || "unknown" }

app.use(cors())
app.use(express.json({ limit: "2mb" }))

async function requireAuth(req,res,next){
  const auth = req.headers.authorization || ""
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null
  if(!token) return res.status(401).json({error:"Unauthorized"})
  const tmp = createClient(SUPA_URL, SUPA_ANON, { global:{ headers:{ Authorization:`Bearer ${token}`}}})
  const { data:{user}, error } = await tmp.auth.getUser()
  if(error||!user) return res.status(401).json({error:"Unauthorized"})
  req.user=user; req.token=token; next()
}

function genCSV(reports){
  const header = ["id","jenis","target","kategori","judul","deskripsi","jumlah_lampiran","status","catatan_admin","dibuat_pada"].join(",")
  const escCsv = v => `"${String(v??"").replace(/"/g,'""')}"`
  const rows = reports.map(r=>[
    r.id,r.type,r.target,r.category,r.title,r.description,Array.isArray(r.attachments)?r.attachments.length:0,r.status,r.admin_notes??"", new Date(r.created_at).toLocaleString("id-ID",{timeZone:"Asia/Makassar"})
  ].map(escCsv).join(","))
  return [header,...rows].join("\n")
}
function genSummary(reports){
  const total=reports.length
  const byType=reports.reduce((a,r)=>{a[r.type]=(a[r.type]||0)+1;return a},{})
  const byTarget=reports.reduce((a,r)=>{a[r.target]=(a[r.target]||0)+1;return a},{})
  const baru=reports.filter(r=>r.status==="baru").length
  return `Ringkasan Laporan\nTotal: ${total}\nKeluhan: ${byType.keluhan||0} | Kritik: ${byType.kritik||0} | Saran: ${byType.saran||0}\nJurusan: ${byTarget.jurusan||0} | Himpunan: ${byTarget.himpunan||0}\nBelum diproses (Baru): ${baru}`
}
async function queryRange(from,to){
  const { data } = await supaAdmin.from("reports").select("*").gte("created_at",from).lte("created_at",to).order("created_at",{ascending:false})
  return data||[]
}
async function allReports(){ const {data}=await supaAdmin.from("reports").select("*").order("created_at",{ascending:false}); return data||[] }
async function sendMessage(chatId,text,markup){
  const body={ chat_id:chatId, text, parse_mode:"MarkdownV2", disable_web_page_preview:true, reply_markup: markup||KB }
  const r=await fetch(`${TG_API}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)})
  if(!r.ok) console.error("[tg sendMessage]",await r.text())
}
async function sendDocument(chatId,content,filename,caption){
  const fd=new FormData()
  fd.append("chat_id",chatId); fd.append("caption",caption); fd.append("parse_mode","MarkdownV2"); fd.append("reply_markup",JSON.stringify(KB))
  fd.append("document", new Blob([content],{type:"text/csv"}), filename)
  const r=await fetch(`${TG_API}/sendDocument`,{method:"POST",body:fd})
  if(!r.ok) console.error("[tg doc]",await r.text())
}
function isAdminChat(id){ return String(TG_ADMIN).split(",").map(s=>s.trim()).includes(String(id)) }
async function getUnread(){
  try{ const {count}=await supaAdmin.from("reports").select("*",{count:"exact",head:true}).eq("status","baru"); return count||0 }catch{ return 0 }
}
function fmtReport(report, unread){
  const te={keluhan:"😤",kritik:"📢",saran:"💡"}[report.type]||"📝"
  const ta={jurusan:"🏫",himpunan:"🎓"}[report.target]||"📌"
  const title=esc(report.title), cat=esc(report.category)
  const desc=esc(report.description.length>500?report.description.slice(0,497)+"...":report.description)
  const line=unread>1?`\n🔔 *${unread} laporan belum dibaca — buka dashboard*`:unread===1?`\n🔔 *1 laporan belum dibaca*`:""
  return `${te} *Laporan Baru Masuk\\!*${line}\n\n${ta} *Target:* ${esc(report.target[0].toUpperCase()+report.target.slice(1))}\n📂 *Kategori:* ${cat}\n📋 *Jenis:* ${esc(report.type[0].toUpperCase()+report.type.slice(1))}\n📌 *Judul:* ${title}\n\n📝 *Deskripsi:*\n${desc}\n\n🕐 *Waktu:* ${esc(new Date(report.created_at).toLocaleString("id-ID",{timeZone:"Asia/Makassar"}))}\n📎 *Lampiran:* ${report.attachments?.length||0} foto`
}
async function notify(report){
  try{
    const unread=await getUnread()
    const msg=fmtReport(report, unread)
    const inline={ inline_keyboard:[[{text:"🔍 Lihat di Dashboard", url:`${APP_URL}/admin/laporan/${report.id}`}]]}
    if(!report.attachments?.length) await sendMessage(TG_ADMIN, msg, inline)
    else if(report.attachments.length===1) await fetch(`${TG_API}/sendPhoto`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:TG_ADMIN, photo:report.attachments[0], caption:msg, parse_mode:"MarkdownV2", reply_markup:inline})})
    else {
      const media=report.attachments.map((u,i)=>({type:"photo",media:u, ...(i===0?{caption:`📎 ${report.attachments.length} foto lampiran`, parse_mode:"MarkdownV2"}:{})}))
      await fetch(`${TG_API}/sendMediaGroup`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:TG_ADMIN, media})})
      await sendMessage(TG_ADMIN, msg, inline)
    }
  }catch(e){ console.error("[notify]",e)}
}
function dateRange(period){
  const now=new Date(), to=now.toISOString()
  let from, label
  if(period==="day"){ from=new Date(now.getFullYear(),now.getMonth(),now.getDate()); label=`hari ini (${now.toLocaleDateString("id-ID",{timeZone:"Asia/Makassar"})})`}
  else if(period==="week"){ const d=now.getDay(), diff=now.getDate()-d+(d===0?-6:1); from=new Date(now); from.setDate(diff); from.setHours(0,0,0,0); label="minggu ini" }
  else { from=new Date(now.getFullYear(),now.getMonth(),1); label=`bulan ${now.toLocaleDateString("id-ID",{month:"long",year:"numeric",timeZone:"Asia/Makassar"})}` }
  return { from:from.toISOString(), to, label }
}
async function handleCmd(cmd, chatId){
  if(cmd==="/help"||cmd==="/start"||cmd==="❓ help"){ await sendMessage(chatId, `🤖 *Bot Aspirasi Informatika*\n\nCommand:\n📅 Laporan Hari Ini — /laporan\\_hari\\_ini\n🗓 Minggu Ini — /laporan\\_minggu\\_ini\n📆 Bulan Ini — /laporan\\_bulan\\_ini\n📊 Statistik — /statistik\n❓ Help — /help`); return }
  if(cmd==="/statistik"||cmd==="📊 statistik"){ const r=await allReports(); await sendMessage(chatId, esc(genSummary(r))); return }
  let period=null
  if(cmd==="/laporan_hari_ini"||cmd==="📅 laporan hari ini") period="day"
  else if(cmd==="/laporan_minggu_ini"||cmd==="🗓 laporan minggu ini") period="week"
  else if(cmd==="/laporan_bulan_ini"||cmd==="📆 laporan bulan ini") period="month"
  if(!period){ await sendMessage(chatId, esc("Command tidak dikenal. Ketik /help")); return }
  const {from,to,label}=dateRange(period)
  const reports=await queryRange(from,to)
  if(!reports.length){ await sendMessage(chatId, esc(`Tidak ada laporan ${label}.`)); return }
  await sendMessage(chatId, esc(`Laporan ${label}\n`)+esc(genSummary(reports)))
  const csv=genCSV(reports), name=`laporan_${period}_${new Date().toISOString().slice(0,10)}.csv`
  await sendDocument(chatId, csv, name, esc(`File CSV: ${reports.length} laporan ${label}`))
}

app.get("/api/health", (_,res)=>res.json({ok:true}))

app.post("/api/reports", async (req,res)=>{
  const ip=getIp(req)
  if(!rateLimit(ip,5,60*60*1000).success) return res.status(429).json({error:"Terlalu banyak laporan. Coba lagi dalam 1 jam."})
  const b=req.body
  if(b.honeypot) return res.json({success:true})
  if(!ALLOWED_TYPES.includes(b.type)) return res.status(400).json({error:"Jenis tidak valid"})
  if(!ALLOWED_TARGETS.includes(b.target)) return res.status(400).json({error:"Target tidak valid"})
  if(!ALLOWED_CATS.includes(b.category)) return res.status(400).json({error:"Kategori tidak valid"})
  if(!b.title?.trim()||b.title.length>100) return res.status(400).json({error:"Judul tidak valid (max 100)"})
  if(!b.description?.trim()||b.description.length>2000) return res.status(400).json({error:"Deskripsi tidak valid (max 2000)"})
  if(b.attachments && b.attachments.length>5) return res.status(400).json({error:"Maksimal 5 lampiran"})
  const { data, error } = await supaAdmin.from("reports").insert({ type:b.type, target:b.target, category:b.category, title:sanitize(b.title.trim()), description:sanitize(b.description.trim()), attachments:b.attachments||[], status:"baru" }).select().single()
  if(error){ console.error(error); return res.status(500).json({error:"Gagal menyimpan"})}
  notify(data).catch(()=>{})
  res.status(201).json({success:true, id:data.id})
})

const upload = multer({ storage: multer.memoryStorage(), limits:{ fileSize: MAX_SIZE }})
app.post("/api/upload", upload.single("file"), async (req,res)=>{
  const ip=getIp(req)
  if(!rateLimit(`upload:${ip}`,20,60*60*1000).success) return res.status(429).json({error:"Rate limit upload"})
  const f=req.file
  if(!f) return res.status(400).json({error:"File tidak ditemukan"})
  if(!ALLOWED_MIME.includes(f.mimetype)) return res.status(400).json({error:"Hanya JPG, PNG, WebP"})
  if(f.size>MAX_SIZE) return res.status(400).json({error:"File >5MB"})
  const ext=f.mimetype.split("/")[1].replace("jpeg","jpg")
  const path=`uploads/${uuidv4()}.${ext}`
  const { error } = await supaAdmin.storage.from("report-attachments").upload(path, f.buffer, { contentType:f.mimetype, upsert:false })
  if(error){ console.error(error); return res.status(500).json({error:"Gagal upload"})}
  const { data } = supaAdmin.storage.from("report-attachments").getPublicUrl(path)
  res.status(201).json({url:data.publicUrl})
})

app.get("/api/reports", requireAuth, async (req,res)=>{
  const page=parseInt(String(req.query.page||"1"),10), perPage=parseInt(String(req.query.per_page||"20"),10)
  let q=supaAdmin.from("reports").select("*",{count:"exact"}).order("created_at",{ascending:false})
  if(req.query.type) q=q.eq("type", req.query.type)
  if(req.query.target) q=q.eq("target", req.query.target)
  if(req.query.category) q=q.eq("category", req.query.category)
  if(req.query.status) q=q.eq("status", req.query.status)
  if(req.query.date_from) q=q.gte("created_at", req.query.date_from)
  if(req.query.date_to) q=q.lte("created_at", String(req.query.date_to)+"T23:59:59Z")
  if(req.query.search){ const s=String(req.query.search); q=q.or(`title.ilike.%${s}%,description.ilike.%${s}%`)}
  const from=(page-1)*perPage, to=from+perPage-1
  q=q.range(from,to)
  const { data, error, count } = await q
  if(error) return res.status(500).json({error:"Gagal fetch"})
  res.json({ data, total:count||0, page, per_page:perPage, total_pages: Math.ceil((count||0)/perPage)})
})

app.get("/api/reports/export", requireAuth, async (req,res)=>{
  let q=supaAdmin.from("reports").select("*").order("created_at",{ascending:false})
  if(req.query.type) q=q.eq("type", req.query.type)
  if(req.query.target) q=q.eq("target", req.query.target)
  if(req.query.category) q=q.eq("category", req.query.category)
  if(req.query.status) q=q.eq("status", req.query.status)
  if(req.query.date_from) q=q.gte("created_at", req.query.date_from)
  if(req.query.date_to) q=q.lte("created_at", String(req.query.date_to)+"T23:59:59Z")
  if(req.query.search){ const s=String(req.query.search); q=q.or(`title.ilike.%${s}%,description.ilike.%${s}%`)}
  const { data } = await q
  const csv=genCSV(data||[])
  res.setHeader("Content-Type","text/csv; charset=utf-8")
  res.setHeader("Content-Disposition",`attachment; filename="laporan_${new Date().toISOString().slice(0,10)}.csv"`)
  res.send(csv)
})

app.get("/api/reports/:id", async (req,res)=>{
  const auth=req.headers.authorization
  if(auth?.startsWith("Bearer ")){
    const token=auth.slice(7); const tmp=createClient(SUPA_URL,SUPA_ANON,{global:{headers:{Authorization:`Bearer ${token}`}}}); const {data:{user}}=await tmp.auth.getUser(); if(user){
      const { data }=await supaAdmin.from("reports").select("*").eq("id",req.params.id).single(); if(!data) return res.status(404).json({error:"Not found"}); return res.json(data)
    }
  }
  const { data }=await supaAdmin.from("reports").select("id,type,target,category,title,description,attachments,status,created_at,updated_at").eq("id",req.params.id).single()
  if(!data) return res.status(404).json({error:"Not found"})
  res.json(data)
})

app.patch("/api/reports/:id", requireAuth, async (req,res)=>{
  const { status, admin_notes }=req.body
  const upd={}
  if(status){ if(!["baru","diproses","selesai","ditolak"].includes(status)) return res.status(400).json({error:"Status invalid"}); upd.status=status}
  if(admin_notes!==undefined) upd.admin_notes=admin_notes
  if(!Object.keys(upd).length) return res.status(400).json({error:"Nothing to update"})
  const { data, error }=await supaAdmin.from("reports").update(upd).eq("id",req.params.id).select().single()
  if(error) return res.status(500).json({error:"Gagal update"})
  res.json(data)
})

app.get("/api/track/:id", async (req,res)=>{
  const { data }=await supaAdmin.from("reports").select("id,title,status,category,target,created_at,updated_at").eq("id",req.params.id).single()
  if(!data) return res.status(404).json({error:"Tiket tidak ditemukan"})
  res.json(data)
})

app.post("/api/telegram/webhook", express.json(), async (req,res)=>{
  if(TG_SECRET && req.headers["x-telegram-bot-api-secret-token"]!==TG_SECRET) return res.status(403).json({error:"Forbidden"})
  const chatId=String(req.body?.message?.chat?.id||"")
  const text=String(req.body?.message?.text||"").trim()
  if(!isAdminChat(chatId)) return res.json({ok:true})
  const cmd=text.split("@")[0].toLowerCase()
  try{ await handleCmd(cmd, chatId)}catch(e){ console.error(e)}
  res.json({ok:true})
})

app.get("/api/stats", requireAuth, async (_,res)=>{
  const { data }=await supaAdmin.from("reports").select("status,type,target,created_at")
  const total=data?.length||0, baru=data?.filter(r=>r.status==="baru").length||0
  res.json({ total, baru, data })
})

app.listen(PORT, ()=>console.log(`[server] http://localhost:${PORT}`))
