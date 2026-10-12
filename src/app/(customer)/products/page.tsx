'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/components/ui/Toast'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string; nameEn: string; nameTa: string; slug: string; descriptionEn: string; descriptionTa: string;
  images: string; featured: boolean; avgRating: number; reviewCount: number;
  variants: { id: string; nameEn: string; nameTa: string; price: number; stock: number; weight: number }[]
  category: { nameEn: string; nameTa: string; slug: string }
}

export default function ProductsPage() {
  const { lang, t } = useLanguage()
  const { addItem } = useCart()
  const { showToast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/admin/categories').then(r => r.json()).then(d => setCategories(d.categories || []))
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    fetch(`/api/products?${params}`).then(r => r.json()).then(d => { setProducts(d.products || []); setLoading(false) }).catch(() => setLoading(false))
  }, [search, category])

  const handleAdd = (p: Product) => {
    const v = p.variants[0]
    if (!v || v.stock <= 0) return
    addItem({ variantId: v.id, productId: p.id, nameEn: p.nameEn, nameTa: p.nameTa, variantNameEn: v.nameEn, variantNameTa: v.nameTa, price: v.price, image: '', maxStock: v.stock })
    showToast(lang === 'en' ? 'Added to cart!' : 'கூடையில் சேர்க்கப்பட்டது!')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-earth-900 mb-2">{t('products')}</h1>
      <div className="w-16 h-1 bg-gradient-to-r from-jaggery-400 to-jaggery-600 rounded-full mb-8" />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input type="text" placeholder={t('search')} value={search} onChange={e => setSearch(e.target.value)} className="input-field sm:max-w-xs" />
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setCategory('')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!category ? 'bg-jaggery-600 text-white' : 'bg-white border border-cream-200 text-earth-600 hover:border-jaggery-300'}`}>
            {lang === 'en' ? 'All' : 'அனைத்தும்'}
          </button>
          {categories.map((c: any) => (
            <button key={c.id} onClick={() => setCategory(c.slug)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${category === c.slug ? 'bg-jaggery-600 text-white' : 'bg-white border border-cream-200 text-earth-600 hover:border-jaggery-300'}`}>
              {lang === 'en' ? c.nameEn : c.nameTa}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="product-card"><div className="h-48 animate-shimmer" /><div className="p-6 space-y-3"><div className="h-5 w-3/4 animate-shimmer rounded" /><div className="h-4 w-1/2 animate-shimmer rounded" /></div></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-lg text-earth-500">{t('noResults')}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => {
            const minPrice = Math.min(...product.variants.map(v => v.price))
            const hasStock = product.variants.some(v => v.stock > 0)
            return (
              <div key={product.id} className="product-card animate-fade-in">
                <Link href={`/products/${product.slug}`}>
                  <div className="h-48 bg-gradient-to-br from-jaggery-100 to-cream-100 flex items-center justify-center text-6xl relative">
                    🫕
                    {product.featured && <span className="absolute top-3 left-3 px-2 py-1 bg-jaggery-500 text-white text-xs font-bold rounded-full">⭐ {lang === 'en' ? 'Featured' : 'சிறப்பு'}</span>}
                  </div>
                </Link>
                <div className="p-5">
                  <span className="text-xs font-medium text-jaggery-600 bg-jaggery-50 px-2 py-1 rounded-full">
                    {lang === 'en' ? product.category.nameEn : product.category.nameTa}
                  </span>
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="mt-3 text-lg font-bold text-earth-900 hover:text-jaggery-600 transition-colors">
                      {lang === 'en' ? product.nameEn : product.nameTa}
                    </h3>
                  </Link>
                  <p className="mt-1 text-sm text-earth-500 line-clamp-2">{lang === 'en' ? product.descriptionEn : product.descriptionTa}</p>
                  {product.avgRating > 0 && (
                    <div className="mt-2 flex items-center gap-1">
                      <span className="text-yellow-400">{'★'.repeat(Math.round(product.avgRating))}</span>
                      <span className="text-xs text-earth-400">({product.reviewCount})</span>
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {product.variants.map(v => (
                      <span key={v.id} className="text-xs px-2 py-0.5 bg-cream-100 text-earth-600 rounded-full">{lang === 'en' ? v.nameEn : v.nameTa}</span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xl font-bold text-jaggery-600">{formatPrice(minPrice)}<span className="text-xs text-earth-400 font-normal ml-1">{lang === 'en' ? 'onwards' : 'முதல்'}</span></p>
                    {hasStock ? (
                      <button onClick={() => handleAdd(product)} className="btn-primary text-sm px-3 py-2">{t('addToCart')}</button>
                    ) : (
                      <span className="text-sm text-red-500 font-medium">{t('outOfStock')}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
