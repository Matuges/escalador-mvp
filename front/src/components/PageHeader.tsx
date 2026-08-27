import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { IconVoltar } from './icons'

type Props = {
  titulo: string
  subtitulo?: string
  voltar?: { para: string; label: string }
  acao?: ReactNode
}

export function PageHeader({ titulo, subtitulo, voltar, acao }: Props) {
  return (
    <header className="mb-6">
      {voltar && (
        <Link
          to={voltar.para}
          className="mb-2 inline-flex items-center gap-1 text-sm text-caramel hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel focus-visible:rounded"
        >
          <IconVoltar width={16} height={16} />
          {voltar.label}
        </Link>
      )}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-navy">{titulo}</h1>
          {subtitulo && <p className="mt-0.5 text-sm text-caramel">{subtitulo}</p>}
        </div>
        {acao && <div className="shrink-0">{acao}</div>}
      </div>
    </header>
  )
}
