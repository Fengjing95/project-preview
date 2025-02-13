import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { VscShare } from 'react-icons/vsc'
import { Copy } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { copyToClipboard } from '@/lib/clipboard'

export function ShareToggle() {
  const link = window.location.href
  const iframeCode = `<iframe src="${link}" width="1000px"></iframe>`

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <VscShare /> 分享
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>分享</DialogTitle>
          <DialogDescription>分享页面链接或者使用 iframe 标签嵌入</DialogDescription>
        </DialogHeader>

        <div className="flex items-end space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link">链接</Label>
            <Input id="link" defaultValue={link} readOnly />
          </div>
          <Button onClick={() => copyToClipboard(link)}>
            <Copy />
          </Button>
        </div>

        <div className="flex items-end space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="iframe">Iframe(自行调整宽高)</Label>
            <Input id="iframe" defaultValue={iframeCode} readOnly />
          </div>
          <Button onClick={() => copyToClipboard(iframeCode)}>
            <Copy />
          </Button>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              关闭
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
