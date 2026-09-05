import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Search, Eye, Loader2, SlidersHorizontal, FileSpreadsheet, LogOut, LayoutDashboard, Inbox, BarChart3, Home, Paperclip } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { PaginatedReports, ReportFilter } from "@/types"

function Pill({ s }:{ s:string }){
  const m:Record<string,string> = {
    baru:"bg-black text-white",
    diproses:"bg-[#f3f3f3] text-[#1a1c1c] border border-[#E5E5E5]",
    selesai:"bg-[#1a1c1c] text-white",
    ditolak:"bg-white text-[#525252] border border-[#E5E5E5]"
  }
  const l:Record<string,string>={baru:"Baru",diproses:"Diproses",selesai:"Selesai",ditolak:"Ditolak"}
  return <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-[0.02em] ${m[s]||"bg-[#f3f3f3]"}`}>{l[s]||s}</span>
}

export default function AdminDashboard(){
  const nav=useNavigate()
  const [checked,setChecked]=useState(false)
  const [data,setData]=useState<PaginatedReports|null>(null)
  const [loading,setLoading]=useState(true)
  const [filters,setFilters]=useState<ReportFilter>({ page:1, per_page:10 })
  const [activeTab,setActiveTab]=useState<"semua"|"baru"|"selesai">("semua")
  const [showFilters,setShowFilters]=useState(false)
  const [userEmail,setUserEmail]=useState("")

  useEffect(()=>{ supabase.auth.getUser().then(({data:{user}})=>{ if(!user) nav("/admin/login",{replace:true}); else { setChecked(true); setUserEmail(user.email||"") }}) },[nav])

  const getToken=useCallback(async()=>{ const {data:{session}}=await supabase.auth.getSession(); return session?.access_token||null },[])

  const fetchReports=useCallback(async()=>{
    setLoading(true)
    try{
      const tok=await getToken(); if(!tok) return
      const p=new URLSearchParams()
      Object.entries(filters).forEach(([k,v])=>{ if(v!==undefined && v!=="") p.append(k,String(v)) })
      const r=await fetch(`/api/reports?${p.toString()}`,{ headers:{ Authorization:`Bearer ${tok}`}})
      if(!r.ok){ if(r.status===401) nav("/admin/login",{replace:true}); return }
      const j=await r.json(); setData(j)
    } finally{ setLoading(false)}
  },[filters,getToken,nav])

  useEffect(()=>{ if(checked) fetchReports() },[checked,fetchReports])

  const onSearch=(v:string)=> setFilters(f=>({ ...f, search: v||undefined, page:1 }))
  const onTab=(t:"semua"|"baru"|"selesai")=>{
    setActiveTab(t)
    setFilters(f=>({ ...f, status: t==="semua"? undefined : t==="baru" ? "baru" : "selesai", page:1 }))
  }
  const onFilter=(k:keyof ReportFilter, v:string)=> setFilters(f=>({ ...f, [k]: v||undefined, page:1 }))

  const exportCSV=async()=>{
    const tok=await getToken(); if(!tok) return
    const p=new URLSearchParams()
    Object.entries(filters).forEach(([k,v])=>{ if(v && k!=="page" && k!=="per_page") p.append(k,String(v)) })
    const r=await fetch(`/api/reports/export?${p.toString()}`,{ headers:{ Authorization:`Bearer ${tok}`}})
    if(!r.ok) return toast.error("Export gagal")
    const blob=await r.blob(); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`laporan_${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url)
  }
  const keluar=async()=>{ await supabase.auth.signOut(); nav("/admin/login",{replace:true}) }

  if(!checked) return <div className="min-h-screen grid place-items-center bg-[#f9f9f9]"><Loader2 className="w-6 h-6 animate-spin" /></div>

  const total = data?.total ?? 0

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex">
      <aside className="hidden md:flex w-[280px] bg-black text-white flex-col justify-between sticky top-0 h-screen">
        <div>
          <div className="p-7 flex items-center gap-3 border-b border-white/10">
            <span className="w-10 h-10 rounded bg-white text-black grid place-items-center font-extrabold text-[12px]">SI</span>
            <div className="leading-none">
              <p className="font-bold text-[12px] tracking-[0.06em]">SUARA</p>
              <p className="font-bold text-[12px] tracking-[0.06em]">INFORMATIKA</p>
              <p className="label-sm text-[9px] text-white/60 mt-1">100% ANONIM & TRANSPARAN</p>
            </div>
          </div>
          <nav className="p-4 space-y-2">
            <Link to="/" className="flex items-center gap-3 px-4 h-10 rounded-[12px] text-[13px] font-medium text-white/70 hover:bg-white/10"><Home className="w-4 h-4" /> Beranda</Link>
            <Link to="/admin" className="flex items-center gap-3 px-4 h-10 rounded-[12px] bg-white text-black text-[13px] font-semibold"><LayoutDashboard className="w-4 h-4" /> Kelola Laporan</Link>
            <Link to="/laporan" className="flex items-center gap-3 px-4 h-10 rounded-[12px] text-[13px] font-medium text-white/70 hover:bg-white/10"><Inbox className="w-4 h-4" /> Form Publik</Link>
          </nav>
        </div>
        <div className="p-4 space-y-4">
          <div className="rounded-[12px] bg-white/10 border border-white/10 p-3 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-white text-black grid place-items-center font-bold text-[11px]">{(userEmail[0]||"A").toUpperCase()}</span>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold truncate">{userEmail || "Admin"}</p>
              <p className="text-[11px] text-white/60">Admin Jurusan</p>
            </div>
          </div>
          <button onClick={keluar} className="w-full flex items-center justify-center gap-2 h-10 rounded-full bg-white text-black text-[12px] font-semibold"><LogOut className="w-4 h-4" /> Keluar</button>
          <p className="text-[10px] tracking-[0.08em] text-white/20 font-semibold">SI — SUARA INFORMATIKA</p>
        </div>
      </aside>

      <div className="flex-1 min-w-0 pb-20 md:pb-0">
        <div className="md:hidden sticky top-0 z-30 bg-[#f9f9f9]/95 backdrop-blur border-b border-[#E5E5E5]">
          <div className="h-[56px] flex items-center justify-between px-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded bg-black text-white grid place-items-center font-extrabold text-[11px]">SI</span>
              <span className="leading-none">
                <span className="block text-[12px] font-bold tracking-[-0.01em]">SUARA</span>
                <span className="block text-[12px] font-bold tracking-[-0.01em] -mt-0.5">INFORMATIKA</span>
              </span>
            </div>
            <button onClick={keluar} className="w-9 h-9 rounded-full bg-white border border-[#E5E5E5] grid place-items-center"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="px-4 md:px-8 py-6 md:py-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-[22px] md:text-[30px] font-bold tracking-[-0.02em]">Laporan Masuk</h1>
              <p className="text-[12px] md:text-[13px] text-[#525252] mt-1">Manajemen aspirasi mahasiswa secara real-time. <span className="hidden md:inline">Total <b className="text-[#1a1c1c]">{total}</b> laporan</span></p>
              <p className="md:hidden text-[12px] text-[#525252]">Manajemen aspirasi masuk. Total {total} laporan</p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button onClick={exportCSV} className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-white border border-[#E5E5E5] text-[12px] font-semibold"><FileSpreadsheet className="w-4 h-4" /> Export CSV</button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button onClick={()=>onTab("semua")} className={`shrink-0 h-8 px-4 rounded-full text-[12px] font-semibold border ${activeTab==="semua"?"bg-black text-white border-black":"bg-white text-[#525252] border-[#E5E5E5]"}`}>Semua</button>
              <button onClick={()=>onTab("baru")} className={`shrink-0 h-8 px-4 rounded-full text-[12px] font-semibold border inline-flex items-center gap-1.5 ${activeTab==="baru"?"bg-black text-white border-black":"bg-white text-[#525252] border-[#E5E5E5]"}`}><span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] hidden md:inline-block" />Perlu Tindakan</button>
              <button onClick={()=>onTab("selesai")} className={`shrink-0 h-8 px-4 rounded-full text-[12px] font-semibold border ${activeTab==="selesai"?"bg-black text-white border-black":"bg-white text-[#525252] border-[#E5E5E5]"}`}>Selesai</button>
            </div>
            <div className="flex items-center gap-2 flex-1 md:flex-none">
              <div className="relative flex-1 md:w-[320px]">
                <Search className="w-4 h-4 text-[#7e7576] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input value={filters.search||""} onChange={e=>onSearch(e.target.value)} placeholder="Cari laporan..." className="w-full h-9 pl-10 pr-3 rounded-full bg-white border border-[#E5E5E5] text-[13px] placeholder:text-[#7e7576] focus:outline-none focus:border-black focus:ring-1 focus:ring-black" />
              </div>
              <button onClick={()=>setShowFilters(!showFilters)} className={`w-9 h-9 rounded-full grid place-items-center border shrink-0 ${showFilters?"bg-black text-white border-black":"bg-white border-[#E5E5E5] text-[#1a1c1c]"}`}><SlidersHorizontal className="w-4 h-4" /></button>
              <button onClick={exportCSV} className="md:hidden w-9 h-9 rounded-full bg-white border border-[#E5E5E5] grid place-items-center shrink-0"><FileSpreadsheet className="w-4 h-4" /></button>
            </div>
          </div>

          {showFilters && (
            <div className="rounded-[16px] bg-white border border-[#E5E5E5] p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5"><label className="label-sm text-[#525252]">STATUS</label><select value={filters.status||""} onChange={e=>onFilter("status",e.target.value)} className="w-full h-10 px-3 rounded-[12px] bg-[#f3f3f3] border border-[#E5E5E5] text-[13px]"><option value="">Semua</option><option value="baru">Baru</option><option value="diproses">Diproses</option><option value="selesai">Selesai</option><option value="ditolak">Ditolak</option></select></div>
              <div className="space-y-1.5"><label className="label-sm text-[#525252]">JENIS</label><select value={filters.type||""} onChange={e=>onFilter("type",e.target.value)} className="w-full h-10 px-3 rounded-[12px] bg-[#f3f3f3] border border-[#E5E5E5] text-[13px]"><option value="">Semua</option><option value="keluhan">Keluhan</option><option value="kritik">Kritik</option><option value="saran">Saran</option></select></div>
              <div className="space-y-1.5"><label className="label-sm text-[#525252]">TARGET</label><select value={filters.target||""} onChange={e=>onFilter("target",e.target.value)} className="w-full h-10 px-3 rounded-[12px] bg-[#f3f3f3] border border-[#E5E5E5] text-[13px]"><option value="">Semua</option><option value="jurusan">Jurusan</option><option value="himpunan">Himpunan</option></select></div>
            </div>
          )}

          <div className="hidden md:block rounded-[16px] bg-white border border-[#E5E5E5] overflow-hidden">
            {loading && !data ? (
              <div className="p-12 flex flex-col items-center gap-3"><Loader2 className="w-6 h-6 animate-spin" /><p className="text-[12px] text-[#525252]">Memuat laporan...</p></div>
            ) : data?.data.length===0 ? (
              <div className="p-12 text-center"><p className="text-[14px] font-semibold">Tidak ada laporan</p><p className="text-[12px] text-[#525252]">Coba ubah filter.</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead><tr className="bg-[#f3f3f3] label-sm text-[#525252] border-b border-[#E5E5E5]"><th className="py-3 px-5 font-semibold">LAPORAN</th><th className="py-3 px-5 font-semibold">KATEGORI</th><th className="py-3 px-5 font-semibold">STATUS</th><th className="py-3 px-5 font-semibold">TANGGAL</th><th className="py-3 px-5 font-semibold text-right">AKSI</th></tr></thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {data?.data.map(r=>(
                      <tr key={r.id} className="hover:bg-[#f9f9f9]">
                        <td className="py-4 px-5 max-w-[420px]">
                          <p className="text-[13px] font-semibold leading-snug line-clamp-1">{r.title}</p>
                          <p className="text-[12px] leading-relaxed text-[#525252] line-clamp-1 mt-1">{r.description}</p>
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className="label-sm text-[10px] px-2 py-1 rounded-full bg-[#f3f3f3] border border-[#E5E5E5] capitalize">{r.type}</span>
                            <span className="label-sm text-[10px] px-2 py-1 rounded-full bg-white border border-[#E5E5E5] capitalize">{r.target}</span>
                            {r.attachments?.length ? <span className="inline-flex items-center gap-1 text-[11px] text-[#525252]"><Paperclip className="w-3 h-3" />{r.attachments.length}</span>:null}
                          </div>
                        </td>
                        <td className="py-4 px-5 align-middle"><span className="label-sm px-3 py-1.5 rounded-full bg-[#f3f3f3] border border-[#E5E5E5]">{r.category}</span></td>
                        <td className="py-4 px-5 align-middle"><Pill s={r.status} /></td>
                        <td className="py-4 px-5 align-middle text-[12px] text-[#525252] whitespace-nowrap">{new Date(r.created_at).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"})}<br/><span className="text-[11px] text-[#7e7576]">{new Date(r.created_at).toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})}</span></td>
                        <td className="py-4 px-5 align-middle text-right"><Link to={`/admin/laporan/${r.id}`} className="inline-flex items-center gap-1.5 px-4 h-8 rounded-full bg-black text-white text-[12px] font-semibold"><Eye className="w-3.5 h-3.5" /> Kelola</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {data && data.total_pages>1 && (
              <div className="p-3 border-t border-[#E5E5E5] flex items-center justify-between text-[12px] text-[#525252]">
                <span>Menampilkan {((filters.page??1)-1)*(filters.per_page??10)+1}–{Math.min((filters.page??1)*(filters.per_page??10),data.total)} dari {data.total}</span>
                <div className="flex items-center gap-2">
                  <button disabled={filters.page===1} onClick={()=>setFilters(f=>({...f,page:(f.page??1)-1}))} className="px-3 py-1.5 rounded-full bg-white border border-[#E5E5E5] disabled:opacity-40">Prev</button>
                  <span className="px-3 py-1 rounded-full bg-black text-white font-semibold">{filters.page}</span>
                  <button disabled={filters.page===data.total_pages} onClick={()=>setFilters(f=>({...f,page:(f.page??1)+1}))} className="px-3 py-1.5 rounded-full bg-white border border-[#E5E5E5] disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </div>

          <div className="md:hidden space-y-3">
            {loading && !data ? <div className="py-10 flex justify-center"><Loader2 className="w-5 h-5 animate-spin" /></div>
            : data?.data.length===0 ? <div className="rounded-[16px] bg-white border border-[#E5E5E5] p-8 text-center"><p className="text-[13px] font-semibold">Tidak ada laporan</p><p className="text-[12px] text-[#525252]">Coba ubah filter.</p></div>
            : data?.data.map(r=>(
              <div key={r.id} className="rounded-[16px] bg-white border border-[#E5E5E5] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Pill s={r.status} />
                  <span className="text-[11px] text-[#525252]">{new Date(r.created_at).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"})} · {new Date(r.created_at).toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})}</span>
                </div>
                <h3 className="text-[13px] font-bold leading-snug line-clamp-2">{r.title}</h3>
                <p className="text-[12px] leading-[1.5] text-[#525252] line-clamp-2">{r.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-[#E5E5E5]">
                  <div className="flex items-center gap-1.5">
                    <span className="label-sm px-2.5 py-1 rounded-full bg-[#f3f3f3] border border-[#E5E5E5] text-[10px]">{r.category}</span>
                    {r.attachments?.length ? <span className="inline-flex items-center gap-1 text-[11px] text-[#525252]"><Paperclip className="w-3.5 h-3.5" />{r.attachments.length}</span>:null}
                  </div>
                  <Link to={`/admin/laporan/${r.id}`} className="inline-flex items-center gap-1 text-[12px] font-semibold text-black">Kelola <Eye className="w-3.5 h-3.5" /></Link>
                </div>
              </div>
            ))}
            {data && data.total_pages>1 && (
              <div className="flex items-center justify-between pt-2 text-[12px] text-[#525252]">
                <span>{data.page} / {data.total_pages}</span>
                <div className="flex gap-2">
                  <button disabled={filters.page===1} onClick={()=>setFilters(f=>({...f,page:(f.page??1)-1}))} className="px-4 h-9 rounded-full bg-white border border-[#E5E5E5] disabled:opacity-40">Prev</button>
                  <button disabled={filters.page===data.total_pages} onClick={()=>setFilters(f=>({...f,page:(f.page??1)+1}))} className="px-4 h-9 rounded-full bg-black text-white disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center justify-between rounded-[12px] bg-white border border-[#E5E5E5] px-4 py-3 text-[12px] text-[#525252]">
            <span className="inline-flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Bot Telegram: /laporan_hari_ini /statistik · Whitelist admin aktif</span>
            <span>Menampilkan {data?.total??0} laporan</span>
          </div>
        </div>
      </div>
    </div>
  )
}
