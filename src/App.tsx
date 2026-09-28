import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Toaster } from "sonner"
import { lazy, Suspense, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
const GradientWaves = lazy(() => import('@/components/ui/GradientWaves'))
const Home = lazy(() => import('@/pages/Home'))
const Laporan = lazy(() => import('@/pages/Laporan'))
const Lacak = lazy(() => import('@/pages/Lacak'))
const AdminLogin = lazy(() => import('@/pages/AdminLogin'))
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'))
const AdminDetail = lazy(() => import('@/pages/AdminDetail'))

function BackgroundWaves() {
  const reduce = useReducedMotion()
  if (reduce) return <div className="wave-fallback" aria-hidden="true" />
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-60" aria-hidden="true">
      <Suspense fallback={null}><GradientWaves
        horizonColor="#134e48"
        waveColor="#289C8F"
        crestColor="#8EE5DC"
        speed={0.12}
        amplitude={2.8}
        waveScale={0.65}
        waveRatio={0.9}
        swell={30}
        turbulence={18}
        tilt={1.15}
        zoom={1.05}
        height={5.0}
        fogDepth={18}
        detail="low"
        brightness={1.1}
        opacity={0.95}
        mouseInteraction={!reduce}
        parallaxStrength={0.15}
        grain
        grainIntensity={0.05}
      /></Suspense>
    </div>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-app flex flex-col bg-transparent min-h-screen" style={{ minHeight: "100dvh" }}>
      <BackgroundWaves />
      <Navbar />
      <main id="main-content" className="flex-1 pt-[96px] pb-[var(--content-bottom)] md:pb-0 bg-transparent relative z-[1]">{children}</main>
      <footer className="hidden md:block glass border-t border-white/[0.1] py-6 relative z-[1]">
        <div className="container-wide flex items-center justify-between gap-3 label-sm text-white/60">
          <span className="font-bold tracking-[-0.01em] text-white">SUARA INFORMATIKA</span>
          <span>© 2026 · Ruang aspirasi & pendampingan mahasiswa</span>
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
      transition={{ type: "spring", bounce: 0, duration: 0.35 }}
      className="will-change-transform"
    >
      {children}
    </motion.div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [location.pathname])
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout><PageMotion><Home /></PageMotion></Layout>} />
        <Route path="/laporan" element={<Layout><PageMotion><Laporan /></PageMotion></Layout>} />
        <Route path="/lacak" element={<Layout><PageMotion><Lacak /></PageMotion></Layout>} />
        <Route path="/lacak/:id" element={<Layout><PageMotion><Lacak /></PageMotion></Layout>} />
        <Route path="/admin/login" element={<div className="admin-app"><PageMotion><AdminLogin /></PageMotion></div>} />
        <Route path="/admin" element={<div className="admin-app"><PageMotion><AdminDashboard /></PageMotion></div>} />
        <Route path="/admin/laporan/:id" element={<div className="admin-app"><PageMotion><AdminDetail /></PageMotion></div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-center" />
      <Suspense fallback={<div role="status" className="min-h-dvh grid place-items-center text-white">Memuat ruangmu…</div>}><AnimatedRoutes /></Suspense>
    </BrowserRouter>
  )
}
