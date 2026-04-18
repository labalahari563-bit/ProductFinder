const mongoose = require('mongoose')

const questionOptionSchema = new mongoose.Schema({
  value: { type: String, required: true },
  label: { type: String, required: true },
  next: { type: String, required: true },
})

const questionSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  text: { type: String, required: true },
  type: {
    type: String,
    enum: ['single_choice', 'multi_choice', 'text'],
    default: 'single_choice',
  },
  options: [questionOptionSchema],
  tags: [String],
  order: { type: Number, default: 0 },
})

module.exports = mongoose.model('Question', questionSchema)
