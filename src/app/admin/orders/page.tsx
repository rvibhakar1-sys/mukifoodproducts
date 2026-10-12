'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatPrice, getStatusColor, getStatusLabel, timeAgo } from '@/lib/utils'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const fetchOrders = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (search) params.set('search', search)
    fetch(`/api/admin/orders?${params}`).then(r => r.json()).then(d => { setOrders(d.orders || []); setLoading(false) }).catch(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [statusFilter, search])

  const statuses = ['all', 'placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled']

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-earth-900 mb-6">Orders</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input type="text" placeholder="Search order ID, name, phone..." value={search} onChange={e => setSearch(e.target.value)} className="input-field sm:max-w-xs" />
        <div className="flex gap-2 flex-wrap">
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${statusFilter === s ? 'bg-jaggery-600 text-white' : 'bg-white border border-cream-200 text-earth-600 hover:border-jaggery-300'}`}>
              {s === 'all' ? 'All' : getStatusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-cream-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="w-8 h-8 border-4 border-jaggery-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center"><div className="text-5xl mb-3">📭</div><p className="text-earth-500">No orders found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-cream-50 border-b border-cream-200">
                <th className="text-left py-3 px-4 text-earth-500 font-medium">Order</th>
                <th className="text-left py-3 px-4 text-earth-500 font-medium">Customer</th>
                <th className="text-left py-3 px-4 text-earth-500 font-medium">Items</th>
                <th className="text-left py-3 px-4 text-earth-500 font-medium">Total</th>
                <th className="text-left py-3 px-4 text-earth-500 font-medium">Payment</th>
                <th className="text-left py-3 px-4 text-earth-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-earth-500 font-medium">Time</th>
                <th className="text-left py-3 px-4 text-earth-500 font-medium">Action</th>
              </tr></thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order.id} className="border-b border-cream-100 hover:bg-cream-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-medium text-earth-900">{order.orderNumber}</span>
                      {order.orderType === 'gift' && <span className="ml-1" title="Gift order">🎁</span>}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-earth-700">{order.customer?.name || 'Guest'}</p>
                      <p className="text-xs text-earth-400">{order.customer?.phone}</p>
                    </td>
                    <td className="py-3 px-4 text-earth-600">{order.items?.length || 0} items</td>
                    <td className="py-3 px-4 font-medium text-earth-900">{formatPrice(order.total)}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-medium uppercase">{order.paymentMethod}</span>
                      <span className={`ml-1 inline-block w-2 h-2 rounded-full ${order.paymentStatus === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    </td>
                    <td className="py-3 px-4"><span className={`status-badge ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span></td>
                    <td className="py-3 px-4 text-earth-400 text-xs">{timeAgo(new Date(order.createdAt))}</td>
                    <td className="py-3 px-4">
                      <Link href={`/admin/orders/${order.id}`} className="text-sm text-jaggery-600 hover:text-jaggery-700 font-medium">View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
