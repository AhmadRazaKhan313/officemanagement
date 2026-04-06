'use client'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import {
  useGetDepartmentsQuery,
  useAddDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} from '@/store/api/departmentsApi'
import { useGetEmployeesQuery } from '@/store/api/employeesApi'
import { Plus, X, Pencil, Trash2, Loader2, FolderKanban } from 'lucide-react'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'

const initialForm = { name: '', type: 'custom', description: '' }

const typeColors = {
  hr: 'green', sales: 'blue', it: 'purple', finance: 'yellow', custom: 'gray',
}

export default function OrgDepartmentsPage() {
  const { profile } = useSelector((state) => state.auth)
  const companyId = profile?.company_id

  const { data: allDepartments = [], isLoading } = useGetDepartmentsQuery()
  const { data: allEmployees = [] } = useGetEmployeesQuery()

  const departments = allDepartments.filter(d => d.company_id === companyId)
  const employees = allEmployees.filter(e => e.company_id === companyId)

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
    setForm({ name: dept.name, type: dept.type || 'custom', description: dept.description || '' })
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
      : await addDepartment({ ...form, company_id: companyId })

    if (result.error) {
      setError(result.error.message)
      setSaving(false)
      return
    }

    closeModal()
    setSaving(false)
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure?')) return
    await deleteDepartment(id)
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your organization departments</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openAdd}>
          Add Department
        </Button>
      </div>

      {/* Department Cards */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : departments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FolderKanban size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No departments found</p>
          <Button className="mt-4" icon={<Plus size={14} />} onClick={openAdd}>
            Add First Department
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => {
            const deptEmployees = employees.filter(e => e.department_id === dept.id)
            return (
              <div key={dept.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                      <FolderKanban size={18} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{dept.name}</p>
                      <Badge label={dept.type || 'custom'} variant={typeColors[dept.type] || 'gray'} />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(dept)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(dept.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {dept.description && (
                  <p className="text-xs text-gray-400 mb-3">{dept.description}</p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">Employees</span>
                  <span className="text-sm font-semibold text-gray-900">{deptEmployees.length}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Department' : 'Add Department'}
              </h3>
              <button onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                <input type="text" name="name" required
                  value={form.name} onChange={handleChange}
                  placeholder="e.g. Human Resources"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select name="type" value={form.type} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="custom">Custom</option>
                  <option value="hr">HR</option>
                  <option value="sales">Sales</option>
                  <option value="it">IT</option>
                  <option value="finance">Finance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange}
                  placeholder="Department description..." rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg">{error}</div>
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