'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/components/ui/Toast'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string
  nameEn: string
  nameTa: string
  slug: string
  descriptionEn: string
  descriptionTa: string
  images: string
  featured: boolean
  variants: {
    id: string
    nameEn: string
    nameTa: string
    price: number
    stock: number
    weight: number
  }[]
  category: { nameEn: string; nameTa: string }
}

const jaggeryTimeline = [
  { step: 1, titleEn: 'Harvest', titleTa: 'அறுவடை', descEn: 'Fresh sugarcane harvested from local farms', descTa: 'உள்ளூர் பண்ணைகளிலிருந்து புதிய கரும்பு அறுவடை', icon: '🌾' },
  { step: 2, titleEn: 'Extract Juice', titleTa: 'சாறு எடுத்தல்', descEn: 'Juice extracted using traditional wooden crushers', descTa: 'பாரம்பரிய மர நசுக்கிகளைப் பயன்படுத்தி சாறு எடுக்கப்படுகிறது', icon: '🫧' },
  { step: 3, titleEn: 'Boil & Purify', titleTa: 'கொதிக்க & சுத்திகரி', descEn: 'Slow-cooked in iron pans over wood fire', descTa: 'விறகு தீயில் இரும்பு பாத்திரங்களில் மெதுவாக சமைக்கப்படுகிறது', icon: '🔥' },
  { step: 4, titleEn: 'Shape & Cool', titleTa: 'வடிவமை & குளிர்', descEn: 'Hand-molded into blocks and cooled naturally', descTa: 'கையால் வடிவமைக்கப்பட்டு இயற்கையாக குளிர்விக்கப்படுகிறது', icon: '🧊' },
  { step: 5, titleEn: 'Pack & Ship', titleTa: 'பேக் & அனுப்பு', descEn: 'Packed hygienically and shipped to your doorstep', descTa: 'சுகாதாரமாக பேக் செய்யப்பட்டு உங்கள் வீட்டு வாசலுக்கு அனுப்பப்படுகிறது', icon: '📦' },
]

const testimonials = [
  { name: 'Priya S.', location: 'Chennai', text: 'The best jaggery I have ever tasted! Takes me back to my grandmother\'s kitchen. Pure and authentic.', rating: 5 },
  { name: 'Rajesh K.', location: 'Bangalore', text: 'I\'ve been ordering every month. The quality is consistently excellent. Great for my morning coffee!', rating: 5 },
  { name: 'Meena R.', location: 'Coimbatore', text: 'Sent this as a gift to my family in the US. They loved it! The packaging was beautiful and safe.', rating: 5 },
]

const trustBadges = [
  { icon: '🌿', titleEn: '100% Natural', titleTa: '100% இயற்கை' },
  { icon: '🚫', titleEn: 'No Chemicals', titleTa: 'ரசாயனம் இல்லை' },
  { icon: '👨‍👩‍👧‍👦', titleEn: 'Family Made', titleTa: 'குடும்பம் செய்தது' },
  { icon: '🏆', titleEn: 'Premium Quality', titleTa: 'உயர்தர தரம்' },
  { icon: '📦', titleEn: 'Safe Packaging', titleTa: 'பாதுகாப்பான பேக்கிங்' },
  { icon: '🚚', titleEn: 'All India Delivery', titleTa: 'அனைத்து இந்தியா டெலிவரி' },
]

export default function HomePage() {
  const { lang, t } = useLanguage()
  const { addItem } = useCart()
  const { showToast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products?featured=true')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleAddToCart = (product: Product, variant: Product['variants'][0]) => {
    addItem({
      variantId: variant.id,
      productId: product.id,
      nameEn: product.nameEn,
      nameTa: product.nameTa,
      variantNameEn: variant.nameEn,
      variantNameTa: variant.nameTa,
      price: variant.price,
      image: JSON.parse(product.images || '[]')[0] || '/images/placeholder.jpg',
      maxStock: variant.stock,
    })
    showToast(lang === 'en' ? 'Added to cart!' : 'கூடையில் சேர்க்கப்பட்டது!')
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-jaggery-50 via-cream-50 to-cane-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-jaggery-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cane-200/30 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cane-100 text-cane-700 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-cane-500 rounded-full animate-pulse" />
                {lang === 'en' ? 'Fresh batch available now!' : 'புதிய தொகுப்பு இப்போது கிடைக்கும்!'}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
                <span className="text-earth-900">{lang === 'en' ? 'Pure & Natural' : 'தூய்மையான &'}</span>
                <br />
                <span className="bg-gradient-to-r from-jaggery-600 to-jaggery-800 bg-clip-text text-transparent">
                  {lang === 'en' ? 'Traditional Foods' : 'இயற்கை பாரம்பரிய உணவுகள்'}
                </span>
              </h1>
              <p className="mt-6 text-lg text-earth-600 max-w-lg leading-relaxed">
                {t('heroSubtitle')}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/products" className="btn-primary text-lg px-8 py-4">
                  {t('shopNow')} →
                </Link>
                <a
                  href="https://wa.me/919876543210?text=Hi!%20I%20want%20to%20order%20from%20MUKIFOOD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp text-lg px-8 py-4"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  {t('whatsappOrder')}
                </a>
              </div>
            </div>
            
            {/* Hero Image / Product Showcase */}
            <div className="relative animate-slide-up">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-jaggery-300 to-jaggery-600 rounded-3xl rotate-6 opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-br from-jaggery-200 to-jaggery-500 rounded-3xl -rotate-3 opacity-20" />
                <div className="relative bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center text-center">
                  <div className="text-8xl mb-4">🫕</div>
                  <h3 className="text-2xl font-bold text-jaggery-800">
                    {lang === 'en' ? 'Nattu Sakarai' : 'நாட்டு சர்க்கரை'}
                  </h3>
                  <p className="text-earth-500 mt-2">{lang === 'en' ? 'Traditional Country Jaggery' : 'பாரம்பரிய நாட்டு வெல்லம்'}</p>
                  <div className="mt-4 flex gap-3">
                    <span className="px-3 py-1 bg-cane-100 text-cane-700 rounded-full text-sm font-medium">250g</span>
                    <span className="px-3 py-1 bg-jaggery-100 text-jaggery-700 rounded-full text-sm font-medium">500g</span>
                    <span className="px-3 py-1 bg-earth-100 text-earth-700 rounded-full text-sm font-medium">1kg</span>
                  </div>
                  <p className="mt-4 text-3xl font-bold text-jaggery-600">
                    {lang === 'en' ? 'From ₹85' : '₹85 முதல்'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white border-y border-cream-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {trustBadges.map((badge, i) => (
              <div key={i} className="flex items-center justify-center gap-2 py-2">
                <span className="text-2xl">{badge.icon}</span>
                <span className="text-sm font-medium text-earth-700">
                  {lang === 'en' ? badge.titleEn : badge.titleTa}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Our Products */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-earth-900">{t('whyOurProducts')}</h2>
            <div className="mt-3 w-20 h-1 bg-gradient-to-r from-jaggery-400 to-jaggery-600 mx-auto rounded-full" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🌿', key: 'natural' },
              { icon: '🤲', key: 'handcrafted' },
              { icon: '🌾', key: 'farmFresh' },
              { icon: '🚫', key: 'chemicalFree' },
            ].map((item, i) => (
              <div key={i} className="product-card p-6 text-center" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold text-earth-900 mb-2">{t(item.key)}</h3>
                <p className="text-sm text-earth-500 leading-relaxed">{t(`${item.key}Desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-cream-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-earth-900">{t('featuredProducts')}</h2>
              <div className="mt-3 w-20 h-1 bg-gradient-to-r from-jaggery-400 to-jaggery-600 rounded-full" />
            </div>
            <Link href="/products" className="btn-secondary text-sm hidden sm:flex">
              {t('viewAll')} →
            </Link>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="product-card">
                  <div className="h-48 animate-shimmer" />
                  <div className="p-6 space-y-3">
                    <div className="h-6 w-3/4 animate-shimmer rounded" />
                    <div className="h-4 w-1/2 animate-shimmer rounded" />
                    <div className="h-8 w-1/3 animate-shimmer rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => {
                const images = JSON.parse(product.images || '[]')
                const minPrice = Math.min(...product.variants.map(v => v.price))
                const hasStock = product.variants.some(v => v.stock > 0)
                return (
                  <div key={product.id} className="product-card">
                    <Link href={`/products/${product.slug}`}>
                      <div className="h-48 bg-gradient-to-br from-jaggery-100 to-cream-100 flex items-center justify-center text-6xl">
                        🫕
                      </div>
                    </Link>
                    <div className="p-6">
                      <span className="text-xs font-medium text-jaggery-600 bg-jaggery-50 px-2 py-1 rounded-full">
                        {lang === 'en' ? product.category.nameEn : product.category.nameTa}
                      </span>
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="mt-3 text-xl font-bold text-earth-900 hover:text-jaggery-600 transition-colors">
                          {lang === 'en' ? product.nameEn : product.nameTa}
                        </h3>
                      </Link>
                      <p className="mt-2 text-sm text-earth-500 line-clamp-2">
                        {lang === 'en' ? product.descriptionEn : product.descriptionTa}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {product.variants.map(v => (
                          <span key={v.id} className="text-xs px-2 py-1 bg-cream-100 text-earth-600 rounded-full">
                            {lang === 'en' ? v.nameEn : v.nameTa}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-2xl font-bold text-jaggery-600">
                          {formatPrice(minPrice)}
                          <span className="text-xs text-earth-400 font-normal ml-1">
                            {lang === 'en' ? 'onwards' : 'முதல்'}
                          </span>
                        </p>
                        {hasStock ? (
                          <button
                            onClick={() => handleAddToCart(product, product.variants[0])}
                            className="btn-primary text-sm px-4 py-2"
                          >
                            {t('addToCart')}
                          </button>
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
          
          <div className="mt-8 text-center sm:hidden">
            <Link href="/products" className="btn-secondary">{t('viewAll')} →</Link>
          </div>
        </div>
      </section>

      {/* How It's Made - Jaggery Timeline */}
      <section className="py-16 sm:py-24 bg-earth-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">{t('howItsMade')}</h2>
            <p className="mt-3 text-earth-400 max-w-2xl mx-auto">
              {lang === 'en'
                ? 'Our Nattu Sakarai is crafted using a centuries-old process — no machines, no chemicals, just pure traditional expertise.'
                : 'எங்கள் நாட்டு சர்க்கரை நூற்றாண்டுகள் பழமையான செயல்முறையைப் பயன்படுத்தி தயாரிக்கப்படுகிறது — இயந்திரங்கள் இல்லை, ரசாயனங்கள் இல்லை.'}
            </p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-jaggery-700 -translate-y-1/2" />
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-8">
              {jaggeryTimeline.map((step, i) => (
                <div key={i} className="relative text-center group">
                  <div className="relative z-10 w-20 h-20 mx-auto bg-gradient-to-br from-jaggery-500 to-jaggery-700 rounded-2xl flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform mb-4">
                    {step.icon}
                  </div>
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 w-8 h-8 bg-earth-950 rounded-full border-4 border-jaggery-600 hidden lg:block" />
                  <h3 className="text-lg font-bold text-jaggery-300">
                    {lang === 'en' ? step.titleEn : step.titleTa}
                  </h3>
                  <p className="mt-2 text-sm text-earth-400">
                    {lang === 'en' ? step.descEn : step.descTa}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-earth-900 mb-6">{t('brandStory')}</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-jaggery-400 to-jaggery-600 rounded-full mb-6" />
              <p className="text-lg text-earth-600 leading-relaxed">{t('brandStoryText')}</p>
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-jaggery-50 rounded-xl">
                  <p className="text-3xl font-bold text-jaggery-600">3+</p>
                  <p className="text-sm text-earth-500 mt-1">{lang === 'en' ? 'Generations' : 'தலைமுறைகள்'}</p>
                </div>
                <div className="text-center p-4 bg-cane-50 rounded-xl">
                  <p className="text-3xl font-bold text-cane-600">100%</p>
                  <p className="text-sm text-earth-500 mt-1">{lang === 'en' ? 'Natural' : 'இயற்கை'}</p>
                </div>
                <div className="text-center p-4 bg-cream-100 rounded-xl">
                  <p className="text-3xl font-bold text-cream-700">500+</p>
                  <p className="text-sm text-earth-500 mt-1">{lang === 'en' ? 'Happy Families' : 'மகிழ்ச்சியான குடும்பங்கள்'}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-jaggery-100 to-cream-100 rounded-3xl p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="text-9xl mb-4">👨‍👩‍👧‍👦</div>
                <p className="text-lg font-medium text-earth-700">{lang === 'en' ? 'A Family Tradition' : 'ஒரு குடும்ப பாரம்பரியம்'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-cream-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-earth-900">{t('testimonials')}</h2>
            <div className="mt-3 w-20 h-1 bg-gradient-to-r from-jaggery-400 to-jaggery-600 mx-auto rounded-full" />
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((review, i) => (
              <div key={i} className="product-card p-6">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <span key={j} className="text-yellow-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-earth-600 italic leading-relaxed">"{review.text}"</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-jaggery-300 to-jaggery-500 rounded-full flex items-center justify-center text-white font-bold">
                    {review.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-earth-900">{review.name}</p>
                    <p className="text-xs text-earth-500">{review.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Delivery CTA */}
      <section className="py-12 bg-gradient-to-r from-cane-600 to-cane-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold mb-3">
            🚚 {lang === 'en' ? 'FREE Delivery on orders above ₹500!' : '₹500 க்கு மேல் இலவச டெலிவரி!'}
          </h3>
          <p className="text-cane-100 mb-6">
            {lang === 'en' ? 'Order now and get it delivered fresh to your doorstep' : 'இப்போது ஆர்டர் செய்து உங்கள் வீட்டு வாசலில் புதியதாக பெறுங்கள்'}
          </p>
          <Link href="/products" className="inline-flex items-center gap-2 bg-white text-cane-700 px-8 py-3 rounded-xl font-bold hover:bg-cream-50 transition-all shadow-lg">
            {t('shopNow')} →
          </Link>
        </div>
      </section>
    </div>
  )
}
