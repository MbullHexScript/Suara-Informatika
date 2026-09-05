import { createClient } from "@supabase/supabase-js"
const url = import.meta.env.VITE_SUPABASE_URL as string
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string
if (!url || !anon) console.warn("[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing")
export const supabase = createClient(url ?? "", anon ?? "")

export function supabaseAdmin() {
  const service = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string | undefined
  if (!service) return supabase
  return createClient(url, service)
}
