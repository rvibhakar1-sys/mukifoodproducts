import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const unread = await prisma.notification.count({ where: { read: false } })
    const recent = await prisma.notification.findMany({ take: 10, orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ unread, notifications: recent })
  } catch {
    return NextResponse.json({ unread: 0, notifications: [] })
  }
}
