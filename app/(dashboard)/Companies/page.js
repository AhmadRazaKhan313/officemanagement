'use client'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import {
  useGetCompaniesQuery,
  useAddCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
  useApproveCompanyMutation,
  useRejectCompanyMutation,
  useInviteOwnerMutation,
} from '@/store/api/companiesApi'
import { Plus, X, Pencil, Trash2, Check, Ban, Loader2, Building2, Mail } from 'lucide-react'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'

const initialForm = {
  name: '', slug: '', email: '', phone: '', website: '',
  address: '', industry: '', employee_count: '', tax_number: '',
  owner_name: '', owner_email: '', plan: 'free',
}

const statusBadge = {
  active: 'green', pending: 'yellow', rejected: 'red', suspended: 'gray',
}

const industryOptions = [
  'Technology', 'Healthcare', 'Finance', 'Education',
  'Manufacturing', 'Retail', 'Real Estate', 'Marketing', 'Logistics', 'Other',
]

const employeeCountOptions = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']

export default function CompaniesPage() {
  const { profile } = useSelector((state) => state.auth)

  const { data: companies = [], isLoading } = useGetCompaniesQuery()
  const [addCompany] = useAddCompanyMutation()
  const [updateCompany] = useUpdateCompanyMutation()
  const [deleteCompany] = useDeleteCompanyMutation()
  const [approveCompany] = useApproveCompanyMutation()
  const [rejectCompany] = useRejectCompanyMutation()
  const [inviteOwner] = useInviteOwnerMutation()

  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [inviting, setInviting] = useState(null)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'name' && {
        slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      })
    }))
  }

  function openAdd() {
    setEditingId(null)
    setForm(initialForm)
    setError('')
    setShowModal(true)
  }

  function openEdit(company) {
    setEditingId(company.id)
    setForm({
      name: company.name || '', slug: company.slug || '',
      email: company.email || '', phone: company.phone || '',
      website: company.website || '', address: company.address || '',
      industry: company.industry || '', employee_count: company.employee_count || '',
      tax_number: company.tax_number || '', owner_name: company.owner_name || '',
      owner_email: company.owner_email || '', plan: company.plan || 'free',
    })
    setError('')
    setShowModal(true)
  }

  function openDetail(company) {
    setSelectedCompany(company)
    setShowDetailModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingId(null)
    setForm(initialForm)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const result = editingId
      ? await updateCompany({ id: editingId, ...form })
      : await addCompany({ ...form, status: 'pending', owner_id: profile?.id })

    if (result.error) {
      setError(result.error.message)
      setSaving(false)
      return
    }

    closeModal()
    setSaving(false)
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this company?')) return
    await deleteCompany(id)
  }

  async function handleApprove(id) {
    await approveCompany({ id, approved_by: profile?.id })
  }

  async function handleReject(id) {
    await rejectCompany(id)
  }

  async function handleInvite(company) {
    if (!company.owner_email) {
      alert('Please add owner email first by editing the company.')
      return
    }
    setInviting(company.id)
    const result = await inviteOwner({
      company_id: company.id,
      company_name: company.name,
      owner_name: company.owner_name,
      owner_email: company.owner_email,
    })
    setInviting(null)
    if (result.error) {
      alert('Failed to send invite: ' + result.error.message)
    } else {
      alert('Invite sent successfully to ' + company.owner_email)
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all organizations</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openAdd}>
          Add Company
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: companies.length, color: 'text-blue-600' },
          { label: 'Active', value: companies.filter(c => c.status === 'active').length, color: 'text-green-600' },
          { label: 'Pending', value: companies.filter(c => c.status === 'pending').length, color: 'text-yellow-600' },
          { label: 'Suspended', value: companies.filter(c => c.status === 'suspended').length, color: 'text-red-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-500">{stat.label} Companies</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">All Companies</h2>
        </div>

        {isLoading ? (
          <div className="p-6 flex justify-center">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : companies.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">No companies found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Owner</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Industry</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <button
                          onClick={() => openDetail(company)}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {company.name}
                        </button>
                        <p className="text-xs text-gray-400">{company.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{company.owner_name || '-'}</p>
                    <p className="text-xs text-gray-400">{company.owner_email || '-'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{company.industry || '-'}</td>
                  <td className="px-6 py-4">
                    <Badge label={company.plan} variant="blue" />
                  </td>
                  <td className="px-6 py-4">
                    <Badge label={company.status} variant={statusBadge[company.status] || 'gray'} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">

                      {/* Invite button - pending companies pe */}
                      {company.status === 'pending' && (
                        <button
                          onClick={() => handleInvite(company)}
                          disabled={inviting === company.id}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50"
                          title="Send Invite to Owner"
                        >
                          {inviting === company.id
                            ? <Loader2 size={15} className="animate-spin" />
                            : <Mail size={15} />
                          }
                        </button>
                      )}

                      {/* Approve/Reject buttons */}
                      {company.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(company.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                            title="Approve"
                          >
                            <Check size={15} />
                          </button>
                          <button
                            onClick={() => handleReject(company.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                            title="Reject"
                          >
                            <Ban size={15} />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => openEdit(company)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(company.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Company' : 'Add Company'}
              </h3>
              <button onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-5">

              {/* Company Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">
                  Company Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                    <input type="text" name="name" required value={form.name} onChange={handleChange}
                      placeholder="ABC Corporation"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                    <input type="text" name="slug" required value={form.slug} onChange={handleChange}
                      placeholder="abc-corporation"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax/Registration Number</label>
                    <input type="text" name="tax_number" value={form.tax_number} onChange={handleChange}
                      placeholder="NTN-1234567"
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
                      {employeeCountOptions.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea name="address" value={form.address} onChange={handleChange}
                      placeholder="Company full address..." rows={2}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  </div>
                </div>
              </div>

              {/* Owner Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">
                  Owner Information
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    (Owner will receive invite email to set password)
                  </span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
                    <input type="text" name="owner_name" required value={form.owner_name} onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner Email *</label>
                    <input type="email" name="owner_email" required value={form.owner_email} onChange={handleChange}
                      placeholder="owner@company.com"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              {/* Plan */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">
                  Subscription Plan
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {['free', 'pro', 'enterprise'].map(plan => (
                    <button key={plan} type="button"
                      onClick={() => setForm(prev => ({ ...prev, plan }))}
                      className={`p-3 rounded-lg border-2 text-sm font-medium capitalize transition-all
                        ${form.plan === plan
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                    >
                      {plan}
                      {plan === 'pro' && (
                        <span className="block text-xs font-normal mt-0.5 text-gray-400">Most Popular</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg">{error}</div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1 justify-center" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 justify-center" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update Company' : 'Add Company & Send Invite'}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">Company Details</h3>
              <button onClick={() => setShowDetailModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Building2 size={24} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selectedCompany.name}</h4>
                  <p className="text-gray-400 text-sm">{selectedCompany.slug}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge label={selectedCompany.plan} variant="blue" />
                    <Badge label={selectedCompany.status} variant={statusBadge[selectedCompany.status] || 'gray'} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Email', value: selectedCompany.email },
                  { label: 'Phone', value: selectedCompany.phone },
                  { label: 'Website', value: selectedCompany.website },
                  { label: 'Industry', value: selectedCompany.industry },
                  { label: 'Employee Count', value: selectedCompany.employee_count },
                  { label: 'Tax Number', value: selectedCompany.tax_number },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{item.value || '-'}</p>
                  </div>
                ))}
                <div className="col-span-2 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Address</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{selectedCompany.address || '-'}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Owner Information</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Owner Name</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{selectedCompany.owner_name || '-'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Owner Email</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{selectedCompany.owner_email || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                {selectedCompany.status === 'pending' && (
                  <button
                    onClick={() => handleInvite(selectedCompany)}
                    disabled={inviting === selectedCompany.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm font-medium transition-colors disabled:opacity-50"
                    title="Resend Invite"
                  >
                    {inviting === selectedCompany.id
                      ? <Loader2 size={15} className="animate-spin" />
                      : <Mail size={15} />
                    }
                    Resend Invite
                  </button>
                )}
                <Button variant="outline" className="flex-1 justify-center"
                  onClick={() => { setShowDetailModal(false); openEdit(selectedCompany) }}
                  icon={<Pencil size={14} />}>
                  Edit
                </Button>
                <Button className="flex-1 justify-center" onClick={() => setShowDetailModal(false)}>
                  Close
                </Button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}