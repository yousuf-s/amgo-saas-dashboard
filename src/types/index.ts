// ─── Campaign Types ──────────────────────────────────────────────────────────

export type CampaignStatus = 'active' | 'paused' | 'draft' | 'completed' | 'failed'
export type CampaignChannel = 'email' | 'sms' | 'push' | 'in-app' | 'social'

export interface Campaign {
  id: string
  name: string
  status: CampaignStatus
  channel: CampaignChannel
  budget: number
  spent: number
  impressions: number
  clicks: number
  conversions: number
  ctr: number
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
  tags: string[]
  description: string
  targetAudience: string
  owner: string
}

export interface CampaignFilters {
  search: string
  status: CampaignStatus[]
  channel: CampaignChannel[]
  dateRange: { from: string; to: string } | null
}

export interface PaginationState {
  page: number
  pageSize: number
  total: number
}

// ─── Job / Simulation Types ──────────────────────────────────────────────────

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface Job {
  id: string
  campaignId: string
  campaignName: string
  type: 'export' | 'sync' | 'analysis' | 'report'
  status: JobStatus
  progress: number
  message: string
  createdAt: string
  updatedAt: string
  errorMessage?: string
}

// ─── Asset Types ─────────────────────────────────────────────────────────────

export type AssetStatus = 'uploading' | 'ready' | 'error'
export type AssetType = 'image' | 'video' | 'document' | 'csv'

export interface Asset {
  id: string
  name: string
  type: AssetType
  size: number
  status: AssetStatus
  progress: number
  url: string
  createdAt: string
}

// ─── Performance Types ────────────────────────────────────────────────────────

export interface PerformanceDataPoint {
  date: string
  impressions: number
  clicks: number
  conversions: number
  spend: number
  revenue: number
}

// ─── UI Types ────────────────────────────────────────────────────────────────

export type SortDirection = 'asc' | 'desc'

export interface SortState {
  field: keyof Campaign
  direction: SortDirection
}

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  variant: ToastVariant
  title: string
  description?: string
}
