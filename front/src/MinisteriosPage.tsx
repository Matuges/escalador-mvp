import { useEffect, useState } from 'react'
import {
  listMinisterios,
  createMinisterio,
  updateMinisterio,
  deleteMinisterio,
  type Ministerio,
} from './api'
import FuncoesPage from './FuncoesPage'

export default function MinisteriosPage() {
  const [ministerios, setMinisterios] = useState<Ministerio[]>([])
  const [newNome, setNewNome] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editNome, setEditNome] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [ministerioSelecionado, setMinisterioSelecionado] = useState<Ministerio | null>(null)

  useEffect(() => {
    listMinisterios()
      .then(setMinisterios)
      .catch(() => setError('Erro ao carregar ministérios.'))
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newNome.trim()) return
    try {
      const criado = await createMinisterio(newNome.trim())
      setMinisterios((prev) => [...prev, criado])
      setNewNome('')
    } catch {
      setError('Erro ao criar ministério.')
    }
  }

  function startEdit(m: Ministerio) {
    setEditingId(m.id)
    setEditNome(m.nome)
  }

  async function handleUpdate(id: number) {
    if (!editNome.trim()) return
    try {
      const atualizado = await updateMinisterio(id, editNome.trim())
      setMinisterios((prev) => prev.map((m) => (m.id === id ? atualizado : m)))
      setEditingId(null)
    } catch {
      setError('Erro ao atualizar ministério.')
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteMinisterio(id)
      setMinisterios((prev) => prev.filter((m) => m.id !== id))
    } catch {
      setError('Erro ao excluir ministério.')
    }
  }

  if (ministerioSelecionado) {
    return (
      <FuncoesPage
        ministerio={ministerioSelecionado}
        onVoltar={() => setMinisterioSelecionado(null)}
      />
    )
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-navy mb-4">Ministérios</h2>

      {error && (
        <div className="mb-4 rounded-md bg-sand/20 border border-caramel px-4 py-3 text-sm text-espresso">
          {error}
        </div>
      )}

      <form onSubmit={handleCreate} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Nome do ministério"
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
        {ministerios.length === 0 && (
          <p className="text-sm text-caramel">Nenhum ministério cadastrado.</p>
        )}
        {ministerios.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-2 bg-white border border-mist rounded-md px-4 py-2"
          >
            {editingId === m.id ? (
              <>
                <input
                  autoFocus
                  type="text"
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdate(m.id)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  className="flex-1 border border-mist rounded px-2 py-1 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-steel"
                />
                <button
                  onClick={() => handleUpdate(m.id)}
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
                <span
                  onClick={() => setMinisterioSelecionado(m)}
                  className="flex-1 text-espresso cursor-pointer hover:underline"
                >
                  {m.nome}
                </span>
                <button
                  onClick={() => startEdit(m)}
                  className="text-sm text-steel hover:text-navy"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
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
