import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiBox } from 'react-icons/fi'
import { login, register, clearError } from '../store/slices/authSlice'

function AuthPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { status, error } = useSelector((state) => state.auth)
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const action = isLogin ? login : register
    const result = await dispatch(action(form))
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success(isLogin ? 'Welcome back!' : 'Account created!')
      const role = result.payload.user.role
      navigate(role === 'super_admin' ? '/admin' : '/assessment')
    }
  }

  const toggleMode = () => {
    setIsLogin((prev) => !prev)
    dispatch(clearError())
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/30 to-white flex flex-col">
      {/* Logo */}
      <div className="px-4 sm:px-6 pt-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto flex items-center gap-2.5"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700
                          flex items-center justify-center shadow-lg shadow-primary-200">
            <FiBox className="text-white" size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight text-gray-900">ProductFinder</span>
        </motion.div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              {isLogin
                ? 'Sign in to continue your assessment'
                : 'Register to get personalized product recommendations'}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-5"
          >
            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200
                             focus:border-primary-400 focus:ring-2 focus:ring-primary-100
                             outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200
                             focus:border-primary-400 focus:ring-2 focus:ring-primary-100
                             outline-none transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400
                             hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-600 text-white
                         rounded-xl font-semibold text-sm hover:bg-primary-700
                         shadow-lg shadow-primary-200 transition-all active:scale-[0.98]
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <FiArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={toggleMode}
              className="text-primary-600 font-semibold hover:text-primary-700"
            >
              {isLogin ? 'Register' : 'Sign In'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default AuthPage
