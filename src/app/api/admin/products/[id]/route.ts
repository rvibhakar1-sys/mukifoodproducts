import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: { orderBy: { weight: 'asc' } } },
    })
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    return NextResponse.json({ product })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nameEn, nameTa, categoryId, descriptionEn, descriptionTa, ingredientsEn, ingredientsTa, shelfLife, images, featured, active, gstPercent } = body

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(nameEn !== undefined && { nameEn }),
        ...(nameTa !== undefined && { nameTa }),
        ...(categoryId !== undefined && { categoryId }),
        ...(descriptionEn !== undefined && { descriptionEn }),
        ...(descriptionTa !== undefined && { descriptionTa }),
        ...(ingredientsEn !== undefined && { ingredientsEn }),
        ...(ingredientsTa !== undefined && { ingredientsTa }),
        ...(shelfLife !== undefined && { shelfLife }),
        ...(images !== undefined && { images: JSON.stringify(images) }),
        ...(featured !== undefined && { featured }),
        ...(active !== undefined && { active }),
        ...(gstPercent !== undefined && { gstPercent }),
      },
      include: { category: true, variants: true },
    })

    return NextResponse.json({ product })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
