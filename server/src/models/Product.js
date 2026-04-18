const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  image: { type: String, default: '' },
  tags: [String],
  stock: { type: Number, default: 0 },
})

module.exports = mongoose.model('Product', productSchema)
