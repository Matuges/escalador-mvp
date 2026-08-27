import { NavLink, Outlet } from 'react-router-dom'
import { cx } from '../lib/cx'
import { PageHeader } from '../components/PageHeader'

const ABAS = [
  { para: '/cadastros/cultos', label: 'Cultos' },
  { para: '/cadastros/ministerios', label: 'Ministérios e funções' },
]

export function CadastrosLayout() {
  return (
    <>
      <PageHeader titulo="Cadastros" subtitulo="A estrutura por trás das escalas" />
      <div className="mb-6 inline-flex rounded-lg border border-mist bg-white p-0.5">
        {ABAS.map((a) => (
          <NavLink
            key={a.para}
            to={a.para}
            className={({ isActive }) =>
              cx(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel',
                isActive ? 'bg-navy text-white' : 'text-caramel hover:text-espresso',
              )
            }
          >
            {a.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </>
  )
}
