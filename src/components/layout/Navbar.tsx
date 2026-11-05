import { Link } from "react-router-dom";
import { ArrowUpRight, AudioLines } from "lucide-react";
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
            <span className="brand-icon">
              <AudioLines size={25} />
            </span>
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
