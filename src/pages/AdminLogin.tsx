import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function AdminLogin(){
  const nav=useNavigate()
  const [err,setErr]=useState("")
  const [show,setShow]=useState(false)
  const [loading,setLoading]=useState(false)
  const onSubmit=async(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault(); setErr(""); setLoading(true)
    const fd=new FormData(e.currentTarget)
    const email=String(fd.get("email")||""), password=String(fd.get("password")||"")
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if(error){ setErr(error.message); return }
    toast.success("Masuk berhasil")
    nav("/admin",{replace:true})
  }
  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] flex flex-col">
      <header className="p-4"><Link to="/" className="inline-flex items-center gap-2 label-sm px-4 h-9 rounded-full bg-white border border-[#E5E5E5]"><ArrowLeft className="w-4 h-4" /> Kembali</Link></header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[400px] rounded-[16px] bg-white border border-[#E5E5E5] shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-6 md:p-7 space-y-6">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-[12px] bg-black grid place-items-center text-white text-[12px] font-extrabold">SI</div>
            <h1 className="text-[22px] font-[800] tracking-[-0.02em]">Masuk admin</h1>
            <p className="text-[13px] leading-[1.6] text-[#525252]">Kelola laporan anonim mahasiswa.</p>
          </div>
          {err && <div className="rounded-[12px] bg-[#ffdad6] text-[#ba1a1a] text-[12px] flex items-center gap-2 px-3.5 py-3 border border-[#ffdad6]"><AlertCircle className="w-4 h-4 shrink-0" /><span>{err}</span></div>}
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="label-sm text-[#525252]">EMAIL</label>
              <input name="email" type="email" autoComplete="email" placeholder="admin@informatika.ac.id" required className="w-full h-11 px-4 rounded-[12px] bg-white border border-[#E5E5E5] text-[13px] placeholder:text-[#7e7576] focus:outline-none focus:border-black focus:ring-1 focus:ring-black" />
            </div>
            <div className="space-y-1.5">
              <label className="label-sm text-[#525252]">PASSWORD</label>
              <input name="password" type={show?"text":"password"} autoComplete="current-password" placeholder="••••••••" required className="w-full h-11 px-4 rounded-[12px] bg-white border border-[#E5E5E5] text-[13px] placeholder:text-[#7e7576] focus:outline-none focus:border-black focus:ring-1 focus:ring-black" />
              <button type="button" onClick={()=>setShow(v=>!v)} className="label-sm text-black underline decoration-[#E5E5E5] underline-offset-2">{show?"Sembunyikan":"Lihat password"}</button>
            </div>
            <button type="submit" disabled={loading} className="w-full h-11 rounded-full bg-black text-white text-[12px] font-semibold tracking-[0.04em] uppercase disabled:opacity-40 flex items-center justify-center gap-2 hover:opacity-90 transition">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Masuk...</> : "Masuk ke dashboard"}
            </button>
          </form>
        </div>
      </main>
      <footer className="p-4 text-center label-sm text-[#7e7576]">© 2026 Suara Informatika</footer>
    </div>
  )
}
