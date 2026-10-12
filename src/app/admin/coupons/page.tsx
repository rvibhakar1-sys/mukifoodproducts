'use client'

import React, { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/Toast'

export default function AdminCouponsPage() {
  const { showToast } = useToast()
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ code: '', descriptionEn: '', discountType: 'percentage', discountValue: 10, minOrderAmount: 0, maxDiscount: 0, usageLimit: 100 })

  useEffect(() => { fetch('/api/admin/coupons').then(r => r.json()).then(d => { setCoupons(d.coupons || []); setLoading(false) }) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/admin/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    if (data.coupon) { showToast('Coupon created!'); setShowForm(false); setCoupons([data.coupon, ...coupons]) }
    else showToast(data.error || 'Failed', 'error')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-earth-900">Coupons</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">{showForm ? '✕ Cancel' : '+ Add Coupon'}</button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded-xl border border-cream-200 animate-fade-in space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Code (e.g. SAVE10)" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input-field" required />
            <input type="text" placeholder="Description" value={form.descriptionEn} onChange={e => setForm({ ...form, descriptionEn: e.target.value })} className="input-field" />
          </div>
          <div className="grid sm:grid-cols-4 gap-4">
            <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })} className="input-field">
              <option value="percentage">Percentage</option><option value="flat">Flat Amount</option>
            </select>
            <input type="number" placeholder="Value" value={form.discountValue} onChange={e => setForm({ ...form, discountValue: parseFloat(e.target.value) })} className="input-field" />
            <input type="number" placeholder="Min Order ₹" value={form.minOrderAmount} onChange={e => setForm({ ...form, minOrderAmount: parseFloat(e.target.value) })} className="input-field" />
            <input type="number" placeholder="Max Discount ₹" value={form.maxDiscount} onChange={e => setForm({ ...form, maxDiscount: parseFloat(e.target.value) })} className="input-field" />
          </div>
          <button type="submit" className="btn-primary">Create Coupon</button>
        </form>
      )}
      <div className="bg-white rounded-xl border border-cream-200 overflow-hidden">
        {loading ? <div className="p-8 text-center"><div className="w-8 h-8 border-4 border-jaggery-500 border-t-transparent rounded-full animate-spin mx-auto" /></div> : (
          <table className="w-full text-sm">
            <thead><tr className="bg-cream-50 border-b border-cream-200">
              <th className="text-left py-3 px-4 text-earth-500 font-medium">Code</th>
              <th className="text-left py-3 px-4 text-earth-500 font-medium">Discount</th>
              <th className="text-left py-3 px-4 text-earth-500 font-medium">Min Order</th>
              <th className="text-left py-3 px-4 text-earth-500 font-medium">Used</th>
              <th className="text-left py-3 px-4 text-earth-500 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {coupons.map((c: any) => (
                <tr key={c.id} className="border-b border-cream-100">
                  <td className="py-3 px-4 font-bold text-jaggery-600">{c.code}</td>
                  <td className="py-3 px-4">{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}{c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ''}</td>
                  <td className="py-3 px-4">₹{c.minOrderAmount}</td>
                  <td className="py-3 px-4">{c.usedCount}/{c.usageLimit || '∞'}</td>
                  <td className="py-3 px-4"><span className={`status-badge ${c.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.active ? 'Active' : 'Inactive'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
