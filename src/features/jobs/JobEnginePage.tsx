import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Cpu, CheckCircle, XCircle, Loader, Clock, ArrowRight, RefreshCw } from 'lucide-react'
import type { Job } from '@/types'
import { jobService } from '@/lib/apiService'
import { useJobsStore, useToastStore } from '@/store'
import { Button, ProgressBar, Skeleton, EmptyState, Card } from '@/components/ui'
import { formatRelativeTime, cn } from '@/lib/utils'

const STATUS_CONFIG = {
  pending: { icon: <Clock className="w-4 h-4" />, color: 'text-zinc-400', bg: 'bg-zinc-800/40 border-zinc-700/50' },
  processing: { icon: <Loader className="w-4 h-4 animate-spin" />, color: 'text-brand-400', bg: 'bg-brand-950/20 border-brand-500/30' },
  completed: { icon: <CheckCircle className="w-4 h-4" />, color: 'text-emerald-400', bg: 'bg-emerald-950/20 border-zinc-700/50' },
  failed: { icon: <XCircle className="w-4 h-4" />, color: 'text-rose-400', bg: 'bg-rose-950/20 border-rose-800/50' },
}

const FILTER_OPTIONS: (Job['status'] | 'all')[] = ['all', 'pending', 'processing', 'completed', 'failed']

export function JobEnginePage() {
  const { jobs, setJobs, upsertJob, activePolling, startPolling, stopPolling } = useJobsStore()
  const { addToast } = useToastStore()
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Job['status'] | 'all'>('all')

  useEffect(() => {
    let cancelled = false
    jobService.fetchAll().then((data) => {
      if (!cancelled) {
        setJobs(data)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [setJobs])

  const filtered = filter === 'all' ? jobs : jobs.filter((j) => j.status === filter)

  const counts = {
    pending: jobs.filter((j) => j.status === 'pending').length,
    processing: jobs.filter((j) => j.status === 'processing').length,
    completed: jobs.filter((j) => j.status === 'completed').length,
    failed: jobs.filter((j) => j.status === 'failed').length,
  }

  const pollJob = (jobId: string) => {
    startPolling(jobId)
    const schedulePoll = () => {
      setTimeout(async () => {
        try {
          const updated = await jobService.poll(jobId)
          upsertJob(updated)
          if (updated.status === 'completed') {
            stopPolling(jobId)
            addToast('Job completed', updated.message, 'success')
          } else if (updated.status === 'failed') {
            stopPolling(jobId)
            addToast('Job failed', updated.errorMessage ?? updated.message, 'error')
          } else {
            schedulePoll()
          }
        } catch {
          stopPolling(jobId)
        }
      }, 1500)
    }
    schedulePoll()
  }

  const handleRetry = (job: Job) => {
    const updated: Job = { ...job, status: 'pending', progress: 0, message: 'Job requeued.', errorMessage: undefined }
    upsertJob(updated)
    pollJob(job.id)
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 font-display">Job Engine</h1>
          <p className="text-sm text-zinc-500 mt-1">Frontend-simulated async job lifecycle</p>
        </div>
        <Button variant="ghost" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={() => window.location.reload()}>
          Reload
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {Object.entries(counts).map(([status, count]) => {
          const cfg = STATUS_CONFIG[status as Job['status']]
          return (
            <Card key={status} className="flex items-center gap-3">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', cfg.bg)}>
                <span className={cfg.color}>{cfg.icon}</span>
              </div>
              <div>
                <p className="text-lg font-bold text-zinc-100 font-display leading-none">{count}</p>
                <p className="text-xs text-zinc-500 capitalize">{status}</p>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Filter */}
      <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl w-fit">
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium font-mono capitalize transition-colors',
              filter === f ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            {f}
            {f !== 'all' && counts[f] > 0 && (
              <span className="ml-1.5 text-xs bg-zinc-600 rounded px-1">{counts[f]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Job List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Cpu className="w-8 h-8" />}
          title="No jobs"
          description="Jobs triggered from campaign detail pages will appear here."
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((job) => {
            const cfg = STATUS_CONFIG[job.status]
            const isPolling = activePolling.has(job.id)
            return (
              <div
                key={job.id}
                className={cn('p-4 rounded-xl border transition-all', cfg.bg)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn('mt-0.5 shrink-0', cfg.color)}>{cfg.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-zinc-200 capitalize font-display">{job.type}</span>
                      <span className={cn('text-xs font-mono', cfg.color)}>· {job.status}</span>
                      {isPolling && (
                        <span className="text-xs text-zinc-600 font-mono animate-pulse">live polling</span>
                      )}
                      <Link
                        to={`/campaigns/${job.campaignId}`}
                        className="flex items-center gap-1 text-xs text-zinc-600 hover:text-brand-400 transition-colors ml-auto"
                      >
                        {job.campaignName} <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">{job.message}</p>
                    {job.errorMessage && (
                      <p className="text-xs text-rose-400 mt-1 leading-relaxed">{job.errorMessage}</p>
                    )}
                    {(job.status === 'processing' || job.status === 'completed') && (
                      <div className="mt-2">
                        <ProgressBar
                          value={job.progress}
                          variant={job.status === 'completed' ? 'emerald' : 'brand'}
                          size="xs"
                          showLabel
                        />
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-xs text-zinc-600 font-mono whitespace-nowrap">{formatRelativeTime(job.updatedAt)}</p>
                    {job.status === 'failed' && (
                      <button
                        onClick={() => handleRetry(job)}
                        className="text-xs text-brand-400 hover:text-brand-300 mt-1 transition-colors"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Legend */}
      <div className="pt-2 border-t border-zinc-800">
        <p className="text-xs text-zinc-600 font-mono">
          Job lifecycle: <span className="text-zinc-500">pending → processing → completed / failed</span>
          {' · '}polling interval: ~1.5s · occasional failure rate: ~8%
        </p>
      </div>
    </div>
  )
}
