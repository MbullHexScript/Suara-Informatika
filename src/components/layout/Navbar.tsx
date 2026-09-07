import { Link, useLocation } from "react-router-dom"
import { Home, FilePenLine, Search, Shield } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const links = [
  { to: "/", label: "Beranda", short: "Beranda", icon: Home },
  { to: "/laporan", label: "Kirim Laporan", short: "Laporan", icon: FilePenLine },
  { to: "/lacak", label: "Lacak Status", short: "Lacak", icon: Search },
  { to: "/admin/login", label: "Admin", short: "Admin", icon: Shield },
]

export default function Navbar(){
  const {pathname}=useLocation()
  const isActive=(to:string)=> to==="/" ? pathname==="/" : pathname.startsWith(to)
  return (
    <>
      <header className="sticky top-0 z-40 bg-[#f9f9f9]/95 backdrop-blur border-b border-[#E5E5E5]">
        <div className="container-wide flex h-[64px] items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="w-9 h-9 rounded bg-black text-white grid place-items-center text-[12px] font-extrabold tracking-tight">SI</span>
            <span className="leading-none">
              <span className="block font-[700] text-[14px] tracking-[-0.02em]">SUARA</span>
              <span className="block font-[700] text-[14px] tracking-[-0.02em] -mt-1">INFORMATIKA</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map(l=>{
              const active=isActive(l.to)
              return (
                <Link key={l.to} to={l.to} className={cn("px-4 h-9 grid place-items-center rounded-full text-[12px] font-semibold tracking-[0.04em] uppercase transition", active ? "bg-black text-white" : "text-[#525252] hover:text-black hover:bg-[#f3f3f3]")}>
                  {l.label}
                </Link>
              )
            })}
          </nav>

          <Link to="/laporan" className="hidden md:inline-flex h-9 px-6 rounded-full bg-black text-white text-[12px] font-semibold tracking-[0.04em] uppercase items-center gap-2 hover:opacity-90 active:scale-[0.98] transition">
            Buat Laporan
          </Link>

          <span className="md:hidden text-[11px] font-semibold tracking-[0.06em] uppercase text-[#525252] border border-[#E5E5E5] px-2.5 py-1 rounded-full bg-white">ANONIM</span>
        </div>
      </header>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#f9f9f9]/80 supports-[backdrop-filter]:bg-[#f9f9f9]/75 backdrop-blur-[20px] backdrop-saturate-[180%] border-t border-black/[0.08] flex items-center justify-around px-2 pt-1" style={{ paddingBottom: "calc(4px + env(safe-area-inset-bottom))", height: "calc(49px + env(safe-area-inset-bottom))" }}>
        {links.map(l=>{
          const active=isActive(l.to)
          return (
            <Link key={l.to} to={l.to} aria-current={active ? "page" : undefined} className="relative flex flex-col items-center justify-center gap-[3px] px-3 py-1 min-w-[64px] min-h-[44px] active:scale-[0.97] transition">
              <motion.span
                animate={{ scale: active ? 1 : 1 }}
                transition={{ type: "spring", bounce: 0, duration: 0.22 }}
                className={cn("grid place-items-center transition-colors", active ? "text-black" : "text-[#8E8E93]")}
              >
                <l.icon className="w-[24px] h-[24px]" strokeWidth={active ? 2.3 : 1.9} />
              </motion.span>
              <span className={cn("text-[10px] leading-none tracking-[0.02em] transition-colors", active ? "font-semibold text-black" : "font-normal text-[#8E8E93]")}>{(l as any).short}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
