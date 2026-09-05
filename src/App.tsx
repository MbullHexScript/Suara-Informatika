import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
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
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="hidden md:block bg-white border-t border-[#E5E5E5] py-6">
        <div className="container-wide flex items-center justify-between gap-3 label-sm text-[#525252]">
          <span className="font-bold tracking-[-0.01em] text-[#1a1c1c]">SUARA INFORMATIKA</span>
          <span>© 2026 · Anonim · Aman · Transparan</span>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-center" />
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/laporan" element={<Layout><Laporan /></Layout>} />
        <Route path="/lacak" element={<Layout><Lacak /></Layout>} />
        <Route path="/lacak/:id" element={<Layout><Lacak /></Layout>} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/laporan/:id" element={<AdminDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
