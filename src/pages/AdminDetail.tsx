import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Loader2, Save, Image as ImgIcon, Calendar, Tag, Target } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { Report } from "@/types"

export default function AdminDetail(){
  const { id } = useParams()
  const nav = useNavigate()
  const [data,setData]=useState<Report|null>(null)
  const [loading,setLoading]=useState(true)
  const [status,setStatus]=useState("")
  const [notes,setNotes]=useState("")
  const [saving,setSaving]=useState(false)
  const [lightbox,setLightbox]=useState<string|null>(null)

  useEffect(()=>{ supabase.auth.getUser().then(({data:{user}})=>{ if(!user) nav("/admin/login",{replace:true}) }) },[nav])
  useEffect(()=>{
    (async()=>{
      const { data:{session}}=await supabase.auth.getSession()
      if(!session) return
      const r=await fetch(`/api/reports/${id}`,{ headers:{ Authorization:`Bearer ${session.access_token}`}})
      if(!r.ok){ toast.error("Laporan tidak ditemukan"); nav("/admin",{replace:true}); return}
      const j=await r.json(); setData(j); setStatus(j.status); setNotes(j.admin_notes||""); setLoading(false)
    })()
  },[id, nav])

  const save=async()=>{
    const { data:{session}}=await supabase.auth.getSession(); if(!session) return
    setSaving(true)
    try{
      const r=await fetch(`/api/reports/${id}`,{method:"PATCH", headers:{"Content-Type":"application/json", Authorization:`Bearer ${session.access_token}`}, body:JSON.stringify({status, admin_notes:notes})})
      if(!r.ok) throw new Error("Gagal simpan")
      const j=await r.json(); setData(j); toast.success("Disimpan")
    }catch{ toast.error("Gagal simpan")} finally{ setSaving(false)}
  }

  if(loading) return <div className="min-h-screen grid place-items-center bg-[#f9f9f9]"><Loader2 className="w-6 h-6 animate-spin" /></div>
  if(!data) return null
  const pill:Record<string,string>={baru:"bg-black text-white", diproses:"bg-white/70 text-[#1a1c1c] border border-black/[0.06] backdrop-blur", selesai:"bg-black text-white", ditolak:"bg-white/70 text-[#525252] border border-black/[0.06] backdrop-blur"}

  return (
    <div className="min-h-screen bg-[#f9f9f9] pb-20 md:pb-0">
      <div className="glass sticky top-0 z-10">
        <div className="container-wide h-[56px] flex items-center gap-3 will-change-[backdrop-filter]">
          <Link to="/admin" className="inline-flex items-center gap-2 h-9 px-4 rounded-full glass-pill text-[12px] font-semibold active:scale-[0.97] will-change-transform" style={{ transition:"transform 100ms ease-out" }}><ArrowLeft className="w-4 h-4" /> Kembali</Link>
          <span className="text-[11px] font-mono text-[#525252] truncate hidden md:inline">{data.id}</span>
          <span className={`ml-auto md:ml-0 px-3 py-1 rounded-full text-[11px] font-semibold will-change-transform ${pill[data.status]||"bg-white/70"}`}>{data.status}</span>
        </div>
      </div>

      <div className="container-wide py-6 space-y-6 max-w-[880px]">
        <div className="glass-card rounded-[16px] p-6 md:p-7 space-y-5 will-change-transform">
          <div className="flex flex-wrap items-center gap-2">
            <span className="label-sm px-3 py-1.5 rounded-full glass-pill capitalize">{data.type}</span>
            <span className="label-sm text-[#525252] inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(data.created_at).toLocaleString("id-ID")}</span>
          </div>
          <div>
            <h1 className="text-[20px] md:text-[22px] font-bold leading-tight" style={{ letterSpacing:"-0.02em" }}>{data.title}</h1>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-[11px] font-medium"><Tag className="w-3.5 h-3.5" />{data.category}</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-[11px] font-medium"><Target className="w-3.5 h-3.5" />{data.target}</span>
              {data.attachments?.length? <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-black/[0.06] text-[11px] font-medium backdrop-blur"><ImgIcon className="w-3.5 h-3.5" />{data.attachments.length} foto</span>:null}
            </div>
          </div>
          <div className="rounded-[12px] bg-white/70 border border-black/[0.06] p-4 backdrop-blur">
            <p className="label-sm text-[#525252] mb-2">DESKRIPSI</p>
            <p className="text-[14px] leading-[1.6] whitespace-pre-wrap">{data.description}</p>
          </div>
          {data.attachments?.length ? (
            <div>
              <p className="label-sm text-[#525252] mb-2">LAMPIRAN</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {data.attachments.map((u,i)=>(
                  <button key={i} onClick={()=>setLightbox(u)} className="rounded-[12px] overflow-hidden border border-black/[0.06] bg-white text-left will-change-transform active:scale-[0.98] hover:opacity-90 transition" style={{ transition:"transform 100ms ease-out" }}>
                    <img src={u} alt={`lampiran ${i+1}`} className="w-full h-40 object-cover" />
                  </button>
                ))}
              </div>
            </div>
          ):null}
        </div>

        <div className="glass-card rounded-[16px] p-6 space-y-4 will-change-transform">
          <h2 className="text-[14px] font-bold" style={{ letterSpacing:"-0.01em" }}>Tindak lanjut admin</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="label-sm text-[#525252]">STATUS</label>
              <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full h-10 px-3 rounded-[12px] bg-white/70 border border-black/[0.06] text-[13px] backdrop-blur focus:outline-none focus:border-[#0A84FF] focus:ring-2 focus:ring-[#0A84FF]/20">
                <option value="baru">Baru</option><option value="diproses">Diproses</option><option value="selesai">Selesai</option><option value="ditolak">Ditolak</option>
              </select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="label-sm text-[#525252]">CATATAN INTERNAL</label>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Catatan untuk tim admin (tidak terlihat publik)..." className="w-full min-h-[100px] p-3 rounded-[12px] bg-white/70 border border-black/[0.06] text-[13px] leading-[1.6] backdrop-blur focus:outline-none focus:border-[#0A84FF] focus:ring-2 focus:ring-[#0A84FF]/20" />
            </div>
          </div>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 h-10 px-6 rounded-full bg-black text-white text-[12px] font-semibold tracking-[0.04em] uppercase disabled:opacity-40 will-change-transform active:scale-[0.97] hover:opacity-90" style={{ transition:"transform 100ms ease-out" }}>
            {saving? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan perubahan
          </button>
        </div>
      </div>

      {lightbox && (
        <div onClick={()=>setLightbox(null)} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[20px] grid place-items-center p-4">
          <img src={lightbox} alt="" className="max-w-[92vw] max-h-[92vh] rounded-[16px] shadow-2xl" />
        </div>
      )}
    </div>
  )
}
