import { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Upload, X, CheckCircle2, Copy, Shield, Image as ImgIcon, Loader2, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import type { ReportType, ReportTarget } from "@/types"

const CATS = ["Akademik","Fasilitas","Dosen/Pengajaran","Administrasi","Himpunan","UKT (Uang Kuliah Tunggal)","Lainnya"] as const

export default function Laporan(){
  const reduce = useReducedMotion()
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
      <div className="bg-transparent min-h-[60vh]">
        <div className="container-wide py-10">
          <div className="max-w-[640px] mx-auto">
            <motion.div initial={reduce?false:{y:8,opacity:0}} animate={{y:0,opacity:1}} transition={{type:"spring",bounce:0,duration:0.35}} className="glass-card rounded-[16px] p-8 md:p-10 text-center space-y-5 will-change-transform">
              <div className="w-14 h-14 rounded-full glass-pill grid place-items-center mx-auto"><CheckCircle2 className="w-7 h-7 text-white" /></div>
              <div className="space-y-2">
                <h1 className="text-[22px] font-bold text-white" style={{ letterSpacing:"-0.02em" }}>Laporan terkirim — terima kasih</h1>
                <p className="text-[13px] leading-[1.6] text-white/60">Simpan nomor tiket ini ya. Ini satu-satunya cara kamu bisa cek kabarnya nanti, tanpa membuka identitasmu.</p>
              </div>
              <div className="rounded-[12px] bg-white/[0.08] border border-white/[0.12] p-4 flex items-center gap-3 text-left backdrop-blur">
                <span className="flex-1 font-mono text-[12px] break-all text-white">{ticket}</span>
                <button onPointerDown={(e)=>(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)} onClick={async()=>{ await navigator.clipboard.writeText(ticket); toast.success("Tiket disalin")}} className="pressable shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-white text-black text-[11px] font-semibold will-change-transform">Salin <Copy className="w-3.5 h-3.5" /></button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <a href={`/lacak/${ticket}`} onPointerDown={(e)=>(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)} className="pressable h-10 px-5 rounded-full bg-white text-black text-[12px] font-semibold tracking-[0.04em] uppercase grid place-items-center will-change-transform">Lacak status</a>
                <button onPointerDown={(e)=>(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)} onClick={()=>setTicket(null)} className="pressable h-10 px-5 rounded-full glass-pill text-[12px] font-semibold will-change-transform text-white">Kirim lagi</button>
              </div>
              <p className="text-[11px] text-white/50 inline-flex items-center gap-1.5 justify-center"><Shield className="w-3.5 h-3.5" /> Anonim penuh — kami jaga rahasiamu</p>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-transparent">
      <div className="container-wide py-6 md:py-10">
        <div className="max-w-[640px] mx-auto space-y-6">
          <motion.div initial={reduce?false:{y:16,opacity:0}} animate={{y:0,opacity:1}} transition={{type:"spring",bounce:0,duration:0.5}} className="glass-card rounded-[16px] p-5 md:p-7 will-change-transform">
            <form onSubmit={submit} className="space-y-7">
              <input value={honey} onChange={e=>setHoney(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />

              <motion.div initial={reduce?false:{y:8,opacity:0}} animate={{y:0,opacity:1}} transition={{type:"spring",bounce:0,duration:0.35,delay:0.04}} className="space-y-3 will-change-transform">
                <div className="flex items-center gap-2 label-sm text-white">01. JENIS LAPORAN</div>
                <div className="grid grid-cols-3 gap-2 p-1.5 rounded-[12px] glass-pill">
                  {(["keluhan","kritik","saran"] as ReportType[]).map(v=>(
                    <button key={v} type="button" onClick={()=>setType(v)} onPointerDown={(e)=>(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)} className={`pressable h-10 rounded-[10px] text-[13px] font-semibold capitalize will-change-transform ${type===v?"bg-white text-black shadow-sm":"text-white/60 hover:bg-white/10"}`} style={{ transition:"transform 100ms ease-out, background 160ms ease" }}>{v}</button>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={reduce?false:{y:8,opacity:0}} animate={{y:0,opacity:1}} transition={{type:"spring",bounce:0,duration:0.35,delay:0.08}} className="space-y-3 will-change-transform">
                <div className="flex items-center gap-2 label-sm text-white">02. DITUJUKAN KE</div>
                <div className="grid grid-cols-2 gap-2 p-1.5 rounded-[12px] glass-pill">
                  {(["jurusan","himpunan"] as ReportTarget[]).map(v=>(
                    <button key={v} type="button" onClick={()=>setTarget(v)} onPointerDown={(e)=>(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)} className={`pressable h-10 rounded-[10px] text-[13px] font-semibold capitalize will-change-transform ${target===v?"bg-white text-black shadow border border-white/[0.15]":"text-white/60 hover:bg-white/10"}`} style={{ transition:"transform 100ms ease-out" }}>{v==="jurusan"?"Jurusan":"Himpunan"}</button>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={reduce?false:{y:8,opacity:0}} animate={{y:0,opacity:1}} transition={{type:"spring",bounce:0,duration:0.35,delay:0.12}} className="space-y-3 will-change-transform">
                <div className="flex items-center gap-2 label-sm text-white">03. APA YANG MAU KAMU LAPORKAN</div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="label-sm text-white/60">KATEGORI</label>
                    <div className="relative">
                      <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full h-12 px-4 pr-10 rounded-[12px] bg-white/[0.08] border border-white/[0.15] text-[14px] text-white appearance-none focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/10 backdrop-blur">
                        <option value="" className="bg-[#1a1050] text-white">Pilih yang paling dekat...</option>
                        {CATS.map(c=> <option key={c} value={c} className="bg-[#1a1050] text-white">{c}</option>)}
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/50">⌄</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between"><label className="label-sm text-white/60">JUDUL RINGKAS</label><span className="text-[11px] text-white/40">{title.length} / 100</span></div>
                    <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Misal: AC ruang lab sering mati siang hari" maxLength={100} className="w-full h-12 px-4 rounded-[12px] bg-white/[0.08] border border-white/[0.15] text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/10 backdrop-blur" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between"><label className="label-sm text-white/60">CERITA LENGKAP</label><span className="text-[11px] text-white/40">{desc.length} / 2000</span></div>
                    <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Tulis apa adanya — kapan terjadi, di mana, seperti apa dampaknya. Tidak perlu sempurna, yang jujur lebih membantu." maxLength={2000} rows={5} className="w-full min-h-[140px] p-4 rounded-[12px] bg-white/[0.08] border border-white/[0.15] text-[14px] text-white leading-[1.6] placeholder:text-white/30 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/10 backdrop-blur" />
                    <p className="text-[11px] text-white/40">Tips: tuliskan kronologi singkat + harapanmu. Kami baca dengan hati.</p>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={reduce?false:{y:8,opacity:0}} animate={{y:0,opacity:1}} transition={{type:"spring",bounce:0,duration:0.35,delay:0.16}} className="space-y-3 will-change-transform">
                <div className="flex items-center gap-2 label-sm text-white"><span className="h-px w-6 bg-white/40" /> 04. BUKTI FOTO <span className="text-[11px] font-normal normal-case tracking-normal text-white/40">(opsional, bikin lebih kuat)</span></div>
                <label
                  onDragOver={e=>{e.preventDefault(); setDragOver(true)}}
                  onDragLeave={()=>setDragOver(false)}
                  onDrop={e=>{e.preventDefault(); setDragOver(false); onFiles(e.dataTransfer.files)}}
                  className={`flex flex-col items-center justify-center gap-2 rounded-[12px] border-2 border-dashed px-4 py-7 cursor-pointer will-change-transform active:scale-[0.99] ${dragOver?"bg-white/[0.1] border-white/40":"bg-white/[0.04] border-white/[0.15] hover:bg-white/[0.08]"}`} style={{ transition:"transform 100ms ease-out, background 160ms ease, border-color 160ms ease" }}>
                  <span className="w-10 h-10 rounded-full glass-pill grid place-items-center"><Upload className="w-4 h-4 text-white" /></span>
                  <span className="text-[14px] font-semibold text-white">Tarik foto ke sini</span>
                  <span className="text-[12px] text-white/50">Atau klik untuk memilih — JPG/PNG/WebP, maks 5MB, hingga 5 foto</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={e=>onFiles(e.target.files)} />
                </label>
                {previews.length>0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {previews.map((src,i)=>(
                      <div key={i} className="relative group rounded-[12px] overflow-hidden border border-white/[0.12] bg-white/[0.05] will-change-transform">
                        <img src={src} alt="" className="w-full h-24 object-cover" />
                        <button type="button" onClick={()=>removeAt(i)} onPointerDown={(e)=>(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)} className="pressable absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/70 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition will-change-transform"><X className="w-3.5 h-3.5" /></button>
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-medium inline-flex items-center gap-1 backdrop-blur"><ImgIcon className="w-3 h-3" /> {i+1}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 glass-pill p-3">
                  <span className="w-8 h-8 rounded-full bg-white/10 border border-white/[0.15] grid place-items-center shrink-0"><Shield className="w-4 h-4 text-white" /></span>
                  <p className="text-[11px] leading-[1.5] text-white/50"><b className="text-white">Privasimu aman</b> — tidak ada nama, NIM, atau kontak yang kami simpan.</p>
                </div>
              </motion.div>

              <div className="pt-3 border-t border-white/[0.1] flex flex-col gap-3">
                <button type="submit" disabled={loading} onPointerDown={(e)=>(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)} className="pressable inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-white text-black text-[13px] font-semibold tracking-[0.04em] uppercase disabled:opacity-40 will-change-transform w-full md:w-auto md:self-end">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim dengan aman...</> : <>Kirim dengan aman <ArrowRight className="w-4 h-4" /></>}
                </button>
                <p className="text-[11px] text-center md:text-right text-white/40">Dengan mengirim, kamu percaya kami untuk menindaklanjuti dengan bijak.</p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
