import { ServiceStatus } from '@/constants/serviceStatus'
import { serviceStatusAtom } from '@/store/global'
import { TerminalModel, activeTerminalAtom, addTerminalAtom } from '@/store/terminal'
import { emitEvent, EventName } from '@/lib/evenemitter'
import { FileSystemTree, WebContainer, WebContainerProcess } from '@webcontainer/api'
import { getDefaultStore } from 'jotai'

type OutputCallback = (id: string, data: unknown) => void

export class WebContainerService {
  private static instance: WebContainerService
  private webContainerInstance: WebContainer | null = null
  private outputCallback: OutputCallback = console.log
  inputWriter: WritableStreamDefaultWriter | undefined
  process: WebContainerProcess | undefined

  // eslint-disable-next-line prettier/prettier
  private constructor() { }

  /**
   * 实例化containerService
   * @returns WebContainerService
   */
  static getInstance(): WebContainerService {
    if (!WebContainerService.instance) {
      WebContainerService.instance = new WebContainerService()
    }
    return WebContainerService.instance
  }

  async initialize() {
    if (!this.webContainerInstance) {
      this.webContainerInstance = await WebContainer.boot()
    }
    return this.webContainerInstance
  }

  /**
   * 写入文件系统
   * @param fileSystem 文件系统
   */
  async writeFiles(fileSystem: FileSystemTree) {
    if (!this.webContainerInstance) {
      throw new Error('WebContainer not initialized')
    }

    await this.webContainerInstance.mount(fileSystem)
    const store = getDefaultStore()
    store.set(serviceStatusAtom, ServiceStatus.MOUNT_FS)
    emitEvent(EventName.MOUNTED)
  }

  /**
   * 安装依赖
   */
  async installDependencies() {
    if (!this.webContainerInstance) {
      throw new Error('WebContainer not initialized')
    }
    const term = await this.newTerminal('npm', ['install'])
    let status = true
    // 安装依赖
    const code = await term.process?.exit
    if (code !== 0) {
      status = false
    }
    return { status, term }
  }

  /**
   * 获取webContainer实例
   * @returns WebContainer
   */
  getWebContainer() {
    return this.webContainerInstance
  }

  /**
   * 设置输出回调
   * @param callback 输出回调函数
   */
  setOutputCallback(callback: OutputCallback) {
    this.outputCallback = callback
  }

  /**
   * 新建终端
   * @returns 终端对象
   */
  async newTerminal(cmd: string = 'jsh', params: string[] = []) {
    if (!this.webContainerInstance) {
      throw new Error('WebContainer not initialized')
    }

    // 初始化终端
    const terminal = new TerminalModel(cmd)
    // 启动终端进程
    const process = await this.webContainerInstance.spawn(cmd, params)
    process.output.pipeTo(
      new WritableStream({
        write: (data) => {
          this.outputCallback(terminal.id, data)
        },
      }),
    )
    // 设置终端进程
    terminal.setProcess(process)

    // 保存终端实例
    const store = getDefaultStore()
    store.set(addTerminalAtom, terminal)
    store.set(activeTerminalAtom, terminal.id)

    return terminal
  }

  /**
   * 根据文件路径在文件系统中读取文件内容（UTF-8）
   * @param path 文件路径
   * @returns
   */
  async readFile(path: string) {
    if (!path || !this.webContainerInstance) return ''

    return await this.webContainerInstance.fs.readFile(path, 'utf-8')
  }
}
