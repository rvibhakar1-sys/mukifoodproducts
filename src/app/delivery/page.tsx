'use client'

import React, { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

export default function DeliveryPortalPage() {
  const { showToast } = useToast()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [otpMap, setOtpMap] = useState<Record<string, string>>({})
  const [submittingMap, setSubmittingMap] = useState<Record<string, boolean>>({})

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/delivery/orders')
      const data = await res.json()
      if (data.orders) {
        setOrders(data.orders)
      }
    } catch {
      showToast('Failed to load delivery orders', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleVerifyOtp = async (orderId: string) => {
    const otp = otpMap[orderId]?.trim()
    if (!otp) {
      showToast('Please enter the delivery OTP provided by the customer', 'error')
      return
    }

    setSubmittingMap((prev) => ({ ...prev, [orderId]: true }))
    try {
      const res = await fetch('/api/delivery/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, otp }),
      })
      const data = await res.json()
      if (res.ok) {
        showToast('✅ Order marked as delivered successfully!', 'success')
        fetchOrders()
      } else {
        showToast(data.error || 'Invalid OTP code', 'error')
      }
    } catch {
      showToast('Failed to verify OTP', 'error')
    } finally {
      setSubmittingMap((prev) => ({ ...prev, [orderId]: false }))
    }
  }

  return (
    <div className="min-h-screen bg-earth-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-earth-100 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚚</span>
              <h1 className="text-2xl font-bold text-earth-900">Delivery Partner Portal</h1>
            </div>
            <p className="text-sm text-earth-600 mt-1">
              Mukifood Products • Delivery verification & OTP confirmation
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-cane-600 hover:bg-cane-700 text-white font-medium text-sm rounded-xl transition"
          >
            ↻ Refresh Orders
          </button>
        </div>

        {/* Order list */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-earth-100">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-cane-600 border-t-transparent rounded-full mb-3" />
            <p className="text-earth-600">Loading delivery tasks...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-earth-100">
            <span className="text-5xl block mb-3">📦</span>
            <h3 className="text-lg font-bold text-earth-900">No Pending Deliveries</h3>
            <p className="text-sm text-earth-600 mt-1">
              All assigned orders have been completed or there are no current deliveries out.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const address = [
                order.addressLine1,
                order.addressLine2,
                order.landmark,
                order.city,
                order.state,
                order.pincode,
              ]
                .filter(Boolean)
                .join(', ')

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-earth-100 p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-earth-100 pb-3 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-earth-900 text-lg">
                          #{order.orderNumber}
                        </span>
                        <span className="text-xs px-2.5 py-1 rounded-full uppercase font-semibold bg-jaggery-100 text-jaggery-800">
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-xs text-earth-500">
                        {new Date(order.createdAt).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-lg font-bold text-cane-700">
                        {formatPrice(order.total)}
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-earth-100 text-earth-700 uppercase">
                        {order.paymentMethod} • {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Customer / Recipient Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-earth-50 p-4 rounded-xl">
                    <div>
                      <h4 className="font-semibold text-earth-900 mb-1">Customer & Address:</h4>
                      <p className="font-medium text-earth-800">{order.customerName}</p>
                      <p className="text-earth-600 text-xs mt-1 leading-relaxed">{address}</p>
                      <div className="mt-3 flex gap-2">
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cane-600 hover:bg-cane-700 text-white rounded-lg text-xs font-medium transition"
                        >
                          📞 Call Customer ({order.customerPhone})
                        </a>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-earth-900 mb-1">Items to Deliver:</h4>
                      <ul className="space-y-1 text-xs text-earth-700">
                        {order.items?.map((item: any) => (
                          <li key={item.id} className="flex justify-between">
                            <span>
                              {item.nameEn} ({item.variantWeight}) × {item.quantity}
                            </span>
                            <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                      {order.deliveryInstructions && (
                        <div className="mt-2 text-xs bg-cream-100 text-cream-950 p-2 rounded border border-cream-300">
                          <strong>Note:</strong> {order.deliveryInstructions}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* OTP Verification Box */}
                  <div className="pt-2 border-t border-earth-100 flex flex-col sm:flex-row items-center gap-3">
                    <div className="w-full sm:flex-1">
                      <label className="block text-xs font-semibold text-earth-700 mb-1">
                        Ask Customer for 4-digit Delivery OTP:
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="e.g. 1234"
                        value={otpMap[order.id] || ''}
                        onChange={(e) =>
                          setOtpMap((prev) => ({ ...prev, [order.id]: e.target.value }))
                        }
                        className="w-full px-4 py-2 border border-earth-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cane-500 font-mono tracking-widest text-center sm:text-left text-lg font-bold"
                      />
                    </div>
                    <button
                      onClick={() => handleVerifyOtp(order.id)}
                      disabled={submittingMap[order.id]}
                      className="w-full sm:w-auto px-6 py-2.5 mt-auto bg-cane-700 hover:bg-cane-800 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition shadow-sm"
                    >
                      {submittingMap[order.id] ? 'Verifying...' : '✓ Confirm & Mark Delivered'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
