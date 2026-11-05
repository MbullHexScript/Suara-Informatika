import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Asterisk,
  ArrowUpRight,
  ArrowDown,
  ArrowRight,
  Heart,
  Search,
  ShieldCheck,
  MessageSquare,
  Plus,
  AudioLines,
} from "lucide-react";

export default function Home() {
  const [ticket, setTicket] = useState("");
  const navigate = useNavigate();
  return (
    <div className="studio-home">
      <section className="studio-hero">
        <div className="studio-hero-top">
          <span className="mono-tag">SUARA INFORMATIKA / RUANG MAHASISWA</span>
          <span className="hero-index">
            EST. 2026 <span><ArrowUpRight /></span>
          </span>
        </div>
        <div className="studio-headline">
          <h1>
            JANGAN
            <br />
            <span>CUMA</span>
            <br />
            DIPENDAM<span className="headline-dot">.</span>
          </h1>
          <div className="sound-object" aria-hidden="true">
            <div className="sound-orbit" />
            <div className="sound-orbit orbit-two" />
            <div className="sound-core">
              <AudioLines strokeWidth={1.2} />
            </div>
            <span className="sound-label">YOUR VOICE MATTERS</span>
            <span className="sound-spark"><Asterisk /></span>
          </div>
        </div>
        <div className="studio-hero-bottom">
          <p>
            Ada yang mengganjal? Punya gagasan?
            <br />
            Atau sekadar butuh tempat bercerita?
            <br />
            <strong>Di sini, suaramu punya ruang.</strong>
          </p>
          <Link to="/laporan" className="studio-main-cta">
            Sampaikan sekarang <ArrowUpRight size={24} />
          </Link>
          <a className="explore-link" href="#ruang">
            JELAJAHI RUANG <ArrowDown size={18} />
          </a>
        </div>
      </section>
      <div className="voice-ribbon" aria-hidden="true">
        <div>
          {[0, 1, 2, 3].map((i) => (
            <span key={i}>
              DIDENGAR <b><Asterisk size={25}/></b> DIPAHAMI <b><Asterisk size={25}/></b> DITINDAKLANJUTI <b><Asterisk size={25}/></b>
            </span>
          ))}
        </div>
      </div>
      <section id="ruang" className="rooms-section">
        <div className="studio-section-title">
          <span className="mono-tag">01 — PILIH RUANGMU</span>
          <h2>
            Dua ruang.
            <br />
            Semuanya untukmu.
          </h2>
          <p>
            Tidak perlu menyusun kata yang sempurna.
            <br />
            Mulai saja dari yang ingin kamu sampaikan.
          </p>
        </div>
        <div className="room-grid">
          <Link to="/laporan?jenis=aspirasi" className="room-card room-voice">
            <div className="room-card-top">
              <span className="mono-tag">01 / KELUHAN + IDE + HARAPAN</span>
              <MessageSquare size={28} />
            </div>
            <h3>
              Suara &<br />
              Aspirasi<span><ArrowUpRight /></span>
            </h3>
            <p>
              Yang perlu diperbaiki dan yang ingin diwujudkan. Semua masukanmu,
              dalam satu ruang.
            </p>
            <div className="room-tags">
              <span>Akademik</span>
              <span>Fasilitas</span>
              <span>Kehidupan kampus</span>
            </div>
            <div className="room-card-bottom">
              <span>Sampaikan pesanmu</span>
              <ArrowUpRight />
            </div>
          </Link>
          <Link
            to="/laporan?jenis=mental_health"
            className="room-card room-care"
          >
            <div className="room-card-top">
              <span className="mono-tag">02 / UNTUK DIRIMU</span>
              <Heart size={28} />
            </div>
            <h3>
              Ruang
              <br />
              Cerita<span><Heart /></span>
            </h3>
            <p>
              Kamu boleh merasa lelah. Ceritakan yang sedang kamu hadapi kepada
              tim pendamping.
            </p>
            <div className="room-tags">
              <span>Didengar dengan empati</span>
              <span>Tanpa menghakimi</span>
            </div>
            <div className="room-card-bottom">
              <span>Aku ingin bercerita</span>
              <ArrowUpRight />
            </div>
          </Link>
        </div>
      </section>
      <section className="track-console">
        <div>
          <span className="mono-tag">SUDAH KIRIM PESAN?</span>
          <h2>Ikuti jejak suaramu.</h2>
          <p>Cek perkembangan laporan dengan nomor tiketmu.</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate("/lacak/" + encodeURIComponent(ticket.trim()));
          }}
        >
          <label htmlFor="home-ticket">Nomor tiket laporan</label>
          <div>
            <Search size={20} />
            <input
              id="home-ticket"
              value={ticket}
              onChange={(e) => setTicket(e.target.value)}
              required
              placeholder="Tempel nomor tiketmu"
            />
            <button aria-label="Lacak tiket">
              <ArrowRight size={23} />
            </button>
          </div>
          <Link to="/lacak">
            Buka halaman pelacakan <ArrowUpRight size={13} />
          </Link>
        </form>
      </section>
      <section className="studio-process">
        <div className="studio-section-title">
          <span className="mono-tag">02 — CARA KERJANYA</span>
          <h2>
            Pesanmu punya
            <br />
            langkah selanjutnya.
          </h2>
        </div>
        <div className="studio-steps">
          {[
            {
              n: "01",
              title: "Ungkapkan.",
              text: "Tulis keluhan, ide, atau ceritamu. Tambahkan konteks agar tim memahami.",
            },
            {
              n: "02",
              title: "Simpan tiket.",
              text: "Setiap laporan mendapatkan nomor tiket. Simpan untuk melihat perkembangannya.",
            },
            {
              n: "03",
              title: "Pantau proses.",
              text: "Pengurus membaca pesan dan memperbarui status tindak lanjut.",
            },
          ].map((x) => (
            <article key={x.n}>
              <span>{x.n}</span>
              <ArrowUpRight size={24} />
              <h3>{x.title}</h3>
              <p>{x.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="studio-privacy">
        <ShieldCheck size={32} />
        <p>
          <strong>Identitasmu tetap milikmu.</strong> Suara & Aspirasi tidak
          meminta nama atau NIM. Ruang Cerita meminta WhatsApp untuk tindak
          lanjut oleh tim yang berizin.
        </p>
        <span className="mono-tag">RESPECT YOUR PRIVACY ↗</span>
      </section>
      <section className="studio-faq">
        <div>
          <span className="mono-tag">03 — BIAR LEBIH JELAS</span>
          <h2>
            Masih{" "}
            <br />
            penasaran<span>?</span>
          </h2>
        </div>
        <div>
          {[
            {
              q: "Keluhan dan aspirasi sekarang jadi satu?",
              a: "Ya. Gunakan Suara & Aspirasi untuk menyampaikan masalah, ide, kritik, maupun harapan. Tidak perlu memilih antara keluhan dan aspirasi.",
            },
            {
              q: "Apakah perlu login untuk mengirim pesan?",
              a: "Tidak. Kamu bisa langsung mengisi formulir. Simpan nomor tiket setelah pesan terkirim untuk memantau perkembangannya.",
            },
            {
              q: "Siapa yang membaca pesanku?",
              a: "Detail pesan dibaca pengelola web dan anggota bot yang memiliki izin. Halaman pelacakan publik hanya menampilkan informasi terbatas dan status laporan.",
            },
            {
              q: "Bagaimana dengan laporan yang sudah pernah dikirim?",
              a: "Laporan sebelumnya tetap bisa dilacak dengan nomor tiket yang sama. Keluhan dan aspirasi kini ditampilkan bersama oleh pengelola.",
            },
          ].map((x) => (
            <details key={x.q}>
              <summary>
                {x.q}
                <Plus size={20} />
              </summary>
              <p>{x.a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="studio-closing">
        <span className="mono-tag">
          BUKAN SEKADAR PESAN. INI AWAL PERUBAHAN.
        </span>
        <Link to="/laporan">
          SEKARANG,
          <br />
          GILIRANMU.
          <ArrowUpRight />
        </Link>
      </section>
    </div>
  );
}
