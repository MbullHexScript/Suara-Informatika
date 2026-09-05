import Papa from "papaparse"
import type { Report } from "@/types"

export function generateCSV(reports: Report[]): string {
  const rows = reports.map((r) => ({
    id: r.id,
    jenis: r.type,
    target: r.target,
    kategori: r.category,
    judul: r.title,
    deskripsi: r.description,
    jumlah_lampiran: Array.isArray(r.attachments) ? r.attachments.length : 0,
    status: r.status,
    catatan_admin: r.admin_notes ?? "",
    dibuat_pada: new Date(r.created_at).toLocaleString("id-ID", { timeZone: "Asia/Makassar" }),
  }))
  return Papa.unparse(rows, { quotes: true, header: true })
}

export function generateSummary(reports: Report[]): string {
  const total = reports.length
  const byType = reports.reduce((acc, r) => { acc[r.type] = (acc[r.type] || 0) + 1; return acc }, {} as Record<string, number>)
  const byTarget = reports.reduce((acc, r) => { acc[r.target] = (acc[r.target] || 0) + 1; return acc }, {} as Record<string, number>)
  const baru = reports.filter((r) => r.status === "baru").length
  return `Ringkasan Laporan\nTotal: ${total}\nKeluhan: ${byType.keluhan || 0} | Kritik: ${byType.kritik || 0} | Saran: ${byType.saran || 0}\nJurusan: ${byTarget.jurusan || 0} | Himpunan: ${byTarget.himpunan || 0}\nBelum diproses (Baru): ${baru}`
}
