import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [todayOrders, pendingOrders, totalRevenue, lowStockItems, recentOrders, allOrders] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
      prisma.order.count({ where: { status: { in: ['placed', 'confirmed', 'packed'] } } }),
      prisma.order.aggregate({ where: { paymentStatus: 'paid' }, _sum: { total: true } }),
      prisma.productVariant.count({
        where: { stock: { lte: 5 }, active: true },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true, phone: true } },
          items: true,
        },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        select: { createdAt: true, total: true, status: true },
        orderBy: { createdAt: 'asc' },
      }),
    ])

    // Group orders by day for chart
    const dailyData: Record<string, { orders: number; revenue: number }> = {}
    allOrders.forEach(o => {
      const day = o.createdAt.toISOString().split('T')[0]
      if (!dailyData[day]) dailyData[day] = { orders: 0, revenue: 0 }
      dailyData[day].orders++
      dailyData[day].revenue += o.total
    })

    const chartData = Object.entries(dailyData).map(([date, data]) => ({
      date,
      orders: data.orders,
      revenue: data.revenue,
    }))

    return NextResponse.json({
      stats: {
        todayOrders,
        pendingOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        lowStockItems,
      },
      recentOrders,
      chartData,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 })
  }
}
