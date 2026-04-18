import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiPlus } from 'react-icons/fi'

export default function TagInput({ tags, onChange, placeholder = 'Type and press Enter to add' }) {
  const [input, setInput] = useState('')
  const ref = useRef(null)

  const addTag = (value) => {
    const tag = value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/^_|_$/g, '')
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag])
    }
    setInput('')
  }

  const removeTag = (tag) => {
    onChange(tags.filter((t) => t !== tag))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white overflow-hidden
                    focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100
                    transition-all">
      <div
        onClick={() => ref.current?.focus()}
        className="min-h-[48px] px-3 py-2 flex flex-wrap gap-1.5 items-center cursor-text"
      >
        <AnimatePresence>
          {tags.map((tag) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="inline-flex items-center gap-1 bg-primary-50 text-primary-700
                         text-xs font-medium px-2.5 py-1 rounded-lg border border-primary-100"
            >
              {tag}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeTag(tag) }}
                className="text-primary-400 hover:text-primary-700 transition-colors"
              >
                <FiX size={12} />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        <input
          ref={ref}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[100px] border-0 outline-none text-sm bg-transparent py-1
                     placeholder:text-slate-300 focus:ring-0"
        />
      </div>
      <button
        type="button"
        onClick={() => { addTag(input); ref.current?.focus() }}
        className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold
                   text-primary-600 bg-primary-50/60 border-t border-slate-100
                   hover:bg-primary-100 active:bg-primary-200 transition-colors"
      >
        <FiPlus size={13} /> Add Tag
      </button>
    </div>
  )
}
