'use client'

import React, { useEffect, useState } from 'react'

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetch('/api/admin/enquiries').then(r => r.json()).then(d => { setEnquiries(d.enquiries || []); setLoading(false) }) }, [])

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-jaggery-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-earth-900 mb-6">Wholesale Enquiries</h1>
      <div className="space-y-4">
        {enquiries.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-cream-200"><div className="text-5xl mb-3">📋</div><p className="text-earth-500">No enquiries yet</p></div>
        ) : enquiries.map((e: any) => (
          <div key={e.id} className="p-5 bg-white rounded-xl border border-cream-200">
            <div className="flex justify-between items-start mb-3">
              <div><p className="font-bold text-earth-900">{e.name}</p><p className="text-sm text-earth-500">{e.phone} {e.email && `• ${e.email}`}</p></div>
              <span className={`status-badge ${e.status === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{e.status}</span>
            </div>
            {e.businessName && <p className="text-sm text-earth-600">🏢 {e.businessName} ({e.businessType})</p>}
            <p className="text-sm text-earth-700 mt-2">{e.message}</p>
            {e.quantity && <p className="text-xs text-earth-500 mt-1">Qty: {e.quantity}</p>}
            <p className="text-xs text-earth-400 mt-2">{new Date(e.createdAt).toLocaleString('en-IN')}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
