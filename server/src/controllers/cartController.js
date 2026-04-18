const Cart = require('../models/Cart')

exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] })
    }
    res.json(cart.items)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.addItem = async (req, res) => {
  try {
    const { productId, name, price } = req.body
    let cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] })
    }

    const existing = cart.items.find((i) => i.productId === productId)
    if (existing) {
      existing.quantity += 1
    } else {
      cart.items.push({ productId, name, price, quantity: 1 })
    }

    await cart.save()
    res.json(cart.items)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.updateItem = async (req, res) => {
  try {
    const { productId } = req.params
    const { quantity } = req.body

    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) return res.status(404).json({ error: 'Cart not found' })

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.productId !== productId)
    } else {
      const item = cart.items.find((i) => i.productId === productId)
      if (item) item.quantity = quantity
    }

    await cart.save()
    res.json(cart.items)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.removeItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) return res.status(404).json({ error: 'Cart not found' })

    cart.items = cart.items.filter((i) => i.productId !== req.params.productId)
    await cart.save()
    res.json(cart.items)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
    if (cart) {
      cart.items = []
      await cart.save()
    }
    res.json([])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
