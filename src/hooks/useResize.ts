import { ResizablePrimitive } from '@/components/ui/resizable'
import {
  bottomPanelAtom,
  bottomPanelOpenAtom,
  leftPanelAtom,
  leftPanelOpenAtom,
  resolveBottomPanelAtom,
  resolveLeftPanelAtom,
} from '@/store/global'
import { useThrottleFn } from 'ahooks'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'

export function useResize() {
  const setLeftPanel = useSetAtom(leftPanelAtom) // 设置左侧面板的宽度
  const setLeftPanelOpen = useSetAtom(leftPanelOpenAtom) // 左侧面板是否打开
  const resolveLeftPanel = useAtomValue(resolveLeftPanelAtom) // 左侧面板的宽度
  const setBottomPanel = useSetAtom(bottomPanelAtom) // 设置底部面板的高度
  const setBottomPanelOpen = useSetAtom(bottomPanelOpenAtom) // 底部面板是否打开
  const resolveBottomPanel = useAtomValue(resolveBottomPanelAtom) // 底部面板的高度
  // 全局面板的布局
  const globalPanelGroupRef = useRef<ResizablePrimitive.ImperativePanelGroupHandle>(null)
  // 主面板的布局
  const mainPanelGroupRef = useRef<ResizablePrimitive.ImperativePanelGroupHandle>(null)

  // 左侧面板的拖拽事件
  const { run: leftPanelResize } = useThrottleFn(
    (size: number) => {
      if (!size) {
        // 宽度为0，设置不可见
        setLeftPanelOpen(false)
        return
      }

      if (size !== resolveLeftPanel) {
        // 拖拽触发的时候，更新左侧面板的宽度
        setLeftPanel(size)
        setLeftPanelOpen(true)
      }
    },
    {
      wait: 100,
    },
  )

  // 底部面板的拖拽事件
  const { run: bottomPanelResize } = useThrottleFn(
    (size: number) => {
      if (!size) {
        // 高度为0，设置不可见
        setBottomPanelOpen(false)
        return
      }

      if (size !== resolveBottomPanel) {
        // 拖拽触发的时候，更新底部面板的高度
        setBottomPanel(size)
        setBottomPanelOpen(true)
      }
    },
    {
      wait: 100,
    },
  )

  useEffect(() => {
    // 全局面板比例变化时更新主面板布局
    globalPanelGroupRef.current?.setLayout([resolveLeftPanel, 100 - resolveLeftPanel])
  }, [resolveLeftPanel])

  useEffect(() => {
    // 主面板比例变化时更新底部面板布局
    mainPanelGroupRef.current?.setLayout([100 - resolveBottomPanel, resolveBottomPanel])
  }, [resolveBottomPanel])

  return {
    leftPanelResize,
    globalPanelGroupRef,
    mainPanelGroupRef,
    bottomPanelResize,
  }
}
