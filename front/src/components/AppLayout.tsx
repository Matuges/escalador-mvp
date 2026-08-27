import { NavLink, Outlet } from 'react-router-dom'
import { cx } from '../lib/cx'
import { IconEscala, IconPessoas, IconCadastros } from './icons'
import type { ComponentType, SVGProps } from 'react'

type Item = { para: string; label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }

const ITENS: Item[] = [
  { para: '/escala', label: 'Escala', Icon: IconEscala },
  { para: '/pessoas', label: 'Pessoas', Icon: IconPessoas },
  { para: '/cadastros', label: 'Cadastros', Icon: IconCadastros },
]

function Marca() {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy font-display text-lg text-white">
        E
      </span>
      <span className="font-display text-lg text-navy">Escalador</span>
    </div>
  )
}

export function AppLayout() {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[15rem_1fr]">
      {/* Sidebar — desktop */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-mist bg-white px-4 py-6 lg:flex">
        <div className="px-2">
          <Marca />
        </div>
        <nav className="mt-8 flex flex-col gap-1">
          {ITENS.map(({ para, label, Icon }) => (
            <NavLink
              key={para}
              to={para}
              className={({ isActive }) =>
                cx(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel',
                  isActive
                    ? 'bg-mist/50 text-navy'
                    : 'text-caramel hover:bg-mist/30 hover:text-espresso',
                )
              }
            >
              <Icon width={18} height={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Topbar — mobile */}
      <header className="sticky top-0 z-30 flex h-14 items-center border-b border-mist bg-white/90 px-4 backdrop-blur lg:hidden">
        <Marca />
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6 lg:px-10 lg:pb-12">
        <Outlet />
      </main>

      {/* Bottom nav — mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-mist bg-white lg:hidden">
        {ITENS.map(({ para, label, Icon }) => (
          <NavLink
            key={para}
            to={para}
            className={({ isActive }) =>
              cx(
                'flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors',
                isActive ? 'text-navy' : 'text-caramel',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cx(
                    'flex h-6 w-10 items-center justify-center rounded-full transition-colors',
                    isActive && 'bg-sand/30',
                  )}
                >
                  <Icon width={18} height={18} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
