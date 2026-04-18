import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { FiArrowRight, FiHelpCircle, FiPackage, FiShoppingCart, FiBox } from 'react-icons/fi'
import Navbar from '../components/Navbar'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: 'easeOut' },
  }),
}

const steps = [
  {
    icon: FiHelpCircle,
    title: 'Answer Questions',
    desc: 'A quick guided assessment tailored to your needs',
  },
  {
    icon: FiPackage,
    title: 'Get Recommendations',
    desc: 'Personalized products picked just for you',
  },
  {
    icon: FiShoppingCart,
    title: 'Add to Cart',
    desc: 'Choose what fits and checkout when ready',
  },
]

function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector((state) => state.auth)

  const handleStart = () => {
    navigate(isAuthenticated ? '/assessment' : '/auth')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-primary-50/30 to-white">
      <Navbar variant="landing" />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-20 text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700
                     text-sm font-semibold rounded-full mb-6"
        >
          <FiBox size={14} />
          Smart Product Finder
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight"
        >
          Find the Right Products
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">
            for Your Needs
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed"
        >
          Answer a few quick questions and get personalized recommendations
          curated just for you.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="mt-10"
        >
          <button
            onClick={handleStart}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-primary-600 text-white
                       text-lg font-semibold rounded-2xl shadow-xl shadow-primary-200
                       hover:bg-primary-700 hover:shadow-2xl hover:shadow-primary-300
                       transition-all active:scale-[0.97]"
          >
            Start Assessment
            <FiArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-24">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm font-bold uppercase tracking-widest text-gray-400 mb-12"
        >
          How It Works
        </motion.h2>

        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="relative bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm
                         hover:shadow-md hover:-translate-y-1 transition-all text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 mb-4">
                <step.icon className="text-primary-600" size={22} />
              </div>
              <span className="absolute top-4 right-4 text-xs font-bold text-gray-200">
                0{i + 1}
              </span>
              <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400">
        ProductFinder &mdash; Smart Product Recommendation System
      </footer>
    </div>
  )
}

export default LandingPage
