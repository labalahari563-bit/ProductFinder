import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchFirstQuestion = createAsyncThunk(
  'questionnaire/fetchFirst',
  async () => {
    const res = await api.get('/questions')
    return res.data
  }
)

export const submitAnswer = createAsyncThunk(
  'questionnaire/submitAnswer',
  async ({ questionId, answer }, { getState }) => {
    const res = await api.post('/questions/evaluate', { questionId, answer })
    const result = res.data

    if (result.needsRecommendations) {
      const { questionnaire } = getState()
      const allAnswers = [
        ...questionnaire.answers,
        { questionId, answer },
      ]
      const recRes = await api.post('/recommendations', { answers: allAnswers })
      const { products, userTags } = recRes.data

      console.log('=== Assessment Complete ===')
      console.log('User tags collected:', userTags)
      console.log(`Total tags: ${userTags.length}`)
      console.log('Matched products:', products.map((p) => ({
        name: p.name,
        weightedScore: p.weightedScore,
        matchScore: p.matchScore,
        matchedTags: p.matchedTags,
      })))
      if (products.length > 0) {
        console.log(`Best match: "${products[0].name}" — weighted score: ${products[0].weightedScore}, ${products[0].matchScore} tags matched:`, products[0].matchedTags)
      }

      return {
        type: 'recommendations',
        data: products,
        userTags,
        savedAnswer: { questionId, answer },
      }
    }

    return {
      ...result,
      savedAnswer: { questionId, answer },
    }
  }
)

const questionnaireSlice = createSlice({
  name: 'questionnaire',
  initialState: {
    currentQuestion: null,
    totalQuestions: 0,
    answers: [],
    recommendations: [],
    userTags: [],
    status: 'idle',
    error: null,
    rejected: false,
    rejectionMessage: '',
    completed: false,
    step: 1,
  },
  reducers: {
    resetQuestionnaire(state) {
      state.currentQuestion = null
      state.totalQuestions = 0
      state.answers = []
      state.recommendations = []
      state.userTags = []
      state.status = 'idle'
      state.error = null
      state.rejected = false
      state.rejectionMessage = ''
      state.completed = false
      state.step = 1
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFirstQuestion.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchFirstQuestion.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const payload = action.payload
        state.currentQuestion = payload.question || payload
        state.totalQuestions = payload.totalQuestions || 0
        state.step = 1
      })
      .addCase(fetchFirstQuestion.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(submitAnswer.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(submitAnswer.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const result = action.payload
        const { savedAnswer } = result

        state.answers.push({
          questionId: savedAnswer.questionId,
          answer: savedAnswer.answer,
        })
        state.step = state.answers.length + 1

        if (result.type === 'question') {
          state.currentQuestion = result.data
        } else if (result.type === 'reject') {
          state.rejected = true
          state.rejectionMessage = result.message
        } else if (result.type === 'recommendations') {
          state.completed = true
          state.recommendations = result.data
          state.userTags = result.userTags || []
        }
      })
      .addCase(submitAnswer.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})

export const { resetQuestionnaire } = questionnaireSlice.actions
export default questionnaireSlice.reducer
