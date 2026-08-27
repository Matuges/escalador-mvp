import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  getPessoa,
  updatePessoa,
  deletePessoa,
  reativarPessoa,
  listQualificacoes,
  setQualificacao,
  removeQualificacao,
  findDisponibilidades,
  setIndisponivel,
  removeIndisponivel,
  type Pessoa,
  type QualificacaoFuncao,
  type DisponibilidadeItem,
} from '../api'
import { useToast } from '../lib/toast'
import { cx } from '../lib/cx'
import { parseCultoDate, fmtData, rotuloDoMes, chaveDoMes, ehPassado } from '../lib/dates'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Segmented } from '../components/Segmented'
import { Skeleton } from '../components/Skeleton'
import { EmptyState } from '../components/EmptyState'
import { AvailabilityToggle } from '../components/AvailabilityToggle'
import { ConfirmButton } from '../components/ConfirmButton'
import { controlClass } from '../components/Field'

type Aba = 'qualificacoes' | 'disponibilidade'

export function PessoaDetailPage() {
  const { pessoaId: param } = useParams()
  const pessoaId = Number(param)
  const notificar = useToast()

  const [pessoa, setPessoa] = useState<Pessoa | null>(null)
  const [naoEncontrada, setNaoEncontrada] = useState(false)
  const [aba, setAba] = useState<Aba>('qualificacoes')

  const [editandoNome, setEditandoNome] = useState(false)
  const [nome, setNome] = useState('')

  const [qualificacoes, setQualificacoes] = useState<QualificacaoFuncao[] | null>(null)
  const [mostrarTodosMinisterios, setMostrarTodosMinisterios] = useState(false)
  const [disponibilidades, setDisponibilidades] = useState<DisponibilidadeItem[] | null>(null)
  const [ocupadoQual, setOcupadoQual] = useState<number | null>(null)
  const [ocupadoDisp, setOcupadoDisp] = useState<number | null>(null)

  useEffect(() => {
    if (!Number.isFinite(pessoaId)) {
      setNaoEncontrada(true)
      return
    }
    let ativo = true
    Promise.allSettled([
      getPessoa(pessoaId),
      listQualificacoes(pessoaId),
      findDisponibilidades(pessoaId),
    ]).then(([pessoaRes, qualRes, dispRes]) => {
      if (!ativo) return
      if (pessoaRes.status === 'fulfilled') {
        if (!pessoaRes.value) setNaoEncontrada(true)
        else {
          setPessoa(pessoaRes.value)
          setNome(pessoaRes.value.nome)
        }
      }
      if (qualRes.status === 'fulfilled') setQualificacoes(qualRes.value)
      if (dispRes.status === 'fulfilled') setDisponibilidades(dispRes.value)
      if ([pessoaRes, qualRes, dispRes].some((r) => r.status === 'rejected')) {
        notificar('Não foi possível carregar alguns dados da pessoa.')
      }
    })
    return () => {
      ativo = false
    }
  }, [pessoaId, notificar])

  const porMinisterio = useMemo(() => {
    const grupos = new Map<string, QualificacaoFuncao[]>()
    for (const q of qualificacoes ?? []) {
      const arr = grupos.get(q.ministerio) ?? []
      arr.push(q)
      grupos.set(q.ministerio, arr)
    }
    return [...grupos.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))
      .map(([ministerio, funcoes]) => ({
        ministerio,
        funcoes: funcoes.sort((a, b) => a.funcao.localeCompare(b.funcao, 'pt-BR')),
      }))
  }, [qualificacoes])

  const gruposComQualificacao = useMemo(
    () => porMinisterio.filter((g) => g.funcoes.some((f) => f.qualificado)),
    [porMinisterio],
  )
  const gruposVisiveis = mostrarTodosMinisterios ? porMinisterio : gruposComQualificacao

  const dispPorMes = useMemo(() => {
    const ordenadas = [...(disponibilidades ?? [])].sort(
      (a, b) => parseCultoDate(a.data).getTime() - parseCultoDate(b.data).getTime(),
    )
    const grupos = new Map<string, DisponibilidadeItem[]>()
    for (const d of ordenadas) {
      const arr = grupos.get(chaveDoMes(d.data)) ?? []
      arr.push(d)
      grupos.set(chaveDoMes(d.data), arr)
    }
    return [...grupos.values()].map((itens) => ({ rotulo: rotuloDoMes(itens[0].data), itens }))
  }, [disponibilidades])

  const totalQualificado = qualificacoes?.filter((q) => q.qualificado).length ?? 0
  const totalIndisponivel = disponibilidades?.filter((d) => !d.disponivel).length ?? 0

  async function renomear() {
    const valor = nome.trim()
    if (!valor || !pessoa) return
    try {
      const atualizada = await updatePessoa(pessoa.id, valor)
      setPessoa(atualizada)
      setEditandoNome(false)
    } catch {
      notificar('Não foi possível renomear.')
    }
  }

  async function alternarAtivo() {
    if (!pessoa) return
    try {
      if (pessoa.ativo) {
        await deletePessoa(pessoa.id)
        setPessoa({ ...pessoa, ativo: false })
      } else {
        setPessoa(await reativarPessoa(pessoa.id))
      }
    } catch {
      notificar('Não foi possível alterar o status da pessoa.')
    }
  }

  async function alternarQualificacao(funcaoId: number, qualificado: boolean) {
    setOcupadoQual(funcaoId)
    setQualificacoes((prev) =>
      prev?.map((q) => (q.id === funcaoId ? { ...q, qualificado: !qualificado } : q)) ?? prev,
    )
    try {
      if (qualificado) await removeQualificacao(pessoaId, funcaoId)
      else await setQualificacao(pessoaId, funcaoId)
    } catch {
      setQualificacoes((prev) =>
        prev?.map((q) => (q.id === funcaoId ? { ...q, qualificado } : q)) ?? prev,
      )
      notificar('Não foi possível atualizar a qualificação.')
    } finally {
      setOcupadoQual(null)
    }
  }

  async function alternarDisponibilidade(cultoId: number, disponivel: boolean) {
    setOcupadoDisp(cultoId)
    setDisponibilidades((prev) =>
      prev?.map((d) => (d.id === cultoId ? { ...d, disponivel: !disponivel } : d)) ?? prev,
    )
    try {
      if (disponivel) await setIndisponivel(pessoaId, cultoId)
      else await removeIndisponivel(pessoaId, cultoId)
    } catch {
      setDisponibilidades((prev) =>
        prev?.map((d) => (d.id === cultoId ? { ...d, disponivel } : d)) ?? prev,
      )
      notificar('Não foi possível atualizar a disponibilidade.')
    } finally {
      setOcupadoDisp(null)
    }
  }

  if (naoEncontrada) {
    return (
      <>
        <PageHeader titulo="Pessoa" voltar={{ para: '/pessoas', label: 'Pessoas' }} />
        <EmptyState titulo="Pessoa não encontrada" descricao="Ela pode ter sido removida." />
      </>
    )
  }

  return (
    <>
      <PageHeader
        titulo={pessoa?.nome ?? '…'}
        subtitulo={pessoa ? (pessoa.ativo ? 'Ativa' : 'Inativa') : undefined}
        voltar={{ para: '/pessoas', label: 'Pessoas' }}
        acao={
          pessoa && !editandoNome ? (
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setEditandoNome(true)}>
                Renomear
              </Button>
              {pessoa.ativo ? (
                <ConfirmButton label="Inativar" onConfirm={alternarAtivo} />
              ) : (
                <Button size="sm" onClick={alternarAtivo}>
                  Reativar
                </Button>
              )}
            </div>
          ) : undefined
        }
      />

      {editandoNome && (
        <Card className="mb-5 flex items-center gap-2 p-3">
          <input
            autoFocus
            className={cx(controlClass, 'h-9')}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') renomear()
              if (e.key === 'Escape') {
                setNome(pessoa?.nome ?? '')
                setEditandoNome(false)
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
              setNome(pessoa?.nome ?? '')
              setEditandoNome(false)
            }}
          >
            Cancelar
          </Button>
        </Card>
      )}

      <Segmented
        aria-label="Seções da pessoa"
        value={aba}
        onChange={setAba}
        opcoes={[
          { value: 'qualificacoes', label: 'Qualificações', contador: totalQualificado },
          { value: 'disponibilidade', label: 'Indisponível em', contador: totalIndisponivel },
        ]}
      />

      <div className="mt-4">
        {aba === 'qualificacoes' &&
          (!qualificacoes ? (
            <SkeletonBloco />
          ) : porMinisterio.length === 0 ? (
            <EmptyState
              titulo="Nenhuma função cadastrada"
              descricao="Cadastre ministérios e funções em Cadastros."
            />
          ) : (
            <div className="space-y-3">
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setMostrarTodosMinisterios((v) => !v)}
                >
                  {mostrarTodosMinisterios ? 'Ocultar outros ministérios' : 'Adicionar função'}
                </Button>
              </div>

              {gruposVisiveis.length === 0 ? (
                <EmptyState
                  titulo="Nenhuma função ainda"
                  descricao="Use “Adicionar função” para qualificar esta pessoa."
                />
              ) : (
                gruposVisiveis.map((grupo) => (
                  <Card key={grupo.ministerio} className="p-4">
                    <h2 className="mb-2 text-sm font-semibold text-navy">{grupo.ministerio}</h2>
                    <div className="space-y-1">
                      {grupo.funcoes.map((f) => (
                        <label
                          key={f.id}
                          className="flex cursor-pointer items-center gap-2.5 rounded-md py-1 text-sm text-espresso"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-steel"
                            checked={f.qualificado}
                            disabled={ocupadoQual === f.id}
                            onChange={() => alternarQualificacao(f.id, f.qualificado)}
                          />
                          {f.funcao}
                        </label>
                      ))}
                    </div>
                  </Card>
                ))
              )}
            </div>
          ))}

        {aba === 'disponibilidade' &&
          (!disponibilidades ? (
            <SkeletonBloco />
          ) : dispPorMes.length === 0 ? (
            <EmptyState titulo="Nenhum culto cadastrado" descricao="Cadastre cultos para registrar a disponibilidade." />
          ) : (
            <div className="space-y-5">
              <p className="text-sm text-caramel">
                Marque os cultos em que <strong className="text-espresso">{pessoa?.nome}</strong> não
                pode servir.
              </p>
              {dispPorMes.map((mes) => (
                <div key={mes.rotulo}>
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-caramel">
                    {mes.rotulo}
                  </h2>
                  <ul className="space-y-2">
                    {mes.itens.map((d) => (
                      <li
                        key={d.id}
                        className={cx(
                          'flex items-center justify-between rounded-xl border border-mist bg-white px-4 py-3',
                          ehPassado(d.data) && 'opacity-60',
                        )}
                      >
                        <span>
                          <span className="font-medium text-navy">{d.culto}</span>
                          <span className="ml-2 text-sm text-caramel">{fmtData(d.data)}</span>
                        </span>
                        <AvailabilityToggle
                          disponivel={d.disponivel}
                          ocupado={ocupadoDisp === d.id}
                          onToggle={() => alternarDisponibilidade(d.id, d.disponivel)}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
      </div>
    </>
  )
}

function SkeletonBloco() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="space-y-2 p-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </Card>
      ))}
    </div>
  )
}
