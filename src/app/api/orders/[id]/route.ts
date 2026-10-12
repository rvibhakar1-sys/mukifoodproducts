import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: {
        items: true,
        recipients: true,
        statusHistory: { orderBy: { createdAt: 'asc' }, include: { changedBy: { select: { name: true } } } },
        delivery: { include: { deliveryPerson: { select: { name: true, phone: true } } } },
        payments: true,
        customer: { select: { name: true, phone: true, loyaltyPoints: true } },
        coupon: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, note, deliveryPersonId, courierName, trackingId } = body

    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Update order status
    if (status) {
      await prisma.order.update({
        where: { id },
        data: { status },
      })

      await prisma.orderStatusHistory.create({
        data: {
          orderId: id,
          status,
          note: note || `Status changed to ${status}`,
        },
      })

      // If delivered, mark payment as completed for COD
      if (status === 'delivered' && order.paymentMethod === 'cod') {
        await prisma.order.update({
          where: { id },
          data: { paymentStatus: 'paid' },
        })
      }

      // If cancelled/rejected, restore stock
      if (status === 'cancelled' || status === 'rejected') {
        const items = await prisma.orderItem.findMany({ where: { orderId: id } })
        for (const item of items) {
          if (item.variantId) {
            await prisma.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            })
          }
        }
      }
    }

    // Update delivery info
    if (deliveryPersonId || courierName || trackingId) {
      await prisma.delivery.update({
        where: { orderId: id },
        data: {
          ...(deliveryPersonId && { deliveryPersonId }),
          ...(courierName && { courierName }),
          ...(trackingId && { trackingId }),
        },
      })
    }

    const updated = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        recipients: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        delivery: true,
      },
    })

    return NextResponse.json({ order: updated })
  } catch (error) {
    console.error('Order update error:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
