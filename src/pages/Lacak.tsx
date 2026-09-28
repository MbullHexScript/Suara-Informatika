import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Search, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react'

type Info = { id:string; title:string; status:string; category:string; target:string|null; created_at:string; updated_at:string }
const labels:Record<string,string>={baru:'Diterima',diproses:'Sedang ditindaklanjuti',selesai:'Selesai',ditolak:'Tidak dapat diproses'}
export default function Lacak(){
  const {id}=useParams()
  const navigate=useNavigate()
  const [query,setQuery]=useState(id||'')
  const [result,setResult]=useState<{id:string;data?:Info;error?:string}|null>(null)
  const [validation,setValidation]=useState('')
  useEffect(()=>{
    if(!id) return
    const controller=new AbortController()
    fetch('/api/track/'+encodeURIComponent(id),{signal:controller.signal}).then(async r=>{
      const j=await r.json()
      if(!r.ok) throw new Error(j.error||'Tiket tidak ditemukan.')
      setResult({id,data:j})
    }).catch(e=>{if(!controller.signal.aborted)setResult({id,error:e.message})})
    return ()=>controller.abort()
  },[id])
  const current=result?.id===id?result:null
  const data=current?.data
  const loading=!!id&&!current
  return <section className="form-page"><header className="page-heading"><p>Ikuti perkembangannya</p><h1>Pesanmu, sudah sampai mana?</h1><p>Masukkan nomor tiket yang kamu terima setelah mengirim laporan.</p></header>
    <div className="glass-card report-form"><form onSubmit={e=>{e.preventDefault();if(!/^[0-9a-f-]{36}$/i.test(query.trim())){setValidation('Masukkan nomor tiket lengkap.');return}setValidation('');navigate('/lacak/'+query.trim())}}><div className="form-group"><label htmlFor="ticket">Nomor tiket</label><input id="ticket" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tempel nomor tiket di sini" required/></div><button className="action-primary" disabled={loading}>{loading?<Loader2 size={18} className="animate-spin"/>:<Search size={18}/>}Lacak laporan</button></form>
    {(validation||current?.error)&&<p className="form-error mt-6" role="alert">{validation||current?.error}</p>}
    {data&&<div className="mt-8 border-t border-white/15 pt-6 space-y-4" aria-live="polite"><div className="flex items-center gap-3">{data.status==='selesai'?<CheckCircle2/>:data.status==='ditolak'?<XCircle/>:<Clock/>}<h2 className="text-xl font-semibold">{labels[data.status]||data.status}</h2></div><p>{data.title}</p><p className="text-sm text-white/75">{data.category}{data.target?' · '+data.target:''}</p>{data.status!=='ditolak'&&<ol className="flex gap-2 text-xs">{['baru','diproses','selesai'].map((s,i)=><li key={s} className={'flex-1 rounded-xl p-3 text-center '+(i<=['baru','diproses','selesai'].indexOf(data.status)?'bg-white text-emerald-950':'bg-white/10 text-white/70')}>{labels[s]}</li>)}</ol>}<p className="text-xs text-white/75">Diperbarui {new Date(data.updated_at).toLocaleString('id-ID')}</p></div>}
    {!id&&<p className="mt-6 text-sm text-white/75">Belum punya tiket? <Link to="/laporan" className="underline underline-offset-4">Sampaikan pesanmu.</Link></p>}</div></section>
}
