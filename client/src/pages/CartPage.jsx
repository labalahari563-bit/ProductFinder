import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowRight, FiPackage,
} from 'react-icons/fi'
import {
  removeFromCart, updateQuantity, clearCart, selectCartTotal, selectCartItemCount,
} from '../store/slices/cartSlice'
import Navbar from '../components/Navbar'

function CartPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const items = useSelector((state) => state.cart.items)
  const total = useSelector(selectCartTotal)
  const itemCount = useSelector(selectCartItemCount)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <FiShoppingBag className="text-gray-200 mx-auto mb-4" size={56} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Cart is empty</h2>
            <p className="text-gray-400 mb-6">
              Complete the questionnaire to find products for you
            </p>
            <button
              onClick={() => navigate('/assessment')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white
                         rounded-xl font-semibold text-sm hover:bg-primary-700
                         shadow-lg shadow-primary-200 transition-all"
            >
              Find Products
              <FiArrowRight size={16} />
            </button>
          </motion.div>
        ) : (
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Items list */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between mb-6"
              >
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <button
                  onClick={() => { dispatch(clearCart()); toast.info('Cart cleared') }}
                  className="text-sm text-red-500 hover:text-red-700 hover:bg-red-50
                             px-3 py-1.5 rounded-lg transition-colors font-medium"
                >
                  Clear All
                </button>
              </motion.div>

              <div className="space-y-3">
                <AnimatePresence>
                  {items.map(({ product, quantity }) => (
                    <motion.div
                      key={product._id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                          <FiPackage className="text-primary-300" size={22} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm truncate">
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            ₹{product.price?.toLocaleString('en-IN')} each
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            dispatch(removeFromCart(product._id))
                            toast.info(`${product.name} removed`)
                          }}
                          className="shrink-0 p-2 text-gray-300 hover:text-red-500
                                     hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                        <div className="inline-flex items-center rounded-xl border border-gray-200 overflow-hidden">
                          <button
                            onClick={() =>
                              dispatch(updateQuantity({ productId: product._id, quantity: quantity - 1 }))
                            }
                            className="w-10 h-10 flex items-center justify-center text-gray-500
                                       hover:bg-gray-50 hover:text-gray-700 transition-colors"
                          >
                            <FiMinus size={14} />
                          </button>
                          <span className="w-12 text-center font-bold text-gray-900 text-sm">
                            {quantity}
                          </span>
                          <button
                            onClick={() =>
                              dispatch(updateQuantity({ productId: product._id, quantity: quantity + 1 }))
                            }
                            className="w-10 h-10 flex items-center justify-center text-gray-500
                                       hover:bg-gray-50 hover:text-gray-700 transition-colors"
                          >
                            <FiPlus size={14} />
                          </button>
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                          ₹{(product.price * quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Summary — sticky on desktop */}
            <div className="lg:col-span-1 mt-6 lg:mt-0">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6
                           lg:sticky lg:top-24"
              >
                <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal ({itemCount} items)</span>
                    <span className="text-gray-700 font-medium">
                      ₹{total.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 mt-4 pt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary-600">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-4
                             bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-semibold
                             text-sm shadow-lg shadow-primary-200 transition-all active:scale-[0.97]"
                >
                  Checkout
                  <FiArrowRight size={16} />
                </button>
              </motion.div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default CartPage
