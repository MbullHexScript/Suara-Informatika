import { readFile, writeFile } from 'node:fs/promises';
import { randomBytes, createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import dotenv from 'dotenv';

const root = fileURLToPath(new URL('../', import.meta.url));
dotenv.config({ path: resolve(root,'.env'), quiet:true });
const E = process.env;
const command = process.argv[2] || 'diagnose';
const base = E.APP_URL || E.VITE_APP_URL || 'https://suarainformatika.vercel.app';
const url = E.SUPABASE_URL || E.VITE_SUPABASE_URL;
const key = E.SUPABASE_SERVICE_ROLE_KEY;
function required(name) { if (!E[name]) throw new Error('Isi '+name+' di .env lokal terlebih dahulu.'); return E[name]; }
async function request(endpoint, options = {}) {
  let response;
  try { response = await fetch(endpoint,{...options,signal:AbortSignal.timeout(20000)}); }
  catch(e) { throw new Error('Koneksi gagal: '+(e.cause?.code || e.name)); }
  const data = await response.json().catch(()=>({message:'Respons bukan JSON'}));
  if(!response.ok || data.ok === false) {
    // Do not print tokens, request headers, or private report bodies.
    throw new Error(`HTTP ${response.status}: ${data.code || data.error_code || 'REQUEST_FAILED'} — ${String(data.message || data.description || data.error || '').replace(/https?:\/\/\S+/g,'[URL]').slice(0,250)}`);
  }
  return data;
}
function dbHeaders() { required('SUPABASE_SERVICE_ROLE_KEY'); return { apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json' }; }
async function tg(method,body={}) {
  return request('https://api.telegram.org/bot'+required('TELEGRAM_BOT_TOKEN')+'/'+method,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
}
async function sql(query) {
  const ref = new URL(url).hostname.split('.')[0];
  return request('https://api.supabase.com/v1/projects/'+ref+'/database/query',{method:'POST',headers:{Authorization:'Bearer '+required('SUPABASE_ACCESS_TOKEN'),'Content-Type':'application/json'},body:JSON.stringify({query})});
}
const literal = value => "'"+String(value).replace(/'/g,"''")+"'";
async function checkSchema() {
  if (E.SUPABASE_URL && E.VITE_SUPABASE_URL && E.SUPABASE_URL.replace(/\/$/,'') !== E.VITE_SUPABASE_URL.replace(/\/$/,'')) throw new Error('SUPABASE_URL dan VITE_SUPABASE_URL menunjuk project berbeda. Samakan keduanya.');
  await request(url+'/rest/v1/reports?select=id,name,contact&limit=0',{headers:dbHeaders()});
  await request(url+'/rest/v1/bot_members?select=telegram_id&limit=0',{headers:dbHeaders()});
}
async function checkRelease() {
  const health=await request(base+'/api/health');
  if(health.release!=='bot-members-v1')throw new Error('Production masih menggunakan kode lama. Deploy kode bot-members-v1 dahulu.');
}

try {
  if(command==='prepare') {
    const path=resolve(root,'.env');
    const old=dotenv.parse(await readFile(path,'utf8'));
    const vars={...old};
    vars.SUPABASE_URL ||= vars.VITE_SUPABASE_URL;
    vars.SUPABASE_SERVICE_ROLE_KEY ||= vars.VITE_SUPABASE_SERVICE_ROLE_KEY;
    vars.TELEGRAM_BOT_TOKEN ||= vars.VITE_TELEGRAM_BOT_TOKEN;
    vars.TELEGRAM_ADMIN_CHAT_ID ||= vars.VITE_TELEGRAM_ADMIN_CHAT_ID;
    vars.TELEGRAM_OWNER_ID ||= /^\d+$/.test(vars.TELEGRAM_ADMIN_CHAT_ID || '') ? vars.TELEGRAM_ADMIN_CHAT_ID : '';
    vars.APP_URL=vars.VITE_APP_URL='https://suarainformatika.vercel.app';
    vars.CRON_SECRET ||= randomBytes(32).toString('hex');
    vars.TELEGRAM_WEBHOOK_SECRET ||= randomBytes(32).toString('hex');
    for(const k of ['VITE_SUPABASE_SERVICE_ROLE_KEY','VITE_TELEGRAM_BOT_TOKEN','VITE_TELEGRAM_ADMIN_CHAT_ID']) delete vars[k];
    const serialize = o => Object.entries(o).map(([k,v])=>k+'='+JSON.stringify(v || '')).join('\n')+'\n';
    await writeFile(path,serialize(vars),{mode:0o600});
    const deployed=Object.fromEntries(['VITE_SUPABASE_URL','VITE_SUPABASE_ANON_KEY','VITE_APP_URL','SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','APP_URL','TELEGRAM_BOT_TOKEN','TELEGRAM_WEBHOOK_SECRET','TELEGRAM_OWNER_ID','TELEGRAM_ADMIN_CHAT_ID','CRON_SECRET'].map(k=>[k,vars[k]]));
    await writeFile(resolve(root,'.env.vercel'),serialize(deployed),{mode:0o600});
    console.log('Env dinormalisasi; file import: .env.vercel (diabaikan Git). prepare tidak mengganti token/key lama yang bocor. Ganti melalui dashboard penerbit, lalu prepare ulang.');
  } else if(command==='diagnose') {
    let failures=0;
    const check=async(label,fn)=>{try{await fn();console.log('LULUS '+label)}catch(e){failures++;console.log('GAGAL '+label+': '+e.message)}};
    await check('Production versi terbaru',checkRelease);
    await check('Supabase dan migrasi 003',checkSchema);
    await check('Token bot',()=>tg('getMe'));
    await check('Webhook',async()=>{
      const {result}=await tg('getWebhookInfo');
      console.log('Webhook URL:',result.url || '(belum dipasang)','; antrean:',result.pending_update_count);
      if(result.url !== base+'/api/telegram/webhook') throw new Error('URL webhook belum sesuai.');
      if(result.last_error_message) console.log('Error terakhir Telegram (bisa historis):',result.last_error_message);
    });
    process.exitCode=failures?1:0;
  } else if(command==='migrate') {
    await sql('create table if not exists public.app_migrations (name text primary key, checksum text not null, applied_at timestamptz default now()); alter table public.app_migrations enable row level security; revoke all on public.app_migrations from anon,authenticated;');
    for(const name of ['002_mental_health.sql','003_bot_members_and_delivery.sql']) {
      const text=await readFile(resolve(root,'supabase/migrations',name),'utf8');
      const checksum=createHash('sha256').update(text).digest('hex');
      const rows=await sql('select checksum from public.app_migrations where name='+literal(name));
      if(rows.length) {if(rows[0].checksum!==checksum)throw new Error('Migrasi sudah pernah diterapkan dengan isi berbeda: '+name);console.log('Sudah diterapkan:',name);continue}
      await sql(text);
      await sql('insert into public.app_migrations(name,checksum) values('+literal(name)+','+literal(checksum)+')');
      console.log('Migrasi berhasil:',name);
    }
  } else if(command==='bootstrap') {
    const owner=required('TELEGRAM_OWNER_ID');
    if(!/^\d+$/.test(owner))throw new Error('TELEGRAM_OWNER_ID harus User ID positif, bukan ID grup.');
    const email=required('WEB_ADMIN_EMAIL');
    const users=await sql('select id from auth.users where lower(email)=lower('+literal(email)+')');
    if(users.length!==1)throw new Error('Akun admin belum ada di Supabase Authentication. Buat akun dengan email tersebut dahulu.');
    const chats=required('TELEGRAM_ADMIN_CHAT_ID').split(',').map(x=>x.trim());
    if(chats.some(x=>! /^-?\d+$/.test(x)))throw new Error('Chat ID harus angka.');
    await sql('begin; insert into public.bot_members(telegram_id,chat_id,role,display_name) values('+literal(owner)+','+literal(owner)+",'owner','Pemilik') on conflict(telegram_id) do update set role='owner',active=true; insert into public.web_admins(user_id) values("+literal(users[0].id)+') on conflict do nothing; '+chats.map(c=>'insert into public.bot_destinations(chat_id) values('+literal(c)+') on conflict(chat_id) do update set active=true;').join(' ')+' commit;');
    console.log('Pemilik bot, chat admin lama, dan admin web terdaftar.');
  } else if(command==='webhook') {
    await checkSchema();
    await checkRelease();
    const {result:bot}=await tg('getMe');
    await tg('setWebhook',{url:base+'/api/telegram/webhook',secret_token:required('TELEGRAM_WEBHOOK_SECRET'),allowed_updates:['message','callback_query'],drop_pending_updates:false});
    const info=await tg('getWebhookInfo');
    if(info.result.url!==base+'/api/telegram/webhook')throw new Error('Verifikasi webhook gagal.');
    console.log('Webhook terpasang untuk @'+bot.username+'. Kirim /start dari akun pemilik untuk verifikasi balasan.');
  } else if(command==='retry') {
    const result=await request(base+'/api/telegram/retry',{method:'POST',headers:{Authorization:'Bearer '+required('CRON_SECRET')}});
    console.log('Antrean diproses:',result.processed);
  } else if(command==='smoke') {
    if(!process.argv.includes('--send'))throw new Error('Gunakan smoke --send untuk membuat laporan uji dan notifikasi nyata.');
    await checkRelease();
    await checkSchema();
    const marker='[UJI SISTEM] '+new Date().toISOString();
    for(const type of ['keluhan','aspirasi','mental_health']) {
      const body={type,target:'jurusan',category:'Akademik',title:marker,description:marker+' — laporan uji teknis, bukan permintaan mahasiswa.',attachments:[],...(type==='mental_health'?{name:'Pengujian sistem',contact:required('TEST_WHATSAPP')}:{})};
      const report=await request(base+'/api/reports',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      if(!report.success || !report.id)throw new Error('Tidak ada tiket untuk '+type);
      console.log('Laporan uji tersimpan:',type,report.id);
      const tracked=await request(base+'/api/track/'+report.id);
      if(tracked.status!=='baru')throw new Error('Status tiket salah.');
      const jobs=await request(url+'/rest/v1/notification_jobs?report_id=eq.'+report.id+'&select=state',{headers:dbHeaders()});
      if(!jobs.length||jobs.some(j=>j.state!=='sent'))throw new Error('Notifikasi belum semua terkirim; periksa notification_jobs.');
      console.log('LULUS tracking + notifikasi',type);
    }
  } else throw new Error('Perintah: prepare | diagnose | migrate | bootstrap | webhook | retry | smoke --send');
} catch(e) { console.error('GAGAL:',e.message?.replace(/https?:\/\/\S+/g,'[URL]'));process.exitCode=1; }
