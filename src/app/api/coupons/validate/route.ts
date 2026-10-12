import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json()
    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 })
    }

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })

    if (!coupon || !coupon.active) {
      return NextResponse.json({ valid: false, error: 'Invalid or expired coupon' }, { status: 400 })
    }

    if (coupon.validUntil && new Date() > coupon.validUntil) {
      return NextResponse.json({ valid: false, error: 'Coupon has expired' }, { status: 400 })
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ valid: false, error: 'Coupon usage limit reached' }, { status: 400 })
    }

    if (subtotal < coupon.minOrderAmount) {
      return NextResponse.json({
        valid: false,
        error: `Minimum order amount is ₹${coupon.minOrderAmount}`,
      }, { status: 400 })
    }

    let discount = 0
    if (coupon.discountType === 'percentage') {
      discount = Math.min(subtotal * coupon.discountValue / 100, coupon.maxDiscount || Infinity)
    } else {
      discount = coupon.discountValue
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount: Math.round(discount),
        descriptionEn: coupon.descriptionEn,
        descriptionTa: coupon.descriptionTa,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 })
  }
}
