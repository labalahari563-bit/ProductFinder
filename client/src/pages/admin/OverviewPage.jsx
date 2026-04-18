import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiHelpCircle, FiPackage, FiPlus, FiArrowRight,
  FiArrowUpRight, FiFlag, FiAlertOctagon, FiCheckCircle,
} from 'react-icons/fi'
import api from '../../services/api'

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export default function OverviewPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ questions: 0, products: 0 })
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const [qRes, pRes] = await Promise.all([
          api.get('/admin/questions'),
          api.get('/admin/products'),
        ])
        setStats({ questions: qRes.data.length, products: pRes.data.length })
        setQuestions(qRes.data.sort((a, b) => a.order - b.order))
      } catch { /* handled by interceptor */ } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  const statCards = [
    { label: 'Total Questions', value: stats.questions, icon: FiHelpCircle, bg: 'bg-primary-50', text: 'text-primary-600' },
    { label: 'Total Products', value: stats.products, icon: FiPackage, bg: 'bg-emerald-50', text: 'text-emerald-600' },
  ]

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {statCards.map((card) => (
          <motion.div
            key={card.label}
            variants={fadeUp}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500">{card.label}</span>
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon className={card.text} size={18} />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp}>
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <ActionCard
            icon={FiHelpCircle}
            color="primary"
            title="Manage Questions"
            desc="Create questions and define branching logic"
            onClick={() => navigate('/admin/questions')}
          />
          <ActionCard
            icon={FiPackage}
            color="emerald"
            title="Manage Products"
            desc="Add products and set recommendation tags"
            onClick={() => navigate('/admin/products')}
          />
        </div>
      </motion.div>

      {/* Flow Preview */}
      {questions.length > 0 && (
        <motion.div variants={fadeUp}>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Question Flow</h2>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
            <div className="space-y-2">
              {questions.map((q, idx) => (
                <FlowItem key={q._id} question={q} index={idx} isFirst={idx === 0} />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Getting Started (show when no data) */}
      {stats.questions === 0 && stats.products === 0 && (
        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">Getting Started</h2>
          <div className="space-y-4">
            <GuideStep step="1" title="Create Questions" desc="Build your questionnaire with branching logic — each option can go to another question, reject, or end the quiz." />
            <GuideStep step="2" title="Add Products" desc="Add products with tags matching answer values (e.g. muscle_gain, beginner) so the recommendation engine can match them." />
            <GuideStep step="3" title="Go Live" desc="Users answer questions and receive ranked product recommendations based on tag matching." />
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

function ActionCard({ icon: Icon, color, title, desc, onClick }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  }
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200/80
                 shadow-sm text-left hover:shadow-md transition-shadow"
    >
      <div className={`w-12 h-12 rounded-xl ${colors[color]} flex items-center justify-center shrink-0`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 text-sm">{title}</p>
        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
      </div>
      <FiArrowRight className="text-slate-300 shrink-0" size={16} />
    </motion.button>
  )
}

function FlowItem({ question, index, isFirst }) {
  const isMulti = question.type === 'multi_choice'
  const hasReject = question.options.some((o) => o.next === 'REJECT')
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="w-7 h-7 rounded-lg bg-primary-50 text-primary-600 text-xs font-bold
                       flex items-center justify-center shrink-0">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {isFirst && <FiFlag size={12} className="text-primary-500" />}
          <span className="text-sm font-semibold text-slate-800 truncate">{question.text}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {isMulti && (
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md uppercase">Multi</span>
        )}
        {hasReject && (
          <FiAlertOctagon size={13} className="text-rose-400" />
        )}
        <FiCheckCircle size={13} className="text-emerald-400" />
        <span className="text-[11px] text-slate-400 font-mono">{question._id}</span>
      </div>
    </div>
  )
}

function GuideStep({ step, title, desc }) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center
                      text-xs font-bold shrink-0">
        {step}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}
