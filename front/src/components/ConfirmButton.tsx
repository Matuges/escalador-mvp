import { useEffect, useState } from 'react'
import { Button } from './Button'

type Props = {
  label?: string
  confirmLabel?: string
  onConfirm: () => void
}

/**
 * Ação destrutiva em dois toques: o primeiro clique "arma" o botão e mostra
 * Confirmar / Cancelar; sem confirmação em 4s ele volta ao estado normal.
 */
export function ConfirmButton({ label = 'Excluir', confirmLabel = 'Confirmar', onConfirm }: Props) {
  const [armado, setArmado] = useState(false)

  useEffect(() => {
    if (!armado) return
    const t = window.setTimeout(() => setArmado(false), 4000)
    return () => window.clearTimeout(t)
  }, [armado])

  if (armado) {
    return (
      <span className="inline-flex items-center gap-1">
        <Button
          size="sm"
          variant="danger"
          className="bg-sand/30"
          onClick={() => {
            setArmado(false)
            onConfirm()
          }}
        >
          {confirmLabel}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setArmado(false)}>
          Cancelar
        </Button>
      </span>
    )
  }

  return (
    <Button size="sm" variant="danger" onClick={() => setArmado(true)}>
      {label}
    </Button>
  )
}
