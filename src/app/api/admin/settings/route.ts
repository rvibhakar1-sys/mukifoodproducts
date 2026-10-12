import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.setting.findMany()
    return NextResponse.json({ settings })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function PUT(request: NextRequest) {
  try {
    const { key, value } = await request.json()
    await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
