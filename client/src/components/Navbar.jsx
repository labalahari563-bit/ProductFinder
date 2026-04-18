import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FiShoppingCart, FiLogOut, FiShield, FiBox } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { logout } from '../store/slices/authSlice'
import { selectCartItemCount } from '../store/slices/cartSlice'

function Navbar({ variant = 'default' }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, isAdmin } = useSelector((state) => state.auth)
  const itemCount = useSelector(selectCartItemCount)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          to={isAuthenticated ? '/recommendations' : '/'}
          className="flex items-center gap-2.5"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-200">
            <FiBox className="text-white" size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight text-gray-900">
            ProductFinder
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {!isAuthenticated && variant === 'landing' && (
            <Link
              to="/auth"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600
                         rounded-xl hover:bg-primary-50 transition-colors"
            >
              Sign In
            </Link>
          )}

          {isAuthenticated && isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                         text-primary-600 hover:bg-primary-50 transition-colors"
            >
              <FiShield size={16} />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          {isAuthenticated && (
            <>
              <Link
                to="/cart"
                className="relative flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100
                           transition-colors group"
              >
                <FiShoppingCart
                  size={20}
                  className="text-gray-600 group-hover:text-primary-600 transition-colors"
                />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white
                                   text-[11px] font-bold rounded-full h-5 min-w-[20px] flex
                                   items-center justify-center px-1 shadow-sm shadow-primary-300"
                  >
                    {itemCount}
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                           text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <FiLogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  )
}

export default Navbar
