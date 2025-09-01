import axios from 'axios'

export interface FlussonicServer {
  id: string
  host: string
  port: number
  username: string
  password: string
}

export interface FlussonicStream {
  name: string
  title?: string
  input: string[]
  outputs: string[]
  options: Record<string, any>
}

export interface FlussonicPlaylist {
  name: string
  sources: string[]
  options: Record<string, any>
}

export class FlussonicService {
  private servers: Map<string, FlussonicServer> = new Map()

  addServer(server: FlussonicServer) {
    this.servers.set(server.id, server)
  }

  removeServer(serverId: string) {
    this.servers.delete(serverId)
  }

  getServer(serverId: string): FlussonicServer | undefined {
    return this.servers.get(serverId)
  }

  private async makeRequest(serverId: string, endpoint: string, method = 'GET', data?: any) {
    const server = this.servers.get(serverId)
    if (!server) {
      throw new Error(`Server ${serverId} not found`)
    }

    const url = `http://${server.host}:${server.port}${endpoint}`
    const auth = Buffer.from(`${server.username}:${server.password}`).toString('base64')

    try {
      const response = await axios({
        method,
        url,
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        data,
        timeout: 10000 // 10 seconds timeout
      })

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Flussonic API error: ${error.response?.data?.message || error.message}`)
      }
      throw error
    }
  }

  // Stream Management
  async createStream(serverId: string, streamConfig: Partial<FlussonicStream>) {
    return this.makeRequest(serverId, '/api/v1/streams', 'POST', streamConfig)
  }

  async updateStream(serverId: string, streamName: string, streamConfig: Partial<FlussonicStream>) {
    return this.makeRequest(serverId, `/api/v1/streams/${streamName}`, 'PUT', streamConfig)
  }

  async deleteStream(serverId: string, streamName: string) {
    return this.makeRequest(serverId, `/api/v1/streams/${streamName}`, 'DELETE')
  }

  async getStream(serverId: string, streamName: string) {
    return this.makeRequest(serverId, `/api/v1/streams/${streamName}`)
  }

  async listStreams(serverId: string) {
    return this.makeRequest(serverId, '/api/v1/streams')
  }

  async startStream(serverId: string, streamName: string) {
    return this.makeRequest(serverId, `/api/v1/streams/${streamName}/start`, 'POST')
  }

  async stopStream(serverId: string, streamName: string) {
    return this.makeRequest(serverId, `/api/v1/streams/${streamName}/stop`, 'POST')
  }

  // Playlist Management
  async createPlaylist(serverId: string, playlistConfig: FlussonicPlaylist) {
    return this.makeRequest(serverId, '/api/v1/playlists', 'POST', playlistConfig)
  }

  async updatePlaylist(serverId: string, playlistName: string, playlistConfig: Partial<FlussonicPlaylist>) {
    return this.makeRequest(serverId, `/api/v1/playlists/${playlistName}`, 'PUT', playlistConfig)
  }

  async deletePlaylist(serverId: string, playlistName: string) {
    return this.makeRequest(serverId, `/api/v1/playlists/${playlistName}`, 'DELETE')
  }

  async getPlaylist(serverId: string, playlistName: string) {
    return this.makeRequest(serverId, `/api/v1/playlists/${playlistName}`)
  }

  async listPlaylists(serverId: string) {
    return this.makeRequest(serverId, '/api/v1/playlists')
  }

  // VOD Playout
  async startPlayout(serverId: string, streamName: string, playlistName: string) {
    return this.makeRequest(serverId, `/api/v1/streams/${streamName}/playout`, 'POST', {
      playlist: playlistName,
      mode: 'vod'
    })
  }

  async stopPlayout(serverId: string, streamName: string) {
    return this.makeRequest(serverId, `/api/v1/streams/${streamName}/playout`, 'DELETE')
  }

  async getPlayoutStatus(serverId: string, streamName: string) {
    return this.makeRequest(serverId, `/api/v1/streams/${streamName}/playout`)
  }

  // Server Status
  async getServerStatus(serverId: string) {
    return this.makeRequest(serverId, '/api/v1/server/status')
  }

  async getServerStats(serverId: string) {
    return this.makeRequest(serverId, '/api/v1/server/stats')
  }

  async getServerConfig(serverId: string) {
    return this.makeRequest(serverId, '/api/v1/server/config')
  }

  // Media Files
  async listVodFiles(serverId: string, path = '') {
    return this.makeRequest(serverId, `/api/v1/vod${path}`)
  }

  async uploadVodFile(serverId: string, file: File, path = '') {
    const server = this.servers.get(serverId)
    if (!server) {
      throw new Error(`Server ${serverId} not found`)
    }

    const url = `http://${server.host}:${server.port}/api/v1/vod${path}`
    const auth = Buffer.from(`${server.username}:${server.password}`).toString('base64')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post(url, formData, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30 seconds timeout for file upload
      })

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Flussonic upload error: ${error.response?.data?.message || error.message}`)
      }
      throw error
    }
  }

  async deleteVodFile(serverId: string, path: string) {
    return this.makeRequest(serverId, `/api/v1/vod${path}`, 'DELETE')
  }

  // Utility Methods
  async testConnection(serverId: string) {
    try {
      const status = await this.getServerStatus(serverId)
      return { success: true, status }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async getStreamHealth(serverId: string, streamName: string) {
    try {
      const [stream, status] = await Promise.all([
        this.getStream(serverId, streamName),
        this.getPlayoutStatus(serverId, streamName)
      ])
      
      return {
        stream,
        playoutStatus: status,
        healthy: stream.active && (!status.error || status.state === 'playing')
      }
    } catch (error) {
      return {
        stream: null,
        playoutStatus: null,
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Batch Operations
  async startMultipleStreams(serverId: string, streamNames: string[]) {
    const results = await Promise.allSettled(
      streamNames.map(name => this.startStream(serverId, name))
    )
    
    return results.map((result, index) => ({
      streamName: streamNames[index],
      success: result.status === 'fulfilled',
      error: result.status === 'rejected' ? result.reason : null
    }))
  }

  async stopMultipleStreams(serverId: string, streamNames: string[]) {
    const results = await Promise.allSettled(
      streamNames.map(name => this.stopStream(serverId, name))
    )
    
    return results.map((result, index) => ({
      streamName: streamNames[index],
      success: result.status === 'fulfilled',
      error: result.status === 'rejected' ? result.reason : null
    }))
  }
}

// Singleton instance
export const flussonicService = new FlussonicService()