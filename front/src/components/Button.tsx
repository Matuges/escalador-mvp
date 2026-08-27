import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cx } from '../lib/cx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const BASE =
  'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel focus-visible:ring-offset-2 focus-visible:ring-offset-ivory ' +
  'disabled:opacity-50 disabled:pointer-events-none'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-navy text-white hover:bg-steel',
  secondary: 'border border-mist bg-white text-espresso hover:border-steel hover:text-navy',
  ghost: 'text-caramel hover:bg-mist/40 hover:text-espresso',
  danger: 'text-caramel hover:bg-sand/30 hover:text-espresso',
}

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className, children, type, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      disabled={disabled || loading}
      className={cx(BASE, VARIANTS[variant], SIZES[size], className)}
      {...rest}
    >
      {loading ? '…' : children}
    </button>
  )
})
