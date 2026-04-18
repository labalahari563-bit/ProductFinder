import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCheck, FiArrowLeft, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi'
import { fetchFirstQuestion, submitAnswer, resetQuestionnaire } from '../store/slices/questionnaireSlice'

export default function QuestionnairePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const {
    currentQuestion,
    totalQuestions,
    answers,
    status,
    completed,
    rejected,
    rejectionMessage,
  } = useSelector((state) => state.questionnaire)

  const [selected, setSelected] = useState(null)
  const [multiSelected, setMultiSelected] = useState([])
  const [direction, setDirection] = useState(1)

  const step = answers.length + 1
  const isMulti = currentQuestion?.type === 'multi_choice'
  const progress = totalQuestions > 0 ? (step / totalQuestions) * 100 : 0

  useEffect(() => {
    dispatch(fetchFirstQuestion())
  }, [dispatch])

  useEffect(() => {
    if (completed && !rejected) {
      const timer = setTimeout(() => navigate('/recommendations'), 300)
      return () => clearTimeout(timer)
    }
  }, [completed, rejected, navigate])

  const handleSingleSelect = (questionId, value) => {
    if (status === 'loading') return
    setSelected(value)
    setDirection(1)
    setTimeout(() => {
      dispatch(submitAnswer({ questionId, answer: value }))
      setSelected(null)
    }, 400)
  }

  const toggleMulti = (value) => {
    setMultiSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const handleMultiSubmit = (questionId) => {
    if (multiSelected.length === 0 || status === 'loading') return
    setDirection(1)
    dispatch(submitAnswer({ questionId, answer: multiSelected }))
    setMultiSelected([])
  }

  const handleRestart = () => {
    setSelected(null)
    setMultiSelected([])
    dispatch(resetQuestionnaire())
    dispatch(fetchFirstQuestion())
  }

  if (status === 'loading' && !currentQuestion && answers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500 font-medium">Loading your assessment...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="shrink-0 bg-white border-b border-gray-100 px-4 sm:px-6"
      >
        <div className="max-w-2xl mx-auto py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => {
                if (answers.length > 0) {
                  handleRestart()
                } else {
                  navigate('/recommendations')
                }
              }}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900
                         transition-colors"
            >
              <FiArrowLeft size={16} />
              {answers.length > 0 ? 'Start Over' : 'Back'}
            </button>
            <span className="text-sm font-semibold text-gray-400">
              Step {step} of {totalQuestions}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </motion.div>

      {/* Question area */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {rejected && (
              <motion.div
                key="rejection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-6">
                  <FiAlertTriangle className="text-red-400" size={28} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Not Eligible
                </h2>
                <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
                  {rejectionMessage || 'Based on your responses, you are not eligible for our products at this time.'}
                </p>
                <button
                  onClick={handleRestart}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white
                             rounded-xl font-semibold text-sm hover:bg-primary-700
                             shadow-lg shadow-primary-200 transition-all active:scale-[0.97]"
                >
                  <FiRefreshCw size={16} />
                  Start Over
                </button>
              </motion.div>
            )}

            {currentQuestion && !completed && !rejected && (
              <motion.div
                key={currentQuestion._id}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug">
                    {currentQuestion.text}
                  </h2>
                  {isMulti && (
                    <p className="text-sm text-gray-400 mt-2">Select all that apply</p>
                  )}
                </div>

                {/* Option cards */}
                <div className={`grid gap-3 sm:gap-4 ${
                  currentQuestion.options.length <= 3
                    ? 'grid-cols-1 sm:grid-cols-' + currentQuestion.options.length
                    : 'grid-cols-1 sm:grid-cols-2'
                }`}>
                  {currentQuestion.options.map((opt, i) => {
                    const isActive = isMulti
                      ? multiSelected.includes(opt.value)
                      : selected === opt.value

                    return (
                      <motion.button
                        key={opt.value}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.3 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          isMulti
                            ? toggleMulti(opt.value)
                            : handleSingleSelect(currentQuestion._id, opt.value)
                        }
                        disabled={status === 'loading'}
                        className={`relative text-left p-5 sm:p-6 rounded-2xl border-2 transition-colors
                          ${isActive
                            ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-100'
                            : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-md'
                          }
                          disabled:opacity-50`}
                      >
                        {/* Check indicator */}
                        <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2
                          flex items-center justify-center transition-all
                          ${isActive
                            ? 'bg-primary-600 border-primary-600'
                            : 'border-gray-300'
                          }`}
                        >
                          {isActive && <FiCheck className="text-white" size={14} />}
                        </div>

                        <span className={`font-semibold text-base leading-snug
                          ${isActive ? 'text-primary-700' : 'text-gray-900'}`}
                        >
                          {opt.label}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>

                {/* Multi-choice submit */}
                {isMulti && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 text-center"
                  >
                    <button
                      onClick={() => handleMultiSubmit(currentQuestion._id)}
                      disabled={multiSelected.length === 0 || status === 'loading'}
                      className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-600 text-white
                                 rounded-xl font-semibold text-sm hover:bg-primary-700
                                 shadow-lg shadow-primary-200 transition-all active:scale-[0.97]
                                 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <FiCheck size={16} />
                      {multiSelected.length > 0
                        ? `Continue (${multiSelected.length} selected)`
                        : 'Select options to continue'}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading between questions */}
          {status === 'loading' && currentQuestion && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-8"
            >
              <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full
                              animate-spin mx-auto mb-2" />
              <p className="text-xs text-gray-400">Loading next question...</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
