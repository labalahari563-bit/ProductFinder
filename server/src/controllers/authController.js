const jwt = require('jsonwebtoken')
const User = require('../models/User')

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  })

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'Email and password are required' })
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: 'Password must be at least 6 characters' })
    }

    const exists = await User.findOne({ email })
    if (exists) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const user = await User.create({ email, password })
    const token = signToken(user._id)

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
    })
  } catch (err) {
    res.status(500).json({ error: err })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'Email and password are required' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = signToken(user._id)

    res.json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
    })
  } catch (err) {
    res.status(500).json({ error: err })
  }
}

exports.getProfile = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
    },
  })
}
