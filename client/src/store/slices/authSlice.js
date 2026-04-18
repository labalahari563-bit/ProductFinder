import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const register = createAsyncThunk(
  'auth/register',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/register', credentials)
      localStorage.setItem('token', res.data.token)
      return res.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || 'Registration failed'
      )
    }
  }
)

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', credentials)
      localStorage.setItem('token', res.data.token)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Login failed')
    }
  }
)

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/auth/profile')
      return res.data.user
    } catch (err) {
      localStorage.removeItem('token')
      return rejectWithValue('Session expired')
    }
  }
)

const token = localStorage.getItem('token')

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: token || null,
    isAuthenticated: !!token,
    isAdmin: false,
    initialized: !token,
    status: 'idle',
    error: null,
  },
  reducers: {
    logout(state) {
      localStorage.removeItem('token')
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.isAdmin = false
      state.initialized = true
      state.status = 'idle'
      state.error = null
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.token = action.payload.token
        state.user = action.payload.user
        state.isAuthenticated = true
        state.isAdmin = action.payload.user.role === 'super_admin'
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      // Login
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.token = action.payload.token
        state.user = action.payload.user
        state.isAuthenticated = true
        state.isAdmin = action.payload.user.role === 'super_admin'
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      // Fetch profile (on app load)
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAdmin = action.payload.role === 'super_admin'
        state.initialized = true
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.isAuthenticated = false
        state.token = null
        state.initialized = true
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
