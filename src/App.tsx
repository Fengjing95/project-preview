import { useState, useRef, useEffect } from 'react'
import { WebContainerService } from '@/services/WebContainerService'
import { Terminal } from '@/components/Terminal'
import { IPreviewRef, Preview } from '@/components/Preview'
import { Editor } from '@/components/Editor'
import { FileTree } from '@/components/FileTree'
import { ServiceStatus } from '@/constants/serviceStatus'
import { Toaster } from '@/components/ui/sonner'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Header } from '@/components/Header'
import { useAtomValue } from 'jotai'
import { resolveLeftPanelAtom, serviceStatusAtom } from '@/store/global'
import { useResize } from '@/hooks/useResize'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BiPlus } from 'react-icons/bi'
import { Welcome } from '@/components/Welcome'
import { initMonaco, isUseInIframe } from '@/utils/dom'
import { Button } from '@/components/ui/button'
import { useContainer } from './hooks/useContainer'

function App() {
  const status = useAtomValue(serviceStatusAtom)
  const [currentFile, setCurrentFile] = useState('')
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

  useEffect(() => {
    // 初始化编辑器
    initMonaco()
    // iframe中不自动执行
    if (!isUseInIframe()) {
      // 初始化核心服务
      coreInit()
    }
  }, [])

  return (
    <div className="w-full h-[100vh] flex flex-col border overflow-hidden">
      {status === ServiceStatus.INIT && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Button size="lg" onClick={coreInit}>
            预览
          </Button>
        </div>
      )}
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
          <div className="flex h-full items-center justify-center p-2">
            <FileTree onSelect={setCurrentFile} />
          </div>
        </ResizablePanel>
        <ResizableHandle />
        {/* mainPanel */}
        <ResizablePanel defaultSize={100 - resolveLeftPanel}>
          <ResizablePanelGroup direction="vertical" ref={mainPanelGroupRef}>
            <ResizablePanel defaultSize={75}>
              <ResizablePanelGroup direction="horizontal" ref={previewPanelGroupRef}>
                {/* editor */}
                <ResizablePanel defaultSize={50}>
                  <div className="flex h-full items-center justify-center">
                    {!currentFile ? <Welcome /> : <Editor filePath={currentFile} />}
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
            <ResizablePanel defaultSize={25} onResize={bottomPanelResize} collapsible minSize={5}>
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
    </div>
  )
}

export default App
