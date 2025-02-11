import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { BiRefresh } from 'react-icons/bi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { isLocalUrl } from '@/utils/dom'
import { reloadPreview } from '@webcontainer/api'
import { useAtomValue } from 'jotai'
import { serverInfoAtom } from '@/store/global'

export interface IPreviewRef {
  setUrl: (url: string) => void
}

export const Preview = forwardRef<IPreviewRef>((_, ref) => {
  const addressInputRef = useRef<HTMLInputElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [currentUrl, setCurrentUrl] = useState('')
  const serverInfo = useAtomValue(serverInfoAtom)

  const handleRefresh = () => {
    if (!iframeRef.current?.contentWindow) return
    reloadPreview(iframeRef.current)
  }

  const handleAddressSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!iframeRef.current || !addressInputRef.current) return
    const url = addressInputRef.current?.value || ''
    if (isLocalUrl(serverInfo, url)) {
      iframeRef.current.src = url
      setCurrentUrl(url)
    } else {
      resetUrl()
    }
    addressInputRef.current?.blur()
  }

  const resetUrl = () => {
    if (!addressInputRef.current) return
    addressInputRef.current.value = currentUrl
  }

  useImperativeHandle(ref, () => ({
    setUrl: (url) => {
      if (!iframeRef.current) return
      iframeRef.current.src = url
      if (!addressInputRef.current) return
      addressInputRef.current.value = url
      setCurrentUrl(url)
    },
  }))

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center gap-1 p-1 border-b">
        <div className="flex gap-0.5">
          <Button
            disabled={!currentUrl}
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            title="刷新"
          >
            <BiRefresh className="w-3.5 h-3.5" />
          </Button>
        </div>
        <form onSubmit={handleAddressSubmit} className="flex-1">
          <Input
            ref={addressInputRef}
            type="text"
            className="bg-secondary h-7 text-sm"
            // onBlur={resetUrl}
            disabled={!currentUrl}
          />
        </form>
      </div>
      <div className="flex-1">
        <iframe
          ref={iframeRef}
          className="h-full w-full"
          allowFullScreen={false}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
        />
      </div>
    </div>
  )
})
