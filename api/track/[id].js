import { cors, json, supaAdmin, UUID, logError } from '../_lib.js';
export default async function handler(req,res) {
  cors(res);
  if(req.method==='OPTIONS')return res.status(200).end();
  if(req.method!=='GET')return json(res,405,{error:'Method not allowed'});
  const id=req.query.id || new URL(req.url,'http://localhost').pathname.split('/').pop();
  if(!UUID.test(id))return json(res,400,{error:'Nomor tiket tidak valid'});
  try {
    const {data,error}=await supaAdmin().from('reports').select('id,type,title,status,category,target,created_at,updated_at').eq('id',id).maybeSingle();
    if(error)throw error;
    if(!data)return json(res,404,{error:'Tiket tidak ditemukan'});
    const {type,...publicData}=data;
    // Never expose legacy names that older versions stored as category/title.
    if(type==='mental_health')Object.assign(publicData,{title:'Konsultasi Mental Health',category:'Mental Health',target:null});
    return json(res,200,publicData);
  } catch(e) { logError('track',e);return json(res,503,{error:'Status belum dapat dimuat. Coba lagi sebentar.'}); }
}
