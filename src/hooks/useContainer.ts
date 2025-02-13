import { IPreviewRef } from '@/components/Preview'
import { ServiceStatus } from '@/constants/serviceStatus'
import { WebContainerService } from '@/services/WebContainerService'
import { serverInfoAtom, serviceStatusAtom } from '@/store/global'
import { baseInfoAtom } from '@/store/repo'
import { removeTerminalAtom } from '@/store/terminal'
import { parseLocalUrl } from '@/lib/dom'
import { emitEvent, EventName } from '@/lib/evenemitter'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { toast } from 'sonner'

interface IProps {
  portRef: React.MutableRefObject<number | undefined>
  previewRef: React.RefObject<IPreviewRef>
}

export function useContainer(props: IProps) {
  const { portRef, previewRef } = props
  const [serviceStatus, setServiceStatus] = useAtom(serviceStatusAtom)
  const setServerInfo = useSetAtom(serverInfoAtom)
  const { owner, repo, branch, repository } = useAtomValue(baseInfoAtom)
  const removeTerminal = useSetAtom(removeTerminalAtom)

  // 初始化 WebContainer 服务
  async function initContainer() {
    // 初始化 WebContainer 服务
    const instance = WebContainerService.getInstance()
    // 设置输出内容的显示方式
    instance.setOutputCallback((id, data) => {
      emitEvent(EventName.CONTAINER_OUTPUT, id, data)
    })
    const container = await instance.initialize()
    // 监听服务器启动完成事件
    container.on('server-ready', (port, url) => {
      // 记录实例信息
      setServerInfo(parseLocalUrl(url))
      // 已存在服务，忽略后续启动的服务
      if (portRef.current) return
      portRef.current = port
      if (!previewRef.current) return
      toast('启动成功', {
        description: '仅当前页面内可预览，外部无法访问。',
      })
      previewRef.current?.setUrl(url)
      // 启动server更新状态
      setServiceStatus(ServiceStatus.RUNNING)
    })

    container.on('port', (port, type) => {
      if (type === 'close' && portRef.current === port) {
        portRef.current = undefined
        // 服务关闭状态回退
        setServiceStatus(ServiceStatus.INSTALLED_DEPENDENCY)
      }
    })

    // 监听文件变化
    container.fs.watch('/', () => emitEvent(EventName.FILE_CHANGE))
    setServiceStatus(ServiceStatus.CREATE_INSTANCE)
  }

  // 下载文件并挂载
  async function mountFileSystem() {
    if (!owner || !repo || !repository) {
      throw new Error('仓库信息缺失，无法拉取代码')
    }
    const instance = WebContainerService.getInstance()
    // 获取仓库内容转为文件系统格式
    const { fileSystem } = await repository.fetchRepository(owner, repo, branch)
    setServiceStatus(ServiceStatus.PULLED)

    // 初始化 WebContainer 并写入文件系统
    await instance.writeFiles(fileSystem)
    setServiceStatus(ServiceStatus.MOUNT_FS)
  }

  // 安装依赖
  async function installDependency() {
    const instance = WebContainerService.getInstance()
    const { status, term } = await instance.installDependencies()

    if (status) {
      // 安装成功
      setServiceStatus(ServiceStatus.INSTALLED_DEPENDENCY)
      emitEvent(EventName.INSTALLED)
    } else {
      toast.error('依赖安装失败', {
        description: '依赖安装失败，请检查网络后点击重试或刷新页面重试',
        duration: 60000,
        action: {
          label: '重试',
          onClick: () => {
            instance.installDependencies()
            removeTerminal(term.id)
          },
        },
      })
    }
  }

  /**
   * 核心初始化流程
   */
  async function coreInit() {
    try {
      switch (serviceStatus) {
        case ServiceStatus.INIT:
          await initContainer()
          await mountFileSystem()
          await installDependency()
          break
        case ServiceStatus.CREATE_INSTANCE:
        case ServiceStatus.PULLED:
          await mountFileSystem()
          await installDependency()
          break
        case ServiceStatus.MOUNT_FS:
          await installDependency()
          break
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error('初始化失败', {
        description: error.message,
        duration: 60000,
        action: {
          label: '重试',
          onClick: coreInit,
        },
      })
    }
  }

  return {
    coreInit,
  }
}
