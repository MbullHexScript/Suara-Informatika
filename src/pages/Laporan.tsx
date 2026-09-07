import { useState } from "react"
import { Upload, X, CheckCircle2, Copy, Shield, Image as ImgIcon, Loader2, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import type { ReportType, ReportTarget } from "@/types"

const CATS = ["Akademik","Fasilitas","Dosen/Pengajaran","Administrasi","Kegiatan Kemahasiswaan","Himpunan","Lainnya"] as const

export default function Laporan(){
  const [type,setType]=useState<ReportType>("keluhan")
  const [target,setTarget]=useState<ReportTarget>("jurusan")
  const [category,setCategory]=useState("")
  const [title,setTitle]=useState("")
  const [desc,setDesc]=useState("")
  const [files,setFiles]=useState<File[]>([])
  const [previews,setPreviews]=useState<string[]>([])
  const [loading,setLoading]=useState(false)
  const [ticket,setTicket]=useState<string|null>(null)
  const [honey,setHoney]=useState("")
  const [dragOver,setDragOver]=useState(false)

  const onFiles=(list: FileList | File[] | null)=>{
    if(!list) return
    const arr = Array.from(list as unknown as FileList).slice(0, 5 - files.length) as File[]
    const ok: File[]=[]; const warns:string[]=[]
    for(const f of arr){
      if(!["image/jpeg","image/png","image/webp"].includes(f.type)) warns.push(`${f.name}: hanya JPG/PNG/WebP`)
      else if(f.size>5*1024*1024) warns.push(`${f.name}: >5MB`)
      else ok.push(f)
    }
    if(warns.length) toast.error(warns.join("\n"))
    if(!ok.length) return
    setFiles(p=>[...p,...ok])
    ok.forEach(f=>{ const r=new FileReader(); r.onload=()=> setPreviews(p=>[...p, r.result as string]); r.readAsDataURL(f) })
  }
  const removeAt=(i:number)=>{ setFiles(f=>f.filter((_,k)=>k!==i)); setPreviews(p=>p.filter((_,k)=>k!==i)) }

  const submit=async(e:React.FormEvent)=>{
    e.preventDefault()
    if(!title.trim()||title.length>100) return toast.error("Judul wajib 1–100 karakter")
    if(!desc.trim()||desc.length>2000) return toast.error("Deskripsi wajib 1–2000 karakter")
    if(!category) return toast.error("Pilih kategori")
    setLoading(true)
    try{
      const urls:string[]=[]
      for(const f of files){
        const fd=new FormData(); fd.append("file", f)
        const r=await fetch("/api/upload",{method:"POST", body:fd})
        if(!r.ok){ const j=await r.json().catch(()=>({error:"Upload gagal"})); throw new Error(j.error||"Upload gagal")}
        const j=await r.json(); urls.push(j.url)
      }
      const res=await fetch("/api/reports",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ type,target,category,title,description:desc, attachments:urls, honeypot:honey })})
      const j=await res.json()
      if(!res.ok) throw new Error(j.error||"Gagal kirim")
      if(j.success && !j.id){ toast.success("Laporan diterima"); setTitle(""); setDesc(""); setCategory(""); setFiles([]); setPreviews([]); return }
      setTicket(j.id)
      toast.success("Laporan terkirim")
    }catch(err){ toast.error(err instanceof Error?err.message:"Gagal kirim") }
    finally{ setLoading(false) }
  }

  if(ticket){
    return (
      <div className="bg-[#f9f9f9] min-h-[60vh] pb-20 md:pb-0">
        <div className="container-wide py-10">
          <div className="max-w-[640px] mx-auto">
            <div className="glass-card rounded-[16px] p-8 md:p-10 text-center space-y-5 will-change-transform">
              <div className="w-14 h-14 rounded-full glass-pill grid place-items-center mx-auto"><CheckCircle2 className="w-7 h-7" /></div>
              <div className="space-y-2">
                <h1 className="text-[22px] font-bold" style={{ letterSpacing:"-0.02em" }}>Laporan terkirim</h1>
                <p className="text-[13px] leading-[1.6] text-[#525252]">Simpan nomor tiket ini — satu-satunya cara melacak status tanpa membuka identitasmu.</p>
              </div>
              <div className="rounded-[12px] bg-white/80 border border-black/[0.06] p-4 flex items-center gap-3 text-left backdrop-blur">
                <span className="flex-1 font-mono text-[12px] break-all">{ticket}</span>
                <button onClick={async()=>{ await navigator.clipboard.writeText(ticket); toast.success("Tiket disalin")}} className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-black text-white text-[11px] font-semibold active:scale-[0.97] will-change-transform" style={{ transition:"transform 100ms ease-out" }}>Salin <Copy className="w-3.5 h-3.5" /></button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <a href={`/lacak/${ticket}`} className="h-10 px-5 rounded-full bg-black text-white text-[12px] font-semibold tracking-[0.04em] uppercase grid place-items-center active:scale-[0.97] will-change-transform" style={{ transition:"transform 100ms ease-out" }}>Lacak status</a>
                <button onClick={()=>setTicket(null)} className="h-10 px-5 rounded-full glass-pill text-[12px] font-semibold active:scale-[0.97] will-change-transform" style={{ transition:"transform 100ms ease-out" }}>Kirim lagi</button>
              </div>
              <p className="text-[11px] text-[#525252] inline-flex items-center gap-1.5 justify-center"><Shield className="w-3.5 h-3.5" /> Anonim penuh</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#f9f9f9] pb-20 md:pb-0">
      <div className="container-wide py-6 md:py-10">
        <div className="grid md:grid-cols-[420px_1fr] gap-8 md:gap-10 items-start">
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-[28px] md:text-[40px] font-[800] leading-[1.05]" style={{ letterSpacing:"-0.02em" }}>Buat Laporan Baru</h1>
              <p className="text-[14px] leading-[1.6] text-[#525252]">Suara Anda membangun lingkungan yang lebih baik. Sampaikan keluhan, kritik, atau saran Anda secara langsung dan aman.</p>
            </div>

            <div className="hidden md:block rounded-[16px] overflow-hidden border border-white/40 bg-[#1a1c1c] relative h-[240px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] will-change-transform">
              <img src="/foto-hero.jpg" alt="" className="w-full h-full object-cover opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute inset-x-0 top-0 h-px bg-white/30" />
              <div className="absolute bottom-3 left-3 glass-pill inline-flex items-center gap-2 px-3 py-1.5">
                <Shield className="w-3.5 h-3.5" /> <span className="label-sm text-[10px]">AMAN & TERENKRIPSI</span>
              </div>
            </div>

            <div className="hidden md:grid grid-cols-2 gap-3">
              <div className="glass-card rounded-[12px] p-4 will-change-transform">
                <p className="text-[22px] font-[800] leading-none" style={{ letterSpacing:"-0.01em" }}>24j</p><p className="label-sm text-[#525252] mt-1">RATA-RATA RESPON</p>
              </div>
              <div className="glass-card rounded-[12px] p-4 will-change-transform">
                <p className="text-[22px] font-[800] leading-none" style={{ letterSpacing:"-0.01em" }}>100%</p><p className="label-sm text-[#525252] mt-1">KERAHASIAAN</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[16px] p-5 md:p-7 will-change-transform">
            <form onSubmit={submit} className="space-y-7">
              <input value={honey} onChange={e=>setHoney(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />

              <div className="space-y-3">
                <div className="flex items-center gap-2 label-sm text-[#1a1c1c]"><span className="h-px w-6 bg-[#1a1c1c]" /> 01. JENIS LAPORAN</div>
                <div className="grid grid-cols-3 gap-2 p-1.5 rounded-[12px] glass-pill">
                  {(["keluhan","kritik","saran"] as ReportType[]).map(v=>(
                    <button key={v} type="button" onClick={()=>setType(v)} className={`h-10 rounded-[10px] text-[13px] font-semibold capitalize will-change-transform active:scale-[0.97] ${type===v?"bg-black text-white shadow-sm":"text-[#525252] hover:bg-white/60"}`} style={{ transition:"transform 100ms ease-out, background 160ms ease" }}>{v}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 label-sm"><span className="h-px w-6 bg-[#1a1c1c]" /> 02. TARGET TUJUAN</div>
                <div className="grid grid-cols-2 gap-2 p-1.5 rounded-[12px] glass-pill">
                  {(["jurusan","himpunan"] as ReportTarget[]).map(v=>(
                    <button key={v} type="button" onClick={()=>setTarget(v)} className={`h-10 rounded-[10px] text-[13px] font-semibold capitalize will-change-transform active:scale-[0.97] ${target===v?"bg-white text-black shadow border border-black/[0.06]":"text-[#525252] hover:bg-white/60"}`} style={{ transition:"transform 100ms ease-out" }}>{v==="jurusan"?"Jurusan Informatika":"Himpunan (HMJ)"}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 label-sm"><span className="h-px w-6 bg-[#1a1c1c]" /> 03. DETAIL LAPORAN</div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="label-sm text-[#525252]">KATEGORI LAPORAN</label>
                    <div className="relative">
                      <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full h-12 px-4 pr-10 rounded-[12px] bg-white/80 border border-black/[0.08] text-[14px] appearance-none focus:outline-none focus:border-[#0A84FF] focus:ring-2 focus:ring-[#0A84FF]/20 backdrop-blur">
                        <option value="">Pilih Kategori...</option>
                        {CATS.map(c=> <option key={c} value={c}>{c}</option>)}
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#525252]">⌄</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between"><label className="label-sm text-[#525252]">JUDUL LAPORAN</label><span className="text-[11px] text-[#7e7576]">{title.length} / 100</span></div>
                    <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Misal: AC Ruang A1.2 Rusak" maxLength={100} className="w-full h-12 px-4 rounded-[12px] bg-white/80 border border-black/[0.08] text-[14px] placeholder:text-[#7e7576] focus:outline-none focus:border-[#0A84FF] focus:ring-2 focus:ring-[#0A84FF]/20 backdrop-blur" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between"><label className="label-sm text-[#525252]">PENJELASAN DETAIL</label><span className="text-[11px] text-[#7e7576]">{desc.length} / 2000</span></div>
                    <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Ceritakan detail keluhan, kritik, atau saran Anda di sini..." maxLength={2000} rows={5} className="w-full min-h-[120px] p-4 rounded-[12px] bg-white/80 border border-black/[0.08] text-[14px] leading-[1.6] placeholder:text-[#7e7576] focus:outline-none focus:border-[#0A84FF] focus:ring-2 focus:ring-[#0A84FF]/20 backdrop-blur" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 label-sm"><span className="h-px w-6 bg-[#1a1c1c]" /> 04. LAMPIRAN (OPSIONAL)</div>
                <label
                  onDragOver={e=>{e.preventDefault(); setDragOver(true)}}
                  onDragLeave={()=>setDragOver(false)}
                  onDrop={e=>{e.preventDefault(); setDragOver(false); onFiles(e.dataTransfer.files)}}
                  className={`flex flex-col items-center justify-center gap-2 rounded-[12px] border-2 border-dashed px-4 py-8 cursor-pointer will-change-transform active:scale-[0.99] ${dragOver?"bg-[#0A84FF]/[0.06] border-[#0A84FF]":"bg-white/60 border-black/[0.08] hover:bg-white/80"}`} style={{ transition:"transform 100ms ease-out, background 160ms ease, border-color 160ms ease" }}>
                  <span className="w-10 h-10 rounded-full glass-pill grid place-items-center"><Upload className="w-4 h-4" /></span>
                  <span className="text-[14px] font-semibold">Tarik & Lepas foto di sini</span>
                  <span className="text-[12px] text-[#525252]">Atau klik untuk memilih file (Maks 5MB)</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={e=>onFiles(e.target.files)} />
                </label>
                {previews.length>0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {previews.map((src,i)=>(
                      <div key={i} className="relative group rounded-[12px] overflow-hidden border border-black/[0.06] bg-white will-change-transform">
                        <img src={src} alt="" className="w-full h-24 object-cover" />
                        <button type="button" onClick={()=>removeAt(i)} className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/70 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition will-change-transform active:scale-[0.96]"><X className="w-3.5 h-3.5" /></button>
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-medium inline-flex items-center gap-1 backdrop-blur"><ImgIcon className="w-3 h-3" /> {i+1}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="hidden md:flex items-center gap-2 glass-pill p-3">
                  <span className="w-8 h-8 rounded-full bg-white border border-black/[0.06] grid place-items-center"><Shield className="w-4 h-4" /></span>
                  <p className="text-[11px] leading-[1.5] text-[#525252]"><b className="text-[#1a1c1c]">Anonimitas Dijaga</b> — Identitas hanya diketahui admin verifikasi.</p>
                </div>
              </div>

              <div className="pt-2 border-t border-black/[0.06] flex justify-end">
                <button type="submit" disabled={loading} className="inline-flex items-center gap-2 h-11 px-7 rounded-full bg-black text-white text-[12px] font-semibold tracking-[0.04em] uppercase disabled:opacity-40 will-change-transform active:scale-[0.97]" style={{ transition:"transform 100ms ease-out" }}>
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</> : <>Kirim Laporan <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
