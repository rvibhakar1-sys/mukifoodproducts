import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: { _count: { select: { orders: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ customers })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
