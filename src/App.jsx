import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProPage from './pages/ProPage'
import Abonnement from './pages/Abonnement'
import Success from './pages/Success'
import Recherche from './pages/Recherche'
import EspaceCliente from './pages/EspaceCliente'
import Avis from './pages/Avis'
import GestionServices from './pages/GestionServices'
import Profil from './pages/Profil'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recherche" element={<Recherche />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pro/:id" element={<ProPage />} />
        <Route path="/abonnement" element={<Abonnement />} />
        <Route path="/success" element={<Success />} />
        <Route path="/espace-cliente" element={<EspaceCliente />} />
        <Route path="/avis/:proId" element={<Avis />} />
        <Route path="/gestion-services" element={<GestionServices />} />
        <Route path="/profil" element={<Profil />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App