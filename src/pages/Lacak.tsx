import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Search, Clock, CheckCircle2, XCircle, Loader2, Copy, ArrowRight } from "lucide-react"
import { toast } from "sonner"

type Info = { id:string; title:string; status:string; category:string; target:string; created_at:string; updated_at:string }

const statusMeta: Record<string,{label:string, cls:string, icon:React.ReactNode, desc:string}> = {
  baru:{ label:"Baru", cls:"bg-white/90 text-black", icon:<Clock className="w-3.5 h-3.5" />, desc:"Laporan diterima, menunggu ditinjau admin."},
  diproses:{ label:"Diproses", cls:"bg-white/[0.12] border border-white/[0.2] text-white backdrop-blur", icon:<Loader2 className="w-3.5 h-3.5" />, desc:"Sedang ditindaklanjuti."},
  selesai:{ label:"Selesai", cls:"bg-white/90 text-black", icon:<CheckCircle2 className="w-3.5 h-3.5" />, desc:"Tindak lanjut selesai."},
  ditolak:{ label:"Ditolak", cls:"bg-white/[0.12] border border-white/[0.2] text-white/60 backdrop-blur", icon:<XCircle className="w-3.5 h-3.5" />, desc:"Tidak dapat diproses."},
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
    <div className="bg-transparent min-h-[60vh]">
      <div className="container-wide py-8 md:py-10">
        <div className="max-w-[640px] mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-[28px] font-[800] text-white" style={{ letterSpacing:"-0.02em" }}>Lacak Status</h1>
            <p className="text-[13px] leading-[1.6] text-white/60">Tempel nomor tiket (UUID) yang kamu dapat setelah mengirim laporan.</p>
          </div>

          <div className="glass-card rounded-[16px] p-5 md:p-6 space-y-4 will-change-transform">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input value={q} onChange={e=>setQ(e.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" className="w-full h-11 pl-10 pr-3 rounded-[12px] bg-white/[0.08] border border-white/[0.15] font-mono text-[12px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/10 backdrop-blur" onKeyDown={e=>{ if(e.key==="Enter") fetchOne(q)}} />
              </div>
              <button onClick={()=>fetchOne(q)} onPointerDown={(e)=>(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)} disabled={loading} className="pressable shrink-0 inline-flex items-center justify-center h-11 px-6 rounded-full bg-white text-black text-[12px] font-semibold tracking-[0.04em] uppercase disabled:opacity-40 will-change-transform" style={{ transition:"transform 100ms ease-out" }}>
                {loading? <Loader2 className="w-4 h-4 animate-spin" /> : "Cek"}
              </button>
            </div>

            {err && <p className="text-[13px] text-[#ffa0a0] bg-red-500/10 border border-red-400/20 rounded-[12px] px-3 py-2.5">{err}</p>}

            {data && m && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold will-change-transform ${m.cls}`}>{m.icon} {m.label}</span>
                  <span className="label-sm text-white/50">{new Date(data.created_at).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"})} · {data.category} · {data.target}</span>
                </div>
                <div>
                  <h2 className="text-[16px] font-bold leading-snug text-white" style={{ letterSpacing:"-0.01em" }}>{data.title}</h2>
                  <p className="text-[13px] leading-[1.6] text-white/60 mt-1">{m.desc}</p>
                </div>
                <div className="rounded-[12px] bg-white/[0.08] border border-white/[0.12] p-3 flex items-center gap-2 backdrop-blur">
                  <span className="font-mono text-[11px] break-all flex-1 text-white">{data.id}</span>
                  <button onClick={async()=>{ await navigator.clipboard.writeText(data.id); toast.success("Disalin")}} onPointerDown={(e)=>(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)} className="pressable inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-black text-[11px] font-semibold will-change-transform"><Copy className="w-3.5 h-3.5" /> Salin</button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className={`rounded-[12px] p-3 border will-change-transform ${["baru","diproses","selesai"].includes(data.status)?"bg-white/[0.12] border-white/30 text-white":"bg-white/[0.04] border-white/[0.08] text-white/40"}`}><p className="label-sm text-[10px]">DITERIMA</p><p className="text-[12px] font-bold mt-1">Baru</p></div>
                  <div className={`rounded-[12px] p-3 border will-change-transform ${["diproses","selesai"].includes(data.status)?"bg-white/90 text-black border-white/40":"bg-white/[0.04] border-white/[0.08] text-white/40"}`}><p className="label-sm text-[10px] opacity-70">DIPROSES</p><p className="text-[12px] font-bold mt-1">Tindak lanjut</p></div>
                  <div className={`rounded-[12px] p-3 border will-change-transform ${data.status==="selesai"?"bg-white/90 text-black border-white/40":"bg-white/[0.04] border-white/[0.08] text-white/40"}`}><p className="label-sm text-[10px] opacity-70">SELESAI</p><p className="text-[12px] font-bold mt-1">Tuntas</p></div>
                </div>
                <p className="label-sm text-white/40">Terakhir diperbarui {new Date(data.updated_at).toLocaleString("id-ID")}</p>
              </div>
            )}

            {!data && !err && !loading && (
              <div className="text-center py-4 text-[12px] text-white/50 flex flex-col items-center gap-2">
                <span>Belum ada pencarian. Cek tiketmu di sini kapan saja.</span>
                <Link to="/laporan" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white border-b border-white/40">Buat laporan baru <ArrowRight className="w-3.5 h-3.5" /></Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
