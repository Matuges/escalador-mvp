const BASE = '/api'

export type Pessoa = { id: number; nome: string; ativo: boolean }
export type Culto = { id: number; nome: string; data: string }
export type DisponibilidadeItem = { id: number; culto: string; data: string; disponivel: boolean }
export type CultoDisponibilidadeItem = { id: number; pessoa: string; disponivel: boolean }
export type CultoPreview = { nome: string; data: string }
export type Ministerio = { id: number; nome: string }
export type Funcao = { id: number; nome: string; ministerioId: number }
export type QualificacaoFuncao = {
  id: number
  funcao: string
  ministerio: string
  ministerioId: number
  qualificado: boolean
}

// --- Pessoas ---

export async function listPessoas(funcaoId?: number, incluirInativos?: boolean): Promise<Pessoa[]> {
  const params = new URLSearchParams()
  if (funcaoId != null) params.set('funcaoId', String(funcaoId))
  if (incluirInativos) params.set('incluirInativos', 'true')
  const query = params.toString()
  const res = await fetch(`${BASE}/pessoa${query ? `?${query}` : ''}`)
  if (!res.ok) throw new Error('Erro ao buscar pessoas')
  return res.json()
}

export async function createPessoa(nome: string): Promise<Pessoa> {
  const res = await fetch(`${BASE}/pessoa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome }),
  })
  if (!res.ok) throw new Error('Erro ao criar pessoa')
  return res.json()
}

export async function updatePessoa(id: number, nome: string): Promise<Pessoa> {
  const res = await fetch(`${BASE}/pessoa/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome }),
  })
  if (!res.ok) throw new Error('Erro ao atualizar pessoa')
  return res.json()
}

export async function deletePessoa(id: number): Promise<void> {
  const res = await fetch(`${BASE}/pessoa/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Erro ao deletar pessoa')
}

export async function reativarPessoa(id: number): Promise<Pessoa> {
  const res = await fetch(`${BASE}/pessoa/${id}/reativar`, { method: 'PATCH' })
  if (!res.ok) throw new Error('Erro ao reativar pessoa')
  return res.json()
}

// --- Cultos ---

export async function listCultos(): Promise<Culto[]> {
  const res = await fetch(`${BASE}/culto`)
  if (!res.ok) throw new Error('Erro ao buscar cultos')
  return res.json()
}

export async function createCulto(nome: string, data: string): Promise<Culto> {
  const res = await fetch(`${BASE}/culto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, data }),
  })
  if (!res.ok) throw new Error('Erro ao criar culto')
  return res.json()
}

export async function updateCulto(id: number, nome: string, data: string): Promise<Culto> {
  const res = await fetch(`${BASE}/culto/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, data }),
  })
  if (!res.ok) throw new Error('Erro ao atualizar culto')
  return res.json()
}

export async function deleteCulto(id: number): Promise<void> {
  const res = await fetch(`${BASE}/culto/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Erro ao deletar culto')
}

export async function gerarCultosDoMes(ano: number, mes: number): Promise<CultoPreview[]> {
  const res = await fetch(`${BASE}/culto/mes?ano=${ano}&mes=${mes}`)
  if (!res.ok) throw new Error('Erro ao gerar cultos do mês')
  return res.json()
}

export async function salvarCultosDoMes(ano: number, mes: number): Promise<{ count: number }> {
  const res = await fetch(`${BASE}/culto/mes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ano, mes }),
  })
  if (!res.ok) throw new Error('Erro ao salvar cultos do mês')
  return res.json()
}

// --- Disponibilidade ---

export async function findDisponibilidades(pessoaId: number): Promise<DisponibilidadeItem[]> {
  const res = await fetch(`${BASE}/pessoa/${pessoaId}/disponibilidades`)
  if (!res.ok) throw new Error('Erro ao buscar disponibilidades')
  return res.json()
}

export async function setIndisponivel(pessoaId: number, cultoId: number): Promise<void> {
  const res = await fetch(`${BASE}/pessoa/${pessoaId}/indisponibilidade/${cultoId}`, { method: 'PUT' })
  if (!res.ok) throw new Error('Erro ao marcar indisponível')
}

export async function removeIndisponivel(pessoaId: number, cultoId: number): Promise<void> {
  const res = await fetch(`${BASE}/pessoa/${pessoaId}/indisponibilidade/${cultoId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Erro ao remover indisponibilidade')
}

export async function findDisponibilidadesPorCulto(cultoId: number, funcaoId?: number): Promise<CultoDisponibilidadeItem[]> {
  const url = funcaoId != null
    ? `${BASE}/culto/${cultoId}/disponibilidades?funcaoId=${funcaoId}`
    : `${BASE}/culto/${cultoId}/disponibilidades`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Erro ao buscar disponibilidades')
  return res.json()
}

// --- Ministerio/Funcao ---

export async function listMinisterios(): Promise<Ministerio[]> {
  const res = await fetch(`${BASE}/ministerio`)
  if (!res.ok) throw new Error('Erro ao buscar ministérios')
  return res.json()
}

export async function createMinisterio(nome: string): Promise<Ministerio> {
  const res = await fetch(`${BASE}/ministerio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome }),
  })
  if (!res.ok) throw new Error('Erro ao criar ministério')
  return res.json()
}

export async function updateMinisterio(id: number, nome: string): Promise<Ministerio> {
  const res = await fetch(`${BASE}/ministerio/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome }),
  })
  if (!res.ok) throw new Error('Erro ao atualizar ministério')
  return res.json()
}

export async function deleteMinisterio(id: number): Promise<void> {
  const res = await fetch(`${BASE}/ministerio/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Erro ao excluir ministério')
}

export async function listFuncoesPorMinisterio(ministerioId: number): Promise<Funcao[]> {
  const res = await fetch(`${BASE}/ministerio/${ministerioId}/funcao`)
  if (!res.ok) throw new Error('Erro ao buscar funções')
  return res.json()
}

export async function createFuncao(ministerioId: number, nome: string): Promise<Funcao> {
  const res = await fetch(`${BASE}/ministerio/${ministerioId}/funcao`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome }),
  })
  if (!res.ok) throw new Error('Erro ao criar função')
  return res.json()
}

export async function updateFuncao(id: number, nome: string): Promise<Funcao> {
  const res = await fetch(`${BASE}/funcao/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome }),
  })
  if (!res.ok) throw new Error('Erro ao atualizar função')
  return res.json()
}

export async function deleteFuncao(id: number): Promise<void> {
  const res = await fetch(`${BASE}/funcao/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Erro ao excluir função')
}

// --- Qualificacao ---

export async function setQualificacao(pessoaId: number, funcaoId: number): Promise<void> {
  const res = await fetch(`${BASE}/pessoa/${pessoaId}/qualificacao/${funcaoId}`, { method: 'PUT' })
  if (!res.ok) throw new Error('Erro ao associar função')
}

export async function removeQualificacao(pessoaId: number, funcaoId: number): Promise<void> {
  const res = await fetch(`${BASE}/pessoa/${pessoaId}/qualificacao/${funcaoId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Erro ao remover função')
}

export async function listQualificacoes(pessoaId: number): Promise<QualificacaoFuncao[]> {
  const res = await fetch(`${BASE}/pessoa/${pessoaId}/qualificacoes`)
  if (!res.ok) throw new Error('Erro ao buscar qualificações')
  return res.json()
}
