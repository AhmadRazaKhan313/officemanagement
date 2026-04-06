'use client'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import {
  useGetOrdersQuery,
  useAddOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} from '@/store/api/ordersApi'
import { Plus, X, Pencil, Trash2, Loader2, ShoppingCart } from 'lucide-react'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'

const initialForm = {
  client_name: '', client_phone: '', client_email: '',
  client_address: '', order_details: '', amount: '', status: 'pending'
}

const statusColors = {
  pending: 'yellow', confirmed: 'blue', delivered: 'green', cancelled: 'red'
}

export default function OrgOrdersPage() {
  const { profile } = useSelector((state) => state.auth)
  const companyId = profile?.company_id

  const { data: allOrders = [], isLoading } = useGetOrdersQuery(companyId)
  const [addOrder] = useAddOrderMutation()
  const [updateOrder] = useUpdateOrderMutation()
  const [deleteOrder] = useDeleteOrderMutation()

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

  function openEdit(order) {
    setEditingId(order.id)
    setForm({
      client_name: order.client_name || '',
      client_phone: order.client_phone || '',
      client_email: order.client_email || '',
      client_address: order.client_address || '',
      order_details: order.order_details || '',
      amount: order.amount || '',
      status: order.status || 'pending',
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
      amount: form.amount ? parseFloat(form.amount) : 0,
    }

    const result = editingId
      ? await updateOrder({ id: editingId, ...payload })
      : await addOrder(payload)

    if (result.error) {
      setError(result.error.message)
      setSaving(false)
      return
    }

    closeModal()
    setSaving(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this order?')) return
    await deleteOrder(id)
  }

  const totalAmount = allOrders.reduce((sum, o) => sum + (o.amount || 0), 0)
  const pendingOrders = allOrders.filter(o => o.status === 'pending').length
  const deliveredOrders = allOrders.filter(o => o.status === 'delivered').length

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Manage client orders</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openAdd}>
          New Order
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{allOrders.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingOrders}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            Rs. {totalAmount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">All Orders</h2>
        </div>

        {isLoading ? (
          <div className="p-6 flex justify-center">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : allOrders.length === 0 ? (
          <div className="p-6 text-center">
            <ShoppingCart size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No orders yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Order Details</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{order.client_name}</p>
                    <p className="text-xs text-gray-400">{order.client_phone || order.client_email || '-'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {order.order_details || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    Rs. {(order.amount || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <Badge label={order.status} variant={statusColors[order.status] || 'gray'} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(order)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(order.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100">
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
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Order' : 'New Order'}
              </h3>
              <button onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">
                  Client Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                    <input type="text" name="client_name" required
                      value={form.client_name} onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="text" name="client_phone"
                      value={form.client_phone} onChange={handleChange}
                      placeholder="03001234567"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" name="client_email"
                      value={form.client_email} onChange={handleChange}
                      placeholder="client@example.com"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input type="number" name="amount"
                      value={form.amount} onChange={handleChange}
                      placeholder="5000"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input type="text" name="client_address"
                      value={form.client_address} onChange={handleChange}
                      placeholder="Client address"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">
                  Order Details
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Details</label>
                    <textarea name="order_details"
                      value={form.order_details} onChange={handleChange}
                      placeholder="Describe the order..." rows={3}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select name="status" value={form.status} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
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
                  {saving ? 'Saving...' : editingId ? 'Update Order' : 'Create Order'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}