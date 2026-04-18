const Product = require('../models/Product')

exports.getProducts = async (req, res) => {
  try {
    const { tags } = req.query
    const filter = {}
    if (tags) {
      filter.tags = { $in: tags.split(',') }
    }
    const products = await Product.find(filter)
    res.json(products)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
