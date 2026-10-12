import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email, businessName, businessType, message, products, quantity } = body

    if (!name || !phone || !message) {
      return NextResponse.json({ error: 'Name, phone and message are required' }, { status: 400 })
    }

    const enquiry = await prisma.wholesaleEnquiry.create({
      data: { name, phone, email, businessName, businessType, message, products, quantity },
    })

    await prisma.notification.create({
      data: {
        type: 'enquiry',
        title: 'New Wholesale Enquiry',
        message: `${name} (${businessType || 'N/A'}) - ${phone}`,
        data: JSON.stringify({ enquiryId: enquiry.id }),
      },
    })

    return NextResponse.json({ success: true, enquiry })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit enquiry' }, { status: 500 })
  }
}
