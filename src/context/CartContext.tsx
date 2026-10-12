'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface CartItemType {
  variantId: string
  productId: string
  nameEn: string
  nameTa: string
  variantNameEn: string
  variantNameTa: string
  price: number
  quantity: number
  image: string
  maxStock: number
}

interface CartContextType {
  items: CartItemType[]
  addItem: (item: Omit<CartItemType, 'quantity'>, quantity?: number) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  itemCount: 0,
  subtotal: 0,
})

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemType[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('mukifood-cart')
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('mukifood-cart', JSON.stringify(items))
  }, [items])

  const addItem = (item: Omit<CartItemType, 'quantity'>, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.variantId === item.variantId)
      if (existing) {
        return prev.map(i =>
          i.variantId === item.variantId
            ? { ...i, quantity: Math.min(i.quantity + quantity, i.maxStock) }
            : i
        )
      }
      return [...prev, { ...item, quantity }]
    })
  }

  const removeItem = (variantId: string) => {
    setItems(prev => prev.filter(i => i.variantId !== variantId))
  }

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId)
      return
    }
    setItems(prev =>
      prev.map(i =>
        i.variantId === variantId
          ? { ...i, quantity: Math.min(quantity, i.maxStock) }
          : i
      )
    )
  }

  const clearCart = () => setItems([])

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
