import { env, json, secretMatches, supaAdmin, logError } from '../_lib.js';
import { drainNotifications } from '../../backend/telegram.js';
export const maxDuration = 60;
export default async function handler(req,res) {
  if (!['GET','POST'].includes(req.method)) return json(res,405,{error:'Method not allowed'});
  if (!secretMatches(req.headers.authorization, env('CRON_SECRET') ? 'Bearer '+env('CRON_SECRET') : '')) return json(res,403,{error:'Forbidden'});
  try {
    const db = supaAdmin();
    const count = await drainNotifications(db);
    await db.from('request_limits').delete().lt('resets_at',new Date().toISOString());
    return json(res,200,{processed:count});
  } catch(e) { logError('notification retry',e); return json(res,503,{error:'Retry gagal'}); }
}
