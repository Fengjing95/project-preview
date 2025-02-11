import { atom } from 'jotai'
import { ServiceStatus } from '@/constants/serviceStatus'
import { IServerInfo } from '@/typings/server'

// 左侧面板宽度
export const leftPanelAtom = atom(25)
// 左侧面板是否打开
export const leftPanelOpenAtom = atom(true)
// 生效的左侧面板宽度
export const resolveLeftPanelAtom = atom((get) => {
  const leftPanel = get(leftPanelAtom)
  const leftPanelOpen = get(leftPanelOpenAtom)
  if (leftPanelOpen) {
    return leftPanel
  } else {
    return 0
  }
})

// 右侧面板宽度
export const mainPanelAtom = atom((get) => {
  const resolveLeftPanel = get(resolveLeftPanelAtom)
  return 100 - resolveLeftPanel
})

// 底部面板高度
export const bottomPanelAtom = atom(25)
// 底部面板是否打开
export const bottomPanelOpenAtom = atom(true)
// 生效的底部面板高度
export const resolveBottomPanelAtom = atom((get) => {
  const bottomPanel = get(bottomPanelAtom)
  const bottomPanelOpen = get(bottomPanelOpenAtom)
  if (bottomPanelOpen) {
    return bottomPanel
  } else {
    return 0
  }
})

// 服务启动状态
export const serviceStatusAtom = atom<ServiceStatus>(ServiceStatus.INIT)

// webContainer info
export const serverInfoAtom = atom<IServerInfo>({})
