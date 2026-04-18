import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, initialized } = useSelector((state) => state.auth)
  if (!initialized) return null
  return isAuthenticated ? children : <Navigate to="/" replace />
}

export function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, initialized } = useSelector(
    (state) => state.auth
  )
  if (!initialized) return null
  if (!isAuthenticated) return <Navigate to="/" replace />
  if (!isAdmin) return <Navigate to="/assessment" replace />
  return children
}

export function GuestRoute({ children }) {
  const { isAuthenticated, isAdmin, initialized } = useSelector(
    (state) => state.auth
  )
  if (!initialized) return null
  if (!isAuthenticated) return children
  return <Navigate to={isAdmin ? '/admin' : '/assessment'} replace />
}
