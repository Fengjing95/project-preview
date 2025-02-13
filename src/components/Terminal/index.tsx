import { useEffect, useRef } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { bindEvent, EventName, removeEvent } from '@/lib/evenemitter'
import { useThrottleFn } from 'ahooks'
import {
  activeTerminalAtom,
  removeTerminalAtom,
  TerminalModel,
  terminalsAtom,
} from '@/store/terminal'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BiTerminal, BiTrash } from 'react-icons/bi'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useTheme } from '../ThemeProvider'
import { XTERM_THEME } from '@/constants/xtermTheme'
import { cn } from '@/lib/utils'

interface IProps {
  instance: TerminalModel
}

export function Terminal({ instance }: IProps) {
  const terminalEleRef = useRef<HTMLDivElement>(null)
  const fitRef = useRef<FitAddon>()
  const terminalRef = useRef<XTerm>()
  const { theme } = useTheme()
  const { run: resize } = useThrottleFn(
    () => {
      fitRef.current?.fit()
    },
    {
      wait: 100,
    },
  )

  useEffect(() => {
    if (!terminalEleRef.current) return

    const terminal = new XTerm({
      theme: {
        ...XTERM_THEME[theme],
      },
    }) // 初始化terminal
    terminalRef.current = terminal

    const fitAddon = new FitAddon() // size 调整插件
    fitRef.current = fitAddon
    terminal.loadAddon(fitAddon)

    terminal.open(terminalEleRef.current) // 挂载元素
    // fitAddon.fit();

    // 输出事件
    const outputFunc = (id: unknown, data: unknown) => {
      if (id === instance.id) {
        terminal.write(data as string)
      }
    }

    // 输入事件
    const inputFunc = (data: unknown) => {
      instance.writer?.write(data as string)
    }

    terminal.onData(inputFunc)

    // 绑定事件
    // 接收webContainer的输出
    bindEvent(EventName.CONTAINER_OUTPUT, outputFunc)

    // 监听resize事件
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(terminalEleRef.current)

    return () => {
      terminal.dispose()
      removeEvent(EventName.CONTAINER_OUTPUT, outputFunc)
      if (terminalEleRef.current) resizeObserver.unobserve(terminalEleRef.current as HTMLDivElement)
    }
  }, [instance])

  useEffect(() => {
    if (!terminalRef.current) return

    terminalRef.current.options.theme = {
      ...XTERM_THEME[theme],
    }
  }, [theme])

  return <div className="w-full h-full" ref={terminalEleRef} />
}

Terminal.Multiple = function Multiple() {
  const [activeTerm, setActiveTerm] = useAtom(activeTerminalAtom)
  const instances = useAtomValue(terminalsAtom)
  const removeTerminal = useSetAtom(removeTerminalAtom)

  return (
    <Tabs
      value={activeTerm}
      onValueChange={setActiveTerm}
      className="h-full flex"
      orientation="vertical"
    >
      <div className="h-full flex-1 min-w-0">
        {instances.map((item) => (
          <TabsContent
            key={item.id}
            value={item.id}
            className="h-full m-0"
            forceMount
            hidden={item.id !== activeTerm}
          >
            <Terminal instance={item} />
          </TabsContent>
        ))}
      </div>

      {instances.length > 1 ? (
        <TabsList
          className={cn([
            'text-xs',
            'flex-col',
            'items-start',
            'justify-start',
            'h-full',
            'border-l-[1px]',
            'rounded-none',
            'overflow-y-auto',
            'w-36',
          ])}
        >
          {instances.map((item) => (
            <TabsTrigger
              key={item.id}
              value={item.id}
              className={cn(['w-full', 'text-center', 'justify-start', 'group', 'relative'])}
            >
              <div className="flex items-center justify-between w-full cursor-pointer">
                <div className="flex items-center">
                  <BiTerminal className="w-4 h-4 mr-2" /> {item.name}
                </div>
                <BiTrash
                  className="w-4 h-4 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    removeTerminal(item.id)
                  }}
                />
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
      ) : null}
    </Tabs>
  )
}
