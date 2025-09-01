import { db } from '@/lib/db'
import { ScheduleStatus, LogLevel } from '@prisma/client'

export class SchedulerService {
  private static instance: SchedulerService
  private intervalId: NodeJS.Timeout | null = null
  private isRunning = false

  private constructor() {}

  static getInstance(): SchedulerService {
    if (!SchedulerService.instance) {
      SchedulerService.instance = new SchedulerService()
    }
    return SchedulerService.instance
  }

  async start() {
    if (this.isRunning) {
      console.log('Scheduler is already running')
      return
    }

    console.log('Starting scheduler...')
    this.isRunning = true
    
    // Run immediately on start
    await this.checkAndExecuteSchedules()
    
    // Check every minute
    this.intervalId = setInterval(async () => {
      await this.checkAndExecuteSchedules()
    }, 60000) // 1 minute
  }

  async stop() {
    if (!this.isRunning) {
      console.log('Scheduler is not running')
      return
    }

    console.log('Stopping scheduler...')
    this.isRunning = false
    
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  private async checkAndExecuteSchedules() {
    try {
      const now = new Date()
      
      // Get all active schedules that should run now
      const schedulesToRun = await db.schedule.findMany({
        where: {
          isActive: true,
          startDate: {
            lte: now
          },
          OR: [
            { endDate: null },
            { endDate: { gte: now } }
          ]
        },
        include: {
          stream: true,
          playlist: {
            include: {
              items: {
                orderBy: { order: 'asc' }
              }
            }
          },
          items: {
            where: {
              status: ScheduleStatus.PENDING,
              startTime: {
                lte: now
              }
            },
            orderBy: { order: 'asc' }
          }
        }
      })

      for (const schedule of schedulesToRun) {
        await this.executeSchedule(schedule)
      }

      // Check for recurring schedules
      await this.checkRecurringSchedules(now)

    } catch (error) {
      console.error('Error in scheduler:', error)
      await this.logError('Scheduler error', error)
    }
  }

  private async executeSchedule(schedule: any) {
    try {
      console.log(`Executing schedule: ${schedule.name}`)
      
      // Update schedule status
      await db.schedule.update({
        where: { id: schedule.id },
        data: { 
          // Add any status updates if needed
        }
      })

      // If playlist is associated, create schedule items
      if (schedule.playlist && schedule.items.length === 0) {
        await this.createScheduleItemsFromPlaylist(schedule)
      }

      // Execute pending schedule items
      const pendingItems = schedule.items.filter((item: any) => item.status === ScheduleStatus.PENDING)
      
      for (const item of pendingItems) {
        await this.executeScheduleItem(item, schedule)
      }

      await this.logInfo(`Schedule ${schedule.name} executed successfully`, {
        scheduleId: schedule.id,
        scheduleName: schedule.name
      })

    } catch (error) {
      console.error(`Error executing schedule ${schedule.name}:`, error)
      await this.logError(`Failed to execute schedule ${schedule.name}`, error, {
        scheduleId: schedule.id,
        scheduleName: schedule.name
      })
    }
  }

  private async createScheduleItemsFromPlaylist(schedule: any) {
    if (!schedule.playlist) return

    const items = schedule.playlist.items.map((playlistItem: any, index: number) => {
      const startTime = new Date(schedule.startDate)
      startTime.setSeconds(startTime.getSeconds() + 
        schedule.playlist.items.slice(0, index).reduce((acc: number, item: any) => acc + item.duration, 0)
      )
      
      const endTime = new Date(startTime)
      endTime.setSeconds(endTime.getSeconds() + playlistItem.duration)

      return {
        title: playlistItem.title,
        sourceUrl: playlistItem.sourceUrl,
        duration: playlistItem.duration,
        startTime,
        endTime,
        order: index + 1,
        status: ScheduleStatus.PENDING,
        scheduleId: schedule.id
      }
    })

    await db.scheduleItem.createMany({
      data: items
    })
  }

  private async executeScheduleItem(item: any, schedule: any) {
    try {
      console.log(`Executing schedule item: ${item.title}`)
      
      // Update item status to running
      await db.scheduleItem.update({
        where: { id: item.id },
        data: { status: ScheduleStatus.RUNNING }
      })

      // Here you would integrate with Flussonic API
      // For now, we'll simulate the execution
      await this.simulateFlussonicExecution(item, schedule)

      // Update item status to completed
      await db.scheduleItem.update({
        where: { id: item.id },
        data: { status: ScheduleStatus.COMPLETED }
      })

      await this.logInfo(`Schedule item ${item.title} completed`, {
        scheduleItemId: item.id,
        scheduleId: schedule.id,
        title: item.title
      })

    } catch (error) {
      console.error(`Error executing schedule item ${item.title}:`, error)
      
      await db.scheduleItem.update({
        where: { id: item.id },
        data: { status: ScheduleStatus.FAILED }
      })

      await this.logError(`Failed to execute schedule item ${item.title}`, error, {
        scheduleItemId: item.id,
        scheduleId: schedule.id,
        title: item.title
      })
    }
  }

  private async simulateFlussonicExecution(item: any, schedule: any) {
    // Simulate API call to Flussonic
    console.log(`Simulating Flussonic execution for stream: ${schedule.stream?.name}`)
    console.log(`Playing: ${item.sourceUrl}`)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In a real implementation, you would:
    // 1. Make API calls to Flussonic to start the stream
    // 2. Monitor the playback
    // 3. Handle errors and retries
    // 4. Log detailed metrics
  }

  private async checkRecurringSchedules(now: Date) {
    const recurringSchedules = await db.schedule.findMany({
      where: {
        isActive: true,
        isRecurring: true,
        recurringPattern: {
          not: null
        }
      },
      include: {
        stream: true,
        playlist: true
      }
    })

    for (const schedule of recurringSchedules) {
      if (this.shouldRunRecurringSchedule(schedule, now)) {
        await this.createRecurringScheduleInstance(schedule, now)
      }
    }
  }

  private shouldRunRecurringSchedule(schedule: any, now: Date): boolean {
    // Simple implementation - in production, use a proper cron parser
    if (!schedule.recurringPattern) return false
    
    // For demo purposes, check if it's been more than 24 hours since last run
    const lastRun = new Date(schedule.startDate)
    const hoursSinceLastRun = (now.getTime() - lastRun.getTime()) / (1000 * 60 * 60)
    
    return hoursSinceLastRun >= 24
  }

  private async createRecurringScheduleInstance(schedule: any, now: Date) {
    try {
      const newSchedule = await db.schedule.create({
        data: {
          name: `${schedule.name} - ${now.toISOString()}`,
          description: schedule.description,
          startDate: now,
          isRecurring: false, // This instance is not recurring
          isActive: true,
          userId: schedule.userId,
          streamId: schedule.streamId,
          playlistId: schedule.playlistId
        }
      })

      await this.logInfo(`Created recurring schedule instance`, {
        originalScheduleId: schedule.id,
        newScheduleId: newSchedule.id,
        runTime: now.toISOString()
      })

    } catch (error) {
      console.error('Error creating recurring schedule instance:', error)
      await this.logError('Failed to create recurring schedule instance', error, {
        scheduleId: schedule.id
      })
    }
  }

  private async logInfo(message: string, metadata?: any) {
    await db.log.create({
      data: {
        level: LogLevel.INFO,
        message,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    })
  }

  private async logError(message: string, error: any, metadata?: any) {
    await db.log.create({
      data: {
        level: LogLevel.ERROR,
        message: `${message}: ${error.message}`,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    })
  }

  // Public methods for manual control
  async executeScheduleNow(scheduleId: string) {
    try {
      const schedule = await db.schedule.findUnique({
        where: { id: scheduleId },
        include: {
          stream: true,
          playlist: {
            include: {
              items: {
                orderBy: { order: 'asc' }
              }
            }
          },
          items: {
            where: {
              status: ScheduleStatus.PENDING
            },
            orderBy: { order: 'asc' }
          }
        }
      })

      if (!schedule) {
        throw new Error('Schedule not found')
      }

      await this.executeSchedule(schedule)
      return { success: true, message: 'Schedule executed successfully' }

    } catch (error) {
      console.error('Error executing schedule manually:', error)
      throw error
    }
  }

  async getSchedulerStatus() {
    return {
      isRunning: this.isRunning,
      lastCheck: new Date().toISOString()
    }
  }
}