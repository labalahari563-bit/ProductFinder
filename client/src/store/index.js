import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import questionnaireReducer from './slices/questionnaireSlice'
import cartReducer from './slices/cartSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    questionnaire: questionnaireReducer,
    cart: cartReducer,
  },
})

export default store
