import { cx } from '../lib/cx'

type Opcao<T extends string> = { value: T; label: string; contador?: number }

type Props<T extends string> = {
  value: T
  onChange: (value: T) => void
  opcoes: Opcao<T>[]
  className?: string
  'aria-label'?: string
}

export function Segmented<T extends string>({
  value,
  onChange,
  opcoes,
  className,
  'aria-label': ariaLabel,
}: Props<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cx('inline-flex rounded-lg border border-mist bg-white p-0.5', className)}
    >
      {opcoes.map((o) => {
        const ativo = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={ativo}
            onClick={() => onChange(o.value)}
            className={cx(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel',
              ativo ? 'bg-navy text-white' : 'text-caramel hover:text-espresso',
            )}
          >
            {o.label}
            {o.contador != null && (
              <span
                className={cx(
                  'rounded-full px-1.5 text-xs tabular-nums',
                  ativo ? 'bg-white/20 text-white' : 'bg-mist/60 text-caramel',
                )}
              >
                {o.contador}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
