import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ['confirmed', 'packed', 'shipped', 'out_for_delivery'],
        },
      },
      include: {
        items: true,
        recipient: true,
        delivery: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch delivery orders' }, { status: 500 })
  }
}
