import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const schedule = await db.schedule.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        stream: {
          select: { id: true, name: true, streamKey: true }
        },
        playlist: {
          select: { id: true, name: true, items: { orderBy: { order: 'asc' } } }
        },
        items: {
          orderBy: { order: 'asc' }
        }
      }
    })
    
    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Error fetching schedule:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      playlistId
    } = body
    
    const existingSchedule = await db.schedule.findUnique({
      where: { id: params.id }
    })
    
    if (!existingSchedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      )
    }
    
    const schedule = await db.schedule.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(isRecurring !== undefined && { isRecurring }),
        ...(recurringPattern !== undefined && { recurringPattern }),
        ...(isActive !== undefined && { isActive }),
        ...(streamId !== undefined && { streamId }),
        ...(playlistId !== undefined && { playlistId })
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
    
    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Error updating schedule:', error)
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existingSchedule = await db.schedule.findUnique({
      where: { id: params.id }
    })
    
    if (!existingSchedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      )
    }
    
    await db.schedule.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ message: 'Schedule deleted successfully' })
  } catch (error) {
    console.error('Error deleting schedule:', error)
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    )
  }
}