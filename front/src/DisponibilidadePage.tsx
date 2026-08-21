import { useEffect, useState } from 'react'
import {
  listPessoas,
  findDisponibilidades,
  setIndisponivel,
  removeIndisponivel,
  type Pessoa,
  type DisponibilidadeItem,
} from './api'

export default function DisponibilidadePage() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([])
  const [pessoaId, setPessoaId] = useState<number | null>(null)
  const [disponibilidades, setDisponibilidades] = useState<DisponibilidadeItem[]>([])
  const [loadingCulto, setLoadingCulto] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listPessoas()
      .then(setPessoas)
      .catch(() => setError('Não foi possível carregar as pessoas.'))
  }, [])

  useEffect(() => {
    if (pessoaId === null) {
      setDisponibilidades([])
      return
    }
    setError(null)
    findDisponibilidades(pessoaId)
      .then(setDisponibilidades)
      .catch(() => setError('Não foi possível carregar os cultos.'))
  }, [pessoaId])

  async function toggleDisponibilidade(cultoId: number, disponivel: boolean) {
    if (pessoaId === null) return
    setLoadingCulto(cultoId)
    try {
      if (disponivel) {
        await setIndisponivel(pessoaId, cultoId)
      } else {
        await removeIndisponivel(pessoaId, cultoId)
      }
      setDisponibilidades((prev) =>
        prev.map((d) => (d.id === cultoId ? { ...d, disponivel: !disponivel } : d)),
      )
    } catch {
      setError('Erro ao atualizar disponibilidade.')
    } finally {
      setLoadingCulto(null)
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-navy mb-4">Disponibilidade</h2>

      {error && (
        <div className="mb-4 rounded-md bg-sand/20 border border-caramel px-4 py-3 text-sm text-espresso">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-navy mb-1">Pessoa</label>
        <select
          className="w-full border border-mist rounded-md px-3 py-2 bg-white text-espresso focus:outline-none focus:ring-2 focus:ring-steel"
          value={pessoaId ?? ''}
          onChange={(e) => setPessoaId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">Selecione uma pessoa...</option>
          {pessoas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </div>

      {pessoaId !== null && (
        <div className="space-y-2">
          {disponibilidades.length === 0 ? (
            <p className="text-sm text-caramel">Nenhum culto cadastrado.</p>
          ) : (
            disponibilidades.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between bg-white rounded-md border border-mist px-4 py-3"
              >
                <div>
                  <p className="font-medium text-navy">{d.culto}</p>
                  <p className="text-sm text-caramel">
                    {new Date(d.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </p>
                </div>
                <button
                  disabled={loadingCulto === d.id}
                  onClick={() => toggleDisponibilidade(d.id, d.disponivel)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${
                    d.disponivel
                      ? 'bg-mist text-navy hover:bg-steel hover:text-white'
                      : 'bg-sand text-espresso hover:bg-caramel hover:text-white'
                  }`}
                >
                  {loadingCulto === d.id ? '...' : d.disponivel ? 'Pode' : 'Não pode'}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
