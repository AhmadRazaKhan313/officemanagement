import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  profile: null,
  loading: true,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload.user
      state.profile = action.payload.profile
      state.loading = false
    },
    clearUser(state) {
      state.user = null
      state.profile = null
      state.loading = false
    },
    setLoading(state, action) {
      state.loading = action.payload
    },
  },
})

export const { setUser, clearUser, setLoading } = authSlice.actions
export default authSlice.reducer