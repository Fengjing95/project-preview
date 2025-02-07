import EventEmitter from 'eventemitter3'

const eventEmitter = new EventEmitter()

export enum EventName {
  PULLED = 'pulled', // 文件拉取成功
  MOUNTED = 'mounted', // 文件挂载成功
  INSTALLED = 'installed', // 依赖安装成功
  FILE_CHANGE = 'file_change', // 文件变化
  CONTAINER_OUTPUT = 'container_output', // 容器输出内容
}

/**
 * 绑定事件
 * @param event 事件名称
 * @param callback 回调函数
 */
export function bindEvent(event: EventName, callback: (...args: unknown[]) => unknown) {
  eventEmitter.on(event, callback)
}

/**
 * 触发事件
 * @param event 事件名称
 * @param args 数据
 */
export const emitEvent = (event: EventName, ...args: unknown[]) => {
  eventEmitter.emit(event, ...args)
}

/**
 * 移除事件
 * @param event 事件名称
 * @param callback 回调函数，没有指定回调函数则移除事件所有的回调
 */
export const removeEvent = (event: EventName, callback?: (...args: unknown[]) => unknown) => {
  if (callback) {
    eventEmitter.removeListener(event, callback)
  } else {
    eventEmitter.removeAllListeners(event)
  }
}
