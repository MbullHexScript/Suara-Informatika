export type ReportType = 'keluhan' | 'kritik' | 'saran'
export type ReportTarget = 'jurusan' | 'himpunan'
export type ReportStatus = 'baru' | 'diproses' | 'selesai' | 'ditolak'
export type ReportCategory = 'Akademik' | 'Fasilitas' | 'Dosen/Pengajaran' | 'Administrasi' | 'Kegiatan Kemahasiswaan' | 'Himpunan' | 'Lainnya'

export interface Report {
  id: string
  type: ReportType
  target: ReportTarget
  category: ReportCategory | string
  title: string
  description: string
  attachments: string[]
  status: ReportStatus
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export interface ReportFilter {
  type?: ReportType
  target?: ReportTarget
  category?: string
  status?: ReportStatus
  date_from?: string
  date_to?: string
  search?: string
  page?: number
  per_page?: number
}

export interface PaginatedReports {
  data: Report[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface CreateReportPayload {
  type: ReportType
  target: ReportTarget
  category: string
  title: string
  description: string
  attachments?: string[]
  honeypot?: string
}
