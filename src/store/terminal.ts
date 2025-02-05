import { WebContainerProcess } from '@webcontainer/api'
import { atom } from 'jotai'
import { WritableStreamDefaultWriter } from 'stream/web'
import { nanoid } from 'nanoid'

// 终端实例类
export class TerminalModel {
  id: string // 实例id
  cmd: string // 实例命令
  name: string  // 实例名称
  process?: WebContainerProcess // 实例进程
  writer?: WritableStreamDefaultWriter // 实例输入流

  constructor(cmd: string) {
    this.id = nanoid()
    this.cmd = cmd
    this.name = cmd.split(' ')[0]
  }

  setProcess(process: WebContainerProcess) {
    this.process = process
    this.writer = process.input.getWriter()
  }
}

// 终端实例列表
export const terminalsAtom = atom<TerminalModel[]>([])

// 添加终端实例
export const addTerminalAtom = atom(null, (get, set, terminal: TerminalModel) => {
  const terminals = get(terminalsAtom)
  set(terminalsAtom, [...terminals, terminal])
})

// 当前激活的终端
export const activeTerminalAtom = atom('')

// 删除终端实例
export const removeTerminalAtom = atom(null, (get, set, id: string) => {
  const terminals = get(terminalsAtom)
  const activeTerm = get(activeTerminalAtom)

  // 新的终端数组
  const newTerminals = terminals.filter(t => t.id !== id)
  set(terminalsAtom, newTerminals)

  // 停止进程
  const deleteTerm = terminals.find(t => t.id === id)
  deleteTerm?.process?.kill()

  // 如果删除的是当前激活的终端，则激活最后一个终端
  if (id === activeTerm && newTerminals.length > 0) {
    set(activeTerminalAtom, newTerminals[newTerminals.length - 1].id)
  }
})
