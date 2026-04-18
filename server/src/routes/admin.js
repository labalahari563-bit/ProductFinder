const express = require('express')
const router = express.Router()
const { protect, adminOnly } = require('../middleware/auth')
const {
  getTags,
  listQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/adminController')

router.use(protect, adminOnly)

router.get('/tags', getTags)
router.get('/questions', listQuestions)
router.post('/questions', createQuestion)
router.put('/questions/:id', updateQuestion)
router.delete('/questions/:id', deleteQuestion)

router.get('/products', listProducts)
router.post('/products', createProduct)
router.put('/products/:id', updateProduct)
router.delete('/products/:id', deleteProduct)

module.exports = router
