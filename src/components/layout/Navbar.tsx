import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { TubeLightNavbar, DesktopNav } from "@/components/serenity/tubelight-navbar"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > 8))
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll) }
  }, [])

  return (
    <>
      <header className={`sticky top-0 z-40 will-change-[backdrop-filter] ${scrolled ? "glass scrolled shadow-[0_1px_0_rgba(255,255,255,0.55)_inset]" : "glass"}`}>
        <div className="container-wide flex h-[64px] items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2.5 active:scale-[0.97] transition duration-100 shrink-0 will-change-transform">
            <img src="/icon-web.jpg" alt="Suara Informatika" className="w-9 h-9 rounded-xl object-cover border border-black/[0.06] shadow-sm" width={36} height={36} />
            <span className="leading-none">
              <span className="block font-[700] text-[14px] tracking-[-0.02em] leading-[1.05]">SUARA</span>
              <span className="block font-[700] text-[14px] tracking-[-0.02em] leading-[1.05] -mt-0.5">INFORMATIKA</span>
            </span>
          </Link>
          <DesktopNav />
          <span className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#525252] border border-black/[0.08] px-2.5 py-1 rounded-full glass shrink-0">ANONIM</span>
        </div>
      </header>
      <TubeLightNavbar />
    </>
  )
}
