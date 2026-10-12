'use client'

import React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const { lang, t } = useLanguage()
  const { items, removeItem, updateQuantity, subtotal } = useCart()

  const freeDeliveryThreshold = 500
  const amountForFree = freeDeliveryThreshold - subtotal

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-8xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold text-earth-900 mb-3">{t('emptyCart')}</h2>
        <p className="text-earth-500 mb-8">{lang === 'en' ? 'Looks like you haven\'t added anything yet' : 'நீங்கள் இன்னும் எதையும் சேர்க்கவில்லை'}</p>
        <Link href="/products" className="btn-primary text-lg px-8 py-4">{t('continueShopping')} →</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-earth-900 mb-2">{t('yourCart')}</h1>
      <div className="w-16 h-1 bg-gradient-to-r from-jaggery-400 to-jaggery-600 rounded-full mb-8" />

      {/* Free Delivery Banner */}
      {amountForFree > 0 ? (
        <div className="mb-6 p-4 bg-gradient-to-r from-cane-50 to-cane-100 border border-cane-200 rounded-xl text-center">
          <p className="text-sm font-medium text-cane-700">🚚 {t('freeDeliveryBanner').replace('{amount}', String(Math.ceil(amountForFree)))}</p>
          <div className="mt-2 w-full bg-cane-200 rounded-full h-2">
            <div className="bg-cane-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, (subtotal / freeDeliveryThreshold) * 100)}%` }} />
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-gradient-to-r from-cane-500 to-cane-600 rounded-xl text-center text-white font-medium">
          {t('freeDelivery')}
        </div>
      )}

      {/* Cart Items */}
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.variantId} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-cream-200">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-jaggery-100 to-cream-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
              🫕
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-earth-900 truncate">{lang === 'en' ? item.nameEn : item.nameTa}</h3>
              <p className="text-sm text-earth-500">{lang === 'en' ? item.variantNameEn : item.variantNameTa}</p>
              <p className="text-lg font-bold text-jaggery-600 mt-1">{formatPrice(item.price)}</p>
            </div>
            <div className="flex items-center border-2 border-cream-200 rounded-lg overflow-hidden">
              <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="px-3 py-2 text-earth-600 hover:bg-cream-50 font-bold">−</button>
              <span className="px-3 py-2 text-earth-900 font-bold min-w-[40px] text-center">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="px-3 py-2 text-earth-600 hover:bg-cream-50 font-bold">+</button>
            </div>
            <div className="text-right">
              <p className="font-bold text-earth-900">{formatPrice(item.price * item.quantity)}</p>
              <button onClick={() => removeItem(item.variantId)} className="text-xs text-red-500 hover:text-red-700 mt-1">{t('remove')}</button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 p-6 bg-white rounded-xl border border-cream-200">
        <div className="flex justify-between text-earth-600 mb-3">
          <span>{t('subtotal')}</span>
          <span className="font-semibold">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-earth-600 mb-3">
          <span>{t('deliveryCharges')}</span>
          <span className="font-semibold">{subtotal >= freeDeliveryThreshold ? <span className="text-cane-600">FREE</span> : `${lang === 'en' ? 'Calculated at checkout' : 'செக்அவுட்டில் கணக்கிடப்படும்'}`}</span>
        </div>
        <div className="border-t border-cream-200 pt-3 flex justify-between text-lg">
          <span className="font-bold text-earth-900">{t('total')}</span>
          <span className="font-bold text-jaggery-600">{formatPrice(subtotal)}</span>
        </div>
        <Link href="/checkout" className="btn-primary w-full mt-6 text-lg py-4 text-center block">
          {t('checkout')} →
        </Link>
        <Link href="/products" className="btn-secondary w-full mt-3 text-center block">
          {t('continueShopping')}
        </Link>
      </div>
    </div>
  )
}
