import { useEffect, useMemo, useRef } from 'react'
import type { Culto } from '../api'
import { cx } from '../lib/cx'
import {
  parseCultoDate,
  diaDaSemanaAbrev,
  mesAbrev,
  ehPassado,
  inicioDeHoje,
} from '../lib/dates'

type Props = {
  cultos: Culto[]
  selecionadoId: number | null
  onSelecionar: (id: number) => void
}

/**
 * Linha do tempo horizontal de cultos — cada culto é um cartão de data
 * selecionável. O primeiro culto de hoje em diante ganha o marcador "próximo".
 */
export function CultoStrip({ cultos, selecionadoId, onSelecionar }: Props) {
  const ordenados = useMemo(
    () =>
      [...cultos].sort(
        (a, b) => parseCultoDate(a.data).getTime() - parseCultoDate(b.data).getTime(),
      ),
    [cultos],
  )

  const proximoId = useMemo(() => {
    const hoje = inicioDeHoje().getTime()
    return ordenados.find((c) => parseCultoDate(c.data).getTime() >= hoje)?.id ?? null
  }, [ordenados])

  const scroller = useRef<HTMLDivElement>(null)
  const selecionadoRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    selecionadoRef.current?.scrollIntoView({ inline: 'center', block: 'nearest' })
  }, [selecionadoId])

  return (
    <div
      ref={scroller}
      className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
      role="listbox"
      aria-label="Cultos"
    >
      {ordenados.map((c) => {
        const d = parseCultoDate(c.data)
        const selecionado = c.id === selecionadoId
        const passado = ehPassado(c.data)
        return (
          <button
            key={c.id}
            ref={selecionado ? selecionadoRef : undefined}
            type="button"
            role="option"
            aria-selected={selecionado}
            onClick={() => onSelecionar(c.id)}
            className={cx(
              'flex w-28 shrink-0 snap-start flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 text-left transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel focus-visible:ring-offset-2 focus-visible:ring-offset-ivory',
              selecionado
                ? 'border-navy bg-navy text-white'
                : 'border-mist bg-white hover:border-steel',
              !selecionado && passado && 'opacity-55',
            )}
          >
            <span className="flex h-4 items-center gap-1">
              <span
                className={cx(
                  'text-[10px] font-medium uppercase tracking-wide',
                  selecionado ? 'text-mist' : 'text-caramel',
                )}
              >
                {diaDaSemanaAbrev(d)}
              </span>
              {c.id === proximoId && !selecionado && (
                <span className="h-1.5 w-1.5 rounded-full bg-sand" aria-hidden />
              )}
            </span>
            <span
              className={cx(
                'font-display text-2xl leading-none',
                selecionado ? 'text-white' : 'text-navy',
              )}
            >
              {d.getDate()}
            </span>
            <span className={cx('text-[10px] uppercase', selecionado ? 'text-mist' : 'text-caramel')}>
              {mesAbrev(d)}
            </span>
            <span
              className={cx(
                'mt-1 line-clamp-2 text-xs leading-tight',
                selecionado ? 'text-white/90' : 'text-espresso',
              )}
            >
              {c.nome}
            </span>
          </button>
        )
      })}
    </div>
  )
}
