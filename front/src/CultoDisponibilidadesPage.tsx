import { useEffect, useState } from 'react'
import {
  findDisponibilidadesPorCulto,
  setIndisponivel,
  removeIndisponivel,
  type Culto,
  type CultoDisponibilidadeItem,
} from './api'

type Props = {
  culto: Culto
  onVoltar: () => void
}

export default function CultoDisponibilidadesPage({ culto, onVoltar }: Props) {
  const [pessoas, setPessoas] = useState<CultoDisponibilidadeItem[]>([])
  const [loadingPessoa, setLoadingPessoa] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setError(null)
    findDisponibilidadesPorCulto(culto.id)
      .then(setPessoas)
      .catch(() => setError('Não foi possível carregar as pessoas.'))
  }, [culto.id])

  async function toggleDisponibilidade(pessoaId: number, disponivel: boolean) {
    setLoadingPessoa(pessoaId)
    try {
      if (disponivel) {
        await setIndisponivel(pessoaId, culto.id)
      } else {
        await removeIndisponivel(pessoaId, culto.id)
      }
      setPessoas((prev) =>
        prev.map((p) => (p.id === pessoaId ? { ...p, disponivel: !disponivel } : p)),
      )
    } catch {
      setError('Erro ao atualizar disponibilidade.')
    } finally {
      setLoadingPessoa(null)
    }
  }

  return (
    <div>
      <button
        onClick={onVoltar}
        className="text-sm text-steel hover:text-navy mb-4"
      >
        ← Voltar
      </button>

      <h2 className="text-lg font-semibold text-navy mb-1">{culto.nome}</h2>
      <p className="text-sm text-caramel mb-4">
        {new Date(culto.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
      </p>

      {error && (
        <div className="mb-4 rounded-md bg-sand/20 border border-caramel px-4 py-3 text-sm text-espresso">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {pessoas.length === 0 ? (
          <p className="text-sm text-caramel">Nenhuma pessoa cadastrada.</p>
        ) : (
          pessoas.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between bg-white rounded-md border border-mist px-4 py-3"
            >
              <p className="font-medium text-navy">{p.pessoa}</p>
              <button
                disabled={loadingPessoa === p.id}
                onClick={() => toggleDisponibilidade(p.id, p.disponivel)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${
                  p.disponivel
                    ? 'bg-mist text-navy hover:bg-steel hover:text-white'
                    : 'bg-sand text-espresso hover:bg-caramel hover:text-white'
                }`}
              >
                {loadingPessoa === p.id ? '...' : p.disponivel ? 'Pode' : 'Não pode'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
