import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { pincode } = await request.json()
    if (!pincode || !/^[1-9][0-9]{5}$/.test(pincode)) {
      return NextResponse.json({ error: 'Invalid pincode' }, { status: 400 })
    }

    const zone = await prisma.pincodeZone.findUnique({ where: { pincode } })

    if (!zone || !zone.serviceable) {
      // For demo, allow all pincodes with default charge
      const defaultCharge = 60
      const defaultDays = 5
      return NextResponse.json({
        serviceable: true,
        deliveryCharge: defaultCharge,
        estimatedDays: defaultDays,
        zoneName: 'standard',
        message: `Delivery available! Est. ${defaultDays} days. Charge: ₹${defaultCharge}`,
      })
    }

    const freeThreshold = 500
    return NextResponse.json({
      serviceable: true,
      deliveryCharge: zone.deliveryCharge,
      estimatedDays: zone.estimatedDays,
      zoneName: zone.zoneName,
      freeThreshold,
      message: `Delivery available! Est. ${zone.estimatedDays} days. Charge: ₹${zone.deliveryCharge}`,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check pincode' }, { status: 500 })
  }
}
