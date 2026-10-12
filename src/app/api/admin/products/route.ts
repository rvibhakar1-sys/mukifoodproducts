import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: { orderBy: { weight: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ products })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nameEn, nameTa, categoryId, descriptionEn, descriptionTa, ingredientsEn, ingredientsTa, shelfLife, images, featured, gstPercent, variants } = body

    if (!nameEn || !categoryId) {
      return NextResponse.json({ error: 'Name and category are required' }, { status: 400 })
    }

    const slug = slugify(nameEn)
    const existing = await prisma.product.findUnique({ where: { slug } })
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    const product = await prisma.product.create({
      data: {
        nameEn,
        nameTa: nameTa || nameEn,
        categoryId,
        slug: finalSlug,
        descriptionEn: descriptionEn || '',
        descriptionTa: descriptionTa || descriptionEn || '',
        ingredientsEn,
        ingredientsTa,
        shelfLife,
        images: JSON.stringify(images || []),
        featured: featured || false,
        gstPercent: gstPercent || 0,
        variants: variants?.length ? {
          create: variants.map((v: any, i: number) => ({
            nameEn: v.nameEn,
            nameTa: v.nameTa || v.nameEn,
            sku: `${finalSlug.toUpperCase().substring(0, 4)}-${v.weight || i}`,
            price: v.price,
            mrp: v.mrp || null,
            weight: v.weight || 0,
            stock: v.stock || 0,
            lowStockThreshold: v.lowStockThreshold || 5,
          })),
        } : undefined,
      },
      include: { variants: true, category: true },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
