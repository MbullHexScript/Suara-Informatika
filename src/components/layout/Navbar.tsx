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
      {/* Desktop — floating pill navbar, menggantung dari atas */}
      <header className={`hidden md:block sticky top-3 z-40 will-change-[backdrop-filter] mx-auto w-fit`}>
        <div className={`flex h-[52px] items-center gap-2 px-2 rounded-full ${scrolled ? "glass scrolled" : "glass"}`}>
          <Link to="/" className="flex items-center gap-2 active:scale-[0.97] transition duration-100 shrink-0 will-change-transform pl-2 pr-1">
            <img src="/icon-web.jpg" alt="Suara Informatika" className="w-8 h-8 rounded-lg object-cover border border-white/[0.15] shadow-sm" width={32} height={32} />
            <span className="font-[700] text-[13px] tracking-[-0.02em] leading-none text-white whitespace-nowrap">SUARA INFORMATIKA</span>
          </Link>
          <div className="w-px h-5 bg-white/[0.15]" />
          <DesktopNav />
        </div>
      </header>

      {/* Mobile — simple top bar */}
      <header className={`md:hidden sticky top-0 z-40 will-change-[backdrop-filter] ${scrolled ? "glass scrolled" : "glass"}`}>
        <div className="container-wide flex h-[56px] items-center justify-center gap-2.5">
          <Link to="/" className="flex items-center gap-2 active:scale-[0.97] transition duration-100 will-change-transform">
            <img src="/icon-web.jpg" alt="Suara Informatika" className="w-8 h-8 rounded-lg object-cover border border-white/[0.15] shadow-sm" width={32} height={32} />
            <span className="font-[700] text-[13px] tracking-[-0.02em] leading-none text-white">SUARA INFORMATIKA</span>
          </Link>
        </div>
      </header>
      <TubeLightNavbar />
    </>
  )
}
