const Question = require('../models/Question')
const Product = require('../models/Product')

// ── Tags ──

exports.getTags = async (req, res) => {
  try {
    const questions = await Question.find({}, 'options.value')
    const questionTags = questions.flatMap((q) => q.options.map((o) => o.value))

    const products = await Product.find({}, 'tags')
    const productTags = products.flatMap((p) => p.tags)

    const allTags = [...new Set([...questionTags, ...productTags])].filter(Boolean).sort()
    res.json(allTags)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ── Questions CRUD ──

exports.listQuestions = async (req, res) => {
  try {
    const questions = await Question.find().sort({ order: 1 })
    res.json(questions)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.createQuestion = async (req, res) => {
  try {
    const question = await Question.create(req.body)
    res.status(201).json(question)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

exports.updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!question) return res.status(404).json({ error: 'Question not found' })
    res.json(question)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id)
    if (!question) return res.status(404).json({ error: 'Question not found' })
    res.json({ message: 'Question deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ── Products CRUD ──

exports.listProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ _id: 1 })
    res.json(products)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body)
    res.status(201).json(product)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json(product)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json({ message: 'Product deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
