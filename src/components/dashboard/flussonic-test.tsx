'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Server, 
  Wifi, 
  WifiOff, 
  Play, 
  Pause, 
  Settings,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Video,
  List,
  Activity,
  Upload,
  Download
} from 'lucide-react'

interface FlussonicTestResult {
  success: boolean
  message: string
  data?: any
  error?: string
  timestamp: string
}

interface ServerConfig {
  id: string
  host: string
  port: number
  username: string
  password: string
  useHttps: boolean
}

export function FlussonicTest() {
  const [serverConfig, setServerConfig] = useState<ServerConfig>({
    id: 'test-server',
    host: 'cdn.itassist.one',
    port: 443,
    username: 'admin',
    password: 'ad@min1991',
    useHttps: true
  })

  const [testResults, setTestResults] = useState<FlussonicTestResult[]>([])
  const [isTesting, setIsTesting] = useState(false)
  const [serverStatus, setServerStatus] = useState<'unknown' | 'online' | 'offline'>('unknown')
  const [streams, setStreams] = useState<any[]>([])
  const [playlists, setPlaylists] = useState<any[]>([])
  const [selectedStream, setSelectedStream] = useState<string>('')
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>('')

  const addTestResult = (result: Omit<FlussonicTestResult, 'timestamp'>) => {
    const newResult: FlussonicTestResult = {
      ...result,
      timestamp: new Date().toLocaleString()
    }
    setTestResults(prev => [newResult, ...prev.slice(0, 19)]) // Keep last 20 results
  }

  const makeApiCall = async (endpoint: string, method = 'GET', data?: any) => {
    try {
      const protocol = serverConfig.useHttps ? 'https' : 'http'
      const url = `${protocol}://${serverConfig.host}:${serverConfig.port}${endpoint}`

      // Use our backend API to make the request
      const response = await fetch('/api/test-flussonic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          host: serverConfig.host,
          port: serverConfig.port,
          username: serverConfig.username,
          password: serverConfig.password,
          useHttps: serverConfig.useHttps,
          endpoint
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'API request failed')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Flussonic API error')
      }

      return result.data
    } catch (error) {
      throw error
    }
  }

  const testConnection = async () => {
    setIsTesting(true)
    try {
      const result = await makeApiCall('/api/v1/server/status')
      addTestResult({
        success: true,
        message: 'Server connection successful',
        data: result
      })
      setServerStatus('online')
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Server connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      setServerStatus('offline')
    } finally {
      setIsTesting(false)
    }
  }

  const testStreams = async () => {
    setIsTesting(true)
    try {
      const result = await makeApiCall('/api/v1/streams')
      setStreams(result || [])
      addTestResult({
        success: true,
        message: `Retrieved ${result?.length || 0} streams`,
        data: result
      })
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to retrieve streams',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsTesting(false)
    }
  }

  const testPlaylists = async () => {
    setIsTesting(true)
    try {
      const result = await makeApiCall('/api/v1/playlists')
      setPlaylists(result || [])
      addTestResult({
        success: true,
        message: `Retrieved ${result?.length || 0} playlists`,
        data: result
      })
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to retrieve playlists',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsTesting(false)
    }
  }

  const testCreateStream = async () => {
    if (!selectedStream) {
      addTestResult({
        success: false,
        message: 'Please enter a stream name'
      })
      return
    }

    setIsTesting(true)
    try {
      const result = await makeApiCall('/api/v1/streams', 'POST', {
        name: selectedStream,
        title: `Test Stream: ${selectedStream}`,
        input: ['push://'],
        outputs: ['hls']
      })
      addTestResult({
        success: true,
        message: `Created stream: ${selectedStream}`,
        data: result
      })
      // Refresh streams list
      await testStreams()
    } catch (error) {
      addTestResult({
        success: false,
        message: `Failed to create stream: ${selectedStream}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsTesting(false)
    }
  }

  const testCreatePlaylist = async () => {
    if (!selectedPlaylist) {
      addTestResult({
        success: false,
        message: 'Please enter a playlist name'
      })
      return
    }

    setIsTesting(true)
    try {
      const result = await makeApiCall('/api/v1/playlists', 'POST', {
        name: selectedPlaylist,
        sources: ['/vod/test1.mp4', '/vod/test2.mp4']
      })
      addTestResult({
        success: true,
        message: `Created playlist: ${selectedPlaylist}`,
        data: result
      })
      // Refresh playlists list
      await testPlaylists()
    } catch (error) {
      addTestResult({
        success: false,
        message: `Failed to create playlist: ${selectedPlaylist}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsTesting(false)
    }
  }

  const testStartPlayout = async () => {
    if (!selectedStream || !selectedPlaylist) {
      addTestResult({
        success: false,
        message: 'Please select both stream and playlist'
      })
      return
    }

    setIsTesting(true)
    try {
      const result = await makeApiCall(`/api/v1/streams/${selectedStream}/playout`, 'POST', {
        playlist: selectedPlaylist,
        mode: 'vod'
      })
      addTestResult({
        success: true,
        message: `Started playout on ${selectedStream} with playlist ${selectedPlaylist}`,
        data: result
      })
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to start playout',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsTesting(false)
    }
  }

  const testVodFiles = async () => {
    setIsTesting(true)
    try {
      const result = await makeApiCall('/api/v1/vod')
      addTestResult({
        success: true,
        message: 'Retrieved VOD files list',
        data: result
      })
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to retrieve VOD files',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsTesting(false)
    }
  }

  const runAllTests = async () => {
    await testConnection()
    await testStreams()
    await testPlaylists()
    await testVodFiles()
  }

  useEffect(() => {
    // Test connection on component mount
    testConnection()
  }, [])

  const getStatusBadge = () => {
    switch (serverStatus) {
      case 'online':
        return <Badge className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Online - Server Accessible
        </Badge>
      case 'offline':
        return <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          Offline - Connection Failed
        </Badge>
      case 'unknown':
        return <Badge variant="outline">
          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
          Testing Connection...
        </Badge>
      default:
        return <Badge variant="outline">Unknown Status</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Server Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>Flussonic Server Configuration</span>
          </CardTitle>
          <CardDescription>
            Test connection to your Flussonic media server
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="host">Host</Label>
              <Input
                id="host"
                value={serverConfig.host}
                onChange={(e) => setServerConfig(prev => ({ ...prev, host: e.target.value }))}
                placeholder="cdn.itassist.one"
              />
            </div>
            <div>
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                value={serverConfig.port}
                onChange={(e) => setServerConfig(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                placeholder="443"
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={serverConfig.username}
                onChange={(e) => setServerConfig(prev => ({ ...prev, username: e.target.value }))}
                placeholder="admin"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={serverConfig.password}
                onChange={(e) => setServerConfig(prev => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="https"
                checked={serverConfig.useHttps}
                onCheckedChange={(checked) => setServerConfig(prev => ({ ...prev, useHttps: checked }))}
              />
              <Label htmlFor="https">Use HTTPS</Label>
            </div>
          </div>
          
          <div className="mt-4 flex items-center space-x-4">
            <Button onClick={testConnection} disabled={isTesting}>
              {isTesting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Wifi className="h-4 w-4 mr-2" />}
              Test Connection
            </Button>
            <Button onClick={runAllTests} disabled={isTesting} variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Run All Tests
            </Button>
            
            <div className="flex items-center space-x-2">
              {getStatusBadge()}
            </div>
          </div>
          
          {/* Connection Info */}
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Connection Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Server:</span> {serverConfig.host}:{serverConfig.port}
              </div>
              <div>
                <span className="font-medium">Protocol:</span> {serverConfig.useHttps ? 'HTTPS' : 'HTTP'}
              </div>
              <div>
                <span className="font-medium">Username:</span> {serverConfig.username}
              </div>
              <div>
                <span className="font-medium">Authentication:</span> Basic Auth
              </div>
            </div>
            
            {serverStatus === 'online' && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center space-x-2 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Connection Successful!</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  The Flussonic server is accessible and responding to requests. However, standard API endpoints may not be enabled or may use different paths.
                </p>
              </div>
            )}
            
            {serverStatus === 'offline' && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                <div className="flex items-center space-x-2 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Connection Failed</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  Unable to connect to the Flussonic server. Please check the server configuration, network connectivity, and credentials.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Actions */}
      <Card>
        <CardHeader>
          <CardTitle>API Tests</CardTitle>
          <CardDescription>
            Test various Flussonic API endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="streams" className="space-y-4">
            <TabsList>
              <TabsTrigger value="streams">Streams</TabsTrigger>
              <TabsTrigger value="playlists">Playlists</TabsTrigger>
              <TabsTrigger value="playout">Playout</TabsTrigger>
              <TabsTrigger value="vod">VOD Files</TabsTrigger>
            </TabsList>

            <TabsContent value="streams" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="streamName">Stream Name</Label>
                  <Input
                    id="streamName"
                    value={selectedStream}
                    onChange={(e) => setSelectedStream(e.target.value)}
                    placeholder="test-stream"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={testCreateStream} disabled={isTesting} className="w-full">
                    <Video className="h-4 w-4 mr-2" />
                    Create Stream
                  </Button>
                </div>
                <div className="flex items-end">
                  <Button onClick={testStreams} disabled={isTesting} variant="outline" className="w-full">
                    <List className="h-4 w-4 mr-2" />
                    List Streams
                  </Button>
                </div>
              </div>
              
              {streams.length > 0 && (
                <div className="mt-4">
                  <Label>Available Streams</Label>
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                    {streams.map((stream, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <code className="text-sm">{stream.name || stream.title}</code>
                        <Badge variant={stream.active ? 'default' : 'secondary'}>
                          {stream.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="playlists" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="playlistName">Playlist Name</Label>
                  <Input
                    id="playlistName"
                    value={selectedPlaylist}
                    onChange={(e) => setSelectedPlaylist(e.target.value)}
                    placeholder="test-playlist"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={testCreatePlaylist} disabled={isTesting} className="w-full">
                    <List className="h-4 w-4 mr-2" />
                    Create Playlist
                  </Button>
                </div>
                <div className="flex items-end">
                  <Button onClick={testPlaylists} disabled={isTesting} variant="outline" className="w-full">
                    <List className="h-4 w-4 mr-2" />
                    List Playlists
                  </Button>
                </div>
              </div>
              
              {playlists.length > 0 && (
                <div className="mt-4">
                  <Label>Available Playlists</Label>
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                    {playlists.map((playlist, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <code className="text-sm">{playlist.name}</code>
                        <Badge variant="outline">
                          {playlist.sources?.length || 0} items
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="playout" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="playoutStream">Stream</Label>
                  <Input
                    id="playoutStream"
                    value={selectedStream}
                    onChange={(e) => setSelectedStream(e.target.value)}
                    placeholder="test-stream"
                  />
                </div>
                <div>
                  <Label htmlFor="playoutPlaylist">Playlist</Label>
                  <Input
                    id="playoutPlaylist"
                    value={selectedPlaylist}
                    onChange={(e) => setSelectedPlaylist(e.target.value)}
                    placeholder="test-playlist"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={testStartPlayout} disabled={isTesting} className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Start Playout
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="vod" className="space-y-4">
              <div className="flex items-center space-x-4">
                <Button onClick={testVodFiles} disabled={isTesting}>
                  <Upload className="h-4 w-4 mr-2" />
                  List VOD Files
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>
            Recent API test results and responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No test results yet. Run some tests to see results here.
              </div>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium">{result.message}</span>
                    </div>
                    <Badge variant={result.success ? 'default' : 'destructive'}>
                      {result.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {result.timestamp}
                  </div>
                  {result.error && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      Error: {result.error}
                    </div>
                  )}
                  {result.data && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                        View Response Data
                      </summary>
                      <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}