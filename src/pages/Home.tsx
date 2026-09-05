import { Link } from "react-router-dom"
import { useReducedMotion } from "framer-motion"
import { ShieldCheck, Bell, Layers3, ArrowRight, CheckCircle2 } from "lucide-react"
import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
gsap.registerPlugin(ScrollTrigger)

export default function Home(){
  const reduce = useReducedMotion()
  const heroRef = useRef<HTMLDivElement>(null)
  useEffect(()=>{
    if(reduce) return
    const ctx=gsap.context(()=>{
      gsap.from(".h-kicker",{y:10,opacity:0,duration:0.4,ease:"power2.out"})
      gsap.from(".h-title",{y:16,opacity:0,duration:0.5,delay:0.08,ease:"power3.out"})
      gsap.from(".h-sub",{y:8,opacity:0,duration:0.4,delay:0.14,ease:"power2.out"})
      gsap.from(".h-cta",{y:8,opacity:0,duration:0.4,delay:0.2,ease:"power2.out"})
      gsap.from(".h-mock",{y:24,opacity:0,rotateY:-6,duration:0.7,delay:0.12,ease:"power3.out"})
      gsap.from(".feat-card",{y:18,opacity:0,duration:0.5,stagger:0.08,scrollTrigger:{trigger:".feat-grid",start:"top 85%"}})
    }, heroRef)
    return ()=>ctx.revert()
  },[reduce])

  return (
    <div ref={heroRef} className="bg-[#f9f9f9] pb-20 md:pb-0">
      <section className="container-wide pt-8 md:pt-12 pb-8 md:pb-10">
        <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center">
          <div className="space-y-5 md:space-y-6">
            <div className="h-kicker inline-flex items-center gap-2 rounded-full bg-white border border-[#E5E5E5] px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-black" />
              <span className="label-sm text-[#1a1c1c]">PLATFORM ASPIRASI RESMI</span>
            </div>

            <h1 className="h-title font-[800] tracking-[-0.02em] leading-[1.05] text-[30px] md:text-[48px]">
              Sampaikan Aspirasi Anda<br/>Secara <span className="font-[800]">Anonim & Aman</span>
            </h1>

            <p className="h-sub text-[14px] md:text-[16px] leading-[1.6] text-[#525252] max-w-[520px]">
              Wadah resmi penyampaian keluhan, kritik, dan saran untuk jurusan dan himpunan Informatika. Bebas tanpa login, tanpa identitas.
            </p>

            <div className="h-cta flex flex-wrap gap-3 pt-1">
              <Link to="/laporan" className="inline-flex h-[44px] px-6 rounded-full bg-black text-white text-[12px] font-semibold tracking-[0.04em] uppercase items-center gap-2 hover:opacity-90 active:scale-[0.98] transition">
                Buat Laporan Sekarang <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/lacak" className="inline-flex h-[44px] px-6 rounded-full bg-[#eeeeee] text-[#1a1c1c] text-[12px] font-semibold tracking-[0.04em] uppercase items-center justify-center hover:bg-[#e8e8e8] transition">
                Lacak Status
              </Link>
            </div>

            <div className="flex items-stretch gap-6 pt-4 border-t border-[#E5E5E5] mt-2">
              <div>
                <p className="text-[20px] font-[700] leading-none">24/7</p>
                <p className="label-sm text-[#525252] mt-1">Akses Sistem</p>
              </div>
              <div className="w-px bg-[#E5E5E5]" />
              <div>
                <p className="text-[20px] font-[700] leading-none">100%</p>
                <p className="label-sm text-[#525252] mt-1">Anonimitas</p>
              </div>
            </div>
          </div>

          <div className="relative h-[280px] md:h-[420px] hidden md:block">
            <div className="h-mock absolute inset-0 rounded-[16px] overflow-hidden border border-[#E5E5E5] bg-[#1a1c1c] shadow-[0_20px_60px_rgba(0,0,0,0.18)]" style={{ transform:"perspective(1200px) rotateY(-6deg) rotateX(2deg) rotateZ(0.6deg)" }}>
              <img src="/foto-hero.jpg" alt="" className="w-full h-full object-cover opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute top-3 left-3 right-3 flex items-center gap-1.5 opacity-60">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#28c940]" />
                <span className="ml-3 text-[10px] text-white/70 hidden md:inline">suarainformatika — aman & anonim</span>
              </div>
            </div>
            <div className="absolute -bottom-2 -left-4 bg-white border border-[#E5E5E5] rounded-[12px] px-4 py-3 flex items-center gap-3 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
              <span className="w-8 h-8 rounded-full bg-[#f3f3f3] border border-[#E5E5E5] grid place-items-center"><CheckCircle2 className="w-4 h-4" /></span>
              <div>
                <p className="text-[12px] font-semibold leading-none">Laporan Diterima</p>
                <p className="text-[11px] text-[#525252]">Baru saja</p>
              </div>
            </div>
          </div>

          <div className="md:hidden rounded-[16px] overflow-hidden border border-[#E5E5E5] relative h-[220px]">
            <img src="/foto-hero.jpg" alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full border border-[#E5E5E5]">
              <span className="w-2 h-2 rounded-full bg-black" />
              <span className="label-sm text-[10px]">PLATFORM ASPIRASI TERENKRIPSI</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-t border-[#E5E5E5] py-10 md:py-14">
        <div className="container-wide">
          <div className="text-center max-w-[640px] mx-auto mb-10">
            <h2 className="text-[24px] md:text-[32px] font-[700] tracking-[-0.02em]">Kenapa Menggunakan AspirasiIF?</h2>
            <p className="text-[14px] leading-[1.6] text-[#525252] mt-3">Sistem yang dirancang khusus untuk memastikan kenyamanan dan keamanan mahasiswa dalam beraspirasi.</p>
          </div>

          <div className="feat-grid grid md:grid-cols-3 gap-5 md:gap-6 max-w-[1100px] mx-auto items-start">
            <div className="feat-card rounded-[16px] bg-[#f3f3f3] border border-[#E5E5E5] p-6 space-y-3">
              <span className="w-10 h-10 rounded-full bg-[#e2e2e2] border border-[#E5E5E5] grid place-items-center"><ShieldCheck className="w-5 h-5" /></span>
              <h3 className="text-[15px] font-semibold">Privasi Terjamin</h3>
              <p className="text-[13px] leading-[1.6] text-[#525252]">Tidak ada data pribadi (NIM, email, IP Address) yang disimpan. Identitas Anda 100% aman dan tidak dapat dilacak.</p>
            </div>
            <div className="feat-card rounded-[16px] bg-[#f3f3f3] border border-[#E5E5E5] p-6 space-y-3 md:translate-y-6">
              <span className="w-10 h-10 rounded-full bg-[#e2e2e2] border border-[#E5E5E5] grid place-items-center"><Bell className="w-5 h-5" /></span>
              <h3 className="text-[15px] font-semibold">Notifikasi Langsung</h3>
              <p className="text-[13px] leading-[1.6] text-[#525252]">Setiap laporan yang masuk akan secara otomatis dikirimkan ke grup Telegram admin terkait untuk respon cepat.</p>
            </div>
            <div className="feat-card rounded-[16px] bg-[#f3f3f3] border border-[#E5E5E5] p-6 space-y-3 md:translate-y-12">
              <span className="w-10 h-10 rounded-full bg-[#e2e2e2] border border-[#E5E5E5] grid place-items-center"><Layers3 className="w-5 h-5" /></span>
              <h3 className="text-[15px] font-semibold">Penanganan Terstruktur</h3>
              <p className="text-[13px] leading-[1.6] text-[#525252]">Lacak progres laporan Anda secara transparan. Admin akan memperbarui status secara berkala (Diproses / Selesai).</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#eeeeee] py-10 md:py-14">
        <div className="container-wide text-center space-y-4">
          <h2 className="text-[24px] md:text-[32px] font-[700] tracking-[-0.02em]">Suara Anda Berharga</h2>
          <p className="text-[14px] leading-[1.6] text-[#525252] max-w-[600px] mx-auto">Bantu kami membangun lingkungan akademik yang lebih baik. Satu laporan dari Anda bisa membawa perubahan besar.</p>
          <Link to="/laporan" className="inline-flex h-[48px] px-8 rounded-full bg-black text-white text-[12px] font-semibold tracking-[0.05em] uppercase items-center hover:opacity-90 active:scale-[0.98] transition mt-2">
            Buat Laporan Sekarang
          </Link>
        </div>
      </section>
    </div>
  )
}
