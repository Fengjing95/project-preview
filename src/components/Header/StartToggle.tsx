import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { useRef, useState } from 'react'
import { VscDebugStop, VscPlay, VscChevronDown } from 'react-icons/vsc'
import { WebContainerService } from '@/services/WebContainerService'
import { removeTerminalAtom, TerminalModel } from '@/store/terminal'
import { useAtom, useSetAtom } from 'jotai'
import { serviceStatusAtom } from '@/store/global'
import { ServiceStatus } from '@/constants/serviceStatus'
import { isEqualStatus } from '@/lib/serviceStatus'
import { MyTooltip } from '../MyTooltip'
import { cn } from '@/lib/utils'

export function StartToggle() {
  const [command, setCommand] = useState('npm run dev')
  const terminalRef = useRef<TerminalModel | null>(null)
  const removeTerminal = useSetAtom(removeTerminalAtom)
  const [serviceStatus, setServiceStatus] = useAtom(serviceStatusAtom)
  const isRunning = isEqualStatus(ServiceStatus.RUNNING, serviceStatus)

  // 开始运行
  const handleStart = async () => {
    const service = WebContainerService.getInstance()
    const terminal = await service.newTerminal()
    terminalRef.current = terminal
    await terminal.writer?.write(`${command}\r\n`)
    setServiceStatus(ServiceStatus.STARTING_SERVER)
  }

  // 停止运行
  const handleStop = () => {
    terminalRef.current?.process?.kill()
    removeTerminal(terminalRef.current?.id as string)
    terminalRef.current = null
  }

  // 禁用运行
  const disabledRun = !isEqualStatus(ServiceStatus.INSTALLED_DEPENDENCY, serviceStatus)

  return (
    <div className="flex items-center">
      <Popover>
        {isRunning ? (
          <Button
            onClick={handleStop}
            variant="destructive"
            size="sm"
            className="rounded-r-none border-r-0 shadow-none bg-destructive"
          >
            <VscDebugStop />
          </Button>
        ) : (
          <MyTooltip message={command}>
            <Button
              disabled={disabledRun}
              onClick={handleStart}
              variant="destructive"
              size="sm"
              className={cn(
                'rounded-r-none border-r-0',
                'shadow-none',
                'bg-emerald-500 hover:bg-emerald-500/90',
                'dark:bg-emerald-700 dark:hover:bg-emerald-700/90',
              )}
            >
              <VscPlay />
            </Button>
          </MyTooltip>
        )}
        <PopoverTrigger asChild>
          <Button
            disabled={isRunning}
            variant="destructive"
            size="sm"
            className={cn(
              'rounded-l-none p-1 shadow-none',
              !isRunning && [
                'bg-emerald-500 hover:bg-emerald-500/90',
                'dark:bg-emerald-700 dark:hover:bg-emerald-700/90',
              ],
            )}
          >
            <VscChevronDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2">
          <div className="space-y-2">
            <div className="text-sm font-medium">启动命令</div>
            <div className="flex gap-2">
              <Input
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="输入启动命令"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
