'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  List, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Clock,
  Video,
  GripVertical,
  MoreHorizontal,
  Eye,
  Copy
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface PlaylistItem {
  id: string
  title: string
  sourceUrl: string
  duration: number
  order: number
}

interface Playlist {
  id: string
  name: string
  description?: string
  isActive: boolean
  itemCount: number
  totalDuration: number
  createdAt: string
  items: PlaylistItem[]
}

export function PlaylistManager() {
  const [playlists, setPlaylists] = useState<Playlist[]>([
    {
      id: '1',
      name: 'Morning News',
      description: 'Daily morning news segments',
      isActive: true,
      itemCount: 5,
      totalDuration: 1800, // 30 minutes
      createdAt: '2024-01-10T10:00:00',
      items: [
        { id: '1-1', title: 'Headlines', sourceUrl: '/vod/headlines.mp4', duration: 300, order: 1 },
        { id: '1-2', title: 'Weather', sourceUrl: '/vod/weather.mp4', duration: 180, order: 2 },
        { id: '1-3', title: 'Sports', sourceUrl: '/vod/sports.mp4', duration: 420, order: 3 },
        { id: '1-4', title: 'Business', sourceUrl: '/vod/business.mp4', duration: 360, order: 4 },
        { id: '1-5', title: 'Closing', sourceUrl: '/vod/closing.mp4', duration: 540, order: 5 }
      ]
    },
    {
      id: '2',
      name: 'Weekend Movies',
      description: 'Weekend movie playlist',
      isActive: true,
      itemCount: 3,
      totalDuration: 7200, // 2 hours
      createdAt: '2024-01-12T14:30:00',
      items: [
        { id: '2-1', title: 'Action Movie 1', sourceUrl: '/vod/action1.mp4', duration: 5400, order: 1 },
        { id: '2-2', title: 'Comedy Special', sourceUrl: '/vod/comedy1.mp4', duration: 1800, order: 2 },
        { id: '2-3', title: 'Documentary', sourceUrl: '/vod/doc1.mp4', duration: 3600, order: 3 }
      ]
    }
  ])

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [isViewItemsOpen, setIsViewItemsOpen] = useState(false)

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const togglePlaylistStatus = (id: string) => {
    setPlaylists(prev => prev.map(playlist => 
      playlist.id === id 
        ? { ...playlist, isActive: !playlist.isActive }
        : playlist
    ))
  }

  const deletePlaylist = (id: string) => {
    setPlaylists(prev => prev.filter(playlist => playlist.id !== id))
  }

  const duplicatePlaylist = (id: string) => {
    const playlist = playlists.find(p => p.id === id)
    if (playlist) {
      const newPlaylist = {
        ...playlist,
        id: Date.now().toString(),
        name: `${playlist.name} (Copy)`,
        createdAt: new Date().toISOString()
      }
      setPlaylists(prev => [...prev, newPlaylist])
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Playlist Management</h2>
          <p className="text-muted-foreground">Manage your VOD playlists for playout</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Playlist
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Playlist</DialogTitle>
              <DialogDescription>
                Create a new VOD playlist for your playout schedules
              </DialogDescription>
            </DialogHeader>
            <PlaylistForm 
              onSubmit={(data) => {
                console.log('Creating playlist:', data)
                setIsCreateDialogOpen(false)
              }}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Playlists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playlists.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Playlists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {playlists.filter(p => p.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {playlists.reduce((sum, p) => sum + p.itemCount, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(playlists.reduce((sum, p) => sum + p.totalDuration, 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Playlists Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Playlists</CardTitle>
          <CardDescription>
            View and manage your VOD playlists
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {playlists.map((playlist) => (
                <TableRow key={playlist.id}>
                  <TableCell>
                    <div className="font-medium">{playlist.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground max-w-xs truncate">
                      {playlist.description || 'No description'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <List className="h-4 w-4" />
                      <span>{playlist.itemCount} items</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(playlist.totalDuration)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={playlist.isActive ? "default" : "secondary"}>
                      {playlist.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(playlist.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={playlist.isActive}
                        onCheckedChange={() => togglePlaylistStatus(playlist.id)}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => {
                            setSelectedPlaylist(playlist)
                            setIsViewItemsOpen(true)
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Items
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicatePlaylist(playlist.id)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deletePlaylist(playlist.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Playlist Items Dialog */}
      <Dialog open={isViewItemsOpen} onOpenChange={setIsViewItemsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Playlist Items - {selectedPlaylist?.name}</DialogTitle>
            <DialogDescription>
              Manage items in this playlist
            </DialogDescription>
          </DialogHeader>
          {selectedPlaylist && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {selectedPlaylist.itemCount} items • {formatDuration(selectedPlaylist.totalDuration)}
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
              
              <div className="space-y-2">
                {selectedPlaylist.items.map((item, index) => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {item.sourceUrl}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDuration(item.duration)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface PlaylistFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
}

function PlaylistForm({ onSubmit, onCancel }: PlaylistFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Playlist Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter playlist name"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter playlist description"
            rows={3}
          />
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
          Create Playlist
        </Button>
      </div>
    </form>
  )
}