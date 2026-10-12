'use client'

import React, { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { useToast } from '@/components/ui/Toast'
import { formatPrice, getStatusLabel, getStatusColor, validatePhone } from '@/lib/utils'

const STATUS_STEPS = ['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered']

export default function TrackPage() {
  const searchParams = useSearchParams()
  const { lang, t } = useLanguage()
  const { showToast } = useToast()
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '')
  const [phone, setPhone] = useState(searchParams.get('phone') || '')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const trackOrder = async () => {
    if (!orderNumber && !phone) { showToast('Enter order ID or phone', 'error'); return }
    setLoading(true)
    setSearched(true)
    try {
      const params = new URLSearchParams()
      if (orderNumber) params.set('orderNumber', orderNumber)
      if (phone) params.set('phone', phone)
      const res = await fetch(`/api/orders?${params}`)
      const data = await res.json()
      if (data.orders?.length > 0) {
        setOrder(data.orders[0])
      } else {
        setOrder(null)
        showToast(lang === 'en' ? 'Order not found' : 'ஆர்டர் கிடைக்கவில்லை', 'error')
      }
    } catch { showToast(t('error'), 'error') }
    setLoading(false)
  }

  const currentStepIndex = order ? STATUS_STEPS.indexOf(order.status) : -1
  const isCancelled = order?.status === 'cancelled' || order?.status === 'rejected' || order?.status === 'returned'

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-earth-900 mb-2">{t('trackTitle')}</h1>
      <div className="w-16 h-1 bg-gradient-to-r from-jaggery-400 to-jaggery-600 rounded-full mb-8" />

      {/* Search Form */}
      <div className="p-6 bg-white rounded-xl border border-cream-200 mb-8">
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <input type="text" placeholder={t('enterOrderId')} value={orderNumber} onChange={e => setOrderNumber(e.target.value)} className="input-field" />
          <input type="tel" placeholder={t('enterPhone')} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} className="input-field" maxLength={10} />
        </div>
        <button onClick={trackOrder} disabled={loading} className="btn-primary w-full py-4 text-lg">
          {loading ? t('loading') : `📦 ${t('track')}`}
        </button>
      </div>

      {/* Order Details */}
      {order && (
        <div className="animate-fade-in">
          {/* Order Header */}
          <div className="p-6 bg-white rounded-xl border border-cream-200 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-sm text-earth-500">{t('orderNumber')}</p>
                <p className="text-xl font-bold text-jaggery-600">{order.orderNumber}</p>
              </div>
              <span className={`status-badge ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div><p className="text-earth-500">{t('total')}</p><p className="font-bold text-earth-900">{formatPrice(order.total)}</p></div>
              <div><p className="text-earth-500">Payment</p><p className="font-bold text-earth-900">{order.paymentMethod?.toUpperCase()}</p></div>
              <div><p className="text-earth-500">Type</p><p className="font-bold text-earth-900">{order.orderType === 'gift' ? '🎁 Gift' : '🙋 Self'}</p></div>
              <div><p className="text-earth-500">Date</p><p className="font-bold text-earth-900">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p></div>
            </div>
          </div>

          {/* Visual Timeline */}
          {!isCancelled && (
            <div className="p-6 bg-white rounded-xl border border-cream-200 mb-6">
              <h3 className="text-lg font-bold text-earth-900 mb-6">{t('orderTimeline')}</h3>
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 right-0 top-4 h-1 bg-cream-200 z-0" />
                <div className="absolute left-0 top-4 h-1 bg-cane-500 z-0 transition-all duration-500" style={{ width: `${currentStepIndex >= 0 ? (currentStepIndex / (STATUS_STEPS.length - 1)) * 100 : 0}%` }} />
                {STATUS_STEPS.map((s, i) => {
                  const statusItem = order.statusHistory?.find((h: any) => h.status === s)
                  const isActive = i <= currentStepIndex
                  const isCurrent = i === currentStepIndex
                  return (
                    <div key={s} className="relative z-10 flex flex-col items-center text-center" style={{ width: '20%' }}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${isActive ? (isCurrent ? 'bg-jaggery-500 text-white shadow-lg shadow-jaggery-200 scale-110' : 'bg-cane-500 text-white') : 'bg-cream-200 text-earth-400'}`}>
                        {isActive ? '✓' : i + 1}
                      </div>
                      <p className={`mt-2 text-xs font-medium ${isActive ? 'text-earth-900' : 'text-earth-400'}`}>{t(s === 'out_for_delivery' ? 'outForDelivery' : s)}</p>
                      {statusItem && <p className="text-[10px] text-earth-400 mt-0.5">{new Date(statusItem.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</p>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl mb-6 text-center">
              <p className="text-xl font-bold text-red-700">❌ {getStatusLabel(order.status)}</p>
              {order.statusHistory?.find((h: any) => h.status === order.status)?.note && (
                <p className="text-sm text-red-600 mt-2">{order.statusHistory.find((h: any) => h.status === order.status).note}</p>
              )}
            </div>
          )}

          {/* Items */}
          <div className="p-6 bg-white rounded-xl border border-cream-200 mb-6">
            <h3 className="text-sm font-semibold text-earth-500 uppercase mb-3">Items</h3>
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex justify-between py-2 border-b border-cream-100 last:border-0">
                <span className="text-sm text-earth-700">{lang === 'en' ? item.nameEn : item.nameTa} × {item.quantity}</span>
                <span className="text-sm font-medium text-earth-900">{formatPrice(item.total)}</span>
              </div>
            ))}
          </div>

          {/* Gift Info */}
          {order.orderType === 'gift' && order.giftMessage && (
            <div className="p-6 bg-jaggery-50 rounded-xl border border-jaggery-200 mb-6">
              <p className="text-sm font-medium text-jaggery-700">🎁 Gift Message</p>
              <p className="text-sm text-jaggery-600 mt-1 italic">"{order.giftMessage}"</p>
            </div>
          )}

          {/* Recipients */}
          {order.recipients?.length > 0 && (
            <div className="p-6 bg-white rounded-xl border border-cream-200 mb-6">
              {order.recipients.map((r: any) => (
                <div key={r.id} className="mb-3 last:mb-0">
                  <p className="text-xs font-semibold text-earth-500 uppercase">{r.recipientType}</p>
                  <p className="text-sm font-medium text-earth-900">{r.name} — {r.phone}</p>
                  {r.line1 && <p className="text-xs text-earth-500">{[r.line1, r.line2, r.city, r.state, r.pincode].filter(Boolean).join(', ')}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Delivery OTP */}
          {order.delivery?.otp && order.status !== 'delivered' && (
            <div className="p-6 bg-cane-50 rounded-xl border border-cane-200 mb-6 text-center">
              <p className="text-sm font-medium text-cane-700">🔑 Delivery OTP</p>
              <p className="text-3xl font-bold text-cane-700 tracking-widest mt-2">{order.delivery.otp}</p>
              <p className="text-xs text-cane-600 mt-1">Share this OTP with the delivery person</p>
            </div>
          )}

          {/* Share / Reorder */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a href={`https://wa.me/?text=${encodeURIComponent(`Track my MUKIFOOD order: ${window.location.origin}/track?order=${order.orderNumber}`)}`} target="_blank" rel="noopener noreferrer" className="btn-whatsapp flex-1 py-3 text-center">
              {t('shareTracking')}
            </a>
            <Link href="/products" className="btn-secondary flex-1 py-3 text-center">
              {t('reorder')}
            </Link>
          </div>
        </div>
      )}

      {searched && !order && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-lg text-earth-500">{lang === 'en' ? 'No order found. Check your details.' : 'ஆர்டர் கிடைக்கவில்லை.'}</p>
        </div>
      )}
    </div>
  )
}
