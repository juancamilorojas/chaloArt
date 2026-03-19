import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Obra from './pages/Obra'
import Escritos from './pages/Escritos'
import Biografia from './pages/Biografia'
import Contacto from './pages/Contacto'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="obra" element={<Obra />} />
        <Route path="escritos" element={<Escritos />} />
        <Route path="biografia" element={<Biografia />} />
        <Route path="contacto" element={<Contacto />} />
      </Route>
    </Routes>
  )
}

export default App
