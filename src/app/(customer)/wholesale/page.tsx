'use client'

import React, { useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { useToast } from '@/components/ui/Toast'

export default function WholesalePage() {
  const { lang, t } = useLanguage()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', businessName: '', businessType: '', message: '', products: '', quantity: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.message) { showToast('Name, phone and message required', 'error'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/wholesale', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (data.success) { setSubmitted(true); showToast(t('enquirySubmitted')) }
      else showToast(data.error || 'Failed', 'error')
    } catch { showToast(t('error'), 'error') }
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="text-8xl mb-6">🤝</div>
        <h2 className="text-3xl font-bold text-earth-900 mb-3">{t('enquirySubmitted')}</h2>
        <p className="text-earth-500">{lang === 'en' ? 'Our team will reach out to you within 24 hours.' : 'எங்கள் குழு 24 மணி நேரத்தில் உங்களை தொடர்பு கொள்ளும்.'}</p>
        <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-8 inline-flex">Chat on WhatsApp</a>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-earth-900 mb-2">{t('wholesaleTitle')}</h1>
      <div className="w-16 h-1 bg-gradient-to-r from-jaggery-400 to-jaggery-600 rounded-full mb-4" />
      <p className="text-earth-500 mb-8">{lang === 'en' ? 'For shops, caterers, temples, and bulk buyers. Fill in the form and we\'ll get back to you with the best prices.' : 'கடைகள், சமையல்காரர்கள், கோயில்கள் மற்றும் மொத்த வாங்குபவர்களுக்கு.'}</p>

      <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-xl border border-cream-200">
        <input type="text" placeholder={`${t('name')} *`} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required />
        <input type="tel" placeholder={`${t('phone')} *`} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} className="input-field" required maxLength={10} />
        <input type="email" placeholder={t('email')} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" />
        <input type="text" placeholder={t('businessName')} value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} className="input-field" />
        <select value={form.businessType} onChange={e => setForm({ ...form, businessType: e.target.value })} className="input-field">
          <option value="">{t('businessType')}</option>
          <option value="shop">{t('shop')}</option>
          <option value="caterer">{t('caterer')}</option>
          <option value="temple">{t('temple')}</option>
          <option value="other">{t('other')}</option>
        </select>
        <input type="text" placeholder={lang === 'en' ? 'Products interested in' : 'ஆர்வமான பொருட்கள்'} value={form.products} onChange={e => setForm({ ...form, products: e.target.value })} className="input-field" />
        <input type="text" placeholder={t('approximateQty')} value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="input-field" />
        <textarea placeholder={`${t('message')} *`} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="input-field" rows={4} required />
        <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg">{loading ? t('loading') : t('submit')}</button>
      </form>
    </div>
  )
}
