import { useRef } from 'react'

type IOptions = {
  time?: number
}

type IHandler = (...args: unknown[]) => unknown

// 同时监听点击和双击事件
export const useClickAndDouble = (options: IOptions = {}) => {
  const { time = 300 } = options
  const timer = useRef<NodeJS.Timeout | null>(null)

  const clickHandler = (click: IHandler) => {
    clearTimeout(timer.current as NodeJS.Timeout)
    timer.current = setTimeout(() => {
      click()
    }, time)
  }

  const doubleClickHandler = (doubleClick: IHandler) => {
    clearTimeout(timer.current as NodeJS.Timeout)
    doubleClick()
  }

  return {
    onClick: clickHandler,
    onDoubleClick: doubleClickHandler,
  }
}
