'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Video, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Settings,
  Wifi,
  WifiOff,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  Radio,
  Monitor
} from 'lucide-react'

interface Stream {
  id: string
  name: string
  streamKey: string
  description?: string
  serverName: string
  serverHost: string
  isActive: boolean
  status: 'online' | 'offline' | 'error'
  viewers: number
  bitrate: number
  resolution: string
  createdAt: string
  lastActive: string
}

export function StreamManager() {
  const [streams, setStreams] = useState<Stream[]>([
    {
      id: '1',
      name: 'News Primary',
      streamKey: 'news-primary',
      description: 'Primary news broadcast stream',
      serverName: 'Main Server',
      serverHost: 'stream1.example.com',
      isActive: true,
      status: 'online',
      viewers: 1250,
      bitrate: 2500,
      resolution: '1920x1080',
      createdAt: '2024-01-10T10:00:00',
      lastActive: '2024-01-15T14:30:00'
    },
    {
      id: '2',
      name: 'Movies Secondary',
      streamKey: 'movies-secondary',
      description: 'Secondary movie playout stream',
      serverName: 'Backup Server',
      serverHost: 'stream2.example.com',
      isActive: true,
      status: 'online',
      viewers: 450,
      bitrate: 4000,
      resolution: '1920x1080',
      createdAt: '2024-01-12T14:30:00',
      lastActive: '2024-01-15T14:25:00'
    },
    {
      id: '3',
      name: 'Sports Live',
      streamKey: 'sports-live',
      description: 'Live sports events stream',
      serverName: 'Main Server',
      serverHost: 'stream1.example.com',
      isActive: false,
      status: 'offline',
      viewers: 0,
      bitrate: 0,
      resolution: '1280x720',
      createdAt: '2024-01-08T09:00:00',
      lastActive: '2024-01-14T20:00:00'
    }
  ])

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null)
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-500">Online</Badge>
      case 'offline':
        return <Badge className="bg-gray-500">Offline</Badge>
      case 'error':
        return <Badge className="bg-red-500">Error</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const toggleStreamStatus = (id: string) => {
    setStreams(prev => prev.map(stream => 
      stream.id === id 
        ? { 
            ...stream, 
            isActive: !stream.isActive,
            status: !stream.isActive ? 'online' : 'offline'
          }
        : stream
    ))
  }

  const deleteStream = (id: string) => {
    setStreams(prev => prev.filter(stream => stream.id !== id))
  }

  const formatBitrate = (bitrate: number) => {
    if (bitrate >= 1000) {
      return `${(bitrate / 1000).toFixed(1)} Mbps`
    }
    return `${bitrate} kbps`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Stream Management</h2>
          <p className="text-muted-foreground">Manage your Flussonic media streams</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Server Settings
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Stream
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Stream</DialogTitle>
                <DialogDescription>
                  Set up a new stream on your Flussonic server
                </DialogDescription>
              </DialogHeader>
              <StreamForm 
                onSubmit={(data) => {
                  console.log('Creating stream:', data)
                  setIsCreateDialogOpen(false)
                }}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Streams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streams.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Streams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {streams.filter(s => s.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Viewers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {streams.reduce((sum, s) => sum + s.viewers, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Online Servers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2/2</div>
          </CardContent>
        </Card>
      </div>

      {/* Server Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Radio className="h-5 w-5" />
              <span>Main Server</span>
            </CardTitle>
            <CardDescription>stream1.example.com</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className="bg-green-500">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">CPU Usage</span>
                <span className="text-sm">45%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Memory</span>
                <span className="text-sm">2.1 GB / 8 GB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Streams</span>
                <span className="text-sm">2</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Radio className="h-5 w-5" />
              <span>Backup Server</span>
            </CardTitle>
            <CardDescription>stream2.example.com</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className="bg-green-500">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">CPU Usage</span>
                <span className="text-sm">23%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Memory</span>
                <span className="text-sm">1.8 GB / 8 GB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Streams</span>
                <span className="text-sm">1</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Streams Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Streams</CardTitle>
          <CardDescription>
            View and manage all your media streams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Stream Key</TableHead>
                <TableHead>Server</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Viewers</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {streams.map((stream) => (
                <TableRow key={stream.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{stream.name}</div>
                      {stream.description && (
                        <div className="text-sm text-muted-foreground">
                          {stream.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="bg-muted px-2 py-1 rounded text-sm">
                      {stream.streamKey}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Radio className="h-4 w-4" />
                      <span>{stream.serverName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(stream.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{stream.viewers}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{stream.resolution}</div>
                      <div className="text-muted-foreground">
                        {formatBitrate(stream.bitrate)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={stream.isActive}
                      onCheckedChange={() => toggleStreamStatus(stream.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedStream(stream)
                          setIsConfigDialogOpen(true)
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteStream(stream.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

interface StreamFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
}

function StreamForm({ onSubmit, onCancel }: StreamFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    streamKey: '',
    description: '',
    serverId: '',
    isActive: true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="name">Stream Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter stream name"
            required
          />
        </div>
        
        <div className="col-span-2">
          <Label htmlFor="streamKey">Stream Key</Label>
          <Input
            id="streamKey"
            value={formData.streamKey}
            onChange={(e) => setFormData(prev => ({ ...prev, streamKey: e.target.value }))}
            placeholder="Enter stream key"
            required
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter stream description"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="serverId">Target Server</Label>
          <Select value={formData.serverId} onValueChange={(value) => setFormData(prev => ({ ...prev, serverId: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select server" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="server1">Main Server (stream1.example.com)</SelectItem>
              <SelectItem value="server2">Backup Server (stream2.example.com)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Create Stream
        </Button>
      </div>
    </form>
  )
}