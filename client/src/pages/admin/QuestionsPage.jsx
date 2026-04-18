import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  FiPlus, FiEdit2, FiTrash2, FiX, FiHelpCircle, FiChevronUp, FiChevronDown,
  FiFlag, FiArrowRight, FiAlertOctagon, FiCheckCircle, FiLayers,
} from 'react-icons/fi'
import api from '../../services/api'
import useScrollLock from '../../hooks/useScrollLock'

const emptyOption = { label: '', tag: '', actionType: 'done', actionTarget: '' }

const emptyQuestion = {
  _id: '', text: '', type: 'single_choice',
  options: [{ ...emptyOption }],
  nextAction: 'done', nextTarget: '', order: 1, isFirst: false,
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

function QuestionsPage() {
  const [questions, setQuestions] = useState([])
  const [systemTags, setSystemTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyQuestion)
  const [saving, setSaving] = useState(false)

  useScrollLock(modalOpen)

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/admin/questions')
      setQuestions(res.data.sort((a, b) => a.order - b.order))
    } catch {
      toast.error('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  const fetchTags = async () => {
    try {
      const res = await api.get('/admin/tags')
      setSystemTags(res.data)
    } catch { /* tags are optional */ }
  }

  useEffect(() => { fetchQuestions(); fetchTags() }, [])

  const questionOptions = useMemo(
    () => questions.filter((q) => q._id !== editing).map((q) => ({ id: q._id, text: q.text })),
    [questions, editing]
  )

  const firstQuestionId = useMemo(() => questions.find((q) => q.order === 1)?._id || null, [questions])
  const isMulti = form.type === 'multi_choice'

  const openCreate = () => {
    setEditing(null)
    setForm({
      ...emptyQuestion, _id: `q${Date.now()}`,
      order: questions.length === 0 ? 1 : Math.max(...questions.map((q) => q.order)) + 1,
      isFirst: questions.length === 0,
    })
    setModalOpen(true)
  }

  const openEdit = (q) => {
    setEditing(q._id)
    const isM = q.type === 'multi_choice'
    let nextAction = 'done', nextTarget = ''
    if (isM) {
      const firstNext = q.options[0]?.next || 'DONE'
      if (firstNext !== 'DONE') { nextAction = 'goto'; nextTarget = firstNext }
    }
    setForm({
      _id: q._id, text: q.text, type: q.type,
      options: q.options.map((opt) => {
        let actionType = 'done', actionTarget = ''
        if (opt.next === 'REJECT') actionType = 'reject'
        else if (opt.next !== 'DONE') { actionType = 'goto'; actionTarget = opt.next }
        return { label: opt.label, tag: opt.value, actionType, actionTarget }
      }),
      nextAction, nextTarget, order: q.order, isFirst: q.order === 1,
    })
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this question?')) return
    try { await api.delete(`/admin/questions/${id}`); toast.success('Question deleted'); fetchQuestions(); fetchTags() }
    catch { toast.error('Failed to delete question') }
  }

  const moveQuestion = async (q, dir) => {
    const sorted = [...questions].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex((x) => x._id === q._id)
    const swap = dir === 'up' ? idx - 1 : idx + 1
    if (swap < 0 || swap >= sorted.length) return
    try {
      await Promise.all([
        api.put(`/admin/questions/${q._id}`, { ...q, order: sorted[swap].order }),
        api.put(`/admin/questions/${sorted[swap]._id}`, { ...sorted[swap], order: q.order }),
      ])
      fetchQuestions()
    } catch { toast.error('Failed to reorder') }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      let mappedOptions
      if (isMulti) {
        const next = form.nextAction === 'goto' ? form.nextTarget : 'DONE'
        mappedOptions = form.options.map((opt) => ({ value: opt.tag, label: opt.label, next }))
      } else {
        mappedOptions = form.options.map((opt) => {
          let next = 'DONE'
          if (opt.actionType === 'reject') next = 'REJECT'
          else if (opt.actionType === 'goto') next = opt.actionTarget
          return { value: opt.tag, label: opt.label, next }
        })
      }
      const payload = {
        _id: form._id, text: form.text, type: form.type, options: mappedOptions,
        tags: [], order: form.isFirst ? 1 : form.order,
      }
      if (form.isFirst) {
        await Promise.all(
          questions.filter((q) => q._id !== editing).map((q) =>
            api.put(`/admin/questions/${q._id}`, { ...q, order: q.order + 1 })
          )
        )
      }
      if (editing) { await api.put(`/admin/questions/${editing}`, payload); toast.success('Question updated') }
      else { await api.post('/admin/questions', payload); toast.success('Question created') }
      setModalOpen(false)
      fetchQuestions()
      fetchTags()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save question') }
    finally { setSaving(false) }
  }

  const updateOption = (i, field, value) => {
    const updated = [...form.options]; updated[i] = { ...updated[i], [field]: value }
    setForm({ ...form, options: updated })
  }

  const addOption = () => {
    setForm({ ...form, options: [...form.options, { ...emptyOption }] })
  }

  const removeOption = (i) => {
    setForm({ ...form, options: form.options.filter((_, idx) => idx !== i) })
  }

  const getSuggestedTags = (label) => {
    if (!label) return []
    const words = label.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
    return systemTags.filter((tag) =>
      words.some((w) => tag.includes(w) || w.includes(tag))
    ).slice(0, 5)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <p className="text-sm text-slate-500">
          {questions.length} question{questions.length !== 1 ? 's' : ''} in your flow
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white
                     rounded-xl text-sm font-medium hover:bg-primary-700 shadow-lg shadow-primary-600/20
                     transition-colors"
        >
          <FiPlus size={16} /> Add Question
        </motion.button>
      </div>

      {/* List */}
      {questions.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
            <FiHelpCircle className="text-slate-300" size={28} />
          </div>
          <p className="text-slate-400 text-sm">No questions yet. Click "Add Question" to get started.</p>
        </motion.div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-2">
          {questions.map((q, idx) => (
            <QuestionCard
              key={q._id} question={q} index={idx} isFirst={q._id === firstQuestionId}
              isFirstItem={idx === 0} isLast={idx === questions.length - 1}
              onEdit={openEdit} onDelete={handleDelete} onMove={moveQuestion}
            />
          ))}
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex justify-center sm:items-center"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              className="relative bg-white sm:rounded-2xl shadow-2xl w-full sm:max-w-xl h-full sm:h-auto
                         sm:max-h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden overscroll-y-contain"
            >
              {/* Modal header */}
              <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-slate-200/80
                              px-5 sm:px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-base font-bold text-slate-900">
                  {editing ? 'Edit Question' : 'New Question'}
                </h2>
                <button onClick={() => setModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
                {/* Section: Question Details */}
                <FormSection title="Question Details">
                  <div>
                    <Label>Question text</Label>
                    <input value={form.text}
                      onChange={(e) => setForm({ ...form, text: e.target.value })}
                      placeholder="e.g. What category interests you?" required
                      className={inputClass} />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Label>Answer type</Label>
                      <select value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                        className={inputClass}>
                        <option value="single_choice">Pick one option</option>
                        <option value="multi_choice">Pick multiple options</option>
                      </select>
                    </div>
                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input type="checkbox" checked={form.isFirst}
                          onChange={(e) => setForm({ ...form, isFirst: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                        <span className="text-sm font-medium text-slate-700">First question</span>
                        <FiFlag size={14} className="text-primary-400" />
                      </label>
                    </div>
                  </div>
                  {isMulti && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                      <p className="font-semibold mb-0.5">Multi-choice</p>
                      <p className="text-xs text-amber-600">
                        All selected answers are collected for product matching. Set what happens <strong>after</strong> this question below.
                      </p>
                    </div>
                  )}
                </FormSection>

                {/* Section: Options */}
                <FormSection
                  title={isMulti ? 'Options (pick many)' : 'Answer Options'}
                  action={<button type="button" onClick={addOption}
                    className="text-xs text-primary-600 font-semibold hover:text-primary-700
                               inline-flex items-center gap-1 transition-colors">
                    <FiPlus size={12} /> Add
                  </button>}
                >
                  <AnimatePresence>
                    {form.options.map((opt, idx) => (
                      <OptionEditor
                        key={idx}
                        opt={opt}
                        idx={idx}
                        isMulti={isMulti}
                        canRemove={form.options.length > 1}
                        systemTags={systemTags}
                        suggestedTags={getSuggestedTags(opt.label)}
                        onUpdate={updateOption}
                        onRemove={removeOption}
                        questionOptions={questionOptions}
                      />
                    ))}
                  </AnimatePresence>
                </FormSection>

                {/* Multi-choice: question-level action */}
                {isMulti && (
                  <FormSection title="After answering">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select value={form.nextAction}
                        onChange={(e) => setForm({ ...form, nextAction: e.target.value })}
                        className={inputClass}>
                        <option value="done">Show recommendations</option>
                        <option value="goto">Go to question</option>
                      </select>
                      <AnimatePresence>
                        {form.nextAction === 'goto' && (
                          <motion.select
                            initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            value={form.nextTarget}
                            onChange={(e) => setForm({ ...form, nextTarget: e.target.value })}
                            required className={inputClass}>
                            <option value="">Pick question...</option>
                            {questionOptions.map((q) => (
                              <option key={q.id} value={q.id}>{q.text}</option>
                            ))}
                          </motion.select>
                        )}
                      </AnimatePresence>
                    </div>
                  </FormSection>
                )}

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  type="submit" disabled={saving}
                  className="w-full py-3.5 bg-primary-600 text-white rounded-xl font-semibold text-sm
                             hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-colors
                             disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editing ? 'Update Question' : 'Create Question'}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ── Option Editor with tag autocomplete ── */

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}


function OptionEditor({ opt, idx, isMulti, canRemove, systemTags, onUpdate, onRemove, questionOptions }) {
  const [tagSuggestions, setTagSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const tagRef = useRef(null)

  const autoTag = slugify(opt.label || '')
  const isAutoTagAccepted = opt.tag === autoTag && autoTag !== ''

  const buildSuggestions = (label, excludeAutoTag = false) => {
    const auto = slugify(label || '')
    let matches = []
    if (label.trim()) {
      const words = label.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
      matches = systemTags.filter((tag) =>
        words.some((w) => tag.includes(w) || w.includes(tag))
      ).slice(0, 5)
    }
    // Put auto-generated tag first if it exists and isn't already in system tags
    if (auto && !matches.includes(auto) && !excludeAutoTag) {
      matches = [auto, ...matches]
    }
    return matches
  }

  const handleLabelChange = (label) => {
    onUpdate(idx, 'label', label)
    const auto = slugify(label)
    // Auto-fill tag if it's empty or was previously auto-filled
    if (!opt.tag || opt.tag === slugify(opt.label)) {
      onUpdate(idx, 'tag', auto)
    }
    const suggestions = buildSuggestions(label)
    setTagSuggestions(suggestions)
    setShowSuggestions(suggestions.length > 0)
  }

  const handleTagInput = (value) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/^_|_$/g, '')
    onUpdate(idx, 'tag', cleaned)
    if (cleaned.trim()) {
      const matches = systemTags.filter((tag) => tag.includes(cleaned)).slice(0, 5)
      setTagSuggestions(matches)
      setShowSuggestions(true)
    } else {
      const suggestions = buildSuggestions(opt.label)
      setTagSuggestions(suggestions)
      setShowSuggestions(suggestions.length > 0)
    }
  }

  const pickTag = (tag) => {
    onUpdate(idx, 'tag', tag)
    setShowSuggestions(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200/80">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">Option {idx + 1}</span>
          {canRemove && (
            <button type="button" onClick={() => onRemove(idx)}
              className="text-xs text-slate-400 hover:text-rose-500 inline-flex items-center gap-1 transition-colors">
              <FiTrash2 size={12} /> Remove
            </button>
          )}
        </div>

        {/* Label */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Label</label>
          <input value={opt.label}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="e.g. Electronics & Gadgets" required
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm
                       focus:border-primary-400 outline-none bg-white" />
        </div>

        {/* Tag for matching */}
        <div className="relative">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Tag for product matching
            {isAutoTagAccepted && (
              <span className="ml-2 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Auto-generated
              </span>
            )}
            {opt.tag && !isAutoTagAccepted && autoTag && (
              <span className="ml-2 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                Custom
              </span>
            )}
          </label>
          <input ref={tagRef}
            value={opt.tag}
            onChange={(e) => handleTagInput(e.target.value)}
            onFocus={() => {
              const suggestions = buildSuggestions(opt.label)
              setTagSuggestions(suggestions)
              setShowSuggestions(suggestions.length > 0)
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="e.g. electronics"
            required
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm
                       focus:border-primary-400 outline-none bg-white font-mono" />

          {/* Suggestions dropdown */}
          {showSuggestions && tagSuggestions.length > 0 && (
            <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white rounded-lg border border-slate-200
                            shadow-lg overflow-hidden">
              <p className="text-[10px] font-semibold text-slate-400 px-3 py-1.5 bg-slate-50 border-b border-slate-100">
                Suggestions
              </p>
              {tagSuggestions.map((tag, i) => (
                <button key={tag} type="button" onMouseDown={() => pickTag(tag)}
                  className={`w-full text-left px-3 py-2 text-xs font-mono hover:bg-primary-50
                             hover:text-primary-600 transition-colors flex items-center justify-between
                             ${opt.tag === tag ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-slate-600'}`}>
                  <span>{tag}</span>
                  {i === 0 && tag === autoTag && (
                    <span className="text-[9px] text-emerald-500 font-sans font-semibold">AUTO</span>
                  )}
                  {systemTags.includes(tag) && tag !== autoTag && (
                    <span className="text-[9px] text-slate-400 font-sans">exists</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* When user picks this (single-choice only) */}
        {!isMulti && (
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">When user picks this</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <select value={opt.actionType}
                onChange={(e) => onUpdate(idx, 'actionType', e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:border-primary-400 outline-none">
                <option value="done">Show recommendations</option>
                <option value="reject">Reject user</option>
                <option value="goto">Go to question</option>
              </select>
              <AnimatePresence>
                {opt.actionType === 'goto' && (
                  <motion.select
                    initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    value={opt.actionTarget}
                    onChange={(e) => onUpdate(idx, 'actionTarget', e.target.value)}
                    required
                    className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:border-primary-400 outline-none">
                    <option value="">Pick question...</option>
                    {questionOptions.map((q) => (
                      <option key={q.id} value={q.id}>{q.text}</option>
                    ))}
                  </motion.select>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ── Sub-components ── */

function QuestionCard({ question: q, index, isFirst, isFirstItem, isLast, onEdit, onDelete, onMove }) {
  const isMulti = q.type === 'multi_choice'
  return (
    <motion.div variants={fadeUp}
      whileHover={{ y: -1 }}
      className={`bg-white rounded-xl border shadow-sm p-4 transition-colors
        ${isFirst ? 'border-primary-200 border-l-4 border-l-primary-500' : 'border-slate-200/80 hover:border-slate-300'}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5">
          <span className="text-xs font-bold text-primary-600 w-6 h-6 rounded-md bg-primary-50 flex items-center justify-center">
            {index + 1}
          </span>
          <button onClick={() => onMove(q, 'up')} disabled={isFirstItem}
            className="text-slate-300 hover:text-slate-500 disabled:opacity-20 p-0.5 transition-colors">
            <FiChevronUp size={12} />
          </button>
          <button onClick={() => onMove(q, 'down')} disabled={isLast}
            className="text-slate-300 hover:text-slate-500 disabled:opacity-20 p-0.5 transition-colors">
            <FiChevronDown size={12} />
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {isFirst && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md uppercase">
                <FiFlag size={10} /> First
              </span>
            )}
            {isMulti && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md uppercase">
                <FiLayers size={10} /> Multi
              </span>
            )}
            <span className="text-[11px] text-slate-400 font-mono">{q._id}</span>
          </div>
          <p className="font-semibold text-slate-900 text-sm">{q.text}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {q.options.map((opt) => {
              const Icon = opt.next === 'REJECT' ? FiAlertOctagon : opt.next === 'DONE' ? FiCheckCircle : FiArrowRight
              const color = opt.next === 'REJECT' ? 'text-rose-400' : opt.next === 'DONE' ? 'text-emerald-400' : 'text-primary-400'
              return (
                <span key={opt.value}
                  className="inline-flex items-center gap-1 text-[11px] bg-slate-50 text-slate-600
                             px-2 py-1 rounded-lg border border-slate-100 whitespace-nowrap">
                  <Icon size={11} className={color} />
                  {opt.label}
                  <span className="text-[9px] text-slate-300 font-mono ml-0.5">#{opt.value}</span>
                </span>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(q)}
            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
            <FiEdit2 size={15} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(q._id)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
            <FiTrash2 size={15} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

function FormSection({ title, subtitle, action, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Label({ children }) {
  return <label className="block text-xs font-semibold text-slate-600 mb-1.5">{children}</label>
}

const inputClass = 'w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all'

export default QuestionsPage
