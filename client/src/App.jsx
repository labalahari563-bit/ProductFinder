import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProfile } from './store/slices/authSlice'
import { fetchCart } from './store/slices/cartSlice'
import { GuestRoute, AdminRoute, ProtectedRoute } from './components/RouteGuard'

import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import QuestionnairePage from './pages/QuestionnairePage'
import RecommendationsPage from './pages/RecommendationsPage'
import CartPage from './pages/CartPage'
import AdminLayout from './pages/admin/AdminLayout'
import OverviewPage from './pages/admin/OverviewPage'
import QuestionsPage from './pages/admin/QuestionsPage'
import ProductsPage from './pages/admin/ProductsPage'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, initialized } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated && !initialized) {
      dispatch(fetchProfile())
    }
    if (isAuthenticated && initialized) {
      dispatch(fetchCart())
    }
  }, [isAuthenticated, initialized, dispatch])

  if (isAuthenticated && !initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<GuestRoute><AuthPage /></GuestRoute>} />

      {/* User flow */}
      <Route path="/assessment" element={<ProtectedRoute><QuestionnairePage /></ProtectedRoute>} />
      <Route path="/recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<OverviewPage />} />
        <Route path="questions" element={<QuestionsPage />} />
        <Route path="products" element={<ProductsPage />} />
      </Route>
    </Routes>
  )
}

export default App
