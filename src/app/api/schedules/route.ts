import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const isActive = searchParams.get('isActive')
    
    const skip = (page - 1) * limit
    
    const whereClause: any = {}
    if (isActive === 'true') {
      whereClause.isActive = true
    } else if (isActive === 'false') {
      whereClause.isActive = false
    }
    
    const [schedules, total] = await Promise.all([
      db.schedule.findMany({
        where: whereClause,
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          stream: {
            select: { id: true, name: true, streamKey: true }
          },
          playlist: {
            select: { id: true, name: true }
          },
          items: {
            orderBy: { order: 'asc' }
          },
          _count: {
            select: { items: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.schedule.count({ where: whereClause })
    ])
    
    return NextResponse.json({
      schedules,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      startDate,
      endDate,
      isRecurring,
      recurringPattern,
      isActive,
      streamId,
      playlistId,
      userId
    } = body
    
    if (!name || !startDate || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const schedule = await db.schedule.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isRecurring: isRecurring || false,
        recurringPattern,
        isActive: isActive !== undefined ? isActive : true,
        streamId,
        playlistId,
        userId
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        stream: {
          select: { id: true, name: true, streamKey: true }
        },
        playlist: {
          select: { id: true, name: true }
        }
      }
    })
    
    return NextResponse.json(schedule, { status: 201 })
  } catch (error) {
    console.error('Error creating schedule:', error)
    return NextResponse.json(
      { error: 'Failed to create schedule' },
      { status: 500 }
    )
  }
}