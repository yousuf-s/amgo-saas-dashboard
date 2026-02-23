import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { generatePerformanceData } from "@/lib/mockData";
import { formatNumber } from "@/lib/utils";
import { Card, Button, Skeleton } from "@/components/ui";
import {
  RefreshCw,
  TrendingUp,
  MousePointerClick,
  DollarSign,
  Percent,
} from "lucide-react";

const RANGES = [
  { label: "7D", days: 7 },
  { label: "14D", days: 14 },
  { label: "30D", days: 30 },
];

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 shadow-2xl text-xs">
      <p className="text-zinc-400 mb-2 font-mono">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span
            className="flex items-center gap-1.5"
            style={{ color: p.color }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: p.color }}
            />
            {p.name}
          </span>
          <span className="text-zinc-200 font-mono font-medium">
            {typeof p.value === "number"
              ? formatNumber(p.value, true)
              : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

interface PerformanceTabProps {
  campaignId: string;
}

export function PerformanceTab({ campaignId: _ }: PerformanceTabProps) {
  const [range, setRange] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const data = useMemo(() => generatePerformanceData(range), [range]);

  const totals = useMemo(
    () => ({
      impressions: data.reduce((s, d) => s + d.impressions, 0),
      clicks: data.reduce((s, d) => s + d.clicks, 0),
      conversions: data.reduce((s, d) => s + d.conversions, 0),
      spend: data.reduce((s, d) => s + d.spend, 0),
      revenue: data.reduce((s, d) => s + d.revenue, 0),
    }),
    [data],
  );

  const avgCtr = ((totals.clicks / totals.impressions) * 100).toFixed(2);
  const roas = (totals.revenue / (totals.spend || 1)).toFixed(2);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      if (Math.random() < 0.1) {
        setError("Failed to refresh data. Please try again.");
      }
      setLoading(false);
    }, 1200);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center py-16 gap-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-rose-400" />
        </div>
        <p className="text-sm text-zinc-300">{error}</p>
        <Button variant="outline" size="sm" onClick={() => setError(null)}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 p-1 bg-zinc-800 rounded-lg">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setRange(r.days)}
              className={`px-3 py-1 rounded-md text-xs font-medium font-mono transition-colors ${
                range === r.days
                  ? "bg-brand-500 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          loading={loading}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Impressions",
            value: formatNumber(totals.impressions, true),
            icon: <TrendingUp className="w-4 h-4 text-cyan-400" />,
            color: "bg-cyan-500/10",
          },
          {
            label: "Avg CTR",
            value: `${avgCtr}%`,
            icon: <MousePointerClick className="w-4 h-4 text-brand-400" />,
            color: "bg-brand-500/10",
          },
          {
            label: "Conversions",
            value: formatNumber(totals.conversions, true),
            icon: <Percent className="w-4 h-4 text-emerald-400" />,
            color: "bg-emerald-500/10",
          },
          {
            label: "ROAS",
            value: `${roas}×`,
            icon: <DollarSign className="w-4 h-4 text-amber-400" />,
            color: "bg-amber-500/10",
          },
        ].map((kpi) => (
          <Card key={kpi.label} className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${kpi.color}`}
            >
              {kpi.icon}
            </div>
            <div>
              <p className="text-lg font-bold text-zinc-100 font-display leading-none">
                {loading ? <Skeleton className="h-5 w-16" /> : kpi.value}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">{kpi.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Impressions & Clicks Chart */}
      <Card padding={false}>
        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-200 font-display">
            Traffic Overview
          </h3>
          <span className="text-xs text-zinc-600 font-mono">
            Last {range} days
          </span>
        </div>
        {loading ? (
          <div className="h-52 px-5 pb-4">
            <Skeleton className="h-full rounded-xl" />
          </div>
        ) : (
          <div className="h-52 px-2 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="#27272a" />
                <XAxis
                  dataKey="date"
                  tick={{
                    fontSize: 10,
                    fill: "#52525b",
                    fontFamily: "JetBrains Mono",
                  }}
                  tickLine={false}
                  axisLine={false}
                  interval={Math.floor(range / 6)}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#52525b" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => formatNumber(v, true)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: 11,
                    paddingTop: 8,
                    color: "#71717a",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="impressions"
                  name="Impressions"
                  stroke="#06b6d4"
                  fill="url(#g1)"
                  strokeWidth={1.5}
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  name="Clicks"
                  stroke="#f97316"
                  fill="url(#g2)"
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Conversions & Spend Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card padding={false}>
          <div className="px-5 pt-4 pb-2">
            <h3 className="text-sm font-semibold text-zinc-200 font-display">
              Conversions
            </h3>
          </div>
          {loading ? (
            <div className="h-40 px-5 pb-4">
              <Skeleton className="h-full rounded-xl" />
            </div>
          ) : (
            <div className="h-40 px-2 pb-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="2 4"
                    stroke="#27272a"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 9, fill: "#52525b" }}
                    tickLine={false}
                    axisLine={false}
                    interval={Math.floor(range / 6)}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "#52525b" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="conversions"
                    name="Conversions"
                    fill="#10b981"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card padding={false}>
          <div className="px-5 pt-4 pb-2">
            <h3 className="text-sm font-semibold text-zinc-200 font-display">
              Spend vs Revenue
            </h3>
          </div>
          {loading ? (
            <div className="h-40 px-5 pb-4">
              <Skeleton className="h-full rounded-xl" />
            </div>
          ) : (
            <div className="h-40 px-2 pb-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="2 4" stroke="#27272a" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 9, fill: "#52525b" }}
                    tickLine={false}
                    axisLine={false}
                    interval={Math.floor(range / 6)}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "#52525b" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${formatNumber(v, true)}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="spend"
                    name="Spend"
                    stroke="#f59e0b"
                    strokeWidth={1.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#8b5cf6"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
