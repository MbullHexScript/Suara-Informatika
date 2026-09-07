import { Link } from "react-router-dom"
import { TubeLightNavbar } from "@/components/serenity/tubelight-navbar"

export default function Navbar() {
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
          <span className="hidden md:inline-flex text-[11px] font-semibold tracking-[0.06em] uppercase text-[#525252] border border-black/[0.08] px-2.5 py-1 rounded-full glass">ANONIM</span>
          <span className="md:hidden text-[11px] font-semibold tracking-[0.06em] uppercase text-[#525252] border border-black/[0.08] px-2.5 py-1 rounded-full glass">ANONIM</span>
        </div>
      </header>
      <TubeLightNavbar />
    </>
  )
}
