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
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Clock,
  Repeat,
  Video,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface Schedule {
  id: string
  name: string
  description?: string
  startDate: string
  endDate?: string
  isRecurring: boolean
  recurringPattern?: string
  isActive: boolean
  status: 'pending' | 'running' | 'completed' | 'failed'
  streamName?: string
  playlistName?: string
  createdAt: string
}

export function ScheduleManager() {
  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: '1',
      name: 'Morning News Playout',
      description: 'Daily morning news broadcast',
      startDate: '2024-01-15T08:00:00',
      endDate: '2024-01-15T09:00:00',
      isRecurring: true,
      recurringPattern: '0 8 * * *',
      isActive: true,
      status: 'running',
      streamName: 'news-primary',
      playlistName: 'morning-news',
      createdAt: '2024-01-10T10:00:00'
    },
    {
      id: '2',
      name: 'Weekend Movie Marathon',
      description: 'Weekend movie playlist',
      startDate: '2024-01-20T18:00:00',
      endDate: '2024-01-20T23:00:00',
      isRecurring: false,
      isActive: true,
      status: 'pending',
      streamName: 'movies-secondary',
      playlistName: 'weekend-movies',
      createdAt: '2024-01-12T14:30:00'
    }
  ])

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-green-500">Running</Badge>
      case 'pending':
        return <Badge className="bg-blue-500">Pending</Badge>
      case 'completed':
        return <Badge className="bg-gray-500">Completed</Badge>
      case 'failed':
        return <Badge className="bg-red-500">Failed</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const toggleScheduleStatus = (id: string) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.id === id 
        ? { ...schedule, isActive: !schedule.isActive }
        : schedule
    ))
  }

  const deleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(schedule => schedule.id !== id))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Schedule Management</h2>
          <p className="text-muted-foreground">Manage and automate your playout schedules</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Schedule</DialogTitle>
              <DialogDescription>
                Set up a new playout schedule for your streams
              </DialogDescription>
            </DialogHeader>
            <ScheduleForm 
              onSubmit={(data) => {
                console.log('Creating schedule:', data)
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
            <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedules.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schedules.filter(s => s.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Running Now</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schedules.filter(s => s.status === 'running').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recurring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schedules.filter(s => s.isRecurring).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedules Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Schedules</CardTitle>
          <CardDescription>
            View and manage all your playout schedules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Stream</TableHead>
                <TableHead>Playlist</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recurring</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{schedule.name}</div>
                      {schedule.description && (
                        <div className="text-sm text-muted-foreground">
                          {schedule.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Video className="h-4 w-4" />
                      <span>{schedule.streamName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{schedule.playlistName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(schedule.startDate)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(schedule.status)}
                  </TableCell>
                  <TableCell>
                    {schedule.isRecurring ? (
                      <div className="flex items-center space-x-1 text-blue-600">
                        <Repeat className="h-4 w-4" />
                        <span className="text-sm">Yes</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={schedule.isActive}
                      onCheckedChange={() => toggleScheduleStatus(schedule.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingSchedule(schedule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSchedule(schedule.id)}
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

interface ScheduleFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
}

function ScheduleForm({ onSubmit, onCancel }: ScheduleFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    isRecurring: false,
    recurringPattern: '',
    streamId: '',
    playlistId: '',
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
          <Label htmlFor="name">Schedule Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter schedule name"
            required
          />
        </div>
        
        <div className="col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter schedule description"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="startDate">Start Date & Time</Label>
          <Input
            id="startDate"
            type="datetime-local"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="endDate">End Date & Time (Optional)</Label>
          <Input
            id="endDate"
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="streamId">Target Stream</Label>
          <Select value={formData.streamId} onValueChange={(value) => setFormData(prev => ({ ...prev, streamId: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select stream" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="news-primary">News Primary</SelectItem>
              <SelectItem value="movies-secondary">Movies Secondary</SelectItem>
              <SelectItem value="sports-live">Sports Live</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="playlistId">Playlist</Label>
          <Select value={formData.playlistId} onValueChange={(value) => setFormData(prev => ({ ...prev, playlistId: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select playlist" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="morning-news">Morning News</SelectItem>
              <SelectItem value="weekend-movies">Weekend Movies</SelectItem>
              <SelectItem value="sports-highlights">Sports Highlights</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isRecurring"
            checked={formData.isRecurring}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRecurring: checked }))}
          />
          <Label htmlFor="isRecurring">Recurring Schedule</Label>
        </div>

        {formData.isRecurring && (
          <div className="col-span-2">
            <Label htmlFor="recurringPattern">Cron Pattern</Label>
            <Input
              id="recurringPattern"
              value={formData.recurringPattern}
              onChange={(e) => setFormData(prev => ({ ...prev, recurringPattern: e.target.value }))}
              placeholder="0 8 * * * (8 AM daily)"
            />
          </div>
        )}

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
          Create Schedule
        </Button>
      </div>
    </form>
  )
}