import { TerminalModel, activeTerminalAtom, addTerminalAtom } from '@/store/terminal';
import { FileSystemTree, WebContainer, WebContainerProcess } from '@webcontainer/api';
import { getDefaultStore } from 'jotai';

type OutputCallback = (id: string, data: unknown) => void;

export class WebContainerService {
  private static instance: WebContainerService;
  private webContainerInstance: WebContainer | null = null;
  private outputCallback: OutputCallback = console.log;
  inputWriter: WritableStreamDefaultWriter | undefined;
  process: WebContainerProcess | undefined;

  private constructor() { }

  /**
   * 实例化containerService
   * @returns WebContainerService
   */
  static getInstance(): WebContainerService {
    if (!WebContainerService.instance) {
      WebContainerService.instance = new WebContainerService();
    }
    return WebContainerService.instance;
  }

  async initialize() {
    if (!this.webContainerInstance) {
      this.webContainerInstance = await WebContainer.boot();
    }
    return this.webContainerInstance;
  }

  /**
   * 写入文件系统
   * @param fileSystem 文件系统
   */
  async writeFiles(fileSystem: FileSystemTree) {
    if (!this.webContainerInstance) {
      throw new Error('WebContainer not initialized');
    }

    await this.webContainerInstance.mount(fileSystem)
  }

  /**
   * 安装依赖
   */
  async installDependencies() {
    if (!this.webContainerInstance) {
      throw new Error('WebContainer not initialized');
    }
    const term = await this.newTerminal('npm', ['install'])

    // 安装依赖
    const code = await term.process?.exit;
    if (code !== 0) {
      this.outputCallback(term.id, '依赖安装失败，请手动安装或者刷新页面')
      throw new Error('Failed to install dependencies');
    }
    this.outputCallback(term.id, '依赖安装完成，当前终端已失效')
  }

  /**
   * 获取webContainer实例
   * @returns WebContainer
   */
  getWebContainer() {
    return this.webContainerInstance;
  }

  /**
   * 设置输出回调
   * @param callback 输出回调函数
   */
  setOutputCallback(callback: OutputCallback) {
    this.outputCallback = callback;
  }

  /**
   * 新建终端
   * @returns 终端对象
   */
  async newTerminal(cmd: string = 'jsh', params: string[] = []) {
    if (!this.webContainerInstance) {
      throw new Error('WebContainer not initialized');
    }

    // 初始化终端
    const terminal = new TerminalModel(cmd)
    // 启动终端进程
    const process = await this.webContainerInstance.spawn(cmd, params);
    process.output.pipeTo(new WritableStream({
      write: (data) => {
        this.outputCallback(terminal.id, data);
      },
    }));
    // 设置终端进程
    terminal.setProcess(process)

    // 保存终端实例
    const store = getDefaultStore()
    store.set(addTerminalAtom, terminal)
    store.set(activeTerminalAtom, terminal.id)

    return terminal;
  }
}