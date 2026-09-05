import type { Report } from "@/types"

function tgApi() { return `https://api.telegram.org/bot${import.meta.env.VITE_TELEGRAM_BOT_TOKEN || (typeof process !== "undefined" ? (process.env as unknown as Record<string,string>).TELEGRAM_BOT_TOKEN : "")}` }
function adminId(){ return (import.meta.env.VITE_TELEGRAM_ADMIN_CHAT_ID as string) || "5721987142" }
const APP_URL = (import.meta.env.VITE_APP_URL as string) || "http://localhost:5173"

const KB = { keyboard: [[{text:"📊 Statistik"},{text:"📅 Laporan Hari Ini"}],[{text:"🗓 Laporan Minggu Ini"},{text:"📆 Laporan Bulan Ini"}],[{text:"❓ Help"}]], resize_keyboard:true, is_persistent:true }

function esc(s:string){ return s.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g,"\\$&") }

export function formatReportMessage(report: Report, unread:number): string {
  const typeEmoji = ({ keluhan:"😤", kritik:"📢", saran:"💡"} as Record<string,string>)[report.type] || "📝"
  const targetEmoji = ({ jurusan:"🏫", himpunan:"🎓"} as Record<string,string>)[report.target] || "📌"
  const title=esc(report.title), cat=esc(report.category)
  const desc=esc(report.description.length>500?report.description.slice(0,497)+"...":report.description)
  const unreadLine = unread>1?`\n🔔 *${unread} laporan belum dibaca — buka dashboard*`:unread===1?`\n🔔 *1 laporan belum dibaca*`:""
  return `${typeEmoji} *Laporan Baru Masuk\\!*${unreadLine}\n\n${targetEmoji} *Target:* ${esc(report.target[0].toUpperCase()+report.target.slice(1))}\n📂 *Kategori:* ${cat}\n📋 *Jenis:* ${esc(report.type[0].toUpperCase()+report.type.slice(1))}\n📌 *Judul:* ${title}\n\n📝 *Deskripsi:*\n${desc}\n\n🕐 *Waktu:* ${esc(new Date(report.created_at).toLocaleString("id-ID",{timeZone:"Asia/Makassar"}))}\n📎 *Lampiran:* ${report.attachments?.length??0} foto`
}

export async function sendReportNotification(report: Report){
  try{
    const { createClient } = await import("@supabase/supabase-js")
    let unread=0
    try{
      const url=import.meta.env.VITE_SUPABASE_URL as string, key=(import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string)||(import.meta.env.VITE_SUPABASE_ANON_KEY as string)
      if(url&&key){ const sb=createClient(url,key); const {count}=await sb.from("reports").select("*",{count:"exact",head:true}).eq("status","baru"); unread=count??0 }
    }catch{ /* ignore */ }
    const msg=formatReportMessage(report, unread)
    const inline={ inline_keyboard: [[{text:"🔍 Lihat di Dashboard", url:`${APP_URL}/admin/laporan/${report.id}` }]] }
    const api=tgApi(), chat=adminId()
    if(!report.attachments?.length) await sendMessage(chat,msg,inline)
    else if(report.attachments.length===1) await fetch(`${api}/sendPhoto`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:chat,photo:report.attachments[0],caption:msg,parse_mode:"MarkdownV2",reply_markup:inline})})
    else {
      const media=report.attachments.map((u,i)=>({type:"photo",media:u, ...(i===0?{caption:`📎 ${report.attachments.length} foto lampiran`, parse_mode:"MarkdownV2"}:{})}))
      await fetch(`${api}/sendMediaGroup`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:chat,media})})
      await sendMessage(chat,msg,inline)
    }
  }catch(e){ console.error("[tg notify]",e) }
}

export async function sendMessage(chatId:string,text:string,replyMarkup?:unknown){
  const api=tgApi()
  const res=await fetch(`${api}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:chatId,text,parse_mode:"MarkdownV2",disable_web_page_preview:true,reply_markup:replyMarkup||KB})})
  if(!res.ok) console.error("[tg sendMessage]",await res.text())
}
export async function sendDocument(chatId:string,content:string,filename:string,caption:string){
  const api=tgApi()
  const fd=new FormData()
  fd.append("chat_id",chatId); fd.append("caption",caption); fd.append("parse_mode","MarkdownV2"); fd.append("reply_markup",JSON.stringify(KB))
  fd.append("document", new Blob([content],{type:"text/csv"}), filename)
  const res=await fetch(`${api}/sendDocument`,{method:"POST",body:fd})
  if(!res.ok) console.error("[tg sendDocument]",await res.text())
}
export function isAdminChat(chatId:string|number){
  const ids=((import.meta.env.VITE_TELEGRAM_ADMIN_CHAT_ID as string)||"5721987142").split(",").map(s=>s.trim())
  return ids.includes(String(chatId))
}
