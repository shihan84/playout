import { NextRequest, NextResponse } from 'next/server'
import { flussonicService } from '@/lib/services/flussonic'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const serverId = formData.get('serverId') as string
    const path = formData.get('path') as string || ''

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!serverId) {
      return NextResponse.json(
        { error: 'Server ID is required' },
        { status: 400 }
      )
    }

    // Get server credentials from database
    const server = await db.server.findUnique({
      where: { id: serverId }
    })

    if (!server) {
      return NextResponse.json(
        { error: 'Server not found' },
        { status: 404 }
      )
    }

    // Add server to service
    flussonicService.addServer({
      id: server.id,
      host: server.host,
      port: server.port,
      username: server.username,
      password: server.password
    })

    // Upload file
    const result = await flussonicService.uploadVodFile(serverId, file, path)

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      result
    })

  } catch (error) {
    console.error('Error uploading file to Flussonic:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}