import { useEffect, useState } from 'react'
import { listPessoas, createPessoa, updatePessoa, deletePessoa, type Pessoa } from './api'

export default function PessoasPage() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([])
  const [newNome, setNewNome] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editNome, setEditNome] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listPessoas()
      .then(setPessoas)
      .catch(() => setError('Erro ao carregar pessoas.'))
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newNome.trim()) return
    try {
      const criada = await createPessoa(newNome.trim())
      setPessoas((prev) => [...prev, criada])
      setNewNome('')
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

      <form onSubmit={handleCreate} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Nome da pessoa"
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
