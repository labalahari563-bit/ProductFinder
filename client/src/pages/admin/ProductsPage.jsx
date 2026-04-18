import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiPackage, FiHash, FiCheck } from 'react-icons/fi'
import api from '../../services/api'
import useScrollLock from '../../hooks/useScrollLock'

const emptyProduct = { name: '', description: '', price: '', image: '', tags: [], stock: 0 }

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }
const fadeUp = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }

function ProductsPage() {
  const [products, setProducts] = useState([])
  const [systemTags, setSystemTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyProduct)
  const [saving, setSaving] = useState(false)
  const [tagSearch, setTagSearch] = useState('')

  useScrollLock(modalOpen)

  const fetchProducts = async () => {
    try {
      const res = await api.get('/admin/products')
      setProducts(res.data)
    } catch { toast.error('Failed to load products') }
    finally { setLoading(false) }
  }

  const fetchTags = async () => {
    try {
      const res = await api.get('/admin/tags')
      setSystemTags(res.data)
    } catch { /* optional */ }
  }

  useEffect(() => { fetchProducts(); fetchTags() }, [])

  const openCreate = () => {
    setEditing(null); setForm({ ...emptyProduct }); setTagSearch(''); setModalOpen(true)
  }

  const openEdit = (p) => {
    setEditing(p._id)
    setForm({
      name: p.name, description: p.description || '', price: p.price,
      image: p.image || '', stock: p.stock, tags: p.tags || [],
    })
    setTagSearch('')
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try { await api.delete(`/admin/products/${id}`); setProducts((prev) => prev.filter((p) => p._id !== id)); toast.success('Product deleted') }
    catch { toast.error('Failed to delete product') }
  }

  const toggleTag = (tag) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }))
  }

  const availableTags = tagSearch.trim()
    ? systemTags.filter((t) => t.includes(tagSearch.toLowerCase()))
    : systemTags

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) }
      if (!editing) { payload._id = `prod_${Date.now()}` }
      if (editing) { await api.put(`/admin/products/${editing}`, payload); toast.success('Product updated') }
      else { await api.post('/admin/products', payload); toast.success('Product created') }
      setModalOpen(false); fetchProducts()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save product') }
    finally { setSaving(false) }
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
          {products.length} product{products.length !== 1 ? 's' : ''} in catalog
        </p>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white
                     rounded-xl text-sm font-medium hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-colors">
          <FiPlus size={16} /> Add Product
        </motion.button>
      </div>

      {/* Grid */}
      {products.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
            <FiPackage className="text-slate-300" size={28} />
          </div>
          <p className="text-slate-400 text-sm">No products yet. Add your first product.</p>
        </motion.div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="visible"
          className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map((p) => (
            <motion.div key={p._id} variants={fadeUp} whileHover={{ y: -2 }}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden
                         hover:shadow-md transition-shadow">
              {/* Image placeholder */}
              <div className="aspect-[4/3] bg-gradient-to-br from-primary-50 to-primary-100/40
                              flex items-center justify-center relative overflow-hidden p-3">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                ) : (
                  <FiPackage className="text-primary-200" size={32} />
                )}
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => openEdit(p)}
                    className="p-1.5 bg-white/80 backdrop-blur-sm rounded-lg text-slate-500
                               hover:text-primary-600 transition-colors shadow-sm">
                    <FiEdit2 size={14} />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(p._id)}
                    className="p-1.5 bg-white/80 backdrop-blur-sm rounded-lg text-slate-500
                               hover:text-rose-600 transition-colors shadow-sm">
                    <FiTrash2 size={14} />
                  </motion.button>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-slate-900 text-sm truncate">{p.name}</h3>
                {p.description && (
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{p.description}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-primary-600">
                    ₹{p.price?.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <FiHash size={11} /> {p.stock} in stock
                  </span>
                </div>
                {p.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-slate-100">
                    {p.tags.map((tag) => (
                      <span key={tag}
                        className="text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md border border-slate-100">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex justify-center sm:items-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              className="relative bg-white sm:rounded-2xl shadow-2xl w-full sm:max-w-lg h-full sm:h-auto
                         sm:max-h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden overscroll-y-contain"
            >
              <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-slate-200/80
                              px-5 sm:px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-base font-bold text-slate-900">
                  {editing ? 'Edit Product' : 'New Product'}
                </h2>
                <button onClick={() => setModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
                <FormSection title="Product Details">
                  <div>
                    <Label>Name</Label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Wireless Bluetooth Earbuds" required className={inputClass} />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <textarea value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Premium TWS earbuds with noise cancellation" rows={3}
                      className={inputClass + ' resize-none'} />
                  </div>
                  {/* Image preview */}
                  {form.image && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-50 p-3">
                      <img src={form.image} alt="Preview" className="w-full h-full object-contain"
                        onError={(e) => { e.target.style.display = 'none' }} />
                    </div>
                  )}
                  <div>
                    <Label>Image URL</Label>
                    <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
                      placeholder="https://images.unsplash.com/..." className={inputClass} />
                  </div>
                </FormSection>

                <FormSection title="Pricing & Stock">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Price (₹)</Label>
                      <input type="number" value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        placeholder="499" required min={0} className={inputClass} />
                    </div>
                    <div>
                      <Label>Stock</Label>
                      <input type="number" value={form.stock}
                        onChange={(e) => setForm({ ...form, stock: e.target.value })}
                        placeholder="50" min={0} className={inputClass} />
                    </div>
                  </div>
                </FormSection>

                <FormSection title="Tags" subtitle="Pick from tags created in questions">
                  {/* Selected tags as chips */}
                  {form.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {form.tags.map((tag) => (
                        <span key={tag}
                          className="inline-flex items-center gap-1 bg-primary-50 text-primary-700
                                     text-xs font-medium px-2.5 py-1 rounded-lg border border-primary-100">
                          {tag}
                          <button type="button" onClick={() => toggleTag(tag)}
                            className="text-primary-400 hover:text-primary-700 transition-colors">
                            <FiX size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Search */}
                  <input value={tagSearch} onChange={(e) => setTagSearch(e.target.value)}
                    placeholder="Search tags..."
                    className={inputClass} />

                  {/* Available tags list */}
                  {systemTags.length > 0 ? (
                    <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
                      {availableTags.length > 0 ? availableTags.map((tag) => {
                        const isSelected = form.tags.includes(tag)
                        return (
                          <button key={tag} type="button" onClick={() => toggleTag(tag)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 text-sm
                                       transition-colors text-left
                                       ${isSelected
                                          ? 'bg-primary-50 text-primary-700 font-semibold'
                                          : 'text-slate-600 hover:bg-slate-50'}`}>
                            <span className="font-mono text-xs">{tag}</span>
                            {isSelected && <FiCheck size={14} className="text-primary-600" />}
                          </button>
                        )
                      }) : (
                        <p className="text-xs text-slate-400 px-3 py-4 text-center">
                          No matching tags. Create tags from question options first.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-3">
                      No tags in the system yet. Create questions with options first to generate tags.
                    </p>
                  )}
                </FormSection>

                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  type="submit" disabled={saving}
                  className="w-full py-3.5 bg-primary-600 text-white rounded-xl font-semibold text-sm
                             hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-colors disabled:opacity-60">
                  {saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function FormSection({ title, subtitle, children }) {
  return (
    <div>
      <div className="mb-3">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Label({ children }) {
  return <label className="block text-xs font-semibold text-slate-600 mb-1.5">{children}</label>
}

const inputClass = 'w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all'

export default ProductsPage
