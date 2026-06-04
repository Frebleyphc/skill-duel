import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--cream)',
      fontFamily: 'var(--body)', color: 'var(--muted)', fontSize: '13px'
    }}>
      Cargando...
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  return children
}