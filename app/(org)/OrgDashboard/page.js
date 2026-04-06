'use client'

import { useSelector } from 'react-redux'
import { useGetEmployeesQuery } from '@/store/api/employeesApi'
import { useGetDepartmentsQuery } from '@/store/api/departmentsApi'
import { Users, FolderKanban, TrendingUp, UserCheck } from 'lucide-react'
import Avatar from '@/components/atoms/Avatar'
import Badge from '@/components/atoms/Badge'

export default function OrgDashboardPage() {
  const { profile } = useSelector((state) => state.auth)
  const companyId = profile?.company_id

  const { data: allEmployees = [], isLoading: empLoading } = useGetEmployeesQuery()
  const { data: allDepartments = [], isLoading: deptLoading } = useGetDepartmentsQuery()


  
  const employees = allEmployees.filter(e => e.company_id === companyId)
  const departments = allDepartments.filter(d => d.company_id === companyId)
  const activeEmployees = employees.filter(e => e.status === 'active')

  const isLoading = empLoading || deptLoading

  const stats = [
    { label: 'Total Employees', value: employees.length, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Departments', value: departments.length, icon: FolderKanban, color: 'bg-purple-50 text-purple-600' },
    { label: 'Active Employees', value: activeEmployees.length, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
    { label: 'Inactive Employees', value: employees.filter(e => e.status !== 'active').length, icon: UserCheck, color: 'bg-yellow-50 text-yellow-600' },
  ]

  const recentEmployees = [...employees]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {profile?.companies?.name} Dashboard
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Overview of your organization
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <div className={`w-9 h-9 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon size={18} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {isLoading ? '...' : stat.value}
              </p>
            </div>
          )
        })}
      </div>

      {/* Departments */}
      <div className="grid grid-cols-2 gap-4">
        {departments.map(dept => (
          <div key={dept.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
                  <FolderKanban size={18} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{dept.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{dept.type}</p>
                </div>
              </div>
              <Badge label={dept.type || 'custom'} variant="gray" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {employees.filter(e => e.department_id === dept.id).length}
              <span className="text-sm font-normal text-gray-400 ml-1">employees</span>
            </p>
          </div>
        ))}
      </div>

      {/* Recent Employees */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Employees</h2>
          <span className="text-xs text-gray-400">Last 5 added</span>
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-gray-400 text-sm">Loading...</div>
        ) : recentEmployees.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">No employees found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Designation</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentEmployees.map((emp) => (
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
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {emp.departments?.name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {emp.designation || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      label={emp.status}
                      variant={emp.status === 'active' ? 'green' : 'red'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  )
}