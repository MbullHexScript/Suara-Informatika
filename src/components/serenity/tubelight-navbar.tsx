import { motion } from "framer-motion"
import { Link, useLocation } from "react-router-dom"
import { Home, SquarePen, Search, Shield } from "lucide-react"

const tabs = [
  { name: "Beranda", url: "/", Icon: Home },
  { name: "Kirim", url: "/laporan", Icon: SquarePen },
  { name: "Lacak", url: "/lacak", Icon: Search },
  { name: "Admin", url: "/admin/login", Icon: Shield },
]

export function TubeLightNavbar() {
  const { pathname } = useLocation()
  const isActive = (url: string) => (url === "/" ? pathname === "/" : pathname.startsWith(url))

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 flex justify-center select-none pointer-events-none w-full">
      <div className="pointer-events-auto flex items-center gap-1 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-black/[0.08] dark:border-white/10 py-1 px-1 rounded-full shadow-[0_10px_36px_rgba(0,0,0,0.14)] mb-[calc(14px+env(safe-area-inset-bottom))]">
        {tabs.map((tab) => {
          const active = isActive(tab.url)
          const Icon = tab.Icon
          return (
            <Link
              key={tab.name}
              to={tab.url}
              aria-current={active ? "page" : undefined}
              className={`relative cursor-pointer text-[12px] font-semibold tracking-[-0.01em] px-5 sm:px-6 py-2 rounded-full transition-colors duration-200 will-change-transform active:scale-[0.97] ${active ? "text-white" : "text-[#525252] hover:text-black"}`}
              style={{ transition: "transform 100ms ease-out, color 160ms ease" }}
            >
              {active && (
                <motion.div
                  layoutId="liquid-pill"
                  className="absolute inset-0 bg-black rounded-full"
                  transition={{ type: "spring", stiffness: 350, damping: 28, mass: 0.9 }}
                />
              )}
              <span className="relative z-10 hidden md:inline">{tab.name}</span>
              <span className="relative z-10 md:hidden">
                <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              </span>
              {active && (
                <motion.div
                  layoutId="tubelight-lamp"
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-black dark:bg-white rounded-t-md pointer-events-none"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-6 h-6 bg-black dark:bg-white rounded-full pointer-events-none" style={{ filter: "blur(6px)", opacity: 0.15 }} />
                  <div className="absolute left-1/2 -translate-x-1/2 -top-2.5 w-10 h-8 bg-black dark:bg-white rounded-full pointer-events-none" style={{ filter: "blur(10px)", opacity: 0.07 }} />
                </motion.div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default TubeLightNavbar
