'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/components/ui/Toast'
import { formatPrice, validatePhone, validatePincode, getWhatsAppLink, getOrderWhatsAppMessage } from '@/lib/utils'

export default function CheckoutPage() {
  const router = useRouter()
  const { lang, t } = useLanguage()
  const { items, subtotal, clearCart } = useCart()
  const { showToast } = useToast()

  const [step, setStep] = useState(1)
  const [orderType, setOrderType] = useState<'self' | 'gift'>('self')
  const [loading, setLoading] = useState(false)
  const [orderResult, setOrderResult] = useState<any>(null)

  // Form state
  const [senderName, setSenderName] = useState('')
  const [senderPhone, setSenderPhone] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [receiverName, setReceiverName] = useState('')
  const [receiverPhone, setReceiverPhone] = useState('')
  const [line1, setLine1] = useState('')
  const [line2, setLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('Tamil Nadu')
  const [pincodeVal, setPincodeVal] = useState('')
  const [landmark, setLandmark] = useState('')
  const [giftMessage, setGiftMessage] = useState('')
  const [hidePrices, setHidePrices] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponApplied, setCouponApplied] = useState(false)

  const deliveryCharge = subtotal >= 500 ? 0 : 60
  const total = subtotal - couponDiscount + deliveryCharge

  const applyCoupon = async () => {
    if (!couponCode) return
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.toUpperCase(), subtotal }),
      })
      const data = await res.json()
      if (data.valid) {
        setCouponDiscount(data.coupon.discount)
        setCouponApplied(true)
        showToast(t('couponApplied').replace('{amount}', data.coupon.discount))
      } else {
        showToast(data.error || t('invalidCoupon'), 'error')
      }
    } catch { showToast(t('invalidCoupon'), 'error') }
  }

  const validateStep1 = () => {
    if (!senderName || !senderPhone) { showToast('Name and phone are required', 'error'); return false }
    if (!validatePhone(senderPhone)) { showToast('Enter valid 10-digit phone', 'error'); return false }
    if (orderType === 'gift' && (!receiverName || !receiverPhone)) { showToast('Receiver details required', 'error'); return false }
    if (orderType === 'gift' && !validatePhone(receiverPhone)) { showToast('Enter valid receiver phone', 'error'); return false }
    return true
  }

  const validateStep2 = () => {
    if (!line1 || !city || !pincodeVal) { showToast('Address, city and pincode required', 'error'); return false }
    if (!validatePincode(pincodeVal)) { showToast('Enter valid 6-digit pincode', 'error'); return false }
    return true
  }

  const placeOrder = async () => {
    setLoading(true)
    try {
      const orderData = {
        items: items.map(i => ({ variantId: i.variantId, quantity: i.quantity })),
        orderType,
        senderName, senderPhone, senderEmail,
        receiverName: orderType === 'gift' ? receiverName : senderName,
        receiverPhone: orderType === 'gift' ? receiverPhone : senderPhone,
        receiverAddress: { line1, line2, city, state, pincode: pincodeVal, landmark },
        giftMessage: orderType === 'gift' ? giftMessage : null,
        hidePrices: orderType === 'gift' ? hidePrices : false,
        paymentMethod,
        couponCode: couponApplied ? couponCode.toUpperCase() : null,
      }

      const res = await fetch('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })
      const data = await res.json()

      if (data.success) {
        setOrderResult(data.order)
        clearCart()
        showToast(t('orderPlaced'))
      } else {
        showToast(data.error || 'Failed to place order', 'error')
      }
    } catch { showToast('Something went wrong', 'error') }
    setLoading(false)
  }

  if (items.length === 0 && !orderResult) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-8xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold text-earth-900 mb-3">{t('emptyCart')}</h2>
        <Link href="/products" className="btn-primary mt-4 inline-flex">{t('continueShopping')}</Link>
      </div>
    )
  }

  // Success Screen
  if (orderResult) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="text-8xl mb-6">🎉</div>
        <h2 className="text-3xl font-bold text-earth-900 mb-3">{t('orderPlaced')}</h2>
        <div className="mt-6 p-6 bg-white rounded-2xl border border-cream-200">
          <p className="text-sm text-earth-500">{t('orderNumber')}</p>
          <p className="text-2xl font-bold text-jaggery-600 mt-1">{orderResult.orderNumber}</p>
          <p className="text-sm text-earth-500 mt-3">{t('total')}</p>
          <p className="text-xl font-bold text-earth-900">{formatPrice(orderResult.total)}</p>
          {orderResult.deliveryOTP && (
            <div className="mt-4 p-3 bg-cane-50 rounded-lg">
              <p className="text-xs text-cane-700 font-medium">Delivery OTP (share with receiver)</p>
              <p className="text-2xl font-bold text-cane-700 tracking-widest">{orderResult.deliveryOTP}</p>
            </div>
          )}
          {orderResult.pointsEarned > 0 && (
            <p className="mt-3 text-sm text-jaggery-600">🏆 {t('pointsEarned').replace('{points}', orderResult.pointsEarned)}</p>
          )}
        </div>
        <div className="mt-8 flex flex-col gap-3">
          <Link href={`/track?order=${orderResult.orderNumber}&phone=${senderPhone}`} className="btn-primary w-full py-4 text-lg text-center">
            📦 {t('trackOrder')}
          </Link>
          <a href={getWhatsAppLink('919876543210', getOrderWhatsAppMessage(orderResult.orderNumber, items, orderResult.total))} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-full py-4 text-lg">
            {t('whatsappOrder')}
          </a>
          <Link href="/products" className="btn-secondary w-full py-3 text-center">{t('continueShopping')}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-earth-900 mb-2">{t('checkoutTitle')}</h1>
      <div className="w-16 h-1 bg-gradient-to-r from-jaggery-400 to-jaggery-600 rounded-full mb-8" />

      {/* Steps Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <React.Fragment key={s}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= s ? 'bg-jaggery-600 text-white' : 'bg-cream-200 text-earth-400'}`}>{s}</div>
            {s < 3 && <div className={`w-12 sm:w-20 h-1 rounded-full ${step > s ? 'bg-jaggery-600' : 'bg-cream-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          {/* Step 1: Details */}
          {step === 1 && (
            <div className="animate-fade-in space-y-6">
              {/* Order Type */}
              <div>
                <h3 className="text-lg font-bold text-earth-900 mb-4">{t('orderForWhom')}</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <button onClick={() => setOrderType('self')} className={`p-4 rounded-xl border-2 text-left transition-all ${orderType === 'self' ? 'border-jaggery-500 bg-jaggery-50' : 'border-cream-200 hover:border-jaggery-200'}`}>
                    <span className="text-2xl mb-2 block">🙋</span>
                    <span className="font-bold text-earth-900">{t('forMyself')}</span>
                  </button>
                  <button onClick={() => setOrderType('gift')} className={`p-4 rounded-xl border-2 text-left transition-all ${orderType === 'gift' ? 'border-jaggery-500 bg-jaggery-50' : 'border-cream-200 hover:border-jaggery-200'}`}>
                    <span className="text-2xl mb-2 block">🎁</span>
                    <span className="font-bold text-earth-900">{t('forSomeoneElse')}</span>
                  </button>
                </div>
              </div>

              {/* Sender Details */}
              <div>
                <h3 className="text-lg font-bold text-earth-900 mb-3">{orderType === 'gift' ? t('senderDetails') : t('step1')}</h3>
                <div className="space-y-3">
                  <input type="text" placeholder={t('name') + ' *'} value={senderName} onChange={e => setSenderName(e.target.value)} className="input-field" />
                  <input type="tel" placeholder={t('phone') + ' *'} value={senderPhone} onChange={e => setSenderPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} className="input-field" maxLength={10} />
                  <input type="email" placeholder={t('email')} value={senderEmail} onChange={e => setSenderEmail(e.target.value)} className="input-field" />
                </div>
              </div>

              {/* Receiver Details (Gift) */}
              {orderType === 'gift' && (
                <div className="animate-fade-in">
                  <h3 className="text-lg font-bold text-earth-900 mb-3">{t('receiverDetails')}</h3>
                  <div className="space-y-3">
                    <input type="text" placeholder={t('name') + ' *'} value={receiverName} onChange={e => setReceiverName(e.target.value)} className="input-field" />
                    <input type="tel" placeholder={t('phone') + ' *'} value={receiverPhone} onChange={e => setReceiverPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} className="input-field" maxLength={10} />
                    <textarea placeholder={t('giftMessage')} value={giftMessage} onChange={e => setGiftMessage(e.target.value)} className="input-field" rows={3} />
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={hidePrices} onChange={e => setHidePrices(e.target.checked)} className="w-5 h-5 rounded accent-jaggery-600" />
                      <span className="text-sm text-earth-700">{t('hidePricesToggle')}</span>
                    </label>
                  </div>
                </div>
              )}

              <button onClick={() => { if (validateStep1()) setStep(2) }} className="btn-primary w-full py-4 text-lg">
                {t('next')} →
              </button>
            </div>
          )}

          {/* Step 2: Address */}
          {step === 2 && (
            <div className="animate-fade-in space-y-4">
              <h3 className="text-lg font-bold text-earth-900 mb-3">{t('step2')}</h3>
              <input type="text" placeholder={t('addressLine1') + ' *'} value={line1} onChange={e => setLine1(e.target.value)} className="input-field" />
              <input type="text" placeholder={t('addressLine2')} value={line2} onChange={e => setLine2(e.target.value)} className="input-field" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder={t('city') + ' *'} value={city} onChange={e => setCity(e.target.value)} className="input-field" />
                <input type="text" placeholder={t('state')} value={state} onChange={e => setState(e.target.value)} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder={t('pincode') + ' *'} value={pincodeVal} onChange={e => setPincodeVal(e.target.value.replace(/\D/g, '').slice(0, 6))} className="input-field" maxLength={6} />
                <input type="text" placeholder={t('landmark')} value={landmark} onChange={e => setLandmark(e.target.value)} className="input-field" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-4">← {t('back')}</button>
                <button onClick={() => { if (validateStep2()) setStep(3) }} className="btn-primary flex-1 py-4">{t('next')} →</button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="animate-fade-in space-y-6">
              <h3 className="text-lg font-bold text-earth-900 mb-3">{t('paymentMethod')}</h3>
              <div className="space-y-3">
                {[
                  { id: 'cod', label: t('cod'), icon: '💵', desc: lang === 'en' ? 'Pay when you receive' : 'பெறும்போது பணம் செலுத்துங்கள்' },
                  { id: 'upi', label: t('upi'), icon: '📱', desc: lang === 'en' ? 'Pay via UPI' : 'UPI மூலம் செலுத்துங்கள்' },
                  { id: 'online', label: t('onlinePayment'), icon: '💳', desc: lang === 'en' ? 'Credit/Debit Card' : 'கிரெடிட்/டெபிட் கார்டு' },
                ].map(pm => (
                  <button key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                    className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 text-left transition-all ${paymentMethod === pm.id ? 'border-jaggery-500 bg-jaggery-50' : 'border-cream-200 hover:border-jaggery-200'}`}>
                    <span className="text-3xl">{pm.icon}</span>
                    <div><p className="font-bold text-earth-900">{pm.label}</p><p className="text-xs text-earth-500">{pm.desc}</p></div>
                  </button>
                ))}
              </div>

              {/* Coupon */}
              <div>
                <h4 className="text-sm font-semibold text-earth-700 mb-2">{t('applyCoupon')}</h4>
                <div className="flex gap-2">
                  <input type="text" placeholder={t('couponCode')} value={couponCode} onChange={e => setCouponCode(e.target.value)} className="input-field flex-1" disabled={couponApplied} />
                  {couponApplied ? (
                    <button onClick={() => { setCouponApplied(false); setCouponDiscount(0); setCouponCode('') }} className="btn-secondary px-4">✕</button>
                  ) : (
                    <button onClick={applyCoupon} className="btn-primary px-6">{t('apply')}</button>
                  )}
                </div>
                {couponApplied && <p className="mt-2 text-sm text-cane-600 font-medium">✓ {t('couponApplied').replace('{amount}', String(couponDiscount))}</p>}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1 py-4">← {t('back')}</button>
                <button onClick={placeOrder} disabled={loading} className="btn-primary flex-1 py-4 text-lg">
                  {loading ? t('loading') : `${t('placeOrder')} — ${formatPrice(total)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 p-6 bg-white rounded-xl border border-cream-200">
            <h3 className="text-lg font-bold text-earth-900 mb-4">{lang === 'en' ? 'Order Summary' : 'ஆர்டர் சுருக்கம்'}</h3>
            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={item.variantId} className="flex justify-between text-sm">
                  <span className="text-earth-600">{lang === 'en' ? item.nameEn : item.nameTa} ({lang === 'en' ? item.variantNameEn : item.variantNameTa}) × {item.quantity}</span>
                  <span className="font-medium text-earth-900">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-cream-200 pt-3 space-y-2">
              <div className="flex justify-between text-sm text-earth-600"><span>{t('subtotal')}</span><span>{formatPrice(subtotal)}</span></div>
              {couponDiscount > 0 && <div className="flex justify-between text-sm text-cane-600"><span>Discount</span><span>−{formatPrice(couponDiscount)}</span></div>}
              <div className="flex justify-between text-sm text-earth-600"><span>{t('deliveryCharges')}</span><span>{deliveryCharge === 0 ? <span className="text-cane-600 font-medium">FREE</span> : formatPrice(deliveryCharge)}</span></div>
              <div className="border-t border-cream-200 pt-2 flex justify-between text-lg"><span className="font-bold">{t('total')}</span><span className="font-bold text-jaggery-600">{formatPrice(total)}</span></div>
            </div>
            {orderType === 'gift' && (
              <div className="mt-4 p-3 bg-jaggery-50 rounded-lg">
                <p className="text-xs font-medium text-jaggery-700">🎁 {lang === 'en' ? 'Gift Order' : 'பரிசு ஆர்டர்'}</p>
                {giftMessage && <p className="text-xs text-jaggery-600 mt-1 italic">"{giftMessage}"</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
