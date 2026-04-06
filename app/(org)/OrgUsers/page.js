'use client'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useGetUsersQuery, useGetUserRolesQuery, useAssignRoleMutation, useRemoveRoleMutation } from '@/store/api/usersApi'
import { useGetRolesQuery } from '@/store/api/rolesApi'
import { useGetDepartmentsQuery } from '@/store/api/departmentsApi'
import { Shield, Plus, Trash2, ChevronRight, User, Loader2, X, FolderKanban } from 'lucide-react'
import Avatar from '@/components/atoms/Avatar'
import Badge from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'

const roleColors = {
  super_admin: 'red', org_admin: 'blue', dept_manager: 'yellow', employee: 'green',
}

export default function OrgUsersPage() {
  const { profile } = useSelector((state) => state.auth)
  const companyId = profile?.company_id

  const { data: allUsers = [], isLoading } = useGetUsersQuery()
  const { data: roles = [] } = useGetRolesQuery()
  const { data: allDepartments = [] } = useGetDepartmentsQuery()

  const [assignRole] = useAssignRoleMutation()
  const [removeRole] = useRemoveRoleMutation()

  // Sirf apni company ke users
  const users = allUsers.filter(u => u.company_id === companyId)
  const departments = allDepartments.filter(d => d.company_id === companyId)

  // Org level roles only (not super_admin)
  const orgRoles = roles.filter(r => r.name !== 'super_admin')

  const [selectedUser, setSelectedUser] = useState(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [roleForm, setRoleForm] = useState({ role_id: '', department_id: '' })

  const { data: userRoles = [], isLoading: rolesLoading } = useGetUserRolesQuery(
    selectedUser?.id,
    { skip: !selectedUser }
  )

  async function handleAssignRole(e) {
    e.preventDefault()
    await assignRole({
      user_id: selectedUser.id,
      role_id: roleForm.role_id,
      organization_id: companyId,
      department_id: roleForm.department_id || null,
      assigned_by: profile?.id,
    })
    setShowRoleModal(false)
    setRoleForm({ role_id: '', department_id: '' })
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 text-sm mt-1">Manage users and assign roles</p>
      </div>

      <div className="grid grid-cols-12 gap-6">

        {/* Users List */}
        <div className="col-span-4 bg-white rounded-xl border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 text-sm">Organization Users</h2>
          </div>

          {isLoading ? (
            <div className="p-6 flex justify-center">
              <Loader2 size={20} className="animate-spin text-gray-400" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">No users found</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {users.map(user => (
                <button key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left
                    ${selectedUser?.id === user.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''}`}
                >
                  <Avatar name={user.full_name} size="sm" />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.full_name || 'No Name'}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Badge label={user.role?.replace('_', ' ') || 'employee'} variant={roleColors[user.role] || 'gray'} />
                    <ChevronRight size={14} className="text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Detail */}
        <div className="col-span-8">
          {!selectedUser ? (
            <div className="bg-white rounded-xl border border-gray-200 flex items-center justify-center h-64">
              <div className="text-center">
                <User size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Select a user to manage roles</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">

              {/* User Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-4">
                  <Avatar name={selectedUser.full_name} size="lg" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{selectedUser.full_name || 'No Name'}</h3>
                    <p className="text-gray-500 text-sm">{selectedUser.email}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge label={selectedUser.role?.replace('_', ' ') || 'employee'} variant={roleColors[selectedUser.role] || 'gray'} />
                      <Badge label={selectedUser.status || 'active'} variant={selectedUser.status === 'active' ? 'green' : 'red'} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Roles */}
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Shield size={16} className="text-blue-600" />
                    Assigned Roles
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{userRoles.length}</span>
                  </h3>
                  <Button icon={<Plus size={14} />} size="sm" onClick={() => setShowRoleModal(true)}>
                    Assign Role
                  </Button>
                </div>

                <div className="p-4">
                  {rolesLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 size={20} className="animate-spin text-gray-400" />
                    </div>
                  ) : userRoles.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 text-sm">No roles assigned yet</div>
                  ) : (
                    <div className="space-y-2">
                      {userRoles.map(ur => (
                        <div key={ur.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                              <Shield size={15} className="text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{ur.roles?.label}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {ur.departments && (
                                  <span className="flex items-center gap-1 text-xs text-gray-400">
                                    <FolderKanban size={11} />
                                    {ur.departments.name}
                                  </span>
                                )}
                                {!ur.departments && (
                                  <span className="text-xs text-gray-400">Organization scope</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button onClick={() => removeRole(ur.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Assign Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Assign Role</h3>
              <button onClick={() => setShowRoleModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAssignRole} className="px-6 py-4 space-y-4">

              <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                <Avatar name={selectedUser?.full_name} size="sm" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedUser?.full_name}</p>
                  <p className="text-xs text-gray-400">{selectedUser?.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select required value={roleForm.role_id}
                  onChange={e => setRoleForm(prev => ({ ...prev, role_id: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Role</option>
                  {orgRoles.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <select value={roleForm.department_id}
                  onChange={e => setRoleForm(prev => ({ ...prev, department_id: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">No department scope</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1 justify-center"
                  onClick={() => setShowRoleModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 justify-center">
                  Assign Role
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}