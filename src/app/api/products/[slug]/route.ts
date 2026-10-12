import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: { where: { active: true }, orderBy: { weight: 'asc' } },
        reviews: {
          where: { approved: true },
          include: { customer: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!product || !product.active) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0

    return NextResponse.json({ product: { ...product, avgRating, reviewCount: product.reviews.length } })
  } catch (error) {
    console.error('Product detail error:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}
