import { useEffect, useState } from 'react'
import { listMinisterios, listFuncoesPorMinisterio, type Funcao } from './api'

export function useLouvorFuncoes() {
  const [funcoes, setFuncoes] = useState<Funcao[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listMinisterios()
      .then((ministerios) => {
        const louvor = ministerios.find((m) => m.nome.toLowerCase() === 'louvor')
        if (!louvor) {
          setFuncoes([])
          return
        }
        return listFuncoesPorMinisterio(louvor.id).then(setFuncoes)
      })
      .catch(() => setError('Não foi possível carregar as funções de Louvor.'))
  }, [])

  return { funcoes, error }
}
