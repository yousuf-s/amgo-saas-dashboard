import { useToastStore } from '@/store'
import { cn } from '@/lib/utils'
import type { Toast, ToastVariant } from '@/types'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const icons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  error: <XCircle className="w-4 h-4 text-rose-400" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-400" />,
  info: <Info className="w-4 h-4 text-cyan-400" />,
}

const toastStyles: Record<ToastVariant, string> = {
  success: 'border-emerald-500/30 bg-emerald-950/80',
  error: 'border-rose-500/30 bg-rose-950/80',
  warning: 'border-amber-500/30 bg-amber-950/80',
  info: 'border-cyan-500/30 bg-cyan-950/80',
}

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToastStore()
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3.5 pr-4 rounded-xl border backdrop-blur-sm shadow-xl min-w-72 max-w-sm animate-slide-in-right',
        toastStyles[toast.variant]
      )}
    >
      <div className="mt-0.5 shrink-0">{icons[toast.variant]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-100">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0 mt-0.5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const { toasts } = useToastStore()
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
