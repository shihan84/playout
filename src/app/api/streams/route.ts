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
    
    const [streams, total] = await Promise.all([
      db.stream.findMany({
        where: whereClause,
        include: {
          server: {
            select: { id: true, name: true, host: true, port: true }
          },
          schedules: {
            select: { id: true, name: true, isActive: true }
          },
          _count: {
            select: { schedules: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.stream.count({ where: whereClause })
    ])
    
    return NextResponse.json({
      streams,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching streams:', error)
    return NextResponse.json(
      { error: 'Failed to fetch streams' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      streamKey,
      description,
      serverId,
      isActive
    } = body
    
    if (!name || !streamKey || !serverId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Check if stream key already exists
    const existingStream = await db.stream.findUnique({
      where: { streamKey }
    })
    
    if (existingStream) {
      return NextResponse.json(
        { error: 'Stream key already exists' },
        { status: 400 }
      )
    }
    
    const stream = await db.stream.create({
      data: {
        name,
        streamKey,
        description,
        serverId,
        isActive: isActive !== undefined ? isActive : true
      },
      include: {
        server: {
          select: { id: true, name: true, host: true, port: true }
        }
      }
    })
    
    return NextResponse.json(stream, { status: 201 })
  } catch (error) {
    console.error('Error creating stream:', error)
    return NextResponse.json(
      { error: 'Failed to create stream' },
      { status: 500 }
    )
  }
}