import { useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Upload, X, CheckCircle2, Copy, ShieldCheck, Loader2, ArrowUpRight, HeartHandshake } from 'lucide-react'
import { toast } from 'sonner'
import type { ReportTarget } from '@/types'

const categories = ['Akademik','Fasilitas','Dosen/Pengajaran','Administrasi','Kegiatan Kemahasiswaan','Himpunan','UKT (Uang Kuliah Tunggal)','Lainnya']
const options = [{ id:'keluhan', label:'Keluhan' },{ id:'aspirasi', label:'Aspirasi' },{ id:'mental_health', label:'Mental Health' }] as const
type Kind = typeof options[number]['id']
type Photo = { file: File; preview: string }
type Draft = { title: string; description: string; category: string; target: ReportTarget; name: string; contact: string; photos: Photo[] }
const blank = (): Draft => ({ title:'',description:'',category:'',target:'jurusan',name:'',contact:'',photos:[] })

export default function Laporan() {
  const [params] = useSearchParams()
  const reduce = useReducedMotion()
  const [type,setType] = useState<Kind>(() => options.find(o => o.id === params.get('jenis'))?.id || 'keluhan')
  const [drafts,setDrafts] = useState<Record<Kind,Draft>>({keluhan:blank(),aspirasi:blank(),mental_health:blank()})
  const [loading,setLoading] = useState(false)
  const [adding,setAdding] = useState(false)
  const [error,setError] = useState('')
  const [ticket,setTicket] = useState('')
  const [honey,setHoney] = useState('')
  const [drag,setDrag] = useState(false)
  const busy = useRef(false)
  const draft = drafts[type], mental = type === 'mental_health'
  const change = <K extends keyof Draft>(key:K,value:Draft[K]) => setDrafts(p => ({...p,[type]:{...p[type],[key]:value}}))

  async function addPhotos(files: FileList | File[] | null) {
    if (!files || adding || loading) return
    const list = Array.from(files)
    if (list.length + draft.photos.length > 5) { setError('Maksimal 5 foto.'); return }
    if (list.some(f => !['image/jpeg','image/png','image/webp'].includes(f.type) || f.size > 4*1024*1024)) { setError('Gunakan JPG, PNG, atau WebP dengan ukuran maksimal 4 MB per foto.'); return }
    setAdding(true); setError('')
    try {
      const photos = await Promise.all(list.map(file => new Promise<Photo>((resolve,reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve({file,preview:String(reader.result)})
        reader.onerror = () => reject(new Error('Foto gagal dibaca. Pilih ulang foto.'))
        reader.readAsDataURL(file)
      })))
      setDrafts(p => ({...p,[type]:{...p[type],photos:[...p[type].photos,...photos].slice(0,5)}}))
    } catch(e) { setError(e instanceof Error ? e.message : 'Foto gagal dibaca.') }
    finally { setAdding(false) }
  }
  async function submit(e:React.FormEvent) {
    e.preventDefault()
    if (busy.current || adding) return
    busy.current=true; setLoading(true); setError('')
    try {
      const attachments:string[]=[]
      for(const photo of draft.photos) {
        const body=new FormData(); body.append('file',photo.file)
        const r=await fetch('/api/upload',{method:'POST',body})
        const j=await r.json().catch(()=>({error:'Unggahan gagal. Periksa koneksi dan ukuran foto.'}))
        if(!r.ok) throw new Error(j.error)
        attachments.push(j.path)
      }
      const payload = { type,description:draft.description,attachments,honeypot:honey,...(mental ? {name:draft.name,contact:draft.contact} : {target:draft.target,category:draft.category,title:draft.title}) }
      const r=await fetch('/api/reports',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
      const j=await r.json().catch(()=>({error:'Server belum merespons. Coba lagi sebentar.'}))
      if(!r.ok) throw new Error(j.error + (j.reference ? ` Kode bantuan: ${j.reference}` : ''))
      if(!j.id) { setDrafts(p=>({...p,[type]:blank()})); toast.success('Pesan diterima.'); return }
      setTicket(j.id); setDrafts(p=>({...p,[type]:blank()})); window.scrollTo({top:0,behavior:'instant'})
    } catch(e) { setError(e instanceof Error ? e.message : 'Pengiriman gagal. Periksa koneksi kamu.') }
    finally { busy.current=false; setLoading(false) }
  }
  if(ticket) return <section className="form-page"><div className="glass-card success-panel">
    <CheckCircle2 size={44} strokeWidth={1.5} /><h1>Pesanmu sudah diterima.</h1><p>{mental ? 'Terima kasih sudah bercerita. Tim pengurus dapat menghubungimu melalui WhatsApp untuk tindak lanjut.' : 'Terima kasih sudah ikut membuat perubahan. Simpan tiket berikut untuk memantau tindak lanjut.'}</p>
    <div className="ticket-box"><code>{ticket}</code><button aria-label="Salin nomor tiket" onClick={async()=>{try{await navigator.clipboard.writeText(ticket);toast.success('Tiket disalin')}catch{toast.error('Salin tiket secara manual.')}}}><Copy size={19}/></button></div>
    <Link className="action-primary" to={'/lacak/'+ticket}>Lihat status laporan <ArrowUpRight size={18}/></Link><button className="text-button" onClick={()=>setTicket('')}>Kirim pesan lain</button>
  </div></section>

  return <section className="form-page">
    <header className="page-heading"><p>Suara Informatika</p><h1>{mental ? 'Kamu punya ruang untuk bercerita.' : 'Mulai dari suaramu.'}</h1><p>{mental ? 'Ceritakan dengan caramu sendiri. Tim pengurus akan membaca dan mendampingimu.' : 'Keluhan dan gagasanmu membantu kami melihat apa yang perlu diperbaiki.'}</p></header>
    <form onSubmit={submit} className="glass-card report-form">
      <input aria-hidden tabIndex={-1} autoComplete="off" className="hidden" value={honey} onChange={e=>setHoney(e.target.value)}/>
      <fieldset disabled={loading || adding}>
        <legend className="sr-only">Jenis dan isi laporan</legend>
        <div className="segmented" aria-label="Jenis laporan">{options.map(o=><button type="button" key={o.id} aria-pressed={type===o.id} onClick={()=>{setType(o.id);setError('')}}>
          {type===o.id && <motion.span className="segment-active" layoutId="report-type" transition={reduce ? {duration:0} : {type:'spring',bounce:0,duration:.3}}/>}<span>{o.label}</span>
        </button>)}</div>
        <div className="form-context">{mental ? <HeartHandshake size={21}/> : <ShieldCheck size={21}/>}<p>{mental ? 'Nama dan WhatsApp dapat dilihat tim pengurus yang berizin untuk menindaklanjuti ceritamu.' : 'Tanpa nama, NIM, atau nomor kontak. Simpan nomor tiket setelah mengirim.'}</p></div>
        {!mental && <div className="form-group"><label htmlFor="target">Ditujukan kepada</label><select id="target" value={draft.target} onChange={e=>change('target',e.target.value as ReportTarget)}><option value="jurusan">Jurusan Informatika</option><option value="himpunan">Himpunan Mahasiswa</option></select></div>}
        {mental ? <div className="field-pair"><div className="form-group"><label htmlFor="name">Nama <span>opsional</span></label><input id="name" value={draft.name} maxLength={100} autoComplete="name" onChange={e=>change('name',e.target.value)} placeholder="Nama panggilanmu"/></div><div className="form-group"><label htmlFor="contact">Nomor WhatsApp</label><input id="contact" required type="tel" inputMode="tel" autoComplete="tel" maxLength={24} value={draft.contact} onChange={e=>change('contact',e.target.value)} placeholder="08… atau +62…"/></div></div> : <>
          <div className="form-group"><label htmlFor="category">Kategori</label><select id="category" required value={draft.category} onChange={e=>change('category',e.target.value)}><option value="">Pilih kategori</option>{categories.map(c=><option key={c}>{c}</option>)}</select></div>
          <div className="form-group"><label htmlFor="title">Judul ringkas <span>{draft.title.length}/100</span></label><input id="title" required maxLength={100} value={draft.title} onChange={e=>change('title',e.target.value)} placeholder={type==='aspirasi' ? 'Ide yang ingin kamu bagikan' : 'Contoh: AC ruang lab tidak berfungsi'}/></div>
        </>}
        <div className="form-group"><label htmlFor="description">{mental ? 'Apa yang sedang kamu rasakan?' : 'Ceritakan lebih lengkap'}<span>{draft.description.length}/2000</span></label><textarea id="description" required rows={6} maxLength={2000} value={draft.description} onChange={e=>change('description',e.target.value)} placeholder={mental ? 'Mulai dari hal yang nyaman kamu ceritakan. Apa yang sedang kamu hadapi, dan dukungan seperti apa yang kamu butuhkan?' : 'Apa yang terjadi atau ingin kamu usulkan? Sertakan konteks dan harapanmu agar tim dapat menindaklanjuti.'}/></div>
        <div className="form-group"><label htmlFor="photos">{mental ? 'Lampiran pendukung' : 'Foto pendukung'}<span>opsional</span></label><label className={'upload-zone '+(drag?'dragging':'')} htmlFor="photos" onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);void addPhotos(e.dataTransfer.files)}}><Upload size={23}/><b>Pilih atau letakkan foto di sini</b><span>JPG, PNG, WebP · maksimal 4 MB · hingga 5 foto</span><input id="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e=>{void addPhotos(e.target.files);e.target.value=''}}/></label>
          {!!draft.photos.length && <div className="photo-previews">{draft.photos.map((p,i)=><div key={i}><img src={p.preview} alt={'Foto pendukung '+(i+1)}/><button type="button" aria-label={'Hapus foto '+(i+1)} onClick={()=>change('photos',draft.photos.filter((_,index)=>index!==i))}><X size={16}/></button></div>)}</div>}
        </div>
      </fieldset>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-submit"><p>{adding ? 'Menyiapkan foto…' : 'Periksa kembali pesanmu sebelum mengirim.'}</p><button type="submit" disabled={loading||adding} className="action-primary">{loading ? <><Loader2 size={18} className="animate-spin"/> Mengirim…</> : <>{mental ? 'Kirim cerita' : 'Kirim laporan'}<ArrowUpRight size={18}/></>}</button></div>
    </form>
    <p className="form-bottom-note">{mental ? 'Ruang konsultasi ini dikelola tim pengurus mahasiswa.' : 'Kamu bisa memantau laporan kapan saja dengan nomor tiket.'}</p>
  </section>
}
