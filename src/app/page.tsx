'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Pause, 
  Settings, 
  Calendar, 
  List, 
  Monitor, 
  AlertCircle,
  CheckCircle,
  Clock,
  Server,
  Video
} from 'lucide-react'
import { DashboardOverview } from '@/components/dashboard/overview'
import { ScheduleManager } from '@/components/dashboard/schedule-manager'
import { PlaylistManager } from '@/components/dashboard/playlist-manager'
import { StreamManager } from '@/components/dashboard/stream-manager'
import { SystemLogs } from '@/components/dashboard/system-logs'
import { FlussonicTest } from '@/components/dashboard/flussonic-test'

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Video className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">Flussonic Playout System</h1>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse" />
                System Active
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button size="sm">
                <Server className="h-4 w-4 mr-2" />
                Connect Server
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Monitor className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="schedules" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Schedules</span>
            </TabsTrigger>
            <TabsTrigger value="playlists" className="flex items-center space-x-2">
              <List className="h-4 w-4" />
              <span>Playlists</span>
            </TabsTrigger>
            <TabsTrigger value="streams" className="flex items-center space-x-2">
              <Video className="h-4 w-4" />
              <span>Streams</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span>Logs</span>
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center space-x-2">
              <Server className="h-4 w-4" />
              <span>Test</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="schedules" className="space-y-6">
            <ScheduleManager />
          </TabsContent>

          <TabsContent value="playlists" className="space-y-6">
            <PlaylistManager />
          </TabsContent>

          <TabsContent value="streams" className="space-y-6">
            <StreamManager />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <SystemLogs />
          </TabsContent>

          <TabsContent value="test" className="space-y-6">
            <FlussonicTest />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}