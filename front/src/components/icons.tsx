import type { ReactNode, SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function Base({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  )
}

export const IconEscala = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="4.5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 3v3M16 3v3" />
    <path d="M7.5 13.5l2 2 3.5-4" />
  </Base>
)

export const IconPessoas = (p: IconProps) => (
  <Base {...p}>
    <circle cx="9" cy="8" r="3.25" />
    <path d="M3.5 19c.7-3 3-4.5 5.5-4.5s4.8 1.5 5.5 4.5" />
    <path d="M16 5.5a3 3 0 0 1 0 6M17.5 14.6c2 .6 3.4 2 4 4.4" />
  </Base>
)

export const IconCadastros = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 7h10M4 12h16M4 17h7" />
    <circle cx="18" cy="7" r="2" />
    <circle cx="15" cy="17" r="2" />
  </Base>
)

export const IconChevronDireita = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 6l6 6-6 6" />
  </Base>
)

export const IconChevronBaixo = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 9l6 6 6-6" />
  </Base>
)

export const IconVoltar = (p: IconProps) => (
  <Base {...p}>
    <path d="M15 6l-6 6 6 6" />
  </Base>
)

export const IconMais = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
)

export const IconLapis = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 20h4L18.5 9.5a2 2 0 0 0-3-3L5 17v3z" />
    <path d="M13.5 6.5l3 3" />
  </Base>
)
