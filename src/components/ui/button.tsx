import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline"
  size?: "sm" | "md" | "lg"
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({className,variant="primary",size="md",...props},ref)=>{
  const base="inline-flex items-center justify-center font-medium transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f6bff]/30 rounded-full"
  const v = variant==="primary"?"bg-[#0b1220] text-white hover:bg-black shadow-[0_8px_24px_rgba(11,18,32,0.18)]":variant==="outline"?"bg-white border border-black/10 hover:bg-black/[0.03] text-[#0b1220]":"bg-transparent hover:bg-black/[0.04] text-[#0b1220]"
  const s = size==="sm"?"h-9 px-4 text-[13px]":size==="lg"?"h-12 px-7 text-[15px]":"h-11 px-6 text-[14px]"
  return <button ref={ref} className={cn(base,v,s,className)} {...props} />
})
Button.displayName="Button"
