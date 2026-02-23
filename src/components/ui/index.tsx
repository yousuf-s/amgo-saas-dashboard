import React from 'react'
import { cn } from '@/lib/utils'
import type { CampaignStatus, CampaignChannel } from '@/types'
import { STATUS_STYLES, CHANNEL_STYLES } from '@/lib/utils'

// ─── Badge ────────────────────────────────────────────────────────────────────

interface BadgeProps {
  children: React.ReactNode
  className?: string
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium font-mono tracking-wide', className)}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: CampaignStatus }) {
  const dot: Record<CampaignStatus, string> = {
    active: 'bg-emerald-400',
    paused: 'bg-amber-400',
    draft: 'bg-zinc-500',
    completed: 'bg-cyan-400',
    failed: 'bg-rose-400',
  }
  return (
    <Badge className={STATUS_STYLES[status]}>
      <span className={cn('w-1.5 h-1.5 rounded-full', dot[status])} />
      {status}
    </Badge>
  )
}

export function ChannelBadge({ channel }: { channel: CampaignChannel }) {
  return (
    <Badge className={CHANNEL_STYLES[channel]}>
      {channel}
    </Badge>
  )
}

// ─── Button ───────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: React.ReactNode
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-brand-500 hover:bg-brand-600 text-white shadow-glow-brand/50 border border-brand-600',
  secondary: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700',
  ghost: 'hover:bg-zinc-800/70 text-zinc-300 hover:text-zinc-100',
  danger: 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30',
  outline: 'border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/50',
}

const buttonSizes: Record<ButtonSize, string> = {
  xs: 'h-7 px-2 text-xs gap-1',
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-base gap-2',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', loading, icon, children, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap',
          buttonVariants[variant],
          buttonSizes[size],
          className
        )}
        {...props}
      >
        {loading ? <Spinner size="sm" /> : icon}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

// ─── Spinner ──────────────────────────────────────────────────────────────────

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const spinnerSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <svg
      className={cn('animate-spin', spinnerSizes[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
}

export function Card({ children, className, padding = true }: CardProps) {
  return (
    <div
      className={cn(
        'bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-xl',
        padding && 'p-5',
        className
      )}
    >
      {children}
    </div>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium text-zinc-400 font-body uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full h-9 bg-zinc-900 border border-zinc-700/80 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 px-3 font-body',
              'focus:outline-none focus:border-brand-500/70 focus:ring-1 focus:ring-brand-500/30 transition-colors',
              leftIcon && 'pl-9',
              error && 'border-rose-500/60',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-rose-400">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium text-zinc-400 font-body uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full bg-zinc-900 border border-zinc-700/80 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 px-3 py-2.5 font-body resize-none',
            'focus:outline-none focus:border-brand-500/70 focus:ring-1 focus:ring-brand-500/30 transition-colors',
            error && 'border-rose-500/60',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-400">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium text-zinc-400 font-body uppercase tracking-wider">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full h-9 bg-zinc-900 border border-zinc-700/80 rounded-lg text-sm text-zinc-100 px-3 font-body appearance-none',
            'focus:outline-none focus:border-brand-500/70 focus:ring-1 focus:ring-brand-500/30 transition-colors',
            error && 'border-rose-500/60',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-zinc-900">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-rose-400">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'

// ─── Checkbox ─────────────────────────────────────────────────────────────────

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  indeterminate?: boolean
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ indeterminate, className, ...props }, ref) => {
    const innerRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
      const el = (ref as React.RefObject<HTMLInputElement>)?.current ?? innerRef.current
      if (el) el.indeterminate = indeterminate ?? false
    }, [indeterminate, ref])

    return (
      <input
        type="checkbox"
        ref={ref ?? innerRef}
        className={cn(
          'w-4 h-4 rounded bg-zinc-800 border-zinc-600 text-brand-500',
          'focus:ring-brand-500/30 focus:ring-offset-zinc-950',
          className
        )}
        {...props}
      />
    )
  }
)
Checkbox.displayName = 'Checkbox'

// ─── Progress Bar ─────────────────────────────────────────────────────────────

interface ProgressBarProps {
  value: number
  max?: number
  variant?: 'brand' | 'emerald' | 'rose' | 'cyan' | 'amber'
  size?: 'xs' | 'sm' | 'md'
  showLabel?: boolean
}

const progressColors = {
  brand: 'bg-brand-500',
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
  cyan: 'bg-cyan-500',
  amber: 'bg-amber-500',
}

const progressSizes = { xs: 'h-1', sm: 'h-1.5', md: 'h-2' }

export function ProgressBar({ value, max = 100, variant = 'brand', size = 'sm', showLabel }: ProgressBarProps) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="flex items-center gap-2">
      <div className={cn('flex-1 bg-zinc-800 rounded-full overflow-hidden', progressSizes[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', progressColors[variant])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <span className="text-xs text-zinc-500 font-mono w-8 text-right">{Math.round(pct)}%</span>}
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      {icon && <div className="text-zinc-600 mb-1">{icon}</div>}
      <p className="text-zinc-300 font-medium font-display">{title}</p>
      {description && <p className="text-sm text-zinc-500 max-w-xs">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-zinc-800/60 animate-pulse rounded', className)} />
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const modalSizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' }

export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className={cn(
          'w-full mx-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl animate-slide-up',
          modalSizes[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h3 className="font-semibold text-zinc-100 font-display">{title}</h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (id: string) => void
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex items-center gap-1 border-b border-zinc-800">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-150 border-b-2 -mb-px font-body',
            activeTab === tab.id
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  )
}
