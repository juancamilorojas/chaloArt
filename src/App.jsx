import { Routes, Route, Navigate } from 'react-router'
import Layout from './components/Layout'
import Home from './pages/Home'
import Obra from './pages/Obra'
import Escritos from './pages/Escritos'
import Biografia from './pages/Biografia'
import Contacto from './pages/Contacto'
import Admin from './pages/Admin'

function App() {
  return (
    <Routes>
      <Route path="/admin" element={import.meta.env.DEV ? <Admin /> : <Navigate to="/" replace />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="obra" element={<Obra />} />
        <Route path="obra/fotografia" element={<Obra />} />
        <Route path="obra/dibujos" element={<Obra />} />
        <Route path="escritos" element={<Escritos />} />
        <Route path="biografia" element={<Biografia />} />
        <Route path="contacto" element={<Contacto />} />
      </Route>
    </Routes>
  )
}

export default App
