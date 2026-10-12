'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatPrice, getStatusColor, getStatusLabel, timeAgo } from '@/lib/utils'

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard').then(r => r.json()).then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-28 animate-shimmer rounded-xl" />)}
      </div>
      <div className="h-64 animate-shimmer rounded-xl" />
    </div>
  )

  const stats = data?.stats || {}

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-earth-900 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 bg-white rounded-xl border border-cream-200 shadow-sm">
          <p className="text-sm text-earth-500">Today&apos;s Orders</p>
          <p className="text-3xl font-bold text-jaggery-600 mt-1">{stats.todayOrders || 0}</p>
          <div className="mt-2 text-2xl">📦</div>
        </div>
        <div className="p-5 bg-white rounded-xl border border-cream-200 shadow-sm">
          <p className="text-sm text-earth-500">Pending Orders</p>
          <p className="text-3xl font-bold text-orange-600 mt-1">{stats.pendingOrders || 0}</p>
          <div className="mt-2 text-2xl">⏳</div>
        </div>
        <div className="p-5 bg-white rounded-xl border border-cream-200 shadow-sm">
          <p className="text-sm text-earth-500">Total Revenue</p>
          <p className="text-3xl font-bold text-cane-600 mt-1">{formatPrice(stats.totalRevenue || 0)}</p>
          <div className="mt-2 text-2xl">💰</div>
        </div>
        <div className="p-5 bg-white rounded-xl border border-cream-200 shadow-sm">
          <p className="text-sm text-earth-500">Low Stock Items</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{stats.lowStockItems || 0}</p>
          <div className="mt-2 text-2xl">⚠️</div>
        </div>
      </div>

      {/* Chart placeholder */}
      {data?.chartData?.length > 0 && (
        <div className="p-6 bg-white rounded-xl border border-cream-200 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-earth-900 mb-4">Orders (Last 30 days)</h2>
          <div className="flex items-end gap-1 h-40">
            {data.chartData.map((d: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end" title={`${d.date}: ${d.orders} orders, ₹${d.revenue}`}>
                <div className="w-full bg-gradient-to-t from-jaggery-500 to-jaggery-300 rounded-t-sm min-h-[4px] transition-all hover:from-jaggery-600" style={{ height: `${Math.max(10, (d.orders / Math.max(...data.chartData.map((x: any) => x.orders))) * 100)}%` }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="p-6 bg-white rounded-xl border border-cream-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-earth-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-jaggery-600 hover:text-jaggery-700 font-medium">View All →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-cream-200">
              <th className="text-left py-3 px-2 text-earth-500 font-medium">Order</th>
              <th className="text-left py-3 px-2 text-earth-500 font-medium">Customer</th>
              <th className="text-left py-3 px-2 text-earth-500 font-medium">Total</th>
              <th className="text-left py-3 px-2 text-earth-500 font-medium">Status</th>
              <th className="text-left py-3 px-2 text-earth-500 font-medium">Time</th>
            </tr></thead>
            <tbody>
              {(data?.recentOrders || []).map((order: any) => (
                <tr key={order.id} className="border-b border-cream-100 hover:bg-cream-50 transition-colors">
                  <td className="py-3 px-2">
                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-jaggery-600 hover:text-jaggery-700">{order.orderNumber}</Link>
                    {order.orderType === 'gift' && <span className="ml-1">🎁</span>}
                  </td>
                  <td className="py-3 px-2 text-earth-700">{order.customer?.name || 'Guest'}<br/><span className="text-xs text-earth-400">{order.customer?.phone}</span></td>
                  <td className="py-3 px-2 font-medium text-earth-900">{formatPrice(order.total)}</td>
                  <td className="py-3 px-2"><span className={`status-badge ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span></td>
                  <td className="py-3 px-2 text-earth-400">{timeAgo(new Date(order.createdAt))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
