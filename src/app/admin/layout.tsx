'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

const navItems = [
  { href: '/admin', icon: '📊', label: 'Dashboard' },
  { href: '/admin/orders', icon: '📦', label: 'Orders' },
  { href: '/admin/products', icon: '🏷️', label: 'Products' },
  { href: '/admin/customers', icon: '👥', label: 'Customers' },
  { href: '/admin/coupons', icon: '🎟️', label: 'Coupons' },
  { href: '/admin/enquiries', icon: '📋', label: 'Enquiries' },
  { href: '/admin/settings', icon: '⚙️', label: 'Settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated' && pathname !== '/admin/login') {
      router.push('/admin/login')
    }
  }, [status, pathname, router])

  // Poll for new notifications
  useEffect(() => {
    if (status !== 'authenticated') return
    const check = async () => {
      try {
        const res = await fetch('/api/admin/notifications')
        if (res.ok) {
          const data = await res.json()
          setNotifications(data.unread || 0)
        }
      } catch {}
    }
    check()
    const interval = setInterval(check, 15000)
    return () => clearInterval(interval)
  }, [status])

  if (pathname === '/admin/login') return <>{children}</>
  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center bg-earth-950">
      <div className="text-center"><div className="w-12 h-12 border-4 border-jaggery-500 border-t-transparent rounded-full animate-spin mx-auto" /><p className="text-earth-400 mt-4">Loading...</p></div>
    </div>
  )
  if (status === 'unauthenticated') return null

  return (
    <div className="min-h-screen flex bg-earth-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 admin-sidebar text-white transform transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-jaggery-400 to-jaggery-600 flex items-center justify-center font-bold text-lg">M</div>
            <div><h2 className="font-bold">MUKIFOOD</h2><p className="text-xs text-earth-400">Admin Panel</p></div>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname === item.href ? 'bg-jaggery-600/30 text-jaggery-300' : 'text-earth-400 hover:bg-white/5 hover:text-white'}`}>
              <span className="text-lg">{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-jaggery-600 flex items-center justify-center text-sm font-bold">{session?.user?.name?.[0] || 'A'}</div>
            <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{session?.user?.name}</p><p className="text-xs text-earth-400 truncate">{session?.user?.email}</p></div>
          </div>
          <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className="w-full px-4 py-2 text-sm text-earth-400 hover:text-white hover:bg-white/5 rounded-lg transition-all text-left">🚪 Logout</button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-cream-200 px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-cream-100 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="flex items-center gap-3">
              {notifications > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium animate-pulse">🔔 {notifications} new</div>
              )}
              <Link href="/" target="_blank" className="text-sm text-earth-500 hover:text-jaggery-600">View Store →</Link>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
