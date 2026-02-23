import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/features/shell/AppLayout'
import { OverviewPage } from '@/features/shell/OverviewPage'
import { CampaignListPage } from '@/features/campaigns/CampaignListPage'
import { CampaignDetailPage } from '@/features/campaigns/CampaignDetailPage'
import { JobEnginePage } from '@/features/jobs/JobEnginePage'
import { SettingsPage } from '@/features/shell/SettingsPage'
import { ToastContainer } from '@/components/ui/ToastContainer'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/campaigns" element={<CampaignListPage />} />
          <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
          <Route path="/jobs" element={<JobEnginePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  )
}
