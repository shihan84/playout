import { NextRequest, NextResponse } from 'next/server'
import { flussonicService } from '@/lib/services/flussonic'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const serverId = searchParams.get('serverId')
    const streamName = searchParams.get('streamName')
    const playlistName = searchParams.get('playlistName')

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

    switch (action) {
      case 'status':
        const status = await flussonicService.getServerStatus(serverId)
        return NextResponse.json(status)

      case 'streams':
        const streams = await flussonicService.listStreams(serverId)
        return NextResponse.json(streams)

      case 'playlists':
        const playlists = await flussonicService.listPlaylists(serverId)
        return NextResponse.json(playlists)

      case 'stream':
        if (!streamName) {
          return NextResponse.json(
            { error: 'Stream name is required' },
            { status: 400 }
          )
        }
        const stream = await flussonicService.getStream(serverId, streamName)
        return NextResponse.json(stream)

      case 'playlist':
        if (!playlistName) {
          return NextResponse.json(
            { error: 'Playlist name is required' },
            { status: 400 }
          )
        }
        const playlist = await flussonicService.getPlaylist(serverId, playlistName)
        return NextResponse.json(playlist)

      case 'playout':
        if (!streamName) {
          return NextResponse.json(
            { error: 'Stream name is required' },
            { status: 400 }
          )
        }
        const playoutStatus = await flussonicService.getPlayoutStatus(serverId, streamName)
        return NextResponse.json(playoutStatus)

      case 'vod':
        const path = searchParams.get('path') || ''
        const vodFiles = await flussonicService.listVodFiles(serverId, path)
        return NextResponse.json(vodFiles)

      case 'health':
        if (!streamName) {
          return NextResponse.json(
            { error: 'Stream name is required' },
            { status: 400 }
          )
        }
        const health = await flussonicService.getStreamHealth(serverId, streamName)
        return NextResponse.json(health)

      case 'test':
        const testResult = await flussonicService.testConnection(serverId)
        return NextResponse.json(testResult)

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in Flussonic API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, serverId, ...data } = body

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

    switch (action) {
      case 'createStream':
        const streamResult = await flussonicService.createStream(serverId, data)
        return NextResponse.json(streamResult)

      case 'updateStream':
        if (!data.streamName) {
          return NextResponse.json(
            { error: 'Stream name is required' },
            { status: 400 }
          )
        }
        const updateResult = await flussonicService.updateStream(serverId, data.streamName, data)
        return NextResponse.json(updateResult)

      case 'deleteStream':
        if (!data.streamName) {
          return NextResponse.json(
            { error: 'Stream name is required' },
            { status: 400 }
          )
        }
        const deleteResult = await flussonicService.deleteStream(serverId, data.streamName)
        return NextResponse.json(deleteResult)

      case 'startStream':
        if (!data.streamName) {
          return NextResponse.json(
            { error: 'Stream name is required' },
            { status: 400 }
          )
        }
        const startResult = await flussonicService.startStream(serverId, data.streamName)
        return NextResponse.json(startResult)

      case 'stopStream':
        if (!data.streamName) {
          return NextResponse.json(
            { error: 'Stream name is required' },
            { status: 400 }
          )
        }
        const stopResult = await flussonicService.stopStream(serverId, data.streamName)
        return NextResponse.json(stopResult)

      case 'createPlaylist':
        const playlistResult = await flussonicService.createPlaylist(serverId, data)
        return NextResponse.json(playlistResult)

      case 'updatePlaylist':
        if (!data.playlistName) {
          return NextResponse.json(
            { error: 'Playlist name is required' },
            { status: 400 }
          )
        }
        const updatePlaylistResult = await flussonicService.updatePlaylist(serverId, data.playlistName, data)
        return NextResponse.json(updatePlaylistResult)

      case 'deletePlaylist':
        if (!data.playlistName) {
          return NextResponse.json(
            { error: 'Playlist name is required' },
            { status: 400 }
          )
        }
        const deletePlaylistResult = await flussonicService.deletePlaylist(serverId, data.playlistName)
        return NextResponse.json(deletePlaylistResult)

      case 'startPlayout':
        if (!data.streamName || !data.playlistName) {
          return NextResponse.json(
            { error: 'Stream name and playlist name are required' },
            { status: 400 }
          )
        }
        const playoutResult = await flussonicService.startPlayout(serverId, data.streamName, data.playlistName)
        return NextResponse.json(playoutResult)

      case 'stopPlayout':
        if (!data.streamName) {
          return NextResponse.json(
            { error: 'Stream name is required' },
            { status: 400 }
          )
        }
        const stopPlayoutResult = await flussonicService.stopPlayout(serverId, data.streamName)
        return NextResponse.json(stopPlayoutResult)

      case 'startMultiple':
        if (!data.streamNames || !Array.isArray(data.streamNames)) {
          return NextResponse.json(
            { error: 'Stream names array is required' },
            { status: 400 }
          )
        }
        const multiStartResult = await flussonicService.startMultipleStreams(serverId, data.streamNames)
        return NextResponse.json(multiStartResult)

      case 'stopMultiple':
        if (!data.streamNames || !Array.isArray(data.streamNames)) {
          return NextResponse.json(
            { error: 'Stream names array is required' },
            { status: 400 }
          )
        }
        const multiStopResult = await flussonicService.stopMultipleStreams(serverId, data.streamNames)
        return NextResponse.json(multiStopResult)

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in Flussonic API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}