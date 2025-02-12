import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { PropsWithChildren } from 'react'

interface IProps {
  message: string // 提示信息
}
export function MyTooltip(props: PropsWithChildren<IProps>) {
  const { children, message } = props
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{message}</TooltipContent>
    </Tooltip>
  )
}
