import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Search, Clock, CheckCircle2, XCircle, Loader2, Copy, ArrowRight } from "lucide-react"
import { toast } from "sonner"

type Info = { id:string; title:string; status:string; category:string; target:string; created_at:string; updated_at:string }

const statusMeta: Record<string,{label:string, cls:string, icon:React.ReactNode, desc:string}> = {
  baru:{ label:"Baru", cls:"bg-black text-white", icon:<Clock className="w-3.5 h-3.5" />, desc:"Laporan diterima, menunggu ditinjau admin."},
  diproses:{ label:"Diproses", cls:"bg-[#f3f3f3] text-[#1a1c1c] border border-[#E5E5E5]", icon:<Loader2 className="w-3.5 h-3.5" />, desc:"Sedang ditindaklanjuti."},
  selesai:{ label:"Selesai", cls:"bg-black text-white", icon:<CheckCircle2 className="w-3.5 h-3.5" />, desc:"Tindak lanjut selesai."},
  ditolak:{ label:"Ditolak", cls:"bg-white text-[#525252] border border-[#E5E5E5]", icon:<XCircle className="w-3.5 h-3.5" />, desc:"Tidak dapat diproses."},
}

export default function Lacak(){
  const { id: paramId } = useParams()
  const nav = useNavigate()
  const [q,setQ]=useState(paramId||"")
  const [data,setData]=useState<Info|null>(null)
  const [loading,setLoading]=useState(false)
  const [err,setErr]=useState("")

  const fetchOne=async(id:string)=>{
    if(!id.trim()) return toast.error("Masukkan nomor tiket")
    setLoading(true); setErr(""); setData(null)
    try{
      const r=await fetch(`/api/track/${id.trim()}`)
      const j=await r.json()
      if(!r.ok) throw new Error(j.error||"Tidak ditemukan")
      setData(j); nav(`/lacak/${id.trim()}`, {replace:true})
    }catch(e){ setErr(e instanceof Error?e.message:"Tiket tidak ditemukan")}
    finally{ setLoading(false)}
  }
  useEffect(()=>{ if(paramId) fetchOne(paramId) },[paramId])
  const m = data? (statusMeta[data.status]||statusMeta.baru) : null

  return (
    <div className="bg-[#f9f9f9] pb-20 md:pb-0 min-h-[60vh]">
      <div className="container-wide py-8 md:py-10">
        <div className="max-w-[640px] mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-[28px] font-[800] tracking-[-0.02em]">Lacak Status</h1>
            <p className="text-[13px] leading-[1.6] text-[#525252]">Tempel nomor tiket (UUID) yang kamu dapat setelah mengirim laporan.</p>
          </div>

          <div className="rounded-[16px] bg-white border border-[#E5E5E5] shadow-[0_8px_24px_rgba(0,0,0,0.04)] p-5 md:p-6 space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#7e7576] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input value={q} onChange={e=>setQ(e.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" className="w-full h-11 pl-10 pr-3 rounded-[12px] bg-white border border-[#E5E5E5] font-mono text-[12px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black" onKeyDown={e=>{ if(e.key==="Enter") fetchOne(q)}} />
              </div>
              <button onClick={()=>fetchOne(q)} disabled={loading} className="shrink-0 inline-flex items-center justify-center h-11 px-6 rounded-full bg-black text-white text-[12px] font-semibold tracking-[0.04em] uppercase disabled:opacity-40 hover:opacity-90 transition">
                {loading? <Loader2 className="w-4 h-4 animate-spin" /> : "Cek"}
              </button>
            </div>

            {err && <p className="text-[13px] text-[#ba1a1a] bg-[#ffdad6] border border-[#ffdad6] rounded-[12px] px-3 py-2.5">{err}</p>}

            {data && m && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold ${m.cls}`}>{m.icon} {m.label}</span>
                  <span className="label-sm text-[#525252]">{new Date(data.created_at).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"})} · {data.category} · {data.target}</span>
                </div>
                <div>
                  <h2 className="text-[16px] font-bold leading-snug">{data.title}</h2>
                  <p className="text-[13px] leading-[1.6] text-[#525252] mt-1">{m.desc}</p>
                </div>
                <div className="rounded-[12px] bg-[#f3f3f3] border border-[#E5E5E5] p-3 flex items-center gap-2">
                  <span className="font-mono text-[11px] break-all flex-1">{data.id}</span>
                  <button onClick={async()=>{ await navigator.clipboard.writeText(data.id); toast.success("Disalin")}} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-black text-white text-[11px] font-semibold"><Copy className="w-3.5 h-3.5" /> Salin</button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className={`rounded-[12px] p-3 border ${["baru","diproses","selesai"].includes(data.status)?"bg-white border-black":"bg-white border-[#E5E5E5] opacity-60"}`}><p className="label-sm text-[10px]">DITERIMA</p><p className="text-[12px] font-bold mt-1">Baru</p></div>
                  <div className={`rounded-[12px] p-3 border ${["diproses","selesai"].includes(data.status)?"bg-black text-white border-black":"bg-white border-[#E5E5E5] opacity-60"}`}><p className="label-sm text-[10px] opacity-70">DIPROSES</p><p className="text-[12px] font-bold mt-1">Tindak lanjut</p></div>
                  <div className={`rounded-[12px] p-3 border ${data.status==="selesai"?"bg-black text-white border-black":"bg-white border-[#E5E5E5] opacity-60"}`}><p className="label-sm text-[10px] opacity-70">SELESAI</p><p className="text-[12px] font-bold mt-1">Tuntas</p></div>
                </div>
                <p className="label-sm text-[#7e7576]">Terakhir diperbarui {new Date(data.updated_at).toLocaleString("id-ID")}</p>
              </div>
            )}

            {!data && !err && !loading && (
              <div className="text-center py-4 text-[12px] text-[#525252] flex flex-col items-center gap-2">
                <span>Belum ada pencarian. Cek tiketmu di sini kapan saja.</span>
                <Link to="/laporan" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-black border-b border-black">Buat laporan baru <ArrowRight className="w-3.5 h-3.5" /></Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
