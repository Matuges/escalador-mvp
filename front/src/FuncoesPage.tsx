import { useEffect, useState } from 'react'
import {
  listFuncoesPorMinisterio,
  createFuncao,
  updateFuncao,
  deleteFuncao,
  type Ministerio,
  type Funcao,
} from './api'

type Props = {
  ministerio: Ministerio
  onVoltar: () => void
}

export default function FuncoesPage({ ministerio, onVoltar }: Props) {
  const [funcoes, setFuncoes] = useState<Funcao[]>([])
  const [newNome, setNewNome] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editNome, setEditNome] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listFuncoesPorMinisterio(ministerio.id)
      .then(setFuncoes)
      .catch(() => setError('Erro ao carregar funções.'))
  }, [ministerio.id])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newNome.trim()) return
    try {
      const criada = await createFuncao(ministerio.id, newNome.trim())
      setFuncoes((prev) => [...prev, criada])
      setNewNome('')
    } catch {
      setError('Erro ao criar função.')
    }
  }

  function startEdit(f: Funcao) {
    setEditingId(f.id)
    setEditNome(f.nome)
  }

  async function handleUpdate(id: number) {
    if (!editNome.trim()) return
    try {
      const atualizada = await updateFuncao(id, editNome.trim())
      setFuncoes((prev) => prev.map((f) => (f.id === id ? atualizada : f)))
      setEditingId(null)
    } catch {
      setError('Erro ao atualizar função.')
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteFuncao(id)
      setFuncoes((prev) => prev.filter((f) => f.id !== id))
    } catch {
      setError('Erro ao excluir função.')
    }
  }

  return (
    <div>
      <button onClick={onVoltar} className="text-sm text-steel hover:text-navy mb-4">
        ← Voltar
      </button>

      <h2 className="text-lg font-semibold text-navy mb-4">{ministerio.nome}</h2>

      {error && (
        <div className="mb-4 rounded-md bg-sand/20 border border-caramel px-4 py-3 text-sm text-espresso">
          {error}
        </div>
      )}

      <form onSubmit={handleCreate} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Nome da função"
          value={newNome}
          onChange={(e) => setNewNome(e.target.value)}
          className="flex-1 border border-mist rounded-md px-3 py-2 text-sm text-espresso placeholder:text-caramel focus:outline-none focus:ring-2 focus:ring-steel"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-navy text-white text-sm rounded-md hover:bg-steel transition-colors"
        >
          Adicionar
        </button>
      </form>

      <div className="space-y-2">
        {funcoes.length === 0 && (
          <p className="text-sm text-caramel">Nenhuma função cadastrada.</p>
        )}
        {funcoes.map((f) => (
          <div
            key={f.id}
            className="flex items-center gap-2 bg-white border border-mist rounded-md px-4 py-2"
          >
            {editingId === f.id ? (
              <>
                <input
                  autoFocus
                  type="text"
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdate(f.id)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  className="flex-1 border border-mist rounded px-2 py-1 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-steel"
                />
                <button
                  onClick={() => handleUpdate(f.id)}
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
                <span className="flex-1 text-espresso">{f.nome}</span>
                <button
                  onClick={() => startEdit(f)}
                  className="text-sm text-steel hover:text-navy"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(f.id)}
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
