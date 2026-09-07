import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Toaster } from "sonner"
import Navbar from "@/components/layout/Navbar"
import Home from "@/pages/Home"
import Laporan from "@/pages/Laporan"
import Lacak from "@/pages/Lacak"
import AdminLogin from "@/pages/AdminLogin"
import AdminDashboard from "@/pages/AdminDashboard"
import AdminDetail from "@/pages/AdminDetail"

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col bg-transparent min-h-screen" style={{ minHeight: "100dvh" } as React.CSSProperties}>
      <Navbar />
      <main className="flex-1 pb-[var(--content-bottom)] md:pb-0 bg-transparent">{children}</main>
      <footer className="hidden md:block glass border-t border-black/[0.06] py-6">
        <div className="container-wide flex items-center justify-between gap-3 label-sm text-[#525252]">
          <span className="font-bold tracking-[-0.01em] text-[#1a1c1c]">SUARA INFORMATIKA</span>
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
