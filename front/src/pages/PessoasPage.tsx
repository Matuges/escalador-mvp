import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  listPessoas,
  createPessoa,
  updatePessoa,
  deletePessoa,
  reativarPessoa,
  setQualificacao,
  type Pessoa,
} from '../api'
import { useToast } from '../lib/toast'
import { cx } from '../lib/cx'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/Card'
import { controlClass } from '../components/Field'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { RowSkeleton } from '../components/Skeleton'
import { ConfirmButton } from '../components/ConfirmButton'
import { IconChevronDireita, IconMais } from '../components/icons'
import { MinisterioFuncaoSelect, type MinisterioFuncao } from '../components/MinisterioFuncaoSelect'

export function PessoasPage() {
  const notificar = useToast()

  const [pessoas, setPessoas] = useState<Pessoa[] | null>(null)
  const [filtro, setFiltro] = useState<MinisterioFuncao>({ ministerioId: null, funcaoId: null })
  const [incluirInativos, setIncluirInativos] = useState(false)

  const [novoNome, setNovoNome] = useState('')
  const [abrirQualificacao, setAbrirQualificacao] = useState(false)
  const [novaQualificacao, setNovaQualificacao] = useState<MinisterioFuncao>({
    ministerioId: null,
    funcaoId: null,
  })
  const [criando, setCriando] = useState(false)

  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [editNome, setEditNome] = useState('')

  useEffect(() => {
    setPessoas(null)
    listPessoas(filtro.funcaoId ?? undefined, incluirInativos)
      .then(setPessoas)
      .catch(() => notificar('Não foi possível carregar as pessoas.'))
  }, [filtro.funcaoId, incluirInativos, notificar])

  const ordenadas = useMemo(
    () => [...(pessoas ?? [])].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [pessoas],
  )

  async function criar(e: React.FormEvent) {
    e.preventDefault()
    const nome = novoNome.trim()
    if (!nome) return
    setCriando(true)
    try {
      const criada = await createPessoa(nome)
      if (novaQualificacao.funcaoId != null) {
        try {
          await setQualificacao(criada.id, novaQualificacao.funcaoId)
        } catch {
          notificar('Pessoa criada, mas não foi possível associar a função.')
        }
      }
      setNovoNome('')
      setNovaQualificacao({ ministerioId: null, funcaoId: null })
      setAbrirQualificacao(false)
      if (filtro.funcaoId == null || filtro.funcaoId === novaQualificacao.funcaoId) {
        setPessoas((prev) => [...(prev ?? []), criada])
      }
    } catch {
      notificar('Não foi possível criar a pessoa.')
    } finally {
      setCriando(false)
    }
  }

  async function salvarNome(id: number) {
    const nome = editNome.trim()
    if (!nome) return
    try {
      const atualizada = await updatePessoa(id, nome)
      setPessoas((prev) => prev?.map((p) => (p.id === id ? atualizada : p)) ?? prev)
      setEditandoId(null)
    } catch {
      notificar('Não foi possível renomear a pessoa.')
    }
  }

  async function inativar(id: number) {
    try {
      await deletePessoa(id)
      setPessoas((prev) =>
        prev
          ?.map((p) => (p.id === id ? { ...p, ativo: false } : p))
          .filter((p) => incluirInativos || p.ativo) ?? prev,
      )
    } catch {
      notificar('Não foi possível inativar a pessoa.')
    }
  }

  async function reativar(id: number) {
    try {
      const reativada = await reativarPessoa(id)
      setPessoas((prev) => prev?.map((p) => (p.id === id ? reativada : p)) ?? prev)
    } catch {
      notificar('Não foi possível reativar a pessoa.')
    }
  }

  return (
    <>
      <PageHeader titulo="Pessoas" subtitulo="Quem faz parte das escalas" />

      <Card className="p-4">
        <form onSubmit={criar} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              className={controlClass}
              placeholder="Nome da pessoa"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
            />
            <Button type="submit" loading={criando} className="shrink-0">
              Adicionar
            </Button>
          </div>

          {abrirQualificacao ? (
            <div className="rounded-lg bg-mist/20 p-3">
              <MinisterioFuncaoSelect
                value={novaQualificacao}
                onChange={setNovaQualificacao}
                modo="opcional"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAbrirQualificacao(true)}
              className="inline-flex items-center gap-1 self-start text-sm text-steel hover:text-navy"
            >
              <IconMais width={15} height={15} />
              Já associar uma função
            </button>
          )}
        </form>
      </Card>

      <Card className="mt-4 p-4">
        <MinisterioFuncaoSelect value={filtro} onChange={setFiltro} modo="filtro" />
        <label className="mt-3 flex items-center gap-2 text-sm text-espresso">
          <input
            type="checkbox"
            className="h-4 w-4 accent-steel"
            checked={incluirInativos}
            onChange={(e) => setIncluirInativos(e.target.checked)}
          />
          Incluir pessoas inativas
        </label>
      </Card>

      <div className="mt-5">
        {!pessoas ? (
          <RowSkeleton />
        ) : ordenadas.length === 0 ? (
          <EmptyState
            titulo="Nenhuma pessoa"
            descricao={
              filtro.funcaoId
                ? 'Ninguém está qualificado para essa função ainda.'
                : 'Adicione a primeira pessoa no formulário acima.'
            }
          />
        ) : (
          <ul className="space-y-2">
            {ordenadas.map((p) => (
              <li
                key={p.id}
                className={cx(
                  'flex items-center gap-2 rounded-xl border border-mist bg-white px-3 py-2.5',
                  !p.ativo && 'opacity-60',
                )}
              >
                {editandoId === p.id ? (
                  <>
                    <input
                      autoFocus
                      className={cx(controlClass, 'h-9')}
                      value={editNome}
                      onChange={(e) => setEditNome(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') salvarNome(p.id)
                        if (e.key === 'Escape') setEditandoId(null)
                      }}
                    />
                    <Button size="sm" onClick={() => salvarNome(p.id)}>
                      Salvar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditandoId(null)}>
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      to={`/pessoas/${p.id}`}
                      className="group flex flex-1 items-center gap-2 rounded-lg px-1 py-1 -mx-1 hover:bg-mist/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel"
                    >
                      <span className="font-medium text-espresso group-hover:text-navy">{p.nome}</span>
                      {!p.ativo && (
                        <span className="rounded-full bg-mist/60 px-2 py-0.5 text-xs text-caramel">
                          inativa
                        </span>
                      )}
                      <IconChevronDireita
                        width={16}
                        height={16}
                        className="ml-auto text-mist group-hover:text-steel"
                      />
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditandoId(p.id)
                        setEditNome(p.nome)
                      }}
                    >
                      Renomear
                    </Button>
                    {p.ativo ? (
                      <ConfirmButton label="Inativar" onConfirm={() => inativar(p.id)} />
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => reativar(p.id)}>
                        Reativar
                      </Button>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
