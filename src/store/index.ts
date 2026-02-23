import { create } from 'zustand'
import { generateId } from '@/lib/utils'
import type { Toast, ToastVariant, Job, Campaign } from '@/types'

// ─── Toast Store ──────────────────────────────────────────────────────────────

interface ToastStore {
  toasts: Toast[]
  addToast: (title: string, description?: string, variant?: ToastVariant) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (title, description, variant = 'info') => {
    const id = generateId('toast')
    set((state) => ({
      toasts: [...state.toasts, { id, title, description, variant }],
    }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 5000)
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

// ─── Jobs Store ───────────────────────────────────────────────────────────────

interface JobsStore {
  jobs: Job[]
  setJobs: (jobs: Job[]) => void
  upsertJob: (job: Job) => void
  activePolling: Set<string>
  startPolling: (jobId: string) => void
  stopPolling: (jobId: string) => void
}

export const useJobsStore = create<JobsStore>((set) => ({
  jobs: [],
  setJobs: (jobs) => set({ jobs }),
  upsertJob: (job) =>
    set((state) => ({
      jobs: state.jobs.some((j) => j.id === job.id)
        ? state.jobs.map((j) => (j.id === job.id ? job : j))
        : [job, ...state.jobs],
    })),
  activePolling: new Set(),
  startPolling: (jobId) =>
    set((state) => {
      const next = new Set(state.activePolling)
      next.add(jobId)
      return { activePolling: next }
    }),
  stopPolling: (jobId) =>
    set((state) => {
      const next = new Set(state.activePolling)
      next.delete(jobId)
      return { activePolling: next }
    }),
}))

// ─── Campaigns Store ──────────────────────────────────────────────────────────

interface CampaignsStore {
  selectedIds: Set<string>
  toggleSelection: (id: string) => void
  toggleAll: (ids: string[]) => void
  clearSelection: () => void

  // Optimistic status map: campaignId → optimistic status
  optimisticStatuses: Map<string, Campaign['status']>
  setOptimisticStatus: (ids: string[], status: Campaign['status']) => void
  clearOptimisticStatuses: (ids: string[]) => void
}

export const useCampaignsStore = create<CampaignsStore>((set) => ({
  selectedIds: new Set(),
  toggleSelection: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds)
      next.has(id) ? next.delete(id) : next.add(id)
      return { selectedIds: next }
    }),
  toggleAll: (ids) =>
    set((state) => {
      const allSelected = ids.every((id) => state.selectedIds.has(id))
      const next = new Set(state.selectedIds)
      if (allSelected) {
        ids.forEach((id) => next.delete(id))
      } else {
        ids.forEach((id) => next.add(id))
      }
      return { selectedIds: next }
    }),
  clearSelection: () => set({ selectedIds: new Set() }),

  optimisticStatuses: new Map(),
  setOptimisticStatus: (ids, status) =>
    set((state) => {
      const next = new Map(state.optimisticStatuses)
      ids.forEach((id) => next.set(id, status))
      return { optimisticStatuses: next }
    }),
  clearOptimisticStatuses: (ids) =>
    set((state) => {
      const next = new Map(state.optimisticStatuses)
      ids.forEach((id) => next.delete(id))
      return { optimisticStatuses: next }
    }),
}))
