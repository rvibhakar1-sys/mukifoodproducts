'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'admin' | 'user'>('user')

  // Admin login state
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminError, setAdminError] = useState('')

  // User login state
  const [userPhone, setUserPhone] = useState('')
  const [userName, setUserName] = useState('')
  const [userLoading, setUserLoading] = useState(false)
  const [userSuccess, setUserSuccess] = useState(false)

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdminLoading(true)
    setAdminError('')
    const result = await signIn('credentials', { email: adminEmail, password: adminPassword, redirect: false })
    if (result?.ok) {
      router.push('/admin')
    } else {
      setAdminError('Invalid email or password')
    }
    setAdminLoading(false)
  }

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userPhone || userPhone.length < 10) return
    setUserLoading(true)
    try {
      const res = await fetch('/api/auth/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: userPhone, name: userName }),
      })
      const data = await res.json()
      if (data.success) {
        // Store customer info in localStorage
        localStorage.setItem('mukifood_customer', JSON.stringify({
          id: data.customer.id,
          phone: data.customer.phone,
          name: data.customer.name,
        }))
        setUserSuccess(true)
        setTimeout(() => router.push('/'), 1500)
      }
    } catch {
      // If API doesn't exist yet, still store locally
      localStorage.setItem('mukifood_customer', JSON.stringify({
        phone: userPhone,
        name: userName || 'Customer',
      }))
      setUserSuccess(true)
      setTimeout(() => router.push('/'), 1500)
    }
    setUserLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-earth-900 via-jaggery-950 to-earth-950 px-4 py-8">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-jaggery-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-jaggery-600/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-jaggery-400/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-jaggery-400 to-jaggery-700 flex items-center justify-center text-white font-bold text-4xl shadow-2xl shadow-jaggery-500/30 mb-4 transform hover:scale-105 transition-transform">
            M
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">MUKIFOOD</h1>
          <p className="text-earth-400 text-sm mt-1 tracking-widest uppercase">Products</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/5 backdrop-blur-sm rounded-2xl p-1.5 mb-6 border border-white/10">
          <button
            onClick={() => setActiveTab('user')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === 'user'
                ? 'bg-gradient-to-r from-jaggery-500 to-jaggery-700 text-white shadow-lg shadow-jaggery-500/30'
                : 'text-earth-400 hover:text-white'
            }`}
          >
            🛒 Customer
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === 'admin'
                ? 'bg-gradient-to-r from-earth-700 to-earth-900 text-white shadow-lg shadow-earth-500/30'
                : 'text-earth-400 hover:text-white'
            }`}
          >
            🔧 Admin
          </button>
        </div>

        {/* Customer Login Box */}
        {activeTab === 'user' && (
          <div className="animate-fade-in">
            <div className="p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-jaggery-400/20 to-jaggery-600/20 flex items-center justify-center text-3xl mb-3">
                  🛍️
                </div>
                <h2 className="text-xl font-bold text-white">Welcome, Customer!</h2>
                <p className="text-earth-400 text-sm mt-1">Enter your phone number to continue shopping</p>
              </div>

              {userSuccess ? (
                <div className="text-center py-6 animate-fade-in">
                  <div className="text-5xl mb-3">✅</div>
                  <p className="text-jaggery-300 font-bold text-lg">Welcome to MUKIFOOD!</p>
                  <p className="text-earth-400 text-sm mt-1">Redirecting to store...</p>
                </div>
              ) : (
                <form onSubmit={handleUserLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-300 mb-1.5">Phone Number *</label>
                    <div className="flex">
                      <span className="px-3 py-3 bg-white/5 border border-white/20 border-r-0 rounded-l-xl text-earth-400 text-sm flex items-center">+91</span>
                      <input
                        type="tel"
                        value={userPhone}
                        onChange={e => setUserPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-r-xl text-white placeholder-earth-500 focus:outline-none focus:border-jaggery-400 focus:ring-2 focus:ring-jaggery-400/20 transition-all"
                        placeholder="9876543210"
                        required
                        maxLength={10}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-300 mb-1.5">Your Name (optional)</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={e => setUserName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-earth-500 focus:outline-none focus:border-jaggery-400 focus:ring-2 focus:ring-jaggery-400/20 transition-all"
                      placeholder="Enter your name"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={userLoading || userPhone.length < 10}
                    className="w-full py-3.5 bg-gradient-to-r from-jaggery-500 to-jaggery-700 text-white rounded-xl font-bold text-lg hover:from-jaggery-600 hover:to-jaggery-800 transition-all shadow-lg shadow-jaggery-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {userLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Please wait...
                      </span>
                    ) : (
                      'Continue to Store →'
                    )}
                  </button>
                </form>
              )}

              <div className="mt-6 pt-4 border-t border-white/10 text-center">
                <p className="text-earth-500 text-xs">No account needed • Just enter your phone to start shopping</p>
              </div>
            </div>
          </div>
        )}

        {/* Admin Login Box */}
        {activeTab === 'admin' && (
          <div className="animate-fade-in">
            <div className="p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-earth-600/20 to-earth-800/20 flex items-center justify-center text-3xl mb-3">
                  🔐
                </div>
                <h2 className="text-xl font-bold text-white">Admin Login</h2>
                <p className="text-earth-400 text-sm mt-1">Sign in to manage your store</p>
              </div>

              {adminError && (
                <div className="p-3 mb-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm text-center animate-fade-in">
                  {adminError}
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-earth-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-earth-500 focus:outline-none focus:border-jaggery-400 focus:ring-2 focus:ring-jaggery-400/20 transition-all"
                    placeholder="admin01@gmail.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-300 mb-1.5">Password</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-earth-500 focus:outline-none focus:border-jaggery-400 focus:ring-2 focus:ring-jaggery-400/20 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={adminLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-earth-700 to-earth-900 text-white rounded-xl font-bold text-lg hover:from-earth-800 hover:to-earth-950 transition-all shadow-lg disabled:opacity-50"
                >
                  {adminLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    'Sign In to Admin'
                  )}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-white/10 text-center">
                <p className="text-earth-500 text-xs">Authorized personnel only</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-earth-600 text-xs mt-6">© 2024 MUKIFOOD PRODUCTS. All rights reserved.</p>
      </div>
    </div>
  )
}
