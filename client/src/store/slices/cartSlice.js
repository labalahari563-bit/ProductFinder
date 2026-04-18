import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async () => {
    const res = await api.get('/cart')
    return res.data
  }
)

export const addToCart = createAsyncThunk(
  'cart/add',
  async (product) => {
    const res = await api.post('/cart/items', {
      productId: product._id,
      name: product.name,
      price: product.price,
    })
    return res.data
  }
)

export const updateQuantity = createAsyncThunk(
  'cart/update',
  async ({ productId, quantity }) => {
    const res = await api.put(`/cart/items/${productId}`, { quantity })
    return res.data
  }
)

export const removeFromCart = createAsyncThunk(
  'cart/remove',
  async (productId) => {
    const res = await api.delete(`/cart/items/${productId}`)
    return res.data
  }
)

export const clearCart = createAsyncThunk(
  'cart/clear',
  async () => {
    const res = await api.delete('/cart')
    return res.data
  }
)

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loaded: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload.map((item) => ({
          product: {
            _id: item.productId,
            name: item.name,
            price: item.price,
          },
          quantity: item.quantity,
        }))
        state.loaded = true
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload.map((item) => ({
          product: {
            _id: item.productId,
            name: item.name,
            price: item.price,
          },
          quantity: item.quantity,
        }))
      })
      .addCase(updateQuantity.fulfilled, (state, action) => {
        state.items = action.payload.map((item) => ({
          product: {
            _id: item.productId,
            name: item.name,
            price: item.price,
          },
          quantity: item.quantity,
        }))
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload.map((item) => ({
          product: {
            _id: item.productId,
            name: item.name,
            price: item.price,
          },
          quantity: item.quantity,
        }))
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = []
      })
  },
})

export const selectCartTotal = (state) =>
  state.cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

export const selectCartItemCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0)

export default cartSlice.reducer
