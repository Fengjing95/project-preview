import { forwardRef, useImperativeHandle, useRef } from 'react'
import { BiRefresh } from 'react-icons/bi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { isLocalUrl } from '@/lib/dom'
import { reloadPreview } from '@webcontainer/api'
import { useAtomValue } from 'jotai'
import { serverInfoAtom } from '@/store/global'
import { MyTooltip } from '../MyTooltip'
import { VscScreenFull, VscScreenNormal } from 'react-icons/vsc'
import { useFullscreen } from 'ahooks'

export interface IPreviewRef {
  setUrl: (url: string) => void
}

export const Preview = forwardRef<IPreviewRef>((_, ref) => {
  const addressInputRef = useRef<HTMLInputElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const previewRef = useRef<HTMLIFrameElement>(null)
  const currentUrlRef = useRef('')
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
      currentUrlRef.current = url
    } else {
      resetUrl()
    }
    addressInputRef.current?.blur()
  }

  const resetUrl = () => {
    if (!addressInputRef.current) return
    addressInputRef.current.value = currentUrlRef.current
  }

  useImperativeHandle(ref, () => ({
    setUrl: (url) => {
      if (!iframeRef.current) return
      iframeRef.current.src = url
      if (!addressInputRef.current) return
      addressInputRef.current.value = url
      currentUrlRef.current = url
    },
  }))

  const [isFullscreen, { toggleFullscreen }] = useFullscreen(previewRef, {
    pageFullscreen: true,
  })

  return (
    <div className="h-full w-full flex flex-col bg-background" ref={previewRef}>
      <div className="flex items-center gap-1 p-1 border-b">
        <div className="flex gap-0.5">
          <Button
            disabled={!serverInfo.appId}
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
            onBlur={resetUrl}
            disabled={!serverInfo.appId}
          />
        </form>
        <MyTooltip message="全屏/还原">
          <Button disabled={!serverInfo.appId} variant="ghost" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? <VscScreenNormal /> : <VscScreenFull />}
          </Button>
        </MyTooltip>
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
