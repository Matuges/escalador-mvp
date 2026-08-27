import { useEffect, useState } from 'react'
import {
  listMinisterios,
  createMinisterio,
  updateMinisterio,
  deleteMinisterio,
  listFuncoesPorMinisterio,
  createFuncao,
  updateFuncao,
  deleteFuncao,
  type Ministerio,
  type Funcao,
} from '../api'
import { useToast } from '../lib/toast'
import { cx } from '../lib/cx'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { controlClass } from '../components/Field'
import { EmptyState } from '../components/EmptyState'
import { RowSkeleton } from '../components/Skeleton'
import { ConfirmButton } from '../components/ConfirmButton'
import { IconChevronBaixo, IconChevronDireita } from '../components/icons'

export function MinisteriosPage() {
  const notificar = useToast()
  const [ministerios, setMinisterios] = useState<Ministerio[] | null>(null)
  const [novoNome, setNovoNome] = useState('')

  useEffect(() => {
    listMinisterios()
      .then(setMinisterios)
      .catch(() => notificar('Não foi possível carregar os ministérios.'))
  }, [notificar])

  async function criar(e: React.FormEvent) {
    e.preventDefault()
    if (!novoNome.trim()) return
    try {
      const criado = await createMinisterio(novoNome.trim())
      setMinisterios((prev) => [...(prev ?? []), criado])
      setNovoNome('')
    } catch {
      notificar('Não foi possível criar o ministério.')
    }
  }

  function aoRenomear(m: Ministerio) {
    setMinisterios((prev) => prev?.map((x) => (x.id === m.id ? m : x)) ?? prev)
  }

  function aoExcluir(id: number) {
    setMinisterios((prev) => prev?.filter((x) => x.id !== id) ?? prev)
  }

  return (
    <>
      <Card className="p-4">
        <form onSubmit={criar} className="flex gap-2">
          <input
            className={controlClass}
            placeholder="Nome do ministério"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
          />
          <Button type="submit" className="shrink-0">
            Adicionar
          </Button>
        </form>
      </Card>

      <div className="mt-5">
        {!ministerios ? (
          <RowSkeleton count={3} />
        ) : ministerios.length === 0 ? (
          <EmptyState titulo="Nenhum ministério" descricao="Comece criando um ministério acima." />
        ) : (
          <ul className="space-y-2">
            {[...ministerios]
              .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
              .map((m) => (
                <MinisterioRow
                  key={m.id}
                  ministerio={m}
                  onRenomear={aoRenomear}
                  onExcluir={aoExcluir}
                />
              ))}
          </ul>
        )}
      </div>
    </>
  )
}

type RowProps = {
  ministerio: Ministerio
  onRenomear: (m: Ministerio) => void
  onExcluir: (id: number) => void
}

function MinisterioRow({ ministerio, onRenomear, onExcluir }: RowProps) {
  const notificar = useToast()
  const [aberto, setAberto] = useState(false)
  const [editando, setEditando] = useState(false)
  const [nome, setNome] = useState(ministerio.nome)

  const [funcoes, setFuncoes] = useState<Funcao[] | null>(null)
  const [novaFuncao, setNovaFuncao] = useState('')
  const [editFuncaoId, setEditFuncaoId] = useState<number | null>(null)
  const [editFuncaoNome, setEditFuncaoNome] = useState('')

  useEffect(() => {
    if (!aberto || funcoes) return
    listFuncoesPorMinisterio(ministerio.id)
      .then(setFuncoes)
      .catch(() => notificar('Não foi possível carregar as funções.'))
  }, [aberto, funcoes, ministerio.id, notificar])

  async function renomear() {
    if (!nome.trim()) return
    try {
      onRenomear(await updateMinisterio(ministerio.id, nome.trim()))
      setEditando(false)
    } catch {
      notificar('Não foi possível renomear o ministério.')
    }
  }

  async function excluir() {
    try {
      await deleteMinisterio(ministerio.id)
      onExcluir(ministerio.id)
    } catch {
      notificar('Não foi possível excluir. Remova as funções primeiro.')
    }
  }

  async function adicionarFuncao(e: React.FormEvent) {
    e.preventDefault()
    if (!novaFuncao.trim()) return
    try {
      const criada = await createFuncao(ministerio.id, novaFuncao.trim())
      setFuncoes((prev) => [...(prev ?? []), criada])
      setNovaFuncao('')
    } catch {
      notificar('Não foi possível criar a função.')
    }
  }

  async function salvarFuncao(id: number) {
    if (!editFuncaoNome.trim()) return
    try {
      const atualizada = await updateFuncao(id, editFuncaoNome.trim())
      setFuncoes((prev) => prev?.map((f) => (f.id === id ? atualizada : f)) ?? prev)
      setEditFuncaoId(null)
    } catch {
      notificar('Não foi possível atualizar a função.')
    }
  }

  async function excluirFuncao(id: number) {
    try {
      await deleteFuncao(id)
      setFuncoes((prev) => prev?.filter((f) => f.id !== id) ?? prev)
    } catch {
      notificar('Não foi possível excluir a função.')
    }
  }

  return (
    <li className="rounded-xl border border-mist bg-white">
      <div className="flex items-center gap-2 px-3 py-2.5">
        {editando ? (
          <>
            <input
              autoFocus
              className={cx(controlClass, 'h-9')}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') renomear()
                if (e.key === 'Escape') {
                  setNome(ministerio.nome)
                  setEditando(false)
                }
              }}
            />
            <Button size="sm" onClick={renomear}>
              Salvar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setNome(ministerio.nome)
                setEditando(false)
              }}
            >
              Cancelar
            </Button>
          </>
        ) : (
          <>
            <button
              onClick={() => setAberto((v) => !v)}
              aria-expanded={aberto}
              className="group flex flex-1 items-center gap-2 rounded-lg -mx-1 px-1 py-1 text-left hover:bg-mist/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel"
            >
              {aberto ? (
                <IconChevronBaixo width={16} height={16} className="text-steel" />
              ) : (
                <IconChevronDireita width={16} height={16} className="text-mist group-hover:text-steel" />
              )}
              <span className="font-medium text-espresso group-hover:text-navy">{ministerio.nome}</span>
              {funcoes && (
                <span className="rounded-full bg-mist/50 px-2 py-0.5 text-xs text-caramel">
                  {funcoes.length}
                </span>
              )}
            </button>
            <Button size="sm" variant="ghost" onClick={() => setEditando(true)}>
              Renomear
            </Button>
            <ConfirmButton onConfirm={excluir} />
          </>
        )}
      </div>

      {aberto && (
        <div className="border-t border-mist bg-mist/10 px-3 py-3">
          {!funcoes ? (
            <p className="px-1 py-2 text-sm text-caramel">Carregando funções…</p>
          ) : (
            <>
              {funcoes.length === 0 ? (
                <p className="px-1 pb-3 text-sm text-caramel">Nenhuma função neste ministério.</p>
              ) : (
                <ul className="mb-3 space-y-1">
                  {[...funcoes]
                    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
                    .map((f) => (
                      <li key={f.id} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2">
                        {editFuncaoId === f.id ? (
                          <>
                            <input
                              autoFocus
                              className={cx(controlClass, 'h-8')}
                              value={editFuncaoNome}
                              onChange={(e) => setEditFuncaoNome(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') salvarFuncao(f.id)
                                if (e.key === 'Escape') setEditFuncaoId(null)
                              }}
                            />
                            <Button size="sm" onClick={() => salvarFuncao(f.id)}>
                              Salvar
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditFuncaoId(null)}>
                              Cancelar
                            </Button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 text-sm text-espresso">{f.nome}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditFuncaoId(f.id)
                                setEditFuncaoNome(f.nome)
                              }}
                            >
                              Editar
                            </Button>
                            <ConfirmButton onConfirm={() => excluirFuncao(f.id)} />
                          </>
                        )}
                      </li>
                    ))}
                </ul>
              )}

              <form onSubmit={adicionarFuncao} className="flex gap-2">
                <input
                  className={cx(controlClass, 'h-9')}
                  placeholder="Nova função"
                  value={novaFuncao}
                  onChange={(e) => setNovaFuncao(e.target.value)}
                />
                <Button size="sm" type="submit" className="shrink-0">
                  Adicionar função
                </Button>
              </form>
            </>
          )}
        </div>
      )}
    </li>
  )
}
