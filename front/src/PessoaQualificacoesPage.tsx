import { useEffect, useMemo, useState } from 'react'
import {
  listQualificacoes,
  setQualificacao,
  removeQualificacao,
  type Pessoa,
  type QualificacaoFuncao,
} from './api'

type Props = {
  pessoa: Pessoa
  onVoltar: () => void
}

export default function PessoaQualificacoesPage({ pessoa, onVoltar }: Props) {
  const [funcoes, setFuncoes] = useState<QualificacaoFuncao[]>([])
  const [loadingFuncaoId, setLoadingFuncaoId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listQualificacoes(pessoa.id)
      .then(setFuncoes)
      .catch(() => setError('Não foi possível carregar as qualificações.'))
  }, [pessoa.id])

  const porMinisterio = useMemo(() => {
    const grupos = new Map<number, { nome: string; funcoes: QualificacaoFuncao[] }>()
    for (const f of funcoes) {
      if (!grupos.has(f.ministerioId)) {
        grupos.set(f.ministerioId, { nome: f.ministerio, funcoes: [] })
      }
      grupos.get(f.ministerioId)!.funcoes.push(f)
    }
    return [...grupos.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  }, [funcoes])

  async function toggleQualificacao(funcaoId: number, qualificado: boolean) {
    setLoadingFuncaoId(funcaoId)
    try {
      if (qualificado) {
        await removeQualificacao(pessoa.id, funcaoId)
      } else {
        await setQualificacao(pessoa.id, funcaoId)
      }
      setFuncoes((prev) =>
        prev.map((f) => (f.id === funcaoId ? { ...f, qualificado: !qualificado } : f)),
      )
    } catch {
      setError('Erro ao atualizar qualificação.')
    } finally {
      setLoadingFuncaoId(null)
    }
  }

  return (
    <div>
      <button onClick={onVoltar} className="text-sm text-steel hover:text-navy mb-4">
        ← Voltar
      </button>

      <h2 className="text-lg font-semibold text-navy mb-1">{pessoa.nome}</h2>
      <p className="text-sm text-caramel mb-4">Qualificações</p>

      {error && (
        <div className="mb-4 rounded-md bg-sand/20 border border-caramel px-4 py-3 text-sm text-espresso">
          {error}
        </div>
      )}

      {funcoes.length === 0 ? (
        <p className="text-sm text-caramel">Nenhuma função cadastrada.</p>
      ) : (
        <div className="space-y-4">
          {porMinisterio.map((grupo) => (
            <div key={grupo.nome} className="bg-white border border-mist rounded-md px-4 py-3">
              <h3 className="text-sm font-semibold text-navy mb-2">{grupo.nome}</h3>
              <div className="space-y-1">
                {grupo.funcoes.map((f) => (
                  <label
                    key={f.id}
                    className="flex items-center gap-2 text-sm text-espresso cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={f.qualificado}
                      disabled={loadingFuncaoId === f.id}
                      onChange={() => toggleQualificacao(f.id, f.qualificado)}
                      className="accent-steel"
                    />
                    {f.funcao}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
