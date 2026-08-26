import { useEffect, useState } from 'react'
import {
  listPessoas,
  createPessoa,
  updatePessoa,
  deletePessoa,
  listMinisterios,
  listFuncoesPorMinisterio,
  setQualificacao,
  type Pessoa,
  type Ministerio,
  type Funcao,
} from './api'

export default function PessoasPage() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([])
  const [newNome, setNewNome] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editNome, setEditNome] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [ministerios, setMinisterios] = useState<Ministerio[]>([])

  const [filtroMinisterioId, setFiltroMinisterioId] = useState<number | null>(null)
  const [funcoesFiltro, setFuncoesFiltro] = useState<Funcao[]>([])
  const [funcaoId, setFuncaoId] = useState<number | null>(null)

  const [newMinisterioId, setNewMinisterioId] = useState<number | null>(null)
  const [funcoesDoMinisterio, setFuncoesDoMinisterio] = useState<Funcao[]>([])
  const [newFuncaoId, setNewFuncaoId] = useState<number | null>(null)

  useEffect(() => {
    listPessoas(funcaoId ?? undefined)
      .then(setPessoas)
      .catch(() => setError('Erro ao carregar pessoas.'))
  }, [funcaoId])

  useEffect(() => {
    listMinisterios()
      .then(setMinisterios)
      .catch(() => setError('Erro ao carregar ministérios.'))
  }, [])

  useEffect(() => {
    setFuncaoId(null)
    if (filtroMinisterioId === null) {
      setFuncoesFiltro([])
      return
    }
    listFuncoesPorMinisterio(filtroMinisterioId)
      .then(setFuncoesFiltro)
      .catch(() => setError('Erro ao carregar funções.'))
  }, [filtroMinisterioId])

  useEffect(() => {
    setNewFuncaoId(null)
    if (newMinisterioId === null) {
      setFuncoesDoMinisterio([])
      return
    }
    listFuncoesPorMinisterio(newMinisterioId)
      .then(setFuncoesDoMinisterio)
      .catch(() => setError('Erro ao carregar funções.'))
  }, [newMinisterioId])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newNome.trim()) return
    try {
      const criada = await createPessoa(newNome.trim())
      if (funcaoId === null) {
        setPessoas((prev) => [...prev, criada])
      }
      setNewNome('')
      if (newFuncaoId !== null) {
        try {
          await setQualificacao(criada.id, newFuncaoId)
        } catch {
          setError('Pessoa criada, mas erro ao associar função.')
        }
      }
      setNewMinisterioId(null)
    } catch {
      setError('Erro ao criar pessoa.')
    }
  }

  function startEdit(p: Pessoa) {
    setEditingId(p.id)
    setEditNome(p.nome)
  }

  async function handleUpdate(id: number) {
    if (!editNome.trim()) return
    try {
      const atualizada = await updatePessoa(id, editNome.trim())
      setPessoas((prev) => prev.map((p) => (p.id === id ? atualizada : p)))
      setEditingId(null)
    } catch {
      setError('Erro ao atualizar pessoa.')
    }
  }

  async function handleDelete(id: number) {
    try {
      await deletePessoa(id)
      setPessoas((prev) => prev.filter((p) => p.id !== id))
    } catch {
      setError('Erro ao excluir pessoa.')
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-navy mb-4">Pessoas</h2>

      {error && (
        <div className="mb-4 rounded-md bg-sand/20 border border-caramel px-4 py-3 text-sm text-espresso">
          {error}
        </div>
      )}

      <div className="mb-4 flex gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-navy mb-1">Ministério</label>
          <select
            className="w-full border border-mist rounded-md px-3 py-2 bg-white text-espresso focus:outline-none focus:ring-2 focus:ring-steel"
            value={filtroMinisterioId ?? ''}
            onChange={(e) => setFiltroMinisterioId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Todos</option>
            {ministerios.map((m) => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-navy mb-1">Função</label>
          <select
            className="w-full border border-mist rounded-md px-3 py-2 bg-white text-espresso focus:outline-none focus:ring-2 focus:ring-steel disabled:opacity-50"
            value={funcaoId ?? ''}
            onChange={(e) => setFuncaoId(e.target.value ? Number(e.target.value) : null)}
            disabled={filtroMinisterioId === null}
          >
            <option value="">Todas</option>
            {funcoesFiltro.map((f) => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </select>
        </div>
      </div>

      <form onSubmit={handleCreate} className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Nome da pessoa"
          value={newNome}
          onChange={(e) => setNewNome(e.target.value)}
          className="flex-1 min-w-[10rem] border border-mist rounded-md px-3 py-2 text-sm text-espresso placeholder:text-caramel focus:outline-none focus:ring-2 focus:ring-steel"
        />
        <select
          className="border border-mist rounded-md px-3 py-2 bg-white text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-steel"
          value={newMinisterioId ?? ''}
          onChange={(e) => setNewMinisterioId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">Ministério...</option>
          {ministerios.map((m) => (
            <option key={m.id} value={m.id}>{m.nome}</option>
          ))}
        </select>
        <select
          className="border border-mist rounded-md px-3 py-2 bg-white text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-steel disabled:opacity-50"
          value={newFuncaoId ?? ''}
          onChange={(e) => setNewFuncaoId(e.target.value ? Number(e.target.value) : null)}
          disabled={newMinisterioId === null}
        >
          <option value="">Função...</option>
          {funcoesDoMinisterio.map((f) => (
            <option key={f.id} value={f.id}>{f.nome}</option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-navy text-white text-sm rounded-md hover:bg-steel transition-colors"
        >
          Adicionar
        </button>
      </form>

      <div className="space-y-2">
        {pessoas.length === 0 && (
          <p className="text-sm text-caramel">Nenhuma pessoa cadastrada.</p>
        )}
        {pessoas.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-2 bg-white border border-mist rounded-md px-4 py-2"
          >
            {editingId === p.id ? (
              <>
                <input
                  autoFocus
                  type="text"
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdate(p.id)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  className="flex-1 border border-mist rounded px-2 py-1 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-steel"
                />
                <button
                  onClick={() => handleUpdate(p.id)}
                  className="text-sm text-steel hover:text-navy"
                >
                  Salvar
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-sm text-caramel hover:text-espresso"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-espresso">{p.nome}</span>
                <button
                  onClick={() => startEdit(p)}
                  className="text-sm text-steel hover:text-navy"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-sm text-caramel hover:text-espresso"
                >
                  Excluir
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
