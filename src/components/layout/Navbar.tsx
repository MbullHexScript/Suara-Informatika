import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import {
  TubeLightNavbar,
  DesktopNav,
} from "@/components/serenity/tubelight-navbar";
export default function Navbar() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Langsung ke konten
      </a>
      <header className="site-header">
        <div className="nav-material container-wide">
          <Link
            to="/"
            className="brand"
            aria-label="Suara Informatika — beranda"
          >
            <img className="organization-logo" src="/hmti-logo.jpg" alt="Logo HMTI UIN SMH Banten" width={46} height={46} />
            <span>
              suara<span className="brand-sub">informatika.</span>
            </span>
          </Link>
          <DesktopNav />
          <Link to="/laporan" className="header-cta">
            Buat perubahan <ArrowUpRight size={16} />
          </Link>
        </div>
      </header>
      <TubeLightNavbar />
    </>
  );
}
