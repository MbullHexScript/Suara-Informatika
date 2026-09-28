import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, HeartHandshake, MessageSquare, Lightbulb, ShieldCheck, Search } from 'lucide-react'

export default function Home() {
  const reduce = useReducedMotion()
  return <div className="home-page container-wide">
    <section className="home-hero">
      <motion.div initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0, duration: .4 }}>
        <p className="hero-intro"><span className="presence-dot" /> Ruang mahasiswa Informatika</p>
        <h1>Suaramu berarti.<br />Ceritamu didengar.</h1>
        <p className="hero-description">Sampaikan hal yang perlu diperbaiki, bagikan ide, atau temukan ruang untuk bercerita. Mulai dari satu pesan darimu.</p>
        <div className="hero-actions"><Link className="action-primary" to="/laporan">Sampaikan aspirasi <ArrowUpRight size={18} /></Link><Link className="action-secondary" to="/lacak"><Search size={17} /> Lacak laporan</Link></div>
        <p className="hero-footnote"><ShieldCheck size={16} /> Keluhan dan aspirasi dapat dikirim tanpa identitas.</p>
      </motion.div>
      <div className="community-photo">
        <img src="/foto-hero.jpg" alt="Kebersamaan mahasiswa saat matahari terbenam" />
        <div className="photo-caption"><span>Untuk kita, oleh kita.</span><p>Lingkungan yang lebih baik<br />dimulai dari saling mendengarkan.</p></div>
      </div>
    </section>
    <section className="service-section" aria-labelledby="services-heading">
      <div className="section-heading"><h2 id="services-heading">Apa yang ingin kamu sampaikan?</h2><p>Pilih ruang yang paling sesuai untukmu.</p></div>
      <div className="service-grid">
        {[
          { type: 'keluhan', Icon: MessageSquare, title: 'Ada yang perlu dibenahi?', description: 'Sampaikan kendala akademik, fasilitas, administrasi, atau UKT.', action: 'Buat keluhan' },
          { type: 'aspirasi', Icon: Lightbulb, title: 'Punya ide untuk kita?', description: 'Bagikan harapan dan gagasan untuk jurusan maupun himpunan.', action: 'Bagikan aspirasi' },
          { type: 'mental_health', Icon: HeartHandshake, title: 'Butuh teman bercerita?', description: 'Ceritakan hal pribadi yang sedang kamu hadapi kepada tim pendamping.', action: 'Mulai bercerita' }
        ].map(({ type, Icon, title, description, action }) => <Link key={type} to={'/laporan?jenis=' + type} className="service-card">
          <Icon size={25} strokeWidth={1.6} /><h3>{title}</h3><p>{description}</p><span>{action}<ArrowUpRight size={17} /></span>
        </Link>)}
      </div>
    </section>
    <section className="how-it-works"><h2>Sederhana dari awal<br />hingga tindak lanjut.</h2><ol><li><b>Tulis pesanmu</b><p>Pilih jenis laporan dan ceritakan hal yang kamu hadapi.</p></li><li><b>Simpan nomor tiket</b><p>Gunakan tiket untuk melihat perkembangan laporan kapan saja.</p></li><li><b>Tim menindaklanjuti</b><p>Pengurus menerima pemberitahuan dan memperbarui status penanganan.</p></li></ol></section>
  </div>
}
