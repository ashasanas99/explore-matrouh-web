'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function FormField({ label, error, className, ...props }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-foreground font-sans">{label}</label>
      <input
        {...props}
        className={cn(
          'w-full px-4 py-3.5 rounded-xl border border-border bg-white text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors',
          error && 'border-destructive focus:ring-destructive/30',
          props.disabled && 'bg-muted opacity-60 cursor-not-allowed',
          className
        )}
      />
      {error && <p className="text-xs text-destructive font-sans">{error}</p>}
    </div>
  )
}

interface PasswordFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  error?: string
}

export function PasswordField({ label, error, className, ...props }: PasswordFieldProps) {
  const [show, setShow] = useState(false)
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-foreground font-sans">{label}</label>
      <div className="relative">
        <input
          {...props}
          type={show ? 'text' : 'password'}
          className={cn(
            'w-full px-4 py-3.5 rounded-xl border border-border bg-white text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors pr-12',
            error && 'border-destructive focus:ring-destructive/30',
            className
          )}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive font-sans">{error}</p>}
    </div>
  )
}

interface InlineBannerProps {
  type: 'success' | 'error' | 'info'
  message: string
  className?: string
}

export function InlineBanner({ type, message, className }: InlineBannerProps) {
  const styles = {
    success: 'bg-success-light text-success border-success/20',
    error: 'bg-destructive-light text-destructive border-destructive/20',
    info: 'bg-primary-lighter text-primary border-primary/20',
  }
  return (
    <div className={cn('px-4 py-3 rounded-xl border text-sm font-semibold font-sans', styles[type], className)}>
      {message}
    </div>
  )
}
