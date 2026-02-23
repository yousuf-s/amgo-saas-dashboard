import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { useCampaign } from '@/hooks'
import { Tabs, Card, StatusBadge, ChannelBadge, Skeleton, Button } from '@/components/ui'
import { OverviewTab } from './OverviewTab'
import { AssetsTab } from './AssetsTab'
import { PerformanceTab } from './PerformanceTab'
import { JobsTab } from './JobsTab'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils'
import { LayoutDashboard, FolderOpen, BarChart2, Cpu } from 'lucide-react'

const TABS = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
  { id: 'assets', label: 'Assets', icon: <FolderOpen className="w-3.5 h-3.5" /> },
  { id: 'performance', label: 'Performance', icon: <BarChart2 className="w-3.5 h-3.5" /> },
  { id: 'jobs', label: 'Jobs', icon: <Cpu className="w-3.5 h-3.5" /> },
]

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const { campaign, loading, error, update } = useCampaign(id!)

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center gap-4 py-24">
        <p className="text-rose-400">{error}</p>
        <Button variant="outline" onClick={() => navigate('/campaigns')}>Back to Campaigns</Button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Link to="/campaigns" className="hover:text-zinc-300 transition-colors flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" />
          Campaigns
        </Link>
        <span>/</span>
        {loading ? (
          <Skeleton className="h-4 w-32" />
        ) : (
          <span className="text-zinc-300">{campaign?.name}</span>
        )}
      </div>

      {/* Campaign Header */}
      <Card>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        ) : campaign ? (
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <h1 className="text-xl font-bold text-zinc-100 font-display">{campaign.name}</h1>
                <StatusBadge status={campaign.status} />
                <ChannelBadge channel={campaign.channel} />
              </div>
              <p className="text-sm text-zinc-500 max-w-xl">{campaign.description}</p>
              <div className="flex items-center gap-4 mt-3">
                {[
                  { label: 'Budget', value: formatCurrency(campaign.budget, true) },
                  { label: 'Spent', value: formatCurrency(campaign.spent, true) },
                  { label: 'Impressions', value: formatNumber(campaign.impressions, true) },
                  { label: 'CTR', value: formatPercent(campaign.ctr) },
                  { label: 'Conversions', value: formatNumber(campaign.conversions, true) },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-sm font-bold text-zinc-200 font-mono">{stat.value}</p>
                    <p className="text-xs text-zinc-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
                Preview
              </button>
            </div>
          </div>
        ) : null}
      </Card>

      {/* Tabs */}
      <Card padding={false}>
        <div className="px-5">
          <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <div className="p-5">
          {activeTab === 'overview' && campaign && (
            <OverviewTab campaign={campaign} onUpdate={update} />
          )}
          {activeTab === 'assets' && <AssetsTab campaignId={id!} />}
          {activeTab === 'performance' && <PerformanceTab campaignId={id!} />}
          {activeTab === 'jobs' && campaign && <JobsTab campaign={campaign} />}
        </div>
      </Card>
    </div>
  )
}
