const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
} = require('../controllers/cartController')

router.use(protect)

router.get('/', getCart)
router.post('/items', addItem)
router.put('/items/:productId', updateItem)
router.delete('/items/:productId', removeItem)
router.delete('/', clearCart)

module.exports = router
