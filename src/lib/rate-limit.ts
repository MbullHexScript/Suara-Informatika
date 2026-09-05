type Entry = { count: number; resetAt: number }
const store = new Map<string, Entry>()
setInterval(() => { const now = Date.now(); for (const [k,v] of store) if (now>v.resetAt) store.delete(k) }, 5*60*1000)
export function rateLimit(ip: string, limit=5, windowMs=60*60*1000){
  const now=Date.now(), key=`rl:${ip}`, e=store.get(key)
  if(!e||now>e.resetAt){ const resetAt=now+windowMs; store.set(key,{count:1,resetAt}); return {success:true,remaining:limit-1,resetAt} }
  if(e.count>=limit) return {success:false,remaining:0,resetAt:e.resetAt}
  e.count+=1; return {success:true,remaining:limit-e.count,resetAt:e.resetAt}
}
export function getClientIp(req: Request): string {
  const f=req.headers.get("x-forwarded-for"), r=req.headers.get("x-real-ip")
  if(f) return f.split(",")[0].trim()
  if(r) return r
  return "unknown"
}
