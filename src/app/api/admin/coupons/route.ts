import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ coupons })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const coupon = await prisma.coupon.create({ data: { code: body.code.toUpperCase(), descriptionEn: body.descriptionEn, discountType: body.discountType, discountValue: body.discountValue, minOrderAmount: body.minOrderAmount || 0, maxDiscount: body.maxDiscount || null, usageLimit: body.usageLimit || null } })
    return NextResponse.json({ coupon })
  } catch (error: any) {
    if (error?.code === 'P2002') return NextResponse.json({ error: 'Code already exists' }, { status: 400 })
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
