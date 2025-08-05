import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin } from 'lucide-react'

export function RoadmapSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Roadmap Settings
          </CardTitle>
          <CardDescription>
            Configure your public roadmap visibility and appearance
          </CardDescription>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
            <p>Roadmap settings will be available in a future update.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}