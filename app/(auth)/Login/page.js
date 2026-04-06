'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { createClient } from '@/lib/supabase/client'
import { setUser } from '@/store/slices/authSlice'

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*, companies(name, status)')
      .eq('id', data.user.id)
      .single()

    // Company status check
    if (profile?.role === 'company_admin' && profile?.companies?.status !== 'active') {
      await supabase.auth.signOut()
      setError('Your company is not approved yet. Please wait for admin approval.')
      setLoading(false)
      return
    }

    dispatch(setUser({ user: data.user, profile }))

    if (profile?.role === 'employee') {
      router.push('/Portal')
    } else {
      router.push('/Dashboard')
    }
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md">

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Office Manager</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </form>
      </div>
    </div>
  )
}