const Product = require('../models/Product')

const WEIGHTS = [4, 3, 2, 1]

exports.getRecommendations = async (req, res) => {
  try {
    const { answers } = req.body
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers array is required' })
    }

    const tags = answers.flatMap((a) =>
      Array.isArray(a.answer) ? a.answer : [a.answer]
    )

    const tagWeights = {}
    answers.forEach((a, idx) => {
      const values = Array.isArray(a.answer) ? a.answer : [a.answer]
      const weight = WEIGHTS[Math.min(idx, WEIGHTS.length - 1)]
      values.forEach((v) => {
        tagWeights[v] = weight
      })
    })

    const products = await Product.find({
      tags: { $in: tags },
    })

    const ranked = products.map((p) => {
      const matchedTags = p.tags.filter((t) => tags.includes(t))
      const weightedScore = matchedTags.reduce(
        (sum, t) => sum + (tagWeights[t] || 1),
        0
      )
      return {
        ...p.toObject(),
        matchScore: matchedTags.length,
        weightedScore,
        matchedTags,
      }
    })

    ranked.sort(
      (a, b) => b.weightedScore - a.weightedScore || b.matchScore - a.matchScore
    )

    res.json({ products: ranked, userTags: tags })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
