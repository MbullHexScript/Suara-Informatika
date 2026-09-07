import { Link, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

function SF_House({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      <path d="M13 4.2L3.8 11.8V20.5a1.5 1.5 0 001.5 1.5H9.2v-5.6c0-.8.7-1.4 1.5-1.4h4.6c.8 0 1.5.6 1.5 1.4V22h3.9a1.5 1.5 0 001.5-1.5v-8.7L13 4.2z" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 1.7 : 1.6} strokeLinejoin="round" strokeLinecap="round" />
      {active && <path d="M13 4.2L3.8 11.8V20.5a1.5 1.5 0 001.5 1.5H9.2v-5.6c0-.8.7-1.4 1.5-1.4h4.6c.8 0 1.5.6 1.5 1.4V22h3.9a1.5 1.5 0 001.5-1.5v-8.7L13 4.2z" fill="currentColor" fillOpacity={0.14} />}
    </svg>
  )
}
function SF_Pencil({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      <rect x="4.2" y="4.2" width="14.2" height="14.2" rx="3.2" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 1.7 : 1.6} />
      <path d="M14.2 8.2l3.6 3.6M8.8 16.6l2.2.6.6-2.2-3.6-3.6a1.1 1.1 0 00-1.5 0l-.6.6a1.1 1.1 0 000 1.5l3.6 3.6-.7.7z" fill={active ? "white" : "none"} stroke={active ? "white" : "currentColor"} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
      {active && <rect x="4.2" y="4.2" width="14.2" height="14.2" rx="3.2" fill="currentColor" fillOpacity={0.14} />}
    </svg>
  )
}
function SF_Magnify({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      <circle cx="12.2" cy="12.2" r="6.6" stroke="currentColor" strokeWidth={active ? 1.9 : 1.6} />
      <path d="M16.8 16.8l4.2 4.2" stroke="currentColor" strokeWidth={active ? 2 : 1.7} strokeLinecap="round" />
      {active && <circle cx="12.2" cy="12.2" r="6.6" fill="currentColor" fillOpacity={0.13} />}
    </svg>
  )
}
function SF_Person({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      <circle cx="13" cy="9.2" r="3.8" stroke="currentColor" strokeWidth={active ? 1.8 : 1.55} fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.14 : 0} />
      <path d="M5.2 19.4a7.8 7.8 0 0115.6 0" stroke="currentColor" strokeWidth={active ? 1.8 : 1.55} strokeLinecap="round" />
      <circle cx="20.2" cy="6.8" r="1.35" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.2} />
    </svg>
  )
}

const links = [
  { to: "/", label: "Beranda", short: "Beranda", Icon: SF_House },
  { to: "/laporan", label: "Kirim Laporan", short: "Kirim", Icon: SF_Pencil },
  { to: "/lacak", label: "Lacak Status", short: "Lacak", Icon: SF_Magnify },
  { to: "/admin/login", label: "Admin", short: "Admin", Icon: SF_Person },
]

export default function Navbar(){
  const {pathname}=useLocation()
  const isActive=(to:string)=> to==="/" ? pathname==="/" : pathname.startsWith(to)
  return (
    <>
      <header className="sticky top-0 z-40 glass">
        <div className="container-wide flex h-[64px] items-center justify-between gap-6 will-change-[backdrop-filter]">
          <Link to="/" className="flex items-center gap-3 active:scale-[0.97] transition duration-100">
            <span className="w-9 h-9 rounded bg-black text-white grid place-items-center text-[12px] font-extrabold tracking-tight">SI</span>
            <span className="leading-none">
              <span className="block font-[700] text-[14px] tracking-[-0.02em] leading-[1.05]">SUARA</span>
              <span className="block font-[700] text-[14px] tracking-[-0.02em] leading-[1.05] -mt-0.5">INFORMATIKA</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {links.map(l=>{
              const active=isActive(l.to)
              return (
                <Link key={l.to} to={l.to} className={cn("px-4 h-9 grid place-items-center rounded-full text-[12px] font-semibold tracking-[0.04em] uppercase transition will-change-transform active:scale-[0.97]", active ? "bg-black text-white" : "text-[#525252] hover:text-black hover:bg-white/60 backdrop-blur")}>
                  {l.label}
                </Link>
              )
            })}
          </nav>
          <Link to="/laporan" className="hidden md:inline-flex h-9 px-6 rounded-full bg-black text-white text-[12px] font-semibold tracking-[0.04em] uppercase items-center gap-2 active:scale-[0.97] transition duration-100 will-change-transform">
            Buat Laporan
          </Link>
          <span className="md:hidden text-[11px] font-semibold tracking-[0.06em] uppercase text-[#525252] border border-black/[0.08] px-2.5 py-1 rounded-full glass">ANONIM</span>
        </div>
      </header>

      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 flex justify-center pointer-events-none pb-[calc(10px+env(safe-area-inset-bottom))] px-4">
        <nav className="pointer-events-auto flex items-center gap-1 glass-pill rounded-full p-1.5">
          {links.map(l=>{
            const active=isActive(l.to)
            return (
              <Link key={l.to} to={l.to} aria-current={active ? "page" : undefined} className={cn("relative flex flex-col items-center justify-center min-w-[64px] px-3.5 py-1.5 rounded-full transition-colors will-change-transform active:scale-[0.97]", active ? "bg-black text-white" : "text-[#8E8E93] hover:text-black hover:bg-black/[0.06]")}>
                <span className={cn("grid place-items-center transition", active ? "text-white" : "text-[#8E8E93]")}>
                  <l.Icon active={active} />
                </span>
                <span className={cn("text-[11px] leading-none tracking-[-0.01em] mt-0.5", active ? "font-semibold text-white" : "font-medium")}>{l.short}</span>
                {active && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-full bg-white/0" transition={{ type: "spring", bounce: 0, duration: 0.42 }} />}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
