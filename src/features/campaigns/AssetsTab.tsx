import { useState, useRef, useCallback } from 'react'
import { Upload, FileImage, FileVideo, FileText, Table, Trash2, AlertCircle, CheckCircle } from 'lucide-react'
import type { Asset } from '@/types'
import { useAssets } from '@/hooks'
import { Button, ProgressBar, Skeleton, EmptyState, Modal } from '@/components/ui'
import { formatFileSize, formatDate, cn } from '@/lib/utils'

const ASSET_ICONS: Record<Asset['type'], React.ReactNode> = {
  image: <FileImage className="w-5 h-5 text-cyan-400" />,
  video: <FileVideo className="w-5 h-5 text-violet-400" />,
  document: <FileText className="w-5 h-5 text-amber-400" />,
  csv: <Table className="w-5 h-5 text-emerald-400" />,
}

interface AssetsTabProps {
  campaignId: string
}

export function AssetsTab({ campaignId }: AssetsTabProps) {
  const { assets, loading, uploadFiles, deleteAsset } = useAssets(campaignId)
  const [dragOver, setDragOver] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<Asset | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const files = Array.from(e.dataTransfer.files)
      if (files.length) uploadFiles(files)
    },
    [uploadFiles]
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length) uploadFiles(files)
    e.target.value = ''
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    await deleteAsset(deleteConfirm.id)
    setDeleteConfirm(null)
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200',
            dragOver
              ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
              : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/30'
          )}
        >
          <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center transition-colors', dragOver ? 'bg-brand-500/20' : 'bg-zinc-800')}>
            <Upload className={cn('w-5 h-5', dragOver ? 'text-brand-400' : 'text-zinc-500')} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-300">
              {dragOver ? 'Drop files here' : 'Drag & drop files or click to browse'}
            </p>
            <p className="text-xs text-zinc-600 mt-1">Images, videos, documents, CSV files</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileInput}
          />
        </div>

        {/* Asset List */}
        {assets.length === 0 ? (
          <EmptyState
            icon={<Upload className="w-8 h-8" />}
            title="No assets yet"
            description="Upload files to attach them to this campaign."
          />
        ) : (
          <div className="space-y-2">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border transition-colors',
                  asset.status === 'error'
                    ? 'bg-rose-950/20 border-rose-800/50'
                    : 'bg-zinc-800/40 border-zinc-700/50 hover:bg-zinc-800/60'
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                  {ASSET_ICONS[asset.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-zinc-200 truncate">{asset.name}</p>
                    {asset.status === 'ready' && (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                    {asset.status === 'error' && (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    )}
                  </div>
                  {asset.status === 'uploading' ? (
                    <ProgressBar value={asset.progress} size="xs" variant="brand" showLabel />
                  ) : asset.status === 'error' ? (
                    <p className="text-xs text-rose-400">Upload failed</p>
                  ) : (
                    <p className="text-xs text-zinc-500">
                      {formatFileSize(asset.size)} · {formatDate(asset.createdAt)}
                    </p>
                  )}
                </div>
                {asset.status === 'ready' && (
                  <button
                    onClick={() => setDeleteConfirm(asset)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Asset"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-zinc-300">
          Are you sure you want to delete{' '}
          <strong className="text-zinc-100">{deleteConfirm?.name}</strong>?
          This cannot be undone.
        </p>
      </Modal>
    </>
  )
}
