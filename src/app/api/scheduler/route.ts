import { NextRequest, NextResponse } from 'next/server'
import { SchedulerService } from '@/lib/services/scheduler'

const scheduler = SchedulerService.getInstance()

export async function GET(request: NextRequest) {
  try {
    const status = await scheduler.getSchedulerStatus()
    return NextResponse.json(status)
  } catch (error) {
    console.error('Error getting scheduler status:', error)
    return NextResponse.json(
      { error: 'Failed to get scheduler status' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'start':
        await scheduler.start()
        return NextResponse.json({ message: 'Scheduler started successfully' })
      
      case 'stop':
        await scheduler.stop()
        return NextResponse.json({ message: 'Scheduler stopped successfully' })
      
      case 'execute':
        const { scheduleId } = body
        if (!scheduleId) {
          return NextResponse.json(
            { error: 'Schedule ID is required' },
            { status: 400 }
          )
        }
        const result = await scheduler.executeScheduleNow(scheduleId)
        return NextResponse.json(result)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in scheduler API:', error)
    return NextResponse.json(
      { error: 'Failed to process scheduler action' },
      { status: 500 }
    )
  }
}