import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProPage from './pages/ProPage'
import Abonnement from './pages/Abonnement'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pro/:id" element={<ProPage />} />
        <Route path="/abonnement" element={<Abonnement />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App