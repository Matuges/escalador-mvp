import { cx } from '../lib/cx'

type Props = {
  disponivel: boolean
  ocupado?: boolean
  onToggle: () => void
}

/**
 * Mostra o estado ATUAL (Disponível / Não pode) e alterna ao clicar.
 * `aria-checked` reflete o estado, não a ação — leitores de tela anunciam certo.
 */
export function AvailabilityToggle({ disponivel, ocupado = false, onToggle }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={disponivel}
      disabled={ocupado}
      onClick={onToggle}
      className={cx(
        'inline-flex h-8 items-center gap-1.5 rounded-full pl-1.5 pr-3 text-xs font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        'disabled:opacity-50',
        disponivel
          ? 'bg-mist text-navy hover:bg-mist/70'
          : 'bg-sand/25 text-espresso hover:bg-sand/40',
      )}
    >
      <span
        aria-hidden
        className={cx(
          'grid h-5 w-5 place-items-center rounded-full',
          disponivel ? 'bg-navy text-white' : 'bg-caramel text-white',
        )}
      >
        {ocupado ? (
          <span className="block h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
        ) : disponivel ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M2.5 6.5l2.5 2.5 4.5-5.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M3 6h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        )}
      </span>
      {disponivel ? 'Disponível' : 'Não pode'}
    </button>
  )
}
