import { env, json, supaAdmin, secretMatches, logError } from '../_lib.js';
import { createBot } from '../../backend/telegram.js';
export const maxDuration = 60;
export default async function handler(req,res) {
  if (req.method !== 'POST') return json(res,405,{error:'Method not allowed'});
  if (!secretMatches(req.headers['x-telegram-bot-api-secret-token'],env('TELEGRAM_WEBHOOK_SECRET'))) return json(res,403,{error:'Forbidden'});
  let update;
  try { update = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
  catch { return json(res,400,{error:'JSON tidak valid'}); }
  if (!Number.isSafeInteger(update?.update_id)) return json(res,400,{error:'update_id tidak valid'});
  let db;
  try {
    db = supaAdmin();
    const claim = await db.rpc('claim_bot_update',{p_id:update.update_id});
    if (claim.error) throw claim.error;
    if (!claim.data) {
      const previous = await db.from('bot_updates').select('done').eq('update_id',update.update_id).single();
      if (previous.error) throw previous.error;
      return previous.data.done ? json(res,200,{ok:true}) : json(res,503,{error:'Update sedang diproses'});
    }
    await createBot({db}).receive(update);
    const saved = await db.from('bot_updates').update({done:true}).eq('update_id',update.update_id);
    if (saved.error) throw saved.error;
    return json(res,200,{ok:true});
  } catch(e) {
    logError('telegram webhook',e);
    if(db) await db.from('bot_updates').update({locked_until:new Date().toISOString()}).eq('update_id',update.update_id).eq('done',false);
    return json(res,503,{error:'Pemrosesan belum selesai, silakan ulangi.'});
  }
}
