'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Building2, Loader2 } from 'lucide-react'
import Button from '@/components/atoms/Button'

export default function InvitePage() {
  const router = useRouter()
  const { token } = useParams()
  const supabase = createClient()

  const [invitation, setInvitation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name: '',
    password: '',
    confirm_password: '',
  })

  useEffect(() => {
    fetchInvitation()
  }, [])

  async function fetchInvitation() {
    const { data, error } = await supabase
      .from('invitations')
      .select('*, companies(id, name, slug)')
      .eq('token', token)
      .eq('status', 'pending')
      .maybeSingle()

    if (error || !data) {
      setError('Invalid or expired invitation link.')
      setLoading(false)
      return
    }

    if (new Date(data.expires_at) < new Date()) {
      setError('This invitation link has expired. Please contact your administrator.')
      setLoading(false)
      return
    }

    setInvitation(data)
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm_password) {
      setError('Passwords do not match')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setSaving(true)

    // Step 1: Auth user banao
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: invitation.email,
      password: form.password,
      options: { data: { full_name: form.full_name } }
    })

    if (signUpError) {
      setError(signUpError.message)
      setSaving(false)
      return
    }

    // Step 2: Login karo
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: invitation.email,
      password: form.password,
    })

    if (signInError) {
      setError(signInError.message)
      setSaving(false)
      return
    }

    const userId = signInData.user?.id

    // Step 3: Profile update karo
    await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        company_id: invitation.companies?.id,
        role: invitation.role,
      })
      .eq('id', userId)

    // Step 4: Employee record mein profile_id link karo
const { data: empData } = await supabase
  .from('employees')
  .select('id')
  .eq('email', invitation.email)
  .maybeSingle()

if (empData) {
  await supabase
    .from('employees')
    .update({ profile_id: userId })
    .eq('id', empData.id)
}

    // Step 5: org_admins mein add karo
    if (invitation.role === 'org_admin') {
      await supabase.from('org_admins').insert({
        organization_id: invitation.companies?.id,
        user_id: userId,
        granted_by: userId,
      })
    }

 // Step 6: Company status active karo
await supabase
  .from('companies')
  .update({ 
    status: 'active',
    approved_at: new Date().toISOString()
  })
  .eq('id', invitation.companies?.id)

// Step 7: Invitation accepted mark karo
await supabase
  .from('invitations')
  .update({ status: 'accepted' })
  .eq('token', token)
    // Step 7: Redirect
    if (invitation.role === 'employee') {
      router.push('/Portal')
    } else {
      router.push('/OrgDashboard')
    }
    router.refresh()
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-gray-400" />
    </div>
  )

  if (error && !invitation) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center bg-white p-8 rounded-2xl shadow-sm max-w-md w-full">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">❌</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Link</h2>
        <p className="text-gray-500 text-sm">{error}</p>
        <Button className="mt-6 w-full justify-center" onClick={() => router.push('/Login')}>
          Go to Login
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 size={28} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Accept Invitation</h1>
          <p className="text-gray-500 text-sm mt-2">
            You have been invited to join
          </p>
          <p className="text-blue-600 font-semibold text-lg">
            {invitation?.companies?.name}
          </p>
          <span className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full mt-2 inline-block capitalize">
            {invitation?.role?.replace('_', ' ')}
          </span>
        </div>

        {/* Email display */}
        <div className="bg-gray-50 rounded-lg p-3 mb-5 text-center">
          <p className="text-xs text-gray-400">Invited email</p>
          <p className="text-sm font-medium text-gray-900 mt-0.5">{invitation?.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text" required
              value={form.full_name}
              onChange={e => setForm(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="John Doe"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Set Password</label>
            <input
              type="password" required
              value={form.password}
              onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password" required
              value={form.confirm_password}
              onChange={e => setForm(prev => ({ ...prev, confirm_password: e.target.value }))}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full justify-center"
            disabled={saving}
          >
            {saving ? 'Setting up account...' : 'Accept & Join'}
          </Button>

        </form>
      </div>
    </div>
  )
}