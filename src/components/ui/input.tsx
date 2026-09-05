import * as React from "react"
import { cn } from "@/lib/utils"
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({className,...p},ref)=>
  <input ref={ref} className={cn("w-full h-11 px-4 rounded-2xl bg-white border border-black/10 text-[14px] placeholder:text-[#9aa0b2] focus:outline-none focus:ring-2 focus:ring-[#2f6bff]/20 focus:border-[#2f6bff]/30 transition",className)} {...p} />)
Input.displayName="Input"
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({className,...p},ref)=>
  <textarea ref={ref} className={cn("w-full min-h-[120px] p-4 rounded-2xl bg-white border border-black/10 text-[14px] leading-relaxed placeholder:text-[#9aa0b2] focus:outline-none focus:ring-2 focus:ring-[#2f6bff]/20 focus:border-[#2f6bff]/30 transition",className)} {...p} />)
Textarea.displayName="Textarea"
