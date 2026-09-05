import { cn } from "@/lib/utils"
export function Card({className,...p}:React.HTMLAttributes<HTMLDivElement>){ return <div className={cn("rounded-[20px] bg-white border border-black/5 shadow-[0_8px_30px_rgba(11,18,32,0.06)]",className)} {...p} /> }
export function CardHeader({className,...p}:React.HTMLAttributes<HTMLDivElement>){ return <div className={cn("p-6 pb-3",className)} {...p} /> }
export function CardContent({className,...p}:React.HTMLAttributes<HTMLDivElement>){ return <div className={cn("p-6 pt-3",className)} {...p} /> }
