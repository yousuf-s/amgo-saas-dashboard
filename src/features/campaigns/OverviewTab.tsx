import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Campaign } from "@/types";
import { Button, Input, Textarea, Select, Modal } from "@/components/ui";
import { useToastStore } from "@/store";
import { Save, AlertTriangle } from "lucide-react";

const schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  targetAudience: z.string().min(5, "Target audience is required"),
  budget: z.coerce.number().min(0, "Budget must be positive"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  status: z.enum(["active", "paused", "draft", "completed", "failed"]),
  owner: z.string().min(2, "Owner is required"),
});

type FormValues = z.infer<typeof schema>;

interface OverviewTabProps {
  campaign: Campaign;
  onUpdate: (data: Partial<Campaign>) => Promise<Campaign>;
}

export function OverviewTab({ campaign, onUpdate }: OverviewTabProps) {
  const { addToast } = useToastStore();
  const [saving, setSaving] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: campaign.name,
      description: campaign.description,
      targetAudience: campaign.targetAudience,
      budget: campaign.budget,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      status: campaign.status,
      owner: campaign.owner,
    },
  });

  // Prompt on browser navigation if dirty
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    try {
      await onUpdate(data);
      reset(data);
      addToast("Campaign saved", "All changes have been applied.", "success");
    } catch (err) {
      addToast(
        "Save failed",
        err instanceof Error ? err.message : "Please retry.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    reset();
    setShowUnsavedModal(false);
  };

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
    { value: "draft", label: "Draft" },
    { value: "completed", label: "Completed" },
    { value: "failed", label: "Failed" },
  ];

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Unsaved changes banner */}
        {isDirty && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl animate-slide-up">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-sm text-amber-300 flex-1">
              You have unsaved changes
            </span>
            <Button
              variant="ghost"
              size="xs"
              type="button"
              onClick={() => setShowUnsavedModal(true)}
            >
              Discard
            </Button>
            <Button
              variant="primary"
              size="xs"
              type="submit"
              loading={saving}
              icon={<Save className="w-3.5 h-3.5" />}
            >
              Save changes
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <Input
              label="Campaign Name"
              error={errors.name?.message}
              {...register("name")}
            />
          </div>
          <div className="md:col-span-2">
            <Textarea
              label="Description"
              rows={3}
              error={errors.description?.message}
              {...register("description")}
            />
          </div>
          <Input
            label="Target Audience"
            error={errors.targetAudience?.message}
            {...register("targetAudience")}
          />
          <Input
            label="Owner"
            error={errors.owner?.message}
            {...register("owner")}
          />
          <Input
            label="Budget (₹)"
            type="number"
            error={errors.budget?.message}
            {...register("budget")}
          />
          <Select
            label="Status"
            options={statusOptions}
            error={errors.status?.message}
            {...register("status")}
          />
          <Input
            label="Start Date"
            type="date"
            error={errors.startDate?.message}
            {...register("startDate")}
          />
          <Input
            label="End Date"
            type="date"
            error={errors.endDate?.message}
            {...register("endDate")}
          />
        </div>

        {/* Tags display (read-only) */}
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2.5">
            Tags
          </p>
          <div className="flex flex-wrap gap-2">
            {campaign.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-400 font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {!isDirty && (
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              icon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        )}
      </form>

      {/* Unsaved Changes Confirmation */}
      <Modal
        open={showUnsavedModal}
        onClose={() => setShowUnsavedModal(false)}
        title="Discard changes?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowUnsavedModal(false)}>
              Keep editing
            </Button>
            <Button variant="danger" onClick={handleDiscard}>
              Discard changes
            </Button>
          </>
        }
      >
        <p className="text-sm text-zinc-300">
          You have unsaved changes that will be lost. This action cannot be
          undone.
        </p>
      </Modal>
    </>
  );
}
