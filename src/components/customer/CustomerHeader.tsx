'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { useCart } from '@/context/CartContext'

export default function CustomerHeader() {
  const { lang, setLang, t } = useLanguage()
  const { itemCount } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 glass-card shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-jaggery-500 to-jaggery-700 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
              M
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-jaggery-800 leading-tight">MUKIFOOD</h1>
              <p className="text-[10px] sm:text-xs text-earth-500 -mt-0.5 tracking-wide">PRODUCTS</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-4 py-2 text-sm font-medium text-earth-700 hover:text-jaggery-600 hover:bg-jaggery-50 rounded-lg transition-all">
              {t('home')}
            </Link>
            <Link href="/products" className="px-4 py-2 text-sm font-medium text-earth-700 hover:text-jaggery-600 hover:bg-jaggery-50 rounded-lg transition-all">
              {t('products')}
            </Link>
            <Link href="/track" className="px-4 py-2 text-sm font-medium text-earth-700 hover:text-jaggery-600 hover:bg-jaggery-50 rounded-lg transition-all">
              {t('trackOrder')}
            </Link>
            <Link href="/wholesale" className="px-4 py-2 text-sm font-medium text-earth-700 hover:text-jaggery-600 hover:bg-jaggery-50 rounded-lg transition-all">
              {t('wholesale')}
            </Link>
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
              className="px-2.5 py-1.5 text-xs sm:text-sm font-semibold border-2 border-jaggery-200 text-jaggery-700 rounded-lg hover:bg-jaggery-50 transition-all"
              title={t('language')}
            >
              {lang === 'en' ? 'தமிழ்' : 'EN'}
            </button>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 sm:p-2.5 hover:bg-jaggery-50 rounded-xl transition-all">
              <svg className="w-6 h-6 text-earth-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-jaggery-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce-subtle">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 hover:bg-jaggery-50 rounded-xl transition-all"
            >
              <svg className="w-6 h-6 text-earth-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <nav className="flex flex-col gap-1">
              <Link href="/" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-medium text-earth-700 hover:text-jaggery-600 hover:bg-jaggery-50 rounded-lg transition-all">
                {t('home')}
              </Link>
              <Link href="/products" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-medium text-earth-700 hover:text-jaggery-600 hover:bg-jaggery-50 rounded-lg transition-all">
                {t('products')}
              </Link>
              <Link href="/track" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-medium text-earth-700 hover:text-jaggery-600 hover:bg-jaggery-50 rounded-lg transition-all">
                {t('trackOrder')}
              </Link>
              <Link href="/wholesale" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-medium text-earth-700 hover:text-jaggery-600 hover:bg-jaggery-50 rounded-lg transition-all">
                {t('wholesale')}
              </Link>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || '919876543210'}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 text-sm font-medium text-green-700 hover:bg-green-50 rounded-lg transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
