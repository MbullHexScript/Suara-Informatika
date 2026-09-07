import { Link } from "react-router-dom"
import { motion, useReducedMotion } from "framer-motion"
import { ShieldCheck, Bell, Layers3, ArrowRight, CheckCircle2 } from "lucide-react"

export default function Home(){
  const reduce = useReducedMotion()

  return (
    <div className="bg-transparent">
      <section className="container-wide pt-8 md:pt-12 pb-8 md:pb-10">
        <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center">
          <div className="space-y-5 md:space-y-6">

            <motion.h1
              initial={reduce?false:{y:16,opacity:0}} animate={{y:0,opacity:1}} transition={{type:"spring",bounce:0,duration:0.55}}
              className="font-[800] leading-[1.05] text-[30px] md:text-[48px] will-change-transform" style={{ letterSpacing: "-0.02em", lineHeight: 1.05 } as any}
            >
              Sampaikan Aspirasi Anda<br/>Secara <span className="font-[800]">Anonim & Aman</span>
            </motion.h1>

            <motion.p initial={reduce?false:{y:8,opacity:0}} animate={{y:0,opacity:1}} transition={{type:"spring",bounce:0,duration:0.5,delay:0.08}} className="text-[16px] leading-[1.6] text-[#525252] max-w-[520px] will-change-transform">
              Wadah resmi penyampaian keluhan, kritik, dan saran untuk jurusan dan himpunan Informatika. Bebas tanpa login, tanpa identitas.
            </motion.p>

            <motion.div initial={reduce?false:{y:8,opacity:0}} animate={{y:0,opacity:1}} transition={{type:"spring",bounce:0,duration:0.5,delay:0.14}} className="flex flex-wrap gap-3 pt-1 will-change-transform">
              <Link to="/laporan" onPointerDown={(e)=>(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)} className="pressable inline-flex h-[44px] px-6 rounded-full bg-black text-white text-[12px] font-semibold tracking-[0.04em] uppercase items-center gap-2 will-change-transform">
                Buat Laporan Sekarang <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/lacak" onPointerDown={(e)=>(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)} className="pressable inline-flex h-[44px] px-6 rounded-full glass text-[#1a1c1c] text-[12px] font-semibold tracking-[0.04em] uppercase items-center justify-center will-change-transform">
                Lacak Status
              </Link>
            </motion.div>

            <motion.div initial={reduce?false:{y:8,opacity:0}} animate={{y:0,opacity:1}} transition={{type:"spring",bounce:0,duration:0.5,delay:0.18}} className="flex items-stretch gap-6 pt-4 border-t border-black/[0.08] mt-2 will-change-transform">
              <div>
                <p className="text-[20px] font-[700] leading-none" style={{ letterSpacing: "-0.01em" }}>24/7</p>
                <p className="label-sm text-[#525252] mt-1">Akses Sistem</p>
              </div>
              <div className="w-px bg-black/[0.08]" />
              <div>
                <p className="text-[20px] font-[700] leading-none" style={{ letterSpacing: "-0.01em" }}>100%</p>
                <p className="label-sm text-[#525252] mt-1">Anonimitas</p>
              </div>
            </motion.div>
          </div>

          <motion.div initial={reduce?false:{y:24,opacity:0}} animate={{y:0,opacity:1}} transition={{type:"spring",bounce:0,duration:0.6,delay:0.12}} className="relative h-[280px] md:h-[420px] hidden md:block will-change-transform">
            <div className="absolute inset-0 rounded-[16px] overflow-hidden border border-white/40 bg-[#1a1c1c] shadow-[0_20px_60px_rgba(0,0,0,0.18)] will-change-transform" style={{ transform:"perspective(1200px) rotateY(-6deg) rotateX(2deg) rotateZ(0.6deg)" }}>
              <img src="/foto-hero.jpg" alt="" className="w-full h-full object-cover opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute top-3 left-3 right-3 flex items-center gap-1.5 opacity-60">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#28c940]" />
                <span className="ml-3 text-[10px] text-white/70 hidden md:inline">suara informatika</span>
              </div>
              <div className="absolute inset-x-0 top-0 h-px bg-white/30" />
            </div>
            <motion.div initial={reduce?false:{scale:0.96,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:"spring",bounce:0.18,duration:0.5,delay:0.34}} className="absolute -bottom-2 -left-4 glass-card rounded-[12px] px-4 py-3 flex items-center gap-3 will-change-transform">
              <span className="w-8 h-8 rounded-full bg-white border border-black/[0.06] grid place-items-center"><CheckCircle2 className="w-4 h-4" /></span>
              <div>
                <p className="text-[12px] font-semibold leading-none">Laporan Diterima</p>
                <p className="text-[11px] text-[#525252]">Baru saja</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div initial={reduce?false:{y:16,opacity:0}} animate={{y:0,opacity:1}} transition={{type:"spring",bounce:0,duration:0.5,delay:0.2}} className="md:hidden rounded-[16px] overflow-hidden border border-white/40 relative h-[220px] shadow-[0_12px_32px_rgba(0,0,0,0.10)] will-change-transform">
            <img src="/foto-hero.jpg" alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 glass-pill px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-black" />
              <span className="label-sm text-[10px]">PLATFORM ASPIRASI TERENKRIPSI</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-10 md:py-14 overflow-hidden bg-transparent border-t border-black/[0.06]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full blur-[90px] opacity-[0.07]" style={{ background: "radial-gradient(circle at 40% 40%, #0A84FF 0%, transparent 70%)" }} />
          <div className="absolute -bottom-40 -right-32 w-[640px] h-[640px] rounded-full blur-[100px] opacity-[0.06]" style={{ background: "radial-gradient(circle at 60% 40%, #1a1c1c 0%, transparent 70%)" }} />
          <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "radial-gradient(rgba(0,0,0,0.8) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
        </div>
        <div className="container-wide relative">
          <div className="text-center max-w-[640px] mx-auto mb-10 md:mb-12">
            <h2 className="text-[24px] md:text-[32px] font-[700]" style={{ letterSpacing: "-0.02em", lineHeight: 1.2 }}>Kenapa Menggunakan Website ini?</h2>
            <p className="text-[14px] leading-[1.6] text-[#525252] mt-3">Dirancang khusus untuk memastikan kenyamanan dan keamanan mahasiswa dalam beraspirasi.</p>
          </div>

          <motion.div initial={reduce?false:{opacity:0}} whileInView={{opacity:1}} viewport={{once:true,amount:0.2}} transition={{duration:0.4}} className="feat-grid grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 max-w-[1100px] mx-auto items-stretch">
            {[
              {Icon:ShieldCheck, c:"text-[#ff5f57]", t:"Privasi Terjamin", d:"Tidak ada data pribadi (NIM, email, IP Address) yang disimpan. Identitas Anda 100% aman dan tidak dapat dilacak."},
              {Icon:Bell, c:"text-[#ffbd2e]", t:"Notifikasi Langsung", d:"Setiap laporan yang masuk akan secara otomatis dikirimkan ke grup Telegram admin terkait untuk respon cepat."},
              {Icon:Layers3, c:"text-[#28c940]", t:"Penanganan Terstruktur", d:"Lacak progres laporan Anda secara transparan. Admin akan memperbarui status secara berkala (Diproses / Selesai)."},
            ].map((f,i)=>(
              <motion.div key={f.t} initial={reduce?false:{y:18,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true,amount:0.2}} transition={{type:"spring",bounce:0,duration:0.45,delay:i*0.06}} whileHover={reduce?undefined:{y:-2}} className="glass-feature rounded-[16px] p-6 flex flex-col will-change-transform pressable" style={{ transition: "transform 220ms ease" } as any}>
                <f.Icon className={`w-7 h-7 ${f.c}`} />
                <h3 className="text-[15px] font-semibold mt-3" style={{ letterSpacing: "-0.01em" }}>{f.t}</h3>
                <p className="text-[13px] leading-[1.6] text-[#525252] mt-2">{f.d}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-transparent py-10 md:py-14 border-t border-black/[0.06]">
        <div className="container-wide">
          <div className="glass-card rounded-[16px] px-6 md:px-10 py-10 md:py-12 text-center space-y-4 max-w-[760px] mx-auto">
            <h2 className="text-[24px] md:text-[32px] font-[700]" style={{ letterSpacing: "-0.02em", lineHeight: 1.1 }}>Suara Anda Berharga</h2>
            <p className="text-[14px] leading-[1.6] text-[#525252] max-w-[600px] mx-auto">Bantu kami membangun lingkungan akademik yang lebih baik. Satu laporan dari Anda bisa membawa perubahan besar.</p>
            <Link to="/laporan" className="inline-flex h-[48px] px-8 rounded-full bg-black text-white text-[12px] font-semibold tracking-[0.05em] uppercase items-center active:scale-[0.97] will-change-transform mt-2" style={{ transition: "transform 100ms ease-out" }}>
              Buat Laporan Sekarang
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
