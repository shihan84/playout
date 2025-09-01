'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  Database,
  Calendar,
  Server,
  Video,
  AlertTriangle,
  Info
} from 'lucide-react'

interface LogEntry {
  id: string
  timestamp: string
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
  message: string
  source: 'system' | 'stream' | 'schedule' | 'playlist'
  metadata?: {
    streamName?: string
    scheduleName?: string
    serverName?: string
    userId?: string
    [key: string]: any
  }
}

export function SystemLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: '2024-01-15T14:30:25Z',
      level: 'INFO',
      message: 'Stream "News Primary" started successfully',
      source: 'stream',
      metadata: { streamName: 'News Primary', serverName: 'Main Server' }
    },
    {
      id: '2',
      timestamp: '2024-01-15T14:28:15Z',
      level: 'WARN',
      message: 'High CPU usage detected on Main Server (85%)',
      source: 'system',
      metadata: { serverName: 'Main Server', cpuUsage: 85 }
    },
    {
      id: '3',
      timestamp: '2024-01-15T14:25:00Z',
      level: 'INFO',
      message: 'Schedule "Morning News Playout" executed successfully',
      source: 'schedule',
      metadata: { scheduleName: 'Morning News Playout', duration: 1800 }
    },
    {
      id: '4',
      timestamp: '2024-01-15T14:20:45Z',
      level: 'ERROR',
      message: 'Failed to connect to Backup Server',
      source: 'system',
      metadata: { serverName: 'Backup Server', error: 'Connection timeout' }
    },
    {
      id: '5',
      timestamp: '2024-01-15T14:15:30Z',
      level: 'INFO',
      message: 'Playlist "Weekend Movies" loaded successfully',
      source: 'playlist',
      metadata: { playlistName: 'Weekend Movies', itemCount: 3 }
    },
    {
      id: '6',
      timestamp: '2024-01-15T14:10:00Z',
      level: 'DEBUG',
      message: 'Stream health check completed for all active streams',
      source: 'system',
      metadata: { activeStreams: 3, healthyStreams: 3 }
    }
  ])

  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>(logs)
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    filterLogs()
  }, [logs, searchTerm, levelFilter, sourceFilter])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Simulate new log entries
        const newLog: LogEntry = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          level: Math.random() > 0.7 ? 'INFO' : Math.random() > 0.9 ? 'ERROR' : 'DEBUG',
          message: 'System health check completed',
          source: 'system'
        }
        setLogs(prev => [newLog, ...prev.slice(0, 49)]) // Keep last 50 logs
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const filterLogs = () => {
    let filtered = logs

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.metadata?.streamName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.metadata?.scheduleName?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter)
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(log => log.source === sourceFilter)
    }

    setFilteredLogs(filtered)
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'ERROR':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'WARN':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'INFO':
        return <Info className="h-4 w-4 text-blue-500" />
      case 'DEBUG':
        return <Database className="h-4 w-4 text-gray-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'ERROR':
        return <Badge variant="destructive">ERROR</Badge>
      case 'WARN':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">WARN</Badge>
      case 'INFO':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">INFO</Badge>
      case 'DEBUG':
        return <Badge variant="outline" className="border-gray-500 text-gray-700">DEBUG</Badge>
      default:
        return <Badge variant="outline">UNKNOWN</Badge>
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'system':
        return <Server className="h-4 w-4" />
      case 'stream':
        return <Video className="h-4 w-4" />
      case 'schedule':
        return <Calendar className="h-4 w-4" />
      case 'playlist':
        return <Database className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const exportLogs = () => {
    const logData = filteredLogs.map(log => ({
      timestamp: formatTimestamp(log.timestamp),
      level: log.level,
      source: log.source,
      message: log.message,
      metadata: log.metadata
    }))
    
    const dataStr = JSON.stringify(logData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `flussonic-logs-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getLogStats = () => {
    const stats = {
      total: logs.length,
      errors: logs.filter(l => l.level === 'ERROR').length,
      warnings: logs.filter(l => l.level === 'WARN').length,
      info: logs.filter(l => l.level === 'INFO').length,
      debug: logs.filter(l => l.level === 'DEBUG').length
    }
    return stats
  }

  const stats = getLogStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">System Logs</h2>
          <p className="text-muted-foreground">Monitor system events and activities</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.warnings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.info}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.debug}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="ERROR">Error</SelectItem>
                <SelectItem value="WARN">Warning</SelectItem>
                <SelectItem value="INFO">Info</SelectItem>
                <SelectItem value="DEBUG">Debug</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="stream">Stream</SelectItem>
                <SelectItem value="schedule">Schedule</SelectItem>
                <SelectItem value="playlist">Playlist</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('')
              setLevelFilter('all')
              setSourceFilter('all')
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle>Log Entries</CardTitle>
          <CardDescription>
            {filteredLogs.length} log entries found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {filteredLogs.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No logs found matching your filters
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div key={log.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between space-x-4">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-shrink-0 mt-0.5">
                          {getLevelIcon(log.level)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            {getLevelBadge(log.level)}
                            <Badge variant="outline" className="text-xs">
                              {getSourceIcon(log.source)}
                              <span className="ml-1 capitalize">{log.source}</span>
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(log.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm">{log.message}</p>
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <details className="mt-2">
                              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                View metadata
                              </summary>
                              <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}