import {
  Link,
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Toaster } from "sonner";
import { lazy, Suspense, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
const Home = lazy(() => import("@/pages/Home"));
const Laporan = lazy(() => import("@/pages/Laporan"));
const Lacak = lazy(() => import("@/pages/Lacak"));
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const AdminDetail = lazy(() => import("@/pages/AdminDetail"));

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="public-app flex flex-col bg-transparent min-h-screen"
      style={{ minHeight: "100dvh" }}
    >
      <Navbar />
      <main id="main-content" className="site-main">
        {children}
      </main>
      <footer className="site-footer">
        <div className="container-wide footer-content">
          <div>
            <Link to="/" className="footer-brand">
              <img className="organization-logo" src="/hmti-logo.jpg" alt="Logo HMTI UIN SMH Banten" width={46} height={46} />
              suara<span>informatika.</span>
            </Link>
            <p>Ruang untuk didengar. Langkah untuk perubahan.</p>
          </div>
          <div className="footer-links">
            <Link to="/laporan">Sampaikan pesan</Link>
            <Link to="/lacak">Lacak laporan</Link>
            <Link to="/admin/login">Ruang pengelola</Link>
          </div>
          <p className="footer-credit">
            © 2026 Suara Informatika
            <br />
            Dari mahasiswa, untuk mahasiswa.
          </p>
        </div>
      </footer>
    </div>
  );
}

function PageMotion({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    );
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
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <Layout>
              <PageMotion>
                <Home />
              </PageMotion>
            </Layout>
          }
        />
        <Route
          path="/laporan"
          element={
            <Layout>
              <PageMotion>
                <Laporan />
              </PageMotion>
            </Layout>
          }
        />
        <Route
          path="/lacak"
          element={
            <Layout>
              <PageMotion>
                <Lacak />
              </PageMotion>
            </Layout>
          }
        />
        <Route
          path="/lacak/:id"
          element={
            <Layout>
              <PageMotion>
                <Lacak />
              </PageMotion>
            </Layout>
          }
        />
        <Route
          path="/admin/login"
          element={
            <div className="admin-app">
              <PageMotion>
                <AdminLogin />
              </PageMotion>
            </div>
          }
        />
        <Route
          path="/admin"
          element={
            <div className="admin-app">
              <PageMotion>
                <AdminDashboard />
              </PageMotion>
            </div>
          }
        />
        <Route
          path="/admin/laporan/:id"
          element={
            <div className="admin-app">
              <PageMotion>
                <AdminDetail />
              </PageMotion>
            </div>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-center" />
      <Suspense
        fallback={
          <div
            role="status"
            className="min-h-dvh grid place-items-center text-emerald-950"
          >
            Memuat ruangmu…
          </div>
        }
      >
        <AnimatedRoutes />
      </Suspense>
    </BrowserRouter>
  );
}
