import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const enquiries = await prisma.wholesaleEnquiry.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ enquiries })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
