'use client'

import React, { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/Toast'

export default function AdminSettingsPage() {
  const { showToast } = useToast()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => {
      const map: Record<string, string> = {}
      ;(d.settings || []).forEach((s: any) => { map[s.key] = s.value })
      setSettings(map)
      setLoading(false)
    })
  }, [])

  const updateSetting = async (key: string, value: string) => {
    setSettings({ ...settings, [key]: value })
    await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value }) })
  }

  const handleSave = () => showToast('Settings saved!')

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-jaggery-500 border-t-transparent rounded-full animate-spin" /></div>

  const fields = [
    { key: 'store_name', label: 'Store Name', type: 'text' },
    { key: 'store_phone', label: 'Store Phone', type: 'text' },
    { key: 'store_email', label: 'Store Email', type: 'email' },
    { key: 'store_upi_id', label: 'UPI ID', type: 'text' },
    { key: 'store_gst', label: 'GST Number', type: 'text' },
    { key: 'whatsapp_number', label: 'WhatsApp Number', type: 'text' },
    { key: 'free_delivery_threshold', label: 'Free Delivery Threshold (₹)', type: 'number' },
    { key: 'default_delivery_charge', label: 'Default Delivery Charge (₹)', type: 'number' },
    { key: 'loyalty_points_per_100', label: 'Loyalty Points per ₹100', type: 'number' },
    { key: 'gst_rate', label: 'GST Rate (%)', type: 'number' },
  ]

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-earth-900 mb-6">Settings</h1>
      <div className="max-w-2xl space-y-6">
        <div className="p-6 bg-white rounded-xl border border-cream-200 space-y-4">
          <h2 className="text-lg font-bold text-earth-900">Store Settings</h2>
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-earth-600 mb-1">{f.label}</label>
              <input type={f.type} value={settings[f.key] || ''} onChange={e => updateSetting(f.key, e.target.value)} className="input-field" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-earth-600 mb-1">Store Status</label>
            <button onClick={() => updateSetting('store_open', settings.store_open === 'true' ? 'false' : 'true')}
              className={`px-6 py-2 rounded-xl font-medium transition-all ${settings.store_open === 'true' ? 'bg-cane-500 text-white' : 'bg-red-500 text-white'}`}>
              {settings.store_open === 'true' ? '🟢 Store is OPEN' : '🔴 Store is CLOSED'}
            </button>
          </div>
        </div>
        <button onClick={handleSave} className="btn-primary w-full py-3">Save Settings</button>
      </div>
    </div>
  )
}
