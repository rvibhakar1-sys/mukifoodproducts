import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOrderNumber, generateOTP } from '@/lib/utils'

// SSE event emitter for admin notifications
let orderListeners: Array<(data: any) => void> = []

export function notifyNewOrder(order: any) {
  orderListeners.forEach(listener => listener(order))
}

export function addOrderListener(listener: (data: any) => void) {
  orderListeners.push(listener)
  return () => { orderListeners = orderListeners.filter(l => l !== listener) }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      items, orderType, senderName, senderPhone, senderEmail,
      receiverName, receiverPhone, receiverAddress,
      giftMessage, hidePrices, festivalTheme,
      paymentMethod, couponCode, loyaltyPointsUsed,
      notes
    } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const phone = orderType === 'gift' ? senderPhone : receiverPhone || senderPhone
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Find or create customer
    let customer = await prisma.customer.findUnique({ where: { phone } })
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          phone,
          name: orderType === 'gift' ? senderName : receiverName || senderName,
          email: senderEmail,
        },
      })
    }

    // Calculate totals
    let subtotal = 0
    const orderItems: any[] = []

    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      })
      if (!variant || variant.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${variant?.nameEn || 'item'}` }, { status: 400 })
      }
      const itemTotal = variant.price * item.quantity
      subtotal += itemTotal
      orderItems.push({
        variantId: variant.id,
        nameEn: `${variant.product.nameEn} - ${variant.nameEn}`,
        nameTa: `${variant.product.nameTa} - ${variant.nameTa}`,
        quantity: item.quantity,
        price: variant.price,
        total: itemTotal,
      })
    }

    // Apply coupon
    let discount = 0
    let couponId = null
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } })
      if (coupon && coupon.active && subtotal >= coupon.minOrderAmount) {
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 })
        }
        discount = coupon.discountType === 'percentage'
          ? Math.min(subtotal * coupon.discountValue / 100, coupon.maxDiscount || Infinity)
          : coupon.discountValue
        couponId = coupon.id
        await prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } })
      }
    }

    // Loyalty points
    let loyaltyDiscount = 0
    if (loyaltyPointsUsed && customer.loyaltyPoints >= loyaltyPointsUsed) {
      loyaltyDiscount = loyaltyPointsUsed
      await prisma.customer.update({
        where: { id: customer.id },
        data: { loyaltyPoints: { decrement: loyaltyPointsUsed } },
      })
    }

    // Delivery charge
    const pincode = receiverAddress?.pincode
    let deliveryCharge = 60
    if (pincode) {
      const zone = await prisma.pincodeZone.findUnique({ where: { pincode } })
      if (zone) {
        deliveryCharge = zone.deliveryCharge
      }
    }
    const freeThreshold = 500
    if (subtotal >= freeThreshold) deliveryCharge = 0

    const total = subtotal - discount - loyaltyDiscount + deliveryCharge
    const orderNumber = generateOrderNumber()
    const deliveryOTP = generateOTP()

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        orderType: orderType || 'self',
        status: 'placed',
        subtotal,
        deliveryCharge,
        discount,
        total,
        couponId,
        couponCode: couponCode || null,
        loyaltyPointsUsed: loyaltyPointsUsed || 0,
        loyaltyDiscount,
        giftMessage: giftMessage || null,
        hidePrices: hidePrices || false,
        festivalTheme: festivalTheme || null,
        paymentMethod: paymentMethod || 'cod',
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
        notes: notes || null,
        items: { create: orderItems },
        recipients: {
          create: orderType === 'gift' ? [
            { recipientType: 'sender', name: senderName, phone: senderPhone },
            {
              recipientType: 'receiver', name: receiverName, phone: receiverPhone,
              line1: receiverAddress?.line1, line2: receiverAddress?.line2,
              city: receiverAddress?.city, state: receiverAddress?.state || 'Tamil Nadu',
              pincode: receiverAddress?.pincode, landmark: receiverAddress?.landmark,
            },
          ] : [
            {
              recipientType: 'receiver',
              name: senderName || receiverName,
              phone: senderPhone || receiverPhone,
              line1: receiverAddress?.line1, line2: receiverAddress?.line2,
              city: receiverAddress?.city, state: receiverAddress?.state || 'Tamil Nadu',
              pincode: receiverAddress?.pincode, landmark: receiverAddress?.landmark,
            },
          ],
        },
        statusHistory: { create: { status: 'placed', note: 'Order placed by customer' } },
        delivery: { create: { otp: deliveryOTP } },
      },
      include: { items: true, recipients: true },
    })

    // Reduce stock
    for (const item of items) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    // Award loyalty points (10 points per ₹100)
    const pointsEarned = Math.floor(subtotal / 100) * 10
    if (pointsEarned > 0) {
      await prisma.customer.update({
        where: { id: customer.id },
        data: { loyaltyPoints: { increment: pointsEarned } },
      })
      await prisma.loyaltyTransaction.create({
        data: {
          customerId: customer.id,
          orderId: order.id,
          type: 'earn',
          points: pointsEarned,
          description: `Earned from order #${orderNumber}`,
        },
      })
    }

    // Create admin notification
    await prisma.notification.create({
      data: {
        type: 'new_order',
        title: 'New Order Received!',
        message: `Order #${orderNumber} - ₹${total} (${orderType === 'gift' ? 'Gift' : 'Self'})`,
        data: JSON.stringify({ orderId: order.id, orderNumber }),
      },
    })

    // Notify via SSE
    notifyNewOrder({ orderId: order.id, orderNumber, total, orderType })

    console.log(`📦 New order: #${orderNumber} | Total: ₹${total} | OTP: ${deliveryOTP}`)

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber,
        total,
        deliveryCharge,
        discount,
        loyaltyDiscount,
        pointsEarned,
        deliveryOTP,
      },
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')
    const orderNumber = searchParams.get('orderNumber')

    if (!phone && !orderNumber) {
      return NextResponse.json({ error: 'Phone or order number required' }, { status: 400 })
    }

    const where: any = {}
    if (orderNumber) where.orderNumber = orderNumber
    if (phone) {
      where.OR = [
        { customer: { phone } },
        { guestPhone: phone },
        { recipients: { some: { phone } } },
      ]
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        recipients: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        delivery: true,
        customer: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
