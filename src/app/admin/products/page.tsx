'use client'

import React, { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

export default function AdminProductsPage() {
  const { showToast } = useToast()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nameEn: '', nameTa: '', categoryId: '', descriptionEn: '', descriptionTa: '', ingredientsEn: '', ingredientsTa: '', shelfLife: '', featured: false, gstPercent: 0, variants: [{ nameEn: '250g', nameTa: '250 கிராம்', price: 0, weight: 250, stock: 0 }] })

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      fetch('/api/admin/products').then(r => r.json()),
      fetch('/api/admin/categories').then(r => r.json()),
    ]).then(([p, c]) => { setProducts(p.products || []); setCategories(c.categories || []); setLoading(false) })
  }

  useEffect(() => { fetchData() }, [])

  const addVariant = () => setForm({ ...form, variants: [...form.variants, { nameEn: '', nameTa: '', price: 0, weight: 0, stock: 0 }] })
  const removeVariant = (i: number) => setForm({ ...form, variants: form.variants.filter((_, idx) => idx !== i) })
  const updateVariant = (i: number, field: string, value: any) => {
    const v = [...form.variants]; (v[i] as any)[field] = value; setForm({ ...form, variants: v })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nameEn || !form.categoryId) { showToast('Name and category required', 'error'); return }
    try {
      const res = await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (data.product) { showToast('Product created!'); setShowForm(false); fetchData(); setForm({ nameEn: '', nameTa: '', categoryId: '', descriptionEn: '', descriptionTa: '', ingredientsEn: '', ingredientsTa: '', shelfLife: '', featured: false, gstPercent: 0, variants: [{ nameEn: '250g', nameTa: '250 கிராம்', price: 0, weight: 250, stock: 0 }] }) }
      else showToast(data.error || 'Failed', 'error')
    } catch { showToast('Error creating product', 'error') }
  }

  const toggleProduct = async (id: string, active: boolean) => {
    await fetch(`/api/admin/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !active }) })
    fetchData()
    showToast(active ? 'Product deactivated' : 'Product activated')
  }

  const toggleFeatured = async (id: string, featured: boolean) => {
    await fetch(`/api/admin/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ featured: !featured }) })
    fetchData()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-earth-900">Products</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">{showForm ? '✕ Cancel' : '+ Add Product'}</button>
      </div>

      {/* Add Product Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded-xl border border-cream-200 animate-fade-in space-y-4">
          <h3 className="text-lg font-bold text-earth-900">New Product</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Product Name (English) *" value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} className="input-field" required />
            <input type="text" placeholder="பொருளின் பெயர் (Tamil)" value={form.nameTa} onChange={e => setForm({ ...form, nameTa: e.target.value })} className="input-field" />
          </div>
          <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="input-field" required>
            <option value="">Select Category *</option>
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
          </select>
          <div className="grid sm:grid-cols-2 gap-4">
            <textarea placeholder="Description (English)" value={form.descriptionEn} onChange={e => setForm({ ...form, descriptionEn: e.target.value })} className="input-field" rows={3} />
            <textarea placeholder="விளக்கம் (Tamil)" value={form.descriptionTa} onChange={e => setForm({ ...form, descriptionTa: e.target.value })} className="input-field" rows={3} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Ingredients (EN)" value={form.ingredientsEn} onChange={e => setForm({ ...form, ingredientsEn: e.target.value })} className="input-field" />
            <input type="text" placeholder="Shelf Life" value={form.shelfLife} onChange={e => setForm({ ...form, shelfLife: e.target.value })} className="input-field" />
          </div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="w-5 h-5 accent-jaggery-600" /><span className="text-sm">Featured Product</span></label>

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between mb-2"><h4 className="text-sm font-bold text-earth-700">Variants</h4><button type="button" onClick={addVariant} className="text-sm text-jaggery-600 font-medium">+ Add Variant</button></div>
            {form.variants.map((v, i) => (
              <div key={i} className="flex gap-2 mb-2 items-center">
                <input type="text" placeholder="Name (250g)" value={v.nameEn} onChange={e => updateVariant(i, 'nameEn', e.target.value)} className="input-field flex-1" />
                <input type="number" placeholder="Price" value={v.price || ''} onChange={e => updateVariant(i, 'price', parseFloat(e.target.value) || 0)} className="input-field w-24" />
                <input type="number" placeholder="Weight(g)" value={v.weight || ''} onChange={e => updateVariant(i, 'weight', parseFloat(e.target.value) || 0)} className="input-field w-24" />
                <input type="number" placeholder="Stock" value={v.stock || ''} onChange={e => updateVariant(i, 'stock', parseInt(e.target.value) || 0)} className="input-field w-20" />
                {form.variants.length > 1 && <button type="button" onClick={() => removeVariant(i)} className="text-red-500 text-xl font-bold">×</button>}
              </div>
            ))}
          </div>
          <button type="submit" className="btn-primary w-full py-3">Create Product</button>
        </form>
      )}

      {/* Products List */}
      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 animate-shimmer rounded-xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {products.map((p: any) => (
            <div key={p.id} className={`p-4 bg-white rounded-xl border border-cream-200 flex items-center gap-4 ${!p.active ? 'opacity-50' : ''}`}>
              <div className="w-14 h-14 bg-gradient-to-br from-jaggery-100 to-cream-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🫕</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-earth-900 truncate">{p.nameEn}</h3>
                  {p.featured && <span className="text-xs px-2 py-0.5 bg-jaggery-100 text-jaggery-600 rounded-full">⭐ Featured</span>}
                  {!p.active && <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">Inactive</span>}
                </div>
                <p className="text-xs text-earth-500">{p.nameTa} • {p.category?.nameEn}</p>
                <div className="flex gap-2 mt-1">
                  {p.variants?.map((v: any) => (
                    <span key={v.id} className="text-xs text-earth-600">{v.nameEn}: {formatPrice(v.price)} ({v.stock} stock)</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => toggleFeatured(p.id, p.featured)} className="text-xs px-3 py-1.5 rounded-lg bg-cream-100 text-earth-600 hover:bg-cream-200" title="Toggle featured">{p.featured ? '⭐' : '☆'}</button>
                <button onClick={() => toggleProduct(p.id, p.active)} className={`text-xs px-3 py-1.5 rounded-lg ${p.active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-cane-50 text-cane-600 hover:bg-cane-100'}`}>
                  {p.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
