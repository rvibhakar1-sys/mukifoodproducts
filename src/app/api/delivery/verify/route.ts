import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, otp } = body

    if (!orderId || !otp) {
      return NextResponse.json({ error: 'Order ID and OTP are required' }, { status: 400 })
    }

    const delivery = await prisma.delivery.findUnique({
      where: { orderId },
      include: { order: true },
    })

    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 })
    }

    if (delivery.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }

    // Mark as delivered
    await prisma.delivery.update({
      where: { orderId },
      data: { otpVerified: true, deliveredAt: new Date() },
    })

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'delivered' },
    })

    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        status: 'delivered',
        note: 'Delivery confirmed via OTP',
      },
    })

    // Mark COD as paid
    const order = delivery.order
    if (order.paymentMethod === 'cod') {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'paid' },
      })
    }

    return NextResponse.json({ success: true, message: 'Delivery confirmed!' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify delivery' }, { status: 500 })
  }
}
