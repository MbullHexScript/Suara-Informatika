import { useEffect, useState } from "react"
export function useReducedMotion(){ const [v,set]=useState(false); useEffect(()=>{ const m=matchMedia("(prefers-reduced-motion: reduce)"); const h=()=>set(m.matches); h(); m.addEventListener("change",h); return ()=>m.removeEventListener("change",h)},[]); return v }
