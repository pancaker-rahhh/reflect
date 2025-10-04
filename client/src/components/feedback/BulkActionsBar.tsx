import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, X } from 'lucide-react'

interface BulkActionsBarProps {
  selectedCount: number
  onConvertSelected: () => void
  onClearSelection: () => void
  isConverting?: boolean
}

export function BulkActionsBar({
  selectedCount,
  onConvertSelected,
  onClearSelection,
  isConverting = false,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-tertiary border border-border rounded-lg shadow-lg px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {selectedCount} selected
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onConvertSelected}
            disabled={isConverting}
            className="bg-primary hover:bg-primary/90"
          >
            <ArrowRight className="h-4 w-4 mr-1" />
            Convert to Roadmap
          </Button>

          <Button size="sm" variant="outline" onClick={onClearSelection} disabled={isConverting}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  )
}
