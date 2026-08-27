import { useEffect, useState } from 'react'
import {
  listMinisterios,
  listFuncoesPorMinisterio,
  type Ministerio,
  type Funcao,
} from '../api'
import { useToast } from '../lib/toast'
import { Field, controlClass } from './Field'

type Props = {
  /** ids de função selecionados */
  value: number[]
  onChange: (ids: number[]) => void
}

/**
 * Seleção de várias funções para associar a uma pessoa na criação. Escolhe um
 * ministério, marca as funções dele, troca de ministério — a seleção acumula.
 */
export function QualificacoesPicker({ value, onChange }: Props) {
  const notificar = useToast()
  const [ministerios, setMinisterios] = useState<Ministerio[]>([])
  const [ministerioId, setMinisterioId] = useState<number | null>(null)
  const [funcoes, setFuncoes] = useState<Funcao[]>([])
  const [rotulos, setRotulos] = useState<Record<number, string>>({})

  useEffect(() => {
    listMinisterios()
      .then(setMinisterios)
      .catch(() => notificar('Não foi possível carregar os ministérios.'))
  }, [notificar])

  useEffect(() => {
    if (ministerioId == null) {
      setFuncoes([])
      return
    }
    listFuncoesPorMinisterio(ministerioId)
      .then((fs) => {
        setFuncoes(fs)
        setRotulos((prev) => {
          const next = { ...prev }
          for (const f of fs) next[f.id] = f.nome
          return next
        })
      })
      .catch(() => notificar('Não foi possível carregar as funções.'))
  }, [ministerioId, notificar])

  function alternar(id: number) {
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id])
  }

  return (
    <div className="flex flex-col gap-3">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((id) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => alternar(id)}
                className="inline-flex items-center gap-1 rounded-full bg-navy px-2.5 py-1 text-xs font-medium text-white hover:bg-steel"
              >
                {rotulos[id] ?? `Função ${id}`}
                <span aria-hidden className="text-white/70">
                  ×
                </span>
                <span className="sr-only">remover</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Field label="Ministério">
        <select
          className={controlClass}
          value={ministerioId ?? ''}
          onChange={(e) => setMinisterioId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">Escolha um ministério…</option>
          {ministerios.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </select>
      </Field>

      {ministerioId != null &&
        (funcoes.length === 0 ? (
          <p className="text-sm text-caramel">Esse ministério ainda não tem funções.</p>
        ) : (
          <div className="flex flex-col gap-1">
            {funcoes.map((f) => (
              <label key={f.id} className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-espresso">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-steel"
                  checked={value.includes(f.id)}
                  onChange={() => alternar(f.id)}
                />
                {f.nome}
              </label>
            ))}
          </div>
        ))}
    </div>
  )
}
