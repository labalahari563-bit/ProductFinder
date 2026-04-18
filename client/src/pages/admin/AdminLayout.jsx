import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiGrid, FiHelpCircle, FiPackage, FiLogOut, FiMenu, FiX, FiBox,
} from 'react-icons/fi'
import { logout } from '../../store/slices/authSlice'

const navItems = [
  { to: '/admin', icon: FiGrid, label: 'Dashboard', end: true },
  { to: '/admin/questions', icon: FiHelpCircle, label: 'Questions' },
  { to: '/admin/products', icon: FiPackage, label: 'Products' },
]

const pageTitles = {
  '/admin': 'Dashboard',
  '/admin/questions': 'Questions',
  '/admin/products': 'Products',
}

function AdminLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const pageTitle = pageTitles[location.pathname] || 'Dashboard'
  const userInitial = user?.email?.[0]?.toUpperCase() || 'A'

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-white
                    transform transition-transform duration-300 ease-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0 lg:static lg:z-auto flex flex-col shrink-0`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700
                            flex items-center justify-center">
              <FiBox size={15} />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight">ProductFinder</span>
              <span className="block text-[10px] text-slate-500 font-medium uppercase tracking-widest">Admin</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white p-1">
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
          <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">Menu</p>
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                 ${isActive
                   ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                   : 'text-slate-400 hover:text-white hover:bg-white/5'
                 }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700
                            flex items-center justify-center text-sm font-bold shrink-0 shadow-lg shadow-primary-600/20">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.email}</p>
              <p className="text-[11px] text-slate-500">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
              title="Logout"
            >
              <FiLogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Top navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between
                           px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-600 hover:text-slate-900 p-1"
            >
              <FiMenu size={22} />
            </button>
            <motion.h1
              key={pageTitle}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-lg font-bold text-slate-900"
            >
              {pageTitle}
            </motion.h1>
          </div>
        </header>

        {/* Content */}
        <div className="admin-scroll-area flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-6 lg:p-8"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
