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
      {/* Desktop — fixed top navbar, full width */}
      <header className={`hidden md:block fixed top-0 left-0 right-0 z-40 will-change-[backdrop-filter] ${scrolled ? "glass scrolled" : "glass"}`}>
        <div className="container-wide flex h-[56px] items-center justify-between gap-4 px-4">
          <Link to="/" className="flex items-center gap-2 active:scale-[0.97] transition duration-100 shrink-0 will-change-transform">
            <img src="/icon-web.jpg" alt="Suara Informatika" className="w-8 h-8 rounded-lg object-cover border border-white/[0.15] shadow-sm" width={32} height={32} />
            <span className="font-[700] text-[13px] tracking-[-0.02em] leading-none text-white whitespace-nowrap">SUARA INFORMATIKA</span>
          </Link>
          <DesktopNav />
        </div>
      </header>

      {/* Mobile — fixed top bar with padding for tube light navbar at bottom */}
      <header className={`md:hidden fixed top-0 left-0 right-0 z-40 will-change-[backdrop-filter] ${scrolled ? "glass scrolled" : "glass"}`}>
        <div className="container-wide flex h-[56px] items-center justify-center gap-2.5">
          <Link to="/" className="flex items-center gap-2 active:scale-[0.97] transition duration-100 will-change-transform">
            <img src="/icon-web.jpg" alt="Suara Informatika" className="w-8 h-8 rounded-lg object-cover border border-white/[0.15] shadow-sm" width={32} height={32} />
            <span className="font-[700] text-[13px] tracking-[-0.02em] leading-none text-white">SUARA INFORMATIKA</span>
          </Link>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <TubeLightNavbar />
    </>
  )
}