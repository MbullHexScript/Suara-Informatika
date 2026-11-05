import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowDown,
  HeartHandshake,
  MessageSquare,
  Lightbulb,
  ShieldCheck,
  Search,
  AudioLines,
  Check,
  Plus,
} from "lucide-react";
const services = [
  {
    type: "keluhan",
    Icon: MessageSquare,
    label: "01 / KELUHAN",
    title: "Yang mengganjal, sampaikan.",
    description:
      "Kendala akademik, fasilitas, atau administrasi. Bantu kami memahami apa yang perlu dibenahi.",
    action: "Sampaikan keluhan",
  },
  {
    type: "aspirasi",
    Icon: Lightbulb,
    label: "02 / ASPIRASI",
    title: "Ide kecil. Dampak berarti.",
    description:
      "Gagasanmu bisa jadi awal perubahan untuk jurusan dan himpunan yang lebih baik.",
    action: "Bagikan ide",
  },
  {
    type: "mental_health",
    Icon: HeartHandshake,
    label: "03 / RUANG CERITA",
    title: "Tak harus dipendam sendiri.",
    description:
      "Ada ruang untuk ceritamu. Sampaikan apa yang kamu rasakan kepada tim pendamping.",
    action: "Mulai bercerita",
  },
];
export default function Home() {
  return (
    <div className="home-page">
      <section className="home-hero container-wide">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="presence-dot" /> RUANG MAHASISWA INFORMATIKA
          </p>
          <h1>
            Suara kecilmu.
            <br />
            <span>Awal perubahan</span>
            <br />
            besar kita.
          </h1>
          <p className="hero-description">
            Kampus yang lebih baik dimulai dari keberanian untuk bicara.
            Sampaikan keluhan, titipkan ide, atau temukan ruang untuk bercerita.
          </p>
          <div className="hero-actions">
            <Link className="action-primary" to="/laporan">
              Sampaikan suaramu <ArrowUpRight size={19} />
            </Link>
            <Link className="hero-track" to="/lacak">
              <Search size={17} /> Lacak laporan
            </Link>
          </div>
          <p className="hero-footnote">
            <ShieldCheck size={16} /> Keluhan & aspirasi tanpa nama atau NIM.
          </p>
        </div>
        <div className="hero-visual">
          <div className="visual-top">
            <span>BERSAMA, KITA BISA.</span>
            <AudioLines size={24} />
          </div>
          <div className="hero-photo">
            <img
              src="/foto-hero.jpg"
              alt="Kebersamaan mahasiswa saat matahari terbenam"
              fetchPriority="high"
            />
            <div className="photo-caption">
              <span>Setiap cerita punya tempat.</span>
              <p>
                Termasuk
                <br />
                <em>ceritamu.</em>
              </p>
            </div>
          </div>
          <div className="visual-bottom">
            <span className="visual-avatar">
              <HeartHandshake size={21} />
            </span>
            <p>
              Didengar dengan empati.
              <br />
              <b>Ditindaklanjuti dengan peduli.</b>
            </p>
            <span className="visual-star">✳</span>
          </div>
          <div className="hero-stamp">
            SUARAMU
            <br />
            <b>BERARTI.</b>
            <ArrowUpRight size={20} />
          </div>
        </div>
      </section>
      <div className="trust-strip">
        <div className="container-wide">
          <span>
            <ShieldCheck size={18} /> Identitasmu tetap milikmu
          </span>
          <span>
            <Search size={18} /> Perkembangan dapat dilacak
          </span>
          <span>
            <HeartHandshake size={18} /> Dikelola tim pengurus
          </span>
          <a href="#layanan">
            Temukan ruangmu <ArrowDown size={16} />
          </a>
        </div>
      </div>
      <section
        id="layanan"
        className="service-section container-wide"
        aria-labelledby="services-heading"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">PILIH RUANGMU</p>
            <h2 id="services-heading">
              Apa pun pesannya,
              <br />
              kami siap mendengarkan.
            </h2>
          </div>
          <p>
            Tak perlu menunggu jadi masalah besar.
            <br />
            Mulai dari hal yang berarti untukmu.
          </p>
        </div>
        <div className="service-grid">
          {services.map(({ type, Icon, label, title, description, action }) => (
            <Link
              key={type}
              to={"/laporan?jenis=" + type}
              className={"service-card service-" + type}
            >
              <div className="service-top">
                <span>{label}</span>
                <span className="service-icon">
                  <Icon size={25} strokeWidth={1.6} />
                </span>
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
              <span className="service-action">
                {action}
                <span>
                  <ArrowUpRight size={20} />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="process-section container-wide">
        <div className="process-intro">
          <p className="eyebrow">DARI PESAN KE PERUBAHAN</p>
          <h2>
            Tiga langkah.
            <br />
            Satu langkah maju.
          </h2>
          <p>
            Proses yang sederhana, agar kamu bisa fokus pada hal yang ingin
            disampaikan.
          </p>
          <Link to="/laporan" className="text-link">
            Mulai sekarang <ArrowUpRight size={18} />
          </Link>
        </div>
        <ol className="process-list">
          {[
            {
              title: "Tulis dengan caramu.",
              text: "Pilih jenis pesan, ceritakan konteksnya, dan tambahkan foto jika diperlukan.",
            },
            {
              title: "Simpan nomor tiketmu.",
              text: "Setelah terkirim, kamu mendapat tiket untuk memantau perkembangan laporan.",
            },
            {
              title: "Beri ruang untuk tindak lanjut.",
              text: "Tim pengurus menerima laporan dan memperbarui status penanganannya.",
            },
          ].map((step, i) => (
            <li key={step.title}>
              <span className="step-number">0{i + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
              <Check size={19} />
            </li>
          ))}
        </ol>
      </section>
      <section className="care-banner container-wide">
        <span className="care-art" aria-hidden="true">
          <HeartHandshake size={58} strokeWidth={1} />
        </span>
        <div>
          <p className="eyebrow">RUANG CERITA</p>
          <h2>Kamu tidak harus selalu kuat.</h2>
          <p>
            Kalau hari ini terasa berat, mulai dari satu cerita. Kami ada untuk
            mendengarkan.
          </p>
        </div>
        <Link to="/laporan?jenis=mental_health" className="action-primary">
          Aku ingin bercerita <ArrowUpRight size={18} />
        </Link>
      </section>
      <section className="faq-section container-wide">
        <div>
          <p className="eyebrow">SEBELUM MEMULAI</p>
          <h2>
            Mungkin ini
            <br />
            yang kamu pikirkan.
          </h2>
        </div>
        <div className="faq-list">
          {[
            {
              q: "Apakah aku harus mencantumkan identitas?",
              a: "Keluhan dan aspirasi tidak meminta nama, NIM, atau nomor kontak. Untuk Mental Health, nomor WhatsApp diperlukan agar tim dapat menindaklanjuti; nama bersifat opsional.",
            },
            {
              q: "Bagaimana cara mengetahui perkembangan laporan?",
              a: "Simpan nomor tiket setelah mengirim laporan, lalu masukkan nomor tersebut di halaman Lacak. Kamu dapat melihat status terbaru tanpa login.",
            },
            {
              q: "Siapa yang dapat membaca ceritaku?",
              a: "Detail laporan hanya dapat dibaca pengelola web dan anggota bot yang memiliki izin. Pelacakan publik hanya menampilkan informasi terbatas dan status laporan.",
            },
          ].map((item) => (
            <details key={item.q}>
              <summary>
                {item.q}
                <Plus size={18} />
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
