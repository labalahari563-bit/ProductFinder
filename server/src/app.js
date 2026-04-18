require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')

const questionRoutes = require('./routes/questions')
const productRoutes = require('./routes/products')
const recommendationRoutes = require('./routes/recommendations')
const authRoutes = require('./routes/auth')
const adminRoutes = require('./routes/admin')
const cartRoutes = require('./routes/cart')

const app = express()

app.use(cors())
app.use(express.json())

connectDB()

// Public routes
app.use('/api/auth', authRoutes)
app.use('/api/questions', questionRoutes)
app.use('/api/products', productRoutes)
app.use('/api/recommendations', recommendationRoutes)

// Admin routes
app.use('/api/admin', adminRoutes)

// Protected user routes
app.use('/api/cart', cartRoutes)

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// Global error handler
app.use((err, req, res, _next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
