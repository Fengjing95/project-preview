import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { useRef, useState } from 'react'
import { VscDebugStop, VscPlay } from 'react-icons/vsc'
import { WebContainerService } from '@/services/WebContainerService'
import { removeTerminalAtom, TerminalModel } from '@/store/terminal'
import { useAtom, useSetAtom } from 'jotai'
import { serviceStatusAtom } from '@/store/global'
import { ServiceStatus } from '@/constants/serviceStatus'
import { isEqualStatus } from '@/utils/serviceStatus'

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

  return (
    <div className="flex items-center">
      {!isRunning ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="secondary" size="sm">
              <VscPlay />
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
                <Button
                  onClick={handleStart}
                  disabled={!isEqualStatus(ServiceStatus.INSTALLED_DEPENDENCY, serviceStatus)}
                >
                  运行
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <Button variant="destructive" size="sm" onClick={handleStop} disabled={!isRunning}>
          <VscDebugStop />
        </Button>
      )}
    </div>
  )
}
