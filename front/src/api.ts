const BASE = '/api'

export type Pessoa = { id: number; nome: string }
export type Culto = { id: number; nome: string; data: string }
export type DisponibilidadeItem = { id: number; culto: string; data: string; disponivel: boolean }

// --- Pessoas ---

export async function listPessoas(): Promise<Pessoa[]> {
  const res = await fetch(`${BASE}/pessoa`)
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
