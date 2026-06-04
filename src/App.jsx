import { Routes, Route, Navigate } from 'react-router-dom'
import Home           from './pages/Home'
import Matchmaking    from './pages/Matchmaking'
import Ranking        from './pages/Ranking'
import Logros         from './pages/Logros'
import Perfil         from './pages/Perfil'
import Login          from './pages/Login'
import ProtectedRoute from './components/layout/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute><Home /></ProtectedRoute>
      }/>
      <Route path="/jugar" element={
        <ProtectedRoute><Matchmaking /></ProtectedRoute>
      }/>
      <Route path="/ranking" element={
        <ProtectedRoute><Ranking /></ProtectedRoute>
      }/>
      <Route path="/logros" element={
        <ProtectedRoute><Logros /></ProtectedRoute>
      }/>
      <Route path="/perfil" element={
        <ProtectedRoute><Perfil /></ProtectedRoute>
      }/>
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}