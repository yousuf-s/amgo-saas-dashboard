import { useState, useEffect, useRef, useCallback } from "react";
import type {
  Campaign,
  CampaignFilters,
  Job,
  Asset,
  SortState,
  PaginationState,
} from "@/types";
import { campaignService, jobService, assetService } from "@/lib/apiService";
import { useJobsStore, useToastStore } from "@/store";

// ─── useCampaigns ─────────────────────────────────────────────────────────────

interface UseCampaignsOptions {
  filters: CampaignFilters;
  sort: SortState;
  pagination: Pick<PaginationState, "page" | "pageSize">;
  refreshKey?: number;
}

export function useCampaigns({
  filters,
  sort,
  pagination,
  refreshKey = 0,
}: UseCampaignsOptions) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRef = useRef(0);

  const fetch = useCallback(async () => {
    const fetchId = ++fetchRef.current;
    setLoading(true);
    setError(null);
    try {
      const result = await campaignService.fetchAll(filters, sort, pagination);
      if (fetchRef.current === fetchId) {
        setCampaigns(result.data);
        setTotal(result.pagination.total);
      }
    } catch (err) {
      if (fetchRef.current === fetchId) {
        setError(
          err instanceof Error ? err.message : "Failed to load campaigns",
        );
      }
    } finally {
      if (fetchRef.current === fetchId) setLoading(false);
    }
  }, [filters, sort, pagination.page, refreshKey]);

  useEffect(() => {
    fetch();
  }, [filters, sort, pagination.page, refreshKey]);

  return { campaigns, total, loading, error, refetch: fetch };
}

// ─── useCampaign ──────────────────────────────────────────────────────────────

export function useCampaign(id: string) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await campaignService.fetchById(id);
      setCampaign(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Campaign not found");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const update = useCallback(
    async (data: Partial<Campaign>) => {
      const result = await campaignService.update(id, data);
      setCampaign(result);
      return result;
    },
    [id],
  );

  return { campaign, loading, error, refetch: fetch, update };
}

// ─── useJobs ──────────────────────────────────────────────────────────────────

export function useCampaignJobs(campaignId: string) {
  const { jobs, setJobs, upsertJob, activePolling, startPolling, stopPolling } =
    useJobsStore();
  const { addToast } = useToastStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const campaignJobs = jobs.filter((j) => j.campaignId === campaignId);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    jobService
      .fetchByCampaign(campaignId)
      .then((data) => {
        if (!cancelled) {
          setJobs(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load jobs");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [campaignId, setJobs]);

  const pollJob = useCallback(
    (jobId: string) => {
      const schedulePoll = () => {
        const timer = setTimeout(async () => {
          try {
            const updated = await jobService.poll(jobId);
            upsertJob(updated);
            if (updated.status === "completed") {
              stopPolling(jobId);
              addToast("Job completed", updated.message, "success");
            } else if (updated.status === "failed") {
              stopPolling(jobId);
              addToast(
                "Job failed",
                updated.errorMessage ?? updated.message,
                "error",
              );
            } else {
              schedulePoll();
            }
          } catch {
            stopPolling(jobId);
          }
        }, 1500);
        pollingTimers.current.set(jobId, timer);
      };
      startPolling(jobId);
      schedulePoll();
    },
    [upsertJob, startPolling, stopPolling, addToast],
  );

  useEffect(() => {
    const timers = pollingTimers.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const createJob = useCallback(
    async (type: Job["type"], campaignName: string) => {
      const job = await jobService.create(campaignId, campaignName, type);
      upsertJob(job);
      pollJob(job.id);
      addToast("Job created", `${type} job started.`, "info");
      return job;
    },
    [campaignId, upsertJob, pollJob, addToast],
  );

  return {
    jobs: campaignJobs,
    loading,
    error,
    createJob,
    activePolling,
  };
}

// ─── useAssets ────────────────────────────────────────────────────────────────

export function useAssets(campaignId: string) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToastStore();

  useEffect(() => {
    let cancelled = false;
    assetService.fetchByCampaign(campaignId).then((data) => {
      if (!cancelled) {
        setAssets(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const uploads = files.map(async (file) => {
        const placeholderId = `asset_pending_${Date.now()}_${file.name}`;
        const placeholder: Asset = {
          id: placeholderId,
          name: file.name,
          type: "image",
          size: file.size,
          status: "uploading",
          progress: 0,
          url: "",
          createdAt: new Date().toISOString(),
        };
        setAssets((prev) => [...prev, placeholder]);

        try {
          await assetService.upload(
            campaignId,
            { name: file.name, size: file.size },
            (progress) => {
              setAssets((prev) =>
                prev.map((a) =>
                  a.id === placeholderId ? { ...a, progress } : a,
                ),
              );
            },
          );
          const updated = await assetService.fetchByCampaign(campaignId);
          setAssets(updated);
          addToast("Upload successful", `${file.name} is ready.`, "success");
        } catch (err) {
          setAssets((prev) =>
            prev.map((a) =>
              a.id === placeholderId ? { ...a, status: "error" as const } : a,
            ),
          );
          addToast(
            "Upload failed",
            err instanceof Error ? err.message : "Unknown error",
            "error",
          );
        }
      });

      await Promise.allSettled(uploads);
    },
    [campaignId, addToast],
  );

  const deleteAsset = useCallback(
    async (assetId: string) => {
      setAssets((prev) => prev.filter((a) => a.id !== assetId));
      await assetService.delete(campaignId, assetId);
      addToast("Asset deleted", undefined, "success");
    },
    [campaignId, addToast],
  );

  return { assets, loading, uploadFiles, deleteAsset };
}

// ─── useDebounce ──────────────────────────────────────────────────────────────

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}
