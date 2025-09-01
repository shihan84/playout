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
    
    const [playlists, total] = await Promise.all([
      db.playlist.findMany({
        where: whereClause,
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          items: {
            orderBy: { order: 'asc' }
          },
          _count: {
            select: { items: true, schedules: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.playlist.count({ where: whereClause })
    ])
    
    return NextResponse.json({
      playlists,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching playlists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch playlists' },
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
      isActive,
      userId,
      items
    } = body
    
    if (!name || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const playlist = await db.playlist.create({
      data: {
        name,
        description,
        isActive: isActive !== undefined ? isActive : true,
        userId,
        items: items ? {
          create: items.map((item: any, index: number) => ({
            title: item.title,
            sourceUrl: item.sourceUrl,
            duration: item.duration,
            order: index + 1
          }))
        } : undefined
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        items: {
          orderBy: { order: 'asc' }
        }
      }
    })
    
    return NextResponse.json(playlist, { status: 201 })
  } catch (error) {
    console.error('Error creating playlist:', error)
    return NextResponse.json(
      { error: 'Failed to create playlist' },
      { status: 500 }
    )
  }
}