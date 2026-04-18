import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { FiShoppingCart, FiCheck, FiRefreshCw, FiStar, FiPackage } from 'react-icons/fi'
import Navbar from '../components/Navbar'
import { resetQuestionnaire, fetchFirstQuestion } from '../store/slices/questionnaireSlice'
import { addToCart } from '../store/slices/cartSlice'

export default function RecommendationsPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { recommendations, userTags } = useSelector((state) => state.questionnaire)
  const [addedIds, setAddedIds] = useState(new Set())

  const handleAddToCart = (product) => {
    dispatch(addToCart(product))
    setAddedIds((prev) => new Set(prev).add(product._id))
    toast.success(`${product.name} added to cart`)
  }

  const handleRetake = () => {
    dispatch(resetQuestionnaire())
    dispatch(fetchFirstQuestion())
    navigate('/assessment')
  }

  const products = recommendations || []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Your Recommended Products
          </h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Based on your answers, here are the best matches for you
          </p>
        </motion.div>

        {/* User's selected tags */}
        {userTags?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 mb-8"
          >
            <p className="text-xs font-semibold text-gray-400 mb-2">Your preferences matched</p>
            <div className="flex flex-wrap gap-2">
              {userTags.map((tag) => (
                <span key={tag}
                  className="text-xs font-semibold bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg border border-primary-100">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <FiPackage className="text-gray-200 mx-auto mb-4" size={48} />
            <p className="text-gray-400 mb-6">No products matched your profile</p>
            <button
              onClick={handleRetake}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white
                         rounded-xl font-semibold text-sm hover:bg-primary-700
                         shadow-lg shadow-primary-200 transition-all"
            >
              <FiRefreshCw size={16} />
              Start New Assessment
            </button>
          </motion.div>
        ) : (
          <>
            {/* Product Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {products.map((product, i) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  index={i}
                  isTop={i === 0}
                  isAdded={addedIds.has(product._id)}
                  onAdd={handleAddToCart}
                />
              ))}
            </div>

            {/* Bottom actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <button
                onClick={handleRetake}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold
                           text-gray-600 bg-white border border-gray-200 rounded-xl
                           hover:bg-gray-50 transition-all active:scale-[0.97]"
              >
                <FiRefreshCw size={14} />
                Start New Assessment
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 text-white
                           rounded-xl font-semibold text-sm hover:bg-primary-700
                           shadow-lg shadow-primary-200 transition-all active:scale-[0.97]"
              >
                <FiShoppingCart size={16} />
                View Cart
              </button>
            </motion.div>
          </>
        )}
      </main>
    </div>
  )
}

function ProductCard({ product, index, isTop, isAdded, onAdd }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden
                 hover:shadow-lg transition-shadow"
    >
      {/* Image / placeholder */}
      <div className="aspect-[4/3] bg-gradient-to-br from-primary-50 to-primary-100/50
                      flex items-center justify-center relative overflow-hidden p-3">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
        ) : (
          <FiPackage className="text-primary-200" size={40} />
        )}
        {isTop && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1
                           bg-amber-400 text-amber-900 text-[11px] font-bold rounded-lg shadow-sm">
            <FiStar size={11} />
            Best Match
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-sm truncate">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{product.description}</p>
        )}

        {/* Price + Add */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <span className="text-lg font-bold text-primary-600">
            ₹{product.price?.toLocaleString('en-IN')}
          </span>
          <button
            onClick={() => onAdd(product)}
            disabled={isAdded}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold
                        transition-all active:scale-95
              ${isAdded
                ? 'bg-green-50 text-green-600 border border-green-200'
                : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'
              }`}
          >
            {isAdded ? <FiCheck size={12} /> : <FiShoppingCart size={12} />}
            {isAdded ? 'Added' : 'Add'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
