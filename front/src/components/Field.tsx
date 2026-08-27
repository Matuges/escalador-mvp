import type { ReactNode } from 'react'
import { cx } from '../lib/cx'

export const controlClass =
  'w-full rounded-lg border border-mist bg-white px-3 h-10 text-sm text-espresso ' +
  'placeholder:text-caramel/70 transition-colors ' +
  'focus-visible:outline-none focus-visible:border-steel focus-visible:ring-2 focus-visible:ring-steel/30 ' +
  'disabled:opacity-50 disabled:bg-mist/20'

type Props = {
  label?: string
  htmlFor?: string
  hint?: string
  className?: string
  children: ReactNode
}

export function Field({ label, htmlFor, hint, className, children }: Props) {
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-xs font-medium uppercase tracking-wide text-caramel"
        >
          {label}
        </label>
      )}
      {children}
      {hint && <span className="text-xs text-caramel">{hint}</span>}
    </div>
  )
}
