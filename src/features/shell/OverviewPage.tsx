import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { TrendingUp, TrendingDown, Megaphone, MousePointerClick, Eye, DollarSign, ArrowRight } from 'lucide-react'
import { MOCK_CAMPAIGNS, generatePerformanceData } from '@/lib/mockData'
import { Card, StatusBadge } from '@/components/ui'
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string
  change: number
  icon: React.ReactNode
  color: string
}

function StatCard({ title, value, change, icon, color }: StatCardProps) {
  const positive = change >= 0
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">{title}</span>
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>{icon}</div>
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-100 font-display">{value}</p>
        <div className={`flex items-center gap-1 mt-1 text-xs ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          <span>{Math.abs(change)}% vs last month</span>
        </div>
      </div>
    </Card>
  )
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 shadow-xl">
      <p className="text-xs text-zinc-400 mb-2 font-mono">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-xs font-medium" style={{ color: p.color }}>
          {p.name}: <span className="text-zinc-200">{typeof p.value === 'number' && p.value > 1000 ? formatNumber(p.value, true) : p.value}</span>
        </p>
      ))}
    </div>
  )
}

export function OverviewPage() {
  const perfData = useMemo(() => generatePerformanceData(30), [])
  const last7 = perfData.slice(-7)

  const totalImpressions = perfData.reduce((s, d) => s + d.impressions, 0)
  const totalClicks = perfData.reduce((s, d) => s + d.clicks, 0)
  const totalConversions = perfData.reduce((s, d) => s + d.conversions, 0)
  const totalSpend = perfData.reduce((s, d) => s + d.spend, 0)

  const activeCampaigns = MOCK_CAMPAIGNS.filter((c) => c.status === 'active')

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 font-display">Overview</h1>
        <p className="text-sm text-zinc-500 mt-1">Performance snapshot — last 30 days</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Impressions"
          value={formatNumber(totalImpressions, true)}
          change={12.4}
          icon={<Eye className="w-4 h-4 text-cyan-400" />}
          color="bg-cyan-500/10"
        />
        <StatCard
          title="Clicks"
          value={formatNumber(totalClicks, true)}
          change={8.1}
          icon={<MousePointerClick className="w-4 h-4 text-brand-400" />}
          color="bg-brand-500/10"
        />
        <StatCard
          title="Conversions"
          value={formatNumber(totalConversions, true)}
          change={-3.2}
          icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
          color="bg-emerald-500/10"
        />
        <StatCard
          title="Total Spend"
          value={formatCurrency(totalSpend, true)}
          change={5.7}
          icon={<DollarSign className="w-4 h-4 text-amber-400" />}
          color="bg-amber-500/10"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Area Chart - Impressions + Clicks */}
        <Card className="xl:col-span-2" padding={false}>
          <div className="px-5 pt-4 pb-2 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-200 font-display">Traffic Trend</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Impressions & clicks over 30 days</p>
            </div>
          </div>
          <div className="h-48 px-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={perfData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="impGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="clkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#52525b', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: '#52525b', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} tickFormatter={(v) => formatNumber(v, true)} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="impressions" name="Impressions" stroke="#06b6d4" strokeWidth={1.5} fill="url(#impGrad)" />
                <Area type="monotone" dataKey="clicks" name="Clicks" stroke="#f97316" strokeWidth={1.5} fill="url(#clkGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Bar Chart - Weekly Revenue */}
        <Card padding={false}>
          <div className="px-5 pt-4 pb-2">
            <h3 className="text-sm font-semibold text-zinc-200 font-display">Weekly Revenue</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Last 7 days</p>
          </div>
          <div className="h-48 px-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#52525b', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: '#52525b' }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${formatNumber(v, true)}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Active Campaigns */}
      <Card padding={false}>
        <div className="px-5 py-4 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-semibold text-zinc-200 font-display">Active Campaigns</h3>
            <span className="text-xs bg-brand-500/15 text-brand-400 border border-brand-500/30 rounded-md px-1.5 py-0.5 font-mono">{activeCampaigns.length}</span>
          </div>
          <Link
            to="/campaigns"
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-brand-400 transition-colors"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-zinc-800/50">
          {activeCampaigns.map((c) => {
            const spendPct = c.budget > 0 ? (c.spent / c.budget) * 100 : 0
            return (
              <Link
                key={c.id}
                to={`/campaigns/${c.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-800/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">{c.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{c.owner} · {formatDate(c.startDate)}</p>
                </div>
                <StatusBadge status={c.status} />
                <div className="w-32 hidden xl:block">
                  <div className="flex justify-between text-xs text-zinc-500 mb-1">
                    <span>Budget</span>
                    <span>{Math.round(spendPct)}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all"
                      style={{ width: `${Math.min(spendPct, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-zinc-200 font-mono">{formatNumber(c.impressions, true)}</p>
                  <p className="text-xs text-zinc-500">impressions</p>
                </div>
              </Link>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
