'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useDispatch } from 'react-redux'
import { clearUser } from '@/store/slices/authSlice'
import { useGetLeaveRequestsQuery, useAddLeaveRequestMutation } from '@/store/api/leaveApi'
import {
  useGetTodayAttendanceQuery,
  useCheckInMutation,
  useCheckOutMutation,
  useStartBreakMutation,
  useEndBreakMutation,
  useGetAttendanceHistoryQuery,
} from '@/store/api/attendanceApi'
import { useGetOrdersQuery, useAddOrderMutation } from '@/store/api/ordersApi'
import Button from '@/components/atoms/Button'
import Avatar from '@/components/atoms/Avatar'
import Badge from '@/components/atoms/Badge'
import {
  User, Building2, FolderKanban, Calendar, Phone,
  Mail, Briefcase, LogOut, Loader2, Plus, X,
  Clock, Coffee, ShoppingCart, CheckCircle
} from 'lucide-react'

export default function EmployeePortalPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const supabase = createClient()

  const [profile, setProfile] = useState(null)
  const [employee, setEmployee] = useState(null)
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Modals
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)

  // Forms
  const [leaveForm, setLeaveForm] = useState({
    type: 'annual', from_date: '', to_date: '', reason: ''
  })
  const [orderForm, setOrderForm] = useState({
    client_name: '', client_phone: '', client_email: '',
    client_address: '', order_details: '', amount: ''
  })
  const [leaveSaving, setLeaveSaving] = useState(false)
  const [orderSaving, setOrderSaving] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // APIs
  const [addLeaveRequest] = useAddLeaveRequestMutation()
  const [checkIn] = useCheckInMutation()
  const [checkOut] = useCheckOutMutation()
  const [startBreak] = useStartBreakMutation()
  const [endBreak] = useEndBreakMutation()
  const [addOrder] = useAddOrderMutation()

  const { data: todayAttendance, refetch: refetchAttendance } = useGetTodayAttendanceQuery(
    employee?.id,
    { skip: !employee?.id }
  )

  const { data: attendanceHistory = [] } = useGetAttendanceHistoryQuery(
    { employee_id: employee?.id, limit: 7 },
    { skip: !employee?.id }
  )

  const { data: allLeaves = [] } = useGetLeaveRequestsQuery(
    profile?.company_id,
    { skip: !profile?.company_id }
  )

  const { data: allOrders = [] } = useGetOrdersQuery(
    profile?.company_id,
    { skip: !profile?.company_id || employee?.departments?.type !== 'sales' }
  )

  const myLeaves = allLeaves.filter(l => l.employee_id === employee?.id)
  const myOrders = allOrders.filter(o => o.employee_id === employee?.id)

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/Login'); return }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*, companies(id, name, slug, industry)')
      .eq('id', user.id)
      .maybeSingle()

    setProfile(profileData)

    const { data: employeeData } = await supabase
      .from('employees')
      .select('*, departments(id, name, type)')
      .eq('profile_id', user.id)
      .maybeSingle()

    setEmployee(employeeData)
    setCompany(profileData?.companies)
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    dispatch(clearUser())
    router.push('/Login')
    router.refresh()
  }

  async function handleCheckIn() {
    setActionLoading(true)
    await checkIn({ employee_id: employee.id, company_id: profile.company_id })
    refetchAttendance()
    setActionLoading(false)
  }

  async function handleCheckOut() {
    setActionLoading(true)
    await checkOut({
      attendance_id: todayAttendance.id,
      check_in: todayAttendance.check_in,
      break_minutes: todayAttendance.break_minutes || 0,
    })
    refetchAttendance()
    setActionLoading(false)
  }

  async function handleStartBreak() {
    setActionLoading(true)
    await startBreak(todayAttendance.id)
    refetchAttendance()
    setActionLoading(false)
  }

  async function handleEndBreak() {
    setActionLoading(true)
    await endBreak({
      attendance_id: todayAttendance.id,
      break_start: todayAttendance.break_start,
    })
    refetchAttendance()
    setActionLoading(false)
  }

  async function handleLeaveSubmit(e) {
    e.preventDefault()
    setLeaveSaving(true)
    await addLeaveRequest({
      ...leaveForm,
      company_id: profile?.company_id,
      employee_id: employee?.id,
    })
    setLeaveSaving(false)
    setShowLeaveModal(false)
    setLeaveForm({ type: 'annual', from_date: '', to_date: '', reason: '' })
  }

  async function handleOrderSubmit(e) {
    e.preventDefault()
    setOrderSaving(true)
    await addOrder({
      ...orderForm,
      company_id: profile?.company_id,
      department_id: employee?.department_id,
      employee_id: employee?.id,
      amount: orderForm.amount ? parseFloat(orderForm.amount) : 0,
    })
    setOrderSaving(false)
    setShowOrderModal(false)
    setOrderForm({
      client_name: '', client_phone: '', client_email: '',
      client_address: '', order_details: '', amount: ''
    })
  }

  // Attendance status
  const isCheckedIn = !!todayAttendance?.check_in
  const isCheckedOut = !!todayAttendance?.check_out
  const isOnBreak = !!todayAttendance?.break_start && !todayAttendance?.break_end
  const departmentType = employee?.departments?.type

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 size={24} className="animate-spin text-gray-400" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{company?.name}</p>
              <p className="text-xs text-gray-400">Employee Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">
                {currentTime.toLocaleTimeString()}
              </p>
              <p className="text-xs text-gray-400">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
            <Avatar name={profile?.full_name} size="sm" />
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 text-sm font-medium">
              <LogOut size={16} />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar name={profile?.full_name} size="lg" />
              <div>
                <p className="text-blue-200 text-sm">Welcome back,</p>
                <h1 className="text-2xl font-bold">{profile?.full_name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                    {employee?.designation || 'Employee'}
                  </span>
                  {employee?.departments && (
                    <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                      {employee.departments.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-blue-200 text-xs">Today</p>
              <p className="text-white font-semibold">
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Attendance Card - Sab employees ke liye */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <Clock size={16} className="text-blue-600" />
            <h2 className="font-semibold text-gray-900">Today's Attendance</h2>
            {todayAttendance && (
              <Badge
                label={isCheckedOut ? 'Completed' : isOnBreak ? 'On Break' : isCheckedIn ? 'Working' : 'Not Started'}
                variant={isCheckedOut ? 'green' : isOnBreak ? 'yellow' : isCheckedIn ? 'blue' : 'gray'}
              />
            )}
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">Check In</p>
                <p className="text-sm font-semibold text-gray-900">
                  {todayAttendance?.check_in
                    ? new Date(todayAttendance.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '--:--'
                  }
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">Check Out</p>
                <p className="text-sm font-semibold text-gray-900">
                  {todayAttendance?.check_out
                    ? new Date(todayAttendance.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '--:--'
                  }
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">Break</p>
                <p className="text-sm font-semibold text-gray-900">
                  {todayAttendance?.break_minutes
                    ? `${todayAttendance.break_minutes} min`
                    : '0 min'
                  }
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">Total Hours</p>
                <p className="text-sm font-semibold text-gray-900">
                  {todayAttendance?.total_hours
                    ? `${todayAttendance.total_hours}h`
                    : '--'
                  }
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {!isCheckedIn && (
                <Button
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                  icon={actionLoading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                >
                  Check In
                </Button>
              )}

              {isCheckedIn && !isCheckedOut && !isOnBreak && (
                <>
                  <Button
                    onClick={handleStartBreak}
                    disabled={actionLoading}
                    variant="secondary"
                    icon={<Coffee size={15} />}
                  >
                    Start Break
                  </Button>
                  <Button
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                    variant="danger"
                    icon={<LogOut size={15} />}
                  >
                    Check Out
                  </Button>
                </>
              )}

              {isOnBreak && (
                <Button
                  onClick={handleEndBreak}
                  disabled={actionLoading}
                  variant="secondary"
                  icon={<CheckCircle size={15} />}
                >
                  End Break
                </Button>
              )}

              {isCheckedOut && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                  <CheckCircle size={16} />
                  <span className="text-sm font-medium">Day Completed!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Attendance History */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Recent Attendance</h2>
          </div>
          <div className="p-4">
            {attendanceHistory.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-4">No attendance records</p>
            ) : (
              <div className="space-y-2">
                {attendanceHistory.map(att => (
                  <div key={att.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(att.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-400">
                        {att.check_in ? new Date(att.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'} -
                        {att.check_out ? new Date(att.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {att.total_hours ? `${att.total_hours}h` : '-'}
                      </p>
                      <Badge label={att.status} variant={att.status === 'present' ? 'green' : 'red'} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Leave Requests - Sab ke liye */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-blue-600" />
              <h2 className="font-semibold text-gray-900">Leave Requests</h2>
            </div>
            <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowLeaveModal(true)}>
              Apply Leave
            </Button>
          </div>
          <div className="p-4">
            {myLeaves.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-4">No leave requests</p>
            ) : (
              <div className="space-y-2">
                {myLeaves.map(leave => (
                  <div key={leave.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">{leave.type} Leave</p>
                      <p className="text-xs text-gray-400">
                        {new Date(leave.from_date).toLocaleDateString()} - {new Date(leave.to_date).toLocaleDateString()}
                      </p>
                      {leave.reason && <p className="text-xs text-gray-400">{leave.reason}</p>}
                    </div>
                    <Badge
                      label={leave.status}
                      variant={leave.status === 'approved' ? 'green' : leave.status === 'rejected' ? 'red' : 'yellow'}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sales Module - Sirf Sales Department */}
        {departmentType === 'sales' && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart size={16} className="text-blue-600" />
                <h2 className="font-semibold text-gray-900">My Orders</h2>
                <Badge label="Sales" variant="blue" />
              </div>
              <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowOrderModal(true)}>
                New Order
              </Button>
            </div>
            <div className="p-4">
              {myOrders.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-4">No orders yet</p>
              ) : (
                <div className="space-y-2">
                  {myOrders.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.client_name}</p>
                        <p className="text-xs text-gray-400">{order.order_details?.slice(0, 50) || '-'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">Rs. {(order.amount || 0).toLocaleString()}</p>
                        <Badge
                          label={order.status}
                          variant={order.status === 'delivered' ? 'green' : order.status === 'cancelled' ? 'red' : 'yellow'}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <User size={16} className="text-blue-600" />
              <h2 className="font-semibold text-gray-900">Personal Information</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              {[
                { icon: User, label: 'Full Name', value: profile?.full_name },
                { icon: Mail, label: 'Email', value: profile?.email },
                { icon: Phone, label: 'Phone', value: employee?.phone },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon size={14} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-sm font-medium text-gray-900">{item.value || '-'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <Briefcase size={16} className="text-blue-600" />
              <h2 className="font-semibold text-gray-900">Employment Details</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              {[
                { icon: Briefcase, label: 'Designation', value: employee?.designation },
                { icon: FolderKanban, label: 'Department', value: employee?.departments?.name },
                { icon: Calendar, label: 'Joining Date', value: employee?.joining_date ? new Date(employee.joining_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon size={14} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-sm font-medium text-gray-900">{item.value || '-'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Apply for Leave</h3>
              <button onClick={() => setShowLeaveModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleLeaveSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                <select value={leaveForm.type}
                  onChange={e => setLeaveForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="annual">Annual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="emergency">Emergency Leave</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                  <input type="date" required value={leaveForm.from_date}
                    onChange={e => setLeaveForm(prev => ({ ...prev, from_date: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                  <input type="date" required value={leaveForm.to_date}
                    onChange={e => setLeaveForm(prev => ({ ...prev, to_date: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea value={leaveForm.reason}
                  onChange={e => setLeaveForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Reason for leave..." rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1 justify-center"
                  onClick={() => setShowLeaveModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 justify-center" disabled={leaveSaving}>
                  {leaveSaving ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Modal - Sirf Sales */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">New Order</h3>
              <button onClick={() => setShowOrderModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleOrderSubmit} className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                  <input type="text" required value={orderForm.client_name}
                    onChange={e => setOrderForm(prev => ({ ...prev, client_name: e.target.value }))}
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" value={orderForm.client_phone}
                    onChange={e => setOrderForm(prev => ({ ...prev, client_phone: e.target.value }))}
                    placeholder="03001234567"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={orderForm.client_email}
                    onChange={e => setOrderForm(prev => ({ ...prev, client_email: e.target.value }))}
                    placeholder="client@example.com"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input type="number" value={orderForm.amount}
                    onChange={e => setOrderForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="5000"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input type="text" value={orderForm.client_address}
                    onChange={e => setOrderForm(prev => ({ ...prev, client_address: e.target.value }))}
                    placeholder="Client address"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Details</label>
                  <textarea value={orderForm.order_details}
                    onChange={e => setOrderForm(prev => ({ ...prev, order_details: e.target.value }))}
                    placeholder="Describe the order..." rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1 justify-center"
                  onClick={() => setShowOrderModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 justify-center" disabled={orderSaving}>
                  {orderSaving ? 'Saving...' : 'Create Order'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}