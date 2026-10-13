import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, name } = body

    if (!phone || phone.length < 10) {
      return NextResponse.json({ error: 'Valid phone number is required' }, { status: 400 })
    }

    // Find or create customer
    const customer = await prisma.customer.upsert({
      where: { phone },
      update: { name: name || undefined },
      create: {
        phone,
        name: name || 'Customer',
      },
    })

    return NextResponse.json({ success: true, customer: { id: customer.id, phone: customer.phone, name: customer.name } })
  } catch (error) {
    console.error('Customer auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
