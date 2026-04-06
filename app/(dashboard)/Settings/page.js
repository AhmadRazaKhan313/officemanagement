'use client'

import { useState } from 'react'
import { useGetRolesQuery, useGetPermissionsQuery, useUpdateRolePermissionsMutation } from '@/store/api/rolesApi'
import { Shield, Check, Loader2 } from 'lucide-react'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'

const moduleBadgeColor = {
  organization: 'blue',
  user: 'green',
  department: 'yellow',
  report: 'gray',
}

const roleColors = {
  super_admin: 'bg-red-50 text-red-600 border-red-200',
  org_admin: 'bg-blue-50 text-blue-600 border-blue-200',
  dept_manager: 'bg-purple-50 text-purple-600 border-purple-200',
  employee: 'bg-green-50 text-green-600 border-green-200',
}

export default function SettingsPage() {
  const { data: roles = [], isLoading: rolesLoading } = useGetRolesQuery()
  const { data: permissions = [], isLoading: permissionsLoading } = useGetPermissionsQuery()
  const [updateRolePermissions] = useUpdateRolePermissionsMutation()

  const [selectedRole, setSelectedRole] = useState(null)
  const [selectedPermissions, setSelectedPermissions] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const isLoading = rolesLoading || permissionsLoading

  // Permissions ko module ke hisaab se group karo
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = []
    acc[perm.module].push(perm)
    return acc
  }, {})

  function handleRoleSelect(role) {
    setSelectedRole(role)
    setSaved(false)
    // Is role ki existing permissions set karo
    const existing = role.role_permissions?.map(rp => rp.permissions?.id) || []
    setSelectedPermissions(existing.filter(Boolean))
  }

  function togglePermission(permId) {
    setSelectedPermissions(prev =>
      prev.includes(permId)
        ? prev.filter(id => id !== permId)
        : [...prev, permId]
    )
    setSaved(false)
  }

  async function handleSave() {
    if (!selectedRole) return
    setSaving(true)

    const result = await updateRolePermissions({
      role_id: selectedRole.id,
      permission_ids: selectedPermissions,
    })

    setSaving(false)

    if (!result.error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage roles and permissions</p>
      </div>

      <div className="grid grid-cols-12 gap-6">

        {/* Left - Roles List */}
        <div className="col-span-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Roles
          </h2>

          {roles.map((role) => {
            const permCount = role.role_permissions?.length || 0
            const isSelected = selectedRole?.id === role.id

            return (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role)}
                className={`w-full text-left p-4 rounded-xl border transition-all
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className={isSelected ? 'text-blue-600' : 'text-gray-400'} />
                    <span className={`text-sm font-semibold ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                      {role.label}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${roleColors[role.name] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                    {permCount} perms
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {role.description}
                </p>
              </button>
            )
          })}
        </div>

        {/* Right - Permissions */}
        <div className="col-span-8">
          {!selectedRole ? (
            <div className="bg-white rounded-xl border border-gray-200 flex items-center justify-center h-64">
              <div className="text-center">
                <Shield size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Select a role to manage permissions</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200">

              {/* Permissions Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedRole.label} Permissions
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {selectedPermissions.length} of {permissions.length} permissions selected
                  </p>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  variant={saved ? 'secondary' : 'primary'}
                  icon={saving
                    ? <Loader2 size={15} className="animate-spin" />
                    : saved
                      ? <Check size={15} />
                      : null
                  }
                >
                  {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                </Button>
              </div>

              {/* Permissions by Module */}
              <div className="p-6 space-y-6">
                {Object.entries(groupedPermissions).map(([module, perms]) => (
                  <div key={module}>

                    {/* Module Header */}
                    <div className="flex items-center gap-2 mb-3">
                      <Badge
                        label={module.charAt(0).toUpperCase() + module.slice(1)}
                        variant={moduleBadgeColor[module] || 'gray'}
                      />
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    {/* Permissions Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {perms.map((perm) => {
                        const isChecked = selectedPermissions.includes(perm.id)
                        const isDisabled = selectedRole.name === 'super_admin'

                        return (
                          <button
                            key={perm.id}
                            onClick={() => !isDisabled && togglePermission(perm.id)}
                            disabled={isDisabled}
                            className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all
                              ${isChecked
                                ? 'border-blue-200 bg-blue-50'
                                : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                              }
                              ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                          >
                            {/* Checkbox */}
                            <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border transition-colors
                              ${isChecked
                                ? 'bg-blue-600 border-blue-600'
                                : 'border-gray-300 bg-white'
                              }`}
                            >
                              {isChecked && <Check size={10} className="text-white" />}
                            </div>

                            {/* Text */}
                            <div>
                              <p className={`text-sm font-medium ${isChecked ? 'text-blue-700' : 'text-gray-700'}`}>
                                {perm.label}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {perm.description}
                              </p>
                            </div>
                          </button>
                        )
                      })}
                    </div>

                  </div>
                ))}

                {/* Super Admin Note */}
                {selectedRole.name === 'super_admin' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
                    <Shield size={16} className="text-yellow-600 flex-shrink-0" />
                    <p className="text-yellow-700 text-sm">
                      Super Admin has all permissions by default and cannot be modified.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  )
}