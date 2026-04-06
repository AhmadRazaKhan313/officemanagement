'use client'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import {
  useGetEmployeesQuery,
  useAddEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useInviteEmployeeMutation,
} from '@/store/api/employeesApi'
import { useGetDepartmentsQuery } from '@/store/api/departmentsApi'
import { Plus, X, Pencil, Trash2, Loader2, Search, Mail } from 'lucide-react'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'
import Avatar from '@/components/atoms/Avatar'

const initialForm = {
  full_name: '', email: '', phone: '', designation: '',
  department_id: '', joining_date: '', salary: '', status: 'active',
}

export default function OrgEmployeesPage() {
  const { profile } = useSelector((state) => state.auth)
  const companyId = profile?.company_id

  const { data: allEmployees = [], isLoading } = useGetEmployeesQuery()
  const { data: allDepartments = [] } = useGetDepartmentsQuery()

  const employees = allEmployees.filter(e => e.company_id === companyId)
  const departments = allDepartments.filter(d => d.company_id === companyId)

  const [addEmployee] = useAddEmployeeMutation()
  const [updateEmployee] = useUpdateEmployeeMutation()
  const [deleteEmployee] = useDeleteEmployeeMutation()
  const [inviteEmployee] = useInviteEmployeeMutation()

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [inviting, setInviting] = useState(null)

  const filteredEmployees = employees.filter(emp =>
    emp.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    emp.email?.toLowerCase().includes(search.toLowerCase()) ||
    emp.designation?.toLowerCase().includes(search.toLowerCase())
  )

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

  function openEdit(emp) {
    setEditingId(emp.id)
    setForm({
      full_name: emp.full_name || '',
      email: emp.email || '',
      phone: emp.phone || '',
      designation: emp.designation || '',
      department_id: emp.department_id || '',
      joining_date: emp.joining_date || '',
      salary: emp.salary || '',
      status: emp.status || 'active',
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

    const payload = {
      ...form,
      company_id: companyId,
      department_id: form.department_id || null,
      joining_date: form.joining_date || null,
      salary: form.salary ? parseFloat(form.salary) : null,
    }

    const result = editingId
      ? await updateEmployee({ id: editingId, ...payload })
      : await addEmployee(payload)

    if (result.error) {
      if (result.error.code === '23505') {
        setError('This email is already registered.')
      } else {
        setError(result.error.message)
      }
      setSaving(false)
      return
    }

    closeModal()
    setSaving(false)
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure?')) return
    await deleteEmployee(id)
  }

  async function handleInvite(emp) {
    setInviting(emp.id)
    const result = await inviteEmployee({
      employee_id: emp.id,
      email: emp.email,
      name: emp.full_name,
      company_id: companyId,
      company_name: profile?.companies?.name,
      department_name: emp.departments?.name,
    })
    setInviting(null)
    if (result.error) {
      alert('Failed to send invite: ' + result.error.message)
    } else {
      alert('Invite sent to ' + emp.email)
    }
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your organization employees</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openAdd}>
          Add Employee
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            All Employees
            <span className="ml-2 text-xs font-normal text-gray-400">({filteredEmployees.length})</span>
          </h2>
          <div className="relative w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" placeholder="Search employees..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 flex justify-center">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">
            {search ? 'No employees match your search' : 'No employees found'}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Designation</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Joining Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={emp.full_name} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{emp.full_name}</p>
                        <p className="text-xs text-gray-400">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{emp.departments?.name || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{emp.designation || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {emp.joining_date ? new Date(emp.joining_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      label={emp.status}
                      variant={emp.status === 'active' ? 'green' : emp.status === 'terminated' ? 'red' : 'gray'}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">

                      {/* Invite Button */}
                      <button
                        onClick={() => handleInvite(emp)}
                        disabled={inviting === emp.id}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50"
                        title="Send Login Invite"
                      >
                        {inviting === emp.id
                          ? <Loader2 size={15} className="animate-spin" />
                          : <Mail size={15} />
                        }
                      </button>

                      <button onClick={() => openEdit(emp)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                        <Pencil size={15} />
                      </button>

                      <button onClick={() => handleDelete(emp.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Employee' : 'Add Employee'}
              </h3>
              <button onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" name="full_name" required
                    value={form.full_name} onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" required
                    value={form.email} onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" name="phone"
                    value={form.phone} onChange={handleChange}
                    placeholder="03001234567"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                  <input type="text" name="designation"
                    value={form.designation} onChange={handleChange}
                    placeholder="Software Engineer"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select name="department_id"
                  value={form.department_id} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Department (optional)</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                  <input type="date" name="joining_date"
                    value={form.joining_date} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                  <input type="number" name="salary"
                    value={form.salary} onChange={handleChange}
                    placeholder="50000"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select name="status"
                  value={form.status} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg">{error}</div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1 justify-center" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 justify-center" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Add Employee'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}