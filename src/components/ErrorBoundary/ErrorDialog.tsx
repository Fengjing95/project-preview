import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { errorAtom } from '@/store/global'
import { useAtom } from 'jotai'
import { VscError } from 'react-icons/vsc'

interface ErrorDialogProps {
  error?: Error
}

export function ErrorDialog({ error }: ErrorDialogProps) {
  const [globalError, setGlobalError] = useAtom(errorAtom)

  const open = !!error || !!globalError
  const displayErr = error || globalError

  return (
    <Dialog open={open} onOpenChange={() => setGlobalError(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <VscError className="text-destructive" />
            发生错误
          </DialogTitle>
          <DialogDescription>应用程序遇到了一个错误</DialogDescription>
        </DialogHeader>

        {displayErr && (
          <div className="bg-muted p-4 rounded-md">
            <p className="font-mono text-sm">{displayErr.message}</p>
            {displayErr.stack && (
              <pre className="mt-2 text-xs overflow-auto max-h-[200px] text-wrap">
                {displayErr.stack}
              </pre>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
