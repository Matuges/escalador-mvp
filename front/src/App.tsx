import { useState } from 'react'
import DisponibilidadePage from './DisponibilidadePage'
import PessoasPage from './PessoasPage'
import CultosPage from './CultosPage'
import MinisteriosPage from './MinisteriosPage'

type Tab = 'disponibilidade' | 'pessoas' | 'cultos' | 'ministerios'

const tabs: { id: Tab; label: string }[] = [
  { id: 'disponibilidade', label: 'Disponibilidade' },
  { id: 'pessoas', label: 'Pessoas' },
  { id: 'cultos', label: 'Cultos' },
  { id: 'ministerios', label: 'Ministérios' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('disponibilidade')

  return (
    <div className="min-h-screen bg-ivory">
      <header className="bg-navy">
        <div className="max-w-2xl mx-auto px-6 flex items-center gap-1 h-14">
          <span className="font-bold text-white mr-4 tracking-wide">Escalador</span>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                tab === t.id
                  ? 'bg-steel text-white'
                  : 'text-mist hover:bg-white/10 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-6">
        {tab === 'disponibilidade' && <DisponibilidadePage />}
        {tab === 'pessoas' && <PessoasPage />}
        {tab === 'cultos' && <CultosPage />}
        {tab === 'ministerios' && <MinisteriosPage />}
      </main>
    </div>
  )
}
