'use client'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import {
  useGetDepartmentsQuery,
  useAddDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} from '@/store/api/departmentsApi'
import { useGetCompaniesQuery } from '@/store/api/companiesApi'
import { Plus, X, Pencil, Trash2, Loader2 } from 'lucide-react'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'

const initialForm = { name: '', company_id: '', type: 'custom', description: '' }

const typeColors = {
  hr: 'green',
  sales: 'blue',
  it: 'purple',
  finance: 'yellow',
  custom: 'gray',
}

export default function DepartmentsPage() {
  const { profile } = useSelector((state) => state.auth)

  const { data: departments = [], isLoading } = useGetDepartmentsQuery()
  const { data: companies = [] } = useGetCompaniesQuery()
  const [addDepartment] = useAddDepartmentMutation()
  const [updateDepartment] = useUpdateDepartmentMutation()
  const [deleteDepartment] = useDeleteDepartmentMutation()

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function openAdd() {
    setEditingId(null)
    setForm(initialForm)
    setError('')
    setShowModal(true)
  }

  function openEdit(dept) {
    setEditingId(dept.id)
    setForm({
      name: dept.name,
      company_id: dept.company_id,
      type: dept.type || 'custom',
      description: dept.description || '',
    })
    setError('')
    setShowModal(true)
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
      ? await updateDepartment({ id: editingId, ...form })
      : await addDepartment(form)

    if (result.error) {
      setError(result.error.message)
      setSaving(false)
      return
    }

    closeModal()
    setSaving(false)
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this department?')) return
    await deleteDepartment(id)
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all departments</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openAdd}>
          Add Department
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">All Departments</h2>
        </div>

        {isLoading ? (
          <div className="p-6 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : departments.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">
            No departments found
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{dept.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{dept.companies?.name || '-'}</td>
                  <td className="px-6 py-4">
                    <Badge label={dept.type || 'custom'} variant={typeColors[dept.type] || 'gray'} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{dept.description || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(dept)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Department' : 'Add Department'}
              </h3>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Human Resources"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <select
                  name="company_id"
                  required
                  value={form.company_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Company</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="custom">Custom</option>
                  <option value="hr">HR</option>
                  <option value="sales">Sales</option>
                  <option value="it">IT</option>
                  <option value="finance">Finance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Department description..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1 justify-center" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 justify-center" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Add Department'}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}