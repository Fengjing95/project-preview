import { baseInfoAtom, repoInfoAtom } from '@/store/repo'
import { useAtom, useAtomValue } from 'jotai'
import { leftPanelOpenAtom, bottomPanelOpenAtom, previewPanelOpenAtom } from '@/store/global'
import { useKeyPress } from 'ahooks'
import { KEY_MAP } from '@/constants/keyboard'
import {
  VscGithubInverted,
  VscLayoutPanel,
  VscLayoutPanelOff,
  VscLayoutSidebarLeft,
  VscLayoutSidebarLeftOff,
  VscLayoutSidebarRight,
  VscLayoutSidebarRightOff,
  VscLinkExternal,
} from 'react-icons/vsc'
import { ThemeToggle } from '../ThemeProvider/ThemeToggle'
import { isUseInIframe } from '@/lib/dom'
import { ShareToggle } from '@/components/Header/ShareToggle.tsx'
import { StartToggle } from './StartToggle'
import { cn } from '@/lib/utils'
import { MyTooltip } from '@/components/MyTooltip'
import { Button } from '@/components/ui/button.tsx'

const isInIframe = isUseInIframe()

export function Header() {
  const repoInfo = useAtomValue(repoInfoAtom)
  const { owner, repo } = useAtomValue(baseInfoAtom)
  const [leftPanelOpen, setLeftPanelOpen] = useAtom(leftPanelOpenAtom)
  const [bottomPanelOpen, setBottomPanelOpen] = useAtom(bottomPanelOpenAtom)
  const [previewPanelOpen, setPreviewPanelOpen] = useAtom(previewPanelOpenAtom) // 预览面板

  useKeyPress(KEY_MAP.fileTree.key, () => {
    setLeftPanelOpen(!leftPanelOpen)
  })

  useKeyPress(KEY_MAP.terminal.key, () => {
    setBottomPanelOpen(!bottomPanelOpen)
  })

  return (
    <div className="h-full flex items-center select-none px-4 border-b">
      <div className="flex-1 flex gap-2 items-center">
        <img className="size-8" src="/public/images/logo.png" />
        <div>Project Preview</div>
        <ShareToggle />
      </div>

      {/* 仓库名称 */}
      <div className="flex-1 flex justify-center">
        <a
          href={repoInfo?.repoUrl}
          target="_blank"
          title="前往仓库"
          className={cn(
            'block',
            'rounded-lg',
            'border',
            'cursor-pointer',
            'px-5',
            'text-center',
            'overflow-hidden',
            'text-ellipsis',
            'whitespace-nowrap',
            'min-w-0',
            'max-w-[300px]',
            'flex-1',
          )}
        >
          {owner}/{repo}
        </a>
      </div>

      {/* actions */}
      <div className="flex-1 flex justify-end gap-1">
        <StartToggle />
        <MyTooltip message="左侧面板">
          <Button
            variant="ghost"
            className="px-2"
            onClick={() => {
              setLeftPanelOpen(!leftPanelOpen)
            }}
          >
            {leftPanelOpen ? <VscLayoutSidebarLeft /> : <VscLayoutSidebarLeftOff />}
          </Button>
        </MyTooltip>
        <MyTooltip message="底部面板">
          <Button
            variant="ghost"
            className="px-2"
            onClick={() => {
              setBottomPanelOpen(!bottomPanelOpen)
            }}
          >
            {bottomPanelOpen ? <VscLayoutPanel /> : <VscLayoutPanelOff />}
          </Button>
        </MyTooltip>
        <MyTooltip message="预览面板">
          <Button
            variant="ghost"
            className="px-2"
            onClick={() => {
              setPreviewPanelOpen(!previewPanelOpen)
            }}
          >
            {previewPanelOpen ? <VscLayoutSidebarRight /> : <VscLayoutSidebarRightOff />}
          </Button>
        </MyTooltip>
        {isInIframe && (
          <MyTooltip message="新窗口打开">
            <Button
              variant="ghost"
              className="px-2"
              onClick={() => {
                window.open(window.location.href, '_blank')
              }}
            >
              <VscLinkExternal />
            </Button>
          </MyTooltip>
        )}
        <MyTooltip message="Github">
          <Button
            variant="ghost"
            className="px-2"
            onClick={() => {
              window.open('https://github.com/Fengjing95/project-preview', '_blank')
            }}
          >
            <VscGithubInverted />
          </Button>
        </MyTooltip>
        <ThemeToggle />
      </div>
    </div>
  )
}
