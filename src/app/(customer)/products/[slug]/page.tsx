'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/components/ui/Toast'
import { formatPrice, validatePincode } from '@/lib/utils'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const { lang, t } = useLanguage()
  const { addItem } = useCart()
  const { showToast } = useToast()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [pincode, setPincode] = useState('')
  const [pincodeResult, setPincodeResult] = useState<any>(null)
  const [checkingPincode, setCheckingPincode] = useState(false)

  useEffect(() => {
    fetch(`/api/products/${slug}`).then(r => r.json()).then(d => {
      setProduct(d.product)
      if (d.product?.variants?.length) setSelectedVariant(d.product.variants[0])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [slug])

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stock <= 0) return
    addItem({
      variantId: selectedVariant.id, productId: product.id,
      nameEn: product.nameEn, nameTa: product.nameTa,
      variantNameEn: selectedVariant.nameEn, variantNameTa: selectedVariant.nameTa,
      price: selectedVariant.price, image: '', maxStock: selectedVariant.stock,
    }, quantity)
    showToast(lang === 'en' ? 'Added to cart!' : 'கூடையில் சேர்க்கப்பட்டது!')
  }

  const checkPincode = async () => {
    if (!validatePincode(pincode)) { showToast('Enter valid 6-digit pincode', 'error'); return }
    setCheckingPincode(true)
    const res = await fetch('/api/pincode', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pincode }) })
    const data = await res.json()
    setPincodeResult(data)
    setCheckingPincode(false)
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="h-96 animate-shimmer rounded-2xl" />
        <div className="space-y-4"><div className="h-8 w-3/4 animate-shimmer rounded" /><div className="h-4 w-1/2 animate-shimmer rounded" /><div className="h-20 animate-shimmer rounded" /></div>
      </div>
    </div>
  )

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">😕</div>
      <p className="text-xl text-earth-600">Product not found</p>
      <Link href="/products" className="btn-primary mt-6 inline-flex">{t('continueShopping')}</Link>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-earth-500 mb-6">
        <Link href="/" className="hover:text-jaggery-600">{t('home')}</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-jaggery-600">{t('products')}</Link>
        <span>/</span>
        <span className="text-earth-900 font-medium">{lang === 'en' ? product.nameEn : product.nameTa}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Image */}
        <div className="bg-gradient-to-br from-jaggery-100 to-cream-100 rounded-2xl flex items-center justify-center min-h-[300px] md:min-h-[400px] relative">
          <div className="text-9xl">🫕</div>
          {product.featured && <span className="absolute top-4 left-4 px-3 py-1 bg-jaggery-500 text-white text-sm font-bold rounded-full">⭐ Featured</span>}
        </div>

        {/* Product Info */}
        <div>
          <span className="text-sm font-medium text-jaggery-600 bg-jaggery-50 px-3 py-1 rounded-full">
            {lang === 'en' ? product.category.nameEn : product.category.nameTa}
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-earth-900">
            {lang === 'en' ? product.nameEn : product.nameTa}
          </h1>

          {product.avgRating > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <span key={i} className={`text-lg ${i < Math.round(product.avgRating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>)}</div>
              <span className="text-sm text-earth-500">({product.reviewCount} {t('reviews')})</span>
            </div>
          )}

          <p className="mt-4 text-earth-600 leading-relaxed">{lang === 'en' ? product.descriptionEn : product.descriptionTa}</p>

          {/* Variant Selection */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-earth-700 mb-3">{t('selectVariant')}</h3>
            <div className="flex flex-wrap gap-3">
              {product.variants.map((v: any) => (
                <button key={v.id} onClick={() => { setSelectedVariant(v); setQuantity(1) }}
                  className={`px-5 py-3 rounded-xl font-medium transition-all ${selectedVariant?.id === v.id
                    ? 'bg-jaggery-600 text-white shadow-lg shadow-jaggery-200'
                    : 'bg-white border-2 border-cream-200 text-earth-700 hover:border-jaggery-300'} ${v.stock <= 0 ? 'opacity-50 line-through' : ''}`}
                  disabled={v.stock <= 0}
                >
                  {lang === 'en' ? v.nameEn : v.nameTa}
                  <span className="block text-sm mt-0.5">{formatPrice(v.price)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price & Stock */}
          {selectedVariant && (
            <div className="mt-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-jaggery-600">{formatPrice(selectedVariant.price)}</span>
                {selectedVariant.mrp && selectedVariant.mrp > selectedVariant.price && (
                  <>
                    <span className="text-lg text-earth-400 line-through">{formatPrice(selectedVariant.mrp)}</span>
                    <span className="text-sm font-medium text-cane-600 bg-cane-50 px-2 py-0.5 rounded-full">
                      {Math.round((1 - selectedVariant.price / selectedVariant.mrp) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className={`mt-2 text-sm font-medium ${selectedVariant.stock > 5 ? 'text-cane-600' : selectedVariant.stock > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                {selectedVariant.stock > 5 ? `✓ ${t('inStock')}` : selectedVariant.stock > 0 ? `⚡ ${t('lowStock').replace('{count}', selectedVariant.stock)}` : `✕ ${t('outOfStock')}`}
              </p>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          {selectedVariant && selectedVariant.stock > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <div className="flex items-center border-2 border-cream-200 rounded-xl overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 text-lg font-bold text-earth-600 hover:bg-cream-50">−</button>
                <span className="px-6 py-3 text-lg font-bold text-earth-900 min-w-[60px] text-center">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))} className="px-4 py-3 text-lg font-bold text-earth-600 hover:bg-cream-50">+</button>
              </div>
              <button onClick={handleAddToCart} className="btn-primary text-lg flex-1 py-4">
                🛒 {t('addToCart')} — {formatPrice(selectedVariant.price * quantity)}
              </button>
            </div>
          )}

          {/* Pincode Check */}
          <div className="mt-6 p-4 bg-cream-50 rounded-xl border border-cream-200">
            <h3 className="text-sm font-semibold text-earth-700 mb-2">📍 {t('checkDelivery')}</h3>
            <div className="flex gap-2">
              <input type="text" placeholder={t('enterPincode')} value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="input-field flex-1" maxLength={6} />
              <button onClick={checkPincode} disabled={checkingPincode} className="btn-primary px-6">{checkingPincode ? '...' : t('track')}</button>
            </div>
            {pincodeResult && (
              <p className={`mt-2 text-sm font-medium ${pincodeResult.serviceable ? 'text-cane-600' : 'text-red-600'}`}>
                {pincodeResult.serviceable ? `✓ ${t('deliverable').replace('{days}', pincodeResult.estimatedDays).replace('{charge}', pincodeResult.deliveryCharge)}` : t('notDeliverable')}
              </p>
            )}
          </div>

          {/* Info Cards */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {product.ingredientsEn && (
              <div className="p-3 bg-white rounded-xl border border-cream-200">
                <h4 className="text-xs font-semibold text-earth-500 uppercase">{t('ingredients')}</h4>
                <p className="mt-1 text-sm text-earth-700">{lang === 'en' ? product.ingredientsEn : product.ingredientsTa}</p>
              </div>
            )}
            {product.shelfLife && (
              <div className="p-3 bg-white rounded-xl border border-cream-200">
                <h4 className="text-xs font-semibold text-earth-500 uppercase">{t('shelfLife')}</h4>
                <p className="mt-1 text-sm text-earth-700">{product.shelfLife}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {product.reviews?.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-earth-900 mb-6">{t('reviews')} ({product.reviewCount})</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {product.reviews.map((r: any) => (
              <div key={r.id} className="p-5 bg-white rounded-xl border border-cream-200">
                <div className="flex gap-0.5 mb-2">{Array.from({ length: 5 }).map((_, i) => <span key={i} className={i < r.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>)}</div>
                <p className="text-sm text-earth-600 italic">"{r.comment}"</p>
                <p className="mt-3 text-xs text-earth-400 font-medium">— {r.customer?.name || 'Customer'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
