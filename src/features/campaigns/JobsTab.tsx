import { Plus, CheckCircle, XCircle, Loader, Clock, Cpu } from 'lucide-react'
import type { Campaign, Job } from '@/types'
import { useCampaignJobs } from '@/hooks'
import { Button, ProgressBar, Skeleton, EmptyState } from '@/components/ui'
import { formatRelativeTime, cn } from '@/lib/utils'

const JOB_TYPES: Job['type'][] = ['analysis', 'export', 'report', 'sync']

const STATUS_CONFIG: Record<Job['status'], { icon: React.ReactNode; color: string; label: string }> = {
  pending: {
    icon: <Clock className="w-4 h-4" />,
    color: 'text-zinc-400',
    label: 'Pending',
  },
  processing: {
    icon: <Loader className="w-4 h-4 animate-spin" />,
    color: 'text-brand-400',
    label: 'Processing',
  },
  completed: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'text-emerald-400',
    label: 'Completed',
  },
  failed: {
    icon: <XCircle className="w-4 h-4" />,
    color: 'text-rose-400',
    label: 'Failed',
  },
}

interface JobsTabProps {
  campaign: Campaign
}

export function JobsTab({ campaign }: JobsTabProps) {
  const { jobs, loading, createJob, activePolling } = useCampaignJobs(campaign.id)

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Trigger Jobs */}
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3">Trigger a Job</p>
        <div className="flex flex-wrap gap-2">
          {JOB_TYPES.map((type) => (
            <Button
              key={type}
              variant="outline"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => createJob(type, campaign.name)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Job List */}
      {jobs.length === 0 ? (
        <EmptyState
          icon={<Cpu className="w-8 h-8" />}
          title="No jobs yet"
          description="Trigger a job above to start processing for this campaign."
        />
      ) : (
        <div className="space-y-2.5">
          {jobs.map((job) => {
            const config = STATUS_CONFIG[job.status]
            const isPolling = activePolling.has(job.id)
            return (
              <div
                key={job.id}
                className={cn(
                  'p-4 rounded-xl border transition-colors',
                  job.status === 'failed'
                    ? 'border-rose-800/50 bg-rose-950/20'
                    : job.status === 'processing'
                    ? 'border-brand-500/30 bg-brand-950/20'
                    : 'border-zinc-700/50 bg-zinc-800/30'
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn('shrink-0', config.color)}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-200 capitalize">{job.type}</span>
                      <span className={cn('text-xs font-mono', config.color)}>· {config.label}</span>
                      {isPolling && (
                        <span className="text-xs text-zinc-600 font-mono">polling...</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">{job.message}</p>
                    {job.errorMessage && (
                      <p className="text-xs text-rose-400 mt-1 leading-relaxed">{job.errorMessage}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-zinc-600 font-mono">{formatRelativeTime(job.updatedAt)}</p>
                    {job.status === 'processing' && (
                      <p className="text-xs font-mono text-brand-400 mt-0.5">{job.progress}%</p>
                    )}
                  </div>
                </div>
                {(job.status === 'processing' || job.status === 'completed') && (
                  <ProgressBar
                    value={job.progress}
                    variant={job.status === 'completed' ? 'emerald' : 'brand'}
                    size="xs"
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
