import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  listCultos,
  createCulto,
  updateCulto,
  deleteCulto,
  gerarCultosDoMes,
  salvarCultosDoMes,
  type Culto,
  type CultoPreview,
} from '../api'
import { useToast } from '../lib/toast'
import { cx } from '../lib/cx'
import {
  parseCultoDate,
  fmtData,
  toInputDate,
  chaveDoMes,
  rotuloDoMes,
} from '../lib/dates'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Field, controlClass } from '../components/Field'
import { EmptyState } from '../components/EmptyState'
import { RowSkeleton } from '../components/Skeleton'
import { ConfirmButton } from '../components/ConfirmButton'
import { IconChevronBaixo, IconChevronDireita } from '../components/icons'

const MESES_NOME = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export function CultosPage() {
  const notificar = useToast()
  const hoje = new Date()
  const chaveMesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`

  const [cultos, setCultos] = useState<Culto[] | null>(null)
  const [busca, setBusca] = useState('')
  const [mostrarAnteriores, setMostrarAnteriores] = useState(false)

  const [novoNome, setNovoNome] = useState('')
  const [novaData, setNovaData] = useState('')

  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [editNome, setEditNome] = useState('')
  const [editData, setEditData] = useState('')

  const [gerarAberto, setGerarAberto] = useState(false)
  const [gerAno, setGerAno] = useState(hoje.getFullYear())
  const [gerMes, setGerMes] = useState(hoje.getMonth() + 1)
  const [preview, setPreview] = useState<CultoPreview[] | null>(null)
  const [salvandoMes, setSalvandoMes] = useState(false)

  useEffect(() => {
    listCultos()
      .then(setCultos)
      .catch(() => notificar('Não foi possível carregar os cultos.'))
  }, [notificar])

  const grupos = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const filtrados = (cultos ?? [])
      .filter((c) => c.nome.toLowerCase().includes(termo))
      .sort((a, b) => parseCultoDate(a.data).getTime() - parseCultoDate(b.data).getTime())

    const mapa = new Map<string, Culto[]>()
    for (const c of filtrados) {
      const chave = chaveDoMes(c.data)
      const arr = mapa.get(chave) ?? []
      arr.push(c)
      mapa.set(chave, arr)
    }
    return [...mapa.entries()].map(([chave, itens]) => ({
      chave,
      rotulo: rotuloDoMes(itens[0].data),
      itens,
      passado: chave < chaveMesAtual,
    }))
  }, [cultos, busca, chaveMesAtual])

  const gruposAnteriores = grupos.filter((g) => g.passado)
  const gruposVisiveis = grupos.filter((g) => !g.passado || mostrarAnteriores)

  async function criar(e: React.FormEvent) {
    e.preventDefault()
    if (!novoNome.trim() || !novaData) return
    try {
      const criado = await createCulto(novoNome.trim(), novaData)
      setCultos((prev) => [...(prev ?? []), criado])
      setNovoNome('')
      setNovaData('')
    } catch {
      notificar('Não foi possível criar o culto.')
    }
  }

  async function salvarEdicao(id: number) {
    if (!editNome.trim() || !editData) return
    try {
      const atualizado = await updateCulto(id, editNome.trim(), editData)
      setCultos((prev) => prev?.map((c) => (c.id === id ? atualizado : c)) ?? prev)
      setEditandoId(null)
    } catch {
      notificar('Não foi possível atualizar o culto.')
    }
  }

  async function excluir(id: number) {
    try {
      await deleteCulto(id)
      setCultos((prev) => prev?.filter((c) => c.id !== id) ?? prev)
    } catch {
      notificar('Não foi possível excluir o culto.')
    }
  }

  async function gerarPreview() {
    try {
      setPreview(await gerarCultosDoMes(gerAno, gerMes))
    } catch {
      notificar('Não foi possível gerar a prévia.')
    }
  }

  async function salvarMes() {
    setSalvandoMes(true)
    try {
      const { count } = await salvarCultosDoMes(gerAno, gerMes)
      setPreview(null)
      setGerarAberto(false)
      setCultos(await listCultos())
      notificar(`${count} culto(s) adicionado(s).`, 'ok')
    } catch {
      notificar('Não foi possível salvar os cultos do mês.')
    } finally {
      setSalvandoMes(false)
    }
  }

  return (
    <>
      <Card className="p-4">
        <form onSubmit={criar} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Field label="Culto" className="flex-1">
            <input
              className={controlClass}
              placeholder="Nome do culto"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
            />
          </Field>
          <Field label="Data">
            <input
              type="date"
              className={controlClass}
              value={novaData}
              onChange={(e) => setNovaData(e.target.value)}
            />
          </Field>
          <Button type="submit" className="shrink-0">
            Adicionar
          </Button>
        </form>
      </Card>

      <Card className="mt-4">
        <button
          onClick={() => setGerarAberto((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel focus-visible:rounded-xl"
        >
          <span className="text-sm font-semibold text-navy">Gerar cultos recorrentes do mês</span>
          {gerarAberto ? (
            <IconChevronBaixo width={18} height={18} className="text-caramel" />
          ) : (
            <IconChevronDireita width={18} height={18} className="text-caramel" />
          )}
        </button>

        {gerarAberto && (
          <div className="border-t border-mist px-4 py-4">
            <div className="flex flex-wrap items-end gap-3">
              <Field label="Mês">
                <select
                  className={cx(controlClass, 'w-40')}
                  value={gerMes}
                  onChange={(e) => {
                    setGerMes(Number(e.target.value))
                    setPreview(null)
                  }}
                >
                  {MESES_NOME.map((nome, i) => (
                    <option key={nome} value={i + 1}>
                      {nome}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Ano">
                <input
                  type="number"
                  className={cx(controlClass, 'w-24')}
                  value={gerAno}
                  onChange={(e) => {
                    setGerAno(Number(e.target.value))
                    setPreview(null)
                  }}
                />
              </Field>
              <Button variant="secondary" onClick={gerarPreview}>
                Ver prévia
              </Button>
              {preview && preview.length > 0 && (
                <Button loading={salvandoMes} onClick={salvarMes}>
                  Adicionar {preview.length}
                </Button>
              )}
            </div>

            {preview && (
              <div className="mt-4">
                {preview.length === 0 ? (
                  <p className="text-sm text-caramel">Nenhum culto recorrente nesse mês.</p>
                ) : (
                  <ul className="divide-y divide-mist rounded-lg border border-mist">
                    {preview.map((p, i) => (
                      <li key={i} className="flex justify-between px-3 py-2 text-sm">
                        <span className="text-espresso">{p.nome}</span>
                        <span className="text-caramel">{fmtData(p.data)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      <div className="mt-6">
        <input
          className={cx(controlClass, 'mb-4')}
          placeholder="Buscar culto…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        {!cultos ? (
          <RowSkeleton />
        ) : grupos.length === 0 ? (
          <EmptyState
            titulo={busca ? 'Nenhum culto encontrado' : 'Nenhum culto cadastrado'}
            descricao={busca ? 'Tente outro termo de busca.' : 'Adicione um culto ou gere os do mês.'}
          />
        ) : (
          <div className="space-y-6">
            {!mostrarAnteriores && gruposAnteriores.length > 0 && (
              <button
                onClick={() => setMostrarAnteriores(true)}
                className="text-sm font-medium text-steel hover:text-navy"
              >
                Mostrar meses anteriores ({gruposAnteriores.length})
              </button>
            )}

            {gruposVisiveis.map((grupo) => (
              <section key={grupo.chave}>
                <h2
                  className={cx(
                    'mb-2 text-xs font-semibold uppercase tracking-wide',
                    grupo.passado ? 'text-caramel/70' : 'text-caramel',
                  )}
                >
                  {grupo.rotulo}
                </h2>
                <ul className="space-y-2">
                  {grupo.itens.map((c) => (
                    <li
                      key={c.id}
                      className={cx(
                        'flex items-center gap-2 rounded-xl border border-mist bg-white px-3 py-2.5',
                        grupo.passado && 'opacity-70',
                      )}
                    >
                      {editandoId === c.id ? (
                        <>
                          <input
                            autoFocus
                            className={cx(controlClass, 'h-9 flex-1')}
                            value={editNome}
                            onChange={(e) => setEditNome(e.target.value)}
                          />
                          <input
                            type="date"
                            className={cx(controlClass, 'h-9 w-40')}
                            value={editData}
                            onChange={(e) => setEditData(e.target.value)}
                          />
                          <Button size="sm" onClick={() => salvarEdicao(c.id)}>
                            Salvar
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditandoId(null)}>
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <>
                          <Link
                            to={`/escala/${c.id}`}
                            className="group flex flex-1 items-baseline gap-2 rounded-lg -mx-1 px-1 py-1 hover:bg-mist/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel"
                          >
                            <span className="font-medium text-espresso group-hover:text-navy">
                              {c.nome}
                            </span>
                            <span className="text-sm text-caramel">{fmtData(c.data)}</span>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditandoId(c.id)
                              setEditNome(c.nome)
                              setEditData(toInputDate(c.data))
                            }}
                          >
                            Editar
                          </Button>
                          <ConfirmButton onConfirm={() => excluir(c.id)} />
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
