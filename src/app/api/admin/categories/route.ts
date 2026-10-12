import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json({ categories })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nameEn, nameTa, slug } = body
    if (!nameEn) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const finalSlug = slug || nameEn.toLowerCase().replace(/\s+/g, '-')
    const category = await prisma.category.create({
      data: { nameEn, nameTa: nameTa || nameEn, slug: finalSlug },
    })
    return NextResponse.json({ category })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
