import { ReactNode, useState } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

export interface PanelItem {
  id: string
  title: string
  content: ReactNode
  defaultOpen?: boolean
}

export interface PanelGroupProps {
  panels: PanelItem[]
  className?: string
}

export function PanelGroup({ panels, className }: PanelGroupProps) {
  const [openStates, setOpenStates] = useState<Record<string, boolean>>(() =>
    panels.reduce(
      (acc, panel) => ({
        ...acc,
        [panel.id]: panel.defaultOpen ?? false,
      }),
      {},
    ),
  )

  return (
    <div className={cn('h-full flex flex-col overflow-hidden', className)}>
      {panels.map((panel) => (
        <Collapsible
          key={panel.id}
          open={openStates[panel.id]}
          onOpenChange={(open) => setOpenStates((prev) => ({ ...prev, [panel.id]: open }))}
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between px-2 py-1 bg-secondary">
            <div className="flex items-center gap-2 text-xs font-bold">
              <ChevronRight
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  openStates[panel.id] && 'rotate-90',
                )}
              />
              {panel.title}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent
            className="overflow-auto px-2"
            forceMount
            hidden={!openStates[panel.id]}
          >
            {panel.content}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  )
}
