const Question = require('../models/Question')

exports.getFirstQuestion = async (req, res) => {
  try {
    const question = await Question.findOne().sort({ order: 1 })
    if (!question) {
      return res.status(404).json({ error: 'No questions found' })
    }
    const totalQuestions = await Question.countDocuments()
    res.json({ question, totalQuestions })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
    if (!question) {
      return res.status(404).json({ error: 'Question not found' })
    }
    res.json(question)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.evaluateAnswer = async (req, res) => {
  try {
    const { questionId, answer } = req.body

    const question = await Question.findById(questionId)
    if (!question) {
      return res.status(404).json({ error: 'Question not found' })
    }

    let nextRef

    if (Array.isArray(answer)) {
      // Multi-choice: all options share the same next action
      nextRef = question.options[0]?.next || 'DONE'
    } else {
      const selected = question.options.find((o) => o.value === answer)
      if (!selected) {
        return res.status(400).json({ error: 'Invalid answer' })
      }
      nextRef = selected.next
    }

    if (nextRef === 'REJECT') {
      return res.json({
        type: 'reject',
        message:
          'Based on your responses, you are not eligible for our products at this time.',
      })
    }

    if (nextRef === 'DONE') {
      return res.json({
        type: 'recommendations',
        data: [],
        needsRecommendations: true,
      })
    }

    const nextQuestion = await Question.findById(nextRef)
    if (!nextQuestion) {
      return res.json({
        type: 'recommendations',
        data: [],
        needsRecommendations: true,
      })
    }

    res.json({ type: 'question', data: nextQuestion })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
