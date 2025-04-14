import { useRef, useEffect } from 'react'
import { WebContainerService } from '@/services/WebContainerService'
import {
  Terminal,
  IPreviewRef,
  Preview,
  Editor,
  FileTree,
  Header,
  Welcome,
  PanelGroup,
  RepoInfo,
  ErrorDialog,
  RepoForm,
} from '@/components'
import { ServiceStatus } from '@/constants/serviceStatus'
import { LoadingDialog } from '@/components/LoadingDialog'
import { Toaster } from '@/components/ui/sonner'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { useAtom, useAtomValue } from 'jotai'
import { resolveLeftPanelAtom, serviceStatusAtom } from '@/store/global'
import { useResize, useContainer } from '@/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BiPlus } from 'react-icons/bi'
import { isUseInIframe } from '@/lib/dom'
import { Button } from '@/components/ui/button'
import { baseInfoAtom } from '@/store/repo'
import { editorModelsAtom } from '@/store/editor'
import '@/lib/editor'

function App() {
  const [status, setStatus] = useAtom(serviceStatusAtom)
  const modelMap = useAtomValue(editorModelsAtom) // 编辑器模型
  const hasOpenEditor = modelMap.size > 0 // 是否有打开的编辑器
  const previewRef = useRef<IPreviewRef>(null)
  const resolveLeftPanel = useAtomValue(resolveLeftPanelAtom) // 左侧面板的宽度
  const {
    globalPanelGroupRef,
    leftPanelResize,
    mainPanelGroupRef,
    bottomPanelResize,
    previewPanelResize,
    previewPanelGroupRef,
  } = useResize()
  const portRef = useRef<number>()
  const { coreInit } = useContainer({
    portRef,
    previewRef,
  })
  const { owner, repo, token, gitType } = useAtomValue(baseInfoAtom)

  const formOpen = !owner || !repo || !token || !gitType

  useEffect(() => {
    // iframe中不自动执行
    if (!isUseInIframe() && !formOpen) {
      // 初始化核心服务
      coreInit()
    }
  }, [])

  return (
    <div className="w-full h-[100vh] flex flex-col border overflow-hidden">
      {status === ServiceStatus.NULL ? (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <Button
            size="lg"
            onClick={() => (!formOpen ? coreInit() : setStatus(ServiceStatus.INIT))}
          >
            预览
          </Button>
        </div>
      ) : (
        <>
          {/* headerPanel */}
          <div className="h-10">
            <Header />
          </div>
          <ResizablePanelGroup
            direction="horizontal"
            className="w-full flex-1"
            ref={globalPanelGroupRef}
          >
            {/* leftPanel */}
            <ResizablePanel
              defaultSize={resolveLeftPanel}
              maxSize={70}
              onResize={leftPanelResize}
              minSize={10}
              collapsible
            >
              <PanelGroup
                panels={[
                  {
                    id: 'repo-info',
                    title: '仓库信息',
                    content: <RepoInfo />,
                    defaultOpen: true,
                  },
                  {
                    id: 'file-tree',
                    title: '文件',
                    content: <FileTree />,
                    defaultOpen: true,
                    containerClassName: 'flex-1 min-h-0',
                    className: 'flex-1 min-h-0 overflow-auto -mr-2',
                  },
                ]}
                className="w-full h-full"
              />
            </ResizablePanel>
            <ResizableHandle />
            {/* mainPanel */}
            <ResizablePanel defaultSize={100 - resolveLeftPanel}>
              <ResizablePanelGroup direction="vertical" ref={mainPanelGroupRef}>
                <ResizablePanel defaultSize={75}>
                  <ResizablePanelGroup direction="horizontal" ref={previewPanelGroupRef}>
                    {/* editor */}
                    <ResizablePanel defaultSize={50} minSize={20}>
                      <div className="flex h-full items-center justify-center">
                        {!hasOpenEditor ? <Welcome /> : <Editor />}
                      </div>
                    </ResizablePanel>
                    <ResizableHandle />
                    {/* preview */}
                    <ResizablePanel
                      defaultSize={50}
                      onResize={previewPanelResize}
                      minSize={20}
                      collapsible
                    >
                      <Preview ref={previewRef} />
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </ResizablePanel>
                <ResizableHandle />
                {/* bottomPanel */}
                <ResizablePanel
                  defaultSize={25}
                  onResize={bottomPanelResize}
                  collapsible
                  minSize={5}
                >
                  <div className="w-full h-full items-center justify-center">
                    <Tabs defaultValue="terminal" className="h-full">
                      <div className="flex justify-between pt-2 pr-4">
                        <TabsList className="text-xs bg-transparent h-6">
                          <TabsTrigger value="terminal">终端</TabsTrigger>
                        </TabsList>
                        <TabsContent value="terminal" className="m-0">
                          <BiPlus
                            className="cursor-pointer h-6 w-6 rounded-md"
                            onClick={() => {
                              const service = WebContainerService.getInstance()
                              service.newTerminal()
                            }}
                          />
                        </TabsContent>
                      </div>

                      <div className="h-[calc(100%-2.5rem)] pl-4">
                        <TabsContent value="terminal" className="h-full">
                          <Terminal.Multiple />
                        </TabsContent>
                      </div>
                    </Tabs>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
          <Toaster />
          <LoadingDialog />
          <RepoForm onSubmit={coreInit} open={formOpen} />
          <ErrorDialog />
        </>
      )}
    </div>
  )
}

export default App
