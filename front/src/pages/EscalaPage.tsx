import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  listCultos,
  findDisponibilidadesPorCulto,
  setIndisponivel,
  removeIndisponivel,
  type Culto,
  type CultoDisponibilidadeItem,
} from '../api'
import { useToast } from '../lib/toast'
import { fmtDataLonga, parseCultoDate, inicioDeHoje } from '../lib/dates'
import { cx } from '../lib/cx'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/Card'
import { controlClass } from '../components/Field'
import { CultoStrip } from '../components/CultoStrip'
import { Segmented } from '../components/Segmented'
import { EmptyState } from '../components/EmptyState'
import { RowSkeleton } from '../components/Skeleton'
import { AvailabilityToggle } from '../components/AvailabilityToggle'
import { MinisterioFuncaoSelect, type MinisterioFuncao } from '../components/MinisterioFuncaoSelect'

type Status = 'todos' | 'disponiveis' | 'indisponiveis'

export function EscalaPage() {
  const { cultoId: cultoIdParam } = useParams()
  const navigate = useNavigate()
  const notificar = useToast()

  const cultoId = cultoIdParam ? Number(cultoIdParam) : null

  const [cultos, setCultos] = useState<Culto[] | null>(null)
  const [mf, setMf] = useState<MinisterioFuncao>({ ministerioId: null, funcaoId: null })
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState<Status>('todos')

  const [pessoas, setPessoas] = useState<CultoDisponibilidadeItem[] | null>(null)
  const [ocupada, setOcupada] = useState<number | null>(null)

  useEffect(() => {
    listCultos()
      .then(setCultos)
      .catch(() => notificar('Não foi possível carregar os cultos.'))
  }, [notificar])

  // Sem culto na URL: seleciona o próximo (ou o mais recente, se todos passaram).
  useEffect(() => {
    if (cultoId != null || !cultos || cultos.length === 0) return
    const hoje = inicioDeHoje().getTime()
    const ordenados = [...cultos].sort(
      (a, b) => parseCultoDate(a.data).getTime() - parseCultoDate(b.data).getTime(),
    )
    const alvo =
      ordenados.find((c) => parseCultoDate(c.data).getTime() >= hoje) ??
      ordenados[ordenados.length - 1]
    navigate(`/escala/${alvo.id}`, { replace: true })
  }, [cultoId, cultos, navigate])

  useEffect(() => {
    if (cultoId == null) return
    setPessoas(null)
    findDisponibilidadesPorCulto(cultoId, mf.funcaoId ?? undefined)
      .then(setPessoas)
      .catch(() => notificar('Não foi possível carregar as pessoas.'))
  }, [cultoId, mf.funcaoId, notificar])

  const cultoSelecionado = useMemo(
    () => cultos?.find((c) => c.id === cultoId) ?? null,
    [cultos, cultoId],
  )

  const contadores = useMemo(() => {
    const disp = pessoas?.filter((p) => p.disponivel).length ?? 0
    const indisp = (pessoas?.length ?? 0) - disp
    return { disp, indisp, total: pessoas?.length ?? 0 }
  }, [pessoas])

  const exibidas = useMemo(() => {
    if (!pessoas) return []
    const termo = busca.trim().toLowerCase()
    return pessoas
      .filter((p) =>
        status === 'disponiveis' ? p.disponivel : status === 'indisponiveis' ? !p.disponivel : true,
      )
      .filter((p) => p.pessoa.toLowerCase().includes(termo))
      .sort((a, b) => a.pessoa.localeCompare(b.pessoa, 'pt-BR'))
  }, [pessoas, status, busca])

  async function alternar(pessoaId: number, disponivel: boolean) {
    if (cultoId == null) return
    setOcupada(pessoaId)
    setPessoas((prev) =>
      prev?.map((p) => (p.id === pessoaId ? { ...p, disponivel: !disponivel } : p)) ?? prev,
    )
    try {
      if (disponivel) await setIndisponivel(pessoaId, cultoId)
      else await removeIndisponivel(pessoaId, cultoId)
    } catch {
      setPessoas((prev) =>
        prev?.map((p) => (p.id === pessoaId ? { ...p, disponivel } : p)) ?? prev,
      )
      notificar('Não foi possível atualizar a disponibilidade.')
    } finally {
      setOcupada(null)
    }
  }

  if (cultos && cultos.length === 0) {
    return (
      <>
        <PageHeader titulo="Escala" />
        <EmptyState
          titulo="Nenhum culto cadastrado"
          descricao="Cadastre cultos para começar a montar a escala."
        />
      </>
    )
  }

  return (
    <>
      <PageHeader
        titulo="Escala"
        subtitulo={
          cultoSelecionado
            ? fmtDataLonga(cultoSelecionado.data)
            : 'Escolha um culto para ver quem está disponível'
        }
      />

      {cultos ? (
        <CultoStrip
          cultos={cultos}
          selecionadoId={cultoId}
          onSelecionar={(id) => navigate(`/escala/${id}`)}
        />
      ) : (
        <div className="flex gap-2 pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 w-28 shrink-0 animate-pulse rounded-xl bg-mist/50" />
          ))}
        </div>
      )}

      {cultoSelecionado && (
        <>
          <Card className="mt-4 p-4">
            <input
              className={cx(controlClass, 'mb-3')}
              placeholder="Buscar por nome…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <MinisterioFuncaoSelect value={mf} onChange={setMf} modo="filtro" />
          </Card>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <Segmented
              aria-label="Filtrar por disponibilidade"
              value={status}
              onChange={setStatus}
              opcoes={[
                { value: 'todos', label: 'Todos', contador: contadores.total },
                { value: 'disponiveis', label: 'Disponíveis', contador: contadores.disp },
                { value: 'indisponiveis', label: 'Não podem', contador: contadores.indisp },
              ]}
            />
          </div>

          <div className="mt-4">
            {!pessoas ? (
              <RowSkeleton />
            ) : contadores.total === 0 ? (
              <EmptyState
                titulo="Ninguém para mostrar"
                descricao={
                  mf.funcaoId
                    ? 'Nenhuma pessoa está qualificada para essa função.'
                    : 'Nenhuma pessoa cadastrada ainda.'
                }
              />
            ) : exibidas.length === 0 ? (
              <EmptyState
                titulo="Nada neste filtro"
                descricao={
                  busca.trim()
                    ? 'Nenhuma pessoa bate com a busca. Ajuste o texto ou os filtros acima.'
                    : 'Ajuste o filtro acima para ver mais pessoas.'
                }
              />
            ) : (
              <ul className="space-y-2">
                {exibidas.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between rounded-xl border border-mist bg-white px-4 py-3"
                  >
                    <span className="font-medium text-navy">{p.pessoa}</span>
                    <AvailabilityToggle
                      disponivel={p.disponivel}
                      ocupado={ocupada === p.id}
                      onToggle={() => alternar(p.id, p.disponivel)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </>
  )
}
