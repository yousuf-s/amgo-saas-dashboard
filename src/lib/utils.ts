import { clsx, type ClassValue } from 'clsx'
import type { CampaignStatus, CampaignChannel } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCurrency(value: number, compact = false): string {
  if (compact && value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number, compact = false): string {
  if (compact && value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`
  }
  if (compact && value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return new Intl.NumberFormat('en-IN').format(value)
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(dateStr)
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const STATUS_STYLES: Record<CampaignStatus, string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  paused: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  draft: 'bg-surface-200/30 text-zinc-400 border border-zinc-700/50',
  completed: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
  failed: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
}

export const CHANNEL_STYLES: Record<CampaignChannel, string> = {
  email: 'bg-violet-500/15 text-violet-400 border border-violet-500/30',
  sms: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
  push: 'bg-brand-500/15 text-brand-400 border border-brand-500/30',
  'in-app': 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
  social: 'bg-pink-500/15 text-pink-400 border border-pink-500/30',
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}
