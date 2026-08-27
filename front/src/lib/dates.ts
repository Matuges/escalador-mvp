/**
 * A API devolve datas de culto como ISO (`2026-08-02T00:00:00.000Z`). Só a parte
 * do calendário importa aqui — o horário é sempre meia-noite — então cortamos o
 * ISO em `YYYY-MM-DD` e montamos um Date no fuso local para evitar o off-by-one.
 */
export function parseCultoDate(iso: string): Date {
  return new Date(`${iso.slice(0, 10)}T00:00:00`)
}

export function toInputDate(iso: string): string {
  return iso.slice(0, 10)
}

export function fmtData(iso: string): string {
  return parseCultoDate(iso).toLocaleDateString('pt-BR')
}

export function fmtDataLonga(iso: string): string {
  return parseCultoDate(iso).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export function diaDaSemanaAbrev(d: Date): string {
  return DIAS[d.getDay()]
}

export function mesAbrev(d: Date): string {
  return MESES[d.getMonth()]
}

export function chaveDoMes(iso: string): string {
  const d = parseCultoDate(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function rotuloDoMes(iso: string): string {
  const label = parseCultoDate(iso).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/** Meia-noite de hoje, no fuso local — base para comparar se um culto já passou. */
export function inicioDeHoje(): Date {
  const agora = new Date()
  return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
}

export function ehPassado(iso: string): boolean {
  return parseCultoDate(iso) < inicioDeHoje()
}
