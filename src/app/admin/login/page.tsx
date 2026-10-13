'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.ok) {
      router.push('/admin')
    } else {
      setError('Invalid email or password')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-earth-900 via-jaggery-950 to-earth-950 px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-jaggery-400 to-jaggery-600 flex items-center justify-center text-white font-bold text-3xl shadow-xl mb-4">M</div>
          <h1 className="text-3xl font-bold text-white">MUKIFOOD</h1>
          <p className="text-earth-400 text-sm mt-1">Admin Panel</p>
        </div>
        <form onSubmit={handleLogin} className="p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl space-y-5">
          {error && <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm text-center">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-earth-300 mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-earth-500 focus:outline-none focus:border-jaggery-400 focus:ring-2 focus:ring-jaggery-400/20" placeholder="admin01@gmail.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-earth-300 mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-earth-500 focus:outline-none focus:border-jaggery-400 focus:ring-2 focus:ring-jaggery-400/20" placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-jaggery-500 to-jaggery-700 text-white rounded-xl font-bold text-lg hover:from-jaggery-600 hover:to-jaggery-800 transition-all shadow-lg disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-xs text-earth-500 text-center">Demo: admin01@gmail.com / admin@123</p>
        </form>
      </div>
    </div>
  )
}
