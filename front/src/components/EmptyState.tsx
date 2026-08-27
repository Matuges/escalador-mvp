import type { ReactNode } from 'react'

type Props = {
  titulo: string
  descricao?: string
  acao?: ReactNode
}

export function EmptyState({ titulo, descricao, acao }: Props) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-mist bg-white/40 px-6 py-12 text-center">
      <p className="font-display text-lg text-navy">{titulo}</p>
      {descricao && <p className="max-w-xs text-sm text-caramel">{descricao}</p>}
      {acao && <div className="mt-3">{acao}</div>}
    </div>
  )
}
