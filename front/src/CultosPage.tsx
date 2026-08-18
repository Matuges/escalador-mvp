import { useEffect, useState } from 'react'
import { listCultos, createCulto, updateCulto, deleteCulto, type Culto } from './api'

function fmtData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

function toInputDate(iso: string) {
  return iso.slice(0, 10)
}

export default function CultosPage() {
  const [cultos, setCultos] = useState<Culto[]>([])
  const [newNome, setNewNome] = useState('')
  const [newData, setNewData] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editNome, setEditNome] = useState('')
  const [editData, setEditData] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listCultos()
      .then(setCultos)
      .catch(() => setError('Erro ao carregar cultos.'))
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newNome.trim() || !newData) return
    try {
      const criado = await createCulto(newNome.trim(), newData)
      setCultos((prev) => [...prev, criado])
      setNewNome('')
      setNewData('')
    } catch {
      setError('Erro ao criar culto.')
    }
  }

  function startEdit(c: Culto) {
    setEditingId(c.id)
    setEditNome(c.nome)
    setEditData(toInputDate(c.data))
  }

  async function handleUpdate(id: number) {
    if (!editNome.trim() || !editData) return
    try {
      const atualizado = await updateCulto(id, editNome.trim(), editData)
      setCultos((prev) => prev.map((c) => (c.id === id ? atualizado : c)))
      setEditingId(null)
    } catch {
      setError('Erro ao atualizar culto.')
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteCulto(id)
      setCultos((prev) => prev.filter((c) => c.id !== id))
    } catch {
      setError('Erro ao excluir culto.')
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-navy mb-4">Cultos</h2>

      {error && (
        <div className="mb-4 rounded-md bg-sand/20 border border-caramel px-4 py-3 text-sm text-espresso">
          {error}
        </div>
      )}

      <form onSubmit={handleCreate} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Nome do culto"
          value={newNome}
          onChange={(e) => setNewNome(e.target.value)}
          className="flex-1 border border-mist rounded-md px-3 py-2 text-sm text-espresso placeholder:text-caramel focus:outline-none focus:ring-2 focus:ring-steel"
        />
        <input
          type="date"
          value={newData}
          onChange={(e) => setNewData(e.target.value)}
          className="border border-mist rounded-md px-3 py-2 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-steel"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-navy text-white text-sm rounded-md hover:bg-steel transition-colors"
        >
          Adicionar
        </button>
      </form>

      <div className="space-y-2">
        {cultos.length === 0 && (
          <p className="text-sm text-caramel">Nenhum culto cadastrado.</p>
        )}
        {cultos.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-2 bg-white border border-mist rounded-md px-4 py-2"
          >
            {editingId === c.id ? (
              <>
                <input
                  autoFocus
                  type="text"
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                  className="flex-1 border border-mist rounded px-2 py-1 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-steel"
                />
                <input
                  type="date"
                  value={editData}
                  onChange={(e) => setEditData(e.target.value)}
                  className="border border-mist rounded px-2 py-1 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-steel"
                />
                <button
                  onClick={() => handleUpdate(c.id)}
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
                <span className="flex-1 text-espresso">{c.nome}</span>
                <span className="text-sm text-caramel">{fmtData(c.data)}</span>
                <button
                  onClick={() => startEdit(c)}
                  className="text-sm text-steel hover:text-navy"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
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
