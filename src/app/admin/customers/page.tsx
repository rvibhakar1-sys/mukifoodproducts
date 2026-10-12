'use client'

import React, { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/Toast'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/customers').then(r => r.json()).then(d => { setCustomers(d.customers || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-jaggery-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-earth-900 mb-6">Customers</h1>
      <div className="bg-white rounded-xl border border-cream-200 overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-12 text-center"><div className="text-5xl mb-3">👥</div><p className="text-earth-500">No customers yet</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-cream-50 border-b border-cream-200">
              <th className="text-left py-3 px-4 text-earth-500 font-medium">Name</th>
              <th className="text-left py-3 px-4 text-earth-500 font-medium">Phone</th>
              <th className="text-left py-3 px-4 text-earth-500 font-medium">Email</th>
              <th className="text-left py-3 px-4 text-earth-500 font-medium">Orders</th>
              <th className="text-left py-3 px-4 text-earth-500 font-medium">Points</th>
              <th className="text-left py-3 px-4 text-earth-500 font-medium">Joined</th>
            </tr></thead>
            <tbody>
              {customers.map((c: any) => (
                <tr key={c.id} className="border-b border-cream-100 hover:bg-cream-50">
                  <td className="py-3 px-4 font-medium text-earth-900">{c.name || '—'}</td>
                  <td className="py-3 px-4 text-earth-700">{c.phone}</td>
                  <td className="py-3 px-4 text-earth-500">{c.email || '—'}</td>
                  <td className="py-3 px-4 text-earth-700">{c._count?.orders || 0}</td>
                  <td className="py-3 px-4 text-jaggery-600 font-medium">{c.loyaltyPoints}</td>
                  <td className="py-3 px-4 text-earth-400 text-xs">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
