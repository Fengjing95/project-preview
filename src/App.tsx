import { useState, useRef } from 'react'
import { WebContainerService } from '@/services/WebContainerService'
import { Terminal } from '@/components/Terminal'
import { Preview } from '@/components/Preview'
import { Editor } from '@/components/Editor'
import { FileTree } from '@/components/FileTree'
import { ServiceStatus } from '@/constants/serviceStatus'
import { emitEvent, EventName } from '@/utils/evenemitter'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Header } from '@/components/Header'
import { useAtomValue } from 'jotai'
import { baseInfoAtom } from '@/store/repo'
import { resolveLeftPanelAtom, serviceStatusAtom } from '@/store/global'
import { useResize } from '@/hooks/useResize'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BiPlus } from 'react-icons/bi'
import { Welcome } from '@/components/Welcome'
import { initMonaco } from '@/utils/dom'
import { Button } from '@/components/ui/button'
import './App.css'
import { useAtom } from 'jotai'

function App() {
  const [status, setStatus] = useAtom(serviceStatusAtom)
  const [currentFile, setCurrentFile] = useState('')
  const previewRef = useRef<HTMLIFrameElement>(null)
  const resolveLeftPanel = useAtomValue(resolveLeftPanelAtom) // 左侧面板的宽度
  const { owner, repo, branch, repository } = useAtomValue(baseInfoAtom)
  const { globalPanelGroupRef, leftPanelResize, mainPanelGroupRef, bottomPanelResize } = useResize()
  const [isLoading, setIsLoading] = useState(false)
  const portRef = useRef<number>()

  const handlePreview = async () => {
    if (!owner || !repo || !repository) {
      return
    }

    setIsLoading(true)
    try {
      // 获取仓库文件系统
      const { fileSystem } = await repository.fetchRepository(owner, repo, branch)
      setStatus(ServiceStatus.PULLING)

      // 初始化 WebContainer 服务
      const container = WebContainerService.getInstance()
      // 设置输出内容的显示方式
      container.setOutputCallback((id, data) => {
        emitEvent(EventName.CONTAINER_OUTPUT, id, data)
      })
      const instance = await container.initialize()
      setStatus(ServiceStatus.CREATE_INSTANCE)

      // 初始化 WebContainer 并写入文件系统
      await container.writeFiles(fileSystem)
      setStatus(ServiceStatus.MOUNT_FS)
      emitEvent(EventName.MOUNTED)

      // 初始化编辑器
      await initMonaco()

      // 安装依赖
      await container.installDependencies()
      setStatus(ServiceStatus.INSTALLED_DEPENDENCY)
      emitEvent(EventName.INSTALLED)

      // 监听服务器启动完成事件
      instance.on('server-ready', (port, url) => {
        // 已存在服务，忽略后续启动的服务
        if (portRef.current) return
        portRef.current = port
        if (!previewRef.current) return
        toast('启动成功', {
          description: '仅当前页面内可预览，外部无法访问。',
        })
        previewRef.current.src = url
        setStatus(ServiceStatus.RUNNING)
      })

      instance.on('port', (port, type) => {
        if (type === 'close' && portRef.current === port) {
          portRef.current = undefined
          setStatus(ServiceStatus.INSTALLED_DEPENDENCY)
        }
      })

      // 监听文件变化
      instance.fs.watch('/', () => emitEvent(EventName.FILE_CHANGE))
    } catch (err) {
      toast(err instanceof Error ? err.message : '预览失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full h-[100vh] flex flex-col rounded-2xl border overflow-hidden">
      {status === ServiceStatus.INIT && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Button size="lg" onClick={handlePreview} disabled={isLoading}>
            {isLoading ? '加载中...' : '预览'}
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
              <ResizablePanelGroup direction="horizontal">
                {/* editor */}
                <ResizablePanel defaultSize={50}>
                  <div className="flex h-full items-center justify-center">
                    {!currentFile ? <Welcome /> : <Editor filePath={currentFile} />}
                  </div>
                </ResizablePanel>
                <ResizableHandle />
                {/* preview */}
                <ResizablePanel defaultSize={50}>
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
                    <TabsList className="h-6 text-xs">
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
