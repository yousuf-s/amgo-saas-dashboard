import type { Campaign, Job, PerformanceDataPoint } from '@/types'

// ─── Seeded Mock Campaigns ────────────────────────────────────────────────────

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'cmp_001',
    name: 'Q1 Brand Awareness Push',
    status: 'active',
    channel: 'email',
    budget: 15000,
    spent: 8420,
    impressions: 284000,
    clicks: 14200,
    conversions: 1136,
    ctr: 5.0,
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    createdAt: '2025-12-20T09:00:00Z',
    updatedAt: '2026-02-15T14:30:00Z',
    tags: ['brand', 'awareness', 'q1'],
    description: 'Broad brand awareness campaign targeting new user acquisition across email channels with personalized messaging.',
    targetAudience: 'Ages 25-45, Tech-savvy professionals',
    owner: 'Priya Sharma',
  },
  {
    id: 'cmp_002',
    name: 'Retargeting High-Intent Users',
    status: 'active',
    channel: 'push',
    budget: 8000,
    spent: 4100,
    impressions: 92000,
    clicks: 7360,
    conversions: 883,
    ctr: 8.0,
    startDate: '2026-01-15',
    endDate: '2026-04-15',
    createdAt: '2026-01-10T11:00:00Z',
    updatedAt: '2026-02-18T09:00:00Z',
    tags: ['retargeting', 'high-intent', 'push'],
    description: 'Retarget users who visited pricing page but did not convert.',
    targetAudience: 'Website visitors, cart abandoners',
    owner: 'Rohan Mehta',
  },
  {
    id: 'cmp_003',
    name: 'SMB Outreach — February',
    status: 'paused',
    channel: 'email',
    budget: 5000,
    spent: 2200,
    impressions: 48000,
    clicks: 2160,
    conversions: 173,
    ctr: 4.5,
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    createdAt: '2026-01-28T08:00:00Z',
    updatedAt: '2026-02-10T16:00:00Z',
    tags: ['smb', 'outreach', 'february'],
    description: 'Targeted outreach to small and medium business decision-makers.',
    targetAudience: 'Business owners, C-suite, 10-200 employees',
    owner: 'Anjali Nair',
  },
  {
    id: 'cmp_004',
    name: 'Product Launch — v3.0',
    status: 'draft',
    channel: 'in-app',
    budget: 20000,
    spent: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    ctr: 0,
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    createdAt: '2026-02-10T10:00:00Z',
    updatedAt: '2026-02-20T11:00:00Z',
    tags: ['launch', 'product', 'v3'],
    description: 'In-app campaign announcing v3.0 feature set to existing users.',
    targetAudience: 'Existing paid users, all plans',
    owner: 'Vikram Patel',
  },
  {
    id: 'cmp_005',
    name: 'Holiday Social Blitz',
    status: 'completed',
    channel: 'social',
    budget: 12000,
    spent: 11800,
    impressions: 520000,
    clicks: 31200,
    conversions: 2184,
    ctr: 6.0,
    startDate: '2025-12-01',
    endDate: '2025-12-31',
    createdAt: '2025-11-15T09:00:00Z',
    updatedAt: '2026-01-02T10:00:00Z',
    tags: ['social', 'holiday', 'seasonal'],
    description: 'Seasonal social media campaign across all channels for holiday promotions.',
    targetAudience: 'All demographics, 18-55',
    owner: 'Priya Sharma',
  },
  {
    id: 'cmp_006',
    name: 'Enterprise ABM Wave 2',
    status: 'active',
    channel: 'email',
    budget: 25000,
    spent: 10500,
    impressions: 18500,
    clicks: 1295,
    conversions: 259,
    ctr: 7.0,
    startDate: '2026-02-01',
    endDate: '2026-05-31',
    createdAt: '2026-01-20T13:00:00Z',
    updatedAt: '2026-02-19T15:00:00Z',
    tags: ['enterprise', 'abm', 'b2b'],
    description: 'Account-based marketing targeting Fortune 500 prospects with personalized content.',
    targetAudience: 'Enterprise accounts >1000 employees',
    owner: 'Rohan Mehta',
  },
  {
    id: 'cmp_007',
    name: 'SMS Win-Back Series',
    status: 'failed',
    channel: 'sms',
    budget: 3000,
    spent: 1400,
    impressions: 24000,
    clicks: 720,
    conversions: 36,
    ctr: 3.0,
    startDate: '2026-01-20',
    endDate: '2026-02-20',
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-02-12T09:00:00Z',
    tags: ['sms', 'winback', 'churn'],
    description: 'Win-back campaign targeting churned users from last 90 days via SMS.',
    targetAudience: 'Churned users, last active 90-180 days ago',
    owner: 'Anjali Nair',
  },
  {
    id: 'cmp_008',
    name: 'Upsell Pro → Business',
    status: 'active',
    channel: 'in-app',
    budget: 0,
    spent: 0,
    impressions: 64000,
    clicks: 6400,
    conversions: 576,
    ctr: 10.0,
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    createdAt: '2025-12-28T12:00:00Z',
    updatedAt: '2026-02-20T08:00:00Z',
    tags: ['upsell', 'in-app', 'revenue'],
    description: 'In-app prompts encouraging Pro plan users to upgrade to Business tier.',
    targetAudience: 'Pro plan users with high usage',
    owner: 'Vikram Patel',
  },
]

// ─── Mock Jobs ────────────────────────────────────────────────────────────────

export const MOCK_JOBS: Job[] = [
  {
    id: 'job_001',
    campaignId: 'cmp_001',
    campaignName: 'Q1 Brand Awareness Push',
    type: 'analysis',
    status: 'completed',
    progress: 100,
    message: 'Analysis complete. 284K impressions processed.',
    createdAt: '2026-02-20T08:00:00Z',
    updatedAt: '2026-02-20T08:12:00Z',
  },
  {
    id: 'job_002',
    campaignId: 'cmp_006',
    campaignName: 'Enterprise ABM Wave 2',
    type: 'export',
    status: 'processing',
    progress: 62,
    message: 'Exporting contact segments...',
    createdAt: '2026-02-21T06:30:00Z',
    updatedAt: '2026-02-21T06:38:00Z',
  },
  {
    id: 'job_003',
    campaignId: 'cmp_005',
    campaignName: 'Holiday Social Blitz',
    type: 'report',
    status: 'completed',
    progress: 100,
    message: 'Final performance report generated.',
    createdAt: '2026-01-02T09:00:00Z',
    updatedAt: '2026-01-02T09:05:00Z',
  },
  {
    id: 'job_004',
    campaignId: 'cmp_007',
    campaignName: 'SMS Win-Back Series',
    type: 'sync',
    status: 'failed',
    progress: 34,
    message: 'Sync interrupted.',
    errorMessage: 'Contact list validation failed: duplicate phone numbers detected in segment.',
    createdAt: '2026-02-12T07:00:00Z',
    updatedAt: '2026-02-12T07:04:00Z',
  },
]

// ─── Performance Data Generator ───────────────────────────────────────────────

export function generatePerformanceData(days: number = 30): PerformanceDataPoint[] {
  const data: PerformanceDataPoint[] = []
  const now = new Date('2026-02-21')

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    const base = isWeekend ? 0.6 : 1
    const noise = () => 0.8 + Math.random() * 0.4

    const impressions = Math.round(8000 * base * noise())
    const ctr = 0.04 + Math.random() * 0.03
    const clicks = Math.round(impressions * ctr)
    const cvr = 0.07 + Math.random() * 0.05
    const conversions = Math.round(clicks * cvr)
    const spend = Math.round(impressions * 0.02 * base * noise())
    const revenue = conversions * (45 + Math.random() * 30)

    data.push({
      date: date.toISOString().slice(0, 10),
      impressions,
      clicks,
      conversions,
      spend,
      revenue: Math.round(revenue),
    })
  }

  return data
}
