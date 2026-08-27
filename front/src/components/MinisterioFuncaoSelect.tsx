import { useEffect, useState } from 'react'
import {
  listMinisterios,
  listFuncoesPorMinisterio,
  type Ministerio,
  type Funcao,
} from '../api'
import { useToast } from '../lib/toast'
import { Field, controlClass } from './Field'
import { cx } from '../lib/cx'

export type MinisterioFuncao = { ministerioId: number | null; funcaoId: number | null }

type Props = {
  value: MinisterioFuncao
  onChange: (value: MinisterioFuncao) => void
  /** Rótulo da opção vazia. `filtro` = "Todos/Todas", `opcional` = "Nenhum/Nenhuma". */
  modo?: 'filtro' | 'opcional'
  className?: string
}

export function MinisterioFuncaoSelect({ value, onChange, modo = 'filtro', className }: Props) {
  const notificar = useToast()
  const [ministerios, setMinisterios] = useState<Ministerio[]>([])
  const [funcoes, setFuncoes] = useState<Funcao[]>([])

  useEffect(() => {
    listMinisterios()
      .then(setMinisterios)
      .catch(() => notificar('Não foi possível carregar os ministérios.'))
  }, [notificar])

  useEffect(() => {
    if (value.ministerioId == null) {
      setFuncoes([])
      return
    }
    listFuncoesPorMinisterio(value.ministerioId)
      .then(setFuncoes)
      .catch(() => notificar('Não foi possível carregar as funções.'))
  }, [value.ministerioId, notificar])

  const vazioM = modo === 'filtro' ? 'Todos os ministérios' : 'Nenhum'
  const vazioF = modo === 'filtro' ? 'Todas as funções' : 'Nenhuma'

  return (
    <div className={cx('grid grid-cols-1 gap-3 sm:grid-cols-2', className)}>
      <Field label="Ministério">
        <select
          className={controlClass}
          value={value.ministerioId ?? ''}
          onChange={(e) =>
            onChange({
              ministerioId: e.target.value ? Number(e.target.value) : null,
              funcaoId: null,
            })
          }
        >
          <option value="">{vazioM}</option>
          {ministerios.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Função">
        <select
          className={controlClass}
          disabled={value.ministerioId == null}
          value={value.funcaoId ?? ''}
          onChange={(e) =>
            onChange({
              ministerioId: value.ministerioId,
              funcaoId: e.target.value ? Number(e.target.value) : null,
            })
          }
        >
          <option value="">{vazioF}</option>
          {funcoes.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nome}
            </option>
          ))}
        </select>
      </Field>
    </div>
  )
}
