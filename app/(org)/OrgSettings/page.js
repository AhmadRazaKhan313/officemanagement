'use client'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useUpdateCompanyMutation } from '@/store/api/companiesApi'
import { createClient } from '@/lib/supabase/client'
import { Building2, Save, Loader2 } from 'lucide-react'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'

const industryOptions = [
  'Technology', 'Healthcare', 'Finance', 'Education',
  'Manufacturing', 'Retail', 'Real Estate', 'Marketing', 'Logistics', 'Other',
]

export default function OrgSettingsPage() {
  const { profile } = useSelector((state) => state.auth)
  const supabase = createClient()

  const [updateCompany] = useUpdateCompanyMutation()
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', phone: '', website: '',
    address: '', industry: '', employee_count: '',
  })

  useEffect(() => {
    fetchCompany()
  }, [])

  async function fetchCompany() {
    const { data } = await supabase
      .from('companies')
      .select('*')
      .eq('id', profile?.company_id)
      .single()

    if (data) {
      setCompany(data)
      setForm({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        website: data.website || '',
        address: data.address || '',
        industry: data.industry || '',
        employee_count: data.employee_count || '',
      })
    }
    setLoading(false)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const result = await updateCompany({ id: profile?.company_id, ...form })

    if (result.error) {
      setError(result.error.message)
      setSaving(false)
      return
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return (
    <div className="flex justify-center py-12">
      <Loader2 size={24} className="animate-spin text-gray-400" />
    </div>
  )

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Organization Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your organization information</p>
      </div>

      {/* Company Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
            <Building2 size={24} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{company?.name}</h2>
            <p className="text-gray-400 text-sm">{company?.slug}</p>
            <div className="flex gap-2 mt-1">
              <Badge label={company?.plan || 'free'} variant="blue" />
              <Badge label={company?.status || 'active'} variant="green" />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Company Information</h3>
        </div>

        <form onSubmit={handleSave} className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="company@example.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange}
                placeholder="+92 300 1234567"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input type="text" name="website" value={form.website} onChange={handleChange}
                placeholder="https://example.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <select name="industry" value={form.industry} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Industry</option>
                {industryOptions.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee Count</label>
              <select name="employee_count" value={form.employee_count} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Range</option>
                {['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'].map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea name="address" value={form.address} onChange={handleChange}
                placeholder="Company full address..." rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg">{error}</div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={saving}
              icon={saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            >
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>

    </div>
  )
}