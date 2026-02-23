import { useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
  RefreshCw,
} from "lucide-react";
import type {
  Campaign,
  CampaignFilters,
  CampaignStatus,
  CampaignChannel,
  SortState,
} from "@/types";
import { useCampaigns, useDebounce } from "@/hooks";
import { useCampaignsStore, useToastStore } from "@/store";
import { campaignService } from "@/lib/apiService";
import {
  Button,
  Card,
  StatusBadge,
  ChannelBadge,
  Checkbox,
  Skeleton,
  EmptyState,
  Modal,
} from "@/components/ui";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatDate,
  cn,
} from "@/lib/utils";

const STATUS_OPTIONS: CampaignStatus[] = [
  "active",
  "paused",
  "draft",
  "completed",
  "failed",
];
const CHANNEL_OPTIONS: CampaignChannel[] = [
  "email",
  "sms",
  "push",
  "in-app",
  "social",
];
const PAGE_SIZES = [10, 25, 50];

function SortIcon({ field, sort }: { field: keyof Campaign; sort: SortState }) {
  if (sort.field !== field)
    return <ChevronsUpDown className="w-3.5 h-3.5 text-zinc-600" />;
  return sort.direction === "asc" ? (
    <ChevronUp className="w-3.5 h-3.5 text-brand-400" />
  ) : (
    <ChevronDown className="w-3.5 h-3.5 text-brand-400" />
  );
}

export function CampaignListPage() {
  const { addToast } = useToastStore();
  const {
    selectedIds,
    toggleSelection,
    toggleAll,
    clearSelection,
    optimisticStatuses,
    setOptimisticStatus,
    clearOptimisticStatuses,
  } = useCampaignsStore();

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);
  const isDebouncing = searchInput !== debouncedSearch;

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<CampaignFilters>({
    search: "",
    status: [],
    channel: [],
    dateRange: null,
  });
  const [sort, setSort] = useState<SortState>({
    field: "createdAt",
    direction: "desc",
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [bulkStatusModal, setBulkStatusModal] = useState<CampaignStatus | null>(
    null,
  );
  const [bulkLoading, setBulkLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const activeFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch],
  );

  const { campaigns, total, loading, error, refetch } = useCampaigns({
    filters: activeFilters,
    sort,
    pagination: { page, pageSize },
    refreshKey,
  });

  const totalPages = Math.ceil(total / pageSize);
  const allCurrentSelected =
    campaigns.length > 0 && campaigns.every((c) => selectedIds.has(c.id));
  const someSelected =
    campaigns.some((c) => selectedIds.has(c.id)) && !allCurrentSelected;

  const handleSort = (field: keyof Campaign) => {
    setSort((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { field, direction: "asc" },
    );
    setPage(1);
  };

  const toggleFilter = <K extends "status" | "channel">(
    key: K,
    value: CampaignFilters[K][number],
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: (prev[key] as string[]).includes(value as string)
        ? (prev[key] as string[]).filter((v) => v !== value)
        : [...(prev[key] as string[]), value as string],
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: "", status: [], channel: [], dateRange: null });
    setSearchInput("");
    setPage(1);
    triggerRefresh();
  };

  const hasActiveFilters =
    filters.status.length > 0 || filters.channel.length > 0 || debouncedSearch;

  const handleBulkStatus = useCallback(
    async (status: CampaignStatus) => {
      const ids = Array.from(selectedIds);
      setBulkLoading(true);
      setOptimisticStatus(ids, status);
      try {
        await campaignService.updateStatus(ids, status);
        addToast(
          `${ids.length} campaigns updated`,
          `Status changed to "${status}"`,
          "success",
        );
        clearSelection();
        refetch();
      } catch (err) {
        clearOptimisticStatuses(ids);
        addToast(
          "Update failed",
          err instanceof Error ? err.message : "Try again",
          "error",
        );
      } finally {
        setBulkLoading(false);
        setBulkStatusModal(null);
      }
    },
    [
      selectedIds,
      setOptimisticStatus,
      clearOptimisticStatuses,
      addToast,
      clearSelection,
      refetch,
    ],
  );

  const colHeader = (label: string, field: keyof Campaign) => (
    <th
      className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-zinc-500 cursor-pointer select-none hover:text-zinc-300 transition-colors whitespace-nowrap"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1.5">
        {label}
        <SortIcon field={field} sort={sort} />
      </div>
    </th>
  );

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 font-display">
            Campaigns
          </h1>
          <p className="text-sm text-zinc-500 mt-1">{total} campaigns total</p>
        </div>
      </div>

      {/* Search + Filters Bar */}
      <Card className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4",
              isDebouncing ? "text-brand-400" : "text-zinc-500",
            )}
          />
          <input
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            placeholder="Search campaigns, owners, tags..."
            className="w-full h-9 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 pl-9 pr-3 focus:outline-none focus:border-brand-500/70 focus:ring-1 focus:ring-brand-500/30 transition-colors"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput("");
                setPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <Button
          variant={showFilters ? "primary" : "outline"}
          size="sm"
          icon={<Filter className="w-3.5 h-3.5" />}
          onClick={() => setShowFilters((v) => !v)}
        >
          Filters{" "}
          {filters.status.length + filters.channel.length > 0 && (
            <span className="ml-1 bg-brand-600 text-white rounded px-1 text-xs">
              {filters.status.length + filters.channel.length}
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            icon={<X className="w-3.5 h-3.5" />}
            onClick={clearFilters}
          >
            Clear
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          icon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={refetch}
          loading={loading}
        >
          Refresh
        </Button>
      </Card>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2.5">
                Status
              </p>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleFilter("status", s)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                      filters.status.includes(s)
                        ? "border-brand-500 bg-brand-500/10 text-brand-400"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-500",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2.5">
                Channel
              </p>
              <div className="flex flex-wrap gap-2">
                {CHANNEL_OPTIONS.map((ch) => (
                  <button
                    key={ch}
                    onClick={() => toggleFilter("channel", ch)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                      filters.channel.includes(ch)
                        ? "border-brand-500 bg-brand-500/10 text-brand-400"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-500",
                    )}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-brand-500/10 border border-brand-500/30 rounded-xl animate-slide-up">
          <span className="text-sm text-brand-400 font-medium">
            {selectedIds.size} selected
          </span>
          <div className="flex-1" />
          {(["active", "paused"] as CampaignStatus[]).map((s) => (
            <Button
              key={s}
              variant="outline"
              size="xs"
              onClick={() => setBulkStatusModal(s)}
            >
              Mark {s}
            </Button>
          ))}
          <Button variant="ghost" size="xs" onClick={clearSelection}>
            Deselect all
          </Button>
        </div>
      )}

      {/* Table */}
      <Card padding={false}>
        {error ? (
          <div className="flex items-center justify-center py-16 text-rose-400 flex-col gap-3">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={refetch}>
              Retry
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-4 py-3 w-10">
                    <Checkbox
                      checked={allCurrentSelected}
                      indeterminate={someSelected}
                      onChange={() => toggleAll(campaigns.map((c) => c.id))}
                    />
                  </th>
                  {colHeader("Campaign", "name")}
                  {colHeader("Status", "status")}
                  {colHeader("Channel", "channel")}
                  {colHeader("Budget", "budget")}
                  {colHeader("Impressions", "impressions")}
                  {colHeader("CTR", "ctr")}
                  {colHeader("Conversions", "conversions")}
                  {colHeader("Updated", "updatedAt")}
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {loading ? (
                  Array.from({ length: pageSize }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={10}>
                      <EmptyState
                        title="No campaigns found"
                        description="Try adjusting your search or filter criteria."
                        action={
                          hasActiveFilters ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={clearFilters}
                            >
                              Clear filters
                            </Button>
                          ) : undefined
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  campaigns.map((c) => {
                    const optimistic = optimisticStatuses.get(c.id);
                    const displayStatus = optimistic ?? c.status;
                    return (
                      <tr
                        key={c.id}
                        className={cn(
                          "hover:bg-zinc-800/30 transition-colors",
                          selectedIds.has(c.id) && "bg-brand-500/5",
                        )}
                      >
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={selectedIds.has(c.id)}
                            onChange={() => toggleSelection(c.id)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Link to={`/campaigns/${c.id}`} className="group">
                            <p className="text-sm font-medium text-zinc-200 group-hover:text-brand-400 transition-colors">
                              {c.name}
                            </p>
                            <p className="text-xs text-zinc-600 mt-0.5">
                              {c.owner}
                            </p>
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={displayStatus} />
                        </td>
                        <td className="px-4 py-3">
                          <ChannelBadge channel={c.channel} />
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-zinc-300 font-mono">
                            {formatCurrency(c.budget, true)}
                          </p>
                          {c.budget > 0 && (
                            <p className="text-xs text-zinc-600">
                              {Math.round((c.spent / c.budget) * 100)}% spent
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-300 font-mono">
                          {formatNumber(c.impressions, true)}
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-300 font-mono">
                          {formatPercent(c.ctr)}
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-300 font-mono">
                          {formatNumber(c.conversions, true)}
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                          {formatDate(c.updatedAt)}
                        </td>
                        <td className="px-4 py-3">
                          <Link to={`/campaigns/${c.id}`}>
                            <button className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-zinc-700 transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-zinc-800">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-300 focus:outline-none"
              >
                {PAGE_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-zinc-500 mr-2">
                {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}{" "}
                of {total}
              </span>
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const pg = i + Math.max(1, Math.min(page - 2, totalPages - 4));
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={cn(
                      "w-8 h-8 rounded-lg text-xs font-mono transition-colors",
                      pg === page
                        ? "bg-brand-500 text-white"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800",
                    )}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Bulk Status Confirm Modal */}
      <Modal
        open={!!bulkStatusModal}
        onClose={() => setBulkStatusModal(null)}
        title="Confirm Bulk Status Update"
        footer={
          <>
            <Button variant="ghost" onClick={() => setBulkStatusModal(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={bulkLoading}
              onClick={() =>
                bulkStatusModal && handleBulkStatus(bulkStatusModal)
              }
            >
              Confirm
            </Button>
          </>
        }
      >
        <p className="text-sm text-zinc-300">
          You're about to change the status of{" "}
          <strong className="text-zinc-100">
            {selectedIds.size} campaign{selectedIds.size !== 1 ? "s" : ""}
          </strong>{" "}
          to <strong className="text-brand-400">{bulkStatusModal}</strong>. This
          action will be applied immediately.
        </p>
      </Modal>
    </div>
  );
}
