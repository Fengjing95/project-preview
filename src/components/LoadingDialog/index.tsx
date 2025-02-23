import { useAtomValue } from 'jotai'
import { serviceStatusAtom } from '@/store/global'
import { ServiceStatus } from '@/constants/serviceStatus'
import { Dialog, DialogContent, DialogDescription, DialogHeader } from '@/components/ui/dialog'
import { Loader2, CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DialogTitle } from '@radix-ui/react-dialog'
import { useEffect, useState } from 'react'

const steps = [
  { status: ServiceStatus.INIT, label: '初始化' },
  { status: ServiceStatus.CREATE_INSTANCE, label: '创建容器实例' },
  { status: ServiceStatus.PULLED, label: '拉取文件' },
  { status: ServiceStatus.MOUNT_FS, label: '挂载文件系统' },
]

export function LoadingDialog() {
  const status = useAtomValue(serviceStatusAtom)
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    // 当状态达到MOUNT_FS时，添加延时关闭
    if (status === ServiceStatus.MOUNT_FS) {
      const timer = setTimeout(() => {
        setIsOpen(false)
      }, 1000) // 1秒延时
      return () => clearTimeout(timer)
    }
  }, [status])

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>应用准备中</DialogTitle>
          <DialogDescription>正在准备程序运行环境</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-6 py-8">
          <div className="w-full space-y-4">
            {steps.map((step) => {
              const isCompleted = step.status <= status
              const isCurrent = step.status === status + 1

              return (
                <div key={step.status} className="flex items-center gap-3">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : isCurrent ? (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span
                    className={cn(
                      'text-sm',
                      isCompleted && 'text-muted-foreground line-through',
                      isCurrent && 'text-blue-500 font-medium',
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
