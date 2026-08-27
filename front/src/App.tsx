import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { EscalaPage } from './pages/EscalaPage'
import { PessoasPage } from './pages/PessoasPage'
import { PessoaDetailPage } from './pages/PessoaDetailPage'
import { CadastrosLayout } from './pages/CadastrosLayout'
import { CultosPage } from './pages/CultosPage'
import { MinisteriosPage } from './pages/MinisteriosPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/escala" replace />} />
        <Route path="escala" element={<EscalaPage />} />
        <Route path="escala/:cultoId" element={<EscalaPage />} />
        <Route path="pessoas" element={<PessoasPage />} />
        <Route path="pessoas/:pessoaId" element={<PessoaDetailPage />} />
        <Route path="cadastros" element={<CadastrosLayout />}>
          <Route index element={<Navigate to="/cadastros/cultos" replace />} />
          <Route path="cultos" element={<CultosPage />} />
          <Route path="ministerios" element={<MinisteriosPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/escala" replace />} />
      </Route>
    </Routes>
  )
}
