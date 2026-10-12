import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const where: any = { active: true }
    if (featured === 'true') where.featured = true
    if (category) where.category = { slug: category }
    if (search) {
      where.OR = [
        { nameEn: { contains: search } },
        { nameTa: { contains: search } },
      ]
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: { where: { active: true }, orderBy: { weight: 'asc' } },
        reviews: { where: { approved: true } },
      },
      orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    })

    const productsWithRating = products.map(p => ({
      ...p,
      avgRating: p.reviews.length > 0 ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length : 0,
      reviewCount: p.reviews.length,
    }))

    return NextResponse.json({ products: productsWithRating })
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
