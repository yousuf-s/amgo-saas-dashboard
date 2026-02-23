/**
 * Simulated API Service Layer
 *
 * All async operations are simulated here with configurable delays and
 * controlled error injection. UI components consume this layer via hooks,
 * keeping business logic completely separate from presentation.
 */

import type { Campaign, CampaignFilters, CampaignStatus, Job, Asset, PaginationState, SortState } from '@/types'
import { MOCK_CAMPAIGNS, MOCK_JOBS } from './mockData'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms))
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// In-memory mutable store
let campaignStore: Campaign[] = [...MOCK_CAMPAIGNS]
let jobStore: Job[] = [...MOCK_JOBS]
const assetStore: Map<string, Asset[]> = new Map()

// ─── Campaign Service ─────────────────────────────────────────────────────────

export interface FetchCampaignsResult {
  data: Campaign[]
  pagination: PaginationState
}

export const campaignService = {
  async fetchAll(
    filters: CampaignFilters,
    sort: SortState,
    pagination: Pick<PaginationState, 'page' | 'pageSize'>
  ): Promise<FetchCampaignsResult> {
    await delay(randomBetween(300, 700))

    let result = [...campaignStore]

    // Search filter
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.owner.toLowerCase().includes(q) ||
          c.tags.some((t) => t.includes(q))
      )
    }

    // Status filter
    if (filters.status.length > 0) {
      result = result.filter((c) => filters.status.includes(c.status))
    }

    // Channel filter
    if (filters.channel.length > 0) {
      result = result.filter((c) => filters.channel.includes(c.channel))
    }

    // Date range filter
    if (filters.dateRange) {
      const from = new Date(filters.dateRange.from)
      const to = new Date(filters.dateRange.to)
      result = result.filter((c) => {
        const start = new Date(c.startDate)
        return start >= from && start <= to
      })
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sort.field]
      const bVal = b[sort.field]
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sort.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sort.direction === 'asc' ? aVal - bVal : bVal - aVal
      }
      return 0
    })

    const total = result.length
    const start = (pagination.page - 1) * pagination.pageSize
    const paged = result.slice(start, start + pagination.pageSize)

    return {
      data: paged,
      pagination: { ...pagination, total },
    }
  },

  async fetchById(id: string): Promise<Campaign> {
    await delay(randomBetween(200, 500))
    const campaign = campaignStore.find((c) => c.id === id)
    if (!campaign) throw new Error(`Campaign ${id} not found`)
    return { ...campaign }
  },

  async updateStatus(ids: string[], status: CampaignStatus): Promise<Campaign[]> {
    await delay(randomBetween(400, 900))
    // Simulate occasional errors
    if (Math.random() < 0.05) {
      throw new Error('Status update failed: server conflict. Please retry.')
    }
    campaignStore = campaignStore.map((c) =>
      ids.includes(c.id)
        ? { ...c, status, updatedAt: new Date().toISOString() }
        : c
    )
    return campaignStore.filter((c) => ids.includes(c.id))
  },

  async update(id: string, data: Partial<Campaign>): Promise<Campaign> {
    await delay(randomBetween(500, 1000))
    const idx = campaignStore.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error(`Campaign ${id} not found`)
    campaignStore[idx] = {
      ...campaignStore[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    return { ...campaignStore[idx] }
  },
}

// ─── Job Service ──────────────────────────────────────────────────────────────

export const jobService = {
  async fetchByCampaign(campaignId: string): Promise<Job[]> {
    await delay(randomBetween(200, 400))
    return jobStore.filter((j) => j.campaignId === campaignId).map((j) => ({ ...j }))
  },

  async fetchAll(): Promise<Job[]> {
    await delay(randomBetween(200, 400))
    return [...jobStore]
  },

  async create(campaignId: string, campaignName: string, type: Job['type']): Promise<Job> {
    await delay(randomBetween(200, 400))
    const job: Job = {
      id: `job_${Date.now()}`,
      campaignId,
      campaignName,
      type,
      status: 'pending',
      progress: 0,
      message: 'Job queued.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    jobStore = [job, ...jobStore]
    return { ...job }
  },

  /**
   * Simulates polling — advances job state on each call.
   * Returns updated job state.
   */
  async poll(jobId: string): Promise<Job> {
    await delay(randomBetween(800, 1500))

    const idx = jobStore.findIndex((j) => j.id === jobId)
    if (idx === -1) throw new Error(`Job ${jobId} not found`)

    const job = { ...jobStore[idx] }

    if (job.status === 'pending') {
      job.status = 'processing'
      job.progress = randomBetween(5, 15)
      job.message = 'Initializing...'
    } else if (job.status === 'processing') {
      const increment = randomBetween(10, 25)
      job.progress = Math.min(job.progress + increment, 95)
      job.message = getProgressMessage(job.progress, job.type)

      // Simulate rare failure
      if (Math.random() < 0.08) {
        job.status = 'failed'
        job.errorMessage = 'An unexpected error occurred during processing. Please retry.'
        job.message = 'Job failed.'
      } else if (job.progress >= 95) {
        job.status = 'completed'
        job.progress = 100
        job.message = getCompletionMessage(job.type)
      }
    }

    job.updatedAt = new Date().toISOString()
    jobStore[idx] = job
    return { ...job }
  },
}

function getProgressMessage(progress: number, type: Job['type']): string {
  if (type === 'export') {
    if (progress < 30) return 'Preparing data segments...'
    if (progress < 60) return 'Exporting records...'
    return 'Finalizing export file...'
  }
  if (type === 'analysis') {
    if (progress < 30) return 'Loading campaign metrics...'
    if (progress < 60) return 'Running attribution models...'
    return 'Generating insights...'
  }
  if (type === 'sync') {
    if (progress < 30) return 'Fetching contact lists...'
    if (progress < 60) return 'Resolving deduplication...'
    return 'Writing synchronized records...'
  }
  // report
  if (progress < 30) return 'Aggregating performance data...'
  if (progress < 60) return 'Building visualizations...'
  return 'Composing final report...'
}

function getCompletionMessage(type: Job['type']): string {
  const messages: Record<Job['type'], string> = {
    export: 'Export complete. File ready for download.',
    analysis: 'Analysis complete. Insights available.',
    sync: 'Sync complete. Contacts updated.',
    report: 'Report generated successfully.',
  }
  return messages[type]
}

// ─── Asset Service ────────────────────────────────────────────────────────────

const ACCEPTED_ASSET_TYPES: Asset['type'][] = ['image', 'video', 'document', 'csv']

function inferAssetType(name: string): Asset['type'] {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image'
  if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return 'video'
  if (['csv', 'tsv'].includes(ext)) return 'csv'
  return 'document'
}

export const assetService = {
  async fetchByCampaign(campaignId: string): Promise<Asset[]> {
    await delay(randomBetween(200, 500))
    return assetStore.get(campaignId) ?? []
  },

  /**
   * Simulates a chunked upload with progress callbacks.
   */
  async upload(
    campaignId: string,
    file: { name: string; size: number },
    onProgress: (progress: number) => void
  ): Promise<Asset> {
    const asset: Asset = {
      id: `asset_${Date.now()}`,
      name: file.name,
      type: inferAssetType(file.name),
      size: file.size,
      status: 'uploading',
      progress: 0,
      url: `https://cdn.amgo.dev/assets/${campaignId}/${file.name}`,
      createdAt: new Date().toISOString(),
    }

    const existing = assetStore.get(campaignId) ?? []
    assetStore.set(campaignId, [...existing, asset])

    // Simulate progress
    let progress = 0
    while (progress < 100) {
      await delay(randomBetween(150, 350))
      progress = Math.min(progress + randomBetween(15, 30), 100)
      onProgress(progress)
      const idx = (assetStore.get(campaignId) ?? []).findIndex((a) => a.id === asset.id)
      if (idx !== -1) {
        const arr = assetStore.get(campaignId)!
        arr[idx] = { ...arr[idx], progress }
        assetStore.set(campaignId, arr)
      }
    }

    // Simulate occasional upload failure
    if (Math.random() < 0.1) {
      const arr = assetStore.get(campaignId)!
      const idx = arr.findIndex((a) => a.id === asset.id)
      if (idx !== -1) arr[idx] = { ...arr[idx], status: 'error', progress: 100 }
      assetStore.set(campaignId, arr)
      throw new Error(`Upload failed: ${file.name} could not be processed.`)
    }

    const arr = assetStore.get(campaignId)!
    const idx = arr.findIndex((a) => a.id === asset.id)
    if (idx !== -1) arr[idx] = { ...arr[idx], status: 'ready', progress: 100 }
    assetStore.set(campaignId, arr)

    return { ...arr[idx] }
  },

  async delete(campaignId: string, assetId: string): Promise<void> {
    await delay(randomBetween(300, 600))
    const arr = (assetStore.get(campaignId) ?? []).filter((a) => a.id !== assetId)
    assetStore.set(campaignId, arr)
  },
}

export { ACCEPTED_ASSET_TYPES }
