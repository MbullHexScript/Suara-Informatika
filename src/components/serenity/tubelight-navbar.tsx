import { motion, useMotionValue, animate } from "framer-motion"
import { Link, useLocation } from "react-router-dom"
import { Home, SquarePen, Search, Shield } from "lucide-react"
import { useRef } from "react"

export const tabs = [
  { name: "Beranda", url: "/", Icon: Home },
  { name: "Kirim", url: "/laporan", Icon: SquarePen },
  { name: "Lacak", url: "/lacak", Icon: Search },
  { name: "Admin", url: "/admin/login", Icon: Shield },
]

function useIsActive() {
  const { pathname } = useLocation()
  return (url: string) => (url === "/" ? pathname === "/" : pathname.startsWith(url))
}

function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot))
}

export function TubeLightNavbar() {
  const isActive = useIsActive()
  const x = useMotionValue(0)
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 z-50 flex justify-center select-none pointer-events-none w-full px-4">
      <motion.div
        ref={ref}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.55}
        dragMomentum={true}
        dragTransition={{ bounceStiffness: 320, bounceDamping: 30, power: 0.22, timeConstant: 260 }}
        onDragEnd={(_, info) => {
          const velocity = info.velocity.x
          const current = x.get()
          const projected = current + (velocity / 1000) * 0.998 / (1 - 0.998) * 0.08
          const clamped = Math.max(Math.min(projected, 18), -18)
          const rubber = rubberband(clamped, 380, 0.55)
          animate(x, rubber * 0.12, { type: "spring", bounce: 0, duration: 0.35 })
          setTimeout(() => animate(x, 0, { type: "spring", bounce: 0.18, duration: 0.42 }), 120)
        }}
        style={{ x }}
        className="pointer-events-auto flex items-center gap-1.5 glass-pill py-2 px-2 rounded-full mb-[calc(16px+env(safe-area-inset-bottom,0px))] w-full max-w-[380px] justify-between will-change-transform touch-pan-x"
      >
        {tabs.map((tab) => {
          const active = isActive(tab.url)
          const Icon = tab.Icon
          return (
            <Link
              key={tab.name}
              to={tab.url}
              aria-current={active ? "page" : undefined}
              aria-label={tab.name}
              onPointerDown={(e) => (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)}
              className={`relative cursor-pointer flex-1 grid place-items-center py-3 rounded-full will-change-transform active:scale-[0.97] min-w-[52px] min-h-[52px] ${active ? "text-black" : "text-white/50 hover:text-white"}`}
              style={{ transition: "transform 100ms ease-out, color 160ms ease" }}
            >
              {active && (
                <motion.div
                  layoutId="liquid-pill-mobile"
                  className="absolute inset-0 bg-white/90 rounded-full"
                  transition={{ type: "spring", bounce: 0, duration: 0.35 }}
                />
              )}
              <motion.span
                className="relative z-10"
                animate={{ scale: active ? 1.06 : 1 }}
                transition={{ type: "spring", bounce: 0.18, duration: 0.32 }}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              </motion.span>
              {active && (
                <motion.div
                  layoutId="tubelight-lamp-mobile"
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-t-md pointer-events-none"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-6 h-6 bg-white rounded-full pointer-events-none" style={{ filter: "blur(6px)", opacity: 0.25 }} />
                  <div className="absolute left-1/2 -translate-x-1/2 -top-2.5 w-10 h-8 bg-white rounded-full pointer-events-none" style={{ filter: "blur(10px)", opacity: 0.12 }} />
                </motion.div>
              )}
            </Link>
          )
        })}
      </motion.div>
    </div>
  )
}

export function DesktopNav() {
  const isActive = useIsActive()

  return (
    <div className="hidden md:flex items-center gap-1 bg-white/[0.06] border border-white/[0.12] py-1 px-1 rounded-full">
      {tabs.map((tab) => {
        const active = isActive(tab.url)
        return (
          <Link
            key={tab.name}
            to={tab.url}
            aria-current={active ? "page" : undefined}
            onPointerDown={(e) => (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)}
            className={`relative cursor-pointer text-[13px] font-semibold tracking-[-0.01em] px-4 py-2 rounded-full will-change-transform active:scale-[0.97] ${active ? "text-black" : "text-white/60 hover:text-white"}`}
            style={{ transition: "transform 100ms ease-out" }}
          >
            {active && (
              <motion.div
                layoutId="liquid-pill-desktop"
                className="absolute inset-0 bg-white/90 rounded-full"
                transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              />
            )}
            <span className="relative z-10">{tab.name}</span>
          </Link>
        )
      })}
    </div>
  )
}

export default TubeLightNavbar
