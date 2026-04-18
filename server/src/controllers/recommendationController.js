const Product = require('../models/Product')

exports.getRecommendations = async (req, res) => {
  try {
    const { answers } = req.body
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers array is required' })
    }

    const tags = answers.flatMap((a) =>
      Array.isArray(a.answer) ? a.answer : [a.answer]
    )
    const products = await Product.find({
      tags: { $in: tags },
    })

    const ranked = products.map((p) => {
      const matchedTags = p.tags.filter((t) => tags.includes(t))
      return { ...p.toObject(), matchScore: matchedTags.length, matchedTags }
    })

    ranked.sort((a, b) => b.matchScore - a.matchScore)

    res.json({ products: ranked, userTags: tags })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
