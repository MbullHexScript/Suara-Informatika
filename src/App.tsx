import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Toaster } from "sonner"
import Navbar from "@/components/layout/Navbar"
import GradientWaves from "@/components/ui/GradientWaves"
import Home from "@/pages/Home"
import Laporan from "@/pages/Laporan"
import Lacak from "@/pages/Lacak"
import AdminLogin from "@/pages/AdminLogin"
import AdminDashboard from "@/pages/AdminDashboard"
import AdminDetail from "@/pages/AdminDetail"

function BackgroundWaves() {
  const reduce = useReducedMotion()
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <GradientWaves
        horizonColor="#134e48"
        waveColor="#289C8F"
        crestColor="#8EE5DC"
        speed={reduce ? 0 : 0.35}
        amplitude={2.8}
        waveScale={0.65}
        waveRatio={0.9}
        swell={30}
        turbulence={18}
        tilt={1.15}
        zoom={1.05}
        height={5.0}
        fogDepth={18}
        detail="high"
        brightness={1.1}
        opacity={0.95}
        mouseInteraction={!reduce}
        parallaxStrength={0.5}
        grain
        grainIntensity={0.05}
      />
    </div>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col bg-transparent min-h-screen" style={{ minHeight: "100dvh" } as React.CSSProperties}>
      <BackgroundWaves />
      <Navbar />
      <main className="flex-1 pb-[var(--content-bottom)] md:pb-0 bg-transparent relative z-[1]">{children}</main>
      <footer className="hidden md:block glass border-t border-white/[0.1] py-6 relative z-[1]">
        <div className="container-wide flex items-center justify-between gap-3 label-sm text-white/60">
          <span className="font-bold tracking-[-0.01em] text-white">SUARA INFORMATIKA</span>
          <span>© 2026 · Anonim · Aman · Transparan</span>
        </div>
      </footer>
    </div>
  )
}

function PageMotion({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion()
  if (reduce) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
        {children}
      </motion.div>
    )
  }
  return (
    <motion.div
      initial={{ y: 8, opacity: 0, filter: "blur(6px)" }}
      animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
      exit={{ y: -6, opacity: 0, filter: "blur(4px)" }}
      transition={{ type: "spring", bounce: 0, duration: 0.35 } as any}
      className="will-change-transform"
    >
      {children}
    </motion.div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout><PageMotion><Home /></PageMotion></Layout>} />
        <Route path="/laporan" element={<Layout><PageMotion><Laporan /></PageMotion></Layout>} />
        <Route path="/lacak" element={<Layout><PageMotion><Lacak /></PageMotion></Layout>} />
        <Route path="/lacak/:id" element={<Layout><PageMotion><Lacak /></PageMotion></Layout>} />
        <Route path="/admin/login" element={<PageMotion><AdminLogin /></PageMotion>} />
        <Route path="/admin" element={<PageMotion><AdminDashboard /></PageMotion>} />
        <Route path="/admin/laporan/:id" element={<PageMotion><AdminDetail /></PageMotion>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-center" />
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
