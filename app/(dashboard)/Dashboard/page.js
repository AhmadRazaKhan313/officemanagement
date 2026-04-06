'use client'

import { useSelector } from 'react-redux'
import { useGetCompaniesQuery } from '@/store/api/companiesApi'
import { useGetEmployeesQuery } from '@/store/api/employeesApi'
import { useGetDepartmentsQuery } from '@/store/api/departmentsApi'
import { Building2, Users, FolderKanban, TrendingUp } from 'lucide-react'
import Avatar from '@/components/atoms/Avatar'
import Badge from '@/components/atoms/Badge'

const statsConfig = [
  { label: 'Total Companies', icon: Building2, color: 'bg-blue-50 text-blue-600', key: 'companies' },
  { label: 'Total Employees', icon: Users, color: 'bg-green-50 text-green-600', key: 'employees' },
  { label: 'Departments', icon: FolderKanban, color: 'bg-purple-50 text-purple-600', key: 'departments' },
  { label: 'Active Employees', icon: TrendingUp, color: 'bg-yellow-50 text-yellow-600', key: 'active' },
]

export default function DashboardPage() {
  const { profile } = useSelector((state) => state.auth)

  const { data: companies = [], isLoading: companiesLoading } = useGetCompaniesQuery()
  const { data: employees = [], isLoading: employeesLoading } = useGetEmployeesQuery()
  const { data: departments = [], isLoading: departmentsLoading } = useGetDepartmentsQuery()

  const isLoading = companiesLoading || employeesLoading || departmentsLoading

  const counts = {
    companies: companies.length,
    employees: employees.length,
    departments: departments.length,
    active: employees.filter(e => e.status === 'active').length,
  }

  const recentEmployees = [...employees]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Admin'}!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.key} className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <div className={`w-9 h-9 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon size={18} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {isLoading ? '...' : counts[stat.key]}
              </p>
            </div>
          )
        })}
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
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Department</th>
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
                    {emp.companies?.name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {emp.departments?.name || '-'}
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