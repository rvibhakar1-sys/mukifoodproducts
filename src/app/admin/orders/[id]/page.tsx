'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatPrice, getStatusColor, getStatusLabel } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

const STATUS_FLOW: Record<string, string[]> = {
  placed: ['confirmed', 'rejected'],
  confirmed: ['packed', 'cancelled'],
  packed: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered'],
  delivered: ['returned'],
}

export default function AdminOrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { showToast } = useToast()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [note, setNote] = useState('')

  const fetchOrder = () => {
    fetch(`/api/orders/${id}`).then(r => r.json()).then(d => { setOrder(d.order); setLoading(false) }).catch(() => setLoading(false))
  }

  useEffect(() => { fetchOrder() }, [id])

  const updateStatus = async (newStatus: string) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note: note || `Status changed to ${newStatus}` }),
      })
      const data = await res.json()
      if (data.order) { setOrder(data.order); showToast(`Order ${getStatusLabel(newStatus)}`); setNote('') }
      else showToast('Failed to update', 'error')
    } catch { showToast('Error updating order', 'error') }
    setUpdating(false)
  }

  if (loading) return <div className="flex items-center justify-center py-16"><div className="w-10 h-10 border-4 border-jaggery-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!order) return <div className="text-center py-16"><p className="text-earth-500">Order not found</p></div>

  const nextStatuses = STATUS_FLOW[order.status] || []

  return (
    <div>
      <button onClick={() => router.back()} className="text-sm text-earth-500 hover:text-jaggery-600 mb-4 flex items-center gap-1">← Back to Orders</button>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-earth-900">Order #{order.orderNumber}</h1>
          <p className="text-sm text-earth-500">Placed {new Date(order.createdAt).toLocaleString('en-IN')}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`status-badge text-base ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
          {order.orderType === 'gift' && <span className="px-3 py-1 bg-jaggery-100 text-jaggery-700 rounded-full text-sm font-medium">🎁 Gift Order</span>}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Actions */}
          {nextStatuses.length > 0 && (
            <div className="p-5 bg-white rounded-xl border border-cream-200">
              <h3 className="text-sm font-semibold text-earth-700 mb-3">Update Status</h3>
              <input type="text" placeholder="Add a note (optional)" value={note} onChange={e => setNote(e.target.value)} className="input-field mb-3" />
              <div className="flex flex-wrap gap-2">
                {nextStatuses.map(s => (
                  <button key={s} onClick={() => updateStatus(s)} disabled={updating}
                    className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${s === 'rejected' || s === 'cancelled' || s === 'returned' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-cane-100 text-cane-700 hover:bg-cane-200'}`}>
                    {updating ? '...' : getStatusLabel(s)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="p-5 bg-white rounded-xl border border-cream-200">
            <h3 className="text-sm font-semibold text-earth-500 uppercase mb-3">Order Items</h3>
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex justify-between py-3 border-b border-cream-100 last:border-0">
                <div>
                  <p className="font-medium text-earth-900">{item.nameEn}</p>
                  <p className="text-xs text-earth-500">{item.nameTa}</p>
                  <p className="text-xs text-earth-400">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                </div>
                <p className="font-bold text-earth-900">{formatPrice(item.total)}</p>
              </div>
            ))}
            <div className="border-t border-cream-200 pt-3 mt-3 space-y-1">
              <div className="flex justify-between text-sm"><span className="text-earth-500">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-sm text-cane-600"><span>Discount</span><span>−{formatPrice(order.discount)}</span></div>}
              <div className="flex justify-between text-sm"><span className="text-earth-500">Delivery</span><span>{order.deliveryCharge === 0 ? 'FREE' : formatPrice(order.deliveryCharge)}</span></div>
              <div className="flex justify-between text-lg font-bold border-t border-cream-200 pt-2"><span>Total</span><span className="text-jaggery-600">{formatPrice(order.total)}</span></div>
            </div>
          </div>

          {/* Status History */}
          <div className="p-5 bg-white rounded-xl border border-cream-200">
            <h3 className="text-sm font-semibold text-earth-500 uppercase mb-3">Status History</h3>
            <div className="space-y-3">
              {order.statusHistory?.map((h: any, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-3 h-3 mt-1.5 rounded-full ${i === order.statusHistory.length - 1 ? 'bg-jaggery-500' : 'bg-cream-300'}`} />
                  <div>
                    <p className="text-sm font-medium text-earth-900">{getStatusLabel(h.status)}</p>
                    <p className="text-xs text-earth-500">{h.note}</p>
                    <p className="text-xs text-earth-400">{new Date(h.createdAt).toLocaleString('en-IN')} {h.changedBy ? `by ${h.changedBy.name}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="p-5 bg-white rounded-xl border border-cream-200">
            <h3 className="text-sm font-semibold text-earth-500 uppercase mb-3">Customer</h3>
            <p className="font-medium text-earth-900">{order.customer?.name || 'Guest'}</p>
            <p className="text-sm text-earth-500">{order.customer?.phone}</p>
            {order.customer?.loyaltyPoints !== undefined && <p className="text-xs text-jaggery-600 mt-1">🏆 {order.customer.loyaltyPoints} loyalty points</p>}
          </div>

          {/* Recipients */}
          {order.recipients?.map((r: any) => (
            <div key={r.id} className="p-5 bg-white rounded-xl border border-cream-200">
              <h3 className="text-sm font-semibold text-earth-500 uppercase mb-3">{r.recipientType === 'sender' ? '📤 Sender' : '📥 Receiver'}</h3>
              <p className="font-medium text-earth-900">{r.name}</p>
              <p className="text-sm text-earth-500">{r.phone}</p>
              {r.line1 && <p className="text-xs text-earth-400 mt-1">{[r.line1, r.line2, r.city, r.state, r.pincode].filter(Boolean).join(', ')}</p>}
              {r.landmark && <p className="text-xs text-earth-400">Landmark: {r.landmark}</p>}
            </div>
          ))}

          {/* Gift Message */}
          {order.giftMessage && (
            <div className="p-5 bg-jaggery-50 rounded-xl border border-jaggery-200">
              <h3 className="text-sm font-semibold text-jaggery-700 mb-2">🎁 Gift Message</h3>
              <p className="text-sm text-jaggery-600 italic">"{order.giftMessage}"</p>
              {order.hidePrices && <p className="text-xs text-jaggery-500 mt-2">⚠️ Prices hidden on packing slip</p>}
            </div>
          )}

          {/* Payment */}
          <div className="p-5 bg-white rounded-xl border border-cream-200">
            <h3 className="text-sm font-semibold text-earth-500 uppercase mb-3">Payment</h3>
            <p className="text-sm text-earth-700">Method: <strong>{order.paymentMethod?.toUpperCase()}</strong></p>
            <p className="text-sm text-earth-700">Status: <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-cane-600' : 'text-orange-600'}`}>{order.paymentStatus?.toUpperCase()}</span></p>
            {order.couponCode && <p className="text-sm text-cane-600 mt-1">🎟️ Coupon: {order.couponCode}</p>}
          </div>

          {/* Delivery */}
          {order.delivery && (
            <div className="p-5 bg-white rounded-xl border border-cream-200">
              <h3 className="text-sm font-semibold text-earth-500 uppercase mb-3">Delivery</h3>
              <p className="text-sm text-earth-700">OTP: <strong className="text-lg tracking-widest">{order.delivery.otp}</strong></p>
              <p className="text-sm text-earth-700">Verified: {order.delivery.otpVerified ? '✅ Yes' : '❌ No'}</p>
              {order.delivery.deliveryPerson && <p className="text-sm text-earth-700 mt-1">Person: {order.delivery.deliveryPerson.name}</p>}
              {order.delivery.trackingId && <p className="text-sm text-earth-700">Tracking: {order.delivery.trackingId}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
