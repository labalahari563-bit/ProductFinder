const express = require('express')
const router = express.Router()
const {
  getFirstQuestion,
  getQuestionById,
  evaluateAnswer,
} = require('../controllers/questionController')

router.get('/', getFirstQuestion)
router.get('/:id', getQuestionById)
router.post('/evaluate', evaluateAnswer)

module.exports = router
