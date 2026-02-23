# Amgo — Campaign Intelligence Dashboard

A production-grade SaaS dashboard built for the AMGO Games & The Sunday Games Frontend Engineering Assessment.

## 🚀 Live Demo

> Deploy to Vercel: `vercel --prod` after installing dependencies.

## 🛠 Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React 18 + Vite | Fast HMR, modern React features |
| Language | TypeScript (strict) | End-to-end type safety |
| Styling | Tailwind CSS | Utility-first, zero-runtime |
| State | Zustand | Minimal, ergonomic, no boilerplate |
| Forms | React Hook Form + Zod | Performant forms with schema validation |
| Charts | Recharts | Composable, accessible data viz |
| Routing | React Router v6 | Declarative, nested routes |

---

## 📁 Project Architecture

```
src/
├── features/                   # Feature-based modules
│   ├── shell/                  # App layout, sidebar, overview page, settings
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── OverviewPage.tsx
│   │   └── SettingsPage.tsx
│   ├── campaigns/              # All campaign-related views
│   │   ├── CampaignListPage.tsx   # Sortable table, filters, pagination, bulk ops
│   │   ├── CampaignDetailPage.tsx # Tab-based detail with header
│   │   ├── OverviewTab.tsx        # Editable form with validation + unsaved warning
│   │   ├── AssetsTab.tsx          # Drag & drop upload simulation
│   │   ├── PerformanceTab.tsx     # Charts with loading/empty/error states
│   │   └── JobsTab.tsx            # Job lifecycle UI per campaign
│   └── jobs/
│       └── JobEnginePage.tsx      # Global job monitor with polling
├── components/
│   └── ui/
│       ├── index.tsx              # Design system: Button, Card, Badge, Input, Modal, Tabs…
│       └── ToastContainer.tsx     # Global toast notifications
├── hooks/
│   └── index.ts                   # useCampaigns, useCampaign, useCampaignJobs, useAssets, useDebounce
├── lib/
│   ├── apiService.ts              # Simulated async API service layer
│   ├── mockData.ts                # Seeded mock data + performance generator
│   └── utils.ts                  # Formatters, cn(), debounce
├── store/
│   └── index.ts                   # Zustand stores: toasts, jobs, campaign selection
└── types/
    └── index.ts                   # All TypeScript types
```

---

## 🏗 Architecture Decisions

### 1. Feature-Based Folder Structure
Code is co-located by domain (campaigns, jobs, shell) rather than by type (components, pages, hooks). This scales better as features grow independently without cross-contamination.

### 2. Service Layer Abstraction (`lib/apiService.ts`)
All async behavior lives in a dedicated service layer. UI components call hooks → hooks call services → services simulate async. This means:
- Swap mock with real API by changing only the service layer
- Easy to unit-test services independently
- No business logic leaks into components

### 3. Zustand for Global State
Three stores handle distinct concerns:
- **ToastStore**: Toast queue with auto-dismiss
- **JobsStore**: Job state + active polling registry
- **CampaignsStore**: Multi-select + optimistic status map

Zustand was chosen over Redux for its minimal boilerplate while still providing devtools support and subscription-based reactivity.

### 4. Optimistic UI Pattern
Bulk status updates apply optimistic changes immediately via `optimisticStatuses` map in the store, showing the new status in the table before the (simulated) server responds. On failure, the optimistic state is reverted and a toast error is shown.

### 5. Job Polling via Recursive setTimeout (not setInterval)
Polling uses recursive `setTimeout` instead of `setInterval` to:
- Prevent overlapping calls if a response is slow
- Allow dynamic backoff or early exit on terminal states
- Stay cleanly aligned with React's async model

The `activePolling` Set in the store tracks which job IDs are being polled, allowing the Job Engine page to show "live polling" indicators without coupling to component state.

### 6. Controlled Error States
The `apiService` injects simulated failures with controlled probability:
- ~5% chance on bulk status updates
- ~8% job processing failure rate
- ~10% asset upload failure rate

This allows demonstrating error UX, retry flows, and toast notifications naturally during review.

---

## 🔄 Data Simulation Design

### Mock Store
All data lives in in-memory arrays (`campaignStore`, `jobStore`, `assetStore`). Every "mutation" creates a new reference (immutable-style) to simulate database persistence within the session.

### Performance Data
`generatePerformanceData(days)` creates deterministic-ish time series data with:
- Weekend traffic reduction (~60% of weekday baseline)
- Gaussian noise per data point
- Correlated conversions and revenue from CTR/CVR models

### Upload Simulation
The upload service drives progress via a `while` loop with random increments and async delays, calling an `onProgress` callback at each step. The hook maps this to local state for live progress bars.

---

## ⚡ Performance Considerations

| Technique | Applied Where |
|---|---|
| `useCallback` + `useRef` for stale closure prevention | `useCampaigns`, `useAssets` |
| Debounced search (400ms) via custom `useDebounce` hook | Campaign list search input |
| Race condition guard via `fetchRef` counter | `useCampaigns` fetch |
| Lazy tab rendering (only active tab mounts) | Campaign Detail tabs |
| Stable sort comparisons (no re-sort on unrelated state) | Campaign table |
| Server-side pagination simulation | Campaign list |
| CSS-only animations (no JS animation libraries) | All transitions |

---

## 📦 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🧪 Key UX Features Demonstrated

- **Optimistic UI** — bulk status changes reflect instantly, revert on error
- **Unsaved Changes Warning** — form dirty state triggers banner + `beforeunload`
- **Drag & Drop Upload** — with progress bars, success/error states, and delete confirmation
- **Job Lifecycle Polling** — Pending → Processing → Completed/Failed with live indicators
- **Debounced Search** — 400ms debounce prevents API spam
- **Bulk Selection** — indeterminate checkbox state for partial selection
- **Toast System** — 5-second auto-dismiss with manual close
- **Empty/Loading/Error States** — all data views handle all three states gracefully
- **Responsive Layout** — adapts from desktop to tablet breakpoints
